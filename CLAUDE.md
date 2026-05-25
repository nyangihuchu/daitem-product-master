# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## 명령어

```bash
npm run dev      # 개발 서버 실행 (localhost:3000)
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 서버 실행
npm run lint     # ESLint 검사
```

shadcn 컴포넌트 추가:
```bash
npx shadcn@latest add <component-name>
```

공급처 CSV → 표준화 Excel 변환 (일회성):
```bash
node scripts/convert-product-csv.mjs
```

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | Next.js 16.2.6, React 19, TypeScript strict |
| 스타일링 | Tailwind CSS v4, shadcn/ui (radix-nova), Lucide React |
| 폼·유효성 | React Hook Form 7.x, Zod 4.x |
| 데이터베이스 | Supabase (`@supabase/ssr`, `@supabase/supabase-js`) |
| 테마 | next-themes (시스템/다크/라이트) |
| 엑셀 처리 | xlsx (스크립트 전용, devDependencies) |

## 아키텍처

### 라우트 그룹

```
app/
  (auth)/
    login/page.tsx       # 로그인
    register/page.tsx    # 회원가입
    layout.tsx           # 중앙 정렬 단순 레이아웃
  (dashboard)/
    dashboard/page.tsx   # 대시보드 홈
    layout.tsx           # Header + Sidebar 레이아웃
  api/
    health/route.ts      # GET /api/health 헬스체크
  layout.tsx             # 루트 레이아웃 (ThemeProvider)
```

라우트 그룹은 URL에 영향을 주지 않으며 각 그룹에 `layout.tsx`가 있다.

### 컴포넌트 구조

```
components/
  layout/     # Header, Footer, Sidebar, MobileNav — 레이아웃 전용
  providers/  # ThemeProvider — 앱 전역 Provider
  shared/     # ThemeToggle 등 여러 레이아웃에서 공유하는 컴포넌트
  ui/         # shadcn/ui 자동 생성 컴포넌트 (직접 수정 최소화)
```

### 공통 유틸리티

- `lib/utils.ts` — `cn()` (clsx + tailwind-merge)
- `lib/constants.ts` — `NAV_ITEMS`, `SIDEBAR_ITEMS`, `APP_NAME`, `MARKET_CHANNELS` 등 앱 전역 상수
- `lib/types.ts` — 공용 타입 (도메인 인터페이스 전체 정의)
- `hooks/` — `useDebounce`, `useLocalStorage`, `useMediaQuery`

### 프로젝트 디렉토리

```
docs/
  schema.md      # Supabase PostgreSQL 스키마 설계 문서 (테이블 DDL, 인덱스, RLS)
tasks/
  XXX-name.md    # 작업 명세서 (ROADMAP.md 참조)
scripts/
  convert-product-csv.mjs  # 공급처 CSV(EUC-KR) → 표준화 Excel 변환 (일회성)
```

### 주요 타입 (`lib/types.ts`)

**Product 인터페이스** — CSV 기반 공급처 상품 데이터 반영:
- 식별: `sku`(공급처 상품코드), `supplier_item_no`(품번), `internal_code`(자체 코드)
- 상품정보: `name`, `brand`, `model_name`, `spec`, `unit`, `origin`
- 분류: `category_large`, `category_medium`, `category_small`
- 이미지: `image_url`, `price_list_image_url`
- 가격: `standard_price`, `base_selling_price`, `purchase_price`, `shipping_fee`
- 운영: `lead_time_desc`, `is_returnable`, `status`, `stock_quantity`, `min_stock_quantity`
- 연동: `cafe24_product_id` (카페24 API 연동 대비)

### 경로 별칭

`@/*` → 프로젝트 루트 (예: `@/components/ui/button`)

## 중요 패턴

**params/searchParams는 async로 await해야 한다:**
```typescript
export default async function Page({ params }: PageProps<{ id: string }>) {
  const { id } = await params
}
```

**shadcn 컴포넌트는 `components/ui/`에 위치하며 `@/components/ui`로 임포트:**
```typescript
import { Button } from '@/components/ui/button'
```

**서버 컴포넌트가 기본값이며, 클라이언트 컴포넌트는 `'use client'` 명시 필요.**

**Supabase 클라이언트는 `@supabase/ssr` 패턴 사용 (Phase 3에서 구현 예정):**
- 서버: `createServerClient` (쿠키 기반)
- 클라이언트: `createBrowserClient`

## DB 스키마

`docs/schema.md` 참조. 주요 테이블:
- `users`, `suppliers`, `products` (12만 개 대응 인덱스)
- `market_listings`, `price_history`
- `orders`, `order_items`, `purchases`, `purchase_items`
- `market_fees`, `schedules`

소프트 딜리트(`deleted_at`) 패턴, 매입가 변경 시 자동 이력 기록 트리거 포함.

## MCP 서버 (`.mcp.json`)

- `playwright` — 브라우저 자동화 테스트 (API/비즈니스 로직 구현 시 E2E 필수)
- `context7` — 라이브러리 최신 문서 조회
- `sequential-thinking` — 복잡한 추론 지원
- `shadcn` — shadcn 컴포넌트 검색 및 추가
- `shrimp-task-manager` — 작업 계획·실행 관리
