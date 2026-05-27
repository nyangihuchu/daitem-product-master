# Task 025: 대시보드 KPI 실제 데이터 연동 (F001, F002, F003)

## 개요

대시보드 페이지의 더미 데이터를 실제 Supabase 데이터로 교체한다. Task 024와 동일한 서비스 레이어 패턴을 적용한다.

- **대상 기능**: F001 (오늘 주문 건수), F002 (미처리 발주), F003 (이달 매출·이익)
- **관련 로드맵**: Phase 4 — Task 025

## 관련 파일

| 파일 | 유형 | 설명 |
|------|------|------|
| `lib/services/dashboard-service.ts` | 신규 생성 | KPI 집계 서비스 (getDashboardKPI, getChannelSales, getLowStockProducts, getUpcomingSchedules) |
| `app/api/dashboard/route.ts` | 신규 생성 | GET /api/dashboard — KPI + 채널 매출 통합 반환 |
| `components/charts/channel-sales-chart.tsx` | 수정 | CHANNEL_DATA 하드코딩 제거, data: ChannelSaleData[] props 추가 |
| `app/(dashboard)/dashboard/page.tsx` | 수정 | 더미 데이터 → 실제 서비스 호출, async 서버 컴포넌트로 변환 |

## 수락 기준

- [ ] `getDashboardKPI()` → `DashboardKPI` 반환 (monthlyRevenue, revenueChange, monthlyOrders, ordersChange, pendingPurchases, pendingSettlement)
- [ ] `getChannelSales()` → `ChannelSaleData[]` 반환 (이달 채널별 매출, 색상 포함)
- [ ] `getLowStockProducts()` → 재고 부족 상품 목록 (stock_quantity < min_stock_quantity)
- [ ] `getUpcomingSchedules()` → 7일 이내 임박 일정 (dday 포함, 최대 5개)
- [ ] `GET /api/dashboard` → `{ kpi, channelSales }` JSON 반환
- [ ] `channel-sales-chart.tsx` CHANNEL_DATA 하드코딩 제거, `data` prop 사용
- [ ] `dashboard/page.tsx` getDummy* 완전 제거
- [ ] `npm run build` 오류 없음
- [ ] Playwright E2E 테스트 통과

## 구현 단계

### Step 1: dashboard-service.ts 생성

**KPI 계산 공식:**
```
이달 매출 = 이달 orders(cancelled/returned 제외) order_items 합산
전월 대비 % = (이달 - 전월) / 전월 * 100
미처리 발주 = purchases.status = 'pending' count
미정산 잔액 = orders.status = 'delivered' order_items 합산
```

**4개 함수:**
- `getDashboardKPI()` — 이달/전월 비교 집계
- `getChannelSales()` — 이달 채널별 매출 + 색상
- `getLowStockProducts()` — stock_quantity < min_stock_quantity JS filter
- `getUpcomingSchedules()` — 7일 이내 일정, dday 계산

### Step 2: API 라우트 + 차트 컴포넌트 수정

- `app/api/dashboard/route.ts` 신규 생성
- `channel-sales-chart.tsx` props 추가

### Step 3: dashboard/page.tsx 연동

- `async` 서버 컴포넌트로 변경
- `Promise.all` 4개 병렬 호출
- `<ChannelSalesChart data={channelSales} />`

### Step 4: Playwright E2E 테스트

## 테스트 체크리스트

- [ ] 대시보드 페이지 로드 → KPI 카드 4종(이달 매출, 이달 주문, 미정산 잔액, 미처리 발주) 표시
- [ ] 채널별 매출 차트 렌더링 확인 (막대/파이)
- [ ] 임박 일정 카드 존재 확인
- [ ] 재고 부족 테이블 존재 확인
- [ ] `GET /api/dashboard` → `{ kpi: { monthlyRevenue, ... }, channelSales: [...] }`
