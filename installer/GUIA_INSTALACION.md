# Guía de instalación SGMI (BackEnd + FrontEnd)

Este documento describe cómo generar un instalador comprimido y cómo desplegarlo en una máquina Windows.

## 1) Requisitos previos

Ejecutar en PowerShell para validar herramientas:

```powershell
python --version
npm --version
```

- Python recomendado: 3.11 o superior.
- Node.js recomendado: 20 o superior (incluye npm).

## 2) Estructura de scripts

Dentro de `installer/` se incluyen:

- `build_installer.ps1`: genera el paquete instalable.
- `instalar_sgmi.ps1`: instala el sistema desde los `.zip`.
- `GUIA_INSTALACION.md`: esta guía.

## 3) Generar el instalador comprimido

Desde la raíz del proyecto, ejecutar:

```powershell
cd c:\inetpub\SGMI-grupo-02
powershell -ExecutionPolicy Bypass -File .\installer\build_installer.ps1
```

Resultado esperado:

- Se crea una carpeta en `dist\SGMI-Instalador-YYYYMMDD-HHMMSS`.
- Contenido generado:
  - `BackEnd.zip`
  - `FrontEnd.zip`
  - `Instalacion.*.sql`
  - `instalar_sgmi.ps1`
  - `GUIA_INSTALACION.md`

### Comando opcional: elegir carpeta de salida

```powershell
powershell -ExecutionPolicy Bypass -File .\installer\build_installer.ps1 -OutputRoot "D:\instaladores"
```

## 4) Instalar en una máquina destino

1. Copiar la carpeta `DS_2025_GR02_Codigo_Fuente ` a la máquina destino.
2. Abrir PowerShell en esa carpeta.
3. Ejecutar:

```powershell
powershell -ExecutionPolicy Bypass -File .\instalar_sgmi.ps1
```

Por defecto se instala en:

`$env:USERPROFILE\SGMI`

#### Comando opcional: elegir carpeta de salida
```powershell
powershell -ExecutionPolicy Bypass -File .\installer\build_installer.ps1 -OutputRoot "D:\Instalacion"
```

### Parámetros útiles del instalador

#### Instalar en una ruta personalizada

```powershell
powershell -ExecutionPolicy Bypass -File .\instalar_sgmi.ps1 -InstallRoot "D:\SGMI"
```

#### Forzar reinstalación (limpia BackEnd y FrontEnd)

```powershell
powershell -ExecutionPolicy Bypass -File .\instalar_sgmi.ps1 -Force
```

#### Omitir instalación de dependencias

```powershell
powershell -ExecutionPolicy Bypass -File .\instalar_sgmi.ps1 -SkipDependencyInstall
```

#### Instalación de base de datos (se ejecuta por defecto)

```powershell
powershell -ExecutionPolicy Bypass -File .\instalar_sgmi.ps1 -DatabaseUrl "postgresql://<USUARIO>:<PASSWORD>@localhost:5432/sgmi"
```

Por defecto usa `-DatabaseExecutionMode python`.

- Esto fuerza la ejecución del script SQL usando Python (`psycopg2`).
- Para comportamiento automático (preferir `psql` si existe), usar `-DatabaseExecutionMode auto`.

#### Forzar modo de ejecución SQL

```powershell
# Forzar psql
powershell -ExecutionPolicy Bypass -File .\instalar_sgmi.ps1 -DatabaseExecutionMode psql -DatabaseUrl "postgresql://<USUARIO>:<PASSWORD>@localhost:5432/sgmi"

# Forzar modo alternativo Python
powershell -ExecutionPolicy Bypass -File .\instalar_sgmi.ps1 -DatabaseExecutionMode python -DatabaseUrl "postgresql://<USUARIO>:<PASSWORD>@localhost:5432/sgmi"
```

#### Apagar explícitamente la instalación de BD

```powershell
powershell -ExecutionPolicy Bypass -File .\instalar_sgmi.ps1 -SkipDatabaseScript
```

#### Ejecutar un script SQL específico

```powershell
powershell -ExecutionPolicy Bypass -File .\instalar_sgmi.ps1 -DatabaseUrl "postgresql://<USUARIO>:<PASSWORD>@localhost:5432/sgmi" -DatabaseScriptPath ".\Instalación.v1.0.sql"
```

## 5) Qué hace el instalador exactamente

### 5.0 Genera log detallado de ejecución

En cada ejecución, el instalador crea automáticamente un archivo:

- `instalacion_sgmi_YYYYMMDD-HHMMSS.log`

Ubicación del log:

- En la carpeta desde la cual se ejecuta el comando de instalación.

Este log incluye mensajes del instalador y salidas de comandos para facilitar diagnóstico.


### 5.1 Crea directorios

- `<InstallRoot>\BackEnd`
- `<InstallRoot>\FrontEnd`
- `<InstallRoot>\logs`

### 5.2 Descomprime paquetes

- `BackEnd.zip` en `<InstallRoot>\BackEnd`
- `FrontEnd.zip` en `<InstallRoot>\FrontEnd`

### 5.3 Instala dependencias

Backend:

1. Crea entorno virtual en `<InstallRoot>\BackEnd\.venv`
2. Ejecuta:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

Frontend:

```powershell
npm install
```

### 5.4 Crea `.env` inicial para backend

Si no existe, crea:

```env
DATABASE_URL=postgresql+psycopg2://usuario:password@localhost:5432/sgmi
```

Debe editarse con las credenciales reales de PostgreSQL.

### 5.5 Ejecuta script de base de datos (por defecto)

Si no se usa `-SkipDatabaseScript`, el instalador:

1. Determina el modo de ejecución SQL (`auto`, `psql`, `python`).
2. Determina el script SQL:
  - Usa `-DatabaseScriptPath` si se informó.
  - Si no, toma el más reciente por nombre entre `Instalación*.sql` en la carpeta del instalador.
3. Determina la conexión:
  - Usa `-DatabaseUrl` si se informó.
  - Si no, intenta leer `DATABASE_URL` del `.env` del backend instalado.
4. Ejecuta con el modo seleccionado:

```powershell
# modo psql
psql "<database-url>" -v ON_ERROR_STOP=1 -f "<script-sql>"

# modo alternativo python (usa psycopg2)
python <runner-temporal>.py --db-url "<database-url>" --sql-file "<script-sql>"
```

> Nota: Si su URL tiene formato SQLAlchemy (`postgresql+psycopg2://...`), el instalador la adapta automáticamente a `postgresql://...`.
>
> Nota 2: El modo `python` requiere `psycopg2` disponible (normalmente instalado al ejecutar el instalador sin `-SkipDependencyInstall`).
>
> Nota 3: Si `DATABASE_URL` sigue con el valor de ejemplo, el instalador detiene la ejecución de BD y solicita URL real o `-SkipDatabaseScript`.

## 6) Ejecutar el sistema

### Backend

```powershell
cd "$env:USERPROFILE\SGMI\BackEnd"
.\.venv\Scripts\Activate.ps1
python app.py
```

Backend disponible en: `http://localhost:5000`

### Frontend (en otra terminal)

```powershell
cd "$env:USERPROFILE\SGMI\FrontEnd"
npm run dev
```

Frontend disponible normalmente en: `http://localhost:5173`

## 7) Solución de problemas rápida

- Error de scripts bloqueados en PowerShell:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

- Verificar Python y Node en PATH:

```powershell
Get-Command python
Get-Command npm
```

- Reinstalar dependencias frontend:

```powershell
cd "$env:USERPROFILE\SGMI\FrontEnd"
Remove-Item -Recurse -Force .\node_modules
npm install
```
-	Error de permisos de usuario al crear la BD:
```PostgreSql
-- Database: sgmi

DROP DATABASE IF EXISTS sgmi;

CREATE DATABASE sgmi
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'Spanish_Argentina.1252'
    LC_CTYPE = 'Spanish_Argentina.1252'
    LOCALE_PROVIDER = 'libc'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1
    IS_TEMPLATE = False;

GRANT TEMPORARY, CONNECT ON DATABASE sgmi TO PUBLIC;

GRANT ALL ON DATABASE sgmi TO postgres;

GRANT ALL ON DATABASE sgmi TO <USUARIO>;
GRANT USAGE ON SCHEMA PUBLIC TO <USUARIO>;
GRANT CREATE ON SCHEMA PUBLIC TO <USUARIO>;

ALTER DATABASE sgmi OWNER TO <USUARIO>;

SELECT nspname, pg_get_userbyid(nspowner)
FROM pg_namespace
WHERE nspname = 'public';
```