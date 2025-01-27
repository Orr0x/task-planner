export interface User {
  id: string;
  email: string;
  fullName: string;
}

export interface Project {
  _id: string;
  name: string;
  description: string;
  createdBy: User;
  members: User[];
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'todo' | 'inProgress' | 'done';
  startDate: string;
  endDate: string;
  assignedTo: User;
  createdBy: User;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
}

export interface TaskResponse {
  success: boolean;
  data: Task;
}

export interface TasksResponse {
  success: boolean;
  data: Task[];
}

export interface ProjectResponse {
  success: boolean;
  data: Project;
}

export interface ProjectsResponse {
  success: boolean;
  data: Project[];
}

export interface BulkActionResponse {
  success: boolean;
  data: {
    modifiedCount: number;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  fullName: string;
}

export interface CreateProjectInput {
  name: string;
  description: string;
  members: string[]; // User IDs
}

export interface UpdateProjectInput extends Partial<CreateProjectInput> {}

export interface CreateTaskInput {
  title: string;
  description: string;
  status: Task['status'];
  startDate: string;
  endDate: string;
  assignedTo: string;
  projectId: string;
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {}

export interface BulkUpdateTasksInput {
  ids: string[];
  update: UpdateTaskInput;
}

export interface BulkDeleteTasksInput {
  ids: string[];
}

export interface ApiError {
  success: false;
  error: string;
}