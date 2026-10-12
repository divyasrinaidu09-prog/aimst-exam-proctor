import { NextRequest, NextResponse } from 'next/server';
import { DataService } from '@/lib/dataService';
import { getAuthUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user || user.role !== 'student') {
      return NextResponse.json({ error: 'Student authorization required' }, { status: 403 });
    }

    const body = await req.json();
    const { sessionID } = body;

    if (!sessionID) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    const result = await DataService.submitExamSession(sessionID);

    return NextResponse.json({
      success: true,
      message: 'Exam submitted successfully',
      result,
    });
  } catch (err: any) {
    console.error('Session submit error:', err);
    return NextResponse.json({ error: 'Failed to submit exam: ' + err.message }, { status: 500 });
  }
}
