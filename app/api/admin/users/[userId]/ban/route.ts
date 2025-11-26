import { NextResponse } from 'next/server';
import { requireAdmin, createServiceClient } from '@/lib/auth/session';

export async function POST(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const admin = await requireAdmin();
    const { userId } = await params;
    const { banned, reason } = await request.json();

    const supabase = createServiceClient();

    const { error } = await supabase
      .from('users')
      .update({ is_banned: banned })
      .eq('id', userId);

    if (error) {
      throw error;
    }

    await supabase.from('admin_logs').insert({
      admin_id: admin.id,
      action: banned ? 'ban_user' : 'unban_user',
      target_user_id: userId,
      details: { reason },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Ban user error:', error);
    if (error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
