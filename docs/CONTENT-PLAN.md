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

## Series 1 — Design to Code (10편)

> 7onic 시스템을 만든 결정들 — 마케팅 버전이 아닌 실제 reasoning

| # | 제목 | 상태 |
|---|------|------|
| 1 | Why I Built 7onic | ✅ 2026-04-16 |
| 2 | The Token Pipeline: One JSON File → 11 Outputs | 📝 Next |
| 3 | Copy-Paste vs npm Install: Why the CLI Copies Files | ⬜ |
| 4 | Using AI to Build a Design System | ⬜ |
| 5 | Lessons from 42 Components | ⬜ |
| 6 | How I Handle Dark Mode Without a Single Line of JS | ⬜ |
| 7 | Why I Chose Radix UI Over Building Primitives | ⬜ |
| 8 | CVA: The Pattern That Made Variants Manageable | ⬜ |
| 9 | Shipping a Design System Solo: The Honest Timeline | ⬜ |
| 10 | What I'd Do Differently If I Started Over | ⬜ |

---

## Series 2 — Token Deep Dive (11편)

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

## Series 4 — Tailwind Guides (10편)

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

---

## Series 5 — AI + Design (10편)

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

---

## Series 6 — CLI & Tooling (10편)

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

---

## Series 7 — Build & Release (9편)

| # | 제목 | 핵심 내용 |
|---|------|----------|
| R-1 | Synchronized Versioning Across Two Packages | @7onic-ui/react + @7onic-ui/tokens 버전 동기화 |
| R-2 | Pre-Publish: 8 Automated Checks Before npm publish | 배포 전 자동 검증 게이트 |
| R-3 | Subpath Exports: The recharts Exception | /chart 서브패스만 허용한 이유 |
| R-4 | Verifying recharts Not in Main Bundle | dist에서 의존성 오염 확인 |
| R-5 | Public Repo Sync Incident: 321 Files Deleted | rsync .git 보호 3겹 장치 — 사고 포스트모템 |
| R-6 | TypeScript Emit Verification: dist/ Existence in CI | 조용히 실패하는 타입 빌드 |
| R-7 | Peer Dependency CI Fix: rm lock + legacy-peer-deps | 첫 배포 전 CI 검증 닭-달걀 문제 |
| R-8 | Breaking Change Migration Guides in CHANGELOG | 필수 before/after 코드 블록 정책 |
| R-9 | 0.x Semver: MINOR = Breaking, PATCH = Features | Radix/Tailwind와 동일한 비표준 semver |

---

## Series 8 — Solo Builder (12편)

| # | 제목 | 핵심 내용 |
|---|------|----------|
| SB-1 | Solo Building a Design System: What Nobody Tells You | 팀 없이 만드는 현실 |
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
| Design to Code | 10 |
| Token Deep Dive | 11 |
| Component Anatomy | 20 |
| Tailwind Guides | 10 |
| AI + Design | 10 |
| CLI & Tooling | 10 |
| Build & Release | 9 |
| Solo Builder | 12 |
| Accessibility | 7 |
| 트렌드 스탠드얼론 | 11 |
| **합계** | **110편** |

---

## 우선순위 (첫 20편 순서)

```
#1  ✅ Why I Built 7onic
#2     Token Pipeline: One JSON → 11 Outputs        (Design to Code #2)
#3     Solo Building: What Nobody Tells You          (Solo Builder #1, 감성)
#4     Copy-Paste vs npm Install                     (Design to Code #3)
#5     Tailwind v4 Migration: What Actually Changed  (SEO 강함)
#6     Using AI to Build a Design System             (Design to Code #4)
#7     RGB Channels for Opacity Modifiers            (Token Deep Dive #2)
#8     Button at 5 Sizes                             (Component #1)
#9     Public Repo Sync Incident: 321 Files Deleted  (Build & Release #5, 극적)
#10    Why I Chose Radix UI                          (Design to Code #7)
...
```

시리즈 + 스탠드얼론 번갈아, 기술 심화 + 감성 글 번갈아 배치.

---

*최초 작성: 2026-04-16 / 실제 결정·수정이력에서 추출*
