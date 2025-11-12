import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentSession } from '@/lib/session';
import type { APIResponse, PaginatedResponse } from '@/types';

// GET /api/v1/emails - Get email history (ADMIN ONLY)
export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [emails, total] = await Promise.all([
      prisma.email.findMany({
        where,
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.email.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    const response: PaginatedResponse<typeof emails[0]> = {
      success: true,
      data: emails,
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
    console.error('Error fetching emails:', error);
    const response: APIResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch emails',
      },
      timestamp: new Date().toISOString(),
    };
    return NextResponse.json(response, { status: 500 });
  }
}

