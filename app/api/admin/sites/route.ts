import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, createServiceClient } from '@/lib/auth/session';

export async function GET() {
  try {
    await requireAdmin();
    const supabase = createServiceClient();

    const { data: sites, error } = await supabase
      .from('sites')
      .select(`
        *,
        users:user_id (username, email)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ sites: sites || [] });
  } catch (error: any) {
    console.error('Get all sites error:', error);
    if (error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json(
      { error: 'Failed to fetch sites' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const { siteId, reason } = await request.json();

    const supabase = createServiceClient();

    const { error } = await supabase
      .from('sites')
      .delete()
      .eq('id', siteId);

    if (error) {
      throw error;
    }

    await supabase.from('admin_logs').insert({
      admin_id: String(admin.id),
      action: 'delete_site',
      target_site_id: String(siteId),
      details: { reason },
    } as any);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete site error:', error);
    if (error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json(
      { error: 'Failed to delete site' },
      { status: 500 }
    );
  }
}
