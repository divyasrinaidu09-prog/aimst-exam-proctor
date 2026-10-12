import { NextResponse } from 'next/server';
import { dataService } from '@/lib/dataService';

export async function GET() {
  try {
    const subjects = await dataService.getAllSubjects();
    return NextResponse.json({ success: true, subjects });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch subjects' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { subject_code, subject_name, description, created_by } = body;

    if (!subject_code || !subject_name) {
      return NextResponse.json({ error: 'Subject code and Subject name are required.' }, { status: 400 });
    }

    const result = await dataService.createSubject({
      subject_code,
      subject_name,
      description,
      created_by,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, subject: result.subject, message: result.message });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Server error' }, { status: 500 });
  }
}
