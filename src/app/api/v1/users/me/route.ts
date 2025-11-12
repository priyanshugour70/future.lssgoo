import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/services/auth.service';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/types/api';
import { UpdateUserSchema } from '@/types';

// GET /api/v1/users/me - Get current user
export async function GET() {
  try {
    const sessionData = await AuthService.getSession();

    if (!sessionData?.user) {
      return NextResponse.json(
        errorResponse('UNAUTHORIZED', 'Not authenticated'),
        { status: 401 }
      );
    }

    return NextResponse.json(successResponse(sessionData.user));
  } catch (error: any) {
    console.error('Get current user error:', error);
    return NextResponse.json(
      errorResponse('INTERNAL_ERROR', error.message || 'Internal server error'),
      { status: 500 }
    );
  }
}

// PATCH /api/v1/users/me - Update current user
export async function PATCH(request: NextRequest) {
  try {
    const sessionData = await AuthService.getSession();

    if (!sessionData?.user) {
      return NextResponse.json(
        errorResponse('UNAUTHORIZED', 'Not authenticated'),
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate input
    const validation = UpdateUserSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        errorResponse('VALIDATION_ERROR', 'Invalid input', {
          errors: validation.error.issues,
        }),
        { status: 400 }
      );
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: sessionData.user.id },
      data: {
        ...(validation.data.name && { name: validation.data.name }),
        ...(validation.data.avatarUrl && { avatarUrl: validation.data.avatarUrl }),
        ...(validation.data.metadata && { metadata: validation.data.metadata as any }),
      },
    });

    return NextResponse.json(successResponse(updatedUser));
  } catch (error: any) {
    console.error('Update user error:', error);
    return NextResponse.json(
      errorResponse('INTERNAL_ERROR', error.message || 'Internal server error'),
      { status: 500 }
    );
  }
}

