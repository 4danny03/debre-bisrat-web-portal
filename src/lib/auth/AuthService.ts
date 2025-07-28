import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";

export interface AuthUser extends User {
  role?: string;
}

export interface AuthResult {
  success: boolean;
  user?: AuthUser | null;
  error?: string;
}

export interface AuthStrategy {
  authenticate(credentials: Record<string, any>): Promise<AuthResult>;
}

export type AuthStateChangeCallback = (
  event: string,
  session: Session | null,
) => void;

/**
 * Authentication Service
 * Provides a centralized service for handling authentication operations
 */
export class AuthService {
  private static instance: AuthService;
  private authStrategies: Map<string, AuthStrategy> = new Map();

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Register an authentication strategy
   */
  public registerStrategy(name: string, strategy: AuthStrategy): void {
    this.authStrategies.set(name, strategy);
  }

  /**
   * Authenticate using a specific strategy
   */
  public async authenticate(
    strategyName: string,
    credentials: Record<string, any>,
  ): Promise<AuthResult> {
    const strategy = this.authStrategies.get(strategyName);
    if (!strategy) {
      return {
        success: false,
        error: `Authentication strategy '${strategyName}' not found`,
      };
    }

    try {
      return await strategy.authenticate(credentials);
    } catch (error) {
      console.error(
        `Authentication error with strategy ${strategyName}:`,
        error,
      );
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown authentication error",
      };
    }
  }

  /**
   * Get current session
   */
  public async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return { success: true, session: data.session };
    } catch (error) {
      console.error("Error getting session:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get current user with role
   */
  public async getCurrentUser(): Promise<AuthResult> {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        return {
          success: false,
          error: sessionError?.message || "No active session",
        };
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (profileError) {
        console.error("Error fetching user profile:", profileError);
      }

      const user: AuthUser = {
        ...session.user,
        role: profile?.role,
      };

      return { success: true, user };
    } catch (error) {
      console.error("Error getting current user:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Check if user has admin role
   */
  public async isAdmin(): Promise<boolean> {
    const { success, user } = await this.getCurrentUser();
    return success && user?.role === "admin";
  }

  /**
   * Sign out current user
   */
  public async signOut(): Promise<AuthResult> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error("Error signing out:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Subscribe to auth state changes
   */
  public onAuthStateChange(callback: AuthStateChangeCallback) {
    return supabase.auth.onAuthStateChange(callback);
  }

  /**
   * Register a new user
   */
  public async register(
    email: string,
    password: string,
    userData?: Record<string, any>,
  ): Promise<AuthResult> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });

      if (error) throw error;

      return {
        success: true,
        user: data.user as AuthUser,
      };
    } catch (error) {
      console.error("Registration error:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown registration error",
      };
    }
  }

  /**
   * Reset password
   */
  public async resetPassword(email: string): Promise<AuthResult> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/reset-password",
      });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error("Password reset error:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown password reset error",
      };
    }
  }

  /**
   * Update user profile
   */
  public async updateProfile(
    userId: string,
    profileData: Record<string, any>,
  ): Promise<AuthResult> {
    try {
      const { error } = await supabase
        .from("profiles")
        .update(profileData)
        .eq("id", userId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error("Profile update error:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown profile update error",
      };
    }
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();
