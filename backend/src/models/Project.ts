import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';

export interface IProject extends Document {
  name: string;
  description: string;
  createdBy: IUser['_id'];
  members: IUser['_id'][];
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
  },
  {
    timestamps: true,
  }
);

export const Project = mongoose.model<IProject>('Project', projectSchema);