import { NextResponse } from 'next/server';
import { dataService } from '@/lib/dataService';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const subject = searchParams.get('subject') || undefined;

    const data = await dataService.getLiveMonitoring(subject);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch monitoring data' }, { status: 500 });
  }
}
