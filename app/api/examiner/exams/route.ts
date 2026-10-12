import { NextRequest, NextResponse } from 'next/server';
import { DataService } from '@/lib/dataService';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user || user.role !== 'examiner') {
      return NextResponse.json({ error: 'Examiner authorization required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;

    const exams = await DataService.getExams({ status });
    return NextResponse.json({ exams });
  } catch (err: any) {
    console.error('Examiner GET exams error:', err);
    return NextResponse.json({ error: 'Failed to retrieve exams' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user || user.role !== 'examiner') {
      return NextResponse.json({ error: 'Examiner authorization required' }, { status: 403 });
    }

    const body = await req.json();
    const {
      title,
      courseCode,
      dateTime,
      duration,
      totalPoints,
      passPercentage,
      maxViolationsAllowed,
      status,
      showInstantResults,
      questions,
    } = body;

    if (!title || !courseCode || !duration) {
      return NextResponse.json(
        { error: 'Title, Course Code, and Duration are required' },
        { status: 400 }
      );
    }

    const newExam = await DataService.createExam({
      title,
      courseCode: courseCode.toUpperCase(),
      dateTime: dateTime ? new Date(dateTime) : new Date(),
      duration: Number(duration),
      totalPoints: Number(totalPoints) || 100,
      passPercentage: Number(passPercentage) || 50,
      maxViolationsAllowed: Number(maxViolationsAllowed) || 5,
      status: status || 'upcoming',
      createdBy: user.id as any,
      showInstantResults: showInstantResults ?? true,
    });

    // If questions were submitted with exam creation, insert them
    if (Array.isArray(questions) && questions.length > 0) {
      for (const q of questions) {
        await DataService.createQuestion({
          examID: newExam._id as any,
          questionText: q.questionText,
          options: q.options,
          correctAnswer: q.correctAnswer,
          points: q.points || 1,
          explanation: q.explanation || '',
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Exam created successfully',
      exam: newExam,
    }, { status: 201 });
  } catch (err: any) {
    console.error('Examiner POST exam error:', err);
    return NextResponse.json({ error: 'Failed to create exam: ' + err.message }, { status: 500 });
  }
}
