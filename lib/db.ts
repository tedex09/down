import { Db, ObjectId } from 'mongodb';
import clientPromise from './mongodb';
import { DbServer, DbLog, DbExport } from '@/types/mongodb';
import { ServerSchema } from './models/ServerModel';

export class Database {
  private static async getDb(): Promise<Db> {
    const client = await clientPromise;
    return client.db();
  }

  // Server Methods
  static async getServers(): Promise<DbServer[]> {
    try {
      const db = await this.getDb();
      return await db.collection<DbServer>('servers').find().toArray();
    } catch (error) {
      console.error('Error in getServers:', error);
      throw new Error('Failed to fetch servers from database');
    }
  }

  static async getServer(id: string): Promise<DbServer | null> {
    try {
      if (!ObjectId.isValid(id)) {
        throw new Error('Invalid server ID');
      }
      
      const db = await this.getDb();
      return await db.collection<DbServer>('servers').findOne({ 
        _id: new ObjectId(id) 
      });
    } catch (error) {
      console.error('Error in getServer:', error);
      throw new Error('Failed to fetch server from database');
    }
  }

  static async createServer(server: Omit<DbServer, '_id' | 'createdAt' | 'updatedAt'>): Promise<DbServer> {
    try {
      // Validate server data
      ServerSchema.parse(server);
      
      const db = await this.getDb();
      const now = new Date();
      
      const result = await db.collection<DbServer>('servers').insertOne({
        ...server,
        createdAt: now,
        updatedAt: now
      } as DbServer);

      const createdServer = await this.getServer(result.insertedId.toString());
      if (!createdServer) {
        throw new Error('Failed to fetch created server');
      }

      return createdServer;
    } catch (error) {
      console.error('Error in createServer:', error);
      throw error;
    }
  }

  static async updateServer(id: string, update: Partial<DbServer>): Promise<DbServer | null> {
    try {
      if (!ObjectId.isValid(id)) {
        throw new Error('Invalid server ID');
      }

      // Validate update data
      ServerSchema.partial().parse(update);
      
      const db = await this.getDb();
      const result = await db.collection<DbServer>('servers').findOneAndUpdate(
        { _id: new ObjectId(id) },
        { 
          $set: {
            ...update,
            updatedAt: new Date()
          }
        },
        { returnDocument: 'after' }
      );

      return result;
    } catch (error) {
      console.error('Error in updateServer:', error);
      throw error;
    }
  }

  static async deleteServer(id: string): Promise<boolean> {
    try {
      if (!ObjectId.isValid(id)) {
        throw new Error('Invalid server ID');
      }

      const db = await this.getDb();
      const result = await db.collection<DbServer>('servers').deleteOne({ 
        _id: new ObjectId(id) 
      });

      return result.deletedCount === 1;
    } catch (error) {
      console.error('Error in deleteServer:', error);
      throw error;
    }
  }

  // Logging Methods
  static async createLog(log: Omit<DbLog, '_id' | 'createdAt'>): Promise<DbLog> {
    try {
      const db = await this.getDb();
      const result = await db.collection<DbLog>('logs').insertOne({
        ...log,
        createdAt: new Date()
      } as DbLog);

      const createdLog = await db.collection<DbLog>('logs').findOne({ 
        _id: result.insertedId 
      });

      if (!createdLog) {
        throw new Error('Failed to fetch created log');
      }

      return createdLog;
    } catch (error) {
      console.error('Error in createLog:', error);
      throw error;
    }
  }

  // Export Methods
  static async createExport(exportData: Omit<DbExport, '_id' | 'createdAt'>): Promise<DbExport> {
    try {
      const db = await this.getDb();
      const result = await db.collection<DbExport>('exports').insertOne({
        ...exportData,
        createdAt: new Date()
      } as DbExport);

      const createdExport = await db.collection<DbExport>('exports').findOne({ 
        _id: result.insertedId 
      });

      if (!createdExport) {
        throw new Error('Failed to fetch created export');
      }

      return createdExport;
    } catch (error) {
      console.error('Error in createExport:', error);
      throw error;
    }
  }
}