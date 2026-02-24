import axiosClient from "./axiosClient";
import { MedicalFile } from "@/contexts/DashboardContext";

/**
 * File Service
 * 
 * Design Philosophy: Gerenciamento de Ficheiros Seguro
 * - Upload com FormData
 * - Validação no frontend
 * - Rastreamento de acesso
 * - Controlo de permissões
 */

export interface FileUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface FileUploadResponse extends MedicalFile {
  id: string;
  url?: string;
  encryptionKey?: string;
}

class FileService {
  /**
   * Upload de ficheiro com progresso
   */
  async uploadFile(
    patientId: string,
    file: File,
    category: MedicalFile["category"],
    description: string,
    onProgress?: (progress: FileUploadProgress) => void
  ): Promise<FileUploadResponse> {
    // Validação no frontend
    this.validateFile(file);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);
    formData.append("description", description);

    const response = await axiosClient.post<FileUploadResponse>(
      `/patients/${patientId}/files/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress?.({
              loaded: progressEvent.loaded,
              total: progressEvent.total,
              percentage: percentCompleted,
            });
          }
        },
      }
    );

    return response.data;
  }

  /**
   * Obter ficheiros do paciente
   */
  async getPatientFiles(patientId: string): Promise<MedicalFile[]> {
    const response = await axiosClient.get<MedicalFile[]>(
      `/patients/${patientId}/files`
    );
    return response.data;
  }

  /**
   * Obter ficheiros acessíveis pelo médico
   */
  async getDoctorAccessibleFiles(doctorId: string): Promise<MedicalFile[]> {
    const response = await axiosClient.get<MedicalFile[]>(
      `/doctors/${doctorId}/accessible-files`
    );
    return response.data;
  }

  /**
   * Descarregar ficheiro
   */
  async downloadFile(fileId: string): Promise<Blob> {
    const response = await axiosClient.get(`/files/${fileId}/download`, {
      responseType: "blob",
    });
    return response.data;
  }

  /**
   * Eliminar ficheiro
   */
  async deleteFile(fileId: string): Promise<{ success: boolean; message: string }> {
    const response = await axiosClient.delete(`/files/${fileId}`);
    return response.data;
  }

  /**
   * Partilhar ficheiro com médico
   */
  async shareFile(
    fileId: string,
    recipientId: string,
    permissions?: string[]
  ): Promise<{ success: boolean; sharedWith: string }> {
    const response = await axiosClient.post(`/files/${fileId}/share`, {
      recipientId,
      permissions: permissions || ["view"],
    });
    return response.data;
  }

  /**
   * Revogar acesso a ficheiro
   */
  async revokeFileAccess(fileId: string, userId: string): Promise<void> {
    await axiosClient.delete(`/files/${fileId}/access/${userId}`);
  }

  /**
   * Obter histórico de acesso a ficheiro
   */
  async getFileAccessLog(fileId: string): Promise<Array<{
    id: string;
    userId: string;
    userName: string;
    action: "view" | "download" | "share";
    timestamp: string;
    ipAddress?: string;
  }>> {
    const response = await axiosClient.get(`/files/${fileId}/access-log`);
    return response.data;
  }

  /**
   * Validar ficheiro antes de upload
   */
  private validateFile(file: File): void {
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED_TYPES = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`Ficheiro muito grande. Máximo: 10MB. Tamanho: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error(
        `Tipo de ficheiro não permitido. Tipos aceitos: PDF, JPG, PNG, DOC, DOCX`
      );
    }
  }
}

export default new FileService();
