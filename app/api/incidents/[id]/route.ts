import { NextResponse } from 'next/server';
import { dataService } from '@/lib/dataService';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const incident = await dataService.getIncidentById(id);

    if (!incident) {
      return NextResponse.json({ error: 'Incident not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, incident });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch incident' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { reviewer_id } = body;

    const ok = await dataService.markIncidentReviewed(id, reviewer_id);

    if (!ok) {
      return NextResponse.json({ error: 'Incident not found or cannot be updated' }, { status: 404 });
    }

    const updated = await dataService.getIncidentById(id);
    return NextResponse.json({ success: true, incident: updated, message: 'Incident marked as reviewed.' });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to update incident' }, { status: 500 });
  }
}
