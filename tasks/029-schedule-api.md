# Task 029: 일정 관리 API 및 기능 연동 (F014)

## 개요

일정 관리 기능의 백엔드 API를 구현하고 프론트엔드 UI와 실제 데이터를 연동한다. Supabase `schedules` 테이블(기존 존재)에 대한 서비스 레이어 및 API 라우트를 구현하며, 더미 데이터를 실제 데이터로 교체한다.

- **대상 기능**: F014 (일정·알림)
- **관련 로드맵**: Phase 5 — Task 029

## 관련 파일

| 파일 | 유형 | 설명 |
|------|------|------|
| `lib/services/schedule-service.ts` | 신규 생성 | `getSchedules`, `createSchedule`, `updateSchedule`, `deleteSchedule` |
| `app/api/schedules/route.ts` | 신규 생성 | `GET /api/schedules`, `POST /api/schedules` |
| `app/api/schedules/[id]/route.ts` | 신규 생성 | `PATCH /api/schedules/[id]`, `DELETE /api/schedules/[id]` |
| `app/(dashboard)/schedules/page.tsx` | 수정 | async 서버 컴포넌트 전환, 더미 데이터 제거 |
| `components/schedules/schedules-client.tsx` | 수정 | `handleSave` API 호출 교체, `handleDelete` 추가, 삭제 버튼 추가 |

## 수락 기준

- [x] `getSchedules({ type?, is_completed?, limit? })` → `Schedule[]`
- [x] `createSchedule({ type, title, scheduled_at, ... })` → `Schedule` (유효성 검증 포함)
- [x] `updateSchedule(id, patch)` → `Schedule`
- [x] `deleteSchedule(id)` → void (에러 시 throw)
- [x] `GET /api/schedules` → `Schedule[]` JSON (200)
- [x] `POST /api/schedules` (유효 body) → 201
- [x] `POST /api/schedules` (누락 필드) → 400
- [x] `PATCH /api/schedules/[id]` → 200
- [x] `DELETE /api/schedules/[id]` → 204
- [x] `schedules/page.tsx` 더미 데이터 완전 제거
- [x] `SchedulesClient.handleSave()` → fetch PATCH/POST 호출
- [x] `SchedulesClient.handleDelete()` 신규 추가
- [x] Dialog Footer에 editTarget일 때 삭제 버튼 노출
- [x] TypeScript 오류 없음
- [x] Playwright E2E 테스트 통과

## 구현 요약

### schedule-service.ts

```
getSchedules({ type?, is_completed?, limit=200 }) → Schedule[]
  .from('schedules').select('*, assigned_user:users(id, email)')
  조건부 type/is_completed 필터 → order scheduled_at asc → limit

createSchedule({ type, title, description?, scheduled_at, notify_days_before, assigned_user_id? }) → Schedule
  VALID_TYPES 유효성 검증, title 빈값 방어 후 insert

updateSchedule(id, patch) → Schedule
  .update(patch).eq('id', id)

deleteSchedule(id) → void
  .delete().eq('id', id), error throw
```

### API 라우트

```
GET  /api/schedules?type=&is_completed=&limit=  → 200: Schedule[]
POST /api/schedules { type, title, scheduled_at, ... } → 201
PATCH /api/schedules/[id] { ...patch } → 200
DELETE /api/schedules/[id] → 204
유효성 오류 → 400, 서버 오류 → 500
```

### 페이지/컴포넌트 변경

```
schedules/page.tsx:
  async 서버 컴포넌트 전환
  getSchedules({ limit: 200 }).catch(() => [])
  SchedulesClient에 schedules props 전달

schedules-client.tsx:
  handleSave(): editTarget → PATCH, else → POST, setSchedules 업데이트
  handleDelete(id): DELETE → filter state → setDialogOpen(false)
  DialogFooter: editTarget일 때 destructive 삭제 버튼 노출
```

## 테스트 결과

| 항목 | 결과 |
|------|------|
| GET /api/schedules → 200, 배열 반환 | ✅ |
| POST /api/schedules (유효 body) → 201 | ✅ |
| PATCH /api/schedules/[id] → 200 | ✅ |
| DELETE /api/schedules/[id] → 204 | ✅ |
| /schedules 페이지 로드 → 캘린더 렌더링 | ✅ |
| '일정 등록' 버튼 클릭 → Dialog 열림 | ✅ |
