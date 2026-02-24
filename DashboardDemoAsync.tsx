import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, AlertCircle, Camera, Plus, Loader2 } from "lucide-react";
import { api, ApiError } from "@/services/api";

/**
 * Dashboard Demo Async Component
 * 
 * Design Philosophy: Integração com Backend
 * - Utiliza API Service Layer
 * - Suporta chamadas assíncronas
 * - Tratamento de erros robusto
 * - Estados de loading e erro
 * - Pronto para integração com backend real
 */

interface MedicationItem {
  id: string;
  name: string;
  time: string;
  taken: boolean;
}

interface HealthCheckInData {
  temperature?: number;
  painLevel?: number;
  symptoms?: string[];
}

export function DashboardDemoAsync() {
  const [medications, setMedications] = useState<MedicationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [checkInData, setCheckInData] = useState<HealthCheckInData>({
    temperature: undefined,
    painLevel: undefined,
    symptoms: [],
  });

  // Simular carregamento de medicações
  useEffect(() => {
    loadMedications();
  }, []);

  const loadMedications = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Simular chamada de API
      // const response = await api.patient.getMedications(patientId);
      // setMedications(response.data || []);

      // Por enquanto, usar dados simulados
      const simulatedMeds: MedicationItem[] = [
        { id: "1", name: "Antibiótico", time: "8:00 AM", taken: true },
        { id: "2", name: "Analgésico", time: "12:00 PM", taken: false },
        { id: "3", name: "Anti-inflamatório", time: "6:00 PM", taken: false },
      ];
      setMedications(simulatedMeds);
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : "Erro ao carregar medicações";
      setError(errorMessage);
      console.error("Failed to load medications:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMedicationToggle = async (medicationId: string) => {
    setError(null);
    try {
      // Simular chamada de API
      // const response = await api.patient.recordMedication(patientId, medicationId, new Date().toISOString());

      // Atualizar estado localmente
      setMedications((prevMeds) =>
        prevMeds.map((med) =>
          med.id === medicationId ? { ...med, taken: !med.taken } : med
        )
      );

      setSuccessMessage("Medicação registada com sucesso!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : "Erro ao registar medicação";
      setError(errorMessage);
      console.error("Failed to record medication:", err);
    }
  };

  const handleCheckInSubmit = async () => {
    setError(null);
    setIsLoading(true);
    try {
      // Simular chamada de API
      // const response = await api.patient.submitHealthCheckIn(patientId, checkInData);

      setSuccessMessage("Check-in de saúde submetido com sucesso!");
      setCheckInData({ temperature: undefined, painLevel: undefined, symptoms: [] });
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : "Erro ao submeter check-in";
      setError(errorMessage);
      console.error("Failed to submit health check-in:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-700">{successMessage}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <p className="ml-2 text-gray-600">Carregando...</p>
        </div>
      )}

      {/* Medication Schedule */}
      <Card className="p-6 border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-lg font-semibold text-gray-900">Medicação do Dia</h3>
          <Button
            onClick={loadMedications}
            disabled={isLoading}
            variant="outline"
            className="border-gray-300 text-gray-700"
          >
            <Loader2 className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>

        <div className="space-y-2">
          {medications.map((med) => (
            <div
              key={med.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors ${
                    med.taken
                      ? "bg-green-600 border-green-600"
                      : "border-gray-300 hover:border-green-600"
                  }`}
                  onClick={() => handleMedicationToggle(med.id)}
                >
                  {med.taken && <CheckCircle2 className="w-3 h-3 text-white" />}
                </div>
                <div>
                  <p className={`font-medium ${med.taken ? "line-through text-gray-500" : "text-gray-900"}`}>
                    {med.name}
                  </p>
                  <p className="text-xs text-gray-600 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {med.time}
                  </p>
                </div>
              </div>
              <div className="text-xs font-medium text-gray-600">
                {med.taken ? "✓ Tomado" : "Pendente"}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Health Check-In */}
      <Card className="p-6 border-gray-200">
        <h3 className="font-heading text-lg font-semibold text-gray-900 mb-4">Check-in de Saúde</h3>

        <div className="space-y-4">
          {/* Temperature */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Temperatura (°C)</label>
            <input
              type="number"
              value={checkInData.temperature || ""}
              onChange={(e) =>
                setCheckInData({
                  ...checkInData,
                  temperature: e.target.value ? parseFloat(e.target.value) : undefined,
                })
              }
              placeholder="37.5"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Pain Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nível de Dor (1-10)</label>
            <input
              type="number"
              min="1"
              max="10"
              value={checkInData.painLevel || ""}
              onChange={(e) =>
                setCheckInData({
                  ...checkInData,
                  painLevel: e.target.value ? parseInt(e.target.value) : undefined,
                })
              }
              placeholder="5"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Symptoms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sintomas</label>
            <div className="space-y-2">
              {["Febre", "Vermelhidão", "Inchaço", "Descarga"].map((symptom) => (
                <label key={symptom} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkInData.symptoms?.includes(symptom) || false}
                    onChange={(e) => {
                      const newSymptoms = e.target.checked
                        ? [...(checkInData.symptoms || []), symptom]
                        : (checkInData.symptoms || []).filter((s) => s !== symptom);
                      setCheckInData({ ...checkInData, symptoms: newSymptoms });
                    }}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                  />
                  <span className="text-sm text-gray-700">{symptom}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleCheckInSubmit}
            disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submetendo...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Submeter Check-in
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Photo Upload */}
      <Card className="p-6 border-gray-200">
        <h3 className="font-heading text-lg font-semibold text-gray-900 mb-4">Upload de Foto da Ferida</h3>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-600 transition-colors cursor-pointer">
          <Camera className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium mb-1">Clique ou arraste para enviar foto</p>
          <p className="text-sm text-gray-500">Máximo 10MB</p>
        </div>
      </Card>
    </div>
  );
}
