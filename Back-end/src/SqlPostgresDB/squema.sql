-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.diagnosticos (
  id_diagnostico uuid NOT NULL DEFAULT gen_random_uuid(),
  id_equipo uuid,
  id_empleado uuid,
  detalles_revision jsonb NOT NULL,
  estatus_final character varying,
  observaciones_extra text,
  created_at timestamp with time zone DEFAULT now(),
  numero_serie character varying,
  CONSTRAINT diagnosticos_pkey PRIMARY KEY (id_diagnostico),
  CONSTRAINT diagnosticos_id_equipo_fkey FOREIGN KEY (id_equipo) REFERENCES public.equipos(id_equipo),
  CONSTRAINT diagnosticos_id_empleado_fkey FOREIGN KEY (id_empleado) REFERENCES public.empleados(id_empleado)
);
CREATE TABLE public.empleados (
  id_empleado uuid NOT NULL DEFAULT auth.uid(),
  nombre_completo character varying NOT NULL,
  rol character varying,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT empleados_pkey PRIMARY KEY (id_empleado)
);
CREATE TABLE public.equipos (
  id_equipo uuid NOT NULL DEFAULT gen_random_uuid(),
  numero_serie character varying NOT NULL UNIQUE,
  tipo_equipo character varying CHECK (tipo_equipo::text = ANY (ARRAY['Laptop'::character varying, 'Escritorio'::character varying]::text[])),
  marca character varying,
  modelo character varying,
  fecha_registro timestamp with time zone DEFAULT now(),
  procesador character varying,
  almacenamiento character varying,
  CONSTRAINT equipos_pkey PRIMARY KEY (id_equipo)
);