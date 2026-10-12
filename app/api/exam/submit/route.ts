import { NextResponse } from 'next/server';
import { dataService } from '@/lib/dataService';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { exam_id, student_id, answers, notes } = body;

    if (!exam_id || !student_id) {
      return NextResponse.json({ error: 'exam_id and student_id are required' }, { status: 400 });
    }

    const submission = await dataService.submitExam({
      exam_id,
      student_id,
      answers: answers || {},
      notes: notes || '',
    });

    return NextResponse.json({
      success: true,
      message: 'Exam submitted successfully.',
      submission,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to submit exam' }, { status: 500 });
  }
}
