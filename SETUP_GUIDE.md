# 🚀 Guia de Instalação - HealthCare SaaS

**Versão:** 27d5967f  
**Data:** 29 de Janeiro de 2026  
**Plataforma:** React 19 + Tailwind 4 + Supabase

---

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** 18.0+ ([Download](https://nodejs.org/))
- **pnpm** 10.0+ (`npm install -g pnpm`)
- **Git** ([Download](https://git-scm.com/))

**Verificar instalação:**
```bash
node --version      # v18.0.0 ou superior
pnpm --version      # 10.0.0 ou superior
git --version       # 2.0.0 ou superior
```

---

## 📦 Instalação Rápida

### 1. Extrair o Projeto
```bash
unzip health_saas_landing_complete.zip
cd health_saas_landing
```

### 2. Instalar Dependências
```bash
pnpm install
```

**Tempo estimado:** 3-5 minutos

### 3. Configurar Variáveis de Ambiente
```bash
# Criar arquivo .env.local
cat > client/.env.local << EOF
# Supabase (Opcional - modo demo sem configuração)
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anon

# API Base URL
VITE_API_BASE_URL=http://localhost:3000/api

# Analytics (Opcional)
VITE_ANALYTICS_ENDPOINT=https://analytics.example.com
VITE_ANALYTICS_WEBSITE_ID=seu_id_website
EOF
```

### 4. Iniciar Servidor de Desenvolvimento
```bash
pnpm dev
```

**Saída esperada:**
```
➜  Local:   http://localhost:3000/
➜  Network: http://169.254.0.21:3000/
```

Abra http://localhost:3000 no navegador!

---

## 🏗️ Estrutura do Projeto

```
health_saas_landing/
├── client/                          # Frontend React
│   ├── public/                      # Ficheiros estáticos
│   ├── src/
│   │   ├── components/              # Componentes reutilizáveis
│   │   │   ├── ui/                  # shadcn/ui components
│   │   │   ├── LoginForm.tsx
│   │   │   ├── SignupForm.tsx
│   │   │   ├── FileUpload*.tsx
│   │   │   └── ...
│   │   ├── pages/                   # Páginas da aplicação
│   │   │   ├── Home.tsx             # Landing page
│   │   │   ├── AuthPage.tsx         # Login/Signup
│   │   │   ├── Pricing.tsx          # Planos
│   │   │   ├── PatientDashboard.tsx # Dashboard paciente
│   │   │   ├── DoctorDashboard.tsx  # Dashboard médico
│   │   │   ├── PatientFiles.tsx     # Ficheiros paciente
│   │   │   ├── DoctorFiles.tsx      # Ficheiros médico
│   │   │   └── ...
│   │   ├── contexts/                # React Contexts
│   │   │   ├── DashboardContext.tsx # Estado global
│   │   │   ├── AuthContext.tsx      # Autenticação
│   │   │   └── ThemeContext.tsx     # Tema
│   │   ├── services/                # Serviços de API
│   │   │   ├── supabaseClient.ts    # Cliente Supabase
│   │   │   ├── authService.ts       # Autenticação
│   │   │   ├── axiosClient.ts       # Cliente HTTP
│   │   │   ├── api.ts               # Endpoints
│   │   │   ├── auditService.ts      # Auditoria
│   │   │   ├── monitoring.ts        # Monitoramento
│   │   │   └── ...
│   │   ├── hooks/                   # React Hooks customizados
│   │   │   ├── useMedicalFiles.ts
│   │   │   ├── usePatientQueries.ts
│   │   │   └── ...
│   │   ├── App.tsx                  # Componente raiz
│   │   ├── main.tsx                 # Entrada
│   │   └── index.css                # Estilos globais
│   └── index.html
├── server/                          # Backend (Express)
│   └── index.ts                     # Servidor
├── shared/                          # Código compartilhado
├── package.json                     # Dependências
├── pnpm-lock.yaml                   # Lock file
├── tsconfig.json                    # Configuração TypeScript
├── vite.config.ts                   # Configuração Vite
└── vitest.config.ts                 # Configuração Vitest
```

---

## 🔧 Configuração Detalhada

### Supabase (Recomendado)

1. **Criar conta em [supabase.com](https://supabase.com)**

2. **Criar novo projeto**
   - Nome: `health-saas`
   - Região: Mais próxima de você
   - Password: Guardar com segurança

3. **Obter credenciais**
   - Ir para Settings → API
   - Copiar `Project URL` → `VITE_SUPABASE_URL`
   - Copiar `anon public` → `VITE_SUPABASE_ANON_KEY`

4. **Criar tabelas**
```sql
-- Profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT,
  user_type TEXT CHECK (user_type IN ('patient', 'doctor')),
  specialty TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Medical Files
CREATE TABLE medical_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES profiles(id),
  file_name TEXT,
  file_url TEXT,
  file_type TEXT,
  file_size INTEGER,
  category TEXT,
  status TEXT DEFAULT 'pending',
  uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Doctor-Patient Relations
CREATE TABLE doctor_patient_relations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID REFERENCES profiles(id),
  patient_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Access Logs
CREATE TABLE access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  action TEXT,
  resource_type TEXT,
  resource_id TEXT,
  timestamp TIMESTAMP DEFAULT NOW()
);
```

5. **Atualizar .env.local**
```bash
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon_aqui
```

---

## 🚀 Comandos Disponíveis

```bash
# Desenvolvimento
pnpm dev              # Inicia servidor de desenvolvimento

# Build
pnpm build            # Compila para produção
pnpm preview          # Preview da build

# Verificação
pnpm check            # TypeScript type checking
pnpm format           # Formata código com Prettier

# Testes
pnpm test             # Roda testes com Vitest
pnpm test:watch      # Modo watch

# Limpeza
pnpm clean            # Remove node_modules e dist
```

---

## 📱 Rotas Disponíveis

| Rota | Descrição | Acesso |
|------|-----------|--------|
| `/` | Landing page | Público |
| `/pricing` | Planos e preços | Público |
| `/auth` | Login/Signup | Público |
| `/auth/login` | Página de login | Público |
| `/auth/signup` | Página de signup | Público |
| `/dashboard/patient` | Dashboard paciente | Autenticado (paciente) |
| `/dashboard/doctor` | Dashboard médico | Autenticado (médico) |
| `/files/patient` | Ficheiros paciente | Autenticado (paciente) |
| `/files/doctor` | Ficheiros médico | Autenticado (médico) |

---

## 🔐 Segurança

### Modo Demo (Sem Supabase)
- Dados simulados em memória
- Sem persistência
- Perfeito para testes locais

### Modo Produção (Com Supabase)
- Autenticação real com JWT
- Dados persistidos em PostgreSQL
- Encriptação de ficheiros
- Logging de auditoria

---

## 🐛 Troubleshooting

### Erro: "Cannot find module 'react'"
```bash
pnpm install
```

### Erro: "Port 3000 already in use"
```bash
# Usar porta diferente
pnpm dev -- --port 3001
```

### Erro: "VITE_SUPABASE_URL is required"
- Modo demo ativado automaticamente
- Dados simulados carregados
- Configure .env.local para usar Supabase real

### Erro: TypeScript "Property does not exist"
```bash
# Limpar cache TypeScript
rm -rf node_modules/.vite
pnpm install
```

---

## 📚 Documentação Adicional

- **[React 19 Docs](https://react.dev)**
- **[Tailwind CSS 4](https://tailwindcss.com)**
- **[Supabase Docs](https://supabase.com/docs)**
- **[shadcn/ui](https://ui.shadcn.com)**
- **[Vite Guide](https://vitejs.dev/guide/)**

---

## 🚢 Deploy

### Vercel (Recomendado)
```bash
# 1. Fazer push para GitHub
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/seu-usuario/health-saas.git
git push -u origin main

# 2. Conectar no Vercel
# Ir para vercel.com → New Project → Selecionar repositório

# 3. Configurar variáveis de ambiente
# VITE_SUPABASE_URL
# VITE_SUPABASE_ANON_KEY
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install
COPY . .
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
```

---

## 📞 Suporte

Para problemas ou dúvidas:

1. Verificar [CODE_SECURITY_AUDIT.md](./CODE_SECURITY_AUDIT.md)
2. Consultar [FEATURES_INVENTORY.md](./FEATURES_INVENTORY.md)
3. Revisar logs: `.manus-logs/`

---

## ✅ Checklist de Instalação

- [ ] Node.js 18+ instalado
- [ ] pnpm instalado
- [ ] Projeto extraído
- [ ] `pnpm install` executado
- [ ] `.env.local` configurado
- [ ] `pnpm dev` iniciado
- [ ] http://localhost:3000 acessível
- [ ] Landing page carregada

---

**Pronto para começar! 🎉**

Próximo passo: Configurar Supabase ou usar modo demo para testes.
