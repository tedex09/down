import { NextRequest, NextResponse } from 'next/server';
import { Storage } from '@/lib/storage';
import { createXtreamClient, generateAria2Commands } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const { serverId, movieIds } = await request.json();
    
    if (!serverId || !movieIds || !Array.isArray(movieIds) || movieIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid request parameters' },
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
    
    // Get movie information for each ID
    const movies = await Promise.all(
      movieIds.map(async (id) => {
        try {
          return await client.getMovieInfo(Number(id));
        } catch (error) {
          console.error(`Error fetching movie with ID ${id}:`, error);
          return null;
        }
      })
    );
    
    // Filter out null values (failed requests)
    const validMovies = movies.filter(movie => movie !== null);
    
    // Generate export data
    const exportData = generateAria2Commands(server, validMovies);
    
    // Generate aria2c commands
    const commands = validMovies.map(movie => {
      return client.generateAria2Command(movie);
    });
    
    return NextResponse.json({
      success: true,
      data: {
        commands,
        exportData
      }
    });
  } catch (error) {
    console.error('Error in POST /api/iptv/export:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate export data' },
      { status: 500 }
    );
  }
}