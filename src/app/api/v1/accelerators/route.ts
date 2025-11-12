import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { AuthService } from '@/services/auth.service';
import { APIResponse } from '@/types';

// Validation schema
const CreateAcceleratorSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  whyItStandsOut: z.string().min(1, 'Why it stands out is required'),
  averageFunding: z.string().optional(),
  fundedCompanies: z.number().int().positive().optional(),
  foundedYear: z.number().int().min(1900).max(new Date().getFullYear()).optional(),
  country: z.string().optional(),
  type: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  logoUrl: z.string().url().optional().or(z.literal('')),
});

// GET /api/v1/accelerators - List all accelerators (PUBLIC)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const country = searchParams.get('country') || '';
    const type = searchParams.get('type') || '';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (country) {
      where.country = { contains: country, mode: 'insensitive' };
    }
    
    if (type) {
      where.type = { contains: type, mode: 'insensitive' };
    }

    const [accelerators, total] = await Promise.all([
      prisma.accelerator.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.accelerator.count({ where }),
    ]);

    const response: APIResponse = {
      success: true,
      data: {
        accelerators,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('List accelerators error:', error);
    
    const response: APIResponse = {
      success: false,
      error: {
        code: 'LIST_FAILED',
        message: error.message || 'Failed to list accelerators',
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, { status: 500 });
  }
}

// POST /api/v1/accelerators - Create accelerator (ADMIN ONLY)
export async function POST(request: NextRequest) {
  try {
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
          message: 'Only admins can create accelerators',
        },
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json(response, { status: 403 });
    }

    const body = await request.json();
    const validation = CreateAcceleratorSchema.safeParse(body);

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

    const accelerator = await prisma.accelerator.create({
      data: {
        ...validation.data,
        website: validation.data.website || null,
        logoUrl: validation.data.logoUrl || null,
      },
    });

    const response: APIResponse = {
      success: true,
      data: accelerator,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    console.error('Create accelerator error:', error);
    
    const response: APIResponse = {
      success: false,
      error: {
        code: 'CREATE_FAILED',
        message: error.message || 'Failed to create accelerator',
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, { status: 500 });
  }
}

