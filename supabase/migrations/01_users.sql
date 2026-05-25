-- ================================================================
-- 01_users.sql — users 테이블
-- 이전 버전 완전 교체: role, notification_settings 컬럼 추가,
--   handle_new_user 트리거에 role 기본값 반영
-- Supabase 대시보드 SQL Editor에서 실행
-- ================================================================

-- 신규 설치: 테이블 생성 / 기존 설치: 건너뜀
create table if not exists public.users (
  id                    uuid primary key references auth.users(id) on delete cascade,
  email                 text not null unique,
  role                  text not null default 'viewer'
                          check (role in ('admin', 'operator', 'viewer')),
  notification_settings jsonb,
  created_at            timestamptz not null default now()
);

-- 기존 설치 대응: 구버전에 누락된 컬럼 추가 (이미 있으면 무시)
alter table public.users
  add column if not exists role text not null default 'viewer'
    check (role in ('admin', 'operator', 'viewer'));

alter table public.users
  add column if not exists notification_settings jsonb;

alter table public.users enable row level security;

drop policy if exists "본인 데이터만 조회 가능" on public.users;
create policy "본인 데이터만 조회 가능" on public.users
  for select using (auth.uid() = id);

drop policy if exists "본인 데이터만 삽입 가능" on public.users;
create policy "본인 데이터만 삽입 가능" on public.users
  for insert with check (auth.uid() = id);

drop policy if exists "본인 데이터만 수정 가능" on public.users;
create policy "본인 데이터만 수정 가능" on public.users
  for update using (auth.uid() = id);

-- 회원가입 시 users 테이블에 자동 삽입 (role 기본값 viewer)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
