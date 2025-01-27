import { Document } from 'mongoose';
import { IUser } from '../models/User';

declare global {
  namespace Express {
    interface Request {
      user?: Document<unknown, any, IUser> & IUser & {
        _id: string;
      };
    }
  }
}

export {};