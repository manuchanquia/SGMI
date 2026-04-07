# SGMI - Sistema de Gestión de Información

**Desarrollado por:** Manuela Chanquia, Avril Lugo Gonzalez, Ignacio Williams y Theo Bracco. 
Para la catedra Diseño de Sistemas de Información de la UTN FRLP. Grupo 2

---

## Índice



1. [Descripción del Proyecto](#descripción-del-proyecto)

2. [Stack Tecnológico](#stack-tecnológico)

3. [Guía de Despliegue](#guía-de-despliegue)

4. [Configuración de Entorno](#configuración-de-entorno)

5. [Diseño y Arquitectura](#diseño-y-arquitectura)

6. [Metodología de Desarrollo](#metodología-de-desarrollo)

---

## Descripción del Proyecto

Este proyecto consiste en un **Sistema de Gestión de Información (SGMI)** diseñado bajo una **Arquitectura Cliente-Servidor Desacoplada**. La solución separa la lógica de presentación de la lógica de negocio, permitiendo una gestión eficiente y escalable de datos.

## Stack Tecnológico

El sistema está construido con las siguientes tecnologías:

- **Backend:** Python 3.11 (Flask/FastAPI).
- **Frontend:** Node.js 20 (Vite + React).
- **Base de Datos:** PostgreSQL 18.
- **Scripting/Despliegue:** PowerShell.

## Guía de Despliegue

El proyecto cuenta con un script de automatización que facilita la configuración del entorno en sistemas Windows.

### Requisitos Previos

Asegúrate de tener instalados:

* **Python 3.11+**
* **Node.js 20+**
* **PostgreSQL 18+**

### Instalación Automática

1. Descarga o clona la carpeta del código fuente.
2. Abre una terminal de **PowerShell** en la raíz del proyecto.
3. Ejecuta el instalador con el siguiente comando:

```powershell

powershell -ExecutionPolicy Bypass -File .\instalar_sgmi.ps1
```
> **Nota:** El sistema se instalará por defecto en la ruta local: `$env:USERPROFILE\SGMI`.

### Ejecución del Sistema

Para iniciar los servicios manualmente tras la instalación, utiliza los siguientes comandos en terminales de PowerShell independientes:

1. **Backend (Python):**
   ```powershell
   cd "$env:USERPROFILE\SGMI\BackEnd"
   .\.venv\Scripts\Activate.ps1
   python app.py
  
* * El servidor estará disponible en: `http://localhost:5000`

2. **Frontend (React):**
   ```powershell
   cd "$env:USERPROFILE\SGMI\FrontEnd"
   npm run dev

* *La interfaz estará disponible en:* `http://localhost:5173`

---

## Diseño y Arquitectura

El **SGMI** implementa un modelo de tres capas que asegura la integridad de los datos y la independencia de la interfaz:

* **Capa de Presentación:** SPA (*Single Page Application*) desarrollada en React que gestiona el estado del usuario y las peticiones asíncronas.
* **Capa de Aplicación:** API REST en Python que procesa la lógica de negocio, validaciones y reglas del sistema.
* **Capa de Datos:** Instancia de PostgreSQL 18 encargada de la persistencia relacional.

## Metodología de Desarrollo: Model-First

El proyecto se construyó siguiendo un flujo de ingeniería de software que garantiza la concordancia entre los requerimientos de negocio y la implementación técnica:

### **Diseño de Objetos (UML)**

Se definió inicialmente el **Diagrama de Clases UML** para establecer las entidades, sus responsabilidades y las relaciones lógicas. Este diseño permitió validar la arquitectura antes de escribir una sola línea de código.

### **Mapeo de Persistencia (ORM)**

Una vez consolidado el UML, se realizó un mapeo para transformar el diseño de objetos en un modelo relacional sólido, asegurando que la estructura de la base de datos refleje fielmente la lógica de la aplicación.

### **Implementación y Consistencia**

* **Backend:** El código se desarrolló respetando estrictamente el diagrama de clases original.
* **Sincronización:** Se utilizan variables de entorno para mantener la conexión dinámica entre el código y el motor de base de datos.
* **Frontend Integrado:** La interfaz consume la API, cerrando el ciclo de flujo de información desde el modelo hasta la vista final.
