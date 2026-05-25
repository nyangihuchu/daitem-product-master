-- ================================================================
-- 04_market_listings.sql — market_listings 테이블
-- 03_products.sql 실행 후 실행
-- ================================================================

drop table if exists public.market_listings cascade;

create table public.market_listings (
  id                   uuid primary key default gen_random_uuid(),
  product_id           uuid not null references public.products(id) on delete cascade,
  market_name          text not null
                         check (market_name in ('cafe24', 'naver', 'coupang', 'gmarket', 'auction', 'lotteon', '11st')),
  market_product_code  text,
  listing_url          text,
  selling_price        numeric(12, 2) not null default 0,
  registered_at        timestamptz not null default now(),
  unique (product_id, market_name)
);

create index idx_market_listings_product_id on public.market_listings(product_id);

alter table public.market_listings enable row level security;

drop policy if exists "인증 사용자 조회" on public.market_listings;
create policy "인증 사용자 조회" on public.market_listings
  for select to authenticated using (true);

drop policy if exists "운영자 이상 쓰기" on public.market_listings;
create policy "운영자 이상 쓰기" on public.market_listings
  for all to authenticated
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role in ('admin', 'operator')
    )
  );
