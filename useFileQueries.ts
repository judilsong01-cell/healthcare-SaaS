import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import fileService, { FileUploadResponse, FileUploadProgress } from "@/services/fileService";
import { MedicalFile } from "@/contexts/DashboardContext";

/**
 * React Query Hooks para Ficheiros
 * 
 * Design Philosophy: Gerenciamento de Upload e Download
 * - Progresso de upload
 * - Caching de ficheiros
 * - Sincronização automática
 */

// Query Keys
export const fileQueryKeys = {
  all: ["files"] as const,
  patient: (id: string) => [...fileQueryKeys.all, "patient", id] as const,
  doctor: (id: string) => [...fileQueryKeys.all, "doctor", id] as const,
  detail: (id: string) => [...fileQueryKeys.all, "detail", id] as const,
  accessLog: (id: string) => [...fileQueryKeys.all, "accessLog", id] as const,
};

/**
 * Hook para obter ficheiros do paciente
 */
export function usePatientFiles(patientId: string) {
  return useQuery({
    queryKey: fileQueryKeys.patient(patientId),
    queryFn: () => fileService.getPatientFiles(patientId),
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
    enabled: !!patientId,
  });
}

/**
 * Hook para obter ficheiros acessíveis pelo médico
 */
export function useDoctorAccessibleFiles(doctorId: string) {
  return useQuery({
    queryKey: fileQueryKeys.doctor(doctorId),
    queryFn: () => fileService.getDoctorAccessibleFiles(doctorId),
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
    enabled: !!doctorId,
  });
}

/**
 * Hook para upload de ficheiro com progresso
 */
export function useUploadFile() {
  const queryClient = useQueryClient();
  const [progress, setProgress] = React.useState<FileUploadProgress | null>(null);

  return useMutation({
    mutationFn: ({
      patientId,
      file,
      category,
      description,
    }: {
      patientId: string;
      file: File;
      category: MedicalFile["category"];
      description: string;
    }) =>
      fileService.uploadFile(patientId, file, category, description, (prog) => {
        setProgress(prog);
      }),
    onSuccess: (data, variables) => {
      // Invalidar cache de ficheiros
      queryClient.invalidateQueries({
        queryKey: fileQueryKeys.patient(variables.patientId),
      });
      setProgress(null);
    },
    onError: () => {
      setProgress(null);
    },
  });
}

/**
 * Hook para descarregar ficheiro
 */
export function useDownloadFile() {
  return useMutation({
    mutationFn: (fileId: string) => fileService.downloadFile(fileId),
    onSuccess: (blob, fileId) => {
      // Criar URL e descarregar
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `file-${fileId}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
  });
}

/**
 * Hook para eliminar ficheiro
 */
export function useDeleteFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fileId: string) => fileService.deleteFile(fileId),
    onSuccess: () => {
      // Invalidar todos os caches de ficheiros
      queryClient.invalidateQueries({
        queryKey: fileQueryKeys.all,
      });
    },
  });
}

/**
 * Hook para partilhar ficheiro
 */
export function useShareFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      fileId,
      recipientId,
      permissions,
    }: {
      fileId: string;
      recipientId: string;
      permissions?: string[];
    }) => fileService.shareFile(fileId, recipientId, permissions),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: fileQueryKeys.all,
      });
    },
  });
}

/**
 * Hook para revogar acesso a ficheiro
 */
export function useRevokeFileAccess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fileId, userId }: { fileId: string; userId: string }) =>
      fileService.revokeFileAccess(fileId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: fileQueryKeys.all,
      });
    },
  });
}

/**
 * Hook para obter histórico de acesso a ficheiro
 */
export function useFileAccessLog(fileId: string) {
  return useQuery({
    queryKey: fileQueryKeys.accessLog(fileId),
    queryFn: () => fileService.getFileAccessLog(fileId),
    staleTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
    enabled: !!fileId,
  });
}
