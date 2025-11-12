import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { AuthService } from '@/services/auth.service';
import { APIResponse } from '@/types';

// Validation schema
const UpdateAcceleratorSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().min(1, 'Description is required').optional(),
  whyItStandsOut: z.string().min(1, 'Why it stands out is required').optional(),
  averageFunding: z.string().optional(),
  fundedCompanies: z.number().int().positive().optional(),
  foundedYear: z.number().int().min(1900).max(new Date().getFullYear()).optional(),
  country: z.string().optional(),
  type: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  logoUrl: z.string().url().optional().or(z.literal('')),
});

// GET /api/v1/accelerators/:id - Get single accelerator (PUBLIC)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const accelerator = await prisma.accelerator.findUnique({
      where: { id },
    });

    if (!accelerator) {
      const response: APIResponse = {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Accelerator not found',
        },
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: APIResponse = {
      success: true,
      data: accelerator,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Get accelerator error:', error);
    
    const response: APIResponse = {
      success: false,
      error: {
        code: 'GET_FAILED',
        message: error.message || 'Failed to get accelerator',
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, { status: 500 });
  }
}

// PATCH /api/v1/accelerators/:id - Update accelerator (ADMIN ONLY)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check authentication and admin role
    const sessionData = await AuthService.getSession();
    
    if (!sessionData?.user) {
      const response: APIResponse = {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'You must be logged in',
        },
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json(response, { status: 401 });
    }

    if (sessionData.user.role !== 'ADMIN') {
      const response: APIResponse = {
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Only admins can update accelerators',
        },
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json(response, { status: 403 });
    }

    // Check if accelerator exists
    const existing = await prisma.accelerator.findUnique({
      where: { id },
    });

    if (!existing) {
      const response: APIResponse = {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Accelerator not found',
        },
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json(response, { status: 404 });
    }

    const body = await request.json();
    const validation = UpdateAcceleratorSchema.safeParse(body);

    if (!validation.success) {
      const response: APIResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          details: validation.error.issues as any,
        },
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json(response, { status: 400 });
    }

    const updateData: any = { ...validation.data };
    
    // Handle empty strings for optional URL fields
    if (validation.data.website === '') updateData.website = null;
    if (validation.data.logoUrl === '') updateData.logoUrl = null;

    const accelerator = await prisma.accelerator.update({
      where: { id },
      data: updateData,
    });

    const response: APIResponse = {
      success: true,
      data: accelerator,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Update accelerator error:', error);
    
    const response: APIResponse = {
      success: false,
      error: {
        code: 'UPDATE_FAILED',
        message: error.message || 'Failed to update accelerator',
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, { status: 500 });
  }
}

// DELETE /api/v1/accelerators/:id - Delete accelerator (ADMIN ONLY)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check authentication and admin role
    const sessionData = await AuthService.getSession();
    
    if (!sessionData?.user) {
      const response: APIResponse = {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'You must be logged in',
        },
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json(response, { status: 401 });
    }

    if (sessionData.user.role !== 'ADMIN') {
      const response: APIResponse = {
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Only admins can delete accelerators',
        },
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json(response, { status: 403 });
    }

    // Check if accelerator exists
    const existing = await prisma.accelerator.findUnique({
      where: { id },
    });

    if (!existing) {
      const response: APIResponse = {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Accelerator not found',
        },
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json(response, { status: 404 });
    }

    await prisma.accelerator.delete({
      where: { id },
    });

    const response: APIResponse = {
      success: true,
      data: { message: 'Accelerator deleted successfully' },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Delete accelerator error:', error);
    
    const response: APIResponse = {
      success: false,
      error: {
        code: 'DELETE_FAILED',
        message: error.message || 'Failed to delete accelerator',
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, { status: 500 });
  }
}

