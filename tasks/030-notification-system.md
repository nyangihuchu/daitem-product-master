# Task 030: 알림 발송 시스템 구현 (F015)

## 개요

DAITEM 백오피스에 채널별 어댑터 패턴의 알림 발송 시스템을 구현한다. 이메일(Resend), 브라우저 푸시(Web Push API), 카카오 알림톡(Phase 6 stub) 3채널을 지원하며, cron 기반 자동 트리거와 사용자별 수신 설정을 제공한다.

- **대상 기능**: F015 (일정·알림 — 알림 발송)
- **관련 로드맵**: Phase 5 — Task 030

## 관련 파일

| 파일 | 유형 | 설명 |
|------|------|------|
| `lib/services/notification-service.ts` | 신규 생성 | 채널 어댑터 + sendNotification + 트리거 함수 |
| `app/api/notifications/trigger/route.ts` | 신규 생성 | `POST /api/notifications/trigger` (cron 호출, Bearer 인증) |
| `app/api/notifications/subscribe/route.ts` | 신규 생성 | `POST/DELETE /api/notifications/subscribe` (push 구독) |
| `app/api/me/notification-settings/route.ts` | 신규 생성 | `GET/PATCH /api/me/notification-settings` |
| `components/settings/settings-client.tsx` | 수정 | 알림 설정 Switch 실제 API 연동 |
| `app/layout.tsx` | 수정 | `<Toaster richColors />` 루트 레이아웃 추가 |
| `docs/schema.md` | 수정 | `push_subscriptions` 테이블 DDL 추가 |

## 수락 기준

- [x] `NotificationChannel` 인터페이스 정의 (채널 교체 용이)
- [x] `EmailChannel` — Resend API 이메일 발송
- [x] `BrowserPushChannel` — VAPID + push_subscriptions 테이블 기반 Web Push
- [x] `KakaoChannel` — console.warn stub (Phase 6 대비)
- [x] `sendNotification(userId, payload)` — notification_settings 확인 후 활성 채널 병렬 발송
- [x] `triggerScheduleReminders()` — notify_days_before 기반 D-day 알림
- [x] `triggerLowStockAlerts()` — stock_quantity <= min_stock_quantity 재고 부족 알림
- [x] `POST /api/notifications/trigger` — Bearer CRON_SECRET 인증, 200/{schedule,stock}
- [x] `POST /api/notifications/trigger` (잘못된 토큰) — 401
- [x] `POST /api/notifications/subscribe` — push 구독 저장, 201
- [x] `DELETE /api/notifications/subscribe` — 구독 삭제, 204
- [x] `GET /api/me/notification-settings` — 200, { email, browser_push, kakao }
- [x] `PATCH /api/me/notification-settings` — 설정 merge 저장, 200
- [x] `/settings` 프로필 탭 알림 설정 Switch → GET 초기 로드 + PATCH 저장 연동
- [x] browser_push 활성화 시 Notification.requestPermission + pushManager.subscribe 흐름
- [x] TypeScript 오류 없음
- [x] Playwright E2E 테스트 5개 시나리오 통과

## 구현 요약

### notification-service.ts 구조

```
NotificationChannel 인터페이스
  ↓ EmailChannel (Resend)
  ↓ BrowserPushChannel (web-push + VAPID)
  ↓ KakaoChannel (stub)

sendNotification(userId, payload)
  users.notification_settings 조회 → 활성 채널만 Promise.allSettled 병렬 발송

triggerScheduleReminders()
  getSchedules({ is_completed: false }) → differenceInDays → notify_days_before 매칭
  → assigned_user or admin/operator 전체에 sendNotification

triggerLowStockAlerts()
  products where stock_quantity <= min_stock_quantity (JS 필터)
  → admin/operator 전체에 묶음 알림
```

### 환경변수 (필수)

```
CRON_SECRET=             # trigger API Bearer 토큰
NEXT_PUBLIC_VAPID_PUBLIC_KEY=   # Web Push VAPID 공개키
VAPID_PRIVATE_KEY=       # Web Push VAPID 비밀키
VAPID_EMAIL=             # mailto: 형식 이메일
```

VAPID 키 생성: `npx web-push generate-vapid-keys`

## 테스트 결과

| 항목 | 결과 |
|------|------|
| GET /api/me/notification-settings → 200, { email, browser_push, kakao } | ✅ |
| PATCH /api/me/notification-settings { email: true } → 200 | ✅ |
| POST /api/notifications/trigger (잘못된 Bearer) → 401 | ✅ |
| POST /api/notifications/trigger (올바른 Bearer) → 200, schedule/stock 키 포함 | ✅ |
| /settings 프로필 탭 → 알림 수신 설정 카드 + Switch 3개 렌더링 | ✅ |
