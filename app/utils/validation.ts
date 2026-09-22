import { z } from 'zod';

// ============================================
// AUTHENTICATION SCHEMAS
// ============================================

export const loginSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .trim()
    .toLowerCase(),
  password: z.string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters')
});

export const signupSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .trim()
    .toLowerCase(),
  password: z.string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  fullName: z.string()
    .min(1, 'Full name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100),
  userType: z.enum(['customer', 'provider']),
  phone: z
    .union([
      z.string().trim().min(10, 'Phone number must be at least 10 digits'),
      z.literal('').transform(() => null),
      z.null(),
      z.undefined(),
    ])
    .optional()
});

export const forgotPasswordSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
});

export const resetPasswordSchema = z.object({
  password: z.string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string()
    .min(1, 'Please confirm your password')
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

// ============================================
// PROFILE SCHEMAS
// ============================================

export const updateProfileSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(100).optional(),
  email: z.string().email('Invalid email').optional(),
  phone: z.string().min(10, 'Invalid phone number').optional(),
  avatarUrl: z.string().url('Invalid avatar URL').optional().nullable(),
});

// ============================================
// PROVIDER SCHEMAS
// ============================================

export const providerRegistrationSchema = z.object({
  businessName: z.string()
    .min(1, 'Business name is required')
    .max(200),
  businessType: z.string().min(1, 'Business type is required'),
  businessAddress: z.string().min(1, 'Business address is required'),
  yearsOfExperience: z.number()
    .min(0, 'Years must be positive')
    .max(60)
    .optional(),
  licenseNumber: z.string().optional(),
  taxId: z.string().optional(),
  hourlyRate: z.number()
    .min(10, 'Minimum hourly rate is $10')
    .max(10000, 'Hourly rate seems unrealistic')
    .optional(),
  serviceCategories: z.array(z.string()).min(1, 'Select at least one category'),
  serviceAreas: z.array(z.string()).min(1, 'Select service areas'),
  emergencyService: z.boolean().optional(),
  warrantyOffered: z.boolean().optional(),
});

// ============================================
// BOOKING SCHEMAS
// ============================================

export const createBookingSchema = z.object({
  providerId: z.string().uuid('Invalid provider ID'),
  serviceId: z.string().uuid('Invalid service ID').optional(),
  serviceName: z.string().min(1, 'Service name is required').max(200),
  bookingTime: z.string().refine(val => {
    const date = new Date(val);
    return !isNaN(date.getTime()) && date > new Date();
  }, { message: 'Booking time must be a future date' }),
  address: z.string().min(1, 'Address is required').max(500),
  specialInstructions: z.string().max(1000).optional(),
  totalAmount: z.number().min(0, 'Total must be non-negative'),
});

// ============================================
// SERVICE SCHEMAS
// ============================================

export const createServiceSchema = z.object({
  name: z.string()
    .min(1, 'Service name is required')
    .max(200),
  description: z.string().max(2000).optional(),
  price: z.number().min(0, 'Price must be non-negative'),
  duration: z.number().min(1, 'Duration must be at least 1 minute'),
  categoryId: z.string().uuid('Invalid category ID').optional(),
});

// ============================================
// VALIDATION UTILITIES
// ============================================

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: Record<string, string> };

export function validateSchema<T>(schema: z.ZodSchema<T>, data: unknown): ValidationResult<T> {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string> = {};
  result.error.issues.forEach(issue => {
    const path = issue.path.join('.');
    errors[path] = issue.message;
  });

  return { success: false, errors };
}

export type { z };
