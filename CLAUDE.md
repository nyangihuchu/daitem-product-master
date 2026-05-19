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

## 기술 스택

- **Next.js 16.2.6** (React 19, TypeScript strict)
- **Tailwind CSS v4** — CSS 변수 기반 테마, `app/globals.css`에서 직접 설정
- **shadcn/ui** — `radix-nova` 스타일, `components.json` 참고
- **next-themes** — 시스템/다크/라이트 테마 전환

## 아키텍처

### 라우트 그룹

```
app/
  (marketing)/     # 랜딩 페이지 — Header/Footer 포함, 별도 레이아웃 없음
  (auth)/          # 로그인·회원가입 — 중앙 정렬 단순 레이아웃
  (dashboard)/     # 대시보드 — Header + Sidebar 사이드바 레이아웃
  api/health/      # 헬스체크 엔드포인트 GET /api/health
```

라우트 그룹은 URL에 영향을 주지 않으며 각 그룹에 `layout.tsx`가 있다.

### 컴포넌트 구조

```
components/
  layout/    # Header, Footer, Sidebar, MobileNav — 레이아웃 전용
  providers/ # ThemeProvider — 앱 전역 Provider
  shared/    # 여러 레이아웃에서 공유하는 컴포넌트 (ThemeToggle 등)
  ui/        # shadcn/ui 자동 생성 컴포넌트 (직접 수정 최소화)
```

### 공통 유틸리티

- `lib/utils.ts` — `cn()` (clsx + tailwind-merge)
- `lib/constants.ts` — `NAV_ITEMS`, `SIDEBAR_ITEMS`, `APP_NAME` 등 앱 전역 상수
- `lib/types.ts` — 공용 타입. **`PageProps<P, S>`는 `params`·`searchParams`가 `Promise`** (Next.js 15+ 변경사항)
- `hooks/` — `useDebounce`, `useLocalStorage`, `useMediaQuery`

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

## MCP 서버 (`.mcp.json`)

- `playwright` — 브라우저 자동화 테스트
- `context7` — 라이브러리 최신 문서 조회
- `sequential-thinking` — 복잡한 추론 지원
- `shadcn` — shadcn 컴포넌트 검색 및 추가
