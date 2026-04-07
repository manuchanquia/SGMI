param(
    [string]$InstallRoot = "$env:USERPROFILE\SGMI",
    [switch]$SkipDependencyInstall,
    [switch]$Force,
    [switch]$SkipDatabaseScript,
    [string]$DatabaseUrl = "",
    [string]$DatabaseScriptPath = "",
    [ValidateSet("auto", "psql", "python")]
    [string]$DatabaseExecutionMode = "python"
)

$ErrorActionPreference = "Stop"

$executionDir = (Get-Location).Path
$logTimestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$logFile = Join-Path $executionDir "instalacion_sgmi_$logTimestamp.log"
$transcriptStarted = $false

try {
    Start-Transcript -Path $logFile -Append -Force | Out-Null
    $transcriptStarted = $true
}
catch {
    Write-Warning "No se pudo iniciar el archivo de log en '$logFile'. Se continuará sin transcript detallado."
}

trap {
    if ($transcriptStarted) {
        try {
            Stop-Transcript | Out-Null
        }
        catch {
        }
    }
    throw
}

function Write-Step {
    param([string]$Message)
    Write-Host "[SGMI-INSTALL] $Message" -ForegroundColor Cyan
}

function Assert-Command {
    param(
        [string]$CommandName,
        [string]$InstallHint
    )

    if (-not (Get-Command $CommandName -ErrorAction SilentlyContinue)) {
        throw "No se encontró '$CommandName'. $InstallHint"
    }
}

function Test-CommandExists {
    param([string]$CommandName)
    return [bool](Get-Command $CommandName -ErrorAction SilentlyContinue)
}

function Get-DatabaseUrlFromEnv {
    param([string]$EnvFilePath)

    if (-not (Test-Path $EnvFilePath)) {
        return ""
    }

    $line = Get-Content -Path $EnvFilePath | Where-Object { $_ -match '^\s*DATABASE_URL\s*=' } | Select-Object -First 1
    if (-not $line) {
        return ""
    }

    $value = ($line -replace '^\s*DATABASE_URL\s*=\s*', '').Trim()
    return $value.Trim('"').Trim("'")
}

function Normalize-DatabaseUrlForPsql {
    param([string]$RawUrl)

    if ([string]::IsNullOrWhiteSpace($RawUrl)) {
        return ""
    }

    if ($RawUrl.StartsWith("postgresql+psycopg2://")) {
        return $RawUrl.Replace("postgresql+psycopg2://", "postgresql://")
    }

    return $RawUrl
}

function Get-DatabasePythonExecutor {
    param([string]$BackendDir)

    $venvPython = Join-Path $BackendDir ".venv\Scripts\python.exe"
    if (Test-Path $venvPython) {
        return $venvPython
    }

    if (Test-CommandExists -CommandName "python") {
        return "python"
    }

    throw "No se encontró Python para ejecutar el script SQL en modo 'python'. Instale Python o cree el entorno .venv."
}

function Invoke-DatabaseScriptWithPsql {
    param(
        [string]$DatabaseUrl,
        [string]$ScriptPath
    )

    Assert-Command -CommandName "psql" -InstallHint "Instale PostgreSQL Client Tools y asegure psql en PATH."

    Write-Step "Ejecutando script SQL con psql: $ScriptPath"
    & psql "$DatabaseUrl" -v ON_ERROR_STOP=1 -f "$ScriptPath"

    if ($LASTEXITCODE -ne 0) {
        throw "La ejecución del script SQL con psql falló con código: $LASTEXITCODE"
    }
}

function Invoke-DatabaseScriptWithPython {
    param(
        [string]$DatabaseUrl,
        [string]$ScriptPath,
        [string]$BackendDir
    )

    $pythonExec = Get-DatabasePythonExecutor -BackendDir $BackendDir
    $runnerPath = Join-Path $env:TEMP ("sgmi_sql_runner_{0}.py" -f ([Guid]::NewGuid().ToString("N")))

    $runnerCode = @'
import argparse
from pathlib import Path
import sys

try:
    import psycopg2
except Exception as exc:
    print("No se pudo importar psycopg2. Instale dependencias del backend o ejecute en modo psql.", file=sys.stderr)
    print(str(exc), file=sys.stderr)
    raise

parser = argparse.ArgumentParser()
parser.add_argument("--db-url", required=True)
parser.add_argument("--sql-file", required=True)
args = parser.parse_args()

sql_path = Path(args.sql_file)
if not sql_path.exists():
    raise FileNotFoundError(f"No existe el script SQL: {sql_path}")

sql_text = sql_path.read_text(encoding="utf-8")

try:
    connection = psycopg2.connect(args.db_url)
    connection.autocommit = True
except Exception as exc:
    print("No se pudo conectar a PostgreSQL. Verifique usuario, contraseña, host, puerto y base de datos.", file=sys.stderr)
    print(str(exc), file=sys.stderr)
    sys.exit(1)

try:
    with connection.cursor() as cursor:
        cursor.execute(sql_text)
except Exception as exc:
    print("Error ejecutando el script SQL.", file=sys.stderr)
    print(str(exc), file=sys.stderr)
    sys.exit(1)
finally:
    connection.close()

print("Script SQL ejecutado correctamente con Python.")
'@

    Set-Content -Path $runnerPath -Value $runnerCode -Encoding UTF8

    try {
        Write-Step "Ejecutando script SQL con Python: $ScriptPath"
        & $pythonExec $runnerPath --db-url "$DatabaseUrl" --sql-file "$ScriptPath"
        if ($LASTEXITCODE -ne 0) {
            throw "La ejecución del script SQL con Python falló con código: $LASTEXITCODE"
        }
    }
    finally {
        Remove-Item -Path $runnerPath -Force -ErrorAction SilentlyContinue
    }
}

$installerRoot = $PSScriptRoot
$backendZip = Join-Path $installerRoot "BackEnd.zip"
$frontendZip = Join-Path $installerRoot "FrontEnd.zip"

Write-Host "[SGMI-INSTALL] Log detallado: $logFile" -ForegroundColor DarkCyan

if (-not (Test-Path $backendZip)) {
    throw "No se encontró el archivo BackEnd.zip en: $installerRoot"
}

if (-not (Test-Path $frontendZip)) {
    throw "No se encontró el archivo FrontEnd.zip en: $installerRoot"
}

Write-Step "Instalando SGMI en: $InstallRoot"

$backendDir = Join-Path $InstallRoot "BackEnd"
$frontendDir = Join-Path $InstallRoot "FrontEnd"
$logsDir = Join-Path $InstallRoot "logs"

New-Item -ItemType Directory -Path $InstallRoot -Force | Out-Null
New-Item -ItemType Directory -Path $backendDir -Force | Out-Null
New-Item -ItemType Directory -Path $frontendDir -Force | Out-Null
New-Item -ItemType Directory -Path $logsDir -Force | Out-Null

if ($Force) {
    Write-Step "Limpiando instalación previa por parámetro -Force"
    Get-ChildItem -Path $backendDir -Force -ErrorAction SilentlyContinue | Remove-Item -Recurse -Force
    Get-ChildItem -Path $frontendDir -Force -ErrorAction SilentlyContinue | Remove-Item -Recurse -Force
}

Write-Step "Descomprimiendo BackEnd.zip"
Expand-Archive -Path $backendZip -DestinationPath $backendDir -Force

Write-Step "Descomprimiendo FrontEnd.zip"
Expand-Archive -Path $frontendZip -DestinationPath $frontendDir -Force

if (-not $SkipDependencyInstall) {
    Write-Step "Verificando herramientas requeridas"
    Assert-Command -CommandName "python" -InstallHint "Instale Python 3.11+ y habilite 'Add python.exe to PATH'."
    Assert-Command -CommandName "npm" -InstallHint "Instale Node.js 20+ (incluye npm)."

    $venvDir = Join-Path $backendDir ".venv"
    $venvPython = Join-Path $venvDir "Scripts\python.exe"

    if (-not (Test-Path $venvPython)) {
        Write-Step "Creando entorno virtual del backend"
        & python -m venv $venvDir
    }

    $requirementsFile = Join-Path $backendDir "requirements.txt"
    if (-not (Test-Path $requirementsFile)) {
        throw "No se encontró requirements.txt en: $requirementsFile"
    }

    Write-Step "Instalando dependencias Python"
    & $venvPython -m pip install --upgrade pip
    & $venvPython -m pip install -r $requirementsFile

    $frontendPackageJson = Join-Path $frontendDir "package.json"
    if (-not (Test-Path $frontendPackageJson)) {
        throw "No se encontró package.json en: $frontendPackageJson"
    }

    Write-Step "Instalando dependencias Node.js"
    Push-Location $frontendDir
    try {
        & npm install
    }
    finally {
        Pop-Location
    }
}

$envFile = Join-Path $backendDir ".env"
if (-not (Test-Path $envFile)) {
    Write-Step "Generando archivo .env inicial"
    @(
        "# Ajuste esta variable según su base de datos PostgreSQL"
        "DATABASE_URL=postgresql+psycopg2://usuario:password@localhost:5432/sgmi"
    ) | Set-Content -Path $envFile -Encoding UTF8
}

if (-not $SkipDatabaseScript) {
    if ([string]::IsNullOrWhiteSpace($DatabaseScriptPath)) {
        $candidateScripts = Get-ChildItem -Path $installerRoot -Filter "Instal*.sql" -File -ErrorAction SilentlyContinue |
            Where-Object { $_.Name -match '^Instalaci.n.*\.sql$|^Instal.*\.sql$' } |
            Sort-Object -Property Name -Descending
        if ($candidateScripts.Count -eq 0) {
            throw "No se encontraron scripts SQL de instalación ('Instal*.sql') en: $installerRoot"
        }
        $DatabaseScriptPath = $candidateScripts[0].FullName
    }

    if (-not (Test-Path $DatabaseScriptPath)) {
        throw "No se encontró el script SQL indicado: $DatabaseScriptPath"
    }

    if ([string]::IsNullOrWhiteSpace($DatabaseUrl)) {
        $DatabaseUrl = Get-DatabaseUrlFromEnv -EnvFilePath $envFile
    }

    if ($DatabaseUrl -match 'usuario:password@localhost:5432/sgmi') {
        throw "DATABASE_URL contiene un valor de ejemplo. Configure una URL real con -DatabaseUrl o use -SkipDatabaseScript para omitir la instalación de BD."
    }

    $normalizedDatabaseUrl = Normalize-DatabaseUrlForPsql -RawUrl $DatabaseUrl
    if ([string]::IsNullOrWhiteSpace($normalizedDatabaseUrl)) {
        throw "No se pudo determinar DATABASE_URL. Use -DatabaseUrl 'postgresql://usuario:password@host:5432/db'."
    }

    $psqlAvailable = Test-CommandExists -CommandName "psql"

    switch ($DatabaseExecutionMode) {
        "psql" {
            Invoke-DatabaseScriptWithPsql -DatabaseUrl $normalizedDatabaseUrl -ScriptPath $DatabaseScriptPath
            break
        }
        "python" {
            Invoke-DatabaseScriptWithPython -DatabaseUrl $normalizedDatabaseUrl -ScriptPath $DatabaseScriptPath -BackendDir $backendDir
            break
        }
        default {
            if ($psqlAvailable) {
                Write-Step "Modo auto: se usará psql"
                Invoke-DatabaseScriptWithPsql -DatabaseUrl $normalizedDatabaseUrl -ScriptPath $DatabaseScriptPath
            }
            else {
                Write-Step "Modo auto: psql no disponible, se usará Python"
                Invoke-DatabaseScriptWithPython -DatabaseUrl $normalizedDatabaseUrl -ScriptPath $DatabaseScriptPath -BackendDir $backendDir
            }
        }
    }

    Write-Step "Script de base de datos ejecutado correctamente"
}
else {
    Write-Step "Instalación de base de datos omitida por parámetro -SkipDatabaseScript"
}

Write-Host "" 
Write-Host "Instalación finalizada correctamente." -ForegroundColor Green
Write-Host "" 
Write-Host "Comandos para ejecutar el sistema:" -ForegroundColor Yellow
Write-Host "1) Backend:"
Write-Host "   cd \"$backendDir\""
Write-Host "   .\\.venv\\Scripts\\Activate.ps1"
Write-Host "   python app.py"
Write-Host ""
Write-Host "2) Frontend (en otra terminal):"
Write-Host "   cd \"$frontendDir\""
Write-Host "   npm run dev"

if ($transcriptStarted) {
    Stop-Transcript | Out-Null
}
