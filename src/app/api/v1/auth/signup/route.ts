import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/services/auth.service';
import { SignUpSchema } from '@/types';
import { errorResponse } from '@/types/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validation = SignUpSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        errorResponse('VALIDATION_ERROR', 'Invalid input', {
          errors: validation.error.issues,
        }),
        { status: 400 }
      );
    }

    // Sign up
    const result = await AuthService.signUp(validation.data);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Sign up error:', error);
    return NextResponse.json(
      errorResponse('INTERNAL_ERROR', error.message || 'Internal server error'),
      { status: 500 }
    );
  }
}

