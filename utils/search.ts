import Fuse from 'fuse.js';
import { Movie } from '@/types';

// Configure Fuse.js options for movie search
const fuseOptions = {
  keys: [
    { name: 'name', weight: 0.7 },
    { name: 'title', weight: 0.7 },
    { name: 'plot', weight: 0.3 },
    { name: 'genre', weight: 0.2 },
    { name: 'director', weight: 0.2 },
    { name: 'actors', weight: 0.2 }
  ],
  threshold: 0.4, // Lower threshold = stricter matching
  includeScore: true
};

/**
 * Perform fuzzy search on movies
 */
export function searchMovies(movies: Movie[], query: string): Movie[] {
  if (!query.trim()) {
    return movies;
  }

  const fuse = new Fuse(movies, fuseOptions);
  const results = fuse.search(query);
  
  // Return the matched movies sorted by score (best matches first)
  return results.map(result => result.item);
}

/**
 * Filter movies by date range
 */
export function filterMoviesByDate(movies: Movie[], fromDate?: string): Movie[] {
  if (!fromDate) {
    return movies;
  }
  
  const fromTimestamp = new Date(fromDate).getTime();
  
  return movies.filter(movie => {
    if (!movie.added) return false;
    const movieDate = new Date(movie.added).getTime();
    return movieDate >= fromTimestamp;
  });
}

/**
 * Filter movies by category
 */
export function filterMoviesByCategory(movies: Movie[], categoryId?: string): Movie[] {
  if (!categoryId) {
    return movies;
  }
  
  return movies.filter(movie => movie.category_id === categoryId);
}

/**
 * Sort movies by specified field
 */
export function sortMovies(
  movies: Movie[], 
  sortBy: 'name' | 'added' | 'rating' = 'name', 
  sortOrder: 'asc' | 'desc' = 'asc'
): Movie[] {
  const sorted = [...movies].sort((a, b) => {
    const multiplier = sortOrder === 'asc' ? 1 : -1;
    
    switch (sortBy) {
      case 'name':
        return multiplier * a.name.localeCompare(b.name);
      case 'added':
        const dateA = new Date(a.added || '').getTime() || 0;
        const dateB = new Date(b.added || '').getTime() || 0;
        return multiplier * (dateA - dateB);
      case 'rating':
        const ratingA = parseFloat(a.rating || '0');
        const ratingB = parseFloat(b.rating || '0');
        return multiplier * (ratingA - ratingB);
      default:
        return 0;
    }
  });
  
  return sorted;
}