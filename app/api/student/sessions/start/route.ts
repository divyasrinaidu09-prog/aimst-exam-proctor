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
    const { examID, deviceInfo, verificationConfidence } = body;

    if (!examID) {
      return NextResponse.json({ error: 'Exam ID is required' }, { status: 400 });
    }

    const exam = await DataService.getExamById(examID);
    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }

    // Create session
    const session = await DataService.createSession(user.id, examID, deviceInfo);
    if (verificationConfidence) {
      (session as any).verificationConfidence = verificationConfidence;
    }

    // Fetch questions and sanitize them (DO NOT leak correctAnswer or explanation to examinee!)
    const rawQuestions = await DataService.getQuestionsByExamId(examID);
    const questions = rawQuestions.map((q: any) => ({
      _id: q._id,
      questionText: q.questionText,
      options: q.options,
      points: q.points,
    }));

    return NextResponse.json({
      success: true,
      session,
      exam: {
        _id: exam._id,
        title: exam.title,
        courseCode: exam.courseCode,
        duration: exam.duration,
        totalPoints: exam.totalPoints,
        maxViolationsAllowed: exam.maxViolationsAllowed,
      },
      questions,
    }, { status: 201 });
  } catch (err: any) {
    console.error('Session start error:', err);
    return NextResponse.json({ error: 'Failed to start exam session' }, { status: 500 });
  }
}
