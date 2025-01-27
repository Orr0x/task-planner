import { createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { tasksApi, projectsApi } from '../services/api';
import { useProject } from './ProjectContext';
import type { Task, CreateTaskInput, UpdateTaskInput } from '../types';

interface TaskContextType {
  tasks: Task[];
  isLoading: boolean;
  error: Error | null;
  createTask: (task: Omit<CreateTaskInput, 'projectId'>) => Promise<void>;
  updateTask: (id: string, task: UpdateTaskInput) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  bulkDeleteTasks: (ids: string[]) => Promise<void>;
  bulkUpdateTasks: (ids: string[], update: UpdateTaskInput) => Promise<void>;
}

const TaskContext = createContext<TaskContextType | null>(null);

export const useTask = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};

interface TaskProviderProps {
  children: ReactNode;
}

export const TaskProvider = ({ children }: TaskProviderProps) => {
  const queryClient = useQueryClient();
  const { currentProject } = useProject();

  // Fetch tasks for current project
  const { data: tasksResponse, isLoading, error } = useQuery({
    queryKey: ['tasks', currentProject?._id],
    queryFn: async () => {
      if (!currentProject) return { data: [] };
      const response = await projectsApi.getProjectTasks(currentProject._id);
      return response;
    },
    enabled: !!currentProject,
  });

  // Extract tasks array from response
  const tasks = tasksResponse?.data ?? [];

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: (task: Omit<CreateTaskInput, 'projectId'>) => {
      if (!currentProject) throw new Error('No project selected');
      return tasksApi.createTask({
        ...task,
        projectId: currentProject._id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', currentProject?._id] });
      notifications.show({
        title: 'Success',
        message: 'Task created successfully',
        color: 'green',
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.error || 'Failed to create task',
        color: 'red',
      });
    },
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: ({ id, task }: { id: string; task: UpdateTaskInput }) =>
      tasksApi.updateTask(id, task),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', currentProject?._id] });
      notifications.show({
        title: 'Success',
        message: 'Task updated successfully',
        color: 'green',
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.error || 'Failed to update task',
        color: 'red',
      });
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: tasksApi.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', currentProject?._id] });
      notifications.show({
        title: 'Success',
        message: 'Task deleted successfully',
        color: 'green',
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.error || 'Failed to delete task',
        color: 'red',
      });
    },
  });

  // Bulk delete tasks mutation
  const bulkDeleteTasksMutation = useMutation({
    mutationFn: (ids: string[]) => tasksApi.bulkDeleteTasks({ ids }),
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', currentProject?._id] });
      notifications.show({
        title: 'Success',
        message: `${ids.length} tasks deleted successfully`,
        color: 'green',
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.error || 'Failed to delete tasks',
        color: 'red',
      });
    },
  });

  // Bulk update tasks mutation
  const bulkUpdateTasksMutation = useMutation({
    mutationFn: ({ ids, update }: { ids: string[]; update: UpdateTaskInput }) =>
      tasksApi.bulkUpdateTasks({ ids, update }),
    onSuccess: (_, { ids }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', currentProject?._id] });
      notifications.show({
        title: 'Success',
        message: `${ids.length} tasks updated successfully`,
        color: 'green',
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.error || 'Failed to update tasks',
        color: 'red',
      });
    },
  });

  const createTask = async (task: Omit<CreateTaskInput, 'projectId'>) => {
    await createTaskMutation.mutateAsync(task);
  };

  const updateTask = async (id: string, task: UpdateTaskInput) => {
    await updateTaskMutation.mutateAsync({ id, task });
  };

  const deleteTask = async (id: string) => {
    await deleteTaskMutation.mutateAsync(id);
  };

  const bulkDeleteTasks = async (ids: string[]) => {
    await bulkDeleteTasksMutation.mutateAsync(ids);
  };

  const bulkUpdateTasks = async (ids: string[], update: UpdateTaskInput) => {
    await bulkUpdateTasksMutation.mutateAsync({ ids, update });
  };

  const value = {
    tasks,
    isLoading,
    error,
    createTask,
    updateTask,
    deleteTask,
    bulkDeleteTasks,
    bulkUpdateTasks,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};