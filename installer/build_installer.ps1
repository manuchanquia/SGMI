param(
    [string]$OutputRoot = ""
)

$ErrorActionPreference = "Stop"

function Write-Step {
    param([string]$Message)
    Write-Host "[SGMI-BUILD] $Message" -ForegroundColor Cyan
}

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path

if ([string]::IsNullOrWhiteSpace($OutputRoot)) {
    $OutputRoot = Join-Path $repoRoot "dist"
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$packageRoot = Join-Path $OutputRoot "SGMI-Instalador-$timestamp"

Write-Step "Repositorio detectado en: $repoRoot"
Write-Step "Carpeta de salida: $packageRoot"

New-Item -ItemType Directory -Path $packageRoot -Force | Out-Null

$backendSource = Join-Path $repoRoot "BackEnd"
$frontendSource = Join-Path $repoRoot "FrontEnd"

if (-not (Test-Path $backendSource)) {
    throw "No se encontró la carpeta BackEnd en: $backendSource"
}

if (-not (Test-Path $frontendSource)) {
    throw "No se encontró la carpeta FrontEnd en: $frontendSource"
}

$backendZip = Join-Path $packageRoot "BackEnd.zip"
$frontendZip = Join-Path $packageRoot "FrontEnd.zip"

Write-Step "Comprimiendo BackEnd -> $backendZip"
Compress-Archive -Path (Join-Path $backendSource "*") -DestinationPath $backendZip -CompressionLevel Optimal -Force

Write-Step "Comprimiendo FrontEnd -> $frontendZip"
Compress-Archive -Path (Join-Path $frontendSource "*") -DestinationPath $frontendZip -CompressionLevel Optimal -Force

Write-Step "Copiando instalador y guía"
Copy-Item -Path (Join-Path $PSScriptRoot "instalar_sgmi.ps1") -Destination (Join-Path $packageRoot "instalar_sgmi.ps1") -Force
Copy-Item -Path (Join-Path $PSScriptRoot "GUIA_INSTALACION.md") -Destination (Join-Path $packageRoot "GUIA_INSTALACION.md") -Force

$sqlScripts = Get-ChildItem -Path $repoRoot -Filter "Instal*.sql" -File -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -match '^Instalaci.n.*\.sql$|^Instal.*\.sql$' }
foreach ($script in $sqlScripts) {
    Write-Step "Copiando script SQL: $($script.Name)"
    Copy-Item -Path $script.FullName -Destination (Join-Path $packageRoot $script.Name) -Force
}

Write-Step "Paquete generado correctamente"
Write-Host "Ruta final: $packageRoot" -ForegroundColor Green
