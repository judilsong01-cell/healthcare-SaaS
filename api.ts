/**
 * API Service Layer
 * 
 * Design Philosophy: Abstração e Flexibilidade
 * - Centraliza todas as chamadas de API
 * - Suporta tanto Fetch quanto Axios
 * - Tratamento de erros consistente
 * - Retry logic e timeout
 * - Logging de requisições
 */

import { MedicalFile, Patient, Doctor } from "@/contexts/DashboardContext";

// Configuração da API
const API_BASE_URL = process.env.VITE_API_BASE_URL || "http://localhost:3000/api";
const API_TIMEOUT = 30000; // 30 segundos
const MAX_RETRIES = 3;

/**
 * Interface de Resposta da API
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
  timestamp: string;
}

/**
 * Interface de Erro da API
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Função auxiliar para fazer requisições com retry
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = MAX_RETRIES
): Promise<Response> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    if (retries > 0 && error instanceof Error && error.name === "AbortError") {
      console.warn(`Request timeout, retrying... (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`);
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
}

/**
 * Função auxiliar para processar resposta
 */
async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const contentType = response.headers.get("content-type");
  let data: any;

  try {
    if (contentType?.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }
  } catch (error) {
    console.error("Error parsing response:", error);
    data = null;
  }

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data?.error || `HTTP ${response.status}: ${response.statusText}`,
      new Error(JSON.stringify(data))
    );
  }

  return {
    success: true,
    data,
    statusCode: response.status,
    timestamp: new Date().toISOString(),
  };
}

/**
 * API Service - Pacientes
 */
export const patientApi = {
  /**
   * Obter dados do paciente
   */
  async getPatient(patientId: string): Promise<ApiResponse<Patient>> {
    try {
      const response = await fetchWithRetry(`${API_BASE_URL}/patients/${patientId}`);
      return handleResponse<Patient>(response);
    } catch (error) {
      console.error("Failed to fetch patient:", error);
      throw error;
    }
  },

  /**
   * Atualizar dados do paciente
   */
  async updatePatient(patientId: string, data: Partial<Patient>): Promise<ApiResponse<Patient>> {
    try {
      const response = await fetchWithRetry(`${API_BASE_URL}/patients/${patientId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return handleResponse<Patient>(response);
    } catch (error) {
      console.error("Failed to update patient:", error);
      throw error;
    }
  },

  /**
   * Obter medicação do paciente
   */
  async getMedications(patientId: string): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetchWithRetry(`${API_BASE_URL}/patients/${patientId}/medications`);
      return handleResponse<any[]>(response);
    } catch (error) {
      console.error("Failed to fetch medications:", error);
      throw error;
    }
  },

  /**
   * Registar medicação tomada
   */
  async recordMedication(patientId: string, medicationId: string, time: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetchWithRetry(
        `${API_BASE_URL}/patients/${patientId}/medications/${medicationId}/record`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ time }),
        }
      );
      return handleResponse<any>(response);
    } catch (error) {
      console.error("Failed to record medication:", error);
      throw error;
    }
  },

  /**
   * Submeter check-in de saúde
   */
  async submitHealthCheckIn(patientId: string, checkInData: any): Promise<ApiResponse<any>> {
    try {
      const response = await fetchWithRetry(
        `${API_BASE_URL}/patients/${patientId}/check-ins`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(checkInData),
        }
      );
      return handleResponse<any>(response);
    } catch (error) {
      console.error("Failed to submit health check-in:", error);
      throw error;
    }
  },
};

/**
 * API Service - Médicos
 */
export const doctorApi = {
  /**
   * Obter dados do médico
   */
  async getDoctor(doctorId: string): Promise<ApiResponse<Doctor>> {
    try {
      const response = await fetchWithRetry(`${API_BASE_URL}/doctors/${doctorId}`);
      return handleResponse<Doctor>(response);
    } catch (error) {
      console.error("Failed to fetch doctor:", error);
      throw error;
    }
  },

  /**
   * Obter pacientes do médico
   */
  async getPatients(doctorId: string): Promise<ApiResponse<Patient[]>> {
    try {
      const response = await fetchWithRetry(`${API_BASE_URL}/doctors/${doctorId}/patients`);
      return handleResponse<Patient[]>(response);
    } catch (error) {
      console.error("Failed to fetch doctor's patients:", error);
      throw error;
    }
  },

  /**
   * Obter alertas do médico
   */
  async getAlerts(doctorId: string): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetchWithRetry(`${API_BASE_URL}/doctors/${doctorId}/alerts`);
      return handleResponse<any[]>(response);
    } catch (error) {
      console.error("Failed to fetch doctor alerts:", error);
      throw error;
    }
  },

  /**
   * Marcar alerta como lido
   */
  async markAlertAsRead(doctorId: string, alertId: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetchWithRetry(
        `${API_BASE_URL}/doctors/${doctorId}/alerts/${alertId}/read`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
        }
      );
      return handleResponse<any>(response);
    } catch (error) {
      console.error("Failed to mark alert as read:", error);
      throw error;
    }
  },
};

/**
 * API Service - Ficheiros
 */
export const fileApi = {
  /**
   * Upload de ficheiro
   */
  async uploadFile(
    patientId: string,
    file: File,
    category: string,
    description: string
  ): Promise<ApiResponse<MedicalFile>> {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", category);
      formData.append("description", description);

      const response = await fetchWithRetry(
        `${API_BASE_URL}/patients/${patientId}/files/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      return handleResponse<MedicalFile>(response);
    } catch (error) {
      console.error("Failed to upload file:", error);
      throw error;
    }
  },

  /**
   * Obter ficheiros do paciente
   */
  async getPatientFiles(patientId: string): Promise<ApiResponse<MedicalFile[]>> {
    try {
      const response = await fetchWithRetry(`${API_BASE_URL}/patients/${patientId}/files`);
      return handleResponse<MedicalFile[]>(response);
    } catch (error) {
      console.error("Failed to fetch patient files:", error);
      throw error;
    }
  },

  /**
   * Obter ficheiros acessíveis pelo médico
   */
  async getDoctorAccessibleFiles(doctorId: string): Promise<ApiResponse<MedicalFile[]>> {
    try {
      const response = await fetchWithRetry(`${API_BASE_URL}/doctors/${doctorId}/accessible-files`);
      return handleResponse<MedicalFile[]>(response);
    } catch (error) {
      console.error("Failed to fetch doctor accessible files:", error);
      throw error;
    }
  },

  /**
   * Descarregar ficheiro
   */
  async downloadFile(fileId: string): Promise<Blob> {
    try {
      const response = await fetchWithRetry(`${API_BASE_URL}/files/${fileId}/download`);
      if (!response.ok) {
        throw new ApiError(response.status, `Failed to download file: ${response.statusText}`);
      }
      return await response.blob();
    } catch (error) {
      console.error("Failed to download file:", error);
      throw error;
    }
  },

  /**
   * Eliminar ficheiro
   */
  async deleteFile(fileId: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetchWithRetry(`${API_BASE_URL}/files/${fileId}`, {
        method: "DELETE",
      });
      return handleResponse<void>(response);
    } catch (error) {
      console.error("Failed to delete file:", error);
      throw error;
    }
  },

  /**
   * Partilhar ficheiro
   */
  async shareFile(fileId: string, recipientId: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetchWithRetry(`${API_BASE_URL}/files/${fileId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientId }),
      });
      return handleResponse<any>(response);
    } catch (error) {
      console.error("Failed to share file:", error);
      throw error;
    }
  },
};

/**
 * API Service - Autenticação
 */
export const authApi = {
  /**
   * Login
   */
  async login(email: string, password: string): Promise<ApiResponse<{ token: string; user: any }>> {
    try {
      const response = await fetchWithRetry(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      return handleResponse<{ token: string; user: any }>(response);
    } catch (error) {
      console.error("Failed to login:", error);
      throw error;
    }
  },

  /**
   * Signup
   */
  async signup(email: string, password: string, name: string, role: string): Promise<ApiResponse<{ token: string; user: any }>> {
    try {
      const response = await fetchWithRetry(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, role }),
      });
      return handleResponse<{ token: string; user: any }>(response);
    } catch (error) {
      console.error("Failed to signup:", error);
      throw error;
    }
  },

  /**
   * Logout
   */
  async logout(): Promise<ApiResponse<void>> {
    try {
      const response = await fetchWithRetry(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
      });
      return handleResponse<void>(response);
    } catch (error) {
      console.error("Failed to logout:", error);
      throw error;
    }
  },
};

/**
 * Exportar todas as APIs
 */
export const api = {
  patient: patientApi,
  doctor: doctorApi,
  file: fileApi,
  auth: authApi,
};

export default api;
