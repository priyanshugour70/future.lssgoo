import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/services/auth.service';
import { SignInSchema } from '@/types';
import { errorResponse } from '@/types/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validation = SignInSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        errorResponse('VALIDATION_ERROR', 'Invalid input', {
          errors: validation.error.issues,
        }),
        { status: 400 }
      );
    }

    // Sign in
    const result = await AuthService.signIn(validation.data);

    if (!result.success) {
      return NextResponse.json(result, { status: 401 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Sign in error:', error);
    return NextResponse.json(
      errorResponse('INTERNAL_ERROR', error.message || 'Internal server error'),
      { status: 500 }
    );
  }
}

