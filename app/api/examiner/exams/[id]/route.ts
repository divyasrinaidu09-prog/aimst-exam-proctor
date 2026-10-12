import { NextRequest, NextResponse } from 'next/server';
import { DataService } from '@/lib/dataService';
import { getAuthUser } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getAuthUser(req);
    if (!user || user.role !== 'examiner') {
      return NextResponse.json({ error: 'Examiner authorization required' }, { status: 403 });
    }

    const { id } = await params;
    const exam = await DataService.getExamById(id);
    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }

    const questions = await DataService.getQuestionsByExamId(id);
    const sessions = await DataService.getSessionsByExamId(id);

    return NextResponse.json({
      exam,
      questions,
      sessionsCount: sessions.length,
    });
  } catch (err: any) {
    console.error('Examiner GET exam details error:', err);
    return NextResponse.json({ error: 'Failed to retrieve exam details' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getAuthUser(req);
    if (!user || user.role !== 'examiner') {
      return NextResponse.json({ error: 'Examiner authorization required' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    const updatedExam = await DataService.updateExam(id, body);
    if (!updatedExam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Exam updated successfully',
      exam: updatedExam,
    });
  } catch (err: any) {
    console.error('Examiner PUT exam error:', err);
    return NextResponse.json({ error: 'Failed to update exam' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getAuthUser(req);
    if (!user || user.role !== 'examiner') {
      return NextResponse.json({ error: 'Examiner authorization required' }, { status: 403 });
    }

    const { id } = await params;
    await DataService.deleteExam(id);

    return NextResponse.json({
      success: true,
      message: 'Exam and associated questions deleted successfully',
    });
  } catch (err: any) {
    console.error('Examiner DELETE exam error:', err);
    return NextResponse.json({ error: 'Failed to delete exam' }, { status: 500 });
  }
}
