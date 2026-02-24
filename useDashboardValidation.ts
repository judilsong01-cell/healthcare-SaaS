import { useDashboard } from "@/contexts/DashboardContext";
import { useEffect } from "react";

/**
 * Hook de Validação de Contexto
 * 
 * Design Philosophy: Robustez e Segurança
 * - Valida se o contexto está disponível
 * - Verifica tipagem de dados
 * - Fornece mensagens de erro claras
 * - Registra erros para monitoramento
 */

interface ValidationResult {
  isValid: boolean;
  error?: string;
  data?: any;
}

/**
 * Valida se currentPatient está devidamente tipado e disponível
 */
export function usePatientValidation(): ValidationResult {
  const { currentPatient, userType } = useDashboard();

  useEffect(() => {
    if (userType === "patient" && !currentPatient) {
      console.warn("Patient context validation failed: currentPatient is null but userType is 'patient'");
    }
  }, [currentPatient, userType]);

  if (userType === "patient" && !currentPatient) {
    return {
      isValid: false,
      error: "Dados do paciente não disponíveis. Por favor, faça login novamente.",
      data: null,
    };
  }

  if (userType === "patient" && currentPatient) {
    // Validar estrutura do objeto
    if (!currentPatient.id || !currentPatient.name) {
      return {
        isValid: false,
        error: "Dados do paciente incompletos ou malformados.",
        data: currentPatient,
      };
    }
  }

  return {
    isValid: true,
    data: currentPatient,
  };
}

/**
 * Valida se currentDoctor está devidamente tipado e disponível
 */
export function useDoctorValidation(): ValidationResult {
  const { currentDoctor, userType } = useDashboard();

  useEffect(() => {
    if (userType === "doctor" && !currentDoctor) {
      console.warn("Doctor context validation failed: currentDoctor is null but userType is 'doctor'");
    }
  }, [currentDoctor, userType]);

  if (userType === "doctor" && !currentDoctor) {
    return {
      isValid: false,
      error: "Dados do médico não disponíveis. Por favor, faça login novamente.",
      data: null,
    };
  }

  if (userType === "doctor" && currentDoctor) {
    // Validar estrutura do objeto
    if (!currentDoctor.id || !currentDoctor.name || !Array.isArray(currentDoctor.patients)) {
      return {
        isValid: false,
        error: "Dados do médico incompletos ou malformados.",
        data: currentDoctor,
      };
    }
  }

  return {
    isValid: true,
    data: currentDoctor,
  };
}

/**
 * Valida se o userType está definido
 */
export function useUserTypeValidation(): ValidationResult {
  const { userType } = useDashboard();

  if (!userType) {
    return {
      isValid: false,
      error: "Tipo de utilizador não definido. Por favor, faça login.",
      data: null,
    };
  }

  if (!["patient", "doctor"].includes(userType)) {
    return {
      isValid: false,
      error: `Tipo de utilizador inválido: ${userType}`,
      data: userType,
    };
  }

  return {
    isValid: true,
    data: userType,
  };
}

/**
 * Valida contexto completo
 */
export function useDashboardValidation(): ValidationResult {
  const userTypeValidation = useUserTypeValidation();

  if (!userTypeValidation.isValid) {
    return userTypeValidation;
  }

  const userType = userTypeValidation.data;

  if (userType === "patient") {
    return usePatientValidation();
  } else if (userType === "doctor") {
    return useDoctorValidation();
  }

  return {
    isValid: false,
    error: "Contexto inválido",
  };
}
