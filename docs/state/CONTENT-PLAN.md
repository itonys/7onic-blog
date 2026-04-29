# Content Plan

> 목표: 총 100편 연재
> 실제 개발 결정·수정이력·장애 대응에서 추출한 구체적 포스트 아이디어
> 투고 완료 시 POST-INDEX.md에 기록

---

## 투고 주기

| 단계 | 기간 | 월 투고 수 | 누적 |
|---|---|---|---|
| 초기 (1~20편) | ~10개월 | 2편 | 20편 |
| 성장 (21~60편) | ~10개월 | 4편 | 60편 |
| 안정 (61~100편) | ~10개월 | 4편 | 100편 |

---

## Series 1 — Design to Code (12편)

> 7onic 시스템을 만든 결정들 — 마케팅 버전이 아닌 실제 reasoning

| # | 제목 | 상태 |
|---|------|------|
| 1 | Why I Built 7onic | ✅ 2026-04-16 |
| 2 | The Token Pipeline: One JSON File → 11 Outputs | ✅ 2026-04-17 |
| 3 | Copy-Paste vs npm Install: Why the CLI Copies Files | ✅ 2026-04-24 |
| 4 | Why I Chose Radix UI Over Building Primitives | ⬜ |
| 5 | Using AI to Build a Design System | ⬜ |
| 6 | How I Handle Dark Mode Without a Single Line of JS | ⬜ |
| 7 | CVA: The Pattern That Made Variants Manageable | ⬜ |
| 8 | Lessons from 42 Components | ⬜ |
| 9 | Shipping a Design System Solo: The Honest Timeline | ⬜ |
| 10 | What I'd Do Differently If I Started Over | ⬜ |
| 11 | Single Entry Point Philosophy: Why I Don't Do Subpath Imports | `@7onic-ui/react/card` 같은 서브패스 import 대신 루트 import 단일 유지. Card 페이지의 generateCode가 미존재 서브패스를 출력해서 유저가 복사하면 에러 발생한 사고 → 단일 엔트리 결정. 대신 chart 만 예외로 분리한 이유 (recharts 무거움). 출처: NO-SUBPATH-EXPORTS |
| 12 | Tailwind-Only Components, Tokens for Everyone Else | 컴포넌트는 Tailwind 전용 / 디자인 토큰은 CSS 변수로 누구나 / CSS-only 컴포넌트는 작성 안 함. 배포 표면 좁히기 = 유지보수 복잡도 통제 + 유저 향한 단일 진입경로. 출처: DISTRIBUTION-STRATEGY |

---

## Series 2 — Token Deep Dive (12편)

> 디자인 토큰 파이프라인 — 실제 구현에서 나온 기술 심화

| # | 제목 | 핵심 내용 |
|---|------|----------|
| T-1 | 11 Distribution Files from One Source | CSS, v3, v4, JS, JSON, TS 동시 출력 전략 |
| T-2 | RGB Channels for Tailwind Opacity Modifiers | /50 modifier가 CSS 변수에서 안 되는 이유 + 해결 |
| T-3 | Tailwind v3 + v4 from One Token File | 듀얼 지원 구현 — @theme vs preset config |
| T-4 | Why Style Dictionary Didn't Work for Me | 실패한 3번의 시도 |
| T-5 | Token Naming: When Figma Uses -default and Code Uses Nothing | 변환 레이어 설계 |
| T-6 | Semantic vs Primitive Tokens: Where to Draw the Line | 토큰 계층 설계 결정 |
| T-7 | Spacing Scale: 2px Sub-grid (0–14px) + 4px Main Grid (16px+) | 촘촘함의 근거 |
| T-8 | Animation Tokens: 54 Named Keyframes, No Composition | 조합 vs 명명 전략 |
| T-9 | @theme inline vs @theme: The Dark Mode Breaker | v4 특유의 조용한 버그 |
| T-10 | Breaking Change Detection + Deprecated Aliases | 토큰 마이그레이션 안전망 |
| T-11 | Foreground Alias Generation: Bridging Figma and shadcn Naming | -text → -foreground 자동 변환 |
| T-12 | The --color-foreground Trap: Why Tailwind v4 Internal Aliases Aren't for Raw CSS | 9개 *-foreground alias 는 Tailwind v4 의 text-*-foreground 클래스 생성용 *내부* 부산물 (shadcn 동일 패턴). raw CSS / arbitrary value / 코드 예제에 직접 노출 시 v3·standalone·no-Tailwind 환경에서 IACVT → light 모드 텍스트 불가시. distributed CSS 변수 선택 시 "어떤 import 조합에서도 정의 보장되는가" 가 유일 기준. Figma SSOT 직참조 (--color-text) 가 안전한 선택 |

---

## Series 3 — Component Anatomy (20편)

> 컴포넌트별 설계 결정 심화 — 어떤 선택을 했고 왜

| # | 제목 | 핵심 내용 |
|---|------|----------|
| C-1 | Button at 5 Sizes: 28/32/36/40/48px Design Rationale | 사이즈 스케일 근거, xs=28(WCAG 최소 24px 초과) |
| C-2 | The Compound Component Pattern with Namespace Exports | Object.assign + 하위 호환 named export 동시 유지 |
| C-3 | Focus Rings with color-mix(): Derived Tokens at Runtime | CSS color-mix()로 20% opacity 포커스 링 |
| C-4 | Avatar Color from djb2 Hash: Deterministic but Varied | 초성 해싱 → 12색 팔레트 결정론적 배정 |
| C-5 | Portal Text in Dark Mode: Why Radix Overlays Need text-foreground | body portal 다크모드 상속 문제 |
| C-6 | Outline Flash in Tailwind v4: The outline-transparent Fix | transition-colors가 outline-color 포함하면서 생긴 플래시 |
| C-7 | Switch Default Color: Why bg-foreground Beats Primary | 모든 컴포넌트 기본값을 dark로 통일한 철학 |
| C-8 | Chart Components with SVG Constraints | SVG 속성이 CSS 변수를 못 받는 문제 + 숫자 상수 매핑 |
| C-9 | Field Wrapper: Composing Input + Label + Error | 폼 컴포넌트 compound 패턴 표준화 |
| C-10 | Divider Opacity: When Token Granularity Isn't Fine Enough | /60 opacity modifier로 중간값 만들기 |
| C-11 | Pagination's withControls Pitfall | prop 있는데 버튼 안 나오는 compound API 함정 |
| C-12 | Accordion: Animating Height Without JavaScript | CSS만으로 height 애니메이션 |
| C-13 | Dialog Focus Trap: What Radix Handles That I Can't | focus trap 직접 구현의 한계 |
| C-14 | Toast Without Global State | Context 없이 토스트 큐 관리 |
| C-15 | Combobox: The Most Complex Component I Built | 검색+선택+키보드+접근성 교차점 |
| C-16 | Data Table: Sort, Filter, Pagination as Separate Concerns | 관심사 분리로 조합 가능하게 |
| C-17 | Command Palette: The Component I Almost Didn't Ship | 기능 범위 결정과 scope creep |
| C-18 | Tabs vs Segmented Control: When to Use Which | 같아 보이지만 다른 두 컴포넌트 |
| C-19 | Skeleton Loading: Matching Content Shapes | 실제 레이아웃 모방 전략 |
| C-20 | Chart Styling: CHART_BAR_RADIUS_MAP and SVG Constants | CSS와 SVG의 경계 |

---

## Series 4 — Tailwind Guides (11편)

| # | 제목 | 핵심 내용 |
|---|------|----------|
| TW-1 | Tailwind v4 Migration: What Actually Changed | @theme, @source, CSS-first config |
| TW-2 | CSS Variables + Tailwind: The Right Way | var() + opacity modifier 조합 |
| TW-3 | Tailwind Opacity Modifiers: How They Really Work | /50가 실제로 하는 일 |
| TW-4 | Building a Design System Preset for v3 | rgb(var(--color-*-rgb) / \<alpha\>) 패턴 |
| TW-5 | @theme in Tailwind v4: Everything You Need to Know | CSS-native 토큰 시스템 |
| TW-6 | Dark Mode: Three Approaches Compared | class vs media vs data-attribute |
| TW-7 | Variant Stacking Order in v4: data-[state] Goes First | v3 대비 역전된 selector 순서 |
| TW-8 | When to Use Tailwind vs When to Write CSS | 실제 기준 |
| TW-9 | Tailwind Plugin Development: A Practical Guide | 커스텀 플러그인 작성법 |
| TW-10 | Locale-Aware Font Size: 14px for EN, 13px for CJK | :lang() 셀렉터 + CSS 변수 오버라이드 |
| TW-11 | Framework Coexistence: Living with Next.js and Vite Defaults | Next.js create-next-app 의 unlayered `body { font-family: Arial }` + Vite 의 `:root { font-family: system-ui }` + `body { display: flex; place-items: center; min-width: 320px }` 보일러플레이트가 디자인 시스템을 덮는 문제. 해결책: `html body` 셀렉터(0,0,2 > 0,0,1) 로 cascade 우위 + Vite CLI 자동 cleanup. 두 프레임워크 디폴트와 *공존* 하는 설계 철학. 출처: NEXTJS-FRAMEWORK-COMPAT-STRATEGY |

---

## Series 5 — AI + Design (12편)

| # | 제목 | 핵심 내용 |
|---|------|----------|
| AI-1 | What llms.txt Does (and Doesn't Do) | AI 소비 최적화 문서 전략 |
| AI-2 | Using Claude to Write Component Code | 실제 사용 프롬프트 + 결과 |
| AI-3 | Where AI Falls Apart in UI Development | 접근성, 포커스 트랩, 엣지케이스 |
| AI-4 | Prompts I Actually Use to Build Components | 재사용 가능한 프롬프트 공개 |
| AI-5 | AI-Generated Accessibility: Trust but Verify | AI 코드의 접근성 함정 |
| AI-6 | Building a Design System with AI in 2026 | 현실적인 AI 활용도 평가 |
| AI-7 | When AI Makes Your Code Worse | 대체해서 나빠진 사례들 |
| AI-8 | llms.txt for Multiple Packages: No Cross-Contamination | tokens용 ≠ components용 |
| AI-9 | AI Code Review: What It Catches, What It Misses | 실무 검증 결과 |
| AI-10 | Designing Docs for AI Consumption | AI가 잘 읽는 문서 구조 |
| AI-11 | Approval-Based Doc Propagation: An AI-Human Workflow That Actually Works | "즉시 자동 전파" → "커밋 시점 승인 기반 일괄 전파" 모델로 뒤집은 과정. 실험·반복 단계는 방해 없이 · 커밋 직전 AI가 git diff → A/B/C 카테고리 판별 → 전파 계획 보고 → 승인. 키워드 파싱 없이 AI가 명시 질문하는 방식이 왜 더 robust한지 |
| AI-12 | v0.3.0 Postmortem: When AI False Reports Compound | 하루 동안 거짓 "100%/전수 검증 완료" 보고 3건 → 수정 사이클 10+회 → 재발 방지 배치(훅 3개 + /100-percent-verify 스킬 + CLAUDE.md §4/§5 + 메모리 3건 + Playwright live-audit CI). 인디 솔로 빌더가 AI 협업의 신뢰성 문제를 절차·기술 양면으로 차단한 실제 사례. 출처: RELEASE-V0.3.0-POSTMORTEM |

---

## Series 6 — CLI & Tooling (13편)

| # | 제목 | 핵심 내용 |
|---|------|----------|
| CLI-1 | Building a CLI That Copies Source Files | 36개 컴포넌트 파일 CLI 번들에 내장 |
| CLI-2 | Topological Dependency Resolution for Components | 의존성 그래프 자동 설치 |
| CLI-3 | Typo Suggestions via Dice Coefficient | "botton" → "button" 유사도 매칭 |
| CLI-4 | Package Manager Auto-Detection from Lockfiles | npm/pnpm/yarn/bun 자동 감지 |
| CLI-5 | Vite tsconfig Split: Detecting @/ Alias in Right File | tsconfig.json vs tsconfig.app.json |
| CLI-6 | Tailwind v4 Auto-Injection: @import and @source | 설정 자동화로 사용자 실수 제거 |
| CLI-7 | Version Auto-Injection at Build Time | package.json 읽어서 --version에 주입 |
| CLI-8 | Smoke Testing 3 Environments Before Release | Next.js + Vite v3 + Vite v4 자동 검증 |
| CLI-9 | Error Messages That Actually Help | 좋은 CLI 에러 메시지 설계 |
| CLI-10 | Schema-Driven Config: JSON Schema for IDE Autocomplete | 7onic.json 스키마 제공 |
| CLI-11 | Framework Detection First: Abort Before Config Changes | shadcn 패턴 — Next.js/Vite/TS/Tailwind 감지 실패 시 설정 변경 없이 EXIT. 에러 메시지 + install 페이지 링크. CLI 신뢰성의 핵심 |
| CLI-12 | Removing a Dependency You Thought Was Needed | lucide-react baseDeps 제거 결정 — 라이브러리 자체는 인라인 SVG 사용. 유저에게 "설치하지 않음" 을 명시하는 llms.txt 전략 포함 |
| CLI-13 | Surgical CSS Cleanup with .bak Safety Net | Vite boilerplate CSS 자동 정리 — regex 블록 탐지 + `.bak` 백업 + 알림 only (Y/n 제거로 zero-friction). 같은 패턴으로 Next.js `*` reset `@layer base` wrap |

---

## Series 7 — Build & Release (23편)

| # | 제목 | 핵심 내용 |
|---|------|----------|
| R-1 | Synchronized Versioning Across Two Packages | @7onic-ui/react + @7onic-ui/tokens 버전 동기화 |
| R-2 | Pre-Publish: 8 Automated Checks Before npm publish | 배포 전 자동 검증 게이트 |
| R-3 | Subpath Exports: The recharts Exception | /chart 서브패스만 허용한 이유 |
| R-4 | Verifying recharts Not in Main Bundle | dist에서 의존성 오염 확인 |
| R-5 | Public Repo Sync Incident: 321 Files Deleted | rsync .git 보호 3겹 장치 — 사고 포스트모템 |
| R-6 | TypeScript Emit Verification: dist/ Existence in CI | 조용히 실패하는 타입 빌드 |
| R-7 | From `rm lock` to `npm ci`: Flipping My Own Decision | 첫 배포 전 닭-달걀 문제로 도입한 `rm -f lock && npm install --legacy-peer-deps`를 1개월 후 공급망 공격 대응으로 스스로 뒤집은 과정 — ADR 뒤집기 사례 |
| R-8 | Breaking Change Migration Guides in CHANGELOG | 필수 before/after 코드 블록 정책 |
| R-9 | 0.x Semver: MINOR = Breaking, PATCH = Features | Radix/Tailwind와 동일한 비표준 semver |
| R-10 | Dynamic OG Images with Satori + Sharp in Astro | 빌드타임 OG 이미지 자동 생성 — 10팔레트 해시 + 은하수 배경 |
| R-11 | Google Favicon Jagged Edges: The Pre-Rounded Trap | 둥근 아이콘을 구글이 또 클리핑 → 울퉁불퉁 — 정사각형으로 해결 |
| R-12 | Axios Attack Day: 4-Hour Supply Chain Hardening as an Indie | axios 공급망 공격 2026-03-30 → 18일 후 2026-04-17 뒤늦게 대응: npm ci + provenance + audit CI 강제 + 직접 쓴 ADR 셀프 번복 — 인디 1인 유지보수 관점의 실제 대응 스토리 |
| R-13 | npm Provenance Signing for Indie Libraries | OIDC + Sigstore로 "이 패키지는 이 GitHub 커밋에서 빌드됨" 증명. axios류 계정 탈취 공격 방어 원리 + workflow 설정 튜토리얼 |
| R-14 | `npm ci` vs `npm install + --legacy-peer-deps`: The Hidden Supply Chain Risk | lock 파일 삭제가 왜 공급망 공격 방어력을 무너뜨리는지 — 실제 CVE 시나리오 + CI 전환 가이드 |
| R-15 | Why My 1-Person Open Source Treats Security Like a Funded SaaS | 디자인 시스템이 유저 앱 핵심에 침투하는 특성 + SaaS 확장 염두 + AI 협업 일관성 — 보안 우선순위 철학 |
| R-16 | Bundle Leak Detection: Verifying devDeps Don't Ship to Users | `dist/` grep으로 next/next-intl 참조 0건 검증 — 유저 영향 객관 증명하는 검증 스크립트 패턴 |
| R-17 | Restructuring 71 Docs for AI-First Navigation | 평면 docs/를 rules/state/decisions/roadmap/guides 5 카테고리로 재구성 — AI 탐색 효율 측정 · 71 파일 이동 + 9 README 허브 · git mv 이력 보존 · sed 일괄 링크 치환 자동화 스크립트 3종 · 전수 검증 10/10 PASS |
| R-18 | The Shared Rules Folder: One Source for Every New Project | `docs/rules/shared/`에 BACKEND-RULES·SAAS-SECURITY·PRODUCT-PHILOSOPHY·DOC-PROPAGATION-RULES를 모아 신규 프로젝트 시작 시 복사만으로 공통 품질 기준 주입 — 장기 `create-7onic-saas` CLI와 통합 계획 |
| R-19 | Body Baseline Color: 5 Patches Across 5 Days | v0.3.1 (circular ref @theme inline) → v0.3.2 (Approach Z single-direction chain) → v0.3.4 (alias 우회) → v0.3.5 (Figma 직참조 정석화). 각 단계가 왜 부분 해결이었는지 — IACVT / cascade specificity / standalone import 의존성을 단계별로 발견한 실제 디버깅 로그. 인디 1인 release postmortem 관점. 출처: FOREGROUND-ALIAS + V0.3.1~v0.3.5 |
| R-20 | Reversing a Major Decision: Namespace Exports → Named-Only | v0.2.x 시기 22 개 compound 컴포넌트에 Object.assign namespace 패턴 도입 → v0.3.0 에서 Named export 단일로 뒤집음. Next.js Client Manifest 제약·forwardRef 호환성·외부 사용자 mental model 단순화의 trade-off. ADR 셀프 번복 사례. 출처: NAMESPACE-COMPOUND-EXPORT (Superseded) + NAMED-PRIMARY-MIGRATION |
| R-21 | Permanent 4-Framework Test Showcase: One Script, Always Ready | 매 릴리즈마다 Next.js × Vite × TW v3 × TW v4 4 환경을 수동 재생성하던 루틴을 레포 내 영구 템플릿 + 스크립트 1 개로 대체. 버전 하드코딩 제거 → package.json 자동 주입. 인디 1 인이 정합성 유지하는 실용 인프라 패턴. 출처: USER-TEST-SHOWCASE-INFRA |
| R-22 | The Missing postcss.config.mjs: When Your Test Templates Lie | user-test 인프라가 `create-next-app --tailwind` 직접 호출 → 미리 만든 templates/ 복사로 전환되면서 `postcss.config.mjs` 한 파일이 누락된 회귀. utility class 0건 emit 증상으로 발견. Tailwind 표준 셋업 결과물을 수동으로 복제할 때의 함정 — page ↔ templates ↔ user 환경의 1:1 정합성 원칙. 페이지 자체 완결화(외부 Get Tailwind 링크 제거 + framework × 버전 4조합 풀 가이드)로 page와 templates가 같은 명세를 보유하도록 동기 정리. 출처: INSTALLATION-PAGE-SELF-CONTAINED |
| R-23 | One Month of Wrong Install Docs: Verifying What Verify Doesn't | Installation 페이지의 셋업 코드 안내가 i18n 화 시점부터 한 달 이상 결함(filename `src/app/` 가정 ↔ `@source` 경로 default 가정 불일치 / Vite+v3 `module.exports` 가 Vite 6+ ESM 환경 미호환) 보유한 채 v0.3.0~v0.3.5 모든 릴리즈 외부 노출. 기존 release verify(`verify-publish`/`verify-components`/`verify-llms-examples`/`verify-i18n`)가 패키지·번들 무결성만 검증하고 페이지 셋업 코드 정확성은 검증 범위 밖이었음. user-test 인프라가 templates 복사 방식이라 페이지 명세를 우회 검증. 외부 보고 0건이지만 다운로드 카운트 수백 건 — 사용자 발견 못 한 채 묻혔을 가능성. 재발 방지: Layer 1(페이지 ↔ templates 1:1 자동 비교) + Layer 2(빈 환경 4 종에 페이지 step 자동 적용 + 빌드 + utility class emit 검증)의 2단계 검증 시스템 도입. AI 가 추측 단정으로 잘못된 분석 반복한 사례까지 포함된 인디 1인 운영 postmortem. 출처: INSTALLATION-PAGE-SETUP-VERIFICATION-GAP |

---

## Series 8 — Solo Builder (15편)

| # | 제목 | 핵심 내용 |
|---|------|----------|
| SB-1 | Solo Building a Design System: What Nobody Tells You | ✅ 2026-04-19 |
| SB-2 | Shipping Without a Code Review | 셀프 리뷰 프로세스 |
| SB-3 | How I Decide What to Build Next | 로드맵 우선순위 방법론 |
| SB-4 | Documentation as a Solo Builder | 혼자서 쓰는 docs의 한계와 현실 |
| SB-5 | Open Source Without a Team | MIT 공개 + 혼자 유지보수 |
| SB-6 | Managing Scope When There's No PM | scope creep 혼자 막기 |
| SB-7 | Building in Public: 6 Months In | 중간 결산 |
| SB-8 | The Tools I Use to Ship Faster | 실제 toolstack |
| SB-9 | Deciding When Something Is Done Enough | 완벽주의 vs 배포 |
| SB-10 | Revenue, Users, Expectations: First Year | 솔직한 수치 공개 |
| SB-11 | Why I Write About What I Build | 블로그가 마케팅인 이유 |
| SB-12 | What I Wish I'd Known Before Starting | 회고 |
| SB-13 | My Experience Is the Product | **"내 경험 = 제품" 철학.** 7onic → 블로그 → Blog SaaS 플라이휠 흐름 공개. 각 단계가 이전 단계의 자산을 활용하는 구조. Stripe/Notion/Linear도 같은 패턴으로 시작. 인디 해커가 실패하는 이유는 "남의 문제"부터 풀려고 해서. |
| SB-14 | Why I Built Blog SaaS: It Started as My Own Pain | **블로그 교차게시가 귀찮아서 만든 자동화 스크립트가 SaaS가 된 과정.** 처음에는 7onic 홍보용 블로그였고, 수동 복붙에 지쳐서 스크립트 만들고, "나만 이런가?" 싶어서 SaaS로 확장. 진짜 유저 리서치는 본인이 쓰면서 하는 것. |
| SB-15 | The Indie Hacker's 4-Question Filter for New Ideas | **새 서비스 아이디어 검증 체크리스트:** ① 내가 한 달에 최소 1번 불편한가 ② 지금 수동/비효율적인가 ③ 나 같은 사람이 더 있는가 ④ 기존 자산으로 만들 수 있는가. 4개 다 YES여야 착수. |

---

## Series 9 — Accessibility (7편)

| # | 제목 | 핵심 내용 |
|---|------|----------|
| A11Y-1 | Accessibility in a Design System: Where to Start | 어디서부터 시작할지 |
| A11Y-2 | Focus Management: The One Thing Most UIs Get Wrong | focus trap 실수 패턴 |
| A11Y-3 | ARIA Roles I Actually Use | 실무에서 쓰는 것만 |
| A11Y-4 | Keyboard Navigation Patterns | 컴포넌트별 키보드 행동 |
| A11Y-5 | Screen Reader Testing Without Expertise | 전문가 없이 테스트하는 법 |
| A11Y-6 | Color Contrast: Beyond the 4.5:1 Rule | 규칙 너머의 실제 기준 |
| A11Y-7 | Why Radix UI Handles Accessibility Better Than I Can | 직접 구현을 포기한 이유 |

---

## 총계

| 시리즈 | 편수 |
|---|---|
| Design to Code | 12 |
| Token Deep Dive | 12 |
| Component Anatomy | 20 |
| Tailwind Guides | 11 |
| AI + Design | 12 |
| CLI & Tooling | 13 |
| Build & Release | 23 |
| Solo Builder | 15 |
| Accessibility | 7 |
| **합계** | **125편** |

---

## 우선순위 (첫 20편 순서)

```
#1  ✅ Why I Built 7onic
#2  ✅ Token Pipeline: One JSON → 11 Outputs        (Design to Code #2)
#3  ✅ Solo Building: What Nobody Tells You          (Solo Builder #1, 감성)
#4  ✅ Copy-Paste vs npm Install                     (Design to Code #3)
#5  ✅ Tailwind v4 Migration: What Actually Changed  (SEO 강함)
#6     Why I Chose Radix UI                          (Design to Code #4)
#7     RGB Channels for Opacity Modifiers            (Token Deep Dive #2)
#8     Button at 5 Sizes                             (Component #1)
#9     Public Repo Sync Incident: 321 Files Deleted  (Build & Release #5, 극적)
#10    Using AI to Build a Design System             (Design to Code #5)
...
```

시리즈 + 스탠드얼론 번갈아, 기술 심화 + 감성 글 번갈아 배치.

---

---

## 사이트 페이지 계획 (블로그 포스트 아님)

| 페이지 | URL | 소스 | 상태 |
|--------|-----|------|------|
| Why 7onic | `/why` | `~/Documents/ai-project/docs/guides/why-7onic.md` | ⬜ |

> 헤더 nav에 About 다음으로 추가 예정.

---

*최초 작성: 2026-04-16 / 실제 결정·수정이력에서 추출*
