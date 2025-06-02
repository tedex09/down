import { Database } from './db';
import { DbServer } from '@/types/mongodb';

/**
 * Storage utility class for persistence
 * Now uses MongoDB as the primary storage with local storage as fallback
 */
export class Storage {
  private static SERVERS_KEY = "iptv-dashboard-servers";

  /**
   * Get all servers from storage
   */
  static async getServers(): Promise<DbServer[]> {
    try {
      return await Database.getServers();
    } catch (error) {
      console.error("Error reading servers from database:", error);
      return [];
    }
  }

  /**
   * Get a single server by ID
   */
  static async getServer(id: string): Promise<DbServer | undefined> {
    try {
      const server = await Database.getServer(id);
      return server || undefined;
    } catch (error) {
      console.error("Error reading server from database:", error);
      return undefined;
    }
  }

  /**
   * Add a new server
   */
  static async addServer(server: Omit<DbServer, '_id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    try {
      await Database.createServer(server);
    } catch (error) {
      console.error("Error saving server to database:", error);
    }
  }

  /**
   * Update an existing server
   */
  static async updateServer(server: Partial<DbServer> & { _id: string }): Promise<void> {
    try {
      await Database.updateServer(server._id.toString(), server);
    } catch (error) {
      console.error("Error updating server in database:", error);
    }
  }

  /**
   * Delete a server
   */
  static async deleteServer(id: string): Promise<void> {
    try {
      await Database.deleteServer(id);
    } catch (error) {
      console.error("Error deleting server from database:", error);
    }
  }
}