# 7onic Blog — AI 개발 가이드라인

## 응답 언어

대화: **한국어** / 소스코드 주석: **영어**

---

## 세션 시작 시 읽을 파일

> **블로그 작업 세션 시작 시 `docs/README.md` Read**. 작업 유형별 필수 읽기 테이블·디렉토리 지도·파일 추가 기준이 그곳에 있다.
>
> **ai-project 연동 작업 시 추가**: `~/Documents/ai-project/docs/` — 결정 기록(decisions/) · 완료 기능(state/) · 토큰 예외 등 포스트 소재 소스.

---

## ⛔ 절대 금지

| # | 규칙 |
|---|---|
| 1 | **링크처럼 보이는 스타일 금지** — `text-decoration: underline`은 `<a>` 태그에만. 비링크 텍스트에 underline + color 조합 사용 금지 |
| 2 | **추측 금지** — "확인했다"·"문제 없다" 보고 전에 반드시 Read/Grep으로 직접 확인 |
| 3 | **코드 수정은 명시적 허락 후에만** — 유저 질문 ≠ 실행 지시 |
| 4 | **`<!doctype html>` 누락 금지** — `<html>` 태그를 포함하는 `.astro` 파일은 page/layout 구분 없이 반드시 첫 줄에 `<!doctype html>`. 없으면 quirks mode → 모바일 viewport meta 무시 → 무한 가로 스크롤 발생. **`BlogPost.astro`에서 이미 한 번 발생한 버그** |

---

## 페이지 레이아웃 규칙

모든 페이지는 아래 구조를 따른다. **새 page/layout 파일 작성 시 `<!doctype html>` 포함 여부를 가장 먼저 확인한다.**

```astro
<div class="page-wrapper">   <!-- width: 100% 필수, flex row -->
  <main class="main-content"> ... </main>
  <Sidebar />                 <!-- order: -1 로 좌측 배치 -->
</div>
```

- **`width: 100%`** — `.page-wrapper`에 필수. 없으면 flex context에서 컨텐츠 크기로 축소됨
- **`<Sidebar />` 누락 금지** — 새 페이지 추가 시 반드시 포함
- **콘텐츠 영역 상단 패딩** — 반드시 `page-top` 클래스 사용. 개별 `padding-top` 직접 작성 금지
  - `global.css`에 정의: desktop 3rem / mobile 2rem 자동 적용
  - 적용 위치: 각 페이지의 최상단 콘텐츠 요소 (`.hero`, `.page-header`, `.main-content` 등)
  - 예: `<section class="hero page-top">`, `<div class="page-header page-top">`

### 새 페이지 추가 시 템플릿 사용

`docs/templates/` 안에 두 가지 템플릿이 있다. 새 정적 페이지는 반드시 둘 중 하나를 복사해서 시작:

| 패턴 | 템플릿 | 예시 페이지 | page-top 위치 |
|------|--------|------------|--------------|
| **Pattern A** — 단순 콘텐츠 | `docs/templates/PAGE-TEMPLATE.astro` | about, 단순 정적 페이지 | `<main class="main-content page-top">` |
| **Pattern B** — 목록 + 헤더 | `docs/templates/PAGE-TEMPLATE-LIST.astro` | 커스텀 리스트 페이지 | `<div class="page-header page-top">` (main 안) |

> `/series/[id].astro` · `/category/[id].astro`는 동적 라우트 — 템플릿 불필요. `src/consts.ts`에 항목 추가하면 자동 생성.

---

## 타이포그래피 규칙

### Hero 타이틀 기준

홈페이지 `.hero-title` 기준으로 모든 페이지 통일:

```css
font-size: clamp(1.875rem, 4vw, 2.5rem);
font-weight: 700;
letter-spacing: -0.02em;
line-height: 1.2;
margin-top: 0;    /* 필수 — prose h1에 margin-top: 2em이 있어서 오버라이드 안 하면 과도한 여백 발생 */
```

### prose h1 margin-top 주의

`global.css`의 `.prose h1`에 `margin-top: 2em`이 설정되어 있다.
Hero h1처럼 페이지 최상단에 오는 제목은 반드시 `margin-top: 0 !important`로 오버라이드.

### 서브타이틀 패턴

별도 styled 서브타이틀 요소보다 **첫 문단에 자연스럽게 통합**하는 게 세련됨.

```
❌ <h1>Hey, I'm 7onic.</h1>
   <p class="subtitle">Designer who ships code</p>  ← 따로 놀아 보임

✅ <h1>Hey, I'm 7onic.</h1>
   <p>Designer who ships code. I design components in Figma...</p>
```

Uppercase + letter-spacing + 회색 조합의 서브타이틀은 본문과 연결감이 없어 보임.

---

## 링크 스타일 규칙

- **인라인 링크** (`.prose a`): `color: var(--color-brand)` + underline — 유지
- **리스트 내 링크** (`.prose ul a`): underline 없이, hover에만 표시가 더 깔끔

```css
.prose ul a { text-decoration: none; }
.prose ul a:hover { text-decoration: underline; }
```

---

## 콘텐츠 중복 금지

같은 링크/CTA를 한 페이지에서 두 번 반복 금지.

예: Connect 리스트에 `X (@7onicHQ)` 있으면 → 아래 문단에서 다시 언급 금지.

---

## 문서 전파 규칙

변경이 발생하면 **유저 지시 없이 AI가 즉시** 관련 문서를 전부 자동 갱신한다. "이것도 업데이트할까요?" 질문 금지 — 실행 후 완료 보고 시 갱신된 파일 목록 제시.

> **공통 원칙·자동 실행 플로우·Red Flags**: `~/Documents/ai-project/docs/rules/shared/DOC-PROPAGATION-RULES.md` (모든 프로젝트 공통 SSOT).
> 아래 매트릭스는 블로그 프로젝트 고유 도메인만.

### 전파 매트릭스

| 변경 종류 | 갱신 대상 |
|---|---|
| 새 포스트 게시 | `docs/state/POST-INDEX.md` (제목·slug·dev.to/Hashnode ID·날짜) + `docs/state/CONTENT-PLAN.md` (해당 항목 ✅ 완료) |
| 콘텐츠 규칙 변경 | `docs/rules/CONTENT-RULES.md` (SSOT — ai-project에서 절대경로로 참조) |
| 새 시리즈 추가 | `docs/state/CONTENT-PLAN.md` 시리즈 섹션 + `src/consts.ts` SERIES 배열 |
| ai-project 새 기능·결정·버그 | `docs/state/CONTENT-PLAN.md` 해당 시리즈에 포스트 아이디어 추가 |
| 스킬(`.claude/commands/`) 변경 | `~/Documents/ai-project/.claude/commands/` 양쪽 동기화 (경로만 다름) |
| OG 이미지 디자인 변경 | `src/pages/og/[...id].png.ts` + Vercel 빌드 확인 |
| 페이지 레이아웃 규칙 변경 | `CLAUDE.md` 본 파일 + `docs/templates/PAGE-TEMPLATE.astro` + `docs/templates/PAGE-TEMPLATE-LIST.astro` |
| docs/ 새 md 파일 추가 | 해당 폴더 `README.md` "문서 목록" 갱신 |
| docs/ 새 카테고리(폴더) 추가 | `docs/README.md` 디렉토리 지도 + 신규 폴더 `README.md` 작성 |
| 로드맵 상태 전환 | `docs/roadmap/README.md` 카운트 + 해당 파일 git mv (active/planned/done) |
| 새 ADR 추가 | `docs/decisions/README.md` 해당 항목 요약 1줄 추가 |

### 자동 실행 플로우

1. 변경 내용이 위 매트릭스 어느 행에 해당하는지 판단
2. 갱신 대상 파일 전체를 같은 작업 사이클에 처리
3. 완료 보고 형식:
   ```
   ✅ 변경: [요약]
   📋 전파된 파일 (N개): [목록]
   ```

### Red Flags — 전수 grep 필수

- 새 포스트 slug → 양쪽 docs 참조 전수
- 카운트 변경 (포스트 수, 시리즈 수 등) → `grep -rn` 전수
- 경로 변경 → 스킬 + 블로그 + ai-project 양쪽 전수

---

## 커밋/푸시 규칙

- 반드시 유저 허락 후에만 커밋·푸시
- 브랜치 전략: `src/` 변경 → PR / `src/pages/`, `src/styles/`, `src/components/` 등 콘텐츠·UI 변경 → main 직접 push

---

## 블로그 포스트 콘텐츠 규칙

> 상세 규칙: `docs/rules/CONTENT-RULES.md`

### 핵심 요약

- 포스트 저장 위치: `src/content/blog/[slug].md`
- 파일명: 소문자 kebab-case (`why-i-built-7onic.md`)
- `#` H1 사용 금지 — frontmatter `title`에서 자동 렌더링
- H4 이하 사용 금지
- `draft: true`로 시작 → 검토 후 `false`
- 이미지 저장: `public/images/posts/[slug]/`, WebP 권장, 200KB 이하

### 코드 블록 기능

| 기능 | 작성법 |
|------|--------|
| 파일명 | ` ```tsx title="Button.tsx" ` |
| Diff | `// [!code ++]` / `// [!code --]` |
| 줄 하이라이트 | ` ```tsx {2,4-6} ` |
| 포커스 | `// [!code focus]` |
| 복사 버튼 | 자동 표시 |

### 포스트 작성 워크플로우

1. ai-project에서 `/blog-new-post` 스킬 실행
2. AI 초안 검토·수정
3. `draft: false`로 변경
4. `/blog-publish` 스킬로 배포 — **Step 0에서 `date -u` 실행 후 현재 시각을 `pubDate`에 기록**

### pubDate 규칙 (절대 금지)

- `pubDate`는 **배포 직전 실제 시각** (`YYYY-MM-DDTHH:MM:SS.000Z`) — 날짜만 넣는 것 금지
- **최초 배포 시 1회만 설정.** 포스트 수정·재배포 시 절대 변경하지 않는다
- 같은 날 여러 포스트 배포 시 실제 시각이 달라 자동으로 순서 보장됨
