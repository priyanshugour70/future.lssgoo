import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/services/auth.service';
import { errorResponse } from '@/types/api';

export async function POST(request: NextRequest) {
  try {
    const result = await AuthService.refreshSession();

    if (!result.success) {
      return NextResponse.json(result, { status: 401 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Refresh session error:', error);
    return NextResponse.json(
      errorResponse('INTERNAL_ERROR', error.message || 'Internal server error'),
      { status: 500 }
    );
  }
}

