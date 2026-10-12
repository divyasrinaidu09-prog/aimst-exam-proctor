import { NextResponse } from 'next/server';
import { registerNewUser, AUTH_COOKIE_NAME } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { full_name, id_number, email, password, confirm_password, role } = body;

    if (!full_name || !id_number || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required.' },
        { status: 400 }
      );
    }

    if (password !== confirm_password) {
      return NextResponse.json(
        { error: 'Passwords do not match. Please re-enter.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    // Role assignment security: only register as student or examiner
    const assignedRole = role === 'examiner' ? 'examiner' : 'student';

    const result = await registerNewUser({
      full_name,
      id_number,
      email,
      password,
      role: assignedRole,
    });

    if (!result.success || !result.user) {
      return NextResponse.json(
        { error: result.error || 'Registration failed.' },
        { status: 400 }
      );
    }

    const res = NextResponse.json({
      success: true,
      user: result.user,
      message: 'Account created successfully! Verification email sent.',
    });

    // Optionally set session or allow email verification screen
    res.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: JSON.stringify(result.user),
      httpOnly: false,
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
    });

    return res;
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Server error during registration.' },
      { status: 500 }
    );
  }
}
