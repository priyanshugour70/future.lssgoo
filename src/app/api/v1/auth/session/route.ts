import { NextResponse } from 'next/server';
import { AuthService } from '@/services/auth.service';
import { successResponse, errorResponse } from '@/types/api';

export async function GET() {
  try {
    const session = await AuthService.getSession();

    return NextResponse.json(successResponse(session));
  } catch (error: any) {
    console.error('Get session error:', error);
    return NextResponse.json(
      errorResponse('INTERNAL_ERROR', error.message || 'Internal server error'),
      { status: 500 }
    );
  }
}

