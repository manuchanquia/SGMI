CREATE TABLE IF NOT EXISTS public.institucion (
    id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
    descripcion text,
    pais text,
    nombre text NOT NULL,
    CONSTRAINT institucion_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.persona (
    id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
    nombre text NOT NULL,
    apellido text NOT NULL,
    tipoDocumento text NOT NULL,
    numeroDocumento text NOT NULL,
    activo boolean NOT NULL,
    nacionalidad text NOT NULL,
    CONSTRAINT persona_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.usuario (
    id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    email text NOT NULL UNIQUE,
    clave bytea NOT NULL,
    activo boolean NOT NULL DEFAULT false,
    rol text DEFAULT 'consulta'::text,
    idPersona bigint,
    CONSTRAINT usuario_pkey PRIMARY KEY (id),
    CONSTRAINT usuario_idPersona_fkey FOREIGN KEY (idPersona) REFERENCES public.persona(id)
);

CREATE TABLE IF NOT EXISTS public.grupo (
    id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
    sigla text NOT NULL,
    nombre text NOT NULL,
    objetivos text NOT NULL DEFAULT ''::text,
    organigrama text NOT NULL,
    consejo_ejecutivo text,
    director text NOT NULL,
    vicedirector text NOT NULL,
    correo_electronico text NOT NULL,
    activo boolean NOT NULL,
    institucionId integer NOT NULL,
    CONSTRAINT grupo_pkey PRIMARY KEY (id),
    CONSTRAINT grupo_institucionId_fkey FOREIGN KEY (institucionId) REFERENCES public.institucion(id)
);

CREATE TABLE IF NOT EXISTS public.planificacion (
    id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
    grupoId integer NOT NULL,
    activa boolean NOT NULL,
    anio date,
    CONSTRAINT planificacion_pkey PRIMARY KEY (id),
    CONSTRAINT planificacion_grupoId_fkey FOREIGN KEY (grupoId) REFERENCES public.grupo(id)
);

CREATE TABLE IF NOT EXISTS public.bibliografia (
    id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
    titulo text NOT NULL,
    autores text,
    editorial text,
    anio smallint,
    fecha date NOT NULL,
    planificacionId bigint,
    activo boolean,
    CONSTRAINT bibliografia_pkey PRIMARY KEY (id),
    CONSTRAINT bibliografia_planificacionId_fkey FOREIGN KEY (planificacionId) REFERENCES public.planificacion(id)
);

CREATE TABLE IF NOT EXISTS public.equipamiento (
    id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
    denominacion text NOT NULL,
    fechaIngreso date NOT NULL,
    descripcion text,
    actividad text,
    monto double precision,
    planificacionId bigint,
    activo boolean,
    CONSTRAINT equipamiento_pkey PRIMARY KEY (id),
    CONSTRAINT equipamiento_planificacionId_fkey FOREIGN KEY (planificacionId) REFERENCES public.planificacion(id)
);

CREATE TABLE IF NOT EXISTS public.personal (
    id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
    horas smallint,
    categoria text,
    incentivo text,
    dedicacion text,
    personaId bigint NOT NULL,
    financiamiento text,
    objectType text NOT NULL,
    formacionBecario text,
    rol text,
    fechaInicio date NOT NULL,
    fechaFin date,
    planificacionId bigint,
    CONSTRAINT personal_pkey PRIMARY KEY (id),
    CONSTRAINT personal_planificacionId_fkey FOREIGN KEY (planificacionId) REFERENCES public.planificacion(id),
    CONSTRAINT personal_personaId_fkey FOREIGN KEY (personaId) REFERENCES public.persona(id)
);

CREATE TABLE IF NOT EXISTS public.proyecto (
    id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
    tipo text NOT NULL,
    codigo text NOT NULL,
    fecha_inicio date NOT NULL,
    fecha_fin date,
    nombre text NOT NULL,
    descripcion text NOT NULL,
    logros text,
    dificultades text,
    financiamiento text NOT NULL,
    planificacionId bigint,
    activo boolean NOT NULL,
    CONSTRAINT proyecto_pkey PRIMARY KEY (id),
    CONSTRAINT proyecto_planificacionId_fkey FOREIGN KEY (planificacionId) REFERENCES public.planificacion(id)
);