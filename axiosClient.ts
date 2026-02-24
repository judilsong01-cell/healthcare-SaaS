import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from "axios";

/**
 * Axios Client Configuration
 * 
 * Design Philosophy: Centralização e Segurança
 * - Interceptores para autenticação automática
 * - Tratamento de erros global
 * - Retry logic
 * - Timeout configurável
 */

// Tipos
export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  error?: string;
  details?: Record<string, any>;
}

// Criar instância do Axios
const axiosClient: AxiosInstance = axios.create({
  baseURL: process.env.VITE_API_BASE_URL || "http://localhost:3000/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Interceptor de Requisição
 * - Adiciona token de autenticação automaticamente
 * - Adiciona headers customizados
 */
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Obter token do localStorage
    const token = localStorage.getItem("auth_token");
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Adicionar ID de requisição para rastreamento
    config.headers["X-Request-ID"] = generateRequestId();

    return config;
  },
  (error: AxiosError) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

/**
 * Interceptor de Resposta
 * - Trata erros de autenticação
 * - Implementa retry logic
 * - Formata erros
 */
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError<ApiErrorResponse>) => {
    const config = error.config as InternalAxiosRequestConfig & { retryCount?: number };

    // Tratamento de erro 401 (Não autorizado)
    if (error.response?.status === 401) {
      // Limpar token inválido
      localStorage.removeItem("auth_token");
      localStorage.removeItem("refresh_token");

      // Redirecionar para login
      window.location.href = "/auth";
      return Promise.reject(error);
    }

    // Tratamento de erro 403 (Proibido)
    if (error.response?.status === 403) {
      console.error("Access denied:", error.response.data);
      return Promise.reject(error);
    }

    // Retry logic para erros de rede (5xx)
    if (
      error.response?.status &&
      error.response.status >= 500 &&
      config &&
      (!config.retryCount || config.retryCount < 3)
    ) {
      config.retryCount = (config.retryCount || 0) + 1;
      
      // Aguardar antes de retry (exponential backoff)
      const delay = Math.pow(2, config.retryCount) * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
      
      return axiosClient(config);
    }

    // Formatar erro
    const errorMessage = error.response?.data?.message || error.message || "Unknown error";
    console.error("API Error:", {
      status: error.response?.status,
      message: errorMessage,
      data: error.response?.data,
    });

    return Promise.reject(error);
  }
);

/**
 * Gerar ID único para requisição
 */
function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Função auxiliar para definir token
 */
export function setAuthToken(token: string) {
  localStorage.setItem("auth_token", token);
  axiosClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

/**
 * Função auxiliar para limpar token
 */
export function clearAuthToken() {
  localStorage.removeItem("auth_token");
  delete axiosClient.defaults.headers.common["Authorization"];
}

/**
 * Função auxiliar para obter token
 */
export function getAuthToken(): string | null {
  return localStorage.getItem("auth_token");
}

export default axiosClient;
