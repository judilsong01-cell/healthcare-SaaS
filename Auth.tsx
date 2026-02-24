import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Link } from "wouter";

/**
 * Authentication Page - Login & Signup
 * Design Philosophy: Swiss Minimalism + Clinical Trust
 * - Clean, minimal form design
 * - Toggle between login and signup modes
 * - Clear validation feedback
 * - Trust indicators (security, privacy)
 */

export default function Auth() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    confirmPassword: "",
    role: "patient",
    agreeTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFormData({
        ...formData,
        [name]: (e.target as HTMLInputElement).checked,
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = "Email é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (!formData.password) {
      newErrors.password = "Palavra-passe é obrigatória";
    } else if (formData.password.length < 8) {
      newErrors.password = "Palavra-passe deve ter pelo menos 8 caracteres";
    }

    if (mode === "signup") {
      if (!formData.name) {
        newErrors.name = "Nome é obrigatório";
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Palavras-passe não correspondem";
      }
      if (!formData.agreeTerms) {
        newErrors.agreeTerms = "Deve aceitar os termos";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setSubmitted(true);
      // Reset form after 2 seconds
      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          email: "",
          password: "",
          name: "",
          confirmPassword: "",
          role: "patient",
          agreeTerms: false,
        });
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col">
      {/* Header */}
      <header className="py-6 border-b border-gray-200">
        <div className="container flex items-center justify-between">
          <Link href="/">
            <a className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">HC</span>
              </div>
              <span className="font-display text-xl font-bold text-gray-900">
                HealthCare
              </span>
            </a>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">HC</span>
            </div>
            <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">
              HealthCare
            </h1>
            <p className="text-gray-600">
              Acompanhamento pós-operatório seguro
            </p>
          </div>

          {/* Auth Card */}
          <Card className="p-8 border-gray-200 shadow-lg">
            {submitted ? (
              // Success Message
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="font-heading text-2xl font-semibold text-gray-900 mb-2">
                  {mode === "login" ? "Bem-vindo de volta!" : "Conta criada!"}
                </h2>
                <p className="text-gray-600 mb-6">
                  {mode === "login"
                    ? "Está a ser redirecionado para o dashboard..."
                    : "Verifique o seu email para confirmar a conta."}
                </p>
              </div>
            ) : (
              <>
                {/* Mode Tabs */}
                <div className="flex gap-4 mb-8 border-b border-gray-200">
                  <button
                    onClick={() => setMode("login")}
                    className={`pb-4 font-semibold transition-colors ${
                      mode === "login"
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Entrar
                  </button>
                  <button
                    onClick={() => setMode("signup")}
                    className={`pb-4 font-semibold transition-colors ${
                      mode === "signup"
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Criar conta
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name Field (Signup only) */}
                  {mode === "signup" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome completo
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="João Silva"
                          className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                            errors.name ? "border-red-500" : "border-gray-300"
                          }`}
                        />
                      </div>
                      {errors.name && (
                        <p className="text-red-600 text-sm mt-1">{errors.name}</p>
                      )}
                    </div>
                  )}

                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="seu@email.com"
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                          errors.email ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>

                  {/* Role Field (Signup only) */}
                  {mode === "signup" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de conta
                      </label>
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        <option value="patient">Paciente</option>
                        <option value="doctor">Médico</option>
                        <option value="clinic">Clínica</option>
                      </select>
                    </div>
                  )}

                  {/* Password Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Palavra-passe
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="••••••••"
                        className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                          errors.password ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-600 text-sm mt-1">{errors.password}</p>
                    )}
                  </div>

                  {/* Confirm Password (Signup only) */}
                  {mode === "signup" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirmar palavra-passe
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                          type={showPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          placeholder="••••••••"
                          className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                            errors.confirmPassword
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                        />
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.confirmPassword}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Remember Me / Forgot Password (Login only) */}
                  {mode === "login" && (
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-gray-300 text-blue-600"
                        />
                        <span className="text-sm text-gray-600">
                          Manter-me ligado
                        </span>
                      </label>
                      <a
                        href="#"
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        Esqueceu a palavra-passe?
                      </a>
                    </div>
                  )}

                  {/* Terms & Conditions (Signup only) */}
                  {mode === "signup" && (
                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        name="agreeTerms"
                        checked={formData.agreeTerms}
                        onChange={handleInputChange}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 mt-1"
                      />
                      <label className="text-sm text-gray-600">
                        Concordo com os{" "}
                        <a href="#" className="text-blue-600 hover:text-blue-700">
                          termos de serviço
                        </a>{" "}
                        e{" "}
                        <a href="#" className="text-blue-600 hover:text-blue-700">
                          política de privacidade
                        </a>
                      </label>
                    </div>
                  )}
                  {errors.agreeTerms && (
                    <p className="text-red-600 text-sm">{errors.agreeTerms}</p>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 font-semibold mt-6"
                  >
                    {mode === "login" ? "Entrar" : "Criar conta"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">ou</span>
                  </div>
                </div>

                {/* Social Login */}
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    <span className="text-gray-700 font-medium">
                      {mode === "login" ? "Entrar" : "Criar"} com Google
                    </span>
                  </button>
                </div>

                {/* Footer Text */}
                <p className="text-center text-sm text-gray-600 mt-6">
                  {mode === "login" ? (
                    <>
                      Não tem conta?{" "}
                      <button
                        onClick={() => setMode("signup")}
                        className="text-blue-600 hover:text-blue-700 font-semibold"
                      >
                        Criar uma
                      </button>
                    </>
                  ) : (
                    <>
                      Já tem conta?{" "}
                      <button
                        onClick={() => setMode("login")}
                        className="text-blue-600 hover:text-blue-700 font-semibold"
                      >
                        Entrar
                      </button>
                    </>
                  )}
                </p>
              </>
            )}
          </Card>

          {/* Trust Indicators */}
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            <div className="text-sm">
              <div className="text-gray-400 mb-1">🔒</div>
              <p className="text-gray-600 text-xs">Dados seguros</p>
            </div>
            <div className="text-sm">
              <div className="text-gray-400 mb-1">✓</div>
              <p className="text-gray-600 text-xs">Verificado</p>
            </div>
            <div className="text-sm">
              <div className="text-gray-400 mb-1">🛡️</div>
              <p className="text-gray-600 text-xs">Privado</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
