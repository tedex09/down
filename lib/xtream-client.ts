import { IPTVServer, Movie, Category, SearchParams, ServerStats } from '@/types';

export class XtreamClient {
  private server: IPTVServer;

  constructor(server: IPTVServer) {
    this.server = server;
  }

  // Build API URL with authentication
  private getApiUrl(action: string, params: Record<string, string> = {}): string {
    const baseUrl = `${this.server.url}/player_api.php`;
    const authParams = `username=${this.server.username}&password=${this.server.password}`;
    const actionParam = `action=${action}`;
    
    const queryParams = Object.entries(params)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    
    return `${baseUrl}?${authParams}&${actionParam}${queryParams ? `&${queryParams}` : ''}`;
  }

  // Get server information
  async getServerInfo(): Promise<any> {
    try {
      const url = this.getApiUrl('get_server_info');
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting server info:', error);
      throw error;
    }
  }

  // Get all VOD categories
  async getCategories(): Promise<Category[]> {
    try {
      const url = this.getApiUrl('get_vod_categories');
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting categories:', error);
      throw error;
    }
  }

  // Get movies (all or by category)
  async getMovies(categoryId?: string): Promise<Movie[]> {
    try {
      const params: Record<string, string> = {};
      if (categoryId) {
        params.category_id = categoryId;
      }
      
      const url = this.getApiUrl('get_vod_streams', params);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting movies:', error);
      throw error;
    }
  }

  // Get detailed information about a specific movie
  async getMovieInfo(movieId: number): Promise<any> {
    try {
      const url = this.getApiUrl('get_vod_info', { stream_id: movieId.toString() });
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting movie info:', error);
      throw error;
    }
  }

  // Search movies with parameters
  async searchMovies(params: SearchParams): Promise<Movie[]> {
    try {
      let movies: Movie[] = await this.getMovies(params.categoryId);
      
      // Filter by date if specified
      if (params.fromDate) {
        const fromTimestamp = new Date(params.fromDate).getTime();
        movies = movies.filter(movie => {
          const movieDate = new Date(movie.added).getTime();
          return movieDate >= fromTimestamp;
        });
      }
      
      // Sort the results
      if (params.sortBy) {
        movies.sort((a, b) => {
          const sortOrder = params.sortOrder === 'desc' ? -1 : 1;
          
          if (params.sortBy === 'name') {
            return sortOrder * a.name.localeCompare(b.name);
          } else if (params.sortBy === 'added') {
            return sortOrder * (new Date(a.added).getTime() - new Date(b.added).getTime());
          } else if (params.sortBy === 'rating' && a.rating && b.rating) {
            return sortOrder * (parseFloat(a.rating) - parseFloat(b.rating));
          }
          
          return 0;
        });
      }
      
      return movies;
    } catch (error) {
      console.error('Error searching movies:', error);
      throw error;
    }
  }

  // Generate movie download URL
  getMovieDownloadUrl(movie: Movie): string {
    return `${this.server.url}/movie/${this.server.username}/${this.server.password}/${movie.stream_id}.${movie.container_extension}`;
  }

  // Generate aria2c command for downloading
  generateAria2Command(movie: Movie): string {
    const downloadUrl = this.getMovieDownloadUrl(movie);
    const outputFile = `${movie.name}.${movie.container_extension}`;
    return `aria2c --continue --max-connection-per-server=4 --split=4 --show-console-readout=true --user-agent="XCIPTV" -o "${outputFile}" "${downloadUrl}"`;
  }

  // Get server statistics
  async getServerStats(): Promise<ServerStats> {
    try {
      const [categories, movies] = await Promise.all([
        this.getCategories(),
        this.getMovies()
      ]);
      
      return {
        categoriesCount: categories.length,
        moviesCount: movies.length,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting server stats:', error);
      throw error;
    }
  }
}