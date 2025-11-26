import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/auth/session';

export async function POST() {
  try {
    const supabase = await createServerClient();
    await supabase.auth.signOut();

    return NextResponse.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
