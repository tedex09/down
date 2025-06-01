import { NextRequest, NextResponse } from 'next/server';
import { IPTVServer } from '@/types';
import { Storage } from '@/lib/storage';
import { generateId, checkServerStatus } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    // Get all servers from storage
    const servers = Storage.getServers();
    
    // Handle query parameters for filtering
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    // If id is provided, return specific server
    if (id) {
      const server = Storage.getServer(id);
      if (!server) {
        return NextResponse.json(
          { success: false, error: 'Server not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: server });
    }
    
    return NextResponse.json({ success: true, data: servers });
  } catch (error) {
    console.error('Error in GET /api/iptv/server:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { name, url, username, password } = body;
    if (!name || !url || !username || !password) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Create new server object
    const newServer: IPTVServer = {
      id: generateId(),
      name,
      url,
      username,
      password,
      active: true,
      lastChecked: new Date().toISOString(),
      status: 'unknown'
    };
    
    // Test server connection
    try {
      const isOnline = await checkServerStatus(newServer);
      newServer.status = isOnline ? 'online' : 'offline';
    } catch (error) {
      newServer.status = 'offline';
    }
    
    // Save to storage
    Storage.addServer(newServer);
    
    return NextResponse.json(
      { success: true, data: newServer, message: 'Server added successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/iptv/server:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { id, name, url, username, password } = body;
    if (!id || !name || !url || !username || !password) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check if server exists
    const existingServer = Storage.getServer(id);
    if (!existingServer) {
      return NextResponse.json(
        { success: false, error: 'Server not found' },
        { status: 404 }
      );
    }
    
    // Update server
    const updatedServer: IPTVServer = {
      ...existingServer,
      name,
      url,
      username,
      password,
      lastChecked: new Date().toISOString()
    };
    
    // Test connection
    try {
      const isOnline = await checkServerStatus(updatedServer);
      updatedServer.status = isOnline ? 'online' : 'offline';
    } catch (error) {
      updatedServer.status = 'offline';
    }
    
    // Save to storage
    Storage.updateServer(updatedServer);
    
    return NextResponse.json({
      success: true,
      data: updatedServer,
      message: 'Server updated successfully'
    });
  } catch (error) {
    console.error('Error in PUT /api/iptv/server:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Server ID is required' },
        { status: 400 }
      );
    }
    
    // Check if server exists
    const existingServer = Storage.getServer(id);
    if (!existingServer) {
      return NextResponse.json(
        { success: false, error: 'Server not found' },
        { status: 404 }
      );
    }
    
    // Delete server
    Storage.deleteServer(id);
    
    return NextResponse.json({
      success: true,
      message: 'Server deleted successfully'
    });
  } catch (error) {
    console.error('Error in DELETE /api/iptv/server:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}