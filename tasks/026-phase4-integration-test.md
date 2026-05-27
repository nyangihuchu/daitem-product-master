# Task 026: Phase 4 통합 테스트

## 개요

Phase 4에서 구현된 주문·발주·마진·대시보드 기능 전체를 Playwright MCP `browser_evaluate`(fetch)로 API 레이어 E2E 통합 테스트한다.

- **대상 기능**: 주문 CRUD/상태 전이, 발주 CRUD/상태 전이, 마진 계산, PDF 생성, 이메일 발송, 대시보드 KPI 반영, 에러 핸들링
- **관련 로드맵**: Phase 4 — Task 026

## 관련 파일

| 파일 | 유형 | 설명 |
|------|------|------|
| `app/api/orders/route.ts` | 참조 | 주문 생성/조회 |
| `app/api/orders/[id]/route.ts` | 참조 | 주문 상태 전이, 취소(DELETE) |
| `app/api/purchases/route.ts` | 참조 | 발주 생성/조회 |
| `app/api/purchases/[id]/route.ts` | 참조 | 발주 상태 전이, soft-delete |
| `app/api/purchases/[id]/pdf/route.ts` | 참조 | PDF 생성 |
| `app/api/purchases/[id]/email/route.ts` | 참조 | 이메일 발송 |
| `app/api/margin/route.ts` | 참조 | 마진 계산 |
| `app/api/dashboard/route.ts` | 참조 | 대시보드 KPI |
| `lib/services/order-service.ts` | 참조 | 상태 전이 규칙 |
| `lib/services/purchase-service.ts` | 참조 | 상태 전이 규칙 |

## 수락 기준

- [x] 주문 생성(201) → 상태 전이 received→ordered→shipping(200×2) 확인
- [x] 발주 생성(201) → 상태 전이 pending→ordered→shipping→received(200×3) 확인
- [x] 주문 DELETE → status=cancelled, 발주 DELETE → soft-delete(목록 미노출)
- [x] GET /api/margin: feeAmount/marginAmount/marginRate 수치 정확성 확인
- [x] GET /api/purchases/{id}/pdf → Content-Type: application/pdf
- [x] POST /api/purchases/{id}/email → API 응답 반환 (환경변수 미설정 시 에러 메시지)
- [x] 에러 핸들링 5종 모두 400 + 명확한 error 메시지
- [x] 대시보드 주문 생성 후 kpi.monthlyOrders 1 증가 실시간 반영
- [x] 테스트 데이터 전량 정리 완료

## 테스트 시나리오 요약

### 시나리오 1: 주문·발주 전체 프로세스

```
공급처 생성(201)
→ 주문 생성(201, status=received)
→ PATCH ordered(200) → PATCH shipping(200)
→ 발주 생성(201, status=pending)
→ PATCH ordered(200) → PATCH shipping(200) → PATCH received(200)
→ DELETE 주문(204) → 주문 status=cancelled 확인
→ DELETE 발주(204) → 목록 미노출 확인
→ DELETE 공급처(204)
```

### 시나리오 2: 마진 계산 + PDF + 이메일

```
GET /api/margin?selling_price=100000&purchase_price=60000&fee_rate=10
→ feeAmount=10000, marginAmount=30000, marginRate=30 ✅

GET /api/margin?selling_price=50000&purchase_price=30000&channel=naver
→ DB fee_rate=5.5% 조회, feeAmount=2750, marginRate=34.5 ✅

GET /api/purchases/{id}/pdf → Content-Type: application/pdf ✅

POST /api/purchases/{id}/email { to: 'test@example.com' }
→ 500 (RESEND_API_KEY 미설정, 정상 에러 처리) ✅
```

### 시나리오 3: 에러 핸들링 + 대시보드 반영

```
POST /api/orders {} → 400 "채널을 선택하세요" ✅
POST /api/orders { channel } → 400 "상품을 1개 이상 입력하세요" ✅
POST /api/purchases {} → 400 "공급처를 선택하세요" ✅
GET /api/margin (파라미터 없음) → 400 ✅
PATCH cancelled→delivered → 400 "'cancelled' 상태에서 'delivered'로 전이할 수 없습니다" ✅

대시보드: 주문 생성 전(1건) → 생성 후(2건) → 정리 후(1건) ✅
```

## 비고

- 테스트는 실제 Supabase DB를 사용하며 테스트 종료 시 전량 정리
- 이메일 발송은 `RESEND_API_KEY` 환경변수 설정 시 실제 발송 가능 (로컬 미설정)
- 상태 전이 규칙: 주문(received→ordered→shipping→delivered→settled), 발주(pending→ordered→shipping→received)
