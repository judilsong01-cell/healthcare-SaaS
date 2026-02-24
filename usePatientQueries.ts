import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import patientService, { PatientResponse, Medication, HealthCheckIn } from "@/services/patientService";

/**
 * React Query Hooks para Pacientes
 * 
 * Design Philosophy: Gerenciamento de Estado Centralizado
 * - Caching automático
 * - Sincronização com servidor
 * - Tratamento de erros
 * - Loading states
 */

// Query Keys
export const patientQueryKeys = {
  all: ["patient"] as const,
  detail: (id: string) => [...patientQueryKeys.all, "detail", id] as const,
  medications: (id: string) => [...patientQueryKeys.all, "medications", id] as const,
  checkIns: (id: string) => [...patientQueryKeys.all, "checkIns", id] as const,
  progress: (id: string) => [...patientQueryKeys.all, "progress", id] as const,
  alerts: (id: string) => [...patientQueryKeys.all, "alerts", id] as const,
};

/**
 * Hook para obter dados do paciente
 */
export function usePatient(patientId: string) {
  return useQuery({
    queryKey: patientQueryKeys.detail(patientId),
    queryFn: () => patientService.getPatient(patientId),
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 3,
    enabled: !!patientId,
  });
}

/**
 * Hook para atualizar dados do paciente
 */
export function useUpdatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ patientId, data }: { patientId: string; data: Partial<PatientResponse> }) =>
      patientService.updatePatient(patientId, data),
    onSuccess: (data) => {
      queryClient.setQueryData(patientQueryKeys.detail(data.id), data);
    },
  });
}

/**
 * Hook para obter medicações
 */
export function useMedications(patientId: string) {
  return useQuery({
    queryKey: patientQueryKeys.medications(patientId),
    queryFn: () => patientService.getMedications(patientId),
    staleTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
    enabled: !!patientId,
  });
}

/**
 * Hook para registar medicação tomada
 */
export function useRecordMedication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      patientId,
      medicationId,
      timestamp,
    }: {
      patientId: string;
      medicationId: string;
      timestamp: string;
    }) => patientService.recordMedication(patientId, medicationId, timestamp),
    onSuccess: (_, variables) => {
      // Invalidar cache de medicações
      queryClient.invalidateQueries({
        queryKey: patientQueryKeys.medications(variables.patientId),
      });
    },
  });
}

/**
 * Hook para submeter check-in de saúde
 */
export function useSubmitHealthCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ patientId, checkInData }: { patientId: string; checkInData: HealthCheckIn }) =>
      patientService.submitHealthCheckIn(patientId, checkInData),
    onSuccess: (_, variables) => {
      // Invalidar cache de check-ins e progresso
      queryClient.invalidateQueries({
        queryKey: patientQueryKeys.checkIns(variables.patientId),
      });
      queryClient.invalidateQueries({
        queryKey: patientQueryKeys.progress(variables.patientId),
      });
    },
  });
}

/**
 * Hook para obter histórico de check-ins
 */
export function useCheckInHistory(patientId: string, limit?: number) {
  return useQuery({
    queryKey: patientQueryKeys.checkIns(patientId),
    queryFn: () => patientService.getCheckInHistory(patientId, limit),
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
    enabled: !!patientId,
  });
}

/**
 * Hook para obter progresso de recuperação
 */
export function useRecoveryProgress(patientId: string) {
  return useQuery({
    queryKey: patientQueryKeys.progress(patientId),
    queryFn: () => patientService.getRecoveryProgress(patientId),
    staleTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
    enabled: !!patientId,
  });
}

/**
 * Hook para obter alertas
 */
export function usePatientAlerts(patientId: string) {
  return useQuery({
    queryKey: patientQueryKeys.alerts(patientId),
    queryFn: () => patientService.getAlerts(patientId),
    staleTime: 1 * 60 * 1000, // 1 minuto
    retry: 2,
    enabled: !!patientId,
  });
}

/**
 * Hook para marcar alerta como lido
 */
export function useMarkAlertAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ patientId, alertId }: { patientId: string; alertId: string }) =>
      patientService.markAlertAsRead(patientId, alertId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: patientQueryKeys.alerts(variables.patientId),
      });
    },
  });
}
