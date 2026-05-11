create table public.equipos (
  id_equipo uuid not null default extensions.uuid_generate_v4 (),
  numero_serie character varying(100) not null,
  tipo_equipo character varying(100) null,
  marca character varying(100) null,
  modelo character varying(100) null,
  procesador character varying(100) null,
  almacenamiento character varying(100) null,
  dueno character varying(255) null,
  fecha_ingreso timestamp with time zone null default now(),
  fecha_registro timestamp with time zone null default now(),
  created_at timestamp with time zone null default now(),
  constraint equipos_pkey primary key (id_equipo),
  constraint equipos_numero_serie_key unique (numero_serie)
) TABLESPACE pg_default;

create index IF not exists idx_equipos_numero_serie on public.equipos using btree (numero_serie) TABLESPACE pg_default;