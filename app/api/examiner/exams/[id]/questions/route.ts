import { NextRequest, NextResponse } from 'next/server';
import { DataService } from '@/lib/dataService';
import { getAuthUser } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const questions = await DataService.getQuestionsByExamId(id);
    return NextResponse.json({ questions });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to retrieve questions' }, { status: 500 });
  }
}

export async function POST(
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
    const { questionText, options, correctAnswer, points, explanation } = body;

    if (!questionText || !options || !correctAnswer) {
      return NextResponse.json(
        { error: 'Question text, options, and correct answer are required' },
        { status: 400 }
      );
    }

    const newQuestion = await DataService.createQuestion({
      examID: id as any,
      questionText,
      options,
      correctAnswer,
      points: Number(points) || 1,
      explanation: explanation || '',
    });

    return NextResponse.json({
      success: true,
      question: newQuestion,
    }, { status: 201 });
  } catch (err: any) {
    console.error('Create question error:', err);
    return NextResponse.json({ error: 'Failed to create question' }, { status: 500 });
  }
}
