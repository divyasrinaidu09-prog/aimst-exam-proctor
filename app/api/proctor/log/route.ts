import { NextRequest, NextResponse } from 'next/server';
import { DataService } from '@/lib/dataService';
import { getAuthUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { sessionID, incidentType, description, screenshotUrl, severity } = body;

    if (!sessionID || !incidentType || !description) {
      return NextResponse.json(
        { error: 'Session ID, incident type, and description are required' },
        { status: 400 }
      );
    }

    const log = await DataService.addProctoringLog({
      sessionID,
      incidentType,
      description,
      screenshotUrl: screenshotUrl || '',
      severity: severity || 'medium',
    });

    const session = await DataService.getSessionById(sessionID);
    const exam = session ? await DataService.getExamById(String(session.examID)) : null;
    const maxViolations = exam?.maxViolationsAllowed || 5;
    const violationsCount = session?.violationsCount || 1;

    return NextResponse.json({
      success: true,
      log,
      violationsCount,
      maxViolations,
      exceededLimit: violationsCount >= maxViolations,
    }, { status: 201 });
  } catch (err: any) {
    console.error('Proctoring log API error:', err);
    return NextResponse.json({ error: 'Failed to record proctoring log' }, { status: 500 });
  }
}
