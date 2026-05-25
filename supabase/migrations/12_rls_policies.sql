-- ================================================================
-- 12_rls_policies.sql — 전체 테이블 RLS 정책 통합
-- 모든 마이그레이션(01~11) 실행 후 마지막에 실행
-- 상세 역할별 정책은 Task 015 (인증 연동) 단계에서 완성 예정
-- ================================================================

-- ----------------------------------------------------------------
-- RLS 활성화 (idempotent — 이미 활성화된 경우 무시됨)
-- ----------------------------------------------------------------
alter table public.users           enable row level security;
alter table public.suppliers       enable row level security;
alter table public.products        enable row level security;
alter table public.market_listings enable row level security;
alter table public.price_history   enable row level security;
alter table public.orders          enable row level security;
alter table public.order_items     enable row level security;
alter table public.purchases       enable row level security;
alter table public.purchase_items  enable row level security;
alter table public.market_fees     enable row level security;
alter table public.schedules       enable row level security;

-- ----------------------------------------------------------------
-- orders — 인증 사용자 조회 / 운영자 이상 쓰기
-- ----------------------------------------------------------------
drop policy if exists "인증 사용자 조회" on public.orders;
create policy "인증 사용자 조회" on public.orders
  for select to authenticated using (true);

drop policy if exists "운영자 이상 쓰기" on public.orders;
create policy "운영자 이상 쓰기" on public.orders
  for all to authenticated
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role in ('admin', 'operator')
    )
  );

-- ----------------------------------------------------------------
-- order_items — 인증 사용자 조회 / 운영자 이상 쓰기
-- ----------------------------------------------------------------
drop policy if exists "인증 사용자 조회" on public.order_items;
create policy "인증 사용자 조회" on public.order_items
  for select to authenticated using (true);

drop policy if exists "운영자 이상 쓰기" on public.order_items;
create policy "운영자 이상 쓰기" on public.order_items
  for all to authenticated
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role in ('admin', 'operator')
    )
  );

-- ----------------------------------------------------------------
-- purchases — 인증 사용자 조회 / 운영자 이상 쓰기
-- ----------------------------------------------------------------
drop policy if exists "인증 사용자 조회" on public.purchases;
create policy "인증 사용자 조회" on public.purchases
  for select to authenticated using (true);

drop policy if exists "운영자 이상 쓰기" on public.purchases;
create policy "운영자 이상 쓰기" on public.purchases
  for all to authenticated
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role in ('admin', 'operator')
    )
  );

-- ----------------------------------------------------------------
-- purchase_items — 인증 사용자 조회 / 운영자 이상 쓰기
-- ----------------------------------------------------------------
drop policy if exists "인증 사용자 조회" on public.purchase_items;
create policy "인증 사용자 조회" on public.purchase_items
  for select to authenticated using (true);

drop policy if exists "운영자 이상 쓰기" on public.purchase_items;
create policy "운영자 이상 쓰기" on public.purchase_items
  for all to authenticated
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role in ('admin', 'operator')
    )
  );

-- ----------------------------------------------------------------
-- market_fees — 인증 사용자 조회 / 관리자만 쓰기
-- ----------------------------------------------------------------
drop policy if exists "인증 사용자 조회" on public.market_fees;
create policy "인증 사용자 조회" on public.market_fees
  for select to authenticated using (true);

drop policy if exists "관리자만 쓰기" on public.market_fees;
create policy "관리자만 쓰기" on public.market_fees
  for all to authenticated
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

-- ----------------------------------------------------------------
-- schedules — 인증 사용자 조회 / 운영자 이상 쓰기
-- ----------------------------------------------------------------
drop policy if exists "인증 사용자 조회" on public.schedules;
create policy "인증 사용자 조회" on public.schedules
  for select to authenticated using (true);

drop policy if exists "운영자 이상 쓰기" on public.schedules;
create policy "운영자 이상 쓰기" on public.schedules
  for all to authenticated
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role in ('admin', 'operator')
    )
  );
