-- ================================================================
-- 11_schedules.sql — schedules 테이블
-- 01_users.sql 실행 후 실행
-- ================================================================

drop table if exists public.schedules cascade;

create table public.schedules (
  id                  uuid primary key default gen_random_uuid(),
  type                text not null
                        check (type in ('supplier', 'market', 'internal', 'customer')),
  title               text not null,
  description         text,
  assigned_user_id    uuid references public.users(id),
  scheduled_at        date not null,
  notify_days_before  integer[] not null default '{}',
  is_completed        boolean not null default false,
  created_at          timestamptz not null default now()
);

create index idx_schedules_scheduled_at on public.schedules(scheduled_at);
create index idx_schedules_assigned     on public.schedules(assigned_user_id) where not is_completed;
