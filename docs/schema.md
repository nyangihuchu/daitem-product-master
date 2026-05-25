# DAITEM DB 스키마 설계

Supabase PostgreSQL 기반 스키마 정의서.

---

## 설계 원칙

- **소프트 딜리트**: 매입가·정산 관련 테이블은 `deleted_at` 컬럼만 허용 (물리 삭제 금지)
- **자동화 확장 대비**: `orders.source_type`, `purchases.trigger_type` 필드를 MVP부터 포함
- **카페24 연동 대비**: `products.cafe24_product_id` Phase 1부터 포함
- **성능**: `products` 테이블 복합 인덱스로 12만 개 대응

---

## 테이블 정의

### users

```sql
create table public.users (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text not null unique,
  role         text not null default 'viewer'
                 check (role in ('admin', 'operator', 'viewer')),
  notification_settings jsonb,
  created_at   timestamptz not null default now()
);
```

### suppliers

```sql
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
```

### products

```sql
create table public.products (
  id                   uuid primary key default gen_random_uuid(),
  supplier_id          uuid references public.suppliers(id),
  sku                  text not null,                -- 공급처 상품코드 (예: 100-0016)
  supplier_item_no     text,                         -- 공급처 품번 (예: 1223919)
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
  standard_price       numeric(12, 2),              -- 표준가격 (권장소비자가)
  base_selling_price   numeric(12, 2),              -- 공급처 기본 판매가
  purchase_price       numeric(12, 2) not null default 0,
  shipping_fee         integer,
  lead_time_desc       text,                        -- 표준납기일 (예: '주문후60일이내')
  is_returnable        boolean not null default true,
  status               text not null default 'pending'
                         check (status in ('selling', 'out_of_stock', 'discontinued', 'pending', 'reviewing')),
  stock_quantity       integer not null default 0,
  min_stock_quantity   integer not null default 0,
  cafe24_product_id    text,
  deleted_at           timestamptz,
  created_at           timestamptz not null default now()
);

-- 인덱스 (12만 개 상품 목록 조회 최적화)
create index idx_products_supplier_id    on public.products(supplier_id) where deleted_at is null;
create index idx_products_status         on public.products(status) where deleted_at is null;
create index idx_products_category       on public.products(category_large, category_medium, category_small) where deleted_at is null;
create index idx_products_stock          on public.products(stock_quantity) where deleted_at is null;
create index idx_products_internal_code  on public.products(internal_code) where deleted_at is null;
create index idx_products_sku            on public.products(sku) where deleted_at is null;
create index idx_products_brand          on public.products(brand) where deleted_at is null;
create index idx_products_origin         on public.products(origin) where deleted_at is null;

-- 전문 검색 인덱스 (상품명, SKU, 내부코드, 브랜드, 모델명, 규격)
create index idx_products_fts on public.products
  using gin(to_tsvector('simple',
    coalesce(name, '') || ' ' || coalesce(sku, '') || ' ' || coalesce(internal_code, '') || ' ' ||
    coalesce(brand, '') || ' ' || coalesce(model_name, '') || ' ' || coalesce(spec, '')
  ));
```

### market_listings

```sql
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
```

### price_history

```sql
create table public.price_history (
  id              uuid primary key default gen_random_uuid(),
  product_id      uuid not null references public.products(id) on delete cascade,
  previous_price  numeric(12, 2) not null,
  new_price       numeric(12, 2) not null,
  changed_at      timestamptz not null default now()
);

create index idx_price_history_product_id on public.price_history(product_id);
```

### orders

```sql
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

create index idx_orders_status      on public.orders(status);
create index idx_orders_channel     on public.orders(channel);
create index idx_orders_ordered_at  on public.orders(ordered_at desc);
```

### order_items

```sql
create table public.order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.orders(id) on delete cascade,
  product_id    uuid not null references public.products(id),
  quantity      integer not null check (quantity > 0),
  selling_price numeric(12, 2) not null
);

create index idx_order_items_order_id   on public.order_items(order_id);
create index idx_order_items_product_id on public.order_items(product_id);
```

### purchases

```sql
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
```

### purchase_items

```sql
create table public.purchase_items (
  id              uuid primary key default gen_random_uuid(),
  purchase_id     uuid not null references public.purchases(id) on delete cascade,
  product_id      uuid not null references public.products(id),
  quantity        integer not null check (quantity > 0),
  purchase_price  numeric(12, 2) not null
);

create index idx_purchase_items_purchase_id on public.purchase_items(purchase_id);
create index idx_purchase_items_product_id  on public.purchase_items(product_id);
```

### market_fees

```sql
create table public.market_fees (
  id           uuid primary key default gen_random_uuid(),
  market_name  text not null
                 check (market_name in ('cafe24', 'naver', 'coupang', 'gmarket', 'auction', 'lotteon', '11st')),
  fee_rate     numeric(5, 2) not null check (fee_rate >= 0 and fee_rate <= 100),
  applied_at   date not null,
  created_at   timestamptz not null default now()
);

create index idx_market_fees_market_name on public.market_fees(market_name, applied_at desc);
```

### schedules

```sql
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
```

---

## DB 함수

### 구입가 변경 시 이력 자동 기록 트리거

```sql
create or replace function public.record_price_history()
returns trigger language plpgsql as $$
begin
  if old.purchase_price <> new.purchase_price then
    insert into public.price_history(product_id, previous_price, new_price)
    values (new.id, old.purchase_price, new.purchase_price);
  end if;
  return new;
end;
$$;

create trigger trg_product_price_history
  after update on public.products
  for each row execute function public.record_price_history();
```

---

## Row Level Security (RLS) 초안

```sql
-- RLS 활성화
alter table public.users          enable row level security;
alter table public.suppliers      enable row level security;
alter table public.products       enable row level security;
alter table public.market_listings enable row level security;
alter table public.price_history  enable row level security;
alter table public.orders         enable row level security;
alter table public.order_items    enable row level security;
alter table public.purchases      enable row level security;
alter table public.purchase_items enable row level security;
alter table public.market_fees    enable row level security;
alter table public.schedules      enable row level security;

-- 인증된 사용자 전체 조회 허용 (조회 전용 포함)
create policy "인증 사용자 조회" on public.products
  for select to authenticated using (true);

-- 운영자 이상 쓰기 허용 (Task 015에서 역할별 세부 정책으로 교체)
create policy "운영자 이상 쓰기" on public.products
  for all to authenticated
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role in ('admin', 'operator')
    )
  );
```

> **참고**: 상세 RLS 정책은 Task 015 (Supabase 인증 연동) 단계에서 역할별로 완성 예정

---

## 마이그레이션 실행 순서

1. `users`
2. `suppliers`
3. `products` + 인덱스
4. `market_listings`
5. `price_history` + 트리거
6. `orders`
7. `order_items`
8. `purchases`
9. `purchase_items`
10. `market_fees`
11. `schedules`
12. RLS 정책 적용
