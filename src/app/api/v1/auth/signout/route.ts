import { NextResponse } from 'next/server';
import { AuthService } from '@/services/auth.service';
import { successResponse, errorResponse } from '@/types/api';

export async function POST() {
  try {
    const result = await AuthService.signOut();

    if (!result.success) {
      return NextResponse.json(
        errorResponse('SIGN_OUT_FAILED', 'Sign out failed'),
        { status: 500 }
      );
    }

    return NextResponse.json(successResponse(null, 'Signed out successfully'));
  } catch (error: any) {
    console.error('Sign out error:', error);
    return NextResponse.json(
      errorResponse('INTERNAL_ERROR', error.message || 'Internal server error'),
      { status: 500 }
    );
  }
}

