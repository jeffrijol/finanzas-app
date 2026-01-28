# Limpiar Estado de Testing

Write-Host "🧹 Limpiando estado de testing..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Ejecuta en Console de DevTools (F12):" -ForegroundColor Yellow
Write-Host ""
Write-Host "// Limpiar localStorage" -ForegroundColor White
Write-Host "localStorage.clear();"
Write-Host ""
Write-Host "// Limpiar sessionStorage" -ForegroundColor White
Write-Host "sessionStorage.clear();"
Write-Host ""
Write-Host "// Limpiar cookies" -ForegroundColor White
Write-Host "document.cookie.split(';').forEach(c => document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/'));"
Write-Host ""
Write-Host "// Recargar página" -ForegroundColor White
Write-Host "window.location.reload();"
Write-Host ""
Write-Host "✅ Instrucciones mostradas" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  También puedes ir a DevTools > Application y:" -ForegroundColor Yellow
Write-Host "   1. Clear site data (botón en la barra superior)"
Write-Host "   2. O borrar elementos individualmente"
