import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";

/**
 * Testimonials Component
 * Design Philosophy: Swiss Minimalism + Clinical Trust
 * - Real-world quotes from doctors, patients, and clinic managers
 * - Star ratings for credibility
 * - Minimal design with focus on content
 * - Alternating layout for visual interest
 */

interface Testimonial {
  id: number;
  name: string;
  role: string;
  quote: string;
  rating: number;
  image: string;
  type: "doctor" | "patient" | "clinic";
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Dr. Carlos Silva",
    role: "Cirurgião Geral",
    quote:
      "A plataforma transformou completamente como acompanho os meus pacientes pós-operatórios. Reduzi as complicações em 40% e os pacientes sentem-se muito mais seguros.",
    rating: 5,
    image: "👨‍⚕️",
    type: "doctor",
  },
  {
    id: 2,
    name: "Maria Santos",
    role: "Paciente pós-cirurgia",
    quote:
      "Adorei usar a plataforma. Os lembretes de medicação ajudaram-me a não esquecer nada, e o check-in diário deu-me confiança de que estava a recuperar bem.",
    rating: 5,
    image: "👩",
    type: "patient",
  },
  {
    id: 3,
    name: "João Pereira",
    role: "Gerente de Clínica",
    quote:
      "Implementámos em toda a clínica e os resultados foram imediatos. Melhor eficiência, menos chamadas de emergência, e pacientes mais satisfeitos.",
    rating: 5,
    image: "👨‍💼",
    type: "clinic",
  },
  {
    id: 4,
    name: "Dra. Ana Costa",
    role: "Cirurgiã Plástica",
    quote:
      "Os alertas automáticos são incríveis. Consigo identificar problemas antes que se tornem graves. É como ter um assistente 24/7.",
    rating: 5,
    image: "👩‍⚕️",
    type: "doctor",
  },
  {
    id: 5,
    name: "Pedro Oliveira",
    role: "Paciente pós-cirurgia",
    quote:
      "Simples, intuitivo e muito útil. Senti-me acompanhado durante toda a recuperação. Recomendo a todos os meus amigos.",
    rating: 5,
    image: "👨",
    type: "patient",
  },
  {
    id: 6,
    name: "Clínica Saúde Plus",
    role: "Coordenadora de Enfermagem",
    quote:
      "Reduzimos significativamente o tempo de follow-up manual. Os dados estão centralizados e acessíveis. Investimento que valeu muito a pena.",
    rating: 5,
    image: "👩‍⚕️",
    type: "clinic",
  },
];

export default function Testimonials() {
  const doctorTestimonials = testimonials.filter((t) => t.type === "doctor");
  const patientTestimonials = testimonials.filter((t) => t.type === "patient");
  const clinicTestimonials = testimonials.filter((t) => t.type === "clinic");

  const TestimonialCard = ({ testimonial }: { testimonial: Testimonial }) => (
    <Card className="p-6 border-gray-200 hover-lift">
      {/* Stars */}
      <div className="flex gap-1 mb-4">
        {[...Array(testimonial.rating)].map((_, i) => (
          <Star
            key={i}
            className="w-5 h-5 fill-yellow-400 text-yellow-400"
          />
        ))}
      </div>

      {/* Quote */}
      <p className="text-gray-700 mb-6 leading-relaxed italic">
        "{testimonial.quote}"
      </p>

      {/* Author */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
          {testimonial.image}
        </div>
        <div>
          <p className="font-semibold text-gray-900">{testimonial.name}</p>
          <p className="text-sm text-gray-600">{testimonial.role}</p>
        </div>
      </div>
    </Card>
  );

  return (
    <section className="py-20 md:py-32 bg-white">
      <div className="container">
        {/* Section Header */}
        <div className="flex flex-col gap-4 mb-16 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900">
            O que dizem os nossos utilizadores
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Médicos, pacientes e clínicas confiam na HealthCare para melhorar
            resultados e experiências.
          </p>
        </div>

        {/* Doctors Section */}
        <div className="mb-16">
          <h3 className="font-heading text-2xl font-semibold text-gray-900 mb-8">
            👨‍⚕️ Médicos
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            {doctorTestimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </div>
        </div>

        {/* Patients Section */}
        <div className="mb-16">
          <h3 className="font-heading text-2xl font-semibold text-gray-900 mb-8">
            👥 Pacientes
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            {patientTestimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </div>
        </div>

        {/* Clinics Section */}
        <div>
          <h3 className="font-heading text-2xl font-semibold text-gray-900 mb-8">
            🏥 Clínicas
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            {clinicTestimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 grid md:grid-cols-3 gap-8 bg-gray-50 p-8 rounded-lg">
          <div className="text-center">
            <p className="font-display text-4xl font-bold text-blue-600 mb-2">
              500+
            </p>
            <p className="text-gray-600">Utilizadores ativos</p>
          </div>
          <div className="text-center">
            <p className="font-display text-4xl font-bold text-green-600 mb-2">
              98%
            </p>
            <p className="text-gray-600">Taxa de satisfação</p>
          </div>
          <div className="text-center">
            <p className="font-display text-4xl font-bold text-blue-600 mb-2">
              40%
            </p>
            <p className="text-gray-600">Redução de complicações</p>
          </div>
        </div>
      </div>
    </section>
  );
}
