import { NextResponse } from 'next/server';
import { loginWithCredentials, AUTH_COOKIE_NAME } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { identifier, password, role } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Please enter both your ID/Email and password.' },
        { status: 400 }
      );
    }

    const result = await loginWithCredentials(identifier, password, role);

    if (!result.success || !result.user) {
      return NextResponse.json(
        { error: result.error || 'Authentication failed.' },
        { status: 401 }
      );
    }

    const res = NextResponse.json({
      success: true,
      user: result.user,
      message: 'Login successful',
    });

    // Set auth cookie
    res.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: JSON.stringify(result.user),
      httpOnly: false, // Accessible to client-side components for user session
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax',
    });

    return res;
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
