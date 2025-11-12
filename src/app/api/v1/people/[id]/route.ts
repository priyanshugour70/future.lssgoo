import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentSession } from '@/lib/session';
import { UpdatePeopleSchema } from '@/types/people';
import type { APIResponse } from '@/types';

// GET /api/v1/people/[id] - Get a single person (PUBLIC)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const person = await prisma.people.findUnique({
      where: { id: resolvedParams.id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        contact: true,
      },
    });

    if (!person) {
      const response: APIResponse = {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Person not found',
        },
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: APIResponse<typeof person> = {
      success: true,
      data: person,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error fetching person:', error);
    const response: APIResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch person',
      },
      timestamp: new Date().toISOString(),
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// PATCH /api/v1/people/[id] - Update a person (ADMIN ONLY)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
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

    const body = await req.json();
    const validation = UpdatePeopleSchema.safeParse(body);

    if (!validation.success) {
      const response: APIResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: validation.error.issues as any,
        },
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json(response, { status: 400 });
    }

    const { contact, ...personData } = validation.data;

    // Handle empty strings for optional fields
    const updateData: any = {};
    if (personData.fullName !== undefined) updateData.fullName = personData.fullName;
    if (personData.passion !== undefined) updateData.passion = personData.passion || null;
    if (personData.bio !== undefined) updateData.bio = personData.bio || null;
    if (personData.profileUrl !== undefined) updateData.profileUrl = personData.profileUrl || null;
    if (personData.photoUrl !== undefined) updateData.photoUrl = personData.photoUrl || null;
    if (personData.notes !== undefined) updateData.notes = personData.notes;
    if (personData.companyId !== undefined) updateData.companyId = personData.companyId || null;

    // Update person
    await prisma.people.update({
      where: { id: resolvedParams.id },
      data: updateData,
    });

    // Update contact if provided
    if (contact) {
      const contactUpdateData: any = {};
      if (contact.linkedin !== undefined) contactUpdateData.linkedin = contact.linkedin || null;
      if (contact.instagram !== undefined) contactUpdateData.instagram = contact.instagram || null;
      if (contact.twitter !== undefined) contactUpdateData.twitter = contact.twitter || null;
      if (contact.email !== undefined) contactUpdateData.email = contact.email || null;
      if (contact.phoneNumber !== undefined) contactUpdateData.phoneNumber = contact.phoneNumber || null;

      await prisma.peopleContact.upsert({
        where: { peopleId: resolvedParams.id },
        update: contactUpdateData,
        create: {
          peopleId: resolvedParams.id,
          ...contactUpdateData,
        },
      });
    }

    // Fetch updated person with relations
    const updatedPerson = await prisma.people.findUnique({
      where: { id: resolvedParams.id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        contact: true,
      },
    });

    const response: APIResponse<typeof updatedPerson> = {
      success: true,
      data: updatedPerson,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error updating person:', error);
    
    if (error.code === 'P2025') {
      const response: APIResponse = {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Person not found',
        },
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: APIResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message || 'Failed to update person',
      },
      timestamp: new Date().toISOString(),
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// DELETE /api/v1/people/[id] - Delete a person (ADMIN ONLY)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
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

    await prisma.people.delete({
      where: { id: resolvedParams.id },
    });

    const response: APIResponse = {
      success: true,
      data: { message: 'Person deleted successfully' },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error deleting person:', error);
    
    if (error.code === 'P2025') {
      const response: APIResponse = {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Person not found',
        },
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: APIResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete person',
      },
      timestamp: new Date().toISOString(),
    };
    return NextResponse.json(response, { status: 500 });
  }
}

