import axiosClient from "./axiosClient";

/**
 * Security Service
 * 
 * Design Philosophy: Segurança de Ponta a Ponta
 * - Validação de acesso no frontend
 * - Validação no backend (obrigatória)
 * - Auditoria de ações
 * - Encriptação de dados sensíveis
 */

export interface AccessControl {
  resource: string;
  action: "view" | "edit" | "delete" | "share";
  allowed: boolean;
  reason?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  status: "success" | "failure";
  details?: Record<string, any>;
}

class SecurityService {
  /**
   * Verificar acesso a recurso
   */
  async checkAccess(
    resource: string,
    resourceId: string,
    action: "view" | "edit" | "delete" | "share"
  ): Promise<AccessControl> {
    try {
      const response = await axiosClient.get<AccessControl>(
        `/security/check-access`,
        {
          params: { resource, resourceId, action },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Access check failed:", error);
      return {
        resource,
        action,
        allowed: false,
        reason: "Acesso negado",
      };
    }
  }

  /**
   * Verificar se médico tem acesso a paciente
   */
  async canDoctorAccessPatient(doctorId: string, patientId: string): Promise<boolean> {
    try {
      const response = await axiosClient.get<{ allowed: boolean }>(
        `/security/doctor-patient-access`,
        {
          params: { doctorId, patientId },
        }
      );
      return response.data.allowed;
    } catch (error) {
      console.error("Doctor-patient access check failed:", error);
      return false;
    }
  }

  /**
   * Verificar se médico tem acesso a ficheiro
   */
  async canDoctorAccessFile(doctorId: string, fileId: string): Promise<boolean> {
    try {
      const response = await axiosClient.get<{ allowed: boolean }>(
        `/security/doctor-file-access`,
        {
          params: { doctorId, fileId },
        }
      );
      return response.data.allowed;
    } catch (error) {
      console.error("Doctor-file access check failed:", error);
      return false;
    }
  }

  /**
   * Registar ação para auditoria
   */
  async logAction(
    action: string,
    resource: string,
    resourceId: string,
    status: "success" | "failure",
    details?: Record<string, any>
  ): Promise<void> {
    try {
      await axiosClient.post(`/security/audit-log`, {
        action,
        resource,
        resourceId,
        status,
        details,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
      });
    } catch (error) {
      console.error("Failed to log action:", error);
    }
  }

  /**
   * Obter histórico de auditoria
   */
  async getAuditLog(
    filters?: {
      resource?: string;
      action?: string;
      startDate?: string;
      endDate?: string;
      limit?: number;
    }
  ): Promise<AuditLog[]> {
    try {
      const response = await axiosClient.get<AuditLog[]>(`/security/audit-log`, {
        params: filters,
      });
      return response.data;
    } catch (error) {
      console.error("Failed to fetch audit log:", error);
      return [];
    }
  }

  /**
   * Encriptar dados sensíveis (client-side)
   */
  encryptSensitiveData(data: string, key: string): string {
    // Implementação simplificada
    // Em produção, usar biblioteca como TweetNaCl.js ou libsodium.js
    try {
      const encoded = btoa(JSON.stringify({ data, timestamp: Date.now() }));
      return encoded;
    } catch (error) {
      console.error("Encryption failed:", error);
      return "";
    }
  }

  /**
   * Desencriptar dados sensíveis (client-side)
   */
  decryptSensitiveData(encrypted: string, key: string): string | null {
    // Implementação simplificada
    try {
      const decoded = atob(encrypted);
      const parsed = JSON.parse(decoded);
      return parsed.data;
    } catch (error) {
      console.error("Decryption failed:", error);
      return null;
    }
  }

  /**
   * Validar integridade de ficheiro
   */
  async validateFileIntegrity(fileId: string, hash: string): Promise<boolean> {
    try {
      const response = await axiosClient.get<{ valid: boolean }>(
        `/security/validate-file-integrity`,
        {
          params: { fileId, hash },
        }
      );
      return response.data.valid;
    } catch (error) {
      console.error("File integrity validation failed:", error);
      return false;
    }
  }

  /**
   * Gerar hash de ficheiro (client-side)
   */
  async generateFileHash(file: File): Promise<string> {
    try {
      const buffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
      return hashHex;
    } catch (error) {
      console.error("Hash generation failed:", error);
      return "";
    }
  }
}

export default new SecurityService();
