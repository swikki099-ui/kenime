import { NextResponse } from 'next/server';
import { createServerClient, createServiceClient } from '@/lib/auth/session';

const RESERVED_USERNAMES = [
  'admin', 'api', 'login', 'signup', 'dashboard', 'preview',
  'sites', 'assets', 'static', '_next', 'public', 'about',
  'help', 'support', 'terms', 'privacy', 'contact', 'blog',
  'docs', 'www', 'app', 'dev', 'staging', 'test', 'demo'
];

export async function POST(request: Request) {
  try {
    const { email, password, username, displayName } = await request.json();

    if (!email || !password || !username) {
      return NextResponse.json(
        { error: 'Email, password, and username are required' },
        { status: 400 }
      );
    }

    const usernameRegex = /^[a-zA-Z0-9_-]{3,50}$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        { error: 'Username must be 3-50 characters and contain only letters, numbers, hyphens, and underscores' },
        { status: 400 }
      );
    }

    if (RESERVED_USERNAMES.includes(username.toLowerCase())) {
      return NextResponse.json(
        { error: 'This username is reserved and cannot be used' },
        { status: 400 }
      );
    }

    const serviceClient = createServiceClient();

    const { data: existingUser } = await serviceClient
      .from('users')
      .select('username')
      .eq('username', username.toLowerCase())
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      return NextResponse.json(
        { error: signUpError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    const { error: profileError } = await serviceClient
      .from('users')
      .insert({
        id: authData.user.id,
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        display_name: displayName || username,
      });

    if (profileError) {
      const adminClient = createServiceClient();
      await adminClient.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: 'Failed to create user profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Account created successfully',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        username: username.toLowerCase(),
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
