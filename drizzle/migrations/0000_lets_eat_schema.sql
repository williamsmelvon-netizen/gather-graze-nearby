create type public.app_role as enum ('admin','user');
create table public.user_roles (id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete cascade not null, role app_role not null, unique(user_id, role));
grant select on public.user_roles to authenticated; grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create or replace function public.has_role(_user_id uuid, _role app_role) returns boolean language sql stable security definer set search_path = public as $$ select exists (select 1 from public.user_roles where user_id=_user_id and role=_role) $$;
create policy "Users read own roles" on public.user_roles for select to authenticated using (auth.uid() = user_id);

create table public.sources (id uuid primary key default gen_random_uuid(), name text not null, type text not null check (type in ('grocery','farmers_market','farm_stand','csa','garden_store')), address text, lat double precision, lng double precision, accepts_snap boolean default true, double_up boolean default false, hours_note text, season_note text, website text, verified_on date, created_at timestamptz default now());
create table public.produce (id uuid primary key default gen_random_uuid(), name text not null unique, category text, season_months int[], typical_unit text, est_price_per_unit numeric, notes text);
create table public.source_produce (source_id uuid references public.sources(id) on delete cascade, produce_id uuid references public.produce(id) on delete cascade, primary key (source_id, produce_id));
create table public.cuisines (id uuid primary key default gen_random_uuid(), name text not null unique, description text, sort_order int default 0);
create table public.recipes (id uuid primary key default gen_random_uuid(), cuisine_id uuid references public.cuisines(id), title text not null, description text, servings int not null, prep_minutes int, cook_minutes int, steps jsonb not null, tags text[], source_type text default 'original' check (source_type in ('original','public_domain','community')), contributor_name text, status text default 'draft' check (status in ('draft','published')), created_at timestamptz default now());
create table public.recipe_ingredients (id uuid primary key default gen_random_uuid(), recipe_id uuid references public.recipes(id) on delete cascade, produce_id uuid references public.produce(id), name text not null, quantity numeric, unit text, is_pantry boolean default false, est_cost numeric, is_double_up_eligible boolean default false);
create table public.program_rules (id uuid primary key default gen_random_uuid(), program text not null, rule_key text not null, rule_value text not null, effective_date date not null, source_url text not null, created_at timestamptz default now());
create table public.shopping_lists (id uuid primary key default gen_random_uuid(), device_id text not null, recipe_ids uuid[], created_at timestamptz default now());

grant select on public.sources, public.produce, public.source_produce, public.cuisines, public.recipes, public.recipe_ingredients, public.program_rules to anon, authenticated;
grant insert, update, delete on public.sources, public.produce, public.source_produce, public.cuisines, public.recipes, public.recipe_ingredients, public.program_rules to authenticated;
grant all on public.sources, public.produce, public.source_produce, public.cuisines, public.recipes, public.recipe_ingredients, public.program_rules, public.shopping_lists to service_role;

alter table public.sources enable row level security;
alter table public.produce enable row level security;
alter table public.source_produce enable row level security;
alter table public.cuisines enable row level security;
alter table public.recipes enable row level security;
alter table public.recipe_ingredients enable row level security;
alter table public.program_rules enable row level security;
alter table public.shopping_lists enable row level security;

create policy "Public read" on public.sources for select to anon, authenticated using (true);
create policy "Public read" on public.produce for select to anon, authenticated using (true);
create policy "Public read" on public.source_produce for select to anon, authenticated using (true);
create policy "Public read" on public.cuisines for select to anon, authenticated using (true);
create policy "Public read published" on public.recipes for select to anon, authenticated using (status = 'published' or public.has_role(auth.uid(),'admin'));
create policy "Public read" on public.recipe_ingredients for select to anon, authenticated using (exists (select 1 from public.recipes r where r.id = recipe_id and (r.status='published' or public.has_role(auth.uid(),'admin'))));
create policy "Public read" on public.program_rules for select to anon, authenticated using (true);

create policy "Admin write" on public.sources for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "Admin write" on public.produce for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "Admin write" on public.source_produce for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "Admin write" on public.cuisines for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "Admin write" on public.recipes for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "Admin write" on public.recipe_ingredients for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "Admin write" on public.program_rules for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- shopping_lists: no direct table access; device-scoped access only via functions keyed on device_id
create or replace function public.get_shopping_list(_device_id text) returns setof public.shopping_lists language sql stable security definer set search_path = public as $$ select * from public.shopping_lists where device_id = _device_id and length(_device_id) >= 16 order by created_at desc limit 1 $$;
create or replace function public.save_shopping_list(_device_id text, _recipe_ids uuid[]) returns public.shopping_lists language plpgsql security definer set search_path = public as $$
declare r public.shopping_lists;
begin
  if length(_device_id) < 16 then raise exception 'invalid device id'; end if;
  update public.shopping_lists set recipe_ids = _recipe_ids where device_id = _device_id returning * into r;
  if not found then insert into public.shopping_lists(device_id, recipe_ids) values (_device_id, _recipe_ids) returning * into r; end if;
  return r;
end $$;
grant execute on function public.get_shopping_list(text), public.save_shopping_list(text, uuid[]) to anon, authenticated;