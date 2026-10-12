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
    const { sessionID, questionID, selectedOption } = body;

    if (!sessionID || !questionID || !selectedOption) {
      return NextResponse.json(
        { error: 'Session ID, Question ID, and selected option are required' },
        { status: 400 }
      );
    }

    const answer = await DataService.saveAnswer(sessionID, questionID, selectedOption);

    return NextResponse.json({
      success: true,
      answer,
    });
  } catch (err: any) {
    console.error('Save answer error:', err);
    return NextResponse.json({ error: 'Failed to record answer' }, { status: 500 });
  }
}
