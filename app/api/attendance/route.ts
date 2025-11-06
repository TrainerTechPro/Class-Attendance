import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isOnCampus, getDistanceFromCampus } from '@/lib/geolocation';

// POST - Student check-in
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, studentName, latitude, longitude } = body;

    // Validate input
    if (!sessionId || !studentName || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: 'Session ID, student name, and location are required' },
        { status: 400 }
      );
    }

    // Check if session exists and is active
    const session = await prisma.attendanceSession.findUnique({
      where: { id: sessionId },
      include: { class: true },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    if (!session.isActive) {
      return NextResponse.json(
        { error: 'This attendance session has ended' },
        { status: 400 }
      );
    }

    // Check if student already checked in
    const existingRecord = await prisma.attendanceRecord.findUnique({
      where: {
        sessionId_studentName: {
          sessionId,
          studentName,
        },
      },
    });

    if (existingRecord) {
      return NextResponse.json(
        { error: 'You have already checked in for this session' },
        { status: 400 }
      );
    }

    // Validate location
    const onCampus = isOnCampus(latitude, longitude);
    const distance = getDistanceFromCampus(latitude, longitude);

    // Create attendance record
    const record = await prisma.attendanceRecord.create({
      data: {
        sessionId,
        studentName,
        latitude,
        longitude,
        isValid: onCampus,
      },
    });

    if (!onCampus) {
      return NextResponse.json({
        success: false,
        message: `Location verification failed. You appear to be ${distance.toFixed(2)}km from campus. Please ensure you are on campus.`,
        record,
      }, { status: 200 });
    }

    return NextResponse.json({
      success: true,
      message: `Attendance recorded for ${session.class.name}`,
      record,
    }, { status: 201 });

  } catch (error: any) {
    console.error('Attendance error:', error);
    return NextResponse.json(
      { error: 'Failed to record attendance' },
      { status: 500 }
    );
  }
}

// GET attendance records for a session
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const records = await prisma.attendanceRecord.findMany({
      where: { sessionId },
      orderBy: { timestamp: 'asc' },
    });

    return NextResponse.json(records);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch attendance records' },
      { status: 500 }
    );
  }
}
