import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME } from '@/lib/auth';
import { dataService } from '@/lib/dataService';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { subject_code, student_id } = body;

    let targetStudentId = student_id;

    if (!targetStudentId) {
      const cookieStore = await cookies();
      const cookie = cookieStore.get(AUTH_COOKIE_NAME);
      if (cookie?.value) {
        try {
          const user = JSON.parse(cookie.value);
          targetStudentId = user.id;
        } catch {}
      }
    }

    if (!targetStudentId) {
      // Default to Divyasri demo student if not logged in
      targetStudentId = 'prof-student-01';
    }

    if (!subject_code || !subject_code.trim()) {
      return NextResponse.json({ error: 'Please enter a valid subject code.' }, { status: 400 });
    }

    const result = await dataService.enrollStudentByCode(targetStudentId, subject_code);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: result.message.startsWith('Already Enrolled') ? 409 : 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      subject: result.subject,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Enrollment failed.' }, { status: 500 });
  }
}
