import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/services/auth.service';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/types/api';
import { Role, UpdateRoleSchema } from '@/types';

// PATCH /api/v1/admin/users/:id/role - Update user role (Admin only)
export async function PATCH(
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

    // Only admins can update user roles
    if (sessionData.user.role !== Role.ADMIN) {
      return NextResponse.json(
        errorResponse('FORBIDDEN', 'You do not have permission to update user roles'),
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Validate input
    const validation = UpdateRoleSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        errorResponse('VALIDATION_ERROR', 'Invalid input', {
          errors: validation.error.issues,
        }),
        { status: 400 }
      );
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role: validation.data.role },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: sessionData.user.id,
        action: 'UPDATE_ROLE',
        resource: 'USER',
        details: {
          targetUserId: id,
          newRole: validation.data.role,
        },
      },
    });

    return NextResponse.json(successResponse(updatedUser));
  } catch (error: any) {
    console.error('Update user role error:', error);
    return NextResponse.json(
      errorResponse('INTERNAL_ERROR', error.message || 'Internal server error'),
      { status: 500 }
    );
  }
}

