import { supabase, isDemoModeActive } from "./supabaseClient";

/**
 * Auth Service - Supabase Authentication
 * 
 * Design Philosophy: Autenticação Segura
 * - Signup com email e password
 * - Login com email e password
 * - Gestão de sessões
 * - Recuperação de password
 * - Logout
 */

export interface SignUpData {
  email: string;
  password: string;
  full_name: string;
  user_type: "patient" | "doctor";
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  error?: string;
  data?: any;
}

class AuthService {
  /**
   * Signup - Criar nova conta
   */
  async signUp(data: SignUpData): Promise<AuthResponse> {
    try {
      if (isDemoModeActive) {
        console.warn("⚠️ MODO DEMO: Signup simulado");
        return {
          success: true,
          data: {
            user: {
              id: "demo-user-" + Date.now(),
              email: data.email,
            },
          },
        };
      }

      // 1. Criar utilizador no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        return {
          success: false,
          error: authError.message,
        };
      }

      if (!authData.user) {
        return {
          success: false,
          error: "Erro ao criar utilizador",
        };
      }

      // 2. Criar perfil na tabela profiles
      const { error: profileError } = await supabase.from("profiles").insert({
        id: authData.user.id,
        email: data.email,
        full_name: data.full_name,
        user_type: data.user_type,
      });

      if (profileError) {
        // Tentar eliminar utilizador se falhar ao criar perfil
        await supabase.auth.admin.deleteUser(authData.user.id);
        return {
          success: false,
          error: `Erro ao criar perfil: ${profileError.message}`,
        };
      }

      return {
        success: true,
        data: authData,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao fazer signup";
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Login - Autenticar utilizador
   */
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      if (isDemoModeActive) {
        console.warn("⚠️ MODO DEMO: Login simulado");
        return {
          success: true,
          data: {
            user: {
              id: "demo-patient-123",
              email: data.email,
            },
            session: {
              access_token: "demo-token-" + Date.now(),
            },
          },
        };
      }

      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
        data: authData,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao fazer login";
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Logout - Terminar sessão
   */
  async logout(): Promise<AuthResponse> {
    try {
      if (isDemoModeActive) {
        console.warn("⚠️ MODO DEMO: Logout simulado");
        return { success: true };
      }

      const { error } = await supabase.auth.signOut();

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao fazer logout";
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Reset Password - Enviar email de recuperação
   */
  async resetPassword(email: string): Promise<AuthResponse> {
    try {
      if (isDemoModeActive) {
        console.warn("⚠️ MODO DEMO: Reset password simulado");
        return {
          success: true,
          data: { message: "Email de recuperação enviado (DEMO)" },
        };
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
        data: { message: "Email de recuperação enviado" },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao resetar password";
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Update Password - Atualizar password
   */
  async updatePassword(newPassword: string): Promise<AuthResponse> {
    try {
      if (isDemoModeActive) {
        console.warn("⚠️ MODO DEMO: Update password simulado");
        return { success: true };
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao atualizar password";
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Get Current User
   */
  async getCurrentUser() {
    try {
      if (isDemoModeActive) {
        return {
          user: {
            id: "demo-patient-123",
            email: "paciente@demo.com",
          },
        };
      }

      const { data, error } = await supabase.auth.getUser();

      if (error) {
        console.error("Error getting current user:", error);
        return { user: null };
      }

      return { user: data.user };
    } catch (error) {
      console.error("Error in getCurrentUser:", error);
      return { user: null };
    }
  }

  /**
   * Verificar se utilizador está autenticado
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      if (isDemoModeActive) {
        return true;
      }

      const { data } = await supabase.auth.getSession();
      return !!data.session;
    } catch (error) {
      console.error("Error checking authentication:", error);
      return false;
    }
  }
}

export default new AuthService();
