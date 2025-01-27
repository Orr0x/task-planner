import { Request, Response } from 'express';
import { Project } from '../models/Project';
import { Task } from '../models/Task';

// Get all projects for current user
export const getProjects = async (req: Request, res: Response) => {
  try {
    console.log('Getting projects for user:', req.user?._id);
    const projects = await Project.find({
      $or: [
        { createdBy: req.user?._id },
        { members: req.user?._id }
      ]
    }).populate('createdBy members', 'fullName email');

    console.log('Found projects:', projects.length);
    res.json({
      success: true,
      data: projects,
    });
  } catch (error: any) {
    console.error('Error fetching projects:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch projects',
    });
  }
};

// Get single project
export const getProject = async (req: Request, res: Response) => {
  try {
    console.log('Getting project:', req.params.id, 'for user:', req.user?._id);
    const project = await Project.findOne({
      _id: req.params.id,
      $or: [
        { createdBy: req.user?._id },
        { members: req.user?._id }
      ]
    }).populate('createdBy members', 'fullName email');

    if (!project) {
      console.log('Project not found or unauthorized');
      return res.status(404).json({
        success: false,
        error: 'Project not found',
      });
    }

    res.json({
      success: true,
      data: project,
    });
  } catch (error: any) {
    console.error('Error fetching project:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch project',
    });
  }
};

// Create new project
export const createProject = async (req: Request, res: Response) => {
  try {
    console.log('Creating project with data:', {
      ...req.body,
      createdBy: req.user?._id,
    });

    if (!req.user?._id) {
      console.error('No user ID found in request');
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }

    const { name, description, members } = req.body;

    // Validate required fields
    if (!name?.trim() || !description?.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Name and description are required',
      });
    }

    // Create project with current user as creator and member
    const project = await Project.create({
      name: name.trim(),
      description: description.trim(),
      createdBy: req.user._id,
      members: [...new Set([...(members || []), req.user._id])],
    });

    // Populate creator and member details
    await project.populate('createdBy members', 'fullName email');

    console.log('Project created successfully:', project._id);
    res.status(201).json({
      success: true,
      data: project,
    });
  } catch (error: any) {
    console.error('Error creating project:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create project',
    });
  }
};

// Update project
export const updateProject = async (req: Request, res: Response) => {
  try {
    console.log('Updating project:', req.params.id, 'with data:', req.body);
    const project = await Project.findOne({
      _id: req.params.id,
      createdBy: req.user?._id,
    });

    if (!project) {
      console.log('Project not found or unauthorized');
      return res.status(404).json({
        success: false,
        error: 'Project not found or unauthorized',
      });
    }

    const { name, description, members } = req.body;

    // Validate fields if provided
    if (name && !name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Project name cannot be empty',
      });
    }

    if (description && !description.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Project description cannot be empty',
      });
    }

    // Ensure creator remains in members list
    const updatedMembers = members ? 
      [...new Set([...members, req.user?._id.toString()])] : 
      project.members;

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      {
        name: name?.trim() || project.name,
        description: description?.trim() || project.description,
        members: updatedMembers,
      },
      { new: true }
    ).populate('createdBy members', 'fullName email');

    console.log('Project updated successfully:', updatedProject?._id);
    res.json({
      success: true,
      data: updatedProject,
    });
  } catch (error: any) {
    console.error('Error updating project:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update project',
    });
  }
};

// Delete project
export const deleteProject = async (req: Request, res: Response) => {
  try {
    console.log('Deleting project:', req.params.id);
    const project = await Project.findOne({
      _id: req.params.id,
      createdBy: req.user?._id,
    });

    if (!project) {
      console.log('Project not found or unauthorized');
      return res.status(404).json({
        success: false,
        error: 'Project not found or unauthorized',
      });
    }

    // Delete all tasks associated with the project
    const deletedTasks = await Task.deleteMany({ projectId: project._id });
    console.log('Deleted associated tasks:', deletedTasks.deletedCount);

    // Delete the project
    await project.deleteOne();
    console.log('Project deleted successfully');

    res.json({
      success: true,
      data: { message: 'Project deleted successfully' },
    });
  } catch (error: any) {
    console.error('Error deleting project:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete project',
    });
  }
};

// Get project tasks
export const getProjectTasks = async (req: Request, res: Response) => {
  try {
    console.log('Getting tasks for project:', req.params.id);
    const project = await Project.findOne({
      _id: req.params.id,
      $or: [
        { createdBy: req.user?._id },
        { members: req.user?._id }
      ]
    });

    if (!project) {
      console.log('Project not found or unauthorized');
      return res.status(404).json({
        success: false,
        error: 'Project not found or unauthorized',
      });
    }

    const tasks = await Task.find({ projectId: project._id })
      .populate('assignedTo', 'fullName email')
      .populate('createdBy', 'fullName email');

    console.log('Found tasks:', tasks.length);
    res.json({
      success: true,
      data: tasks,
    });
  } catch (error: any) {
    console.error('Error fetching project tasks:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch project tasks',
    });
  }
};