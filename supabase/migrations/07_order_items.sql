-- ================================================================
-- 07_order_items.sql — order_items 테이블
-- 06_orders.sql 실행 후 실행
-- ================================================================

drop table if exists public.order_items cascade;

create table public.order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.orders(id) on delete cascade,
  product_id    uuid not null references public.products(id),
  quantity      integer not null check (quantity > 0),
  selling_price numeric(12, 2) not null
);

create index idx_order_items_order_id   on public.order_items(order_id);
create index idx_order_items_product_id on public.order_items(product_id);
