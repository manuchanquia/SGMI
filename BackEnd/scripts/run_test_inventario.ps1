# Script para ejecutar test de inventario con servidor Flask
Write-Host "Iniciando servidor Flask..." -ForegroundColor Cyan

# Iniciar Flask en segundo plano
$flaskJob = Start-Job -ScriptBlock {
    Set-Location "C:\inetpub\SGMI-grupo-02\BackEnd"
    $env:FLASK_DEBUG = "0"
    python app.py
}

# Esperar a que el servidor inicie
Start-Sleep -Seconds 5

# Verificar que el servidor esté corriendo
try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:5000/" -TimeoutSec 2 -ErrorAction Stop
    Write-Host "OK Servidor iniciado correctamente" -ForegroundColor Green
} 
catch {
    Write-Host "X Error al iniciar servidor" -ForegroundColor Red
    Stop-Job $flaskJob
    Remove-Job $flaskJob
    exit 1
}

# Ejecutar test
Write-Host "`nEjecutando test..." -ForegroundColor Cyan
python C:\inetpub\SGMI-grupo-02\BackEnd\scripts\test_inventario_urllib.py

# Detener servidor
Write-Host "`nDeteniendo servidor..." -ForegroundColor Cyan
Stop-Job $flaskJob
Remove-Job $flaskJob

Write-Host "OK Test completado" -ForegroundColor Green
