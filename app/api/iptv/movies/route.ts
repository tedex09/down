import { NextRequest, NextResponse } from 'next/server';
import { Storage } from '@/lib/storage';
import { createXtreamClient } from '@/lib/utils';
import { searchMovies, filterMoviesByDate, filterMoviesByCategory, sortMovies } from '@/utils/search';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const serverId = searchParams.get('serverId');
    const query = searchParams.get('query') || '';
    const categoryId = searchParams.get('categoryId') || undefined;
    const fromDate = searchParams.get('fromDate') || undefined;
    const sortBy = (searchParams.get('sortBy') as 'name' | 'added' | 'rating') || 'name';
    const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'asc';
    const movieId = searchParams.get('movieId');
    
    if (!serverId) {
      return NextResponse.json(
        { success: false, error: 'Server ID is required' },
        { status: 400 }
      );
    }
    
    // Get server from storage
    const server = Storage.getServer(serverId);
    if (!server) {
      return NextResponse.json(
        { success: false, error: 'Server not found' },
        { status: 404 }
      );
    }
    
    // Create client
    const client = createXtreamClient(server);
    
    // If movieId is provided, return specific movie details
    if (movieId) {
      const movieInfo = await client.getMovieInfo(Number(movieId));
      return NextResponse.json({
        success: true,
        data: movieInfo
      });
    }
    
    // Fetch all movies or by category
    let movies = await client.getMovies(categoryId);
    
    // Apply filters
    if (query) {
      movies = searchMovies(movies, query);
    }
    
    if (fromDate) {
      movies = filterMoviesByDate(movies, fromDate);
    }
    
    // Sort results
    movies = sortMovies(movies, sortBy, sortOrder);
    
    return NextResponse.json({
      success: true,
      data: movies,
      total: movies.length
    });
  } catch (error) {
    console.error('Error in GET /api/iptv/movies:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch movies' },
      { status: 500 }
    );
  }
}