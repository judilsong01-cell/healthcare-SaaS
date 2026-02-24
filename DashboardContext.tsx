import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase, getCurrentUser, getUserProfile, Profile, isDemoModeActive } from "@/services/supabaseClient";

/**
 * Dashboard Context com Supabase
 * 
 * Design Philosophy: Sincronização com Supabase Auth
 * - onAuthStateChange para monitorar sessão
 * - Busca de dados do perfil na tabela profiles
 * - Tipagem completa com TypeScript
 * - Suporte para pacientes e médicos
 * - Modo demo para testes sem Supabase
 */

export interface Patient extends Profile {
  role: "patient";
}

export interface Doctor extends Profile {
  role: "doctor";
}

export interface MedicalFile {
  id: string;
  patient_id: string;
  doctor_id?: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_url: string;
  category: "report" | "exam" | "prescription" | "wound_photo" | "other";
  description?: string;
  status: "pending" | "approved" | "archived";
  uploaded_at: string;
  created_at: string;
  updated_at: string;
}

export interface Medication {
  id: string;
  patient_id: string;
  name: string;
  dosage: string;
  frequency: string;
  start_date: string;
  end_date?: string;
  instructions?: string;
  taken_today: boolean;
  created_at: string;
}

export interface HealthCheckIn {
  id: string;
  patient_id: string;
  pain_level: number;
  symptoms: string[];
  notes?: string;
  timestamp: string;
}

export interface Alert {
  id: string;
  patient_id: string;
  doctor_id?: string;
  type: "medication" | "health" | "appointment" | "document";
  title: string;
  message: string;
  severity: "low" | "medium" | "high";
  read: boolean;
  created_at: string;
}

export interface AccessLog {
  id: string;
  userId: string;
  userType: "patient" | "doctor";
  action: "upload" | "download" | "view" | "share" | "delete";
  timestamp: string;
  ipAddress?: string;
}

export interface DashboardContextType {
  currentUser: Profile | null;
  currentPatient: Patient | null;
  currentDoctor: Doctor | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isDemoMode: boolean;
  medications: Medication[];
  checkIns: HealthCheckIn[];
  alerts: Alert[];
  files: MedicalFile[];
  logout: () => Promise<void>;
  clearError: () => void;
  updateMedicationStatus: (medicationId: string, taken: boolean) => void;
  addHealthCheckIn: (checkIn: HealthCheckIn) => void;
  markAlertAsRead: (alertId: string) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

// Dados simulados para modo demo
const DEMO_USER: Profile = {
  id: "demo-patient-123",
  email: "paciente@demo.com",
  full_name: "Paciente Demo",
  user_type: "patient",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const DEMO_MEDICATIONS: Medication[] = [
  {
    id: "med-1",
    patient_id: "demo-patient-123",
    name: "Paracetamol",
    dosage: "500mg",
    frequency: "A cada 8 horas",
    start_date: new Date().toISOString().split("T")[0],
    instructions: "Tomar com alimentos",
    taken_today: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "med-2",
    patient_id: "demo-patient-123",
    name: "Amoxicilina",
    dosage: "250mg",
    frequency: "A cada 12 horas",
    start_date: new Date().toISOString().split("T")[0],
    instructions: "Completar o tratamento",
    taken_today: false,
    created_at: new Date().toISOString(),
  },
];

const DEMO_FILES: MedicalFile[] = [
  {
    id: "file-1",
    patient_id: "demo-patient-123",
    file_name: "Relatório Cirúrgico.pdf",
    file_type: "application/pdf",
    file_size: 2048000,
    file_url: "https://demo.supabase.co/storage/files/report.pdf",
    category: "report",
    description: "Relatório da cirurgia realizada",
    status: "approved",
    uploaded_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [checkIns, setCheckIns] = useState<HealthCheckIn[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [files, setFiles] = useState<MedicalFile[]>([]);

  // Monitorar mudanças de autenticação
  useEffect(() => {
    setIsLoading(true);

    // Se em modo demo, carregar dados simulados
    if (isDemoModeActive) {
      setCurrentUser(DEMO_USER);
      setIsAuthenticated(true);
      setMedications(DEMO_MEDICATIONS);
      setFiles(DEMO_FILES);
      setError(null);
      setIsLoading(false);
      return;
    }

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          if (session && session.user) {
            // Utilizador logado
            const profile = await getUserProfile(session.user.id);

            if (profile) {
              setCurrentUser(profile);
              setIsAuthenticated(true);
              setError(null);

              // Carregar dados adicionais baseado no tipo de utilizador
              if (profile.user_type === "patient") {
                await loadPatientData(session.user.id);
              } else if (profile.user_type === "doctor") {
                await loadDoctorData(session.user.id);
              }
            } else {
              setError("Perfil não encontrado");
              setIsAuthenticated(false);
            }
          } else {
            // Utilizador deslogado
            setCurrentUser(null);
            setIsAuthenticated(false);
            setMedications([]);
            setCheckIns([]);
            setAlerts([]);
            setFiles([]);
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "Erro ao carregar perfil";
          setError(errorMessage);
          console.error("Auth state change error:", err);
        } finally {
          setIsLoading(false);
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  /**
   * Carregar dados do paciente
   */
  const loadPatientData = async (patientId: string) => {
    try {
      // Carregar medicações
      const { data: medsData, error: medsError } = await supabase
        .from("medications")
        .select("*")
        .eq("patient_id", patientId);

      if (!medsError && medsData) {
        setMedications(medsData as Medication[]);
      }

      // Carregar check-ins
      const { data: checkInData, error: checkInError } = await supabase
        .from("health_check_ins")
        .select("*")
        .eq("patient_id", patientId)
        .order("timestamp", { ascending: false })
        .limit(10);

      if (!checkInError && checkInData) {
        setCheckIns(checkInData as HealthCheckIn[]);
      }

      // Carregar alertas
      const { data: alertsData, error: alertsError } = await supabase
        .from("alerts")
        .select("*")
        .eq("patient_id", patientId)
        .order("created_at", { ascending: false });

      if (!alertsError && alertsData) {
        setAlerts(alertsData as Alert[]);
      }

      // Carregar ficheiros do paciente
      const { data: filesData, error: filesError } = await supabase
        .from("medical_files")
        .select("*")
        .eq("patient_id", patientId)
        .order("created_at", { ascending: false });

      if (!filesError && filesData) {
        setFiles(filesData as MedicalFile[]);
      }
    } catch (err) {
      console.error("Error loading patient data:", err);
      setError("Erro ao carregar dados do paciente");
    }
  };

  /**
   * Carregar dados do médico com segurança
   */
  const loadDoctorData = async (doctorId: string) => {
    try {
      // Carregar ficheiros dos pacientes do médico (com join seguro)
      const { data: doctorRelations, error: relError } = await supabase
        .from("doctor_patient_relations")
        .select("patient_id")
        .eq("doctor_id", doctorId);

      if (!relError && doctorRelations && doctorRelations.length > 0) {
        const patientIds = doctorRelations.map((rel) => rel.patient_id);

        // Buscar ficheiros dos pacientes
        const { data: filesData, error: filesError } = await supabase
          .from("medical_files")
          .select("*")
          .in("patient_id", patientIds)
          .order("created_at", { ascending: false });

        if (!filesError && filesData) {
          setFiles(filesData as MedicalFile[]);
        }
      }

      // Carregar alertas do médico
      const { data: alertsData, error: alertsError } = await supabase
        .from("alerts")
        .select("*")
        .eq("doctor_id", doctorId)
        .order("created_at", { ascending: false });

      if (!alertsError && alertsData) {
        setAlerts(alertsData as Alert[]);
      }
    } catch (err) {
      console.error("Error loading doctor data:", err);
      setError("Erro ao carregar dados do médico");
    }
  };

  /**
   * Atualizar status de medicação
   */
  const updateMedicationStatus = async (medicationId: string, taken: boolean) => {
    try {
      if (isDemoModeActive) {
        setMedications(
          medications.map((med) =>
            med.id === medicationId ? { ...med, taken_today: taken } : med
          )
        );
        return;
      }

      const { error } = await supabase
        .from("medications")
        .update({ taken_today: taken })
        .eq("id", medicationId);

      if (!error) {
        setMedications(
          medications.map((med) =>
            med.id === medicationId ? { ...med, taken_today: taken } : med
          )
        );
      }
    } catch (err) {
      console.error("Error updating medication status:", err);
    }
  };

  /**
   * Adicionar health check-in
   */
  const addHealthCheckIn = async (checkIn: HealthCheckIn) => {
    try {
      if (isDemoModeActive) {
        setCheckIns([checkIn, ...checkIns]);
        return;
      }

      const { data, error } = await supabase
        .from("health_check_ins")
        .insert([checkIn])
        .select()
        .single();

      if (!error && data) {
        setCheckIns([data as HealthCheckIn, ...checkIns]);
      }
    } catch (err) {
      console.error("Error adding health check-in:", err);
    }
  };

  /**
   * Marcar alerta como lido
   */
  const markAlertAsRead = async (alertId: string) => {
    try {
      if (isDemoModeActive) {
        setAlerts(
          alerts.map((alert) =>
            alert.id === alertId ? { ...alert, read: true } : alert
          )
        );
        return;
      }

      const { error } = await supabase
        .from("alerts")
        .update({ read: true })
        .eq("id", alertId);

      if (!error) {
        setAlerts(
          alerts.map((alert) =>
            alert.id === alertId ? { ...alert, read: true } : alert
          )
        );
      }
    } catch (err) {
      console.error("Error marking alert as read:", err);
    }
  };

  /**
   * Fazer logout
   */
  const logout = async () => {
    try {
      if (!isDemoModeActive) {
        await supabase.auth.signOut();
      }
      setCurrentUser(null);
      setIsAuthenticated(false);
      setMedications([]);
      setCheckIns([]);
      setAlerts([]);
      setFiles([]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao fazer logout";
      setError(errorMessage);
    }
  };

  /**
   * Limpar erro
   */
  const clearError = () => {
    setError(null);
  };

  const currentPatient =
    currentUser && currentUser.user_type === "patient"
      ? ({ ...currentUser, role: "patient" } as Patient)
      : null;

  const currentDoctor =
    currentUser && currentUser.user_type === "doctor"
      ? ({ ...currentUser, role: "doctor" } as Doctor)
      : null;

  return (
    <DashboardContext.Provider
      value={{
        currentUser,
        currentPatient,
        currentDoctor,
        isAuthenticated,
        isLoading,
        error,
        isDemoMode: isDemoModeActive,
        medications,
        checkIns,
        alerts,
        files,
        logout,
        clearError,
        updateMedicationStatus,
        addHealthCheckIn,
        markAlertAsRead,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard deve ser usado dentro de DashboardProvider");
  }
  return context;
}
