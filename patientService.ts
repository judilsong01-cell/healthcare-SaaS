import axiosClient from "./axiosClient";
import { Patient, MedicalFile } from "@/contexts/DashboardContext";

/**
 * Patient Service
 * 
 * Design Philosophy: Camada de Abstração
 * - Centraliza chamadas relacionadas a pacientes
 * - Tipagem completa com TypeScript
 * - Tratamento de erros robusto
 */

export interface PatientResponse extends Patient {
  id: string;
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  medicalHistory?: string[];
}

export interface HealthCheckIn {
  id?: string;
  patientId: string;
  temperature?: number;
  painLevel?: number;
  symptoms?: string[];
  notes?: string;
  timestamp?: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  instructions?: string;
  taken?: boolean;
  takenAt?: string;
}

class PatientService {
  /**
   * Obter dados do paciente
   */
  async getPatient(patientId: string): Promise<PatientResponse> {
    const response = await axiosClient.get<PatientResponse>(`/patients/${patientId}`);
    return response.data;
  }

  /**
   * Atualizar dados do paciente
   */
  async updatePatient(patientId: string, data: Partial<PatientResponse>): Promise<PatientResponse> {
    const response = await axiosClient.put<PatientResponse>(`/patients/${patientId}`, data);
    return response.data;
  }

  /**
   * Obter medicações do paciente
   */
  async getMedications(patientId: string): Promise<Medication[]> {
    const response = await axiosClient.get<Medication[]>(`/patients/${patientId}/medications`);
    return response.data;
  }

  /**
   * Registar medicação tomada
   */
  async recordMedication(
    patientId: string,
    medicationId: string,
    timestamp: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await axiosClient.post(
      `/patients/${patientId}/medications/${medicationId}/record`,
      { timestamp }
    );
    return response.data;
  }

  /**
   * Submeter check-in de saúde
   */
  async submitHealthCheckIn(patientId: string, checkInData: HealthCheckIn): Promise<HealthCheckIn> {
    const response = await axiosClient.post<HealthCheckIn>(
      `/patients/${patientId}/check-ins`,
      checkInData
    );
    return response.data;
  }

  /**
   * Obter histórico de check-ins
   */
  async getCheckInHistory(patientId: string, limit: number = 10): Promise<HealthCheckIn[]> {
    const response = await axiosClient.get<HealthCheckIn[]>(
      `/patients/${patientId}/check-ins?limit=${limit}`
    );
    return response.data;
  }

  /**
   * Obter progresso de recuperação
   */
  async getRecoveryProgress(patientId: string): Promise<{
    percentage: number;
    stage: string;
    estimatedCompletion: string;
    milestones: Array<{ name: string; completed: boolean; date?: string }>;
  }> {
    const response = await axiosClient.get(
      `/patients/${patientId}/recovery-progress`
    );
    return response.data;
  }

  /**
   * Obter alertas do paciente
   */
  async getAlerts(patientId: string): Promise<Array<{
    id: string;
    type: "warning" | "info" | "error";
    message: string;
    timestamp: string;
    read: boolean;
  }>> {
    const response = await axiosClient.get(
      `/patients/${patientId}/alerts`
    );
    return response.data;
  }

  /**
   * Marcar alerta como lido
   */
  async markAlertAsRead(patientId: string, alertId: string): Promise<void> {
    await axiosClient.patch(`/patients/${patientId}/alerts/${alertId}/read`);
  }
}

export default new PatientService();
