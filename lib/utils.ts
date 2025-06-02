import { IPTVServer, Movie, ExportData } from "@/types";
import { XtreamClient } from "./xtream-client";
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
/**
 * Creates a new XtreamClient instance for a server
 */
export function createXtreamClient(server: IPTVServer): XtreamClient {
  return new XtreamClient(server);
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

/**
 * Check if a server is online
 */
export async function checkServerStatus(server: IPTVServer): Promise<boolean> {
  try {
    const client = createXtreamClient(server);
    await client.getServerInfo();
    return true;
  } catch (error) {
    console.error(`Server ${server.name} is offline:`, error);
    return false;
  }
}

/**
 * Format date to human-readable format
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return 'Invalid date';
  }
}

/**
 * Generate aria2c commands for selected movies
 */
export function generateAria2Commands(server: IPTVServer, movies: Movie[]): ExportData[] {
  const client = createXtreamClient(server);
  
  return movies.map(movie => {
    const downloadUrl = client.getMovieDownloadUrl(movie);
    return {
      movieName: movie.name,
      extension: movie.container_extension,
      downloadUrl
    };
  });
}

/**
 * Create a blob for downloading commands
 */
export function createCommandsBlob(server: IPTVServer, movies: Movie[]): Blob {
  const client = createXtreamClient(server);
  
  const commands = movies.map(movie => {
    return client.generateAria2Command(movie);
  }).join('\n');
  
  return new Blob([commands], { type: 'text/plain' });
}

/**
 * Format file size from bytes to human-readable format
 */
export function formatFileSize(bytes?: number): string {
  if (!bytes) return 'Unknown size';
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}