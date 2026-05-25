-- ================================================================
-- 05_price_history.sql — price_history 테이블 + 구입가 변경 트리거
-- 03_products.sql 실행 후 실행
-- ================================================================

drop table if exists public.price_history cascade;

create table public.price_history (
  id              uuid primary key default gen_random_uuid(),
  product_id      uuid not null references public.products(id) on delete cascade,
  previous_price  numeric(12, 2) not null,
  new_price       numeric(12, 2) not null,
  changed_at      timestamptz not null default now()
);

create index idx_price_history_product_id on public.price_history(product_id);

alter table public.price_history enable row level security;

drop policy if exists "인증 사용자 조회" on public.price_history;
create policy "인증 사용자 조회" on public.price_history
  for select to authenticated using (true);

drop policy if exists "운영자 이상 이력 기록" on public.price_history;
create policy "운영자 이상 이력 기록" on public.price_history
  for insert to authenticated
  with check (
    exists (
      select 1 from public.users
      where id = auth.uid() and role in ('admin', 'operator')
    )
  );

-- 구입가 변경 시 이력 자동 기록 트리거 (security definer: RLS 우회, DB 소유자 권한으로 실행)
create or replace function public.record_price_history()
returns trigger language plpgsql security definer as $$
begin
  if old.purchase_price <> new.purchase_price then
    insert into public.price_history(product_id, previous_price, new_price)
    values (new.id, old.purchase_price, new.purchase_price);
  end if;
  return new;
end;
$$;

drop trigger if exists trg_product_price_history on public.products;
create trigger trg_product_price_history
  after update on public.products
  for each row execute function public.record_price_history();
