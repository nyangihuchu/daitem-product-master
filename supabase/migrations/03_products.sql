-- ================================================================
-- 03_products.sql — products 테이블
-- 이전 버전 완전 교체: user_id/platforms[]/ENUM 제거,
--   CSV 기반 공급처 데이터 컬럼 전면 추가, 12만 개 대응 인덱스 + FTS
-- 02_suppliers.sql 실행 후 실행
-- ================================================================

-- 이전 버전에서 생성된 ENUM 타입 제거
drop type if exists product_status cascade;

-- 구버전 테이블 제거 (02에서 CASCADE로 이미 제거됐을 수 있으므로 IF EXISTS 사용)
drop table if exists public.products cascade;

create table public.products (
  id                   uuid primary key default gen_random_uuid(),
  supplier_id          uuid references public.suppliers(id),
  sku                  text not null unique,            -- 공급처 상품코드 (예: 100-0016)
  supplier_item_no     text,                           -- 공급처 품번 (예: 1223919)
  internal_code        text not null unique,
  name                 text not null,
  brand                text,
  model_name           text,
  category_large       text,
  category_medium      text,
  category_small       text,
  spec                 text,
  unit                 varchar(20),
  origin               varchar(50),
  image_url            text,
  price_list_image_url text,
  standard_price       numeric(12, 2),                -- 표준가격 (권장소비자가)
  base_selling_price   numeric(12, 2),                -- 공급처 기본 판매가
  purchase_price       numeric(12, 2) not null default 0,
  shipping_fee         integer,
  lead_time_desc       text,                          -- 표준납기일 (예: '주문후60일이내')
  is_returnable        boolean not null default true,
  status               text not null default 'pending'
                         check (status in ('selling', 'out_of_stock', 'discontinued', 'pending', 'reviewing')),
  stock_quantity       integer not null default 0,
  min_stock_quantity   integer not null default 0,
  cafe24_product_id    text,                          -- 카페24 API 연동 대비
  deleted_at           timestamptz,
  created_at           timestamptz not null default now()
);

-- 인덱스 (12만 개 상품 목록 조회 최적화 — 소프트 딜리트 partial index)
create index idx_products_supplier_id   on public.products(supplier_id) where deleted_at is null;
create index idx_products_status        on public.products(status) where deleted_at is null;
create index idx_products_category      on public.products(category_large, category_medium, category_small) where deleted_at is null;
create index idx_products_stock         on public.products(stock_quantity) where deleted_at is null;
create index idx_products_internal_code on public.products(internal_code) where deleted_at is null;
create index idx_products_sku           on public.products(sku) where deleted_at is null;
create index idx_products_brand         on public.products(brand) where deleted_at is null;
create index idx_products_origin        on public.products(origin) where deleted_at is null;

-- 전문 검색 인덱스 (상품명, SKU, 내부코드, 브랜드, 모델명, 규격)
create index idx_products_fts on public.products
  using gin(to_tsvector('simple',
    coalesce(name, '') || ' ' || coalesce(sku, '') || ' ' || coalesce(internal_code, '') || ' ' ||
    coalesce(brand, '') || ' ' || coalesce(model_name, '') || ' ' || coalesce(spec, '')
  ));

alter table public.products enable row level security;

drop policy if exists "인증 사용자 조회" on public.products;
create policy "인증 사용자 조회" on public.products
  for select to authenticated using (true);

drop policy if exists "운영자 이상 쓰기" on public.products;
create policy "운영자 이상 쓰기" on public.products
  for all to authenticated
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role in ('admin', 'operator')
    )
  );
