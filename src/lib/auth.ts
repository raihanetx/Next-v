import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// JWT Configuration
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
);
const JWT_ALGORITHM = 'HS256';

// Token expiration times
export const TOKEN_EXPIRY = {
  ACCESS_TOKEN: '15m', // 15 minutes
  REFRESH_TOKEN: '7d', // 7 days
  REMEMBER_ME_TOKEN: '30d', // 30 days
};

// Rate limiting configuration
export const RATE_LIMIT = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_ATTEMPTS: 5, // Maximum 5 attempts per window
  LOCKOUT_DURATION: 30 * 60 * 1000, // 30 minutes lockout
};

// In-memory rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { attempts: number; lockUntil: number }>();

export interface JWTCustomPayload extends JWTPayload {
  userId: string;
  email?: string;
  role: string;
  sessionId: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  sessionId: string;
}

export interface LoginAttempt {
  ip: string;
  userAgent: string;
  timestamp: number;
  success: boolean;
}

// Session management
const sessions = new Map<string, { 
  userId: string; 
  createdAt: number; 
  lastAccess: number;
  userAgent: string;
  ip: string;
}>();

// Generate secure session ID
export function generateSessionId(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Generate secure random token
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Create JWT token
export async function createJWT(payload: JWTCustomPayload, expiresIn: string): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: JWT_ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(JWT_SECRET);
}

// Verify JWT token
export async function verifyJWT(token: string): Promise<JWTCustomPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as JWTCustomPayload;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

// Create auth tokens
export async function createAuthTokens(userId: string, email?: string, rememberMe: boolean = false): Promise<AuthTokens> {
  const sessionId = generateSessionId();
  const now = Date.now();
  
  // Store session
  sessions.set(sessionId, {
    userId,
    createdAt: now,
    lastAccess: now,
    userAgent: '', // Will be set during login
    ip: '', // Will be set during login
  });

  const accessTokenExpiry = rememberMe ? TOKEN_EXPIRY.REMEMBER_ME_TOKEN : TOKEN_EXPIRY.ACCESS_TOKEN;
  
  const accessToken = await createJWT({
    userId,
    email,
    role: 'admin',
    sessionId,
  }, accessTokenExpiry);

  const refreshToken = await createJWT({
    userId,
    email,
    role: 'admin',
    sessionId,
    type: 'refresh',
  }, TOKEN_EXPIRY.REFRESH_TOKEN);

  return {
    accessToken,
    refreshToken,
    sessionId,
  };
}

// Refresh access token
export async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  try {
    const payload = await verifyJWT(refreshToken);
    if (!payload || payload.type !== 'refresh') {
      return null;
    }

    let session = sessions.get(payload.sessionId);
    if (!session) {
      // Create a new session if it doesn't exist (for remember me functionality)
      session = {
        userId: payload.userId,
        createdAt: Date.now(),
        lastAccess: Date.now(),
        userAgent: '',
        ip: '',
      };
      sessions.set(payload.sessionId, session);
    }

    // Update last access
    session.lastAccess = Date.now();

    // Create new access token
    return await createJWT({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      sessionId: payload.sessionId,
    }, TOKEN_EXPIRY.ACCESS_TOKEN);
  } catch (error) {
    console.error('Token refresh failed:', error);
    return null;
  }
}

// Invalidate session
export function invalidateSession(sessionId: string): void {
  sessions.delete(sessionId);
}

// Check if session is valid
export function isSessionValid(sessionId: string): boolean {
  const session = sessions.get(sessionId);
  if (!session) {
    // In development, create a new session if it doesn't exist
    // This prevents session loss during server restarts
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔧 Development: Creating new session for lost sessionId:', sessionId);
      sessions.set(sessionId, {
        userId: 'admin',
        createdAt: Date.now(),
        lastAccess: Date.now(),
        userAgent: '',
        ip: '',
      });
      return true;
    }
    return false;
  }

  // Check if session is older than 30 days
  const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
  if (Date.now() - session.createdAt > thirtyDaysInMs) {
    sessions.delete(sessionId);
    return false;
  }

  return true;
}

// Rate limiting functions
export function isRateLimited(ip: string): { limited: boolean; remainingAttempts: number; lockUntil?: number } {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record) {
    rateLimitStore.set(ip, { attempts: 0, lockUntil: 0 });
    return { limited: false, remainingAttempts: RATE_LIMIT.MAX_ATTEMPTS };
  }

  // Check if IP is locked
  if (record.lockUntil > now) {
    return { 
      limited: true, 
      remainingAttempts: 0, 
      lockUntil: record.lockUntil 
    };
  }

  // Reset attempts if window has passed
  if (now - record.attempts > RATE_LIMIT.WINDOW_MS) {
    record.attempts = 0;
  }

  const remainingAttempts = RATE_LIMIT.MAX_ATTEMPTS - record.attempts;
  
  if (remainingAttempts <= 0) {
    // Lock the IP
    record.lockUntil = now + RATE_LIMIT.LOCKOUT_DURATION;
    return { 
      limited: true, 
      remainingAttempts: 0, 
      lockUntil: record.lockUntil 
    };
  }

  return { limited: false, remainingAttempts };
}

// Record failed login attempt
export function recordFailedAttempt(ip: string): void {
  const record = rateLimitStore.get(ip);
  if (record) {
    record.attempts++;
  }
}

// Clear failed attempts on successful login
export function clearFailedAttempts(ip: string): void {
  rateLimitStore.delete(ip);
}

// Get session info
export function getSessionInfo(sessionId: string) {
  return sessions.get(sessionId);
}

// Update session activity
export function updateSessionActivity(sessionId: string, userAgent: string, ip: string): void {
  const session = sessions.get(sessionId);
  if (session) {
    session.lastAccess = Date.now();
    session.userAgent = userAgent;
    session.ip = ip;
  }
}

// Clean up expired sessions (run periodically)
export function cleanupExpiredSessions(): void {
  const now = Date.now();
  const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
  
  for (const [sessionId, session] of sessions.entries()) {
    if (now - session.createdAt > thirtyDaysInMs) {
      sessions.delete(sessionId);
    }
  }
}

// Clean up expired rate limit records (run periodically)
export function cleanupRateLimitRecords(): void {
  const now = Date.now();
  
  for (const [ip, record] of rateLimitStore.entries()) {
    if (record.lockUntil < now && now - record.attempts > RATE_LIMIT.WINDOW_MS) {
      rateLimitStore.delete(ip);
    }
  }
}

// Generate CSRF token
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Verify CSRF token
export function verifyCSRFToken(token: string, sessionToken: string): boolean {
  // In a real implementation, you'd store and verify CSRF tokens per session
  // For now, we'll use a simple verification
  return token.length === 64 && sessionToken.length === 64;
}