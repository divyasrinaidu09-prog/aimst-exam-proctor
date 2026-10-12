import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME } from '@/lib/auth';
import { dataService } from '@/lib/dataService';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(AUTH_COOKIE_NAME);

    if (!cookie?.value) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const cachedUser = JSON.parse(cookie.value);
    const user = await dataService.getProfileById(cachedUser.id);

    return NextResponse.json({
      authenticated: true,
      user: user || cachedUser,
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false, user: null });
  }
}
