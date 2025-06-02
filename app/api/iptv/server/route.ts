import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { ServerSchema } from '@/lib/models/ServerModel';
import { checkServerStatus } from '@/lib/utils';
import { z } from 'zod';

// Input validation schemas
const serverIdSchema = z.object({
  id: z.string().min(1, 'Server ID is required')
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (id) {
      try {
        serverIdSchema.parse({ id });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return NextResponse.json(
            { success: false, error: error.errors[0].message },
            { status: 400 }
          );
        }
      }

      const server = await Database.getServer(id);
      if (!server) {
        return NextResponse.json(
          { success: false, error: 'Server not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: server });
    }
    
    const servers = await Database.getServers();
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
    
    // Validate request body
    try {
      const validatedData = ServerSchema.parse({
        ...body,
        active: true,
        status: 'unknown',
        lastChecked: new Date()
      });
      
      // Test connection
      try {
        const isOnline = await checkServerStatus(validatedData);
        validatedData.status = isOnline ? 'online' : 'offline';
      } catch (error) {
        validatedData.status = 'offline';
      }
      
      // Save to database
      const server = await Database.createServer(validatedData);
      
      // Log the action
      await Database.createLog({
        action: 'create_server',
        status: 'success',
        message: `Server ${server.name} created successfully`,
        serverId: server._id?.toString()
      });
      
      return NextResponse.json(
        { success: true, data: server, message: 'Server added successfully' },
        { status: 201 }
      );
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { success: false, error: error.errors[0].message },
          { status: 400 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Error in POST /api/iptv/server:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to add server'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;
    
    try {
      serverIdSchema.parse({ id });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { success: false, error: error.errors[0].message },
          { status: 400 }
        );
      }
    }
    
    // Validate update data
    try {
      const validatedData = ServerSchema.partial().parse({
        ...updateData,
        lastChecked: new Date()
      });
      
      const updatedServer = await Database.updateServer(id, validatedData);
      if (!updatedServer) {
        return NextResponse.json(
          { success: false, error: 'Server not found' },
          { status: 404 }
        );
      }
      
      // Log the action
      await Database.createLog({
        action: 'update_server',
        status: 'success',
        message: `Server ${updatedServer.name} updated successfully`,
        serverId: updatedServer._id?.toString()
      });
      
      return NextResponse.json({
        success: true,
        data: updatedServer,
        message: 'Server updated successfully'
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { success: false, error: error.errors[0].message },
          { status: 400 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Error in PUT /api/iptv/server:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update server'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    try {
      serverIdSchema.parse({ id });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { success: false, error: error.errors[0].message },
          { status: 400 }
        );
      }
    }
    
    const server = await Database.getServer(id!);
    if (!server) {
      return NextResponse.json(
        { success: false, error: 'Server not found' },
        { status: 404 }
      );
    }
    
    await Database.deleteServer(id!);
    
    // Log the action
    await Database.createLog({
      action: 'delete_server',
      status: 'success',
      message: `Server ${server.name} deleted successfully`,
      serverId: server._id?.toString()
    });
    
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