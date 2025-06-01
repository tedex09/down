import { NextRequest, NextResponse } from 'next/server';
import { Storage } from '@/lib/storage';
import { createXtreamClient } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const serverId = searchParams.get('serverId');
    
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
    
    // Create client and fetch categories
    const client = createXtreamClient(server);
    const categories = await client.getCategories();
    
    return NextResponse.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error in GET /api/iptv/categories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}