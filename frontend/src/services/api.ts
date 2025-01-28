import axios from 'axios';
import type {
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  TaskResponse,
  TasksResponse,
  CreateTaskInput,
  UpdateTaskInput,
  BulkActionResponse,
  BulkUpdateTasksInput,
  BulkDeleteTasksInput,
  ProjectResponse,
  ProjectsResponse,
  CreateProjectInput,
  UpdateProjectInput,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor for API calls
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Ensure headers object exists
      config.headers = config.headers || {};
      // Set auth header with Bearer token
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Clear token and user data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: async (credentials: RegisterCredentials) => {
    const response = await api.post<AuthResponse>('/auth/register', credentials);
    if (response.data.success && response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  login: async (credentials: LoginCredentials) => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    if (response.data.success && response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get<AuthResponse>('/auth/me');
    if (response.data.success) {
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

// Projects API
export const projectsApi = {
  getProjects: async () => {
    const response = await api.get<ProjectsResponse>('/projects');
    return response.data;
  },

  getProject: async (id: string) => {
    const response = await api.get<ProjectResponse>(`/projects/${id}`);
    return response.data;
  },

  createProject: async (project: CreateProjectInput) => {
    const response = await api.post<ProjectResponse>('/projects', project);
    return response.data;
  },

  updateProject: async (id: string, project: UpdateProjectInput) => {
    const response = await api.patch<ProjectResponse>(`/projects/${id}`, project);
    return response.data;
  },

  deleteProject: async (id: string) => {
    const response = await api.delete<{ success: boolean }>(`/projects/${id}`);
    return response.data;
  },

  // Project tasks
  getProjectTasks: async (projectId: string) => {
    const response = await api.get<TasksResponse>(`/projects/${projectId}/tasks`);
    return response.data;
  },
};

// Tasks API
export const tasksApi = {
  getTasks: async () => {
    const response = await api.get<TasksResponse>('/tasks');
    return response.data;
  },

  getTask: async (id: string) => {
    const response = await api.get<TaskResponse>(`/tasks/${id}`);
    return response.data;
  },

  createTask: async (task: CreateTaskInput) => {
    const response = await api.post<TaskResponse>('/tasks', task);
    return response.data;
  },

  updateTask: async (id: string, task: UpdateTaskInput) => {
    const response = await api.patch<TaskResponse>(`/tasks/${id}`, task);
    return response.data;
  },

  deleteTask: async (id: string) => {
    const response = await api.delete<{ success: boolean }>(`/tasks/${id}`);
    return response.data;
  },

  // Bulk operations
  bulkUpdateTasks: async ({ ids, update }: BulkUpdateTasksInput) => {
    const response = await api.patch<BulkActionResponse>('/tasks/bulk', { ids, update });
    return response.data;
  },

  bulkDeleteTasks: async ({ ids }: BulkDeleteTasksInput) => {
    const response = await api.delete<BulkActionResponse>('/tasks/bulk', { data: { ids } });
    return response.data;
  },
};

export default api;