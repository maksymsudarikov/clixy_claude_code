import { supabase } from './supabase';

const ADMIN_ALLOWLIST = (import.meta.env.VITE_ADMIN_EMAIL_ALLOWLIST || '')
  .split(',')
  .map((email: string) => email.trim().toLowerCase())
  .filter(Boolean);

const isAllowedAdminEmail = (email: string | undefined): boolean => {
  if (!email) return false;
  if (ADMIN_ALLOWLIST.length === 0) {
    // Safer default: only allow when running local dev.
    return !!import.meta.env.DEV;
  }
  return ADMIN_ALLOWLIST.includes(email.toLowerCase());
};

export const sendAdminLoginCode = async (email: string): Promise<void> => {
  const normalizedEmail = email.trim().toLowerCase();
  const { error } = await supabase.auth.signInWithOtp({
    email: normalizedEmail,
    options: {
      shouldCreateUser: false,
    },
  });

  if (error) {
    throw error;
  }
};

export const verifyAdminLoginCode = async (email: string, token: string): Promise<void> => {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedToken = token.trim();

  const { error } = await supabase.auth.verifyOtp({
    email: normalizedEmail,
    token: normalizedToken,
    type: 'email',
  });

  if (error) {
    throw error;
  }

  const { data } = await supabase.auth.getUser();
  const currentEmail = data.user?.email?.toLowerCase();
  if (!isAllowedAdminEmail(currentEmail)) {
    await supabase.auth.signOut();
    throw new Error('This account is not authorized for admin access.');
  }
};

export const getCurrentAdminUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  if (!isAllowedAdminEmail(data.user.email?.toLowerCase())) return null;
  return data.user;
};

export const signOutAdmin = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
};

export const onAdminAuthStateChange = (callback: () => void) => {
  const { data } = supabase.auth.onAuthStateChange(() => {
    callback();
  });

  return () => data.subscription.unsubscribe();
};
