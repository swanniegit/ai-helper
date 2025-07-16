import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  user_id: string;
  session_token: string;
  expires_at: string;
  ip_address?: string;
  user_agent?: string;
  is_active: boolean;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  session?: Session;
  error?: string;
}

export class AuthService {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
  private static readonly SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days
  private static readonly SALT_ROUNDS = 12;

  /**
   * Register a new user
   */
  static async register(email: string, password: string, firstName?: string, lastName?: string): Promise<AuthResult> {
    try {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (existingUser) {
        return { success: false, error: 'User with this email already exists' };
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, this.SALT_ROUNDS);

      // Create user
      const { data: user, error } = await supabase
        .from('users')
        .insert({
          email,
          password_hash: passwordHash,
          first_name: firstName,
          last_name: lastName,
          email_verification_token: uuidv4()
        })
        .select()
        .single();

      if (error) {
        console.error('Registration error:', error);
        return { success: false, error: 'Failed to create user' };
      }

      // Create session
      const session = await this.createSession(user.id);

      return {
        success: true,
        user: user as User,
        session
      };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed' };
    }
  }

  /**
   * Login user
   */
  static async login(email: string, password: string, ipAddress?: string, userAgent?: string): Promise<AuthResult> {
    try {
      // Find user by email
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .single();

      if (error || !user) {
        return { success: false, error: 'Invalid email or password' };
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return { success: false, error: 'Invalid email or password' };
      }

      // Update last login
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', user.id);

      // Create session
      const session = await this.createSession(user.id, ipAddress, userAgent);

      return {
        success: true,
        user: user as User,
        session
      };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' };
    }
  }

  /**
   * Create a new session for a user
   */
  static async createSession(userId: string, ipAddress?: string, userAgent?: string): Promise<Session> {
    // Generate a shorter session token that fits within VARCHAR(255)
    const sessionId = uuidv4().replace(/-/g, '').substring(0, 16);
    const timestamp = Date.now().toString(36);
    const sessionToken = `${userId}_${sessionId}_${timestamp}`;

    const expiresAt = new Date(Date.now() + this.SESSION_DURATION);

    const { data: session, error } = await supabase
      .from('user_sessions')
      .insert({
        user_id: userId,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString(),
        ip_address: ipAddress,
        user_agent: userAgent,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('Session creation error:', error);
      throw new Error(`Failed to create session: ${error.message}`);
    }

    return session as Session;
  }

  /**
   * Validate session token
   */
  static async validateSession(sessionToken: string): Promise<AuthResult> {
    try {
      // Find session
      const { data: session, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('session_token', sessionToken)
        .eq('is_active', true)
        .single();

      if (error || !session) {
        return { success: false, error: 'Invalid session' };
      }

      // Check if session is expired
      if (new Date(session.expires_at) < new Date()) {
        await this.invalidateSession(sessionToken);
        return { success: false, error: 'Session expired' };
      }

      // Get user
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user_id)
        .eq('is_active', true)
        .single();

      if (userError || !user) {
        return { success: false, error: 'User not found' };
      }

      return {
        success: true,
        user: user as User,
        session: session as Session
      };
    } catch (error) {
      console.error('Session validation error:', error);
      return { success: false, error: 'Session validation failed' };
    }
  }

  /**
   * Invalidate session
   */
  static async invalidateSession(sessionToken: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .update({ is_active: false })
        .eq('session_token', sessionToken);

      return !error;
    } catch (error) {
      console.error('Session invalidation error:', error);
      return false;
    }
  }

  /**
   * Logout user (invalidate all sessions)
   */
  static async logout(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .update({ is_active: false })
        .eq('user_id', userId);

      return !error;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<User | null> {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .eq('is_active', true)
        .single();

      if (error || !user) {
        return null;
      }

      return user as User;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId: string, updates: Partial<User>): Promise<AuthResult> {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        return { success: false, error: 'Failed to update profile' };
      }

      return {
        success: true,
        user: user as User
      };
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: 'Profile update failed' };
    }
  }

  /**
   * Change password
   */
  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<AuthResult> {
    try {
      // Get current user
      const { data: user, error } = await supabase
        .from('users')
        .select('password_hash')
        .eq('id', userId)
        .single();

      if (error || !user) {
        return { success: false, error: 'User not found' };
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isValidPassword) {
        return { success: false, error: 'Current password is incorrect' };
      }

      // Hash new password
      const newPasswordHash = await bcrypt.hash(newPassword, this.SALT_ROUNDS);

      // Update password
      const { error: updateError } = await supabase
        .from('users')
        .update({ password_hash: newPasswordHash })
        .eq('id', userId);

      if (updateError) {
        return { success: false, error: 'Failed to update password' };
      }

      return { success: true };
    } catch (error) {
      console.error('Password change error:', error);
      return { success: false, error: 'Password change failed' };
    }
  }

  /**
   * Request password reset
   */
  static async requestPasswordReset(email: string): Promise<AuthResult> {
    try {
      const resetToken = uuidv4();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      const { error } = await supabase
        .from('users')
        .update({
          password_reset_token: resetToken,
          password_reset_expires: expiresAt.toISOString()
        })
        .eq('email', email);

      if (error) {
        return { success: false, error: 'Failed to request password reset' };
      }

      // TODO: Send email with reset token
      console.log('Password reset token:', resetToken);

      return { success: true };
    } catch (error) {
      console.error('Password reset request error:', error);
      return { success: false, error: 'Password reset request failed' };
    }
  }

  /**
   * Reset password with token
   */
  static async resetPassword(token: string, newPassword: string): Promise<AuthResult> {
    try {
      // Find user with valid reset token
      const { data: user, error } = await supabase
        .from('users')
        .select('id')
        .eq('password_reset_token', token)
        .gte('password_reset_expires', new Date().toISOString())
        .single();

      if (error || !user) {
        return { success: false, error: 'Invalid or expired reset token' };
      }

      // Hash new password
      const newPasswordHash = await bcrypt.hash(newPassword, this.SALT_ROUNDS);

      // Update password and clear reset token
      const { error: updateError } = await supabase
        .from('users')
        .update({
          password_hash: newPasswordHash,
          password_reset_token: null,
          password_reset_expires: null
        })
        .eq('id', user.id);

      if (updateError) {
        return { success: false, error: 'Failed to reset password' };
      }

      return { success: true };
    } catch (error) {
      console.error('Password reset error:', error);
      return { success: false, error: 'Password reset failed' };
    }
  }
} 