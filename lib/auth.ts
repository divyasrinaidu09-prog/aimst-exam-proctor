import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';
import { verifyAccessToken, TokenPayload } from './jwt';
import { Profile, UserRole } from './supabase/types';
import { dataService } from './dataService';

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export interface AuthSession {
  user: Profile;
  token: string;
}

export const AUTH_COOKIE_NAME = 'aimst_auth_user';

/**
 * Extracts and verifies user from Next.js request.
 * Checks HTTP cookie 'aimst_auth_user', 'aimst_token', and 'Authorization: Bearer ...' header.
 */
export function getAuthUser(req: NextRequest): TokenPayload | null {
  const authUserCookie = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (authUserCookie) {
    try {
      const u = JSON.parse(authUserCookie);
      return {
        id: u.id,
        userID: u.id_number || u.id,
        role: u.role,
        email: u.email,
        name: u.full_name,
      };
    } catch {}
  }

  const cookieToken = req.cookies.get('aimst_token')?.value;
  if (cookieToken) {
    const verified = verifyAccessToken(cookieToken);
    if (verified) return verified;
  }

  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const bearerToken = authHeader.substring(7);
    return verifyAccessToken(bearerToken);
  }

  return null;
}

export async function loginWithCredentials(
  identifier: string,
  pass: string,
  expectedRole?: UserRole
): Promise<{ success: boolean; user?: Profile; error?: string }> {
  const profile = await dataService.getProfileByEmailOrId(identifier);

  if (!profile) {
    return {
      success: false,
      error: 'Invalid ID Number or Email Address. Please check your credentials.',
    };
  }

  // If role is expected (e.g. examiner logging in on examiner page)
  if (expectedRole && profile.role !== expectedRole) {
    if (expectedRole === 'examiner' && profile.role === 'admin') {
      // Admins can log in through examiner/admin portal
    } else {
      return {
        success: false,
        error: `Account role mismatch: This portal is for ${expectedRole}s. Your account is registered as ${profile.role}.`,
      };
    }
  }

  return {
    success: true,
    user: profile,
  };
}

export async function registerNewUser(data: {
  full_name: string;
  id_number: string;
  email: string;
  password: string;
  role: 'student' | 'examiner';
}): Promise<{ success: boolean; user?: Profile; error?: string }> {
  // Validation
  if (!data.full_name?.trim()) {
    return { success: false, error: 'Full name is required.' };
  }
  if (!data.id_number?.trim()) {
    return { success: false, error: 'ID Number is required.' };
  }
  if (!data.email?.trim() || !data.email.includes('@')) {
    return { success: false, error: 'Valid university email address is required.' };
  }
  if (!data.password || data.password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters.' };
  }

  // Check unique constraints
  const existing = await dataService.getProfileByEmailOrId(data.id_number);
  if (existing) {
    return { success: false, error: `An account with ID Number ${data.id_number} already exists.` };
  }

  const existingEmail = await dataService.getProfileByEmailOrId(data.email);
  if (existingEmail) {
    return { success: false, error: `An account with email ${data.email} already exists.` };
  }

  // Create profile
  const user = await dataService.createProfile({
    full_name: data.full_name.trim(),
    id_number: data.id_number.trim(),
    email: data.email.trim().toLowerCase(),
    role: data.role,
    avatar_url: data.role === 'student' ? '/student_divyasri.jpg' : '/examiner_ahmad.jpg',
  });

  return {
    success: true,
    user,
  };
}
