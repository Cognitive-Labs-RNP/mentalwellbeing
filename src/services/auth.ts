/**
 * auth.ts — Authentication service
 *
 * Architecture note — UID + Password without email:
 * ─────────────────────────────────────────────────
 * Supabase Auth requires an email or phone identifier for its built-in
 * sign-up flow. There is no native "username + password only" option.
 *
 * Our approach (safest compatible design):
 *   • We derive a synthetic internal email:  {uid}@wb.local
 *   • This synthetic email is NEVER shown to the user.
 *   • The user sees and types only their UID (WB-XXXXXX) and password.
 *   • Supabase handles password hashing (bcrypt) — we never store plaintext.
 *   • The anon key is the only key used here — no service-role key.
 *   • RLS policies enforce per-user data isolation at the database level.
 *
 * Limitation:
 *   Supabase may send a confirmation email to the synthetic address.
 *   To avoid this, disable "Confirm email" in:
 *     Supabase Dashboard → Authentication → Providers → Email → disable confirmation.
 */

import { supabase } from '../lib/supabase';
import type { Session, User, AuthChangeEvent } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Derive the internal synthetic email from the user-visible UID.
 * e.g.  WB-A3F9K2  →  wb-a3f9k2@wb.local
 * Never expose this email in any UI component.
 */
function uidToEmail(uid: string): string {
  return `${uid.trim().toLowerCase()}@wb.local`;
}

/**
 * Generate a random anonymous UID in WB-XXXXXX format.
 * Uses 6 alphanumeric characters (uppercase, digits, no ambiguous chars).
 */
export function generateUid(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I/O/1/0 to avoid confusion
  let result = 'WB-';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Client-side password strength check.
 * The real password hash lives in Supabase — this is UI validation only.
 */
export function validatePassword(password: string): string | null {
  if (password.length < 8)          return 'Password must be at least 8 characters.';
  if (!/[A-Z]/.test(password))      return 'Password must contain at least one uppercase letter.';
  if (!/\d/.test(password))         return 'Password must contain at least one number.';
  return null;
}

/**
 * Legacy helper — kept so existing UI imports don't break during transition.
 * Returns a placeholder string; actual hashing is done by Supabase (bcrypt).
 * @deprecated Use the Supabase auth functions directly via this service.
 */
export function hashPasswordSync(_password: string): string {
  // Passwords are hashed by Supabase on the server using bcrypt.
  // This stub exists only to satisfy existing import references.
  // It is not used in any security-sensitive path.
  return '__supabase_managed__';
}

// ---------------------------------------------------------------------------
// Result type
// ---------------------------------------------------------------------------

export interface AuthResult {
  success: boolean;
  error: string | null;
  uid?: string;
  userId?: string;   // Supabase auth.users UUID
}

// ---------------------------------------------------------------------------
// Create account
// ---------------------------------------------------------------------------

/**
 * Create a new anonymous account.
 *
 * Steps:
 *  1. Sign up with Supabase Auth using the synthetic email + password.
 *  2. Pass the UID in user_metadata so the DB trigger can store it.
 *  3. The handle_new_user trigger in the DB creates the profiles row.
 */
export async function createAccount(
  uid: string,
  password: string
): Promise<AuthResult> {
  const validationError = validatePassword(password);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const email = uidToEmail(uid);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Pass UID in metadata so the handle_new_user trigger can read it.
      data: { uid },
    },
  });

  if (error) {
    // Surface a clean message; never expose the internal email.
    if (error.message.includes('already registered')) {
      return { success: false, error: 'This UID is already taken. Please use a different one.' };
    }
    return { success: false, error: error.message };
  }

  return {
    success: true,
    error: null,
    uid,
    userId: data.user?.id,
  };
}

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------

/**
 * Sign in with UID + password.
 * Derives the synthetic email internally — the user only types their UID.
 */
export async function login(
  uid: string,
  password: string
): Promise<AuthResult> {
  if (!uid.trim() || !password) {
    return { success: false, error: 'Please enter both your UID and password.' };
  }

  const email = uidToEmail(uid.trim().toUpperCase());

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Map Supabase error messages to user-friendly text without leaking internals.
    if (
      error.message.includes('Invalid login credentials') ||
      error.message.includes('invalid_grant')
    ) {
      return { success: false, error: 'Incorrect UID or password. Please try again.' };
    }
    if (error.message.includes('Email not confirmed')) {
      return {
        success: false,
        error:
          'Account not confirmed. Please disable email confirmation in your Supabase project ' +
          '(Dashboard → Authentication → Providers → Email).',
      };
    }
    return { success: false, error: error.message };
  }

  const resolvedUid =
    (data.user?.user_metadata?.uid as string | undefined) ?? uid.trim().toUpperCase();

  return {
    success: true,
    error: null,
    uid: resolvedUid,
    userId: data.user?.id,
  };
}

// ---------------------------------------------------------------------------
// Logout
// ---------------------------------------------------------------------------

export async function logout(): Promise<void> {
  await supabase.auth.signOut();
}

// ---------------------------------------------------------------------------
// Session helpers
// ---------------------------------------------------------------------------

/**
 * Get the current session synchronously from the in-memory cache.
 * Returns null if no user is authenticated.
 */
export async function getSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

/**
 * Get the currently authenticated Supabase User object, or null.
 */
export async function getCurrentUser(): Promise<User | null> {
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

/**
 * Subscribe to auth state changes (login, logout, token refresh).
 * Returns the unsubscribe function — call it on component unmount.
 *
 * @example
 *   const unsub = onAuthStateChange((event, session) => { ... });
 *   return () => unsub();
 */
export function onAuthStateChange(
  callback: (event: AuthChangeEvent, session: Session | null) => void
): () => void {
  const { data } = supabase.auth.onAuthStateChange(callback);
  return () => data.subscription.unsubscribe();
}

/**
 * Extract the user-visible UID from a Supabase User object.
 * Falls back to deriving it from the email if metadata is missing.
 */
export function getUidFromUser(user: User): string {
  if (user.user_metadata?.uid) {
    return user.user_metadata.uid as string;
  }
  // Fallback: reverse the email derivation
  const emailLocal = user.email?.split('@')[0] ?? '';
  return emailLocal.toUpperCase();
}
