# Task 028: 정산 관리 API 및 기능 연동 (F013)

## 개요

정산 관리 기능의 백엔드 API를 구현하고 프론트엔드 UI와 실제 데이터를 연동한다. Supabase에 `settlements` 테이블을 신규 설계하고, 서비스 레이어 및 API 라우트를 구현하며, 더미 데이터를 실제 데이터로 교체한다.

- **대상 기능**: F013 (정산 관리)
- **관련 로드맵**: Phase 5 — Task 028

## 관련 파일

| 파일 | 유형 | 설명 |
|------|------|------|
| `docs/schema.md` | 수정 | `settlements` 테이블 DDL, 인덱스, RLS 추가 |
| `lib/services/settlement-service.ts` | 신규 생성 | `getSettlements`, `createSettlement`, `updateSettlement`, `getSettlementSummary` |
| `app/api/settlements/route.ts` | 신규 생성 | `GET /api/settlements`, `POST /api/settlements` |
| `app/api/settlements/[id]/route.ts` | 신규 생성 | `PATCH /api/settlements/[id]` |
| `app/(dashboard)/settlements/page.tsx` | 수정 | async 서버 컴포넌트 전환, 더미 데이터 제거 |
| `components/settlements/settlements-client.tsx` | 수정 | `orders` prop 제거, 선택 시 `/api/orders` 동적 fetch |

## 수락 기준

- [x] `settlements` 테이블 DDL: id, market_name, settlement_cycle, expected_date, expected_amount, actual_amount, status, deleted_at, created_at
- [x] 인덱스 2개: `idx_settlements_market_name`, `idx_settlements_status`
- [x] RLS 활성화 및 마이그레이션 순서 추가
- [x] `getSettlements()`: status·market 필터, 페이지네이션 지원
- [x] `createSettlement()`: market_name·settlement_cycle 유효성 검증
- [x] `updateSettlement()`: status·actual_amount 업데이트
- [x] `getSettlementSummary()`: pendingTotal, overdueTotal, completedCount 집계
- [x] `GET /api/settlements` → `Settlement[]` JSON
- [x] `POST /api/settlements` (유효 body) → 201
- [x] `POST /api/settlements` (누락 필드) → 400
- [x] `PATCH /api/settlements/[id]` → 200
- [x] `settlements/page.tsx` 더미 데이터 완전 제거
- [x] `SettlementsClient` `orders` prop 제거, 선택 시 `/api/orders?channel=XXX` fetch
- [x] 로딩 중 스피너(Loader2Icon), 빈 상태 메시지 표시
- [x] TypeScript 오류 없음
- [x] Playwright E2E 테스트 통과

## 구현 요약

### DB 스키마

```
settlements 테이블:
  market_name: check('cafe24','naver','coupang','gmarket','auction','lotteon','11st')
  settlement_cycle: check('weekly','biweekly','monthly')
  status: check('pending','completed','overdue')
  소프트 딜리트(deleted_at) 패턴 적용
```

### settlement-service.ts

```
getSettlements({ status?, market?, page=1, limit=50 }) → Settlement[]
  .from('settlements').select('*').is('deleted_at', null)
  조건부 필터 → order expected_date desc → range

createSettlement({ market_name, settlement_cycle, expected_date, expected_amount }) → Settlement
  유효성 검증 후 insert, status='pending' 기본값

updateSettlement(id, { status?, actual_amount? }) → Settlement
  .update(patch).eq('id', id).is('deleted_at', null)

getSettlementSummary() → { pendingTotal, overdueTotal, completedCount }
  .select('status, expected_amount') → JS 집계
```

### API 라우트

```
GET  /api/settlements?status=&market=&page=&limit=  → 200: Settlement[]
POST /api/settlements { market_name, settlement_cycle, expected_date, expected_amount } → 201
PATCH /api/settlements/[id] { status?, actual_amount? } → 200
유효성 오류 → 400, 서버 오류 → 500
```

### 페이지/컴포넌트 변경

```
settlements/page.tsx:
  async 서버 컴포넌트, Promise.all([getSettlements, getCurrentFees])
  SettlementsClient에 settlements, fees props 전달

settlements-client.tsx:
  orders prop 제거
  useEffect(selected) → fetch('/api/orders?channel=X&limit=20')
  loadingOrders state → Loader2Icon 스피너
```

## 테스트 결과

| 항목 | 결과 |
|------|------|
| GET /api/settlements → 200, 배열 반환 | ✅ |
| POST /api/settlements (유효 body) → 201 | ✅ |
| PATCH /api/settlements/[id] → 200 | ✅ |
| /settlements 페이지 로드 → 정산 현황 테이블 렌더링 | ✅ |
| 상세 버튼 클릭 → Sheet 열림, 주문 내역 로딩 | ✅ |
