-- ================================================================
-- Phase 3 — products 테이블
-- 02_suppliers.sql 실행 후 실행
-- 스키마 확정 후 실행할 것
-- ================================================================

CREATE TYPE product_status AS ENUM ('selling', 'suspended', 'out_of_stock', 'discontinued');

CREATE TABLE public.products (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  supplier_id        UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
  sku                TEXT NOT NULL,
  name               TEXT NOT NULL,
  category           TEXT,
  purchase_price     NUMERIC(12, 2) NOT NULL DEFAULT 0,
  selling_price      NUMERIC(12, 2) NOT NULL DEFAULT 0,
  -- 매출이익률 = (판매가 - 매입가) / 판매가 × 100
  margin_amount      NUMERIC(12, 2) GENERATED ALWAYS AS (selling_price - purchase_price) STORED,
  margin_rate        NUMERIC(6, 2) GENERATED ALWAYS AS (
                       CASE
                         WHEN selling_price = 0 THEN 0
                         ELSE ROUND(((selling_price - purchase_price) / selling_price) * 100, 2)
                       END
                     ) STORED,
  stock_quantity     INTEGER NOT NULL DEFAULT 0,
  min_stock_quantity INTEGER NOT NULL DEFAULT 0,
  platforms          TEXT[] NOT NULL DEFAULT '{}',
  status             product_status NOT NULL DEFAULT 'selling',
  created_at         TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (user_id, sku)
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "본인 상품만 조회 가능" ON public.products
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "본인 상품만 삽입 가능" ON public.products
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "본인 상품만 수정 가능" ON public.products
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "본인 상품만 삭제 가능" ON public.products
  FOR DELETE USING (auth.uid() = user_id);
