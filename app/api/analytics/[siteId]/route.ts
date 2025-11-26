import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, createServiceClient } from '@/lib/auth/session';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const user = await requireAuth();
    const { siteId } = await params;
    const supabase = createServiceClient();

    const { data: site } = await supabase
      .from('sites')
      .select('*')
      .eq('id', siteId)
      .eq('user_id', user.id)
      .single();

    if (!site) {
      return NextResponse.json(
        { error: 'Site not found or access denied' },
        { status: 404 }
      );
    }

    const { data: analytics } = await supabase
      .from('analytics')
      .select('*')
      .eq('site_id', siteId)
      .order('date', { ascending: false })
      .limit(30);

    const { data: deployments } = await supabase
      .from('deployments')
      .select('*')
      .eq('site_id', siteId)
      .order('created_at', { ascending: false })
      .limit(10);

    const totalViews = analytics?.reduce((sum, a) => sum + a.views, 0) || 0;

    return NextResponse.json({
      site,
      analytics: analytics || [],
      deployments: deployments || [],
      totalViews,
    });
  } catch (error: any) {
    console.error('Get analytics error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
