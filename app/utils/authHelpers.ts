import { supabase } from './supabase';
import { handleError } from './errorHandler';
import { loginSchema, signupSchema, validateSchema } from './validation';
import type { ValidationResult } from './validation';

// ============================================
// EMAIL VERIFICATION UTILITIES
// ============================================

export async function checkEmailVerification(): Promise<{
  verified: boolean;
  needsVerification: boolean;
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { verified: false, needsVerification: false };
    }

    const emailVerified = user.email_confirmed_at !== null;

    return {
      verified: emailVerified,
      needsVerification: !emailVerified,
    };
  } catch (error) {
    console.error('Error checking email verification:', error);
    return { verified: false, needsVerification: false };
  }
}

export async function resendVerificationEmail(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'No user logged in' };
    }

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: user.email!,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    const { userMessage } = handleError(error, 'resendVerificationEmail');
    return { success: false, error: userMessage };
  }
}

export async function enforceEmailVerification(
  onUnverified: () => void,
  onVerified: () => void
): Promise<void> {
  const { needsVerification } = await checkEmailVerification();

  if (needsVerification) {
    onUnverified();
  } else {
    onVerified();
  }
}

// ============================================
// AUTH ACTIONS WITH VALIDATION
// ============================================

export async function loginWithValidation(
  rawData: { email: string; password: string },
  onSuccess: (user: any) => void,
  onError: (message: string) => void
): Promise<void> {
  // Validate input
  const validation = validateSchema(loginSchema, rawData);
  if (!validation.success) {
    const firstError = Object.values(validation.errors)[0];
    onError(firstError || 'Invalid input');
    return;
  }

  const { email, password } = validation.data;

  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (authError) {
      onError(handleError(authError, 'login').userMessage);
      return;
    }

    if (!authData.user) {
      onError('User not found');
      return;
    }

    // Enforce email verification.
    // Supabase sets `email_confirmed_at` once the user clicks the link in the
    // verification email. Without this check an unverified account can sign in.
    if (!authData.user.email_confirmed_at) {
      await supabase.auth.signOut();
      onError(
        'Please verify your email address before logging in. Check your inbox for the verification link.'
      );
      return;
    }

    onSuccess(authData.user);
  } catch (error) {
    onError(handleError(error, 'login').userMessage);
  }
}

export async function signupWithValidation(
  rawData: { email: string; password: string; fullName: string; userType: string },
  onSuccess: (user: any) => void,
  onError: (message: string) => void
): Promise<void> {
  // Validate input
  const validation = validateSchema(signupSchema, rawData);
  if (!validation.success) {
    const firstError = Object.values(validation.errors)[0];
    onError(firstError || 'Invalid input');
    return;
  }

  const { email, password, fullName, userType } = validation.data;

  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          user_type: userType,
        },
        emailRedirectTo: 'handyhub://auth/callback',
      },
    });

    if (authError) {
      onError(handleError(authError, 'signup').userMessage);
      return;
    }

    onSuccess(authData.user);
  } catch (error) {
    onError(handleError(error, 'signup').userMessage);
  }
}

// ============================================
// PASSWORD STRENGTH CALCULATOR
// ============================================

export interface PasswordStrengthResult {
  score: number; // 0-100
  label: string;
  color: string;
  suggestions: string[];
}

export function calculatePasswordStrength(password: string): PasswordStrengthResult {
  const suggestions: string[] = [];
  let score = 0;

  // Length checks
  if (password.length >= 8) score += 15;
  if (password.length >= 12) score += 15;
  if (password.length >= 16) score += 10;
  else if (password.length < 8) suggestions.push('Use at least 8 characters');

  // Character variety
  if (/[A-Z]/.test(password)) score += 15;
  else suggestions.push('Add uppercase letters (A-Z)');

  if (/[a-z]/.test(password)) score += 10;
  else suggestions.push('Add lowercase letters (a-z)');

  if (/\d/.test(password)) score += 15;
  else suggestions.push('Add numbers (0-9)');

  if (/[^A-Za-z0-9]/.test(password)) score += 20;
  else suggestions.push('Add special characters (!@#$%^&*)');

  // Common patterns (reduce score)
  if (/^(password|123456|qwerty|admin)/i.test(password)) {
    score = Math.max(0, score - 30);
    suggestions.push('Avoid common passwords');
  }

  // Ensure all criteria sum correctly
  score = Math.min(100, Math.max(0, score));

  // Determine label and color
  let label: string;
  let color: string;

  if (score < 40) {
    label = 'Weak';
    color = '#ef4444';
  } else if (score < 60) {
    label = 'Fair';
    color = '#f59e0b';
  } else if (score < 80) {
    label = 'Good';
    color = '#3b82f6';
  } else {
    label = 'Strong';
    color = '#10b981';
  }

  return { score, label, color, suggestions };
}

// ============================================
// PHONE NUMBER VALIDATOR
// ============================================

export function validatePhoneNumber(phone: string): {
  valid: boolean;
  formatted?: string;
  error?: string;
} {
  // Remove all non-digit characters except leading +
  const cleaned = phone.replace(/[^\d+]/g, '');

  // Basic validation - at least 10 digits
  const digits = cleaned.replace(/\D/g, '');
  if (digits.length < 10) {
    return { valid: false, error: 'Phone number must be at least 10 digits' };
  }

  if (digits.length > 15) {
    return { valid: false, error: 'Phone number is too long' };
  }

  // Format for display
  let formatted: string;
  if (cleaned.startsWith('+')) {
    formatted = `+${digits}`;
  } else {
    formatted = digits;
  }

  return { valid: true, formatted };
}
