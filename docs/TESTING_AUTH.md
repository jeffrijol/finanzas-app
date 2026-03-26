# Testing Auth - Guía de Pruebas Manuales

Esta guía documenta las pruebas manuales para validar el sistema de autenticación finalizado.

## 📋 Tabla de Contenidos

1. [Pruebas de Frontend Rate Limiting](#1-frontend-rate-limiting)
2. [Pruebas de Password Strength Meter](#2-password-strength-meter)
3. [Pruebas de Forgot Password Flow](#3-forgot-password-flow)
4. [Pruebas de Session Timeout](#4-session-timeout)
5. [Pruebas de Admin Dashboard](#5-admin-dashboard)
6. [Pruebas de Carga Concurrente](#6-carga-concurrente)
7. [Pruebas Multi-Tab](#7-multi-tab)
8. [Validación con Supabase MCP](#8-validación-con-supabase-mcp)

---

## 1. Frontend Rate Limiting

### Objetivo

Verificar que el sistema bloquea la UI después de 3 intentos fallidos de login.

### Pasos

1. **Setup**:
   - Asegúrate de estar en `http://localhost:4321/auth`
   - Abre DevTools > Application > Local Storage
   - Elimina la clave `auth_rate_limit` si existe

2. **Primer intento fallido**:
   - Email: `test@example.com`
   - Password: `wrongpassword1`
   - Click "Iniciar sesión"
   - ✅ **Esperado**: Toast de error, contador muestra "2 intentos restantes"

3. **Segundo intento fallido**:
   - Password: `wrongpassword2`
   - Click "Iniciar sesión"
   - ✅ **Esperado**: Toast de error, contador muestra "1 intento restante"

4. **Tercer intento fallido**:
   - Password: `wrongpassword3`
   - Click "Iniciar sesión"
   - ✅ **Esperado**:
     - Toast de error
     - Botón "Iniciar sesión" se deshabilita
     - Mensaje: "Demasiados intentos fallidos. Espera 15:00 para volver a intentar"
     - Countdown timer empieza a decrementar

5. **Verificar persistencia**:
   - Refresca la página (F5)
   - ✅ **Esperado**: El bloqueo persiste, countdown continúa

6. **Verificar localStorage**:
   - DevTools > Application > Local Storage
   - ✅ **Esperado**: Existe `auth_rate_limit` con estructura:
     ```json
     {
       "attempts": 3,
       "lockedUntil": [timestamp]
     }
     ```

7. **Cleanup**:
   - Elimina `auth_rate_limit` de localStorage para desbloquear

### Resultado

- [ ] Bloqueó después de 3 intentos
- [ ] Countdown funciona correctamente
- [ ] Persiste entre recargas
- [ ] Desbloquea después de 15 minutos (opcional - esperar o manipular timestamp)

---

## 2. Password Strength Meter

### Objetivo

Validar que el medidor de fortaleza funciona en tiempo real.

### Pasos

1. **Setup**:
   - Navega a `http://localhost:4321/auth`
   - Click en tab "Registro"

2. **Contraseña débil**:
   - Escribe: `abc`
   - ✅ **Esperado**:
     - Barra de progreso roja (0-25%)
     - Texto: "Contraseña débil" (rojo)
     - Checklist muestra todos los requisitos pendientes

3. **Contraseña media**:
   - Escribe: `Abc12345`
   - ✅ **Esperado**:
     - Barra de progreso amarilla (50%)
     - Texto: "Contraseña media" (amarillo)
     - Requisitos cumplidos tachados:
       - ✓ Al menos 8 caracteres
       - ✓ Mayúsculas y minúsculas
       - ✓ Al menos un número

4. **Contraseña fuerte**:
   - Escribe: `Abc12345!@#`
   - ✅ **Esperado**:
     - Barra de progreso verde (100%)
     - Texto: "Contraseña fuerte" (verde)
     - Todos los requisitos tachados

5. **Validación del formulario**:
   - Intenta registrar con contraseña débil (`abc`)
   - ✅ **Esperado**: HTML5 validation impide submit (minLength=8)

### Resultado

- [ ] Colores cambian correctamente (rojo/amarillo/verde)
- [ ] Checklist se actualiza en tiempo real
- [ ] Validación HTML5 funciona

---

## 3. Forgot Password Flow

### Objetivo

Probar el flujo completo de recuperación de contraseña.

### Pasos

#### 3.1 Solicitar recuperación

1. **Navegar a forgot password**:
   - Ir a `http://localhost:4321/auth`
   - Click en "¿Olvidaste tu contraseña?"
   - ✅ **Esperado**: Redirección a `/auth/forgot-password`

2. **Enviar email**:
   - Ingresa un email registrado (usa uno real que controles)
   - Click "Enviar enlace de recuperación"
   - ✅ **Esperado**:
     - Toast: "Email enviado"
     - UI muestra mensaje de éxito con instrucciones
     - Botón cambia a "Enviar a otro email"

3. **Verificar email**:
   - Revisa tu bandeja de entrada
   - ✅ **Esperado**: Email de Supabase con link de reset
   - **Nota**: Si no llega, revisa spam o usa Supabase Dashboard > Authentication > Email Templates

#### 3.2 Resetear contraseña

1. **Click en link del email**:
   - ✅ **Esperado**: Redirección a `/auth/reset-password`

2. **Ingresar nueva contraseña**:
   - Nueva contraseña: `NewSecure123!`
   - Confirmar: `NewSecure123!`
   - ✅ **Esperado**:
     - Password strength meter funciona
     - Mensaje de coincidencia: "✓ Las contraseñas coinciden" (verde)
     - Botón "Restablecer contraseña" habilitado

3. **Contraseñas no coinciden**:
   - Nueva: `NewSecure123!`
   - Confirmar: `Different456!`
   - ✅ **Esperado**:
     - Mensaje: "Las contraseñas no coinciden" (rojo)
     - Botón deshabilitado

4. **Submit exitoso**:
   - Corrige contraseñas para que coincidan
   - Click "Restablecer contraseña"
   - ✅ **Esperado**:
     - Toast: "Contraseña actualizada"
     - Redirección automática a `/auth` después de 2 segundos

5. **Verificar login con nueva contraseña**:
   - Login con la nueva contraseña
   - ✅ **Esperado**: Login exitoso

### Resultado

- [ ] Email llega correctamente
- [ ] Reset page funciona
- [ ] Password strength meter presente
- [ ] Validación de coincidencia funciona
- [ ] Nueva contraseña permite login

---

## 4. Session Timeout

### Objetivo

Verificar que aparece advertencia antes de expirar la sesión.

### Pasos

#### Preparación

**Nota**: Las sesiones de Supabase tienen duración por defecto de 60 minutos. Para probar esto sin esperar tanto, debemos simular:

1. **Opción A - Manipular token** (Avanzado):
   - Login normalmente
   - DevTools > Application > Local Storage
   - Busca la clave de sesión de Supabase
   - Manipula el `expires_at` para que expire en 6 minutos

2. **Opción B - Probar con código** (Recomendado):
   - Modifica temporalmente `useSessionTimeout.ts`:
     ```typescript
     // Cambiar línea de warningTime para probar rápido
     const { showWarning, formatTime, refreshSession } = useSessionTimeout({
       warningTime: 0.5, // 30 segundos en lugar de 5 minutos
     });
     ```

#### Prueba

1. **Login y esperar**:
   - Login exitoso
   - Si usaste Opción B: Espera 30 segundos

2. **Verificar dialog**:
   - ✅ **Esperado**:
     - Dialog modal aparece
     - Título: "Tu sesión está por expirar"
     - Countdown visible y decrementando
     - Dos botones: "Cerrar sesión" y "Mantener activa"

3. **Mantener activa**:
   - Click "Mantener activa"
   - ✅ **Esperado**:
     - Dialog se cierra
     - Sesión sigue activa
     - Console log: "Session refreshed"

4. **Cerrar sesión**:
   - Espera a que dialog aparezca de nuevo (o manipula timer)
   - Click "Cerrar sesión"
   - ✅ **Esperado**:
     - Redirección a `/auth`
     - Sesión cerrada

### Resultado

- [ ] Dialog aparece antes de expiración
- [ ] Countdown funciona
- [ ] Botón "Mantener activa" refresca sesión
- [ ] Botón "Cerrar sesión" cierra correctamente

**Importante**: Restaura el `warningTime` a 5 si usaste Opción B.

---

## 5. Admin Dashboard

### Objetivo

Verificar que solo usuarios admin pueden acceder al dashboard.

### Pasos

#### 5.1 Configurar Admin

1. **Obtener tu email de usuario**:
   - Login como usuario normal
   - DevTools > Consola > Application
   - Inspecciona el session para ver tu email

2. **Configurar .env**:

   ```bash
   # En packages/backend/.env
   ADMIN_EMAIL=tu-email@ejemplo.com
   ```

3. **Reiniciar backend**:
   - Termina `pnpm run dev` (Ctrl+C)
   - Ejecuta `pnpm run dev` nuevamente

#### 5.2 Acceso Autorizado

1. **Navegar como admin**:
   - Login con el email configurado en ADMIN_EMAIL
   - Ir a `http://localhost:4321/admin`
   - ✅ **Esperado**:
     - Página "Panel de Administración" visible
     - 4 stat cards:
       - Total Usuarios: 0
       - Sesiones Activas Hoy: 0
       - Logins (24h): 0
       - Estado del Sistema: 1 (ok)
     - Alert con "Nota de MVP" visible

#### 5.3 Acceso Denegado

1. **Logout y cambiar config**:
   - Logout
   - Cambia `ADMIN_EMAIL` a otro email en `.env`
   - Reinicia backend

2. **Intentar acceso sin permisos**:
   - Login con tu usuario real
   - Navega a `http://localhost:4321/admin`
   - ✅ **Esperado**:
     - Alert rojo "Acceso Denegado"
     - Mensaje: "Solo administradores pueden acceder a esta página"

#### 5.4 Verificar Backend

1. **Revisar logs del backend**:
   - Terminal donde corre `pnpm run dev`
   - ✅ **Esperado**: No hay errores 500

2. **Network tab**:
   - DevTools > Network
   - Busca request a `/api/admin/security-stats`
   - Como admin: ✅ Status 200
   - Como no-admin: ✅ Status 403

### Resultado

- [ ] Admin puede acceder al dashboard
- [ ] Usuario normal recibe 403
- [ ] Stat cards se muestran correctamente
- [ ] Backend responde apropiadamente

---

## 6. Carga Concurrente

### Objetivo

Simular múltiples intentos de login simultáneos y verificar rate limiting.

### Pasos

#### 6.1 Script de prueba

Crea un archivo `test-concurrent.ps1`:

```powershell
# test-concurrent.ps1
$url = "http://localhost:3001/api/auth/login"  # Ajusta según tu config
$body = @{
    email = "test@example.com"
    password = "wrongpass"
} | ConvertTo-Json

$jobs = @()
for ($i = 1; $i -le 5; $i++) {
    $jobs += Start-Job -ScriptBlock {
        param($url, $body)
        Invoke-RestMethod -Uri $url -Method POST -Body $body -ContentType "application/json" -ErrorAction SilentlyContinue
    } -ArgumentList $url, $body
}

$jobs | Wait-Job
$jobs | Receive-Job
$jobs | Remove-Job
```

#### 6.2 Ejecutar prueba

1. **Limpiar localStorage**:
   - Elimina `auth_rate_limit` si existe

2. **Ejecutar script**:

   ```powershell
   .\test-concurrent.ps1
   ```

3. **Verificar resultados**:
   - ✅ **Esperado**:
     - Primeros 2-3 requests: Error de credenciales inválidas
     - Siguientes requests: 429 Too Many Requests (si hay backend rate limit)

4. **Verificar UI**:
   - Refresca la página `/auth`
   - ✅ **Esperado**: UI bloqueada si se hicieron 3+ intentos

### Resultado

- [ ] Backend maneja múltiples requests
- [ ] Rate limiting del backend funciona (si está implementado)
- [ ] Frontend rate limit se sincroniza

---

## 7. Multi-Tab

### Objetivo

Verificar comportamiento de sesión en múltiples pestañas.

### Pasos

#### 7.1 Login en Tab 1

1. **Abrir Tab 1**:
   - `http://localhost:4321/auth`
   - Login exitoso
   - Navega a `/dashboard`

#### 7.2 Abrir Tab 2

2. **Nueva pestaña**:
   - `http://localhost:4321/`
   - ✅ **Esperado**: Muestra dashboard (sesión compartida)

#### 7.3 Logout en Tab 1

3. **Logout**:
   - En Tab 1, haz logout
   - ✅ **Esperado**: Redirección a `/auth`

4. **Verificar Tab 2**:
   - Vuelve a Tab 2
   - Intenta navegar o hacer alguna acción
   - ✅ **Esperado**:
     - Toast "Sesión expirada"
     - Redirección a `/auth` (puede requerir refresh o acción)

#### 7.4 Rate Limit compartido

5. **Fallar 3 veces en Tab 1**:
   - Login fallido 3 veces en Tab 1

6. **Verificar Tab 2**:
   - Abre `/auth` en Tab 2
   - ✅ **Esperado**: También está bloqueada (localStorage compartido)

### Resultado

- [ ] Sesión se comparte entre tabs
- [ ] Logout afecta todas las tabs
- [ ] Rate limit compartido entre tabs

---

## 8. Validación con Supabase MCP

### Objetivo

Usar Supabase MCP para validar logs de autenticación y seguridad.

### Herramientas MCP disponibles

```typescript
// Lista de tools útiles para testing
mcp_supabase -
  mcp -
  server_get_logs({
    project_id: "tu-project-id",
    service: "auth",
  });

mcp_supabase -
  mcp -
  server_get_advisors({
    project_id: "tu-project-id",
    type: "security",
  });
```

### Pasos

#### 8.1 Verificar logs de autenticación

Después de hacer pruebas de login:

1. **Query logs**:
   - Usa MCP o Supabase Dashboard
   - Auth logs > Últimas 24 horas

2. **Buscar eventos**:
   - ✅ `SIGNED_IN` - Logins exitosos
   - ✅ `SIGNED_OUT` - Logouts
   - ✅ `USER_RECOVERY_REQUESTED` - Forgot password
   - ✅ `PASSWORD_RECOVERY` - Reset password
   - ✅ Multiple failed attempts (si Supabase los registra)

#### 8.2 Security Advisors

1. **Check advisors**:

   ```
   mcp_supabase-mcp-server_get_advisors({ type: "security" })
   ```

2. **Verificar**:
   - ✅ No hay vulnerabilidades críticas
   - ✅ RLS está habilitado (si se usa Prisma con Supabase)

#### 8.3 Project health

1. **Get project details**:

   ```
   mcp_supabase-mcp-server_get_project({ id: "project-id" })
   ```

2. **Verificar**:
   - ✅ Status: `ACTIVE_HEALTHY`
   - ✅ No warnings en el dashboard

### Resultado

- [ ] Logs muestran eventos de auth correctos
- [ ] No hay advisors de seguridad críticos
- [ ] Proyecto en estado saludable

---

## 📊 Resumen de Testing

### Checklist General

- [ ] Frontend Rate Limiting completo
- [ ] Password Strength Meter completo
- [ ] Forgot Password Flow completo
- [ ] Session Timeout completo
- [ ] Admin Dashboard completo
- [ ] Carga Concurrente completo
- [ ] Multi-Tab completo
- [ ] Validación MCP completo

### Siguiente paso

Una vez completadas las pruebas, documentar cualquier issue encontrado en un archivo `ISSUES.md` para tracking.
