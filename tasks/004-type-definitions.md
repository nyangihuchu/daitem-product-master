# Task 004: 기본 타입 정의 확장 및 DB 스키마 설계

## 개요

PRD 전체 데이터 모델을 기반으로 TypeScript 인터페이스를 전면 정의하고,
Supabase PostgreSQL 스키마 설계 문서를 작성한다.
Phase 3 (DB 구축) 이전에 타입 안전성과 설계 방향을 확정하는 것이 목표다.

## 관련 파일

- `lib/types.ts` — 도메인 TypeScript 타입 정의
- `lib/constants.ts` — 앱 전역 상수 (SIDEBAR_ITEMS, 레이블 맵 등)
- `docs/schema.md` — Supabase PostgreSQL 스키마 설계 문서
- `components/layout/sidebar.tsx` — 사이드바 아이콘 맵

## 수락 기준

- [ ] PRD의 모든 테이블에 대응하는 TypeScript 인터페이스가 존재한다
- [ ] `orders.source_type: 'manual' | 'api'` 필드가 타입에 포함된다
- [ ] `purchases.trigger_type: 'manual' | 'auto'` 필드가 타입에 포함된다
- [ ] `products.cafe24_product_id` 필드가 타입에 포함된다
- [ ] 소프트 딜리트 대상 테이블에 `deleted_at: string | null`이 반영된다
- [ ] `SIDEBAR_ITEMS`에 전체 9개 메뉴 항목이 정의된다
- [ ] `docs/schema.md`에 11개 테이블의 SQL 정의, 인덱스, RLS 초안이 작성된다
- [ ] `npx tsc --noEmit` 오류 없음

## 구현 단계

### Step 1: lib/types.ts 전면 재정의

도메인 타입:
- `UserRole`, `User`, `NotificationSettings`
- `Supplier` (lead_time_days, deleted_at 추가)
- `Product` (internal_code, category 3단계, cafe24_product_id, deleted_at)
- `MarketListing`, `PriceHistory`
- `Order`, `OrderItem` — `source_type: OrderSourceType` 포함
- `Purchase`, `PurchaseItem` — `trigger_type: PurchaseTriggerType` 포함
- `MarketFee`, `Schedule`
- `MarginSummary`, `PeriodStats` (수익 분석 집계용)
- `Settlement` (정산 도메인)

### Step 2: lib/constants.ts 업데이트

- `SIDEBAR_ITEMS` 9개 메뉴로 확장
- `MARKET_CHANNELS` (7개 채널 value/label 쌍)
- `ORDER_STATUS_LABELS`, `PURCHASE_STATUS_LABELS`, `PRODUCT_STATUS_LABELS`
- `PAYMENT_TERM_LABELS`, `USER_ROLE_LABELS`, `SCHEDULE_TYPE_LABELS`

### Step 3: docs/schema.md 작성

- 11개 테이블 SQL 정의
- `products` 복합 인덱스 + FTS 인덱스 (12만 개 대응)
- 구입가 변경 이력 트리거 (`record_price_history`)
- RLS 정책 초안 (Task 015에서 완성 예정)
- 마이그레이션 실행 순서

### Step 4: 사이드바 아이콘 맵 업데이트

`components/layout/sidebar.tsx`의 `ICON_MAP`에 신규 아이콘 5개 추가:
ShoppingCart, ClipboardList, Wallet, CalendarDays, Settings
