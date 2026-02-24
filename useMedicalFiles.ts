import { useEffect, useState } from "react";
import { supabase, canDoctorAccessPatient, logAccessAction } from "@/services/supabaseClient";
import { MedicalFile } from "@/contexts/DashboardContext";

/**
 * Hook useMedicalFiles
 * 
 * Design Philosophy: Segurança de Ponta a Ponta
 * - Pacientes veem apenas seus ficheiros
 * - Médicos veem apenas ficheiros de seus pacientes
 * - Validação de acesso no frontend
 * - Logging de todas as ações
 */

export interface UseMedicalFilesOptions {
  userType: "patient" | "doctor";
  userId: string;
  patientId?: string; // Obrigatório para pacientes
}

export function useMedicalFiles(options: UseMedicalFilesOptions) {
  const { userType, userId, patientId } = options;
  const [files, setFiles] = useState<MedicalFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFiles();
  }, [userType, userId, patientId]);

  /**
   * Carregar ficheiros com base no tipo de utilizador
   */
  const loadFiles = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (userType === "patient" && patientId) {
        // Paciente: carregar apenas seus ficheiros
        await loadPatientFiles(patientId, userId);
      } else if (userType === "doctor") {
        // Médico: carregar ficheiros dos seus pacientes
        await loadDoctorFiles(userId);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao carregar ficheiros";
      setError(errorMessage);
      console.error("Error loading medical files:", err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Carregar ficheiros do paciente
   */
  const loadPatientFiles = async (patientId: string, userId: string) => {
    const { data, error } = await supabase
      .from("medical_files")
      .select("*")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Erro ao carregar ficheiros: ${error.message}`);
    }

    if (data) {
      setFiles(data as MedicalFile[]);

      // Registar ação de visualização
      await logAccessAction(
        userId,
        "view_patient_files",
        "medical_files",
        patientId,
        "success",
        { count: data.length }
      );
    }
  };

  /**
   * Carregar ficheiros dos pacientes do médico (com segurança)
   */
  const loadDoctorFiles = async (doctorId: string) => {
    try {
      // 1. Obter lista de pacientes do médico
      const { data: relations, error: relError } = await supabase
        .from("doctor_patient_relations")
        .select("patient_id")
        .eq("doctor_id", doctorId);

      if (relError) {
        throw new Error(`Erro ao carregar relações: ${relError.message}`);
      }

      if (!relations || relations.length === 0) {
        setFiles([]);
        return;
      }

      const patientIds = relations.map((rel) => rel.patient_id);

      // 2. Buscar ficheiros dos pacientes (com join seguro)
      const { data, error } = await supabase
        .from("medical_files")
        .select("*")
        .in("patient_id", patientIds)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(`Erro ao carregar ficheiros: ${error.message}`);
      }

      if (data) {
        setFiles(data as MedicalFile[]);

        // Registar ação de visualização
        await logAccessAction(
          doctorId,
          "view_doctor_files",
          "medical_files",
          patientIds.join(","),
          "success",
          { count: data.length, patientCount: patientIds.length }
        );
      }
    } catch (err) {
      throw err;
    }
  };

  /**
   * Obter ficheiro por ID (com validação de acesso)
   */
  const getFile = async (fileId: string): Promise<MedicalFile | null> => {
    try {
      const { data, error } = await supabase
        .from("medical_files")
        .select("*")
        .eq("id", fileId)
        .single();

      if (error) {
        throw new Error(`Ficheiro não encontrado: ${error.message}`);
      }

      if (!data) return null;

      const file = data as MedicalFile;

      // Validar acesso
      if (userType === "patient" && file.patient_id !== patientId) {
        throw new Error("Acesso negado: você não tem permissão para visualizar este ficheiro");
      }

      if (userType === "doctor") {
        const hasAccess = await canDoctorAccessPatient(userId, file.patient_id);
        if (!hasAccess) {
          throw new Error("Acesso negado: você não é médico deste paciente");
        }
      }

      // Registar ação de visualização
      await logAccessAction(
        userId,
        "view_file",
        "medical_files",
        fileId,
        "success",
        { fileName: file.file_name }
      );

      return file;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao obter ficheiro";
      await logAccessAction(
        userId,
        "view_file",
        "medical_files",
        fileId,
        "failure",
        { error: errorMessage }
      );
      throw err;
    }
  };

  /**
   * Descarregar ficheiro
   */
  const downloadFile = async (fileId: string): Promise<void> => {
    try {
      const file = await getFile(fileId);
      if (!file) throw new Error("Ficheiro não encontrado");

      // Registar download
      await logAccessAction(
        userId,
        "download_file",
        "medical_files",
        fileId,
        "success",
        { fileName: file.file_name }
      );

      // Iniciar download
      const link = document.createElement("a");
      link.href = file.file_url;
      link.download = file.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao descarregar";
      await logAccessAction(
        userId,
        "download_file",
        "medical_files",
        fileId,
        "failure",
        { error: errorMessage }
      );
      throw err;
    }
  };

  /**
   * Eliminar ficheiro (apenas pacientes podem eliminar seus ficheiros)
   */
  const deleteFile = async (fileId: string): Promise<void> => {
    try {
      if (userType !== "patient") {
        throw new Error("Apenas pacientes podem eliminar ficheiros");
      }

      const file = await getFile(fileId);
      if (!file) throw new Error("Ficheiro não encontrado");

      if (file.patient_id !== patientId) {
        throw new Error("Acesso negado: você não pode eliminar este ficheiro");
      }

      // Eliminar do storage
      const { error: storageError } = await supabase.storage
        .from("health-documents")
        .remove([file.file_url.split("/").pop() || ""]);

      if (storageError) {
        throw new Error(`Erro ao eliminar ficheiro: ${storageError.message}`);
      }

      // Eliminar registro da base de dados
      const { error: dbError } = await supabase
        .from("medical_files")
        .delete()
        .eq("id", fileId);

      if (dbError) {
        throw new Error(`Erro ao eliminar registro: ${dbError.message}`);
      }

      // Atualizar estado local
      setFiles(files.filter((f) => f.id !== fileId));

      // Registar ação
      await logAccessAction(
        userId,
        "delete_file",
        "medical_files",
        fileId,
        "success",
        { fileName: file.file_name }
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao eliminar";
      await logAccessAction(
        userId,
        "delete_file",
        "medical_files",
        fileId,
        "failure",
        { error: errorMessage }
      );
      throw err;
    }
  };

  /**
   * Partilhar ficheiro com médico
   */
  const shareFile = async (fileId: string, doctorId: string): Promise<void> => {
    try {
      if (userType !== "patient") {
        throw new Error("Apenas pacientes podem partilhar ficheiros");
      }

      const file = await getFile(fileId);
      if (!file) throw new Error("Ficheiro não encontrado");

      if (file.patient_id !== patientId) {
        throw new Error("Acesso negado: você não pode partilhar este ficheiro");
      }

      // Atualizar ficheiro com doctor_id
      const { error } = await supabase
        .from("medical_files")
        .update({ doctor_id: doctorId })
        .eq("id", fileId);

      if (error) {
        throw new Error(`Erro ao partilhar ficheiro: ${error.message}`);
      }

      // Atualizar estado local
      setFiles(
        files.map((f) =>
          f.id === fileId ? { ...f, doctor_id: doctorId } : f
        )
      );

      // Registar ação
      await logAccessAction(
        userId,
        "share_file",
        "medical_files",
        fileId,
        "success",
        { fileName: file.file_name, sharedWith: doctorId }
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao partilhar";
      await logAccessAction(
        userId,
        "share_file",
        "medical_files",
        fileId,
        "failure",
        { error: errorMessage }
      );
      throw err;
    }
  };

  return {
    files,
    isLoading,
    error,
    getFile,
    downloadFile,
    deleteFile,
    shareFile,
    refetch: loadFiles,
  };
}
