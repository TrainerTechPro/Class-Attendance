import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET active sessions or sessions for a specific class
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const classId = searchParams.get('classId');

    if (classId) {
      const sessions = await prisma.attendanceSession.findMany({
        where: { classId },
        orderBy: { date: 'desc' },
        include: {
          class: true,
          records: true,
        },
      });
      return NextResponse.json(sessions);
    }

    // Get all active sessions
    const activeSessions = await prisma.attendanceSession.findMany({
      where: { isActive: true },
      include: {
        class: true,
        records: true,
      },
      orderBy: { startTime: 'desc' },
    });

    return NextResponse.json(activeSessions);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

// POST create/start a new attendance session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { classId } = body;

    if (!classId) {
      return NextResponse.json(
        { error: 'Class ID is required' },
        { status: 400 }
      );
    }

    // Check if class exists
    const classExists = await prisma.class.findUnique({
      where: { id: classId },
    });

    if (!classExists) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      );
    }

    // Create new session
    const session = await prisma.attendanceSession.create({
      data: {
        classId,
        isActive: true,
      },
      include: {
        class: true,
      },
    });

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}

// PATCH update session (e.g., end session)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, isActive } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const updatedSession = await prisma.attendanceSession.update({
      where: { id: sessionId },
      data: {
        isActive,
        endTime: isActive === false ? new Date() : undefined,
      },
      include: {
        class: true,
        records: true,
      },
    });

    return NextResponse.json(updatedSession);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    );
  }
}
