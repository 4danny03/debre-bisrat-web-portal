import { supabase } from "@/integrations/supabase/client";
import { AuthStrategy, AuthResult } from "../AuthService";

export interface EmailPasswordCredentials {
  email: string;
  password: string;
}

/**
 * Email and password authentication strategy
 */
export class EmailPasswordStrategy implements AuthStrategy {
  /**
   * Authenticate using email and password
   */
  public async authenticate(
    credentials: EmailPasswordCredentials,
  ): Promise<AuthResult> {
    try {
      // Validate credentials
      if (!credentials.email || !credentials.password) {
        return { success: false, error: "Email and password are required" };
      }

      // Attempt to sign in
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });

      if (signInError) throw signInError;
      if (!data.user) throw new Error("No user returned from authentication");

      // Get user role from profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (profileError) {
        console.warn("Could not fetch user profile:", profileError);
      }

      return {
        success: true,
        user: {
          ...data.user,
          role: profile?.role,
        },
      };
    } catch (error) {
      console.error("Email/password authentication error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Authentication failed",
      };
    }
  }
}
