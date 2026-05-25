-- ================================================================
-- 08_purchases.sql — purchases 테이블
-- 02_suppliers.sql 실행 후 실행
-- trigger_type(manual/auto) 포함 — 향후 자동 발주 확장 대비
-- ================================================================

drop table if exists public.purchases cascade;

create table public.purchases (
  id            uuid primary key default gen_random_uuid(),
  supplier_id   uuid not null references public.suppliers(id),
  trigger_type  text not null default 'manual'
                  check (trigger_type in ('manual', 'auto')),
  status        text not null default 'pending'
                  check (status in ('pending', 'ordered', 'shipping', 'received')),
  total_amount  numeric(12, 2) not null default 0,
  ordered_at    timestamptz not null default now(),
  deleted_at    timestamptz,
  created_at    timestamptz not null default now()
);

create index idx_purchases_supplier_id on public.purchases(supplier_id) where deleted_at is null;
create index idx_purchases_status      on public.purchases(status) where deleted_at is null;
create index idx_purchases_ordered_at  on public.purchases(ordered_at desc);
