# Task 027: 판매 통계 API 및 기능 연동 (F012)

## 개요

수익 분석 페이지의 기간별 차트(일간/주간/월간/분기/연간)를 실제 Supabase 데이터로 연동한다. 서버 컴포넌트는 유지하고, 차트 컴포넌트에서 탭 전환 시 클라이언트 fetch로 동적 조회한다.

- **대상 기능**: F012 (판매 통계·기간별 집계)
- **관련 로드맵**: Phase 5 — Task 027

## 관련 파일

| 파일 | 유형 | 설명 |
|------|------|------|
| `lib/services/margin-service.ts` | 수정 | `PeriodType` export, `getDateRangeStart()` 헬퍼, quarterly/annual 지원 추가 |
| `app/api/analytics/period-stats/route.ts` | 신규 생성 | `GET /api/analytics/period-stats?period=` |
| `components/analytics/period-sales-chart.tsx` | 수정 | 하드코딩 4종 제거, 클라이언트 fetch 연동 |

## 수락 기준

- [x] `PeriodType = 'daily'|'weekly'|'monthly'|'quarterly'|'annual'` export
- [x] `getDateRangeStart(period)`: annual=5년, quarterly=2년, monthly=12개월, daily/weekly=90일
- [x] quarterly key 형식: `YYYY-QN` (예: `2026-Q2`)
- [x] annual key 형식: `YYYY` (예: `2026`)
- [x] `GET /api/analytics/period-stats?period=monthly` → `PeriodStats[]` JSON
- [x] `GET /api/analytics/period-stats` (파라미터 없음) → 400
- [x] `period-sales-chart.tsx` 하드코딩 상수 4종 완전 제거
- [x] 탭 전환 시 `/api/analytics/period-stats?period=X` 클라이언트 fetch
- [x] 초기 monthly는 props.periodStats 직접 사용 (fetch 생략)
- [x] 로딩 중 "로딩 중..." 표시, 빈 데이터 "데이터 없음" 표시
- [x] `npm run build` 오류 없음
- [x] Playwright E2E 테스트 통과

## 구현 요약

### margin-service.ts 변경

```
PeriodType = 'daily'|'weekly'|'monthly'|'quarterly'|'annual'

getDateRangeStart(period):
  annual   → 5년 전
  quarterly → 2년 전
  monthly  → 12개월 전
  daily/weekly → 90일 전

formatPeriodKey:
  quarterly: Math.ceil((month+1)/3) → 'YYYY-QN'
  annual: 'YYYY'

getPeriodStats(period: PeriodType = 'monthly')
```

### API 라우트

```
GET /api/analytics/period-stats?period=daily|weekly|monthly|quarterly|annual
→ 200: PeriodStats[]
→ 400: { error: 'period는 ...' }
```

### period-sales-chart.tsx

```
하드코딩 제거: DAILY_DATA, WEEKLY_DATA, QUARTERLY_DATA, ANNUAL_DATA
클라이언트 state: activePeriod, data, loading, initialized
초기값: monthly → props.periodStats 직접 사용
탭 전환: onValueChange → setActivePeriod → useEffect → fetch
```

## 테스트 결과

| 항목 | 결과 |
|------|------|
| /analytics 페이지 로드, KPI 카드 4종, 탭 5종 | ✅ |
| monthly API → 배열 1건 | ✅ |
| quarterly API → key="2026-Q2" (YYYY-QN) | ✅ |
| annual API → key="2026" (YYYY) | ✅ |
| 파라미터 없음 → 400 | ✅ |
