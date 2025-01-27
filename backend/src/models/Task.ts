import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';
import { IProject } from './Project';

export interface ITask extends Document {
  title: string;
  description: string;
  status: 'todo' | 'inProgress' | 'done';
  startDate: Date;
  endDate: Date;
  assignedTo: IUser['_id'];
  createdBy: IUser['_id'];
  projectId: IProject['_id'];
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['todo', 'inProgress', 'done'],
      default: 'todo',
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add index for faster project-based queries
taskSchema.index({ projectId: 1 });

// Add compound index for project and status queries
taskSchema.index({ projectId: 1, status: 1 });

// Add compound index for project and date range queries
taskSchema.index({ projectId: 1, startDate: 1, endDate: 1 });

export const Task = mongoose.model<ITask>('Task', taskSchema);