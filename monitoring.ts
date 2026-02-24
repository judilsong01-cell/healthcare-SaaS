/**
 * Global Monitoring Service
 * 
 * Design Philosophy: Observabilidade e Rastreamento
 * - Captura eventos de acesso a ficheiros
 * - Envia para serviço de monitoramento externo
 * - Tratamento de erros robusto
 * - Batch de eventos para eficiência
 * - Suporte a múltiplos backends
 */

export interface MonitoringEvent {
  id: string;
  type: "upload" | "download" | "view" | "share" | "delete" | "error" | "performance";
  userId: string;
  fileId?: string;
  fileName?: string;
  fileSize?: number;
  timestamp: string;
  duration?: number; // em ms
  metadata?: Record<string, any>;
  severity?: "info" | "warning" | "error";
}

export interface MonitoringConfig {
  enabled: boolean;
  endpoint?: string;
  batchSize?: number;
  flushInterval?: number; // em ms
  environment?: "development" | "staging" | "production";
  apiKey?: string;
}

/**
 * Monitoring Service
 */
class MonitoringService {
  private config: MonitoringConfig;
  private eventQueue: MonitoringEvent[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private isOnline: boolean = navigator.onLine;

  constructor(config: Partial<MonitoringConfig> = {}) {
    this.config = {
      enabled: true,
      endpoint: process.env.VITE_MONITORING_ENDPOINT || "https://monitoring.example.com/api/events",
      batchSize: 10,
      flushInterval: 30000, // 30 segundos
      environment: (process.env.NODE_ENV as any) || "development",
      apiKey: process.env.VITE_MONITORING_API_KEY,
      ...config,
    };

    // Listener para mudanças de conectividade
    window.addEventListener("online", () => {
      this.isOnline = true;
      this.flush();
    });
    window.addEventListener("offline", () => {
      this.isOnline = false;
    });

    // Iniciar timer de flush
    this.startFlushTimer();
  }

  /**
   * Registar evento de upload
   */
  recordFileUpload(userId: string, fileId: string, fileName: string, fileSize: number, duration: number) {
    this.recordEvent({
      type: "upload",
      userId,
      fileId,
      fileName,
      fileSize,
      duration,
      severity: "info",
    });
  }

  /**
   * Registar evento de download
   */
  recordFileDownload(userId: string, fileId: string, fileName: string, duration: number) {
    this.recordEvent({
      type: "download",
      userId,
      fileId,
      fileName,
      duration,
      severity: "info",
    });
  }

  /**
   * Registar evento de visualização
   */
  recordFileView(userId: string, fileId: string, fileName: string) {
    this.recordEvent({
      type: "view",
      userId,
      fileId,
      fileName,
      severity: "info",
    });
  }

  /**
   * Registar evento de partilha
   */
  recordFileShare(userId: string, fileId: string, fileName: string, recipientId: string) {
    this.recordEvent({
      type: "share",
      userId,
      fileId,
      fileName,
      metadata: { recipientId },
      severity: "info",
    });
  }

  /**
   * Registar evento de eliminação
   */
  recordFileDelete(userId: string, fileId: string, fileName: string) {
    this.recordEvent({
      type: "delete",
      userId,
      fileId,
      fileName,
      severity: "warning",
    });
  }

  /**
   * Registar erro
   */
  recordError(userId: string, error: Error | string, metadata?: Record<string, any>) {
    const errorMessage = typeof error === "string" ? error : error.message;
    this.recordEvent({
      type: "error",
      userId,
      metadata: {
        ...metadata,
        errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      },
      severity: "error",
    });
  }

  /**
   * Registar métrica de performance
   */
  recordPerformance(userId: string, metric: string, value: number, unit: string = "ms") {
    this.recordEvent({
      type: "performance",
      userId,
      metadata: { metric, value, unit },
      severity: "info",
    });
  }

  /**
   * Registar evento genérico
   */
  private recordEvent(event: Omit<MonitoringEvent, "id" | "timestamp">) {
    if (!this.config.enabled) {
      return;
    }

    const monitoringEvent: MonitoringEvent = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      ...event,
    };

    this.eventQueue.push(monitoringEvent);

    // Log local em desenvolvimento
    if (this.config.environment === "development") {
      console.log("[Monitoring]", monitoringEvent);
    }

    // Flush se atingiu tamanho de batch
    if (this.eventQueue.length >= (this.config.batchSize || 10)) {
      this.flush();
    }
  }

  /**
   * Enviar eventos para backend
   */
  private async flush() {
    if (this.eventQueue.length === 0 || !this.isOnline) {
      return;
    }

    const eventsToSend = [...this.eventQueue];
    this.eventQueue = [];

    try {
      const response = await fetch(this.config.endpoint || "", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(this.config.apiKey && { "X-API-Key": this.config.apiKey }),
        },
        body: JSON.stringify({
          events: eventsToSend,
          environment: this.config.environment,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        console.error("Failed to send monitoring events:", response.statusText);
        // Re-adicionar eventos à fila se falhar
        this.eventQueue.unshift(...eventsToSend);
      }
    } catch (error) {
      console.error("Monitoring service error:", error);
      // Re-adicionar eventos à fila se falhar
      this.eventQueue.unshift(...eventsToSend);
    }
  }

  /**
   * Iniciar timer de flush automático
   */
  private startFlushTimer() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval || 30000);
  }

  /**
   * Gerar ID único
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Destruir serviço
   */
  destroy() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flush();
  }
}

// Instância global
let monitoringService: MonitoringService | null = null;

/**
 * Inicializar serviço de monitoramento
 */
export function initializeMonitoring(config?: Partial<MonitoringConfig>): MonitoringService {
  if (!monitoringService) {
    monitoringService = new MonitoringService(config);
  }
  return monitoringService;
}

/**
 * Obter instância de monitoramento
 */
export function getMonitoringService(): MonitoringService {
  if (!monitoringService) {
    monitoringService = new MonitoringService();
  }
  return monitoringService;
}

/**
 * Hook para usar monitoramento em componentes React
 */
export function useMonitoring() {
  return getMonitoringService();
}

export default getMonitoringService();
