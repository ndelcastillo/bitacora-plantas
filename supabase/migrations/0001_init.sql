-- Enum shared by cuidado_config and cuidados
create type public.tipo_cuidado as enum ('regar', 'fertilizar', 'trasplantar', 'podar', 'otro');

create table public.plantas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  nombre text not null,
  especie text,
  ubicacion text,
  foto_url text,
  fecha_adquisicion date,
  notas text,
  created_at timestamptz not null default now()
);

create table public.cuidado_config (
  id uuid primary key default gen_random_uuid(),
  planta_id uuid not null references public.plantas (id) on delete cascade,
  tipo public.tipo_cuidado not null,
  frecuencia_dias integer,
  unique (planta_id, tipo)
);

create table public.cuidados (
  id uuid primary key default gen_random_uuid(),
  planta_id uuid not null references public.plantas (id) on delete cascade,
  tipo public.tipo_cuidado not null,
  fecha timestamptz not null default now(),
  notas text,
  created_at timestamptz not null default now()
);

alter table public.plantas enable row level security;
alter table public.cuidado_config enable row level security;
alter table public.cuidados enable row level security;

create policy "plantas_owner_all" on public.plantas
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "cuidado_config_owner_all" on public.cuidado_config
  for all
  using (exists (select 1 from public.plantas p where p.id = planta_id and p.user_id = auth.uid()))
  with check (exists (select 1 from public.plantas p where p.id = planta_id and p.user_id = auth.uid()));

create policy "cuidados_owner_all" on public.cuidados
  for all
  using (exists (select 1 from public.plantas p where p.id = planta_id and p.user_id = auth.uid()))
  with check (exists (select 1 from public.plantas p where p.id = planta_id and p.user_id = auth.uid()));

-- Storage: private bucket for plant photos, one folder per user
insert into storage.buckets (id, name, public)
values ('plantas-fotos', 'plantas-fotos', false);

create policy "plantas_fotos_owner_select" on storage.objects
  for select
  using (bucket_id = 'plantas-fotos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "plantas_fotos_owner_insert" on storage.objects
  for insert
  with check (bucket_id = 'plantas-fotos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "plantas_fotos_owner_update" on storage.objects
  for update
  using (bucket_id = 'plantas-fotos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "plantas_fotos_owner_delete" on storage.objects
  for delete
  using (bucket_id = 'plantas-fotos' and (storage.foldername(name))[1] = auth.uid()::text);
