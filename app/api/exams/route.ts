import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME } from '@/lib/auth';
import { dataService } from '@/lib/dataService';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studentOnly = searchParams.get('studentOnly') === 'true';

    let studentId = searchParams.get('studentId');
    if (!studentId && studentOnly) {
      const cookieStore = await cookies();
      const cookie = cookieStore.get(AUTH_COOKIE_NAME);
      if (cookie?.value) {
        try {
          const user = JSON.parse(cookie.value);
          studentId = user.id;
        } catch {}
      }
      if (!studentId) {
        studentId = 'prof-student-01'; // Default student
      }
    }

    if (studentId) {
      const exams = await dataService.getExamsForStudent(studentId);
      return NextResponse.json({ success: true, exams });
    }

    const exams = await dataService.getAllExams();
    return NextResponse.json({ success: true, exams });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch exams' }, { status: 500 });
  }
}
