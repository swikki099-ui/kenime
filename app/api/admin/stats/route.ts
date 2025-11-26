import { NextResponse } from 'next/server';
import { requireAdmin, createServiceClient } from '@/lib/auth/session';

export async function GET() {
  try {
    await requireAdmin();
    const supabase = createServiceClient();

    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    const { count: totalSites } = await supabase
      .from('sites')
      .select('*', { count: 'exact', head: true });

    const { count: totalDeployments } = await supabase
      .from('deployments')
      .select('*', { count: 'exact', head: true });

    const { data: sites } = await supabase
      .from('sites')
      .select('storage_bytes, total_views');

    const totalStorage = sites?.reduce((sum, site) => sum + site.storage_bytes, 0) || 0;
    const totalViews = sites?.reduce((sum, site) => sum + site.total_views, 0) || 0;

    return NextResponse.json({
      stats: {
        totalUsers: totalUsers || 0,
        totalSites: totalSites || 0,
        totalDeployments: totalDeployments || 0,
        totalStorage,
        totalViews,
      },
    });
  } catch (error: any) {
    console.error('Get stats error:', error);
    if (error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
