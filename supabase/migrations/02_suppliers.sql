-- ================================================================
-- 02_suppliers.sql — suppliers 테이블
-- 이전 버전 완전 교체: supplier_type/payment_term ENUM 제거,
--   user_id 제거, lead_time_days/deleted_at 추가
-- 01_users.sql 실행 후 실행
-- ================================================================

-- 구버전 테이블 제거 (products → suppliers FK 의존 순서 준수)
drop table if exists public.products cascade;
drop table if exists public.suppliers cascade;

-- 이전 버전에서 생성된 ENUM 타입 제거
drop type if exists supplier_type cascade;
drop type if exists payment_term cascade;

create table public.suppliers (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  contact_name    text,
  contact_phone   text,
  payment_term    text not null default 'postpaid'
                    check (payment_term in ('prepaid', 'postpaid', 'monthly')),
  lead_time_days  integer,
  memo            text,
  deleted_at      timestamptz,
  created_at      timestamptz not null default now()
);

alter table public.suppliers enable row level security;

-- 인증된 사용자 전체 조회 허용 (상세 RLS는 Task 015에서 역할별로 완성)
drop policy if exists "인증 사용자 조회" on public.suppliers;
create policy "인증 사용자 조회" on public.suppliers
  for select to authenticated using (true);

drop policy if exists "운영자 이상 쓰기" on public.suppliers;
create policy "운영자 이상 쓰기" on public.suppliers
  for all to authenticated
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role in ('admin', 'operator')
    )
  );
