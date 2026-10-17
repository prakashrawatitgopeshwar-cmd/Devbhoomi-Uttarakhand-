-- Team and employee management for DevBhoomi Himalayan Horizons.
-- Apply after 20261017000000_admin_portal.sql.
begin;

create sequence if not exists public.employee_id_seq start 1;

create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  employee_id text not null unique default (
    'DBH-EMP-' || lpad(nextval('public.employee_id_seq')::text, 4, '0')
  ),
  auth_user_id uuid unique references auth.users(id) on delete set null,
  full_name text not null,
  email text,
  phone text,
  designation text not null,
  department text,
  role text not null default 'employee'
    check (role in ('founder','admin','manager','team_leader','content_editor','operations_staff','support_staff','employee')),
  manager_id uuid references public.team_members(id) on delete set null,
  status text not null default 'active'
    check (status in ('active','inactive','on_leave')),
  joining_date date,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint team_member_not_own_manager check (manager_id is null or manager_id <> id)
);

create index if not exists idx_team_members_manager on public.team_members(manager_id);
create index if not exists idx_team_members_role on public.team_members(role);
create index if not exists idx_team_members_status on public.team_members(status);

create table if not exists public.team_role_permissions (
  role text not null check (role in ('founder','admin','manager','team_leader','content_editor','operations_staff','support_staff','employee')),
  permission text not null,
  allowed boolean not null default false,
  primary key (role, permission)
);

insert into public.team_role_permissions(role, permission, allowed) values
 ('founder','team.manage',true), ('founder','roles.manage',true),
 ('founder','content.publish',true), ('founder','analytics.view',true),
 ('admin','team.manage',true), ('admin','content.publish',true),
 ('admin','analytics.view',true), ('manager','team.view_reports',true),
 ('manager','team.assign_work',true), ('manager','analytics.view_team',true),
 ('team_leader','team.view_assigned',true), ('team_leader','team.assign_work',true),
 ('content_editor','content.edit',true), ('operations_staff','operations.manage',true),
 ('support_staff','support.manage',true)
on conflict (role, permission) do update set allowed = excluded.allowed;

create or replace function public.set_team_member_updated_at()
returns trigger language plpgsql set search_path = ''
as $$ begin new.updated_at = now(); return new; end; $$;

drop trigger if exists team_members_updated_at on public.team_members;
create trigger team_members_updated_at before update on public.team_members
for each row execute function public.set_team_member_updated_at();

alter table public.team_members enable row level security;
alter table public.team_role_permissions enable row level security;

drop policy if exists "Admin manages team members" on public.team_members;
create policy "Admin manages team members" on public.team_members
for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admin reads team permissions" on public.team_role_permissions;
create policy "Admin reads team permissions" on public.team_role_permissions
for select to authenticated using (public.is_admin());

commit;
