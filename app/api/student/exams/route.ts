import { NextRequest, NextResponse } from 'next/server';
import { DataService } from '@/lib/dataService';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user || user.role !== 'student') {
      return NextResponse.json({ error: 'Student authorization required' }, { status: 403 });
    }

    const exams = await DataService.getExams();
    return NextResponse.json({ exams });
  } catch (err: any) {
    console.error('Student GET exams error:', err);
    return NextResponse.json({ error: 'Failed to retrieve exams' }, { status: 500 });
  }
}
