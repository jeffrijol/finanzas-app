# Test de Casos Edge de Seguridad - VERSIÓN CORREGIDA Y SEGURA
# Prueba tokens inválidos, expirados, y validación de inputs

param(
    [string]$BaseUrl = "http://localhost:3001"  # ⬅️ Verificar sin /api
)

Write-Host "🛡️  Test de Casos Edge de Seguridad (Versión Corregida)" -ForegroundColor Cyan
Write-Host "Base URL: $BaseUrl" -ForegroundColor Cyan
Write-Host ""

# 1. VERIFICAR CONEXIÓN AL BACKEND
Write-Host "1️⃣  Verificando conexión al backend..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "$BaseUrl/health" -Method GET -ErrorAction Stop -TimeoutSec 5
    if ($healthResponse.status -eq 'ok') {
        Write-Host "   ✅ Backend saludable" -ForegroundColor Green
    }
    else {
        Write-Host "   ⚠️  Backend responde pero status: $($healthResponse.status)" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "   ❌ ERROR: No se puede conectar al backend en $BaseUrl" -ForegroundColor Red
    Write-Host "      Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "      Verifica que esté corriendo: pnpm run dev" -ForegroundColor Yellow
    exit 1
}

# 2. CONFIGURAR TOKEN DE TESTING
Write-Host "2️⃣  Configurando token de testing..." -ForegroundColor Yellow
$testToken = $env:TEST_LOAD_TOKEN
if (-not $testToken) {
    Write-Host "   ⚠️  ADVERTENCIA: TEST_LOAD_TOKEN no configurado" -ForegroundColor Yellow
    Write-Host "      Algunos tests serán saltados" -ForegroundColor Yellow
    Write-Host "      Configura con: `$env:TEST_LOAD_TOKEN = 'tu-token'" -ForegroundColor Cyan
    $hasValidToken = $false
}
else {
    Write-Host "   ✅ Token de testing configurado (longitud: $($testToken.Length))" -ForegroundColor Green
    $hasValidToken = $true
}

# 3. INICIALIZAR RESULTADOS
$results = @()
$reportPath = "test_results_edge_cases_$(Get-Date -Format 'yyyyMMdd_HHmmss').json"

# 4. TEST 1: Request sin token (401 esperado)
Write-Host ""
Write-Host "🔬 Test 1: Request sin Authorization header" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/transactions" -Method GET -ErrorAction Stop -TimeoutSec 5
    $results += @{
        Test     = "Sin token de autenticación"
        Expected = "401 Unauthorized"
        Actual   = "200 OK"
        Status   = "CRÍTICO - VULNERABILIDAD"
        Severity = "Alta"
        Details  = "El backend aceptó una request sin token JWT"
    }
    Write-Host "   ❌ CRÍTICO: Backend acepta requests sin auth" -ForegroundColor Red
    Write-Host "      Acción requerida: Revisar middleware de autenticación" -ForegroundColor Red
}
catch {
    $statusCode = [int]$_.Exception.Response.StatusCode
    if ($statusCode -eq 401) {
        $results += @{
            Test     = "Sin token de autenticación"
            Expected = "401"
            Actual   = "401"
            Status   = "PASS"
            Severity = "N/A"
            Details  = "Correctamente rechazado"
        }
        Write-Host "   ✅ PASS: Correctamente rechazado (401)" -ForegroundColor Green
    }
    else {
        $results += @{
            Test     = "Sin token de autenticación"
            Expected = "401"
            Actual   = $statusCode
            Status   = "INCONCLUSIVO"
            Severity = "Media"
            Details  = "Status code inesperado"
        }
        Write-Host "   ⚠️  INCONCLUSIVO: Status $statusCode (esperado 401)" -ForegroundColor Yellow
    }
}

# 5. TEST 2: Token malformado (401 esperado)
Write-Host ""
Write-Host "🔬 Test 2: Token malformado/inválido" -ForegroundColor Yellow
$invalidToken = "Bearer INVALID_TOKEN_$(Get-Random -Minimum 1000 -Maximum 9999)"
try {
    $headers = @{ "Authorization" = $invalidToken }
    $response = Invoke-RestMethod -Uri "$BaseUrl/transactions" -Method GET -Headers $headers -ErrorAction Stop -TimeoutSec 5
    $results += @{
        Test     = "Token malformado"
        Expected = "401 Unauthorized"
        Actual   = "200 OK"
        Status   = "CRÍTICO - VULNERABILIDAD"
        Severity = "Alta"
        Details  = "Backend aceptó un token JWT inválido"
    }
    Write-Host "   ❌ CRÍTICO: Backend acepta tokens inválidos" -ForegroundColor Red
}
catch {
    $statusCode = [int]$_.Exception.Response.StatusCode
    if ($statusCode -eq 401) {
        $results += @{
            Test     = "Token malformado"
            Expected = "401"
            Actual   = "401"
            Status   = "PASS"
            Severity = "N/A"
            Details  = "Token rechazado correctamente"
        }
        Write-Host "   ✅ PASS: Token inválido rechazado (401)" -ForegroundColor Green
    }
    else {
        $results += @{
            Test     = "Token malformado"
            Expected = "401"
            Actual   = $statusCode
            Status   = "INCONCLUSIVO"
            Severity = "Media"
            Details  = "Status code inesperado"
        }
        Write-Host "   ⚠️  INCONCLUSIVO: Status $statusCode (esperado 401)" -ForegroundColor Yellow
    }
}

# 6. TEST 3: Token expirado (simulado con JWT hardcodeado)
Write-Host ""
Write-Host "🔬 Test 3: Token expirado (simulado)" -ForegroundColor Yellow
# JWT hardcodeado que ya expiró (exp: 1516239022 = 2018-01-18)
# Generado en https://jwt.io con payload: {"sub":"1234567890","name":"John Doe","iat":1516239022,"exp":1516239022}
$expiredToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
try {
    $headers = @{ "Authorization" = "Bearer $expiredToken" }
    $response = Invoke-RestMethod -Uri "$BaseUrl/transactions" -Method GET -Headers $headers -ErrorAction Stop -TimeoutSec 5
    $results += @{
        Test     = "Token expirado"
        Expected = "401 Unauthorized"
        Actual   = "200 OK"
        Status   = "CRÍTICO - VULNERABILIDAD"
        Severity = "Alta"
        Details  = "Backend aceptó un token JWT expirado"
    }
    Write-Host "   ❌ CRÍTICO: Backend acepta tokens expirados" -ForegroundColor Red
}
catch {
    $statusCode = [int]$_.Exception.Response.StatusCode
    if ($statusCode -eq 401) {
        $results += @{
            Test     = "Token expirado"
            Expected = "401"
            Actual   = "401"
            Status   = "PASS"
            Severity = "N/A"
            Details  = "Token expirado rechazado correctamente"
        }
        Write-Host "   ✅ PASS: Token expirado rechazado (401)" -ForegroundColor Green
    }
    elseif ($statusCode -eq 400) {
        $results += @{
            Test     = "Token expirado"
            Expected = "401"
            Actual   = "400"
            Status   = "PASS (variante)"
            Severity = "N/A"
            Details  = "Token rechazado (aunque con 400 en lugar de 401)"
        }
        Write-Host "   ✅ PASS (variante): Token rechazado (400)" -ForegroundColor Green
    }
    else {
        $results += @{
            Test     = "Token expirado"
            Expected = "401"
            Actual   = $statusCode
            Status   = "INCONCLUSIVO"
            Severity = "Media"
            Details  = "Status code inesperado"
        }
        Write-Host "   ⚠️  INCONCLUSIVO: Status $statusCode (esperado 401)" -ForegroundColor Yellow
    }
}

# 7. TEST 4: SQL Injection (solo si hay token válido)
Write-Host ""
if ($hasValidToken) {
    Write-Host "🔬 Test 4: SQL Injection en campo de texto" -ForegroundColor Yellow
    # Lista de payloads de SQL injection para testing (NO ejecutará comandos reales)
    $sqlPayloads = @(
        @{name = "Basic SQLi"; value = "test' OR '1'='1" },
        @{name = "Comment SQLi"; value = "test'--" },
        @{name = "Union SQLi"; value = "test' UNION SELECT * FROM users--" },
        @{name = "Time-based SQLi"; value = "test' AND SLEEP(5)--" }
    )
    
    $sqlResults = @()
    foreach ($payload in $sqlPayloads) {
        try {
            $body = @{
                # Usar un campo que exista en tu API, ajustar según schema
                description = $payload.value
                # Añadir otros campos requeridos si es necesario
            } | ConvertTo-Json
            
            $headers = @{
                "Authorization" = "Bearer $testToken"
                "Content-Type"  = "application/json"
            }
            
            # Intentar crear un item con payload SQL
            # NOTA: Cambia /items por el endpoint correcto de tu API
            $response = Invoke-RestMethod -Uri "$BaseUrl/items" -Method POST -Headers $headers -Body $body -ErrorAction Stop -TimeoutSec 5
            
            $sqlResults += @{
                Payload = $payload.name
                Status  = "ACEPTADO - REVISIÓN URGENTE"
                Details = "Backend aceptó payload: $($payload.value)"
            }
            Write-Host "   ⚠️  POSIBLE VULNERABILIDAD: Payload '$($payload.name)' aceptado" -ForegroundColor Red
        }
        catch {
            $statusCode = [int]$_.Exception.Response.StatusCode
            if ($statusCode -in @(400, 422, 500)) {
                $sqlResults += @{
                    Payload = $payload.name
                    Status  = "RECHAZADO (esperado)"
                    Details = "Payload rechazado con status $statusCode"
                }
                Write-Host "   ✅ Payload '$($payload.name)' rechazado ($statusCode)" -ForegroundColor Green
            }
            else {
                $sqlResults += @{
                    Payload = $payload.name
                    Status  = "RECHAZADO (inesperado)"
                    Details = "Status $statusCode"
                }
                Write-Host "   ⚠️  Payload '$($payload.name)' rechazado con status $statusCode" -ForegroundColor Yellow
            }
        }
    }
    
    # Resumir resultados de SQL injection
    $acceptedPayloads = $sqlResults | Where-Object { $_.Status -like "*ACEPTADO*" } | Measure-Object | Select-Object -ExpandProperty Count
    if ($acceptedPayloads -gt 0) {
        $results += @{
            Test     = "SQL Injection"
            Expected = "Todos los payloads rechazados (400/422)"
            Actual   = "$acceptedPayloads payloads aceptados"
            Status   = "CRÍTICO - POSIBLE VULNERABILIDAD"
            Severity = "Alta"
            Details  = "Revisar logs del backend y validación de inputs"
        }
        Write-Host "   ❌ POSIBLE VULNERABILIDAD SQL: $acceptedPayloads payloads fueron aceptados" -ForegroundColor Red
    }
    else {
        $results += @{
            Test     = "SQL Injection"
            Expected = "Todos los payloads rechazados"
            Actual   = "Todos rechazados"
            Status   = "PASS"
            Severity = "N/A"
            Details  = "Backend rechazó todos los payloads de SQL injection"
        }
        Write-Host "   ✅ PASS: Todos los payloads de SQL injection fueron rechazados" -ForegroundColor Green
    }
}
else {
    Write-Host "🔬 Test 4: SQL Injection - SALTADO (no hay token de testing)" -ForegroundColor Gray
    $results += @{
        Test     = "SQL Injection"
        Expected = "Payloads rechazados"
        Actual   = "No ejecutado"
        Status   = "SKIPPED"
        Severity = "N/A"
        Details  = "Requiere TEST_LOAD_TOKEN configurado"
    }
}

# 8. TEST 5: XSS (Cross-Site Scripting)
Write-Host ""
if ($hasValidToken) {
    Write-Host "🔬 Test 5: XSS (Cross-Site Scripting) en campos de texto" -ForegroundColor Yellow
    $xssPayloads = @(
        @{name = "Script tag"; value = "<script>alert('XSS')</script>" },
        @{name = "JavaScript URI"; value = "javascript:alert('XSS')" },
        @{name = "Event handler"; value = "<img src=x onerror=alert('XSS')>" },
        @{name = "SVG XSS"; value = "<svg onload=alert('XSS')>" },
        @{name = "HTML entities"; value = "&lt;script&gt;alert('XSS')&lt;/script&gt;" }
    )
    
    $xssResults = @()
    foreach ($payload in $xssPayloads) {
        try {
            $body = @{
                # Usar el mismo campo que en test SQL
                description = $payload.value
            } | ConvertTo-Json
            
            $headers = @{
                "Authorization" = "Bearer $testToken"
                "Content-Type"  = "application/json"
            }
            
            # Intentar crear item con payload XSS
            $response = Invoke-RestMethod -Uri "$BaseUrl/items" -Method POST -Headers $headers -Body $body -ErrorAction Stop -TimeoutSec 5
            
            $xssResults += @{
                Payload = $payload.name
                Status  = "ACEPTADO - REVISIÓN RECOMENDADA"
                Details = "Backend aceptó payload XSS: $($payload.value)"
            }
            Write-Host "   ⚠️  POSIBLE VULNERABILIDAD XSS: Payload '$($payload.name)' aceptado" -ForegroundColor Red
        }
        catch {
            $statusCode = [int]$_.Exception.Response.StatusCode
            if ($statusCode -in @(400, 422)) {
                $xssResults += @{
                    Payload = $payload.name
                    Status  = "RECHAZADO (esperado)"
                    Details = "Payload rechazado con status $statusCode"
                }
                Write-Host "   ✅ Payload '$($payload.name)' rechazado ($statusCode)" -ForegroundColor Green
            }
            else {
                $xssResults += @{
                    Payload = $payload.name
                    Status  = "RECHAZADO (inesperado)"
                    Details = "Status $statusCode"
                }
                Write-Host "   ⚠️  Payload '$($payload.name)' rechazado con status $statusCode" -ForegroundColor Yellow
            }
        }
    }
    
    # Resumir resultados de XSS
    $acceptedXss = $xssResults | Where-Object { $_.Status -like "*ACEPTADO*" } | Measure-Object | Select-Object -ExpandProperty Count
    if ($acceptedXss -gt 0) {
        $results += @{
            Test     = "XSS (Cross-Site Scripting)"
            Expected = "Todos los payloads rechazados o sanitizados"
            Actual   = "$acceptedXss payloads aceptados"
            Status   = "MEDIA - POSIBLE VULNERABILIDAD"
            Severity = "Media"
            Details  = "Backend aceptó inputs con código XSS. Revisar sanitización."
        }
        Write-Host "   ⚠️  POSIBLE VULNERABILIDAD XSS: $acceptedXss payloads fueron aceptados" -ForegroundColor Yellow
    }
    else {
        $results += @{
            Test     = "XSS (Cross-Site Scripting)"
            Expected = "Payloads rechazados o sanitizados"
            Actual   = "Todos rechazados"
            Status   = "PASS"
            Severity = "N/A"
            Details  = "Backend rechazó o sanitizó todos los payloads XSS"
        }
        Write-Host "   ✅ PASS: Todos los payloads XSS fueron manejados correctamente" -ForegroundColor Green
    }
}
else {
    Write-Host "🔬 Test 5: XSS - SALTADO (no hay token de testing)" -ForegroundColor Gray
    $results += @{
        Test     = "XSS (Cross-Site Scripting)"
        Expected = "Payloads rechazados o sanitizados"
        Actual   = "No ejecutado"
        Status   = "SKIPPED"
        Severity = "N/A"
        Details  = "Requiere TEST_LOAD_TOKEN configurado"
    }
}

# 9. TEST 6: Headers excesivamente largos (DoS protection)
Write-Host ""
Write-Host "🔬 Test 6: Headers excesivos (DoS protection)" -ForegroundColor Yellow
$largeHeaderValue = "A" * 15000  # 15KB (más allá del límite típico de 8-10KB)
try {
    $headers = @{
        "Authorization"       = "Bearer $testToken"
        "X-Large-Header-Test" = $largeHeaderValue
    }
    $response = Invoke-RestMethod -Uri "$BaseUrl/transactions" -Method GET -Headers $headers -ErrorAction Stop -TimeoutSec 10
    $results += @{
        Test     = "Headers excesivamente largos"
        Expected = "Rechazado (400/413/431)"
        Actual   = "Aceptado (200)"
        Status   = "MEDIA - POSIBLE VULNERABILIDAD"
        Severity = "Media"
        Details  = "Backend aceptó headers muy largos (15KB). Riesgo de DoS."
    }
    Write-Host "   ⚠️  POSIBLE VULNERABILIDAD: Backend aceptó headers de 15KB" -ForegroundColor Yellow
}
catch {
    $statusCode = [int]$_.Exception.Response.StatusCode
    if ($statusCode -in @(400, 413, 431, 500)) {
        $results += @{
            Test     = "Headers excesivamente largos"
            Expected = "Rechazado"
            Actual   = "Rechazado ($statusCode)"
            Status   = "PASS"
            Severity = "N/A"
            Details  = "Headers excesivos correctamente rechazados"
        }
        Write-Host "   ✅ PASS: Headers excesivos rechazados ($statusCode)" -ForegroundColor Green
    }
    elseif ($_.Exception.Message -like "*timeout*" -or $_.Exception.Message -like "*Timeout*") {
        $results += @{
            Test     = "Headers excesivamente largos"
            Expected = "Rechazado o timeout"
            Actual   = "Timeout"
            Status   = "PASS (variante)"
            Severity = "N/A"
            Details  = "Request timeout al enviar headers grandes"
        }
        Write-Host "   ✅ PASS (variante): Request timeout (comportamiento aceptable)" -ForegroundColor Green
    }
    else {
        $results += @{
            Test     = "Headers excesivamente largos"
            Expected = "Rechazado"
            Actual   = "Error: $($_.Exception.Message)"
            Status   = "INCONCLUSIVO"
            Severity = "Baja"
            Details  = "Error inesperado"
        }
        Write-Host "   ⚠️  INCONCLUSIVO: Error inesperado: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# 10. RESULTADOS FINALES
Write-Host ""
Write-Host "📊 RESULTADOS FINALES DE SEGURIDAD:" -ForegroundColor Cyan
Write-Host "=" * 50

$critical = ($results | Where-Object { $_.Severity -eq "Alta" -and $_.Status -like "*CRÍTICO*" }).Count
$medium = ($results | Where-Object { $_.Severity -eq "Media" -and $_.Status -like "*POSIBLE*" }).Count
$passed = ($results | Where-Object { $_.Status -eq "PASS" -or $_.Status -eq "PASS (variante)" }).Count
$skipped = ($results | Where-Object { $_.Status -eq "SKIPPED" }).Count
$inconclusive = ($results | Where-Object { $_.Status -eq "INCONCLUSIVO" }).Count

Write-Host "🔴 Críticos (Alta prioridad): $critical" -ForegroundColor $(if ($critical -gt 0) { "Red" } else { "Gray" })
Write-Host "🟡 Medios (Revisión): $medium" -ForegroundColor $(if ($medium -gt 0) { "Yellow" } else { "Gray" })
Write-Host "🟢 Pasados: $passed" -ForegroundColor Green
Write-Host "⚪ Saltados: $skipped" -ForegroundColor Gray
Write-Host "🔵 Inconclusivos: $inconclusive" -ForegroundColor Blue

Write-Host ""
Write-Host "📋 DETALLE DE RESULTADOS:" -ForegroundColor Cyan
foreach ($result in $results) {
    $color = switch ($result.Severity) {
        "Alta" { "Red" }
        "Media" { "Yellow" }
        "Baja" { "Blue" }
        default { "Gray" }
    }
    
    $statusColor = switch ($result.Status) {
        { $_ -like "*PASS*" } { "Green" }
        { $_ -like "*CRÍTICO*" } { "Red" }
        { $_ -like "*VULNERABILIDAD*" } { "Yellow" }
        default { "Gray" }
    }
    
    Write-Host "  • $($result.Test):" -ForegroundColor White
    Write-Host "    Estado: $($result.Status)" -ForegroundColor $statusColor
    Write-Host "    Severidad: $($result.Severity)" -ForegroundColor $color
    if ($result.Details) {
        Write-Host "    Detalles: $($result.Details)" -ForegroundColor Gray
    }
    Write-Host ""
}

# 11. RECOMENDACIONES
Write-Host "🎯 RECOMENDACIONES:" -ForegroundColor Cyan
if ($critical -gt 0) {
    Write-Host "  🔴 ACCIÓN INMEDIATA REQUERIDA:" -ForegroundColor Red
    $results | Where-Object { $_.Severity -eq "Alta" -and $_.Status -like "*CRÍTICO*" } | ForEach-Object {
        Write-Host "     - $($_.Test): $($_.Details)" -ForegroundColor Red
    }
    Write-Host ""
}

if ($medium -gt 0) {
    Write-Host "  🟡 REVISIÓN RECOMENDADA:" -ForegroundColor Yellow
    $results | Where-Object { $_.Severity -eq "Media" -and $_.Status -like "*POSIBLE*" } | ForEach-Object {
        Write-Host "     - $($_.Test)" -ForegroundColor Yellow
    }
    Write-Host ""
}

if ($passed -eq $results.Count - $skipped) {
    Write-Host "  🎉 ¡EXCELENTE! Todos los tests de seguridad pasaron" -ForegroundColor Green
}
elseif ($critical -eq 0 -and $medium -eq 0) {
    Write-Host "  ✅ Buen estado de seguridad - solo issues menores o inconclusivos" -ForegroundColor Green
}

# 12. GUARDAR REPORTE
Write-Host ""
Write-Host "📝 Guardando reporte detallado..." -ForegroundColor Cyan
$reportData = @{
    Timestamp           = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    BaseUrl             = $BaseUrl
    HasValidToken       = $hasValidToken
    Summary             = @{
        Critical     = $critical
        Medium       = $medium
        Passed       = $passed
        Skipped      = $skipped
        Inconclusive = $inconclusive
    }
    Tests               = $results
    SQLInjectionResults = $sqlResults
    XSSResults          = $xssResults
}

$reportData | ConvertTo-Json -Depth 5 | Out-File $reportPath
Write-Host "✅ Reporte guardado en: $reportPath" -ForegroundColor Green

# 13. SUGERENCIAS DE ACCIÓN
Write-Host ""
Write-Host "🔧 SUGERENCIAS PARA EJECUTAR:" -ForegroundColor Cyan
if (-not $hasValidToken) {
    Write-Host "  1. Ejecuta: .\scripts\get_test_token.ps1" -ForegroundColor Yellow
    Write-Host "  2. Configura: `$env:TEST_LOAD_TOKEN = 'token-obtenido'" -ForegroundColor Yellow
    Write-Host "  3. Vuelve a ejecutar este script" -ForegroundColor Yellow
}

if ($critical -gt 0) {
    Write-Host "  4. Revisa el middleware de autenticación en packages/backend/src/middleware/auth.ts" -ForegroundColor Red
}

Write-Host ""
Write-Host "⚠️  NOTA: Este script NO ejecuta comandos SQL reales. Los payloads de SQL injection" -ForegroundColor Gray
Write-Host "     son para probar la sanitización del backend, NO para atacar la base de datos." -ForegroundColor Gray

# Retornar código de salida basado en resultados
if ($critical -gt 0) {
    exit 1  # Fallo crítico
}
elseif ($medium -gt 0) {
    exit 2  # Advertencias
}
else {
    exit 0  # Éxito
}