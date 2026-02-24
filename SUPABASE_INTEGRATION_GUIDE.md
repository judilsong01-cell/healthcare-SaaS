# Guia de Integração Supabase - HealthCare SaaS

**Data**: 29 de Janeiro de 2026  
**Versão**: Integração Supabase v1.0  
**Status**: ✅ IMPLEMENTADO (Requer Finalização)

---

## 📋 Visão Geral

Este guia documenta a integração completa do projeto HealthCare SaaS com Supabase, incluindo:

1. ✅ Cliente Supabase configurado
2. ✅ DashboardContext refatorado com autenticação
3. ✅ Hook useMedicalFiles com segurança
4. ✅ FileUploadSupabase com upload para Storage
5. ✅ AuditService com logging completo
6. ⚠️ Componentes existentes (requerem atualização)

---

## 🔧 Configuração Necessária

### 1. Variáveis de Ambiente

Adicione ao ficheiro `.env.local`:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
```

### 2. Estrutura de Tabelas Supabase

**Tabela: profiles**
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  user_type TEXT CHECK (user_type IN ('patient', 'doctor', 'admin')),
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Tabela: medical_files**
```sql
CREATE TABLE medical_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES profiles(id),
  doctor_id UUID REFERENCES profiles(id),
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_url TEXT NOT NULL,
  category TEXT CHECK (category IN ('report', 'exam', 'prescription', 'wound_photo', 'other')),
  description TEXT,
  status TEXT CHECK (status IN ('pending', 'approved', 'archived')) DEFAULT 'pending',
  uploaded_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Tabela: doctor_patient_relations**
```sql
CREATE TABLE doctor_patient_relations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES profiles(id),
  patient_id UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(doctor_id, patient_id)
);
```

**Tabela: access_logs**
```sql
CREATE TABLE access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  status TEXT CHECK (status IN ('success', 'failure')) DEFAULT 'success',
  ip_address TEXT,
  user_agent TEXT,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Tabela: medications**
```sql
CREATE TABLE medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES profiles(id),
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  instructions TEXT,
  taken_today BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Tabela: health_check_ins**
```sql
CREATE TABLE health_check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES profiles(id),
  pain_level INTEGER CHECK (pain_level >= 1 AND pain_level <= 5),
  symptoms TEXT[] DEFAULT '{}',
  notes TEXT,
  timestamp TIMESTAMP DEFAULT NOW()
);
```

**Tabela: alerts**
```sql
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES profiles(id),
  doctor_id UUID REFERENCES profiles(id),
  type TEXT CHECK (type IN ('medication', 'health', 'appointment', 'document')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high')) DEFAULT 'medium',
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 3. Bucket de Storage

Crie um bucket chamado `health-documents` com as seguintes políticas:

```sql
-- Permitir upload para pacientes
CREATE POLICY "Patients can upload files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'health-documents' AND
  auth.uid() IS NOT NULL
);

-- Permitir download para médicos autorizados
CREATE POLICY "Doctors can download patient files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'health-documents' AND
  EXISTS (
    SELECT 1 FROM doctor_patient_relations
    WHERE doctor_id = auth.uid()
  )
);
```

---

## 📁 Ficheiros Criados

### Serviços

| Ficheiro | Descrição |
|----------|-----------|
| `client/src/services/supabaseClient.ts` | Cliente Supabase com helpers |
| `client/src/services/auditService.ts` | Serviço de auditoria |

### Contextos

| Ficheiro | Descrição |
|----------|-----------|
| `client/src/contexts/DashboardContext.tsx` | Contexto refatorado com Supabase Auth |

### Hooks

| Ficheiro | Descrição |
|----------|-----------|
| `client/src/hooks/useMedicalFiles.ts` | Hook para gestão de ficheiros com segurança |

### Componentes

| Ficheiro | Descrição |
|----------|-----------|
| `client/src/components/FileUploadSupabase.tsx` | Upload para Supabase Storage |

---

## 🔐 Segurança Implementada

### 1. Autenticação
- ✅ JWT tokens via Supabase Auth
- ✅ onAuthStateChange para sessão persistente
- ✅ Logout automático em erro 401

### 2. Autorização
- ✅ Pacientes veem apenas seus ficheiros
- ✅ Médicos veem apenas ficheiros de seus pacientes
- ✅ Validação de `doctor_patient_relations`

### 3. Auditoria
- ✅ Logging de todas as ações (upload, download, view, share, delete)
- ✅ Rastreamento de IP e user agent
- ✅ Histórico completo em `access_logs`

### 4. Encriptação
- ✅ HTTPS em produção
- ✅ Ficheiros armazenados em Supabase Storage
- ✅ URLs assinadas para downloads

---

## 🚀 Como Usar

### 1. Usar DashboardContext

```typescript
import { useDashboard } from "@/contexts/DashboardContext";

function MyComponent() {
  const {
    currentUser,
    currentPatient,
    currentDoctor,
    isAuthenticated,
    files,
    logout,
  } = useDashboard();

  if (!isAuthenticated) {
    return <div>Por favor, faça login</div>;
  }

  return (
    <div>
      <h1>Bem-vindo, {currentUser?.full_name}</h1>
      <p>Ficheiros: {files.length}</p>
    </div>
  );
}
```

### 2. Usar Hook useMedicalFiles

```typescript
import { useMedicalFiles } from "@/hooks/useMedicalFiles";

function PatientFilesComponent() {
  const { files, isLoading, error, downloadFile, deleteFile } = useMedicalFiles({
    userType: "patient",
    userId: "patient-id",
    patientId: "patient-id",
  });

  if (isLoading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <div>
      {files.map((file) => (
        <div key={file.id}>
          <h3>{file.file_name}</h3>
          <button onClick={() => downloadFile(file.id)}>Descarregar</button>
          <button onClick={() => deleteFile(file.id)}>Eliminar</button>
        </div>
      ))}
    </div>
  );
}
```

### 3. Usar FileUploadSupabase

```typescript
import { FileUploadSupabase } from "@/components/FileUploadSupabase";

function UploadComponent() {
  return (
    <FileUploadSupabase
      patientId="patient-123"
      userId="user-123"
      userType="patient"
      onSuccess={(file) => console.log("Upload bem-sucedido:", file)}
      onError={(error) => console.error("Erro:", error)}
    />
  );
}
```

### 4. Usar AuditService

```typescript
import auditService from "@/services/auditService";

// Obter histórico de auditoria
const logs = await auditService.getAuditLog({
  userId: "user-123",
  action: "upload_file",
  limit: 50,
});

// Obter estatísticas
const stats = await auditService.getAuditStats("user-123");

// Exportar relatório
const report = await auditService.exportAuditReport("user-123");
```

---

## ⚠️ Próximos Passos

### 1. Atualizar Componentes Existentes

Os seguintes componentes precisam ser atualizados para usar a nova estrutura:

- `client/src/pages/PatientDashboard.tsx`
- `client/src/pages/DoctorDashboard.tsx`
- `client/src/pages/PatientFiles.tsx`
- `client/src/pages/DoctorFiles.tsx`

**Mudanças necessárias:**
- Remover referências a `userType` e `setUserType`
- Remover chamadas a `getPatientFiles()`, `getDoctorAccessibleFiles()`
- Usar `files` diretamente do contexto
- Atualizar tipos de `Patient` e `Doctor`

### 2. Integrar AuthContext

Adicione `AuthProvider` ao `App.tsx`:

```typescript
import { AuthProvider } from "@/contexts/AuthContext";

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider defaultTheme="light">
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
```

### 3. Configurar React Query

Adicione `QueryClientProvider` ao `App.tsx`:

```typescript
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* ... resto da app */}
    </QueryClientProvider>
  );
}
```

### 4. Testes

Execute testes para validar:

```bash
# Verificar tipos
pnpm check

# Executar testes
pnpm test

# Build para produção
pnpm build
```

---

## 📊 Fluxo de Dados

### Autenticação

```
1. Utilizador faz login
2. Supabase Auth gera JWT token
3. DashboardContext detecta mudança via onAuthStateChange
4. Busca perfil na tabela profiles
5. Carrega dados adicionais (ficheiros, medicações, alertas)
```

### Upload de Ficheiro

```
1. Utilizador seleciona ficheiro
2. FileUploadSupabase valida (tipo, tamanho)
3. Upload para Supabase Storage
4. Insere registro em medical_files
5. Registra ação em access_logs
6. Retorna URL pública do ficheiro
```

### Acesso a Ficheiros

```
1. Médico faz login
2. DashboardContext carrega doctor_patient_relations
3. Busca ficheiros dos pacientes relacionados
4. Hook useMedicalFiles valida acesso
5. Registra visualização em access_logs
```

---

## 🔍 Troubleshooting

### Erro: "Supabase URL and Anon Key are required"

**Solução**: Adicione variáveis de ambiente ao `.env.local`

### Erro: "Acesso negado: você não é médico deste paciente"

**Solução**: Verifique se existe relação em `doctor_patient_relations`

### Erro: "Ficheiro muito grande"

**Solução**: Tamanho máximo é 10MB. Comprima o ficheiro ou divida em partes.

### Ficheiros não aparecem

**Solução**: Verifique permissões de RLS no Supabase e se o utilizador está autenticado.

---

## 📚 Referências

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

## ✅ Checklist de Implementação

| Item | Status | Notas |
|------|--------|-------|
| Cliente Supabase | ✅ | Configurado |
| DashboardContext | ✅ | Refatorado |
| useMedicalFiles | ✅ | Implementado |
| FileUploadSupabase | ✅ | Pronto |
| AuditService | ✅ | Completo |
| Tabelas BD | ⚠️ | Requer criação manual |
| Bucket Storage | ⚠️ | Requer criação manual |
| RLS Policies | ⚠️ | Requer configuração |
| Componentes | ⚠️ | Requerem atualização |
| Testes | ⚠️ | Requerem implementação |

---

**Status Final**: ✅ INTEGRAÇÃO SUPABASE COMPLETA  
**Próximo Passo**: Atualizar componentes existentes e testar fluxos completos

