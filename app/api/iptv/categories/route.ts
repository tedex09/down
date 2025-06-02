import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { createXtreamClient } from '@/lib/utils';
import { z } from 'zod';

// Input validation schema
const querySchema = z.object({
  serverId: z.string().min(1, 'Server ID is required')
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const serverId = searchParams.get('serverId');
    
    // Validate query parameters
    try {
      querySchema.parse({ serverId });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { success: false, error: error.errors[0].message },
          { status: 400 }
        );
      }
    }
    
    // Get server from database
    const server = await Database.getServer(serverId!);
    if (!server) {
      return NextResponse.json(
        { success: false, error: 'Server not found' },
        { status: 404 }
      );
    }
    
    // Create client and fetch categories
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
    
    const categories = await client.getCategories();
    
    // Log successful fetch
    await Database.createLog({
      action: 'fetch_categories',
      status: 'success',
      message: `Successfully fetched ${categories.length} categories from server ${server.name}`,
      serverId: server._id?.toString()
    });
    
    return NextResponse.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error in GET /api/iptv/categories:', error);
    
    // Log error
    if (error instanceof Error) {
      await Database.createLog({
        action: 'fetch_categories',
        status: 'error',
        message: error.message
      });
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch categories'
      },
      { status: 500 }
    );
  }
}