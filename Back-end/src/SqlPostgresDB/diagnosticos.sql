create table public.diagnosticos (
  id_diagnostico uuid not null default extensions.uuid_generate_v4 (),
  numero_serie character varying(100) null,
  id_equipo uuid null,
  id_empleado uuid null,
  detalles_revision jsonb not null,
  estatus_final character varying(50) null,
  observaciones_extra text null,
  created_at timestamp with time zone null default now(),
  constraint diagnosticos_pkey primary key (id_diagnostico),
  constraint diagnosticos_id_empleado_fkey foreign KEY (id_empleado) references empleados (id_empleado) on delete set null,
  constraint diagnosticos_id_equipo_fkey foreign KEY (id_equipo) references equipos (id_equipo) on delete CASCADE,
  constraint diagnosticos_numero_serie_fkey foreign KEY (numero_serie) references equipos (numero_serie) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_diagnosticos_numero_serie on public.diagnosticos using btree (numero_serie) TABLESPACE pg_default;