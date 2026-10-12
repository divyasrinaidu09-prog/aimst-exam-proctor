import { NextResponse } from 'next/server';
import { dataService } from '@/lib/dataService';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { exam_id, student_id } = body;

    if (!exam_id || !student_id) {
      return NextResponse.json({ error: 'exam_id and student_id are required' }, { status: 400 });
    }

    const session = await dataService.startOrGetSession(exam_id, student_id);
    return NextResponse.json({ success: true, session });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to initialize session' }, { status: 500 });
  }
}
