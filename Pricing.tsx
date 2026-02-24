import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Link } from "wouter";

/**
 * Pricing Page - Health SaaS Platform
 * Design Philosophy: Swiss Minimalism + Clinical Trust
 * - Three pricing tiers: Básico, Profissional, Enterprise
 * - Comparison table with feature matrix
 * - Highlight recommended plan (Profissional)
 * - Clear value proposition for each tier
 */

export default function Pricing() {
  const plans = [
    {
      name: "Básico",
      description: "Para pacientes individuais",
      price: "0€",
      period: "sempre gratuito",
      cta: "Começar agora",
      highlighted: false,
      features: [
        "Controlo de medicação",
        "Check-ins diários",
        "Histórico clínico",
        "Até 1 médico",
        "Suporte por email",
      ],
      notIncluded: [
        "Alertas automáticos",
        "Upload de fotos",
        "Relatórios avançados",
        "Prioridade no suporte",
      ],
    },
    {
      name: "Profissional",
      description: "Para clínicas e consultórios",
      price: "49€",
      period: "por mês",
      cta: "Começar teste gratuito",
      highlighted: true,
      badge: "Mais popular",
      features: [
        "Tudo do plano Básico",
        "Alertas automáticos",
        "Upload de fotos seguro",
        "Até 10 médicos",
        "Relatórios mensais",
        "Suporte prioritário",
        "API básica",
      ],
      notIncluded: ["Integrações customizadas", "SLA garantido"],
    },
    {
      name: "Enterprise",
      description: "Para grandes instituições",
      price: "Personalizado",
      period: "contacte-nos",
      cta: "Agendar demonstração",
      highlighted: false,
      features: [
        "Tudo do plano Profissional",
        "Integrações customizadas",
        "Médicos ilimitados",
        "SLA garantido 99.9%",
        "Suporte 24/7",
        "Servidor dedicado",
        "Conformidade regulatória completa",
        "Treinamento da equipa",
      ],
      notIncluded: [],
    },
  ];

  const comparisonFeatures = [
    { name: "Controlo de medicação", basic: true, pro: true, enterprise: true },
    { name: "Check-ins diários", basic: true, pro: true, enterprise: true },
    { name: "Histórico clínico", basic: true, pro: true, enterprise: true },
    { name: "Alertas automáticos", basic: false, pro: true, enterprise: true },
    { name: "Upload de fotos", basic: false, pro: true, enterprise: true },
    { name: "Relatórios avançados", basic: false, pro: true, enterprise: true },
    { name: "API básica", basic: false, pro: true, enterprise: true },
    { name: "Integrações customizadas", basic: false, pro: false, enterprise: true },
    { name: "Suporte prioritário", basic: false, pro: true, enterprise: true },
    { name: "Suporte 24/7", basic: false, pro: false, enterprise: true },
    { name: "SLA garantido", basic: false, pro: false, enterprise: true },
    { name: "Servidor dedicado", basic: false, pro: false, enterprise: true },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <nav className="container flex items-center justify-between h-16">
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
          <div className="flex items-center gap-3">
            <Link href="/">
              <a className="text-gray-700 hover:text-blue-600 transition-colors">
                Voltar
              </a>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Preços simples e transparentes
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">
            Escolha o plano perfeito para as suas necessidades. Sem contratos de
            longa duração, cancele quando quiser.
          </p>
          <p className="text-sm text-gray-500">
            Todos os planos incluem período de teste de 14 dias sem cartão de crédito
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 md:py-20">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <div key={index} className="relative">
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      {plan.badge}
                    </span>
                  </div>
                )}
                <Card
                  className={`p-8 flex flex-col h-full transition-all ${
                    plan.highlighted
                      ? "border-blue-600 shadow-lg scale-105 md:scale-100"
                      : "border-gray-200 hover-lift"
                  }`}
                >
                  {/* Plan Header */}
                  <div className="mb-6">
                    <h3 className="font-heading text-2xl font-semibold text-gray-900 mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-sm text-gray-600">{plan.description}</p>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="font-display text-4xl font-bold text-gray-900">
                        {plan.price}
                      </span>
                      <span className="text-gray-600 text-sm">/{plan.period}</span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Button
                    className={`w-full mb-8 h-12 text-base font-semibold ${
                      plan.highlighted
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                    variant={plan.highlighted ? "default" : "outline"}
                  >
                    {plan.cta}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>

                  {/* Features List */}
                  <div className="space-y-4 flex-1">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </div>
                    ))}

                    {/* Not Included Features */}
                    {plan.notIncluded.length > 0 && (
                      <div className="pt-4 border-t border-gray-200">
                        {plan.notIncluded.map((feature, i) => (
                          <div key={i} className="flex items-start gap-3 mb-3 opacity-50">
                            <div className="w-5 h-5 border-2 border-gray-300 rounded-full flex-shrink-0 mt-0.5" />
                            <span className="text-gray-500 text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 md:py-32 bg-gray-50">
        <div className="container">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
            Comparação completa de funcionalidades
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-6 font-heading font-semibold text-gray-900">
                    Funcionalidade
                  </th>
                  <th className="text-center py-4 px-6 font-heading font-semibold text-gray-900">
                    Básico
                  </th>
                  <th className="text-center py-4 px-6 font-heading font-semibold text-gray-900">
                    Profissional
                  </th>
                  <th className="text-center py-4 px-6 font-heading font-semibold text-gray-900">
                    Enterprise
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((feature, index) => (
                  <tr
                    key={index}
                    className={`border-b border-gray-200 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-100"
                    }`}
                  >
                    <td className="py-4 px-6 text-gray-900 font-medium">
                      {feature.name}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {feature.basic ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />
                      ) : (
                        <div className="w-5 h-5 border-2 border-gray-300 rounded-full mx-auto" />
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {feature.pro ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />
                      ) : (
                        <div className="w-5 h-5 border-2 border-gray-300 rounded-full mx-auto" />
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {feature.enterprise ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />
                      ) : (
                        <div className="w-5 h-5 border-2 border-gray-300 rounded-full mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container max-w-3xl">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
            Perguntas frequentes
          </h2>

          <div className="space-y-6">
            {[
              {
                q: "Posso mudar de plano a qualquer momento?",
                a: "Sim, pode fazer upgrade ou downgrade do seu plano a qualquer momento. As alterações entram em vigor imediatamente.",
              },
              {
                q: "Qual é a política de cancelamento?",
                a: "Pode cancelar a sua subscrição a qualquer momento, sem penalidades. O acesso termina no final do período de faturação.",
              },
              {
                q: "Oferecem período de teste?",
                a: "Sim, todos os planos incluem 14 dias de teste gratuito, sem necessidade de cartão de crédito.",
              },
              {
                q: "Qual é o suporte disponível?",
                a: "O plano Básico inclui suporte por email. Profissional oferece suporte prioritário, e Enterprise inclui suporte 24/7.",
              },
              {
                q: "Posso integrar com outros sistemas?",
                a: "Sim, o plano Profissional inclui API básica. Enterprise oferece integrações customizadas conforme necessário.",
              },
            ].map((faq, index) => (
              <div key={index} className="border-b border-gray-200 pb-6">
                <h3 className="font-heading text-lg font-semibold text-gray-900 mb-3">
                  {faq.q}
                </h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 md:py-32 bg-blue-600">
        <div className="container text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-6">
            Pronto para começar?
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Escolha o plano perfeito e comece a melhorar a recuperação dos seus
            pacientes hoje mesmo.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-white hover:bg-gray-100 text-blue-600 h-12 px-8 text-base font-semibold">
              Começar teste gratuito
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              className="border-white text-white hover:bg-blue-700 h-12 px-8 text-base"
            >
              Contactar vendas
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container text-center">
          <p className="text-sm mb-4">
            © 2026 HealthCare. Todos os direitos reservados.
          </p>
          <div className="flex gap-6 justify-center text-sm">
            <a href="#" className="hover:text-white transition-colors">
              Privacidade
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Termos
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Contacto
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
