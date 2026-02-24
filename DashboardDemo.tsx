import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, AlertCircle, Camera, Plus } from "lucide-react";

/**
 * Interactive Dashboard Demo Component
 * Design Philosophy: Clean, minimalist interface with clear visual feedback
 * - Medication schedule with toggle state
 * - Daily health check-in form
 * - Wound photo upload area
 * - Symptom questionnaire
 */

export default function DashboardDemo() {
  const [medications, setMedications] = useState([
    { id: 1, name: "Amoxicilina", time: "08:00", taken: true },
    { id: 2, name: "Paracetamol", time: "12:00", taken: false },
    { id: 3, name: "Ibuprofeno", time: "18:00", taken: false },
  ]);

  const [symptoms, setSymptoms] = useState({
    fever: false,
    redness: false,
    swelling: false,
    discharge: false,
  });

  const [formData, setFormData] = useState({
    temperature: "",
    painLevel: "",
    activity: "",
  });

  const toggleMedication = (id: number) => {
    setMedications(
      medications.map((med) =>
        med.id === id ? { ...med, taken: !med.taken } : med
      )
    );
  };

  const toggleSymptom = (key: keyof typeof symptoms) => {
    setSymptoms({ ...symptoms, [key]: !symptoms[key] });
  };

  return (
    <div className="space-y-8">
      {/* Doctor Info Header */}
      <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-transparent rounded-lg border border-blue-100">
        <div>
          <h3 className="font-heading text-lg font-semibold text-gray-900">
            Acompanhamento Pós-Operatório
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Médico: Dr. Silva | Cirurgia: 15 de janeiro de 2026
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Dia 5 de recuperação</p>
          <p className="text-2xl font-bold text-green-600 mt-1">85%</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Medication Schedule */}
          <Card className="p-6 border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" strokeWidth={1.5} />
              </div>
              <h4 className="font-heading text-lg font-semibold text-gray-900">
                Medicação do dia
              </h4>
            </div>

            <div className="space-y-3">
              {medications.map((med) => (
                <div
                  key={med.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <button
                      onClick={() => toggleMedication(med.id)}
                      className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                        med.taken
                          ? "bg-green-600 border-green-600"
                          : "border-gray-300 hover:border-green-600"
                      }`}
                    >
                      {med.taken && (
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      )}
                    </button>
                    <div className="flex-1">
                      <p
                        className={`font-medium ${
                          med.taken ? "text-gray-500 line-through" : "text-gray-900"
                        }`}
                      >
                        {med.name}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-600 font-medium">
                    {med.time}
                  </span>
                </div>
              ))}
            </div>

            <Button className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white">
              Confirmar medicação
            </Button>
          </Card>

          {/* Symptoms Questionnaire */}
          <Card className="p-6 border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" strokeWidth={1.5} />
              </div>
              <h4 className="font-heading text-lg font-semibold text-gray-900">
                Sintomas
              </h4>
            </div>

            <div className="space-y-3">
              {[
                { key: "fever", label: "Febre" },
                { key: "redness", label: "Vermelhidão" },
                { key: "swelling", label: "Inchaço" },
                { key: "discharge", label: "Secreção" },
              ].map(({ key, label }) => (
                <label
                  key={key}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={symptoms[key as keyof typeof symptoms]}
                    onChange={() => toggleSymptom(key as keyof typeof symptoms)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer"
                  />
                  <span className="text-gray-700">{label}</span>
                </label>
              ))}
            </div>

            <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white">
              Enviar resposta
            </Button>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Daily Health Check-in */}
          <Card className="p-6 border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <Plus className="w-5 h-5 text-green-600" strokeWidth={1.5} />
              </div>
              <h4 className="font-heading text-lg font-semibold text-gray-900">
                Check-in diário
              </h4>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Temperatura (°C)
                </label>
                <input
                  type="number"
                  placeholder="37.5"
                  value={formData.temperature}
                  onChange={(e) =>
                    setFormData({ ...formData, temperature: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nível de dor (1-10)
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.painLevel}
                  onChange={(e) =>
                    setFormData({ ...formData, painLevel: e.target.value })
                  }
                  className="w-full"
                />
                {formData.painLevel && (
                  <p className="text-sm text-gray-600 mt-2">
                    Dor: {formData.painLevel}/10
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nível de atividade
                </label>
                <select
                  value={formData.activity}
                  onChange={(e) =>
                    setFormData({ ...formData, activity: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="">Selecione...</option>
                  <option value="repouso">Repouso completo</option>
                  <option value="leve">Atividade leve</option>
                  <option value="moderada">Atividade moderada</option>
                </select>
              </div>
            </div>

            <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white">
              Submeter check-in
            </Button>
          </Card>

          {/* Wound Photo Upload */}
          <Card className="p-6 border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Camera className="w-5 h-5 text-blue-600" strokeWidth={1.5} />
              </div>
              <h4 className="font-heading text-lg font-semibold text-gray-900">
                Foto da ferida
              </h4>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-600 transition-colors cursor-pointer">
              <Camera className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-2">
                Clique para carregar foto
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG até 5MB
              </p>
            </div>

            <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white">
              Carregar imagem
            </Button>
          </Card>
        </div>
      </div>

      {/* Alert Example */}
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-red-900">Alerta importante</p>
          <p className="text-sm text-red-700 mt-1">
            Se observar febre acima de 38°C ou secreção anormal, contacte o seu médico imediatamente.
          </p>
        </div>
      </div>
    </div>
  );
}
