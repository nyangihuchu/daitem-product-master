-- ================================================================
-- 06_orders.sql — orders 테이블
-- 05_price_history.sql 실행 후 실행
-- source_type(manual/api) 포함 — 향후 마켓 API 자동 수집 확장 대비
-- ================================================================

drop table if exists public.orders cascade;

create table public.orders (
  id                uuid primary key default gen_random_uuid(),
  internal_order_no text not null unique,
  market_order_no   text,
  channel           text not null
                      check (channel in ('cafe24', 'naver', 'coupang', 'gmarket', 'auction', 'lotteon', '11st')),
  source_type       text not null default 'manual'
                      check (source_type in ('manual', 'api')),
  status            text not null default 'received'
                      check (status in ('received', 'ordered', 'shipping', 'delivered', 'settled', 'cancelled', 'returned')),
  ordered_at        timestamptz not null default now(),
  created_at        timestamptz not null default now()
);

create index idx_orders_status     on public.orders(status);
create index idx_orders_channel    on public.orders(channel);
create index idx_orders_ordered_at on public.orders(ordered_at desc);
