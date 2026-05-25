# Task 024: 실질 마진 계산 로직 구현 (F011)

## 개요

수익 분석 기능의 핵심인 실질 마진 계산 서비스를 구현하고, analytics 페이지의 더미 데이터를 실제 Supabase 데이터로 교체한다.

- **대상 기능**: F011 (실질 마진 계산)
- **관련 로드맵**: Phase 4 — Task 024

## 관련 파일

| 파일 | 유형 | 설명 |
|------|------|------|
| `lib/services/margin-service.ts` | 신규 생성 | 마진 계산 서비스 (calculateMargin, getChannelMarginSummary, getPeriodStats, getTopProductSales) |
| `app/api/margin/route.ts` | 신규 생성 | GET /api/margin 단건 마진 계산 API |
| `app/api/margin/channel-summary/route.ts` | 신규 생성 | GET /api/margin/channel-summary 채널별 마진 집계 API |
| `app/api/margin/period-stats/route.ts` | 신규 생성 | GET /api/margin/period-stats 기간별 통계 API |
| `app/(dashboard)/analytics/page.tsx` | 수정 | 더미 데이터 → 실제 서비스 호출 |
| `components/analytics/analytics-client.tsx` | 수정 | orders prop 제거, topProducts prop 추가 |
| `lib/services/market-fee-service.ts` | 참조 | getCurrentFees() 재사용 |
| `lib/types.ts` | 참조 | MarginSummary, PeriodStats 타입 |

## 수락 기준

- [ ] `calculateMargin({ sellingPrice: 10000, purchasePrice: 6000, feeRate: 10 })` → `{ feeAmount: 1000, marginAmount: 3000, marginRate: 30 }`
- [ ] `GET /api/margin?selling_price=10000&purchase_price=6000&fee_rate=10` → 올바른 JSON 반환
- [ ] `GET /api/margin/channel-summary` → `MarginSummary[]` 반환
- [ ] `GET /api/margin/period-stats?period=monthly` → `PeriodStats[]` 반환
- [ ] analytics 페이지에서 더미 데이터 함수(`getDummy*`) 완전 제거
- [ ] `npm run build` 타입 오류 없음
- [ ] Playwright E2E 테스트 통과

## 구현 단계

### Step 1: margin-service.ts 생성

`lib/services/margin-service.ts` 신규 생성:

**계산 공식:**
```
실질 마진 = 판매가 - 매입가 - 마켓수수료 - 배송비 - (반품비용) - (광고비)
마켓수수료 = 판매가 × (수수료율 / 100)  [반올림]
마진율 = 마진액 / 판매가 × 100
```

**함수 목록:**
- `calculateMargin(params)` — 순수 계산 함수 (DB 없음)
- `getChannelMarginSummary()` — orders JOIN order_items JOIN products + market_fees 집계
- `getPeriodStats(period)` — 기간별 매출·매입·이익 집계
- `getTopProductSales(limit)` — 상품별 판매 순위 집계

### Step 2: /api/margin 라우트 구현

- `app/api/margin/route.ts` — 단건 계산 (쿼리 파라미터)
- `app/api/margin/channel-summary/route.ts` — 채널별 집계
- `app/api/margin/period-stats/route.ts` — 기간별 통계

### Step 3: analytics 페이지 실제 데이터 연동

- `analytics/page.tsx`: `Promise.all`로 5개 서비스 병렬 호출
- `analytics-client.tsx`: `orders` prop 제거, `topProducts: ProductSalesSummary[]` prop 추가, 클라이언트 사이드 집계 로직 제거

### Step 4: Playwright E2E 테스트

마진 계산기 입력값 변경 시 결과 검증 및 API 응답 검증

## 테스트 체크리스트

- [ ] 수익 분석 페이지 로드 → KPI 카드, 마진 계산기, 채널별 마진 테이블 존재 확인
- [ ] 마진 계산기: 채널 선택 → fee_rate 자동 입력 확인
- [ ] 마진 계산기: 판매가 10000, 매입가 6000, 수수료율 10 → 수수료 1,000원, 마진액 3,000원, 마진율 30.0%
- [ ] `GET /api/margin?selling_price=10000&purchase_price=6000&fee_rate=10` → `{ feeAmount: 1000, marginAmount: 3000, marginRate: 30 }`
- [ ] `GET /api/margin/channel-summary` → 배열 반환
- [ ] `GET /api/margin/period-stats?period=monthly` → 배열 반환
