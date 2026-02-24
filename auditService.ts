import { supabase } from "./supabaseClient";

/**
 * Audit Service
 * 
 * Design Philosophy: Auditoria Completa
 * - Logging de todas as ações
 * - Rastreamento de acesso a ficheiros
 * - Histórico de alterações
 * - Conformidade GDPR/LGPD
 */

export interface AuditEntry {
  id: string;
  user_id: string;
  action: string;
  resource: string;
  resource_id: string;
  status: "success" | "failure";
  ip_address?: string;
  user_agent?: string;
  details?: Record<string, any>;
  created_at: string;
}

class AuditService {
  /**
   * Registar ação de upload
   */
  async logUpload(
    userId: string,
    fileId: string,
    fileName: string,
    fileSize: number,
    category: string
  ): Promise<void> {
    try {
      await supabase.from("access_logs").insert({
        user_id: userId,
        action: "upload_file",
        resource: "medical_files",
        resource_id: fileId,
        status: "success",
        user_agent: navigator.userAgent,
        details: {
          fileName,
          fileSize,
          category,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Error logging upload:", error);
    }
  }

  /**
   * Registar ação de download
   */
  async logDownload(userId: string, fileId: string, fileName: string): Promise<void> {
    try {
      await supabase.from("access_logs").insert({
        user_id: userId,
        action: "download_file",
        resource: "medical_files",
        resource_id: fileId,
        status: "success",
        user_agent: navigator.userAgent,
        details: {
          fileName,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Error logging download:", error);
    }
  }

  /**
   * Registar ação de visualização
   */
  async logView(userId: string, fileId: string, fileName: string): Promise<void> {
    try {
      await supabase.from("access_logs").insert({
        user_id: userId,
        action: "view_file",
        resource: "medical_files",
        resource_id: fileId,
        status: "success",
        user_agent: navigator.userAgent,
        details: {
          fileName,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Error logging view:", error);
    }
  }

  /**
   * Registar ação de partilha
   */
  async logShare(
    userId: string,
    fileId: string,
    fileName: string,
    sharedWith: string
  ): Promise<void> {
    try {
      await supabase.from("access_logs").insert({
        user_id: userId,
        action: "share_file",
        resource: "medical_files",
        resource_id: fileId,
        status: "success",
        user_agent: navigator.userAgent,
        details: {
          fileName,
          sharedWith,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Error logging share:", error);
    }
  }

  /**
   * Registar ação de eliminação
   */
  async logDelete(userId: string, fileId: string, fileName: string): Promise<void> {
    try {
      await supabase.from("access_logs").insert({
        user_id: userId,
        action: "delete_file",
        resource: "medical_files",
        resource_id: fileId,
        status: "success",
        user_agent: navigator.userAgent,
        details: {
          fileName,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Error logging delete:", error);
    }
  }

  /**
   * Registar erro
   */
  async logError(
    userId: string,
    action: string,
    resource: string,
    resourceId: string,
    error: string
  ): Promise<void> {
    try {
      await supabase.from("access_logs").insert({
        user_id: userId,
        action,
        resource,
        resource_id: resourceId,
        status: "failure",
        user_agent: navigator.userAgent,
        details: {
          error,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (err) {
      console.error("Error logging error:", err);
    }
  }

  /**
   * Obter histórico de auditoria
   */
  async getAuditLog(
    filters?: {
      userId?: string;
      action?: string;
      resource?: string;
      startDate?: string;
      endDate?: string;
      limit?: number;
    }
  ): Promise<AuditEntry[]> {
    try {
      let query = supabase.from("access_logs").select("*");

      if (filters?.userId) {
        query = query.eq("user_id", filters.userId);
      }

      if (filters?.action) {
        query = query.eq("action", filters.action);
      }

      if (filters?.resource) {
        query = query.eq("resource", filters.resource);
      }

      if (filters?.startDate) {
        query = query.gte("created_at", filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte("created_at", filters.endDate);
      }

      const limit = filters?.limit || 100;
      query = query.order("created_at", { ascending: false }).limit(limit);

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching audit log:", error);
        return [];
      }

      return (data as AuditEntry[]) || [];
    } catch (error) {
      console.error("Error in getAuditLog:", error);
      return [];
    }
  }

  /**
   * Obter estatísticas de auditoria
   */
  async getAuditStats(userId?: string): Promise<{
    totalActions: number;
    uploads: number;
    downloads: number;
    views: number;
    shares: number;
    errors: number;
  }> {
    try {
      let query = supabase.from("access_logs").select("action, status");

      if (userId) {
        query = query.eq("user_id", userId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching audit stats:", error);
        return {
          totalActions: 0,
          uploads: 0,
          downloads: 0,
          views: 0,
          shares: 0,
          errors: 0,
        };
      }

      const logs = (data as any[]) || [];

      return {
        totalActions: logs.length,
        uploads: logs.filter((l) => l.action === "upload_file").length,
        downloads: logs.filter((l) => l.action === "download_file").length,
        views: logs.filter((l) => l.action === "view_file").length,
        shares: logs.filter((l) => l.action === "share_file").length,
        errors: logs.filter((l) => l.status === "failure").length,
      };
    } catch (error) {
      console.error("Error in getAuditStats:", error);
      return {
        totalActions: 0,
        uploads: 0,
        downloads: 0,
        views: 0,
        shares: 0,
        errors: 0,
      };
    }
  }

  /**
   * Exportar relatório de auditoria
   */
  async exportAuditReport(userId?: string): Promise<string> {
    try {
      const logs = await this.getAuditLog({ userId, limit: 1000 });
      const stats = await this.getAuditStats(userId);

      const report = {
        exportedAt: new Date().toISOString(),
        userId,
        statistics: stats,
        logs,
      };

      return JSON.stringify(report, null, 2);
    } catch (error) {
      console.error("Error exporting audit report:", error);
      throw error;
    }
  }
}

export default new AuditService();
