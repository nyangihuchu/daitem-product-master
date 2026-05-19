-- ================================================================
-- Phase 2 — suppliers 테이블
-- 01_users.sql 실행 후 실행
-- ================================================================

CREATE TYPE supplier_type AS ENUM ('domestic', 'overseas');
CREATE TYPE payment_term AS ENUM ('prepaid', 'postpaid', 'monthly');

CREATE TABLE public.suppliers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type          supplier_type NOT NULL DEFAULT 'domestic',
  name          TEXT NOT NULL,
  contact_name  TEXT,
  contact_phone TEXT,
  payment_term  payment_term NOT NULL DEFAULT 'prepaid',
  memo          TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "본인 공급처만 조회 가능" ON public.suppliers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "본인 공급처만 삽입 가능" ON public.suppliers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "본인 공급처만 수정 가능" ON public.suppliers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "본인 공급처만 삭제 가능" ON public.suppliers
  FOR DELETE USING (auth.uid() = user_id);
