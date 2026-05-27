# DAITEM 개발 로드맵

공구 유통 사업의 주문·발주·수익 분석을 단일 플랫폼에서 처리하는 내부 운영 백오피스 시스템

## 개요

DAITEM은 공구 유통 사업 운영자를 위한 전용 백오피스 웹서비스로 다음 기능을 제공합니다:

- **상품 통합 관리**: 12만 개 공급처 수급 상품의 등록·검색·필터 및 멀티채널 등록 현황 단일 뷰
- **주문·발주 프로세스**: 주문 접수 → 공급처 발주 → 배송 완료까지 전체 흐름 수동 관리 (향후 API 자동화 확장 대비 설계)
- **수익 분석**: 마켓 판매가 - 공급처 매입가 - 마켓 수수료 기반 실질 마진 계산 및 채널별 판매 통계
- **공급처 관리**: 담당자 정보, 계약 조건, 리드타임, 평가 이력 통합 관리
- **일정·알림**: 팀 내 일정 공유 및 카카오 알림톡·이메일·브라우저 푸시 자동 알림
- **권한 관리**: 관리자·운영자·조회 전용 역할 기반 접근 제어

## 개발 워크플로우

1. **작업 계획**

   - 기존 코드베이스를 학습하고 현재 상태를 파악
   - 새로운 작업을 포함하도록 `ROADMAP.md` 업데이트
   - 우선순위 작업은 마지막 완료된 작업 다음에 삽입

2. **작업 생성**

   - 기존 코드베이스를 학습하고 현재 상태를 파악
   - `/tasks` 디렉토리에 새 작업 파일 생성
   - 명명 형식: `XXX-description.md` (예: `001-setup.md`)
   - 고수준 명세서, 관련 파일, 수락 기준, 구현 단계 포함
   - **API/비즈니스 로직 작업 시 "## 테스트 체크리스트" 섹션 필수 포함 (Playwright MCP 테스트 시나리오 작성)**
   - 예시를 위해 `/tasks` 디렉토리의 마지막 완료된 작업 참조
   - 새 작업의 경우 문서에는 빈 박스와 변경 사항 요약이 없어야 함

3. **작업 구현**

   - 작업 파일의 명세서를 따름
   - 기능과 기능성 구현
   - **API 연동 및 비즈니스 로직 구현 시 Playwright MCP로 테스트 수행 필수**
   - 각 단계 후 작업 파일 내 단계 진행 상황 업데이트
   - 구현 완료 후 Playwright MCP를 사용한 E2E 테스트 실행
   - 테스트 통과 확인 후 다음 단계로 진행
   - 각 단계 완료 후 중단하고 추가 지시를 기다림

4. **로드맵 업데이트**

   - 로드맵에서 완료된 작업을 ✅로 표시

---

## 개발 단계

### Phase 1: 애플리케이션 골격 구축 ✅

- **Task 001: 프로젝트 초기 설정 및 공통 기반 구축** ✅ - 완료
  - ✅ Next.js 15 App Router 기반 프로젝트 초기화
  - ✅ TailwindCSS v4, shadcn/ui, next-themes 설정
  - ✅ 경로 별칭 `@/*`, ESLint, TypeScript strict 설정
  - ✅ 공통 유틸리티: `lib/utils.ts` (cn), `lib/constants.ts`, `lib/types.ts`
  - ✅ 공통 훅: `useDebounce`, `useLocalStorage`, `useMediaQuery`

- **Task 002: 라우트 구조 및 빈 페이지 생성** ✅ - 완료
  - ✅ `(auth)/` 그룹: 로그인, 회원가입 페이지 레이아웃 및 빈 껍데기
  - ✅ `(dashboard)/` 그룹: Header + Sidebar 대시보드 레이아웃
  - ✅ 대시보드 하위 전체 페이지 라우트 생성 (상품·공급처·주문·발주·수익·정산·일정·설정)
  - ✅ `api/health/` 헬스체크 엔드포인트

- **Task 003: 공통 레이아웃 컴포넌트 완성** ✅ - 완료
  - ✅ Header 컴포넌트 (로고, 테마 토글, 사용자 메뉴)
  - ✅ Sidebar 컴포넌트 (네비게이션 메뉴, 활성 상태 표시)
  - ✅ MobileNav 컴포넌트 (모바일 햄버거 메뉴, Sheet 기반 드로어)
  - ✅ ThemeProvider, ThemeToggle 구현
  - ✅ shadcn/ui 기본 컴포넌트 설치 (Button, Card, Badge, Input 등)

- **Task 004: 기본 타입 정의 확장 및 DB 스키마 설계** ✅ - 완료
  - ✅ 도메인 타입 전면 확장: `Supplier`, `Product`, `Order`, `Purchase`, `MarketFee`, `Schedule` 등
  - ✅ PRD 전체 데이터 모델 기반 TypeScript 인터페이스 정의 (`lib/types.ts`)
  - ✅ Supabase PostgreSQL 스키마 설계 문서 작성 (`docs/schema.md`)
  - ✅ 핵심 설계 원칙 반영: `orders.source_type(manual/api)`, `purchases.trigger_type(manual/auto)`, `products.cafe24_product_id` 포함
  - ✅ 소프트 딜리트 패턴 (`deleted_at`) 타입 반영
  - ✅ `SIDEBAR_ITEMS` 상수에 전체 메뉴 항목 추가 (주문·발주·수익·정산·일정·설정)
  - ✅ 공급처 CSV 데이터(116,789행) 분석 기반 `Product` 타입 확장: `brand`, `model_name`, `supplier_item_no`, `spec`, `unit`, `origin`, `image_url`, `price_list_image_url`, `standard_price`, `base_selling_price`, `shipping_fee`, `lead_time_desc`, `is_returnable` 추가
  - ✅ `products` 테이블 DDL 업데이트 및 인덱스 확장 (`brand`, `origin` 인덱스, FTS 인덱스에 브랜드·모델명·규격 포함)

---

### Phase 2: UI/UX 완성 (더미 데이터 활용) ✅

- **Task 005: 대시보드 페이지 UI 완성 (F001, F002, F003)** ✅ - 완료
  - KPI 카드 4종 UI: 오늘 주문 건수, 미처리 발주 건수, 이달 매출, 이달 이익
  - 채널별 매출 비중 도넛/바 차트 UI (Recharts, 하드코딩 더미 데이터)
  - 재고 부족 상품 알림 카드, 처리 필요 반품·교환 건수 카드
  - D-day 임박 일정 목록 카드
  - 좌측/우측 패널 반응형 그리드 레이아웃

- **Task 006: 상품 관리 페이지 UI 완성 (F004, F005, F006, F007)** ✅ - 완료
  - 상품 목록 테이블 UI: 컬럼(내부코드, SKU, 상품명, 분류, 공급처, 구입가, 판매가, 마진율, 재고, 상태, 마켓 등록 현황)
  - 다중 필터 UI: 카테고리, 브랜드, 공급처, 가격대, 마진율 범위, 마켓 등록 여부, 상태
  - 상품 상세/등록/수정 모달 또는 사이드 패널 UI
  - CSV/XLSX 업로드 드래그앤드롭 UI, 다운로드 버튼
  - 구입가 변경 이력 조회 UI (테이블 형태)
  - 마켓별 등록 현황 배지 표시 (7개 채널)
  - 페이지네이션 컴포넌트 (12만 개 대응 구조)

- **Task 007: 공급처 관리 페이지 UI 완성 (F008)** ✅ - 완료
  - 공급처 목록 테이블 UI: 컬럼(공급처명, 담당자, 연락처, 계약조건, 리드타임, 평가점수)
  - 공급처 등록/수정 폼 UI (React Hook Form + Zod 스키마 연결 준비)
  - 공급처 상세 페이지: 담당자 정보, 계약 조건, 평가 이력, 연계 상품 목록
  - 공급처 검색 및 필터 UI

- **Task 008: 주문 관리 페이지 UI 완성 (F009)** ✅ - 완료
  - 주문 목록 테이블 UI: 컬럼(내부주문번호, 마켓주문번호, 채널, 주문일, 고객명, 상품, 금액, 상태)
  - 주문 상태 뱃지: 주문접수 / 발주완료 / 배송중 / 배송완료 / 정산완료 / 취소·반품·교환
  - 수동 주문 입력 폼 UI (`source_type: manual` 태그 표시)
  - 주문 상세 패널 UI (주문 항목, 배송 정보, 운송장 입력 필드)
  - 채널별 필터, 상태별 필터, 기간 필터 UI

- **Task 009: 발주 관리 페이지 UI 완성 (F010)** ✅ - 완료
  - 발주 목록 테이블 UI: 컬럼(발주번호, 공급처, 발주일, 상태, 총액, 트리거 유형)
  - 발주서 수동 생성 폼 UI (`trigger_type: manual` 태그 표시)
  - 동일 공급처 복수 상품 일괄 발주 UI (체크박스 선택 + 묶음 발주)
  - 발주 상태 뱃지: 발주대기 / 발주완료 / 입고중 / 입고완료
  - 발주서 PDF 미리보기 UI, 이메일 발송 버튼 UI

- **Task 010: 수익 분석 페이지 UI 완성 (F011, F012)** ✅ - 완료
  - 마진 계산기 UI: 판매가·매입가·수수료율 입력 → 실질 마진 계산 결과 표시
  - 기간별 매출·매입·이익 집계 차트 (일간/주간/월간/분기/연간 탭, Recharts)
  - 채널별 매출 비중 분석 파이 차트
  - 상품별·카테고리별·브랜드별 판매 순위 테이블
  - 잘 팔리는 상품 / 재고 정리 필요 상품 자동 분류 카드 UI

- **Task 011: 정산 관리 페이지 UI 완성 (F013)** ✅ - 완료
  - 마켓별 정산 현황 테이블 UI: 컬럼(마켓, 정산주기, 정산예정일, 예상금액, 실정산금액, 상태)
  - 미정산 잔액 현황 요약 카드
  - 정산 예정일 타임라인 UI
  - 정산 상세 내역 드로어 UI

- **Task 012: 일정·알림 페이지 UI 완성 (F014, F015)** ✅ - 완료
  - 월별/주별 캘린더 뷰 UI (일정 유형별 색상 구분)
  - 일정 등록/수정 모달: 유형(공급처/마켓/내부업무/고객), 담당자, 날짜, 알림 설정
  - D-day 임박 일정 리스트 사이드패널
  - 알림 설정 UI: 채널(카카오 알림톡/이메일/브라우저 푸시), 사전 알림 시간 설정

- **Task 013: 설정 페이지 UI 완성 (F021, F022)** ✅ - 완료
  - 사용자 역할·권한 관리 UI: 역할별(관리자/운영자/조회전용) 권한 매트릭스 테이블
  - 사용자 목록 및 초대 UI
  - 마켓 수수료율 설정 테이블 UI (7개 채널별 수수료율 입력, 이력 조회)
  - 프로필 설정 UI (알림 수신 설정 포함)

---

### Phase 3: 핵심 인프라 및 CRUD 구현

- **Task 014: Supabase 프로젝트 설정 및 DB 스키마 구축** ✅ - 완료
  - Supabase 프로젝트 생성 및 환경변수 설정 (`.env.local`)
  - 전체 테이블 마이그레이션 SQL 작성 및 실행
    - `users`, `suppliers`, `products`, `market_listings`, `price_history`
    - `orders`, `order_items`, `purchases`, `purchase_items`
    - `market_fees`, `schedules`
  - DB 인덱스 최적화 (상품 목록 12만 개 대응: `products` 테이블 복합 인덱스)
  - Supabase Full-text Search 한국어 형태소 분석기 설정
  - Row Level Security(RLS) 정책 초안 설정
  - Supabase TypeScript 타입 자동 생성 설정 (`supabase gen types`)

- **Task 015: Supabase 인증 연동 및 권한 시스템 완성 (F020, F021)** ✅ - 완료
  - `@supabase/ssr` 패턴으로 서버/클라이언트 Supabase 클라이언트 설정
  - Next.js 미들웨어 기반 세션 갱신 및 라우트 보호 구현
  - 로그인 페이지 실제 Supabase Auth 연동 (이메일/비밀번호)
  - 회원가입 페이지 실제 연동 및 이메일 인증 플로우
  - 역할 기반 접근 제어(RBAC) 구현: `users` 테이블 `role` 컬럼 기반
  - 관리자/운영자/조회전용 라우트 미들웨어 권한 검사
  - **테스트 체크리스트**: Playwright MCP로 로그인·로그아웃·권한별 페이지 접근 E2E 테스트

- **Task 016: 공급처 CRUD API 및 기능 연동 (F008)** ✅ - 완료
  - `app/api/suppliers/` RESTful API 라우트 구현 (GET·POST·PATCH·DELETE)
  - 서비스 레이어 분리: `lib/services/supplier-service.ts`
  - 소프트 딜리트 구현 (`deleted_at` 컬럼 활용)
  - React Hook Form + Zod 유효성 검사 스키마 연결
  - 공급처 목록 서버 컴포넌트 실제 데이터 연동 (더미 데이터 교체)
  - 공급처 검색·필터 서버사이드 쿼리 구현
  - **테스트 체크리스트**: Playwright MCP로 공급처 등록·수정·삭제·검색 플로우 E2E 테스트

- **Task 017: 상품 CRUD API 및 기능 연동 (F004, F005)** ✅ - 완료
  - `app/api/products/` RESTful API 라우트 구현 (GET·POST·PATCH·DELETE)
  - 서비스 레이어 분리: `lib/services/product-service.ts`
  - 12만 개 대응 커서 기반 페이지네이션 구현 (offset 방식 + DB 인덱스)
  - Supabase Full-text Search 상품 키워드 검색 구현
  - 다중 필터 쿼리 빌더 (카테고리, 브랜드, 공급처, 가격대, 마진율, 마켓 등록 여부, 상태)
  - `market_listings` 연계 조회 (JOIN 최적화)
  - `price_history` 연계: 구입가 변경 시 이력 자동 기록
  - 소프트 딜리트 구현
  - **테스트 체크리스트**: Playwright MCP로 상품 등록·수정·삭제·검색·필터·페이지네이션 E2E 테스트

- ✅ **Task 018: 상품 일괄 업로드·다운로드 구현 (F006)**
  - `app/api/products/upload/` 스트리밍 업로드 API 구현
  - `xlsx` 라이브러리 기반 CSV/XLSX 파싱 및 청크(chunk) 분할 처리
  - Supabase bulk insert (`upsert`) 연동
  - 업로드 진행률 표시 (클라이언트 UI 연동)
  - 업로드 결과 리포트: 성공 건수, 실패 건수, 오류 상세 내역
  - 상품 목록 XLSX 다운로드 API (`app/api/products/export/`)
  - **테스트 체크리스트**: Playwright MCP로 소규모 샘플 파일 업로드·다운로드 플로우 E2E 테스트

- ✅ **Task 019: 마켓 수수료율 설정 API 연동 (F022)**
  - `app/api/market-fees/` API 라우트 구현
  - `market_fees` 테이블 CRUD 및 이력 관리
  - 설정 페이지 실제 데이터 연동 (더미 데이터 교체)
  - **테스트 체크리스트**: Playwright MCP로 수수료율 등록·수정·이력 조회 E2E 테스트

- ✅ **Task 020: Phase 3 통합 테스트**
  - Playwright MCP를 사용한 전체 인증 플로우 E2E 테스트
  - 공급처·상품 CRUD 전체 플로우 E2E 테스트
  - 역할별 권한 접근 제어 시나리오 테스트
  - 12만 개 규모 페이지네이션 및 검색 성능 검증
  - 에러 핸들링 및 유효성 검사 엣지 케이스 테스트

---

### Phase 4: 주문·발주·마진 핵심 프로세스 구현

- ✅ **Task 021: 주문 관리 API 및 기능 연동 (F009)**
  - `app/api/orders/` RESTful API 라우트 구현 (GET·POST·PATCH·DELETE)
  - 서비스 레이어 분리: `lib/services/order-service.ts`
  - `source_type: 'manual' | 'api'` 필드 포함 (자동화 확장 대비)
  - 마켓주문번호 + 내부주문번호 이중 관리 로직
  - 주문 상태 전이 유효성 검사 (주문접수 → 발주완료 → 배송중 → 배송완료 → 정산완료)
  - 취소·반품·교환 처리 로직
  - 주문 목록 서버 컴포넌트 실제 데이터 연동
  - **테스트 체크리스트**: Playwright MCP로 수동 주문 입력·상태 변경·취소 처리 E2E 테스트

- ✅ **Task 022: 발주 관리 API 및 기능 연동 (F010)**
  - `app/api/purchases/` RESTful API 라우트 구현 (GET·POST·PATCH·DELETE)
  - 서비스 레이어 분리: `lib/services/purchase-service.ts` (발주 생성 로직 분리)
  - `trigger_type: 'manual' | 'auto'` 필드 포함 (자동화 확장 대비)
  - 동일 공급처 복수 상품 일괄 발주 묶음 처리 로직
  - 발주 상태 관리: 발주대기 → 발주완료 → 입고중 → 입고완료
  - 소프트 딜리트 구현
  - 발주 목록 서버 컴포넌트 실제 데이터 연동
  - **테스트 체크리스트**: Playwright MCP로 발주 생성·묶음 발주·상태 변경 E2E 테스트

- ✅ **Task 023: 발주서 PDF 생성 및 이메일 발송 구현**
  - 발주서 PDF 생성 API (`app/api/purchases/[id]/pdf/`)
  - 공급처별 발주서 템플릿 관리 구조 설계
  - 이메일 발송 서비스 레이어: `lib/services/email-service.ts` (채널 교체 용이 구조)
  - Resend 또는 Nodemailer 기반 이메일 발송 구현
  - 발주서 이메일 첨부 발송 기능
  - **테스트 체크리스트**: Playwright MCP로 PDF 미리보기 및 이메일 발송 플로우 E2E 테스트

- ✅ **Task 024: 실질 마진 계산 로직 구현 (F011)**
  - 마진 계산 서비스 레이어: `lib/services/margin-service.ts`
  - 계산 공식 구현: `실질 마진 = 판매가 - 매입가 - 마켓수수료 - 배송비 - (반품비용) - (광고비)`
  - `market_fees` 테이블 연동 (채널별 수수료율 실시간 반영)
  - 상품별 채널별 마진율 실시간 계산 API
  - 수익 분석 페이지 마진 계산기 실제 데이터 연동
  - **테스트 체크리스트**: Playwright MCP로 마진 계산기 입력값 변경 시 결과 검증 E2E 테스트

- ✅ **Task 025: 대시보드 KPI 실제 데이터 연동 (F001, F002, F003)**
  - 대시보드 API: `app/api/dashboard/` (KPI 집계 쿼리)
  - 오늘 주문 건수, 미처리 발주 건수 실시간 카운트
  - 이달 매출·이익 집계 쿼리 구현
  - 채널별 매출 비중 Recharts 차트 실제 데이터 연동
  - 재고 부족 상품 알림 (min_stock_quantity 기반 자동 필터)
  - D-day 임박 일정 자동 조회 (schedules 테이블 연동)
  - **테스트 체크리스트**: Playwright MCP로 대시보드 KPI 카드 및 차트 렌더링 E2E 테스트

- ✅ **Task 026: Phase 4 통합 테스트**
  - Playwright MCP를 사용한 주문 → 발주 전체 프로세스 E2E 테스트
  - 마진 계산 정확성 검증 시나리오
  - 발주서 PDF 생성 및 이메일 발송 플로우 테스트
  - 대시보드 데이터 실시간 반영 검증
  - 에러 핸들링: 재고 부족, 발주 중복, 상태 전이 오류 등 엣지 케이스

---

### Phase 5: 분석·일정·설정 기능 구현

- ✅ **Task 027: 판매 통계 API 및 기능 연동 (F012)**
  - `app/api/analytics/` API 라우트 구현
  - 기간별 집계 쿼리: 일간/주간/월간/분기/연간 (집계 함수 + 인덱스 최적화)
  - 채널별 매출 비중 분석 쿼리
  - 상품별·카테고리별·브랜드별 판매 순위 쿼리
  - 잘 팔리는 상품 / 재고 정리 필요 상품 자동 분류 로직
  - 수익 분석 페이지 Recharts 차트 실제 데이터 연동
  - **테스트 체크리스트**: Playwright MCP로 기간 변경 시 차트·테이블 데이터 갱신 E2E 테스트

- ✅ **Task 028: 정산 관리 API 및 기능 연동 (F013)**
  - `app/api/settlements/` API 라우트 구현
  - 마켓별 정산 주기 설정 및 정산 예정일 자동 계산
  - 정산 예상 금액 집계 쿼리 (주문 기반 자동 산출)
  - 미정산 잔액 현황 집계
  - 정산 관리 페이지 실제 데이터 연동
  - **테스트 체크리스트**: Playwright MCP로 정산 현황 조회 및 상태 변경 E2E 테스트

- ✅ **Task 029: 일정 관리 API 및 기능 연동 (F014)**
  - `app/api/schedules/` API 라우트 구현 (GET·POST·PATCH·DELETE)
  - 일정 유형별 분류 (공급처·마켓·내부업무·고객 관련)
  - 캘린더 뷰 실제 데이터 연동 (월별/주별 쿼리)
  - D-day 계산 로직 및 임박 일정 자동 필터
  - 담당자 배정 및 권한 기반 일정 접근 제어
  - 일정 페이지 실제 데이터 연동
  - **테스트 체크리스트**: Playwright MCP로 일정 등록·수정·삭제·캘린더 조회 E2E 테스트

- ✅ **Task 030: 알림 발송 시스템 구현 (F015)**
  - 알림 서비스 레이어: `lib/services/notification-service.ts` (채널 교체 용이 구조)
  - 이메일 알림: 일정 D-day 전 자동 발송, 재고 부족 알림
  - 브라우저 푸시 알림: Web Push API 구현
  - 카카오 알림톡 연동 준비 (인터페이스 정의, 실제 연동은 Phase 6)
  - Next.js Cron Job 또는 Supabase Edge Functions 기반 스케줄 알림
  - 사용자별 알림 수신 설정 반영
  - **테스트 체크리스트**: Playwright MCP로 알림 발송 트리거 및 수신 확인 E2E 테스트

- **Task 031: 구입가 변경 이력 관리 연동 (F007)**
  - 상품 구입가 변경 시 `price_history` 자동 기록 트리거 구현 (Supabase DB 함수)
  - 상품 상세 페이지 구입가 이력 조회 API 연동
  - 이력 테이블 실제 데이터 연동

- **Task 032: Phase 5 통합 테스트**
  - Playwright MCP를 사용한 수익 분석 전체 플로우 E2E 테스트
  - 정산 현황 및 일정 관리 플로우 테스트
  - 알림 발송 트리거 및 수신 시나리오 검증
  - 기간별 통계 데이터 정확성 검증
  - 권한별 데이터 접근 제어 시나리오 테스트

---

### Phase 6: 자동화 확장 및 최적화

- **Task 033: 카페24 API 연동 기반 구축**
  - 카페24 REST API 인증 (OAuth 2.0) 구현
  - `products.cafe24_product_id` 기반 상품 양방향 동기화 로직
  - 카페24 주문 자동 수집 구현 (`source_type: 'api'` 처리 경로)
  - 동기화 오류 처리 및 충돌 해결 전략
  - **테스트 체크리스트**: Playwright MCP로 카페24 상품 동기화 플로우 E2E 테스트

- **Task 034: 멀티마켓 주문 자동 수집**
  - 네이버스토어, 쿠팡, 지마켓, 옥션, 롯데온, 11번가 API 연동
  - 채널별 주문 자동 수집 스케줄러 (Supabase Edge Functions)
  - 주문 중복 방지 로직 (마켓주문번호 유니크 제약)
  - 수집 실패 재시도 큐 구현
  - **테스트 체크리스트**: Playwright MCP로 멀티채널 주문 수집 및 통합 표시 E2E 테스트

- **Task 035: 발주 자동화 구현**
  - 주문 접수 → 발주 자동 생성 로직 (`trigger_type: 'auto'` 처리 경로)
  - 자동 발주 조건 설정 UI (재고 임계값, 공급처별 리드타임 기반)
  - 발주 자동 생성 승인 워크플로우 (운영자 최종 승인)
  - 카카오 알림톡 실제 연동 (자동 발주 알림)
  - **테스트 체크리스트**: Playwright MCP로 자동 발주 트리거 조건 및 승인 플로우 E2E 테스트

- **Task 036: 성능 최적화 및 캐싱 전략**
  - Next.js `unstable_cache` 기반 서버사이드 데이터 캐싱 (대시보드 KPI 등)
  - 상품 목록 쿼리 실행 계획 분석 및 인덱스 재조정
  - 대용량 엑셀 업로드 청크 처리 성능 벤치마크
  - React `Suspense` + `loading.tsx` 기반 스트리밍 UI 최적화
  - Supabase Connection Pooling 설정 (PgBouncer)

- **Task 037: 모니터링, 로깅 및 배포 파이프라인 구축**
  - Vercel 프로젝트 배포 설정 (환경변수, 도메인)
  - GitHub Actions CI/CD 파이프라인: lint → type-check → Playwright E2E 테스트 → 배포
  - Sentry 오류 모니터링 연동
  - Vercel Analytics + Speed Insights 설정
  - Supabase 데이터베이스 백업 스케줄 설정
  - **테스트 체크리스트**: Playwright MCP로 배포 환경 전체 스모크 테스트

---

## 기술 스택 요약

| 영역 | 기술 |
|------|------|
| 프레임워크 | Next.js 15 App Router, React 19, TypeScript 5.6+ |
| 스타일링 | TailwindCSS v4, shadcn/ui (radix-nova), Lucide React |
| 폼·유효성 | React Hook Form 7.x, Zod |
| 차트 | Recharts 2.x |
| 엑셀 처리 | xlsx 라이브러리 |
| 데이터베이스 | Supabase (PostgreSQL + Auth + Full-text Search) |
| 배포 | Vercel |
| 테스트 | Playwright MCP (E2E) |

## 핵심 설계 원칙

- `orders.source_type (manual/api)`, `purchases.trigger_type (manual/auto)` 필드를 MVP 초기부터 포함하여 향후 자동화 확장에 대비
- `products.cafe24_product_id` 컬럼을 Phase 1부터 포함하여 카페24 API 연동 사전 준비
- 매입가·정산 데이터는 소프트 딜리트만 허용 (회계 기록 보존)
- 발주 생성 로직은 서비스 레이어로 분리 (`lib/services/purchase-service.ts`)
- 알림 발송은 서비스 레이어로 분리하여 채널(카카오/이메일/SMS) 교체 용이하게 구성
- 상품 목록 페이지네이션 + DB 인덱스 최적화 (12만 개 대응)
- 마켓 채널 추가 시 `market_listings` 테이블만 확장하면 되도록 설계
