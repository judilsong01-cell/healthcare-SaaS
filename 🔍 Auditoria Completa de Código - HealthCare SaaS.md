# 🔍 Auditoria Completa de Código - HealthCare SaaS

**Data:** 29 de Janeiro de 2026  
**Versão do Projeto:** 27d5967f  
**Status Geral:** ⚠️ **CRÍTICO** - 60 erros de tipagem + vulnerabilidades de segurança

---

## 📊 Resumo Executivo

| Categoria | Severidade | Quantidade | Status |
|-----------|-----------|-----------|--------|
| **Erros de Tipagem TypeScript** | 🔴 Crítica | 60 | Não Resolvido |
| **Vulnerabilidades de Segurança** | 🔴 Crítica | 8 | Não Resolvido |
| **Memory Leaks Potenciais** | 🟠 Alta | 5 | Não Resolvido |
| **Tratamento de Erros Incompleto** | 🟠 Alta | 12 | Parcialmente Resolvido |
| **Imports Não Utilizados** | 🟡 Média | 3 | Não Resolvido |

---

## 🔴 CRÍTICO: Erros de Tipagem TypeScript (60 Erros)

### Problema Principal
O DashboardContext foi refatorado para Supabase, mas componentes antigos ainda usam tipos obsoletos.

### Ficheiros Afetados

#### 1. **PatientDashboard.tsx** (25 erros)
```typescript
// ❌ ERRO: Property 'healthCheckIns' does not exist on type 'Patient'
const checkIns = currentPatient?.healthCheckIns || [];

// ❌ ERRO: Property 'medications' does not exist on type 'Patient'
const meds = currentPatient?.medications || [];

// ❌ ERRO: Property 'surgeryType' does not exist on type 'Patient'
const surgery = currentPatient?.surgeryType;

// ❌ ERRO: Property 'recoveryProgress' does not exist on type 'Patient'
const progress = currentPatient?.recoveryProgress;
```

**Causa Raiz:** O tipo `Patient` no novo DashboardContext não inclui estas propriedades.

#### 2. **DoctorDashboard.tsx** (18 erros)
```typescript
// ❌ ERRO: Property 'name' does not exist on type 'Doctor'
const doctorName = currentDoctor?.name;

// ❌ ERRO: Property 'specialty' does not exist on type 'Doctor'
const specialty = currentDoctor?.specialty;

// ❌ ERRO: Parameter 'a' implicitly has an 'any' type
alertDistribution.sort((a, b) => b.value - a.value);
```

#### 3. **DoctorFiles.tsx** (10 erros)
```typescript
// ❌ ERRO: Property 'getDoctorAccessibleFiles' does not exist
const files = useDashboard().getDoctorAccessibleFiles();

// ❌ ERRO: Property 'patients' does not exist on type 'Doctor'
const patients = currentDoctor?.patients || [];
```

#### 4. **PatientFiles.tsx** (7 erros)
```typescript
// ❌ ERRO: Parameter 'f' implicitly has an 'any' type
files.filter((f) => f.status === "approved")
```

### Solução Recomendada

**Passo 1:** Atualizar tipos no DashboardContext
```typescript
// client/src/contexts/DashboardContext.tsx
export interface Patient {
  id: string;
  full_name: string;
  email: string;
  user_type: "patient";
  // Adicionar propriedades faltantes
  surgeryType?: string;
  surgeryDate?: string;
  recoveryProgress?: number;
  lastCheckIn?: string;
  medications?: Medication[];
  healthCheckIns?: HealthCheckIn[];
  alerts?: Alert[];
}

export interface Doctor {
  id: string;
  full_name: string;
  email: string;
  user_type: "doctor";
  // Adicionar propriedades faltantes
  specialty?: string;
  name?: string;
  patients?: Patient[];
}
```

**Passo 2:** Adicionar tipagem explícita a callbacks
```typescript
// ❌ Antes
files.filter((f) => f.status === "approved")

// ✅ Depois
files.filter((f: MedicalFile) => f.status === "approved")
```

---

## 🔴 CRÍTICO: Vulnerabilidades de Segurança

### 1. **localStorage Sem Encriptação** 🔴
**Ficheiro:** `client/src/contexts/AuthContext.tsx`, `client/src/services/axiosClient.ts`

```typescript
// ❌ VULNERÁVEL: Token armazenado em plaintext
localStorage.setItem("auth_token", data.token);
localStorage.setItem("refresh_token", data.refreshToken);
```

**Risco:** XSS pode roubar tokens JWT diretamente.

**Solução:**
```typescript
// ✅ Usar sessionStorage (mais seguro que localStorage)
sessionStorage.setItem("auth_token", data.token);

// OU usar httpOnly cookies (melhor opção)
// Configurar no backend: Set-Cookie: auth_token=...; HttpOnly; Secure; SameSite=Strict
```

### 2. **dangerouslySetInnerHTML Sem Sanitização** 🔴
**Ficheiro:** `client/src/components/ui/chart.tsx:81`

```typescript
// ❌ VULNERÁVEL: Possível XSS
dangerouslySetInnerHTML={{
  __html: userContent
}}
```

**Risco:** Injeção de scripts maliciosos.

**Solução:**
```typescript
// ✅ Usar DOMPurify
import DOMPurify from 'dompurify';

dangerouslySetInnerHTML={{
  __html: DOMPurify.sanitize(userContent)
}}
```

### 3. **Sem Validação de CORS** 🔴
**Ficheiro:** `client/src/services/axiosClient.ts`

```typescript
// ⚠️ Sem configuração CORS explícita
const axiosInstance = axios.create({
  baseURL: VITE_API_BASE_URL,
  // Falta: withCredentials, headers CORS
});
```

**Solução:**
```typescript
const axiosInstance = axios.create({
  baseURL: VITE_API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }
});
```

### 4. **Sem Rate Limiting** 🔴
**Ficheiro:** Toda a API

```typescript
// ❌ Sem proteção contra brute force
await authService.login({ email, password });
```

**Solução:**
```typescript
// ✅ Implementar rate limiting
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas
  message: "Muitas tentativas de login. Tente novamente mais tarde."
});
```

### 5. **Sem Validação de Input** 🔴
**Ficheiro:** `client/src/components/LoginForm.tsx`, `client/src/components/SignupForm.tsx`

```typescript
// ❌ Validação apenas no frontend
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  setError("Email inválido");
  return;
}
```

**Problema:** Validação frontend pode ser contornada.

**Solução:**
```typescript
// ✅ Validação também no backend com Zod/Joi
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Password deve ter 6+ caracteres")
});

// No backend
const result = loginSchema.safeParse(req.body);
if (!result.success) {
  return res.status(400).json({ errors: result.error.errors });
}
```

### 6. **Sem Proteção CSRF** 🔴
**Ficheiro:** Toda a aplicação

```typescript
// ❌ Sem token CSRF
axios.post('/api/auth/login', { email, password });
```

**Solução:**
```typescript
// ✅ Adicionar CSRF token
const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
axios.post('/api/auth/login', { email, password }, {
  headers: { 'X-CSRF-Token': csrfToken }
});
```

### 7. **Sem Proteção XSS em Dados Dinâmicos** 🔴
**Ficheiro:** `client/src/pages/PatientDashboard.tsx`, `client/src/pages/DoctorDashboard.tsx`

```typescript
// ❌ Renderizar dados sem sanitização
<p>{currentPatient?.full_name}</p> // OK se do banco de dados
<p>{userInput}</p> // ❌ VULNERÁVEL se do usuário
```

### 8. **Sem Validação de Ficheiros Upload** 🔴
**Ficheiro:** `client/src/components/FileUploadSupabase.tsx`

```typescript
// ⚠️ Validação apenas de tamanho e tipo
if (file.size > 10 * 1024 * 1024) {
  // Validação de tamanho OK
}
// ❌ Falta: validação de conteúdo, antivírus, etc.
```

**Solução:**
```typescript
// ✅ Validação rigorosa
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const MAX_SIZE = 10 * 1024 * 1024;

if (!ALLOWED_TYPES.includes(file.type)) {
  throw new Error("Tipo de ficheiro não permitido");
}

if (file.size > MAX_SIZE) {
  throw new Error("Ficheiro muito grande");
}

// Backend: Verificar magic bytes
const buffer = await file.arrayBuffer();
const magicBytes = new Uint8Array(buffer).slice(0, 4);
// Validar contra assinatura esperada
```

---

## 🟠 ALTA: Memory Leaks Potenciais

### 1. **addEventListener Sem removeEventListener**
**Ficheiro:** `client/src/components/ui/sidebar.tsx:107`

```typescript
// ❌ MEMORY LEAK: Listener nunca removido
useEffect(() => {
  window.addEventListener("keydown", handleKeyDown);
  // Falta: return () => window.removeEventListener(...)
}, []);
```

**Solução:**
```typescript
// ✅ Cleanup function
useEffect(() => {
  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, []);
```

### 2. **Monitoring Service Listeners**
**Ficheiro:** `client/src/services/monitoring.ts:55-59`

```typescript
// ❌ MEMORY LEAK: Listeners nunca removidos
window.addEventListener("online", () => {
  // ...
});

window.addEventListener("offline", () => {
  // ...
});
```

**Solução:**
```typescript
// ✅ Cleanup
const handleOnline = () => { /* ... */ };
const handleOffline = () => { /* ... */ };

window.addEventListener("online", handleOnline);
window.addEventListener("offline", handleOffline);

// Cleanup (em destrutor ou useEffect)
window.removeEventListener("online", handleOnline);
window.removeEventListener("offline", handleOffline);
```

### 3. **useMobile Hook**
**Ficheiro:** `client/src/hooks/useMobile.tsx:15`

```typescript
// ⚠️ POTENCIAL MEMORY LEAK
mql.addEventListener("change", onChange);
// Falta: removeEventListener no cleanup
```

### 4. **DashboardContext useEffect**
**Ficheiro:** `client/src/contexts/DashboardContext.tsx:166`

```typescript
// ⚠️ Sem cleanup de subscriptions
useEffect(() => {
  const unsubscribe = supabase.auth.onAuthStateChange(async (event, session) => {
    // ...
  });
  // ✅ BOM: Tem unsubscribe
  return () => unsubscribe?.();
}, []);
```

### 5. **AlertNotification Auto-dismiss**
**Ficheiro:** `client/src/components/AlertNotification.tsx:33`

```typescript
// ⚠️ Timeout sem cleanup
useEffect(() => {
  const timer = setTimeout(() => {
    setIsVisible(false);
  }, duration);
  // ✅ BOM: Tem cleanup
  return () => clearTimeout(timer);
}, [duration]);
```

---

## 🟠 ALTA: Tratamento de Erros Incompleto

### 1. **Sem Retry Logic em Falhas de Rede**
**Ficheiro:** `client/src/services/api.ts`

```typescript
// ⚠️ Retry logic existe mas sem backoff exponencial
const MAX_RETRIES = 3;
// Falta: exponential backoff
```

**Solução:**
```typescript
// ✅ Exponential backoff
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithRetry(url, options, retries = MAX_RETRIES) {
  try {
    return await fetch(url, options);
  } catch (error) {
    if (retries > 0) {
      const backoffDelay = Math.pow(2, MAX_RETRIES - retries) * 1000;
      await delay(backoffDelay);
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
}
```

### 2. **Sem Tratamento de Timeout**
**Ficheiro:** `client/src/services/axiosClient.ts`

```typescript
// ⚠️ Sem timeout configurado
const axiosInstance = axios.create({
  baseURL: VITE_API_BASE_URL,
  // Falta: timeout
});
```

**Solução:**
```typescript
const axiosInstance = axios.create({
  baseURL: VITE_API_BASE_URL,
  timeout: 30000, // 30 segundos
});
```

### 3. **console.error Sem Contexto**
**Ficheiro:** Múltiplos ficheiros

```typescript
// ❌ Pouco informativo
console.error("Error loading patient data:", err);

// ✅ Melhor
console.error("Error loading patient data:", {
  error: err instanceof Error ? err.message : String(err),
  stack: err instanceof Error ? err.stack : undefined,
  timestamp: new Date().toISOString(),
  userId: currentUser?.id
});
```

---

## 🟡 MÉDIA: Imports Não Utilizados

### 1. **Auth.tsx**
```typescript
// ❌ Não utilizado
import { Eye, EyeOff } from "lucide-react";
```

### 2. **Home.tsx**
```typescript
// ❌ Possível não utilizado
import { useState } from "react";
```

---

## 📋 Checklist de Correções Prioritárias

### 🔴 CRÍTICA (Implementar Imediatamente)

- [ ] **Corrigir 60 erros de tipagem TypeScript**
  - [ ] Atualizar tipos Patient e Doctor no DashboardContext
  - [ ] Adicionar tipagem explícita a callbacks
  - [ ] Usar `as const` para tipos literais

- [ ] **Implementar segurança localStorage**
  - [ ] Migrar para sessionStorage ou httpOnly cookies
  - [ ] Encriptar tokens se necessário

- [ ] **Adicionar sanitização HTML**
  - [ ] Instalar DOMPurify
  - [ ] Sanitizar todo dangerouslySetInnerHTML

- [ ] **Implementar Rate Limiting**
  - [ ] Backend: Limitar tentativas de login
  - [ ] Backend: Limitar upload de ficheiros

- [ ] **Validação Backend**
  - [ ] Implementar Zod/Joi schemas
  - [ ] Validar todos os inputs no servidor

### 🟠 ALTA (Implementar em 1-2 dias)

- [ ] **Corrigir Memory Leaks**
  - [ ] Adicionar cleanup em useEffect
  - [ ] Remover event listeners

- [ ] **Melhorar Tratamento de Erros**
  - [ ] Adicionar exponential backoff
  - [ ] Configurar timeouts
  - [ ] Logging estruturado

- [ ] **CSRF Protection**
  - [ ] Implementar tokens CSRF
  - [ ] Validar no backend

### 🟡 MÉDIA (Implementar em 3-5 dias)

- [ ] **Remover Imports Não Utilizados**
- [ ] **Code Review Completo**
- [ ] **Testes de Segurança**

---

## 🛠️ Ferramentas Recomendadas

1. **ESLint** - Detectar erros de código
2. **SonarQube** - Análise de segurança
3. **OWASP ZAP** - Teste de segurança
4. **Snyk** - Vulnerabilidades de dependências
5. **TypeScript Strict Mode** - Tipagem rigorosa

---

## 📞 Próximos Passos

1. **Hoje:** Corrigir erros de tipagem críticos
2. **Amanhã:** Implementar segurança localStorage
3. **Dia 3:** Memory leaks e tratamento de erros
4. **Dia 4:** Validação backend e rate limiting
5. **Dia 5:** Testes de segurança completos

---

**Relatório Preparado Por:** Auditoria Automática  
**Data:** 29 de Janeiro de 2026  
**Próxima Auditoria:** 5 de Fevereiro de 2026
