// Server Types
export interface IPTVServer {
  id: string;
  name: string;
  url: string;
  username: string;
  password: string;
  active: boolean;
  lastChecked?: string;
  status?: 'online' | 'offline' | 'unknown';
}

// Category Types
export interface Category {
  category_id: string;
  category_name: string;
  parent_id: number;
}

// Movie Types
export interface Movie {
  stream_id: number;
  name: string;
  title?: string;
  stream_icon?: string;
  added: string; // Date string
  category_id: string;
  container_extension: string;
  custom_sid?: string;
  direct_source?: string;
  plot?: string;
  rating?: string;
  releaseDate?: string;
  year?: string;
  duration?: string;
  director?: string;
  actors?: string;
  genre?: string;
  cover?: string;
  backdrop?: string;
}

// Search Params
export interface SearchParams {
  query?: string;
  categoryId?: string;
  fromDate?: string;
  serverId?: string;
  sortBy?: 'name' | 'added' | 'rating';
  sortOrder?: 'asc' | 'desc';
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Export Types
export interface ExportData {
  movieName: string;
  extension: string;
  downloadUrl: string;
}

// Stats Types
export interface ServerStats {
  moviesCount: number;
  categoriesCount: number;
  lastUpdated: string;
}