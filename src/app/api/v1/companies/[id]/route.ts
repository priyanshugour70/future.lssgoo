import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentSession } from '@/lib/session';
import { UpdateCompanySchema } from '@/types/company';
import type { APIResponse } from '@/types';

// GET /api/v1/companies/[id] - Get a single company (PUBLIC)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const company = await prisma.company.findUnique({
      where: { id: resolvedParams.id },
      include: {
        accelerator: {
          select: {
            id: true,
            title: true,
          },
        },
        contactSource: true,
      },
    });

    if (!company) {
      const response: APIResponse = {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Company not found',
        },
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: APIResponse<typeof company> = {
      success: true,
      data: company,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error fetching company:', error);
    const response: APIResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch company',
      },
      timestamp: new Date().toISOString(),
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// PATCH /api/v1/companies/[id] - Update a company (ADMIN ONLY)
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
    const validation = UpdateCompanySchema.safeParse(body);

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

    const { contactSource, ...companyData } = validation.data;

    // Handle empty strings for optional fields
    const updateData: any = {};
    if (companyData.name !== undefined) updateData.name = companyData.name;
    if (companyData.tagline !== undefined) updateData.tagline = companyData.tagline || null;
    if (companyData.description !== undefined) updateData.description = companyData.description;
    if (companyData.companySize !== undefined) updateData.companySize = companyData.companySize || null;
    if (companyData.techStack !== undefined) updateData.techStack = companyData.techStack;
    if (companyData.domain !== undefined) updateData.domain = companyData.domain || null;
    if (companyData.sector !== undefined) updateData.sector = companyData.sector || null;
    if (companyData.vision !== undefined) updateData.vision = companyData.vision || null;
    if (companyData.foundedYear !== undefined) updateData.foundedYear = companyData.foundedYear || null;
    if (companyData.website !== undefined) updateData.website = companyData.website || null;
    if (companyData.logoUrl !== undefined) updateData.logoUrl = companyData.logoUrl || null;
    if (companyData.location !== undefined) updateData.location = companyData.location || null;
    if (companyData.fundingStage !== undefined) updateData.fundingStage = companyData.fundingStage || null;
    if (companyData.acceleratorId !== undefined) updateData.acceleratorId = companyData.acceleratorId || null;

    // Update company
    const company = await prisma.company.update({
      where: { id: resolvedParams.id },
      data: updateData,
      include: {
        accelerator: {
          select: {
            id: true,
            title: true,
          },
        },
        contactSource: true,
      },
    });

    // Update contact source if provided
    if (contactSource) {
      const contactUpdateData: any = {};
      if (contactSource.instagram !== undefined) contactUpdateData.instagram = contactSource.instagram || null;
      if (contactSource.linkedin !== undefined) contactUpdateData.linkedin = contactSource.linkedin || null;
      if (contactSource.twitter !== undefined) contactUpdateData.twitter = contactSource.twitter || null;
      if (contactSource.facebook !== undefined) contactUpdateData.facebook = contactSource.facebook || null;
      if (contactSource.contactNumber !== undefined) contactUpdateData.contactNumber = contactSource.contactNumber || null;
      if (contactSource.emails !== undefined) contactUpdateData.emails = contactSource.emails;

      await prisma.contactSource.upsert({
        where: { companyId: resolvedParams.id },
        update: contactUpdateData,
        create: {
          companyId: resolvedParams.id,
          ...contactUpdateData,
        },
      });
    }

    // Fetch updated company with relations
    const updatedCompany = await prisma.company.findUnique({
      where: { id: resolvedParams.id },
      include: {
        accelerator: {
          select: {
            id: true,
            title: true,
          },
        },
        contactSource: true,
      },
    });

    const response: APIResponse<typeof updatedCompany> = {
      success: true,
      data: updatedCompany,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error updating company:', error);
    
    if (error.code === 'P2025') {
      const response: APIResponse = {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Company not found',
        },
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: APIResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message || 'Failed to update company',
      },
      timestamp: new Date().toISOString(),
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// DELETE /api/v1/companies/[id] - Delete a company (ADMIN ONLY)
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

    await prisma.company.delete({
      where: { id: resolvedParams.id },
    });

    const response: APIResponse = {
      success: true,
      data: { message: 'Company deleted successfully' },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error deleting company:', error);
    
    if (error.code === 'P2025') {
      const response: APIResponse = {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Company not found',
        },
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: APIResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete company',
      },
      timestamp: new Date().toISOString(),
    };
    return NextResponse.json(response, { status: 500 });
  }
}

