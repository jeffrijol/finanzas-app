# Test de Carga Concurrente (CORREGIDO)
# Usa usuario de testing dedicado, NO token personal

param(
    [int]$RequestCount = 10,  # Reducido para evitar sobrecarga
    [string]$Endpoint = "http://localhost:3001/api/transactions",
    [int]$DelayMs = 100  # Delay entre requests para simular uso real
)

Write-Host "🚀 Test de Carga Concurrente (CORREGIDO)" -ForegroundColor Cyan
Write-Host "Endpoint: $Endpoint"
Write-Host "Requests: $RequestCount"
Write-Host "Delay: ${DelayMs}ms"
Write-Host ""

# ⚠️ IMPORTANTE: Usar token de USUARIO DE TESTING, no personal
$token = $env:TEST_LOAD_TOKEN  # Token específico para load testing

if (-not $token) {
    Write-Host "❌ ERROR: Define TEST_LOAD_TOKEN en variables de entorno" -ForegroundColor Red
    Write-Host ""
    Write-Host "Pasos para configurar:" -ForegroundColor Yellow
    Write-Host "1. Crea un usuario de testing en Supabase:"
    Write-Host "   - Email: test-load@finanzas-app.local"
    Write-Host "   - Password: TestLoad123!"
    Write-Host "2. Login con ese usuario en http://localhost:4321"
    Write-Host "3. Obtén el token ejecutando: .\scripts\get_test_token.ps1"
    Write-Host "4. Configura: `$env:TEST_LOAD_TOKEN = 'token-aqui'"
    Write-Host ""
    Write-Host "⚠️  NO uses tu token personal - puede afectar RLS y métricas" -ForegroundColor Red
    exit 1
}

$jobs = @()
$startTime = Get-Date

for ($i = 1; $i -le $RequestCount; $i++) {
    # Delay entre requests para simular tráfico real
    if ($i -gt 1) {
        Start-Sleep -Milliseconds $DelayMs
    }
    
    $jobs += Start-Job -ScriptBlock {
        param($url, $token, $index)
        
        try {
            $headers = @{
                "Authorization" = "Bearer $token"
                "Content-Type"  = "application/json"
            }
            
            Invoke-RestMethod -Uri $url -Method GET -Headers $headers -TimeoutSec 10 -ErrorAction Stop | Out-Null
            
            return @{
                Index        = $index
                Status       = "Success"
                StatusCode   = 200
                ResponseTime = (Measure-Command { 
                        Invoke-RestMethod -Uri $url -Method GET -Headers $headers -TimeoutSec 10 
                    }).TotalMilliseconds
            }
        }
        catch {
            $statusCode = 500
            if ($_.Exception.Response) {
                $statusCode = [int]$_.Exception.Response.StatusCode
            }
            
            return @{
                Index      = $index
                Status     = "Failed"
                StatusCode = $statusCode
                Error      = $_.Exception.Message.Substring(0, [Math]::Min(100, $_.Exception.Message.Length))
            }
        }
    } -ArgumentList $Endpoint, $token, $i
}

Write-Host "⏳ Esperando completación de $RequestCount requests..." -ForegroundColor Yellow
$jobs | Wait-Job | Out-Null

$results = $jobs | Receive-Job
$jobs | Remove-Job

$endTime = Get-Date
$duration = ($endTime - $startTime).TotalSeconds

# Análisis detallado de resultados
$successful = ($results | Where-Object { $_.Status -eq "Success" }).Count
$failed = ($results | Where-Object { $_.Status -eq "Failed" }).Count
$rateLimited = ($results | Where-Object { $_.StatusCode -eq 429 }).Count
$unauthorized = ($results | Where-Object { $_.StatusCode -eq 401 }).Count
$avgResponseTime = ($results | Where-Object { $_.ResponseTime } | Measure-Object -Property ResponseTime -Average).Average

Write-Host ""
Write-Host "📊 Resultados Detallados:" -ForegroundColor Cyan
Write-Host "  ✅ Exitosas: $successful / $RequestCount"
Write-Host "  ❌ Fallidas: $failed"
Write-Host "  🚫 Rate Limited (429): $rateLimited"
Write-Host "  🔒 No Autorizadas (401): $unauthorized"
if ($avgResponseTime) {
    Write-Host "  ⏱️  Tiempo promedio respuesta: $([math]::Round($avgResponseTime, 2))ms"
}
Write-Host "  ⏱️  Duración total: $([math]::Round($duration, 2))s"
Write-Host ""

# Interpretación de resultados
if ($unauthorized -gt 0) {
    Write-Host "🔴 CRÍTICO: Token inválido o expirado" -ForegroundColor Red
    Write-Host "   Solución: Obtén nuevo token con get_test_token.ps1"
}
elseif ($rateLimited -gt 0) {
    Write-Host "🟡 Rate limiting activado - Comportamiento esperado bajo carga" -ForegroundColor Yellow
    Write-Host "   Backend está protegiendo correctamente contra ataques"
}
elseif ($failed -gt 0) {
    Write-Host "🟠 Algunos requests fallaron - Revisar logs del backend" -ForegroundColor DarkYellow
    Write-Host "   Posibles causas: RLS policies, permisos de usuario, errores de BD"
}
elseif ($successful -eq $RequestCount) {
    Write-Host "🟢 Backend manejó la carga exitosamente" -ForegroundColor Green
    Write-Host "   Todas las requests completadas sin errores"
}

# Guardar resultados detallados
$reportPath = "test_results_concurrent_$(Get-Date -Format 'yyyyMMdd_HHmmss').json"
$results | ConvertTo-Json -Depth 3 | Out-File $reportPath
Write-Host ""
Write-Host "📝 Resultados guardados en: $reportPath" -ForegroundColor Cyan

# Sugerencias de siguiente paso
Write-Host ""
Write-Host "🔍 Próximos pasos recomendados:" -ForegroundColor Cyan
Write-Host "   1. Revisar logs del backend en terminal donde corre pnpm run dev"
Write-Host "   2. Ejecutar: .\scripts\validate_with_mcp.ps1 para validar con Supabase"
Write-Host "   3. Si hay errores 401, obtener nuevo token con get_test_token.ps1"
