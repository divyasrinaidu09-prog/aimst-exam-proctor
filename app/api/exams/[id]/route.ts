import { NextResponse } from 'next/server';
import { dataService } from '@/lib/dataService';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const exam = await dataService.getExamById(id);

    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, exam });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch exam' }, { status: 500 });
  }
}
