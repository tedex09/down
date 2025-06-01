import { IPTVServer } from "@/types";

// Local storage keys
const SERVERS_KEY = "iptv-dashboard-servers";

/**
 * Storage utility class for local persistence
 */
export class Storage {
  /**
   * Get all servers from storage
   */
  static getServers(): IPTVServer[] {
    if (typeof window === "undefined") {
      return [];
    }
    
    try {
      const serversJson = localStorage.getItem(SERVERS_KEY);
      return serversJson ? JSON.parse(serversJson) : [];
    } catch (error) {
      console.error("Error reading servers from localStorage:", error);
      return [];
    }
  }

  /**
   * Save servers to storage
   */
  static saveServers(servers: IPTVServer[]): void {
    if (typeof window === "undefined") {
      return;
    }
    
    try {
      localStorage.setItem(SERVERS_KEY, JSON.stringify(servers));
    } catch (error) {
      console.error("Error saving servers to localStorage:", error);
    }
  }

  /**
   * Add a new server
   */
  static addServer(server: IPTVServer): void {
    const servers = this.getServers();
    servers.push(server);
    this.saveServers(servers);
  }

  /**
   * Update an existing server
   */
  static updateServer(server: IPTVServer): void {
    const servers = this.getServers();
    const index = servers.findIndex((s) => s.id === server.id);
    
    if (index !== -1) {
      servers[index] = server;
      this.saveServers(servers);
    }
  }

  /**
   * Delete a server
   */
  static deleteServer(id: string): void {
    const servers = this.getServers();
    const filteredServers = servers.filter((server) => server.id !== id);
    this.saveServers(filteredServers);
  }

  /**
   * Get a single server by ID
   */
  static getServer(id: string): IPTVServer | undefined {
    const servers = this.getServers();
    return servers.find((server) => server.id === id);
  }
}