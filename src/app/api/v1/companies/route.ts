import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentSession } from '@/lib/session';
import { CreateCompanySchema } from '@/types/company';
import type { APIResponse, PaginatedResponse } from '@/types';

// GET /api/v1/companies - List all companies (PUBLIC)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const acceleratorId = searchParams.get('acceleratorId');
    const sector = searchParams.get('sector');
    const techStack = searchParams.get('techStack');
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tagline: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (acceleratorId) {
      where.acceleratorId = acceleratorId;
    }

    if (sector) {
      where.sector = { contains: sector, mode: 'insensitive' };
    }

    if (techStack) {
      where.techStack = { has: techStack };
    }

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        include: {
          accelerator: {
            select: {
              id: true,
              title: true,
            },
          },
          contactSource: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.company.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    const response: PaginatedResponse<typeof companies[0]> = {
      success: true,
      data: companies,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error fetching companies:', error);
    const response: APIResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch companies',
      },
      timestamp: new Date().toISOString(),
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// POST /api/v1/companies - Create a new company (ADMIN ONLY)
export async function POST(req: NextRequest) {
  try {
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
    const validation = CreateCompanySchema.safeParse(body);

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
    const cleanedData: any = {
      ...companyData,
      website: companyData.website || null,
      logoUrl: companyData.logoUrl || null,
      acceleratorId: companyData.acceleratorId || null,
      tagline: companyData.tagline || null,
      companySize: companyData.companySize || null,
      domain: companyData.domain || null,
      sector: companyData.sector || null,
      vision: companyData.vision || null,
      location: companyData.location || null,
      fundingStage: companyData.fundingStage || null,
      foundedYear: companyData.foundedYear || null,
    };

    // Create company with contact source
    const company = await prisma.company.create({
      data: {
        ...cleanedData,
        contactSource: contactSource
          ? {
              create: {
                instagram: contactSource.instagram || null,
                linkedin: contactSource.linkedin || null,
                twitter: contactSource.twitter || null,
                facebook: contactSource.facebook || null,
                contactNumber: contactSource.contactNumber || null,
                emails: contactSource.emails || [],
              },
            }
          : undefined,
      },
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

    const response: APIResponse<typeof company> = {
      success: true,
      data: company,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    console.error('Error creating company:', error);
    const response: APIResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message || 'Failed to create company',
      },
      timestamp: new Date().toISOString(),
    };
    return NextResponse.json(response, { status: 500 });
  }
}

