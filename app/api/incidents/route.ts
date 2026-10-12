import { NextResponse } from 'next/server';
import { dataService } from '@/lib/dataService';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const examId = searchParams.get('examId') || undefined;
    const studentId = searchParams.get('studentId') || undefined;

    const incidents = await dataService.getIncidents({ examId, studentId });
    return NextResponse.json({ success: true, incidents });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch incidents' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { exam_id, student_id, incident_type, severity, description, evidence_path } = body;

    if (!exam_id || !student_id || !incident_type) {
      return NextResponse.json(
        { error: 'exam_id, student_id, and incident_type are required' },
        { status: 400 }
      );
    }

    const incident = await dataService.recordIncident({
      exam_id,
      student_id,
      incident_type,
      severity: severity || 'medium',
      description: description || `Potential violation: ${incident_type}`,
      evidence_path: evidence_path || '/incident_snapshot_sample.jpg',
    });

    return NextResponse.json({ success: true, incident });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to record incident' }, { status: 500 });
  }
}
