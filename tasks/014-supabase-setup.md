# Task 014: Supabase 프로젝트 설정 및 DB 스키마 구축

## 개요

Supabase PostgreSQL 기반 전체 DB 스키마를 구축하고, Next.js App Router와 연동하기 위한 클라이언트 설정 및 타입 정의를 완성한다.

- **대상 기능**: F001~F022 전체 (모든 기능의 데이터 계층 기반)
- **관련 로드맵**: Phase 3 — Task 014

## 관련 파일

| 파일 | 유형 | 설명 |
|------|------|------|
| `supabase/migrations/01_users.sql` | 마이그레이션 | users 테이블 + handle_new_user 트리거 |
| `supabase/migrations/02_suppliers.sql` | 마이그레이션 | suppliers 테이블 |
| `supabase/migrations/03_products.sql` | 마이그레이션 | products 테이블 + 인덱스 + FTS |
| `supabase/migrations/04_market_listings.sql` | 마이그레이션 | market_listings 테이블 |
| `supabase/migrations/05_price_history.sql` | 마이그레이션 | price_history 테이블 + 변경 트리거 |
| `supabase/migrations/06_orders.sql` | 마이그레이션 | orders 테이블 (source_type 포함) |
| `supabase/migrations/07_order_items.sql` | 마이그레이션 | order_items 테이블 |
| `supabase/migrations/08_purchases.sql` | 마이그레이션 | purchases 테이블 (trigger_type 포함) |
| `supabase/migrations/09_purchase_items.sql` | 마이그레이션 | purchase_items 테이블 |
| `supabase/migrations/10_market_fees.sql` | 마이그레이션 | market_fees 테이블 |
| `supabase/migrations/11_schedules.sql` | 마이그레이션 | schedules 테이블 |
| `supabase/migrations/12_rls_policies.sql` | 마이그레이션 | 전체 RLS 정책 통합 |
| `lib/supabase/server.ts` | 클라이언트 | 서버 컴포넌트용 Supabase 클라이언트 |
| `lib/supabase/client.ts` | 클라이언트 | 클라이언트 컴포넌트용 Supabase 클라이언트 |
| `lib/supabase/proxy.ts` | 클라이언트 | 미들웨어 세션 갱신용 Supabase 클라이언트 |
| `lib/database.types.ts` | 타입 | DB 테이블 Row/Insert/Update 타입 정의 |
| `.env.local.example` | 설정 | 환경변수 템플릿 |
| `docs/schema.md` | 참조 | 전체 스키마 설계 문서 |

## 구현 단계

### 1단계: 환경변수 설정

`.env.local` 파일에 다음 3개 키가 모두 있는지 확인한다.

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

`SUPABASE_SERVICE_ROLE_KEY` 확인 방법:
1. [Supabase 대시보드](https://supabase.com/dashboard) 접속
2. 프로젝트 선택 → **Project Settings** → **API**
3. **Service role** 섹션의 키를 `.env.local`에 추가

> 주의: `SUPABASE_SERVICE_ROLE_KEY`는 절대 클라이언트에 노출하지 말 것 (서버 전용)

### 2단계: Supabase 대시보드 SQL Editor에서 마이그레이션 실행

아래 순서대로 각 파일의 SQL을 **Supabase 대시보드 → SQL Editor**에서 실행한다.
(각 파일은 `supabase/migrations/` 디렉토리에 위치)

| 순서 | 파일 | 비고 |
|------|------|------|
| 1 | `01_users.sql` | auth.users 연동 트리거 포함 |
| 2 | `02_suppliers.sql` | |
| 3 | `03_products.sql` | 12만 개 대응 인덱스 + FTS |
| 4 | `04_market_listings.sql` | |
| 5 | `05_price_history.sql` | 구입가 변경 자동 기록 트리거 포함 |
| 6 | `06_orders.sql` | |
| 7 | `07_order_items.sql` | |
| 8 | `08_purchases.sql` | |
| 9 | `09_purchase_items.sql` | |
| 10 | `10_market_fees.sql` | |
| 11 | `11_schedules.sql` | |
| 12 | `12_rls_policies.sql` | 반드시 마지막에 실행 |

> 재실행 시: 각 파일 상단의 `drop type if exists ... cascade` 구문이 기존 타입을 안전하게 제거함

### 3단계: TypeScript 타입 검증

```bash
npm run build
```

또는 타입 체크만:

```bash
npx tsc --noEmit
```

오류 없이 통과하면 설정 완료.

## 수락 기준

- [ ] `.env.local`에 3개 환경변수(URL, ANON_KEY, SERVICE_ROLE_KEY) 모두 설정됨
- [ ] Supabase 대시보드에서 11개 테이블 생성 확인 (Table Editor에서 확인)
- [ ] `products` 테이블에 인덱스 9개(8개 일반 + 1개 FTS) 생성 확인
- [ ] `price_history` 변경 트리거(`trg_product_price_history`) 생성 확인
- [ ] 전체 11개 테이블 RLS 활성화 확인
- [ ] `npm run build` 또는 `npx tsc --noEmit` 통과 (TypeScript 오류 없음)
- [ ] `lib/database.types.ts`에 11개 테이블 타입 정의 확인
