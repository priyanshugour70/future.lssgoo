import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentSession } from '@/lib/session';
import { CreatePeopleSchema } from '@/types/people';
import type { APIResponse, PaginatedResponse } from '@/types';

// GET /api/v1/people - List all people (PUBLIC)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const companyId = searchParams.get('companyId');
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { passion: { contains: search, mode: 'insensitive' } },
        { bio: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (companyId) {
      where.companyId = companyId;
    }

    const [people, total] = await Promise.all([
      prisma.people.findMany({
        where,
        include: {
          company: {
            select: {
              id: true,
              name: true,
            },
          },
          contact: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.people.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    const response: PaginatedResponse<typeof people[0]> = {
      success: true,
      data: people,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error fetching people:', error);
    const response: APIResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch people',
      },
      timestamp: new Date().toISOString(),
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// POST /api/v1/people - Create a new person (ADMIN ONLY)
export async function POST(req: NextRequest) {
  try {
    const sessionData = await getCurrentSession();

    // Check authentication
    if (!sessionData?.user) {
      const response: APIResponse = {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json(response, { status: 401 });
    }

    // Check admin role
    if (sessionData.user.role !== 'ADMIN') {
      const response: APIResponse = {
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Admin access required',
        },
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json(response, { status: 403 });
    }

    const body = await req.json();
    const validation = CreatePeopleSchema.safeParse(body);

    if (!validation.success) {
      const response: APIResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: validation.error.issues as any,
        },
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json(response, { status: 400 });
    }

    const { contact, ...personData } = validation.data;

    // Handle empty strings for optional fields
    const cleanedData: any = {
      ...personData,
      passion: personData.passion || null,
      bio: personData.bio || null,
      profileUrl: personData.profileUrl || null,
      photoUrl: personData.photoUrl || null,
      companyId: personData.companyId || null,
      notes: personData.notes || [],
    };

    // Create person with contact
    const person = await prisma.people.create({
      data: {
        ...cleanedData,
        contact: contact
          ? {
              create: {
                linkedin: contact.linkedin || null,
                instagram: contact.instagram || null,
                twitter: contact.twitter || null,
                email: contact.email || null,
                phoneNumber: contact.phoneNumber || null,
              },
            }
          : undefined,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        contact: true,
      },
    });

    const response: APIResponse<typeof person> = {
      success: true,
      data: person,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    console.error('Error creating person:', error);
    const response: APIResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message || 'Failed to create person',
      },
      timestamp: new Date().toISOString(),
    };
    return NextResponse.json(response, { status: 500 });
  }
}

