import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { createXtreamClient, generateAria2Commands } from '@/lib/utils';
import { z } from 'zod';

// Input validation schema
const bodySchema = z.object({
  serverId: z.string().min(1, 'Server ID is required'),
  movieIds: z.array(z.number()).min(1, 'At least one movie ID is required')
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    try {
      bodySchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { success: false, error: error.errors[0].message },
          { status: 400 }
        );
      }
    }
    
    const { serverId, movieIds } = body;
    
    // Get server from database
    const server = await Database.getServer(serverId);
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
    
    // Get movie information for each ID
    const movies = await Promise.all(
      movieIds.map(async (id) => {
        try {
          return await client.getMovieInfo(id);
        } catch (error) {
          console.error(`Error fetching movie with ID ${id}:`, error);
          return null;
        }
      })
    );
    
    // Filter out null values (failed requests)
    const validMovies = movies.filter(movie => movie !== null);
    
    // Generate export data
    const exportData = generateAria2Commands(
      {
        id: server._id!.toString(),
        name: server.name,
        url: server.url,
        username: server.username,
        password: server.password,
        active: server.active,
        status: server.status,
        lastChecked: server.lastChecked?.toISOString()
      }, 
      validMovies
    );
    
    // Generate aria2c commands
    const commands = validMovies.map(movie => {
      return client.generateAria2Command(movie);
    });
    
    // Log successful export
    await Database.createLog({
      action: 'export_movies',
      status: 'success',
      message: `Successfully generated export data for ${validMovies.length} movies from server ${server.name}`,
      serverId: server._id?.toString()
    });
    
    // Create export record
    await Database.createExport({
      title: `Export from ${server.name}`,
      links: commands,
      serverId: server._id!
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
    
    // Log error
    if (error instanceof Error) {
      await Database.createLog({
        action: 'export_movies',
        status: 'error',
        message: error.message
      });
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to generate export data'
      },
      { status: 500 }
    );
  }
}