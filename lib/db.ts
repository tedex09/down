import { Db, ObjectId } from 'mongodb';
import clientPromise from './mongodb';
import { DbServer, DbLog, DbExport } from '@/types/mongodb';

export class Database {
  private static async getDb(): Promise<Db> {
    const client = await clientPromise;
    return client.db();
  }

  // Server Methods
  static async getServers(): Promise<DbServer[]> {
    const db = await this.getDb();
    return db.collection<DbServer>('servers').find().toArray();
  }

  static async getServer(id: string): Promise<DbServer | null> {
    const db = await this.getDb();
    return db.collection<DbServer>('servers').findOne({ _id: new ObjectId(id) });
  }

  static async createServer(server: Omit<DbServer, '_id' | 'createdAt' | 'updatedAt'>): Promise<DbServer> {
    const db = await this.getDb();
    const now = new Date();
    
    const result = await db.collection<DbServer>('servers').insertOne({
      ...server,
      createdAt: now,
      updatedAt: now
    } as DbServer);

    return this.getServer(result.insertedId.toString()) as Promise<DbServer>;
  }

  static async updateServer(id: string, update: Partial<DbServer>): Promise<DbServer | null> {
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
  }

  static async deleteServer(id: string): Promise<boolean> {
    const db = await this.getDb();
    const result = await db.collection<DbServer>('servers').deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount === 1;
  }

  // Logging Methods
  static async createLog(log: Omit<DbLog, '_id' | 'createdAt'>): Promise<DbLog> {
    const db = await this.getDb();
    const result = await db.collection<DbLog>('logs').insertOne({
      ...log,
      createdAt: new Date()
    } as DbLog);

    return db.collection<DbLog>('logs').findOne({ _id: result.insertedId }) as Promise<DbLog>;
  }

  // Export Methods
  static async createExport(exportData: Omit<DbExport, '_id' | 'createdAt'>): Promise<DbExport> {
    const db = await this.getDb();
    const result = await db.collection<DbExport>('exports').insertOne({
      ...exportData,
      createdAt: new Date()
    } as DbExport);

    return db.collection<DbExport>('exports').findOne({ _id: result.insertedId }) as Promise<DbExport>;
  }
}