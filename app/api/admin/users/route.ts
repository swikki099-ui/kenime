import { NextResponse } from 'next/server';
import { requireAdmin, createServiceClient } from '@/lib/auth/session';

export async function GET() {
  try {
    const admin = await requireAdmin();
    const supabase = createServiceClient();

    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ users: users || [] });
  } catch (error: any) {
    console.error('Get users error:', error);
    if (error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
