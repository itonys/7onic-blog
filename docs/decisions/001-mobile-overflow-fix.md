# Decision 001: Mobile Horizontal Overflow Fix

> 2026-04-17 — BlogPost.astro에서 모바일 무한 가로 스크롤 발생. 원인 3개 발견, 전부 수정.

---

## 증상

- 모바일에서 블로그 포스트 페이지만 무한 가로 스크롤 발생
- 코드 블록이 있는 포스트(`tailwind`, `token-pipeline`)에서 특히 심함
- 코드 블록이 없는 포스트(`solo-builder`)도 영향
- `index.astro`, `about.astro`, `category`, `series` 페이지는 정상

---

## 원인 3개

### 1. `<!doctype html>` 누락 (BlogPost.astro)

**영향**: 전체 블로그 포스트 페이지

모든 다른 페이지(`index.astro`, `about.astro`, `category/[id].astro`, `series/[id].astro`)에는 `<!doctype html>`이 있었는데, `BlogPost.astro`만 빠져있었음.

- Doctype 없음 → 브라우저 quirks mode
- Quirks mode → 모바일 viewport meta(`width=device-width`) 무시
- 페이지가 ~980px 폭으로 렌더링 → 무한 가로 스크롤

**원인 분석**: `BlogPost.astro`는 layout 파일이라 "HTML 문서가 아니다"라는 착각으로 doctype을 빠뜨림. 실제로는 `<html>`, `<head>`, `<body>`를 전부 포함하는 완전한 HTML 문서.

**수정**: `BlogPost.astro` 첫 줄에 `<!doctype html>` 추가.

### 2. column flex에서 `align-items: flex-start` 잔류 (BlogPost.astro)

**영향**: 코드 블록이 있는 포스트만

```css
/* 데스크탑: 사이드바 레이아웃용 */
.page-wrapper {
  display: flex;
  align-items: flex-start; /* 사이드바가 상단 정렬되어야 해서 필요 */
}

/* 모바일: column으로 전환하는데 flex-start가 그대로 남음 */
@media (max-width: 768px) {
  .page-wrapper {
    flex-direction: column;
    /* align-items: flex-start 그대로 → 문제 */
  }
}
```

column flex에서 `align-items: flex-start`는 자식 요소의 **폭을 컨테이너에 고정시키지 않고 컨텐츠 폭에 맞춰 확장**시킴:

- 코드 블록에 긴 줄이 있으면 `pre` 폭 확장
- → `.prose` 확장 → `article` 확장 → `.main-content` 확장
- → 페이지 폭 > 뷰포트 폭 → 가로 스크롤

**수정**: 모바일 미디어쿼리에 `align-items: stretch` 추가.

```css
@media (max-width: 768px) {
  .page-wrapper {
    flex-direction: column;
    align-items: stretch; /* 추가 */
    gap: 0;
    padding: 0 1rem;
  }
}
```

### 3. `.prose pre`에 `max-width: 100%` 부재 + `.prose`에 `overflow-x: hidden` 부재 (global.css)

**영향**: 코드 블록 오버플로 안전장치

- `.prose pre { max-width: 100% }` → pre 폭을 부모에 고정
- `.prose { overflow-x: hidden }` → block formatting context 생성, 부모 체인 확장 방지
- `.prose table { display: block; overflow-x: auto }` → 넓은 테이블 모바일 스크롤

**수정**: `global.css`에 위 속성 추가.

---

## 수정 파일 목록

| 파일 | 변경 내용 |
|------|----------|
| `src/layouts/BlogPost.astro` | `<!doctype html>` 추가 |
| `src/layouts/BlogPost.astro` | 모바일 `align-items: stretch` 추가 |
| `src/styles/global.css` | `.prose { overflow-x: hidden }` 추가 |
| `src/styles/global.css` | `.prose pre { max-width: 100% }` 추가 |
| `src/styles/global.css` | `.prose table { display: block; overflow-x: auto }` 추가 |

---

## 앞으로 주의할 것

### 1. `<!doctype html>` 필수 체크

`<html>` 태그를 포함하는 모든 `.astro` 파일은 page/layout 구분 없이 반드시 `<!doctype html>`로 시작한다.

> CLAUDE.md `⛔ 절대 금지 #4`에 등록됨.

### 2. 새 페이지/레이아웃 작성 시 모바일 flex 방향 전환 점검

데스크탑에서 `flex-direction: row` + `align-items: flex-start`를 쓸 때, 모바일에서 `flex-direction: column`으로 바꾸면 **반드시 `align-items: stretch`도 함께 오버라이드**한다. Column flex에서 `flex-start`는 자식 폭을 컨텐츠 크기에 맞추므로 오버플로 위험.

### 3. 코드 블록/테이블은 항상 overflow 처리

`.prose` 안에 들어가는 외부 컨텐츠(마크다운 렌더링 결과)는 폭을 제어할 수 없다. `pre`, `table`, `img` 등 넓어질 수 있는 요소에 `max-width: 100%` + `overflow-x: auto` 필수.

### 4. 모바일 테스트는 코드 블록이 있는 포스트로

코드 블록이 없는 포스트는 문제가 안 보임. 모바일 테스트 시 반드시 **코드 블록이 많은 포스트**로 확인.
