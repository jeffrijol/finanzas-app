# Guía de Desarrollo - Finanzas App

Esta guía proporciona todo lo necesario para configurar el entorno de desarrollo, ejecutar el proyecto localmente y contribuir de forma efectiva.

---

## 📋 Prerequisites

### Software Requerido

- **Node.js**: >= 18.0.0 ([Descargar](https://nodejs.org/))
- **pnpm**: >= 8.0.0
- **SQLite**: Incluido en Prisma, no requiere instalación separada
- **Git**: Para clonar el repositorio

### Instalación de pnpm

```bash
npm install -g pnpm@8
```

### Editor Recomendado

**VS Code** con las siguientes extensiones:

- **ESLint** (`dbaeumer.vscode-eslint`)
- **Prisma** (`Prisma.prisma`)
- **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`)
- **TypeScript Vue Plugin (Volar)** (para mejor TS support)

---

## 🚀 Installation & Setup

### 1. Clonar el Repositorio

```bash
git clone https://github.com/jeffrijol/finanzas-app.git
cd finanzas-app
```

### 2. Instalar Dependencias

```bash
pnpm install
```

Esto instalará todas las dependencias del monorepo utilizando TurboRepo.

### 3. Configurar Variables de Entorno

#### Backend (packages/backend/.env)

Duplica el archivo `packages/backend/.env.local` y renómbralo a `.env`. Luego, rellena las credenciales con los datos de tu proyecto de Supabase.

**Detalle Crucial de Conexión a Base de Datos (IPv4 vs IPv6):**

Los nuevos proyectos de Supabase utilizan IPv6 de forma predeterminada para conexiones directas. Puesto que muchas redes locales y de desarrollo (como el puerto 5432) todavía no soportan IPv6, **es obligatorio usar el Connection Pooler (Supavisor)** para enrutar el tráfico vía IPv4.

Al configurar tu `.env`, asegúrate de usar los hosts del Pooler (usualmente `aws-0` o `aws-1` seguido de tu región, revisa en *Supabase Dashboard > Connect > Prisma*).

```env
# ------------------------------------------------------------
# BASE DE DATOS - Supabase Connection Pooler (RECOMENDADO para IPv4)
# ------------------------------------------------------------
# Formato del usuario: postgres.[PROJECT-REF]
# Formato del host:    aws-[N]-[REGION].pooler.supabase.com

# Transaction mode (Puerto 6543) - Usado para queries regulares de la aplicación:
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-[N]-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Session mode (Puerto 5432) - Usado directamente por Prisma para migraciones:
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-[N]-[REGION].pooler.supabase.com:5432/postgres"

# ------------------------------------------------------------
# CLIENTE SUPABASE
# ------------------------------------------------------------
SUPABASE_URL="https://[PROJECT-REF].supabase.co"
SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"

# Servidor
PORT=3001
NODE_ENV=development
```

#### Frontend (packages/frontend/.env.local)

Crear archivo `.env.local` en `packages/frontend/`:

```env
VITE_API_URL=http://localhost:3001/api
```

### 4. Inicializar Base de Datos

```bash
cd packages/backend

# Generar Prisma Client
pnpm prisma:generate

# Ejecutar migraciones
pnpm prisma:migrate

# Poblar con datos de prueba
pnpm prisma:seed

cd ../..
```

---

## 💻 Development Workflow

### Iniciar Servidores de Desarrollo

**Opción 1: Ambos servicios (recomendado)**

Desde la raíz del proyecto:

```bash
pnpm dev
```

Esto inicia:

- Frontend en `http://localhost:4321` (Vite)
- Backend en `http://localhost:3001` (Express)

**Opción 2: Servicios individuales**

```bash
# Solo frontend
cd packages/frontend
pnpm dev

# Solo backend (en otra terminal)
cd packages/backend
pnpm dev
```

### Hot Reload

- **Frontend**: Vite HMR (Hot Module Replacement) - cambios se reflejan instantáneamente
- **Backend**: `tsx watch` - servidor se reinicia automáticamente al guardar archivos

### Build de Producción

```bash
# Desde la raíz
pnpm build

# Esto ejecuta TypeScript compilation + Vite build
```

---

## 🐛 Debugging

### VS Code Launch Configuration

Crear archivo `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Backend",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["dev"],
      "cwd": "${workspaceFolder}/packages/backend",
      "skipFiles": ["<node_internals>/**"],
      "console": "integratedTerminal"
    },
    {
      "name": "Debug Frontend",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:4321",
      "webRoot": "${workspaceFolder}/packages/frontend/src"
    }
  ]
}
```

### Logs

**Backend:**

```typescript
// Los logs se muestran en la terminal donde ejecutas pnpm dev
console.log("Debug message");
```

**Frontend:**

```typescript
// Abrir DevTools del navegador (F12)
console.log("Frontend debug");
```

---

## 🗄️ Database Management

### Prisma Studio

Interfaz visual para explorar y editar datos:

```bash
pnpm db:studio
# Abre en http://localhost:5555
```

### Migraciones

**Crear nueva migración:**

```bash
cd packages/backend
npx prisma migrate dev --name nombre_descriptivo
```

**Aplicar migraciones:**

```bash
pnpm prisma:migrate
```

**Reset completo de BD:**

```bash
cd packages/backend
npx prisma migrate reset
# Esto borra la BD, ejecuta migrations y seed
```

### Seeding

Poblar BD con datos de prueba:

```bash
cd packages/backend
pnpm prisma:seed
```

El seed se define en `packages/backend/prisma/seed.ts`.

---

## 🎨 Code Style & Linting

### ESLint

**Ejecutar lint:**

```bash
# Todo el monorepo
pnpm lint

# Solo frontend
cd packages/frontend
pnpm lint

# Solo backend
cd packages/backend
pnpm lint
```

**Configuración:**

- Frontend: `packages/frontend/eslint.config.js`
- Backend: `packages/backend/eslint.config.js`

### Prettier (si se configura)

Actualmente no hay Prettier configurado. Si deseas añadirlo:

```bash
pnpm add -D -w prettier
```

---

## ✅ Testing

### Ejecutar Tests

```bash
# Todo el monorepo
pnpm test

# Solo backend (Vitest configurado)
cd packages/backend
pnpm test

# Watch mode
pnpm test:watch
```

**Nota:** Actualmente el proyecto tiene `--passWithNoTests` configurado, por lo que el comando pasa aunque no haya tests.

### Coverage

```bash
cd packages/backend
pnpm test --coverage
```

---

## ❗ Common Issues & Solutions

### Error: "Module not found" o dependencias desactualizadas

```bash
# Limpiar node_modules y reinstalar
rm -rf node_modules packages/*/node_modules
pnpm install
```

### Error: "Port 3001 already in use"

**Windows:**

```bash
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

**Linux/Mac:**

```bash
lsof -ti:3001 | xargs kill -9
```

### Error: "Prisma Client not generated"

```bash
cd packages/backend
pnpm prisma:generate
```

### Error: "Cannot find module '@prisma/client'"

Asegúrate de haber ejecutado `prisma:generate` y que estás importando desde la ubicación correcta:

```typescript
import { PrismaClient } from "@prisma/client";
```

### Frontend no se conecta al backend (CORS)

Verificar que el backend está ejecutándose en `http://localhost:3001` y que `VITE_API_URL` está correctamente configurado en `.env.local`.

### Cache de Vite corrupto

```bash
cd packages/frontend
rm -rf node_modules/.vite
pnpm dev
```

### Build de TypeScript falla

```bash
# Limpiar builds previos
pnpm clean

# Verificar errores de tipos
cd packages/backend
pnpm exec tsc --noEmit

cd ../frontend
pnpm exec tsc --noEmit
```

---

## 🛠️ Tools & Extensions

### VS Code Settings Recomendados

Crear `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "[prisma]": {
    "editor.defaultFormatter": "Prisma.prisma"
  }
}
```

### Extensiones Útiles

- **Error Lens**: Muestra errores inline
- **GitLens**: Mejor integración con Git
- **Thunder Client**: Cliente REST para probar API
- **Prisma**: Syntax highlighting para schemas
- **Tailwind CSS IntelliSense**: Autocompletado de clases

### DevTools

- **React DevTools**: Para debugging del frontend
- **TanStack Query DevTools**: Ya integrado en el proyecto (desarrollo only)
- **Prisma Studio**: Visualizar y editar base de datos

---

## 📦 Monorepo Structure

Este proyecto usa **TurboRepo** para gestionar el monorepo.

### Workspaces

- `packages/frontend` - React + Vite app
- `packages/backend` - Express API

### Dependencies Compartidas

Las dependencias compartidas se instalan en la raíz:

```bash
pnpm add -w <package-name>
```

Para dependencias específicas de un workspace:

```bash
cd packages/frontend
pnpm add <package-name>
```

---

## 🚢 Deployment (Futuro)

Actualmente el proyecto está en fase de desarrollo. Para deployment:

1. Build de producción: `pnpm build`
2. Backend: Servir desde `packages/backend/dist`
3. Frontend: Servir static files desde `packages/frontend/dist`

---

## 🔗 Links Útiles

- [Prisma Docs](https://www.prisma.io/docs)
- [Vite Docs](https://vite.dev/guide/)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)

---

## 📞 Soporte

Para problemas o preguntas, abrir un issue en el repositorio o consultar la [documentación adicional](../README.md).
