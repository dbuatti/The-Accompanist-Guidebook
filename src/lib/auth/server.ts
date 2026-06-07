import { createNeonAuth } from '@neondatabase/auth/next/server';

export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL || 'https://dummy.neonauth.us-east-1.aws.neon.tech/neondb/auth',
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET || 'dummy-secret-for-build-phase-must-be-long-enough-32-chars',
  },
});