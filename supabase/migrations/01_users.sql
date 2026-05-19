-- ================================================================
-- Phase 1 — users 테이블
-- Supabase 대시보드 SQL Editor에서 실행
-- ================================================================

CREATE TABLE public.users (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "본인 데이터만 조회 가능" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "본인 데이터만 삽입 가능" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 회원가입 시 users 테이블에 자동 삽입
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
