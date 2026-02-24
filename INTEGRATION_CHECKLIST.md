# 🔗 Checklist de Integração - Backend e Base de Dados

**Versão:** 1.0.0  
**Data:** 29 de Janeiro de 2026

Este documento guia a integração do frontend HealthCare SaaS com seu backend e base de dados.

---

## 📋 Pré-Integração

### ✅ Preparação do Projeto
- [ ] Projeto extraído e dependências instaladas
- [ ] `pnpm dev` funcionando sem erros
- [ ] Landing page acessível em http://localhost:3000
- [ ] Modo demo ativado (sem Supabase)

### ✅ Ambiente Backend
- [ ] Backend preparado (Node.js, Python, Java, etc.)
- [ ] Base de dados configurada (PostgreSQL, MySQL, MongoDB)
- [ ] Servidor rodando em porta diferente (ex: 3001, 5000)
- [ ] CORS configurado para aceitar http://localhost:3000

---

## 🗄️ Fase 1: Estrutura de Base de Dados

### Tabelas Necessárias

#### 1. **users** (Autenticação)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  user_type ENUM('patient', 'doctor', 'admin'),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Checklist:**
- [ ] Tabela criada
- [ ] Índice em `email`
- [ ] Constraints de password
- [ ] Soft delete implementado

#### 2. **profiles** (Dados de Utilizador)
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES users(id),
  avatar_url VARCHAR(500),
  phone VARCHAR(20),
  date_of_birth DATE,
  specialty VARCHAR(100),  -- Para médicos
  clinic_id UUID,
  bio TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Checklist:**
- [ ] Tabela criada
- [ ] Foreign key para users
- [ ] Índices em clinic_id

#### 3. **medical_files** (Documentos)
```sql
CREATE TABLE medical_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES users(id),
  file_name VARCHAR(255),
  file_path VARCHAR(500),
  file_size INTEGER,
  file_type VARCHAR(50),
  category VARCHAR(100),
  description TEXT,
  status ENUM('pending', 'approved', 'archived'),
  uploaded_by UUID REFERENCES users(id),
  uploaded_at TIMESTAMP DEFAULT NOW(),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  deleted_at TIMESTAMP
);
```

**Checklist:**
- [ ] Tabela criada
- [ ] Índices em patient_id, status
- [ ] Soft delete com deleted_at
- [ ] Timestamps completos

#### 4. **doctor_patient_relations** (Relacionamentos)
```sql
CREATE TABLE doctor_patient_relations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES users(id),
  patient_id UUID NOT NULL REFERENCES users(id),
  status ENUM('active', 'inactive', 'archived'),
  assigned_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(doctor_id, patient_id)
);
```

**Checklist:**
- [ ] Tabela criada
- [ ] Índices em doctor_id, patient_id
- [ ] Constraint UNIQUE

#### 5. **medications** (Medicações)
```sql
CREATE TABLE medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES users(id),
  name VARCHAR(255),
  dosage VARCHAR(100),
  frequency VARCHAR(100),
  start_date DATE,
  end_date DATE,
  instructions TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Checklist:**
- [ ] Tabela criada
- [ ] Índices em patient_id

#### 6. **medication_logs** (Histórico)
```sql
CREATE TABLE medication_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id UUID NOT NULL REFERENCES medications(id),
  patient_id UUID NOT NULL REFERENCES users(id),
  taken_at TIMESTAMP,
  status ENUM('taken', 'missed', 'skipped'),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Checklist:**
- [ ] Tabela criada
- [ ] Índices em medication_id, patient_id

#### 7. **health_check_ins** (Check-ins)
```sql
CREATE TABLE health_check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES users(id),
  temperature DECIMAL(5,2),
  pain_level INTEGER CHECK (pain_level >= 0 AND pain_level <= 10),
  symptoms TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Checklist:**
- [ ] Tabela criada
- [ ] Índices em patient_id, created_at

#### 8. **alerts** (Alertas)
```sql
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID REFERENCES users(id),
  patient_id UUID NOT NULL REFERENCES users(id),
  alert_type VARCHAR(50),
  message TEXT,
  severity ENUM('low', 'medium', 'high', 'critical'),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  read_at TIMESTAMP
);
```

**Checklist:**
- [ ] Tabela criada
- [ ] Índices em doctor_id, patient_id, is_read

#### 9. **access_logs** (Auditoria)
```sql
CREATE TABLE access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  action VARCHAR(100),
  resource_type VARCHAR(50),
  resource_id UUID,
  ip_address VARCHAR(50),
  user_agent TEXT,
  status_code INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Checklist:**
- [ ] Tabela criada
- [ ] Índices em user_id, created_at
- [ ] Política de retenção (ex: 90 dias)

---

## 🔐 Fase 2: Autenticação e Segurança

### JWT Implementation
```typescript
// Backend: Gerar JWT
const token = jwt.sign(
  { 
    userId: user.id, 
    email: user.email,
    userType: user.user_type 
  },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);

// Response
res.json({
  success: true,
  token,
  user: { id: user.id, email: user.email, userType: user.user_type }
});
```

**Checklist:**
- [ ] JWT_SECRET configurado em .env
- [ ] Token expiration definido
- [ ] Refresh token implementado
- [ ] Middleware de verificação criado

### Password Hashing
```typescript
// Usar bcrypt ou similar
import bcrypt from 'bcrypt';

const hashedPassword = await bcrypt.hash(password, 10);
```

**Checklist:**
- [ ] bcrypt ou equivalente instalado
- [ ] Salt rounds configurado (10+)
- [ ] Verificação de password implementada

### CORS Configuration
```typescript
// Backend
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

**Checklist:**
- [ ] CORS configurado
- [ ] Credentials habilitado
- [ ] Headers apropriados

---

## 🔌 Fase 3: Endpoints de API

### Autenticação
```
POST /api/auth/signup
  Body: { email, password, full_name, user_type }
  Response: { token, user }

POST /api/auth/login
  Body: { email, password }
  Response: { token, user }

POST /api/auth/logout
  Headers: { Authorization: Bearer token }
  Response: { success: true }

GET /api/auth/me
  Headers: { Authorization: Bearer token }
  Response: { user }
```

**Checklist:**
- [ ] Endpoints implementados
- [ ] Validação de input
- [ ] Tratamento de erros
- [ ] Testes manuais

### Pacientes
```
GET /api/patients/:id
  Response: { id, full_name, email, ... }

PUT /api/patients/:id
  Body: { full_name, phone, ... }
  Response: { success: true, user }

GET /api/patients/:id/medications
  Response: [{ id, name, dosage, ... }]

POST /api/patients/:id/check-in
  Body: { temperature, pain_level, symptoms }
  Response: { id, created_at }

GET /api/patients/:id/files
  Response: [{ id, file_name, status, ... }]
```

**Checklist:**
- [ ] Endpoints implementados
- [ ] Autorização verificada
- [ ] Paginação implementada
- [ ] Testes

### Médicos
```
GET /api/doctors/:id/patients
  Response: [{ id, full_name, status, ... }]

GET /api/doctors/:id/alerts
  Response: [{ id, patient_id, message, severity, ... }]

PUT /api/doctors/:id/alerts/:alertId
  Body: { is_read: true }
  Response: { success: true }

GET /api/doctors/:id/patients/:patientId/files
  Response: [{ id, file_name, status, ... }]
```

**Checklist:**
- [ ] Endpoints implementados
- [ ] Autorização verificada
- [ ] Filtros implementados

### Ficheiros
```
POST /api/files/upload
  Body: FormData { file, category, description }
  Response: { id, file_url, file_name }

GET /api/files/:id/download
  Response: Binary file

DELETE /api/files/:id
  Response: { success: true }

GET /api/files/:id/access-log
  Response: [{ user_id, action, timestamp }]
```

**Checklist:**
- [ ] Upload implementado
- [ ] Validação de ficheiro
- [ ] Antivírus integrado (opcional)
- [ ] Storage configurado (S3, GCS, etc.)

---

## 🔄 Fase 4: Integração Frontend

### Atualizar Variáveis de Ambiente
```bash
# client/.env.local
VITE_API_BASE_URL=http://localhost:3001
VITE_SUPABASE_URL=  # Deixar vazio se usando backend custom
VITE_SUPABASE_ANON_KEY=  # Deixar vazio
```

**Checklist:**
- [ ] .env.local atualizado
- [ ] API_BASE_URL correto
- [ ] Supabase desabilitado

### Atualizar API Service
```typescript
// client/src/services/axiosClient.ts
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
  timeout: 30000,
  withCredentials: true
});
```

**Checklist:**
- [ ] axiosClient.ts atualizado
- [ ] Interceptores funcionando
- [ ] Tokens sendo enviados

### Testar Endpoints
```bash
# Terminal 1: Backend
npm start  # ou seu comando

# Terminal 2: Frontend
pnpm dev

# Terminal 3: Testar
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**Checklist:**
- [ ] Backend rodando
- [ ] Frontend conectando
- [ ] Tokens sendo recebidos
- [ ] Dados sendo salvos

---

## 🧪 Fase 5: Testes

### Testes de Autenticação
- [ ] Signup com email válido
- [ ] Signup com email duplicado (erro)
- [ ] Login com credenciais corretas
- [ ] Login com credenciais incorretas (erro)
- [ ] Logout funciona
- [ ] Token expira após 24h

### Testes de Autorização
- [ ] Paciente acessa seu próprio dashboard
- [ ] Paciente não acessa dashboard de outro paciente
- [ ] Médico acessa apenas seus pacientes
- [ ] Médico não acessa ficheiros de outro médico

### Testes de Ficheiros
- [ ] Upload de ficheiro válido
- [ ] Upload de ficheiro grande (erro)
- [ ] Upload de tipo inválido (erro)
- [ ] Download de ficheiro
- [ ] Eliminar ficheiro próprio
- [ ] Não eliminar ficheiro de outro

### Testes de Performance
- [ ] Dashboard carrega em < 2s
- [ ] Upload de 5MB em < 10s
- [ ] Lista de 100 ficheiros em < 1s

---

## 📊 Fase 6: Monitoramento

### Logging
```typescript
// Backend
console.log({
  timestamp: new Date().toISOString(),
  level: 'info',
  action: 'user_login',
  userId: user.id,
  ip: req.ip
});
```

**Checklist:**
- [ ] Logging estruturado implementado
- [ ] Níveis de log configurados
- [ ] Rotação de logs configurada

### Métricas
- [ ] Tempo de resposta da API
- [ ] Taxa de erro
- [ ] Utilização de CPU/Memória
- [ ] Tamanho do banco de dados

**Checklist:**
- [ ] Prometheus/DataDog configurado
- [ ] Dashboards criados
- [ ] Alertas configurados

---

## 🚀 Fase 7: Deploy

### Staging
- [ ] Backend em staging
- [ ] Base de dados em staging
- [ ] Frontend apontando para staging
- [ ] Testes completos em staging

### Produção
- [ ] Backup de base de dados
- [ ] SSL/TLS configurado
- [ ] Rate limiting ativado
- [ ] Firewall configurado
- [ ] Monitoramento ativo

---

## 📝 Notas Importantes

### Segurança
- ⚠️ Nunca armazene senhas em plaintext
- ⚠️ Sempre valide input no backend
- ⚠️ Use HTTPS em produção
- ⚠️ Implemente rate limiting
- ⚠️ Mantenha logs de auditoria

### Performance
- ⚠️ Use índices de base de dados
- ⚠️ Implemente cache (Redis)
- ⚠️ Pagine resultados grandes
- ⚠️ Comprima ficheiros

### Compliance
- ⚠️ GDPR: Direito ao esquecimento
- ⚠️ HIPAA: Encriptação de dados médicos
- ⚠️ LGPD: Consentimento do utilizador
- ⚠️ Conformidade local

---

## 📞 Suporte

Para dúvidas durante integração:

1. Consultar [CODE_SECURITY_AUDIT.md](./CODE_SECURITY_AUDIT.md)
2. Revisar [SUPABASE_INTEGRATION_GUIDE.md](./SUPABASE_INTEGRATION_GUIDE.md)
3. Verificar logs: `client/src/.manus-logs/`

---

## ✅ Checklist Final

- [ ] Todas as tabelas criadas
- [ ] Todos os endpoints implementados
- [ ] Autenticação funcionando
- [ ] Autorização verificada
- [ ] Testes passando
- [ ] Monitoramento ativo
- [ ] Deploy em staging
- [ ] Deploy em produção

---

**Próximo Passo:** Iniciar Fase 1 - Estrutura de Base de Dados

Boa sorte! 🚀
