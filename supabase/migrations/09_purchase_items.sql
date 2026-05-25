-- ================================================================
-- 09_purchase_items.sql — purchase_items 테이블
-- 08_purchases.sql 실행 후 실행
-- ================================================================

drop table if exists public.purchase_items cascade;

create table public.purchase_items (
  id              uuid primary key default gen_random_uuid(),
  purchase_id     uuid not null references public.purchases(id) on delete cascade,
  product_id      uuid not null references public.products(id),
  quantity        integer not null check (quantity > 0),
  purchase_price  numeric(12, 2) not null  -- 발주 시점 매입가 (이력 보존)
);

create index idx_purchase_items_purchase_id on public.purchase_items(purchase_id);
create index idx_purchase_items_product_id  on public.purchase_items(product_id);
