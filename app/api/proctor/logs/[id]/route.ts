import { NextRequest, NextResponse } from 'next/server';
import { DataService } from '@/lib/dataService';
import { getAuthUser } from '@/lib/auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getAuthUser(req);
    if (!user || user.role !== 'examiner') {
      return NextResponse.json({ error: 'Examiner authorization required' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { reviewed } = body;

    const updated = await DataService.updateLogReviewStatus(id, Boolean(reviewed));
    if (!updated) {
      return NextResponse.json({ error: 'Log entry not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      log: updated,
    });
  } catch (err: any) {
    console.error('Proctoring log patch error:', err);
    return NextResponse.json({ error: 'Failed to update review status' }, { status: 500 });
  }
}
