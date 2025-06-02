import { ObjectId } from 'mongodb';

export interface DbServer {
  _id?: ObjectId;
  name: string;
  url: string;
  username: string;
  password: string;
  active: boolean;
  lastChecked?: Date;
  status?: 'online' | 'offline' | 'unknown';
  createdAt: Date;
  updatedAt: Date;
}

export interface DbLog {
  _id?: ObjectId;
  action: string;
  status: 'success' | 'error';
  message: string;
  serverId?: ObjectId;
  createdAt: Date;
}

export interface DbExport {
  _id?: ObjectId;
  title: string;
  links: string[];
  serverId: ObjectId;
  createdAt: Date;
}