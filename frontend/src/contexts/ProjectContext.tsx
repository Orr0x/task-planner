import { createContext, useContext, ReactNode, useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { projectsApi } from '../services/api';
import type { Project, CreateProjectInput, UpdateProjectInput } from '../types';

interface ProjectContextType {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: Error | null;
  createProject: (project: CreateProjectInput) => Promise<void>;
  updateProject: (id: string, project: UpdateProjectInput) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  setCurrentProject: (project: Project | null) => void;
}

const ProjectContext = createContext<ProjectContextType | null>(null);

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

interface ProjectProviderProps {
  children: ReactNode;
}

export const ProjectProvider = ({ children }: ProjectProviderProps) => {
  const queryClient = useQueryClient();
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  // Fetch projects with error handling
  const { data: projects = [], isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      try {
        const response = await projectsApi.getProjects();
        console.log('Fetched projects:', response.data);
        return response.data;
      } catch (error: any) {
        console.error('Error fetching projects:', error);
        // Only show error notification if it's not a 401 (unauthorized)
        if (error.response?.status !== 401) {
          notifications.show({
            title: 'Error',
            message: error.response?.data?.error || 'Failed to fetch projects',
            color: 'red',
          });
        }
        throw error;
      }
    },
    retry: false, // Don't retry failed requests
  });

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: async (project: CreateProjectInput) => {
      console.log('Creating project:', project);
      return projectsApi.createProject(project);
    },
    onSuccess: (response) => {
      console.log('Project created:', response.data);
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      if (!currentProject) {
        setCurrentProject(response.data);
      }
      notifications.show({
        title: 'Success',
        message: 'Project created successfully',
        color: 'green',
      });
    },
    onError: (error: any) => {
      console.error('Error creating project:', error);
      notifications.show({
        title: 'Error',
        message: error.response?.data?.error || 'Failed to create project',
        color: 'red',
      });
      throw error;
    },
  });

  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, project }: { id: string; project: UpdateProjectInput }) => {
      console.log('Updating project:', id, project);
      return projectsApi.updateProject(id, project);
    },
    onSuccess: (response) => {
      console.log('Project updated:', response.data);
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      notifications.show({
        title: 'Success',
        message: 'Project updated successfully',
        color: 'green',
      });
    },
    onError: (error: any) => {
      console.error('Error updating project:', error);
      notifications.show({
        title: 'Error',
        message: error.response?.data?.error || 'Failed to update project',
        color: 'red',
      });
      throw error;
    },
  });

  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting project:', id);
      return projectsApi.deleteProject(id);
    },
    onSuccess: (_, deletedProjectId) => {
      console.log('Project deleted:', deletedProjectId);
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      if (currentProject?._id === deletedProjectId) {
        setCurrentProject(null);
      }
      notifications.show({
        title: 'Success',
        message: 'Project deleted successfully',
        color: 'green',
      });
    },
    onError: (error: any) => {
      console.error('Error deleting project:', error);
      notifications.show({
        title: 'Error',
        message: error.response?.data?.error || 'Failed to delete project',
        color: 'red',
      });
      throw error;
    },
  });

  const createProject = useCallback(async (project: CreateProjectInput) => {
    console.log('Creating project (context):', project);
    await createProjectMutation.mutateAsync(project);
  }, [createProjectMutation]);

  const updateProject = useCallback(async (id: string, project: UpdateProjectInput) => {
    console.log('Updating project (context):', id, project);
    await updateProjectMutation.mutateAsync({ id, project });
  }, [updateProjectMutation]);

  const deleteProject = useCallback(async (id: string) => {
    console.log('Deleting project (context):', id);
    await deleteProjectMutation.mutateAsync(id);
  }, [deleteProjectMutation]);

  // Set initial current project if none selected
  if (!currentProject && projects.length > 0) {
    console.log('Setting initial project:', projects[0]);
    setCurrentProject(projects[0]);
  }

  const value = {
    projects,
    currentProject,
    isLoading,
    error,
    createProject,
    updateProject,
    deleteProject,
    setCurrentProject,
  };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
};