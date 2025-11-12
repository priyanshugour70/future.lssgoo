import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/services/auth.service';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/types/api';
import { Role } from '@/types';

// GET /api/v1/users/:id - Get user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sessionData = await AuthService.getSession();

    if (!sessionData?.user) {
      return NextResponse.json(
        errorResponse('UNAUTHORIZED', 'Not authenticated'),
        { status: 401 }
      );
    }

    // Only admins or the user themselves can view user details
    if (sessionData.user.id !== id && sessionData.user.role !== Role.ADMIN) {
      return NextResponse.json(
        errorResponse('FORBIDDEN', 'You do not have permission to view this user'),
        { status: 403 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json(
        errorResponse('NOT_FOUND', 'User not found'),
        { status: 404 }
      );
    }

    return NextResponse.json(successResponse(user));
  } catch (error: any) {
    console.error('Get user error:', error);
    return NextResponse.json(
      errorResponse('INTERNAL_ERROR', error.message || 'Internal server error'),
      { status: 500 }
    );
  }
}

// DELETE /api/v1/users/:id - Delete user (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sessionData = await AuthService.getSession();

    if (!sessionData?.user) {
      return NextResponse.json(
        errorResponse('UNAUTHORIZED', 'Not authenticated'),
        { status: 401 }
      );
    }

    // Only admins can delete users
    if (sessionData.user.role !== Role.ADMIN) {
      return NextResponse.json(
        errorResponse('FORBIDDEN', 'You do not have permission to delete users'),
        { status: 403 }
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json(successResponse(null, 'User deleted successfully'));
  } catch (error: any) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      errorResponse('INTERNAL_ERROR', error.message || 'Internal server error'),
      { status: 500 }
    );
  }
}

