import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/auth/session';

export async function POST(request: Request) {
  try {
    const { siteId, pagePath } = await request.json();

    if (!siteId || !pagePath) {
      return NextResponse.json(
        { error: 'Site ID and page path are required' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const today = new Date().toISOString().split('T')[0];

    await supabase.rpc('increment_analytics_view', {
      p_site_id: siteId,
      p_page_path: pagePath,
      p_date: today,
    });

    const { data: site } = await supabase
      .from('sites')
      .select('total_views')
      .eq('id', siteId)
      .single();

    if (site) {
      await supabase
        .from('sites')
        .update({ total_views: (site.total_views || 0) + 1 })
        .eq('id', siteId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track analytics' },
      { status: 500 }
    );
  }
}
