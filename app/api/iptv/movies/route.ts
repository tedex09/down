import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { createXtreamClient } from '@/lib/utils';
import { searchMovies, filterMoviesByDate, sortMovies } from '@/utils/search';
import { z } from 'zod';

// Input validation schema
const querySchema = z.object({
  serverId: z.string().min(1, 'Server ID is required'),
  query: z.string().optional(),
  categoryId: z.string().optional(),
  fromDate: z.string().datetime().optional(),
  sortBy: z.enum(['name', 'added', 'rating']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  movieId: z.string().optional()
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = {
      serverId: searchParams.get('serverId'),
      query: searchParams.get('query') || undefined,
      categoryId: searchParams.get('categoryId') || undefined,
      fromDate: searchParams.get('fromDate') || undefined,
      sortBy: searchParams.get('sortBy') as 'name' | 'added' | 'rating' | undefined,
      sortOrder: searchParams.get('sortOrder') as 'asc' | 'desc' | undefined,
      movieId: searchParams.get('movieId') || undefined
    };
    
    // Validate query parameters
    try {
      querySchema.parse(params);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { success: false, error: error.errors[0].message },
          { status: 400 }
        );
      }
    }
    
    // Get server from database
    const server = await Database.getServer(params.serverId!);
    if (!server) {
      return NextResponse.json(
        { success: false, error: 'Server not found' },
        { status: 404 }
      );
    }
    
    // Create client
    const client = createXtreamClient({
      id: server._id!.toString(),
      name: server.name,
      url: server.url,
      username: server.username,
      password: server.password,
      active: server.active,
      status: server.status,
      lastChecked: server.lastChecked?.toISOString()
    });
    
    // If movieId is provided, return specific movie details
    if (params.movieId) {
      const movieInfo = await client.getMovieInfo(Number(params.movieId));
      return NextResponse.json({
        success: true,
        data: movieInfo
      });
    }
    
    // Fetch movies
    let movies = await client.getMovies(params.categoryId);
    
    // Apply filters
    if (params.query) {
      movies = searchMovies(movies, params.query);
    }
    
    if (params.fromDate) {
      movies = filterMoviesByDate(movies, params.fromDate);
    }
    
    // Sort results
    if (params.sortBy) {
      movies = sortMovies(movies, params.sortBy, params.sortOrder || 'asc');
    }
    
    // Log successful fetch
    await Database.createLog({
      action: 'fetch_movies',
      status: 'success',
      message: `Successfully fetched ${movies.length} movies from server ${server.name}`,
      serverId: server._id?.toString()
    });
    
    return NextResponse.json({
      success: true,
      data: movies,
      total: movies.length
    });
  } catch (error) {
    console.error('Error in GET /api/iptv/movies:', error);
    
    // Log error
    if (error instanceof Error) {
      await Database.createLog({
        action: 'fetch_movies',
        status: 'error',
        message: error.message
      });
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch movies'
      },
      { status: 500 }
    );
  }
}