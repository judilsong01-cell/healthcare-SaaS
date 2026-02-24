import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Testimonials from "@/components/Testimonials";
import { Link } from "wouter";
import {
  Clock,
  AlertCircle,
  FileText,
  Camera,
  Pill,
  CheckCircle2,
  ArrowRight,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

/**
 * Health SaaS Landing Page - Post-Operative Care & Medication Management
 * Design Philosophy: Swiss Minimalism + Clinical Trust
 * - Clean typography hierarchy (Poppins headlines, Inter body)
 * - Clinical blue (#0066CC) + health green (#10B981)
 * - Generous whitespace, minimal shadows, stroke-based icons
 * - Fade-in animations on scroll, subtle hover effects
 */

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <nav className="container flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Pill className="w-5 h-5 text-white" strokeWidth={1.5} />
            </div>
            <span className="font-display text-xl font-bold text-gray-900">
              HealthCare
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Funcionalidades
            </a>
            <a
              href="#clinics"
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Para Clínicas
            </a>
            <a
              href="#patients"
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Para Pacientes
            </a>
            <a
              href="#security"
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Segurança
            </a>
            <Link href="/pricing">
              <a className="text-gray-700 hover:text-blue-600 transition-colors">
                Preços
              </a>
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/auth">
              <a>
                <Button
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Entrar
                </Button>
              </a>
            </Link>
            <Link href="/auth">
              <a>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Criar conta
                </Button>
              </a>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="container py-4 flex flex-col gap-4">
              <a href="#features" className="text-gray-700 hover:text-blue-600">
                Funcionalidades
              </a>
              <a href="#clinics" className="text-gray-700 hover:text-blue-600">
                Para Clínicas
              </a>
              <a href="#patients" className="text-gray-700 hover:text-blue-600">
                Para Pacientes
              </a>
              <a href="#security" className="text-gray-700 hover:text-blue-600">
                Segurança
              </a>
              <Link href="/pricing">
                <a className="text-gray-700 hover:text-blue-600">
                  Preços
                </a>
              </Link>
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Link href="/auth">
                  <a className="flex-1">
                    <Button
                      variant="outline"
                      className="flex-1 border-gray-300 text-gray-700"
                    >
                      Entrar
                    </Button>
                  </a>
                </Link>
                <Link href="/auth">
                  <a className="flex-1">
                    <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                      Criar conta
                    </Button>
                  </a>
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        {/* Background Pattern */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: "url('/images/hero-background.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        <div className="container relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Headline & CTA */}
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-4">
                <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                  Acompanhamento pós-operatório e controlo de medicamentos,{" "}
                  <span className="text-blue-600">em tempo real.</span>
                </h1>
                <p className="text-lg text-gray-600 leading-relaxed max-w-lg">
                  Ajude pacientes a recuperar melhor, reduza complicações e
                  melhore a adesão ao tratamento com uma plataforma simples e
                  segura.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth">
                  <a>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white h-12 px-8 text-base">
                      Começar acompanhamento
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </a>
                </Link>
                <Button
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 h-12 px-8 text-base"
                >
                  Ver como funciona
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-col gap-3 pt-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  Dados criptografados e seguros
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  Sem cartão de crédito no início
                </div>
              </div>
            </div>

            {/* Right: Dashboard Preview */}
            <div className="hidden md:block">
              <img
                src="/images/hero-dashboard-preview.png"
                alt="Dashboard Preview"
                className="w-full rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32 bg-gray-50">
        <div className="container">
          <div className="flex flex-col gap-4 mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900">
              Funcionalidades principais
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl">
              Tudo que você precisa para gerir a recuperação pós-operatória de
              forma eficiente e segura.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="p-8 border-gray-200 hover-lift">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Pill className="w-6 h-6 text-blue-600" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <h3 className="font-heading text-lg font-semibold text-gray-900 mb-2">
                    Controlo de medicação
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Lembretes automáticos e rastreamento de doses com confirmação
                    visual de medicação tomada.
                  </p>
                </div>
              </div>
            </Card>

            {/* Feature 2 */}
            <Card className="p-8 border-gray-200 hover-lift">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-green-600" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <h3 className="font-heading text-lg font-semibold text-gray-900 mb-2">
                    Check-ins diários
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Questionários rápidos de sintomas e vitais para monitorização
                    contínua da recuperação.
                  </p>
                </div>
              </div>
            </Card>

            {/* Feature 3 */}
            <Card className="p-8 border-gray-200 hover-lift">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-red-600" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <h3 className="font-heading text-lg font-semibold text-gray-900 mb-2">
                    Alertas automáticos
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Notificações em tempo real para médicos quando há sinais de
                    complicações.
                  </p>
                </div>
              </div>
            </Card>

            {/* Feature 4 */}
            <Card className="p-8 border-gray-200 hover-lift">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Camera className="w-6 h-6 text-blue-600" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <h3 className="font-heading text-lg font-semibold text-gray-900 mb-2">
                    Upload de fotos
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Partilha segura de imagens da ferida para avaliação remota
                    pelo médico.
                  </p>
                </div>
              </div>
            </Card>

            {/* Feature 5 */}
            <Card className="p-8 border-gray-200 hover-lift">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-green-600" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <h3 className="font-heading text-lg font-semibold text-gray-900 mb-2">
                    Histórico clínico
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Organização completa de dados do paciente, acessível a
                    qualquer momento.
                  </p>
                </div>
              </div>
            </Card>

            {/* Feature 6 */}
            <Card className="p-8 border-gray-200 hover-lift">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-blue-600" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <h3 className="font-heading text-lg font-semibold text-gray-900 mb-2">
                    Monitorização remota
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Acompanhamento contínuo sem necessidade de deslocações
                    presenciais.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container">
          <div className="flex flex-col gap-4 mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900">
              Como funciona
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl">
              Um fluxo simples que conecta médicos, pacientes e dados de forma
              segura.
            </p>
          </div>

          {/* Workflow Diagram */}
          <div className="mb-12">
            <img
              src="/images/workflow-diagram.png"
              alt="Workflow Diagram"
              className="w-full rounded-lg"
            />
          </div>

          {/* Step-by-step Details */}
          <div className="grid md:grid-cols-2 gap-12">
            <div className="flex flex-col gap-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-600 text-white font-bold">
                    1
                  </div>
                </div>
                <div>
                  <h3 className="font-heading text-lg font-semibold text-gray-900 mb-2">
                    Médico cria plano
                  </h3>
                  <p className="text-gray-600">
                    O médico define o plano pós-operatório personalizado para cada
                    paciente.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-green-600 text-white font-bold">
                    2
                  </div>
                </div>
                <div>
                  <h3 className="font-heading text-lg font-semibold text-gray-900 mb-2">
                    Paciente recebe acesso
                  </h3>
                  <p className="text-gray-600">
                    O paciente recebe um código de acesso e começa a usar a
                    plataforma imediatamente.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-600 text-white font-bold">
                    3
                  </div>
                </div>
                <div>
                  <h3 className="font-heading text-lg font-semibold text-gray-900 mb-2">
                    Sistema envia lembretes
                  </h3>
                  <p className="text-gray-600">
                    Notificações automáticas para medicação e check-ins diários.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-red-600 text-white font-bold">
                    4
                  </div>
                </div>
                <div>
                  <h3 className="font-heading text-lg font-semibold text-gray-900 mb-2">
                    Alertas automáticos
                  </h3>
                  <p className="text-gray-600">
                    Se há sinais de complicação, o sistema alerta o médico
                    automaticamente.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-green-600 text-white font-bold">
                    5
                  </div>
                </div>
                <div>
                  <h3 className="font-heading text-lg font-semibold text-gray-900 mb-2">
                    Médico monitora remotamente
                  </h3>
                  <p className="text-gray-600">
                    Acompanhamento contínuo do progresso do paciente em
                    tempo real.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-20 md:py-32 bg-gray-50">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Segurança & Privacidade
            </h2>
            <p className="text-lg text-gray-600">
              Conformidade total com regulamentos de saúde digital e proteção de
              dados.
            </p>
          </div>

          {/* Security Features Grid */}
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <Card className="p-8 border-gray-200 hover-lift">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-semibold text-gray-900 mb-2">
                    Criptografia end-to-end
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Todos os dados do paciente são criptografados em trânsito e
                    em repouso.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-8 border-gray-200 hover-lift">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-semibold text-gray-900 mb-2">
                    Controlo de acesso
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Permissões granulares por perfil (médico, paciente, clínica).
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-8 border-gray-200 hover-lift">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-semibold text-gray-900 mb-2">
                    Consentimento explícito
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Pacientes controlam completamente quem acessa seus dados.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-8 border-gray-200 hover-lift">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-semibold text-gray-900 mb-2">
                    Conformidade regulatória
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Alinhado com boas práticas internacionais de saúde digital.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container">
          <div className="flex flex-col gap-4 mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900">
              Dashboard do paciente
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl">
              Interface simples e intuitiva para que os pacientes gerem a sua
              recuperação.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-8 border border-gray-200">
            <img
              src="/images/features-illustration.png"
              alt="Features Illustration"
              className="w-full rounded-lg"
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <Testimonials />

      {/* Final CTA Section */}
      <section className="py-20 md:py-32 bg-blue-600">
        <div className="container text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-6">
            Cuidados continuam depois da cirurgia.
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Comece a usar a plataforma hoje e melhore os resultados dos seus
            pacientes.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth">
              <a>
                <Button className="bg-white hover:bg-gray-100 text-blue-600 h-12 px-8 text-base font-semibold">
                  Criar conta gratuita
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </a>
            </Link>
            <Button
              variant="outline"
              className="border-white text-white hover:bg-blue-700 h-12 px-8 text-base"
            >
              Agendar demonstração
            </Button>
          </div>

          <p className="text-sm text-blue-100 mt-6">
            Sem cartão de crédito necessário no início
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Company Info */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Pill className="w-5 h-5 text-white" strokeWidth={1.5} />
                </div>
                <span className="font-display text-lg font-bold text-white">
                  HealthCare
                </span>
              </div>
              <p className="text-sm">
                Plataforma moderna para acompanhamento pós-operatório.
              </p>
            </div>

            {/* Product */}
            <div className="flex flex-col gap-4">
              <h4 className="font-semibold text-white">Produto</h4>
              <a href="#features" className="text-sm hover:text-white transition-colors">
                Funcionalidades
              </a>
              <Link href="/pricing">
                <a className="text-sm hover:text-white transition-colors">
                  Preços
                </a>
              </Link>
              <a href="#security" className="text-sm hover:text-white transition-colors">
                Segurança
              </a>
            </div>

            {/* Company */}
            <div className="flex flex-col gap-4">
              <h4 className="font-semibold text-white">Empresa</h4>
              <a href="#" className="text-sm hover:text-white transition-colors">
                Sobre
              </a>
              <a href="#" className="text-sm hover:text-white transition-colors">
                Blog
              </a>
              <a href="#" className="text-sm hover:text-white transition-colors">
                Contacto
              </a>
            </div>

            {/* Legal */}
            <div className="flex flex-col gap-4">
              <h4 className="font-semibold text-white">Legal</h4>
              <a href="#" className="text-sm hover:text-white transition-colors">
                Privacidade
              </a>
              <a href="#" className="text-sm hover:text-white transition-colors">
                Termos
              </a>
              <a href="#" className="text-sm hover:text-white transition-colors">
                Cookies
              </a>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm">
              © 2026 HealthCare. Todos os direitos reservados.
            </p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="text-sm hover:text-white transition-colors">
                Twitter
              </a>
              <a href="#" className="text-sm hover:text-white transition-colors">
                LinkedIn
              </a>
              <a href="#" className="text-sm hover:text-white transition-colors">
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
