import { NextRequest, NextResponse } from 'next/server';
import { DataService } from '@/lib/dataService';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const sessionID = searchParams.get('sessionID');

    if (!sessionID) {
      return NextResponse.json({ error: 'sessionID query parameter is required' }, { status: 400 });
    }

    const logs = await DataService.getLogsBySessionId(sessionID);
    return NextResponse.json({ logs });
  } catch (err: any) {
    console.error('Proctoring logs GET error:', err);
    return NextResponse.json({ error: 'Failed to retrieve logs' }, { status: 500 });
  }
}
