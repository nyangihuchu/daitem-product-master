-- ================================================================
-- 10_market_fees.sql — market_fees 테이블
-- 마켓별 수수료율 이력 관리 (applied_at 기준 최신 적용)
-- ================================================================

drop table if exists public.market_fees cascade;

create table public.market_fees (
  id           uuid primary key default gen_random_uuid(),
  market_name  text not null
                 check (market_name in ('cafe24', 'naver', 'coupang', 'gmarket', 'auction', 'lotteon', '11st')),
  fee_rate     numeric(5, 2) not null check (fee_rate >= 0 and fee_rate <= 100),
  applied_at   date not null,
  created_at   timestamptz not null default now()
);

create index idx_market_fees_market_name on public.market_fees(market_name, applied_at desc);
