import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/services/auth.service';
import prisma from '@/lib/prisma';
import { paginatedResponse, errorResponse } from '@/types/api';
import { Role } from '@/types';

// GET /api/v1/admin/users - Get all users (Admin only)
export async function GET(request: NextRequest) {
  try {
    const sessionData = await AuthService.getSession();

    if (!sessionData?.user) {
      return NextResponse.json(
        errorResponse('UNAUTHORIZED', 'Not authenticated'),
        { status: 401 }
      );
    }

    // Only admins can list all users
    if (sessionData.user.role !== Role.ADMIN) {
      return NextResponse.json(
        errorResponse('FORBIDDEN', 'You do not have permission to view users'),
        { status: 403 }
      );
    }

    // Pagination
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Filters
    const role = searchParams.get('role') as Role | null;
    const search = searchParams.get('search');

    // Build where clause
    const where: any = {};
    if (role) {
      where.role = role;
    }
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get users
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json(paginatedResponse(users, page, limit, total));
  } catch (error: any) {
    console.error('Get users error:', error);
    return NextResponse.json(
      errorResponse('INTERNAL_ERROR', error.message || 'Internal server error'),
      { status: 500 }
    );
  }
}

