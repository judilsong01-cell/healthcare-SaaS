import { createClient } from "@supabase/supabase-js";

/**
 * Supabase Client Configuration
 * 
 * Design Philosophy: Centralização de Configuração Supabase
 * - Cliente único para toda a aplicação
 * - Tipagem completa com TypeScript
 * - Variáveis de ambiente seguras
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Demo mode: Usar valores padrão se não configurados
const isConfigured = !!supabaseUrl && !!supabaseAnonKey;
const isDemoMode = !isConfigured;

if (isDemoMode) {
  console.warn(
    "⚠️ MODO DEMO: Supabase não está configurado. Usando modo demo com dados simulados.\n" +
    "Para usar Supabase real, configure:\n" +
    "  VITE_SUPABASE_URL=https://seu-projeto.supabase.co\n" +
    "  VITE_SUPABASE_ANON_KEY=sua-chave-anonima"
  );
}

// Usar valores padrão para demo se não configurados
const finalUrl = supabaseUrl || "https://demo.supabase.co";
const finalKey = supabaseAnonKey || "demo-key-not-configured";

export const supabase = isConfigured 
  ? createClient(finalUrl, finalKey)
  : createClient(finalUrl, finalKey);

export const isSupabaseConfigured = isConfigured;
export const isDemoModeActive = isDemoMode;

/**
 * Database Types (gerados do Supabase)
 */
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  user_type: "patient" | "doctor" | "admin";
  avatar_url?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface MedicalFileDB {
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

export interface DoctorPatientRelation {
  id: string;
  doctor_id: string;
  patient_id: string;
  created_at: string;
  updated_at: string;
}

export interface AccessLog {
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

/**
 * Helper: Obter utilizador autenticado
 */
export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Helper: Obter perfil do utilizador
 */
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }

  return data as Profile;
}

/**
 * Helper: Verificar se médico tem acesso a paciente
 */
export async function canDoctorAccessPatient(
  doctorId: string,
  patientId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from("doctor_patient_relations")
    .select("id")
    .eq("doctor_id", doctorId)
    .eq("patient_id", patientId)
    .single();

  if (error) {
    console.error("Error checking doctor-patient relation:", error);
    return false;
  }

  return !!data;
}

/**
 * Helper: Registar ação em access_logs
 */
export async function logAccessAction(
  userId: string,
  action: string,
  resource: string,
  resourceId: string,
  status: "success" | "failure",
  details?: Record<string, any>
) {
  const { error } = await supabase.from("access_logs").insert({
    user_id: userId,
    action,
    resource,
    resource_id: resourceId,
    status,
    ip_address: await getClientIp(),
    user_agent: navigator.userAgent,
    details,
  });

  if (error) {
    console.error("Error logging access action:", error);
  }
}

/**
 * Helper: Obter IP do cliente (aproximado)
 */
async function getClientIp(): Promise<string | undefined> {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error("Error fetching client IP:", error);
    return undefined;
  }
}

export default supabase;
