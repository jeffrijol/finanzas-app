# Obtener Token de Usuario de Testing
# NO usar este script para obtener tu token personal

Write-Host "🔑 Obtener Token de Usuario de Testing" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  IMPORTANTE: Este token debe ser de un usuario de testing dedicado," -ForegroundColor Yellow
Write-Host "   NO de tu cuenta personal" -ForegroundColor Yellow
Write-Host ""

# Paso 1: Crear usuario de testing
Write-Host "📝 Paso 1: Crear Usuario de Testing" -ForegroundColor Green
Write-Host "Si aún no existe, créalo en Supabase:"
Write-Host ""
Write-Host "Opción A - Desde Dashboard de Supabase:" -ForegroundColor White
Write-Host "1. Ve a: https://supabase.com/dashboard/project/acwpspefmsjhspidimxb/auth/users"
Write-Host "2. Click 'Add user' > 'Create new user'"
Write-Host "3. Email: test-load@finanzas-app.local"
Write-Host "4. Password: TestLoad123!"
Write-Host "5. Click 'Create user'"
Write-Host ""
Write-Host "Opción B - Registro manual:" -ForegroundColor White
Write-Host "1. Abre http://localhost:4321/auth en modo incógnito"
Write-Host "2. Registra usuario: test-load@finanzas-app.local"
Write-Host "3. Password: TestLoad123!"
Write-Host ""

# Paso 2: Obtener token
Write-Host "📝 Paso 2: Obtener Token" -ForegroundColor Green
Write-Host "1. Login con el usuario de testing (en modo incógnito si es necesario)"
Write-Host "2. Presiona F12 para abrir DevTools"
Write-Host "3. Ve a Console"
Write-Host "4. Ejecuta este comando:" -ForegroundColor White
Write-Host ""
Write-Host "   // Copiar y pegar en Console:" -ForegroundColor Cyan
Write-Host '   JSON.parse(localStorage.getItem("sb-acwpspefmsjhspidimxb-auth-token"))?.access_token'
Write-Host ""
Write-Host "5. Copia el token resultante (string largo)"
Write-Host ""

# Paso 3: Configurar en PowerShell
Write-Host "📝 Paso 3: Configurar Token" -ForegroundColor Green
Write-Host "Ejecuta en PowerShell (reemplaza YOUR_TOKEN):" -ForegroundColor White
Write-Host ""
Write-Host '   $env:TEST_LOAD_TOKEN = "YOUR_TOKEN_HERE"' -ForegroundColor Cyan
Write-Host ""

# Paso 4: Verificar
Write-Host "📝 Paso 4: Verificar Configuración" -ForegroundColor Green
Write-Host "Ejecuta:" -ForegroundColor White
Write-Host ""
Write-Host '   $env:TEST_LOAD_TOKEN' -ForegroundColor Cyan
Write-Host ""
Write-Host "Debería mostrar el token. Si está vacío, repite paso 3." -ForegroundColor Yellow
Write-Host ""

# Notas importantes
Write-Host "⚠️  Notas Importantes:" -ForegroundColor Yellow
Write-Host "   • El token expira después de 1 hora"
Write-Host "   • Necesitarás obtener nuevo token si expira"
Write-Host "   • NUNCA uses token de tu cuenta personal para testing"
Write-Host "   • Este token tiene acceso solo a datos del usuario de testing"
Write-Host ""

# Configuración permanente (opcional)
Write-Host "💡 Configuración Permanente (Opcional):" -ForegroundColor Cyan
Write-Host "Para no tener que configurar el token cada vez:"
Write-Host ""
Write-Host "1. Crea archivo .env en raíz del proyecto"
Write-Host "2. Añade: TEST_LOAD_TOKEN=tu-token-aqui"
Write-Host "3. El token se cargará automáticamente"
Write-Host ""
Write-Host "⚠️  NO commitear .env al repositorio" -ForegroundColor Red
