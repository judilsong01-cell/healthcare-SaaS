import { useState } from "react";
import { useLocation } from "wouter";
import { LoginForm } from "@/components/LoginForm";
import { SignupForm } from "@/components/SignupForm";
import { Shield } from "lucide-react";

/**
 * Auth Page - Login e Signup
 * 
 * Design Philosophy: Swiss Minimalism
 * - Interface limpa e minimalista
 * - Alternância entre login e signup
 * - Feedback visual claro
 */

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<"login" | "signup">("login");

  const handleAuthSuccess = () => {
    // Redirecionar para dashboard
    setLocation("/dashboard/patient");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">HealthCare</span>
          </div>
          <p className="text-gray-600">
            Acompanhamento pós-operatório e controlo de medicamentos
          </p>
        </div>

        {/* Auth Forms */}
        {mode === "login" ? (
          <LoginForm
            onSuccess={handleAuthSuccess}
            onError={(error) => console.error("Login error:", error)}
          />
        ) : (
          <SignupForm
            onSuccess={handleAuthSuccess}
            onError={(error) => console.error("Signup error:", error)}
          />
        )}

        {/* Mode Toggle */}
        <div className="mt-6 text-center">
          <button
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            {mode === "login"
              ? "Não tem conta? Criar conta"
              : "Já tem conta? Entrar"}
          </button>
        </div>

        {/* Demo Mode Notice */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800">
            <strong>⚠️ Modo Demo:</strong> Está a usar dados simulados. Para usar Supabase real, configure as variáveis de ambiente.
          </p>
        </div>
      </div>
    </div>
  );
}
