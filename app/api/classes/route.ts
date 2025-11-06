import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET all classes
export async function GET() {
  try {
    const classes = await prisma.class.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        sessions: {
          orderBy: { date: 'desc' },
          take: 1,
        },
      },
    });

    return NextResponse.json(classes);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch classes' },
      { status: 500 }
    );
  }
}

// POST create a new class
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, code } = body;

    if (!name || !code) {
      return NextResponse.json(
        { error: 'Name and code are required' },
        { status: 400 }
      );
    }

    const newClass = await prisma.class.create({
      data: {
        name,
        code,
      },
    });

    return NextResponse.json(newClass, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Class code already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create class' },
      { status: 500 }
    );
  }
}
