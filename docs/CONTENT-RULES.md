# 7onic Blog — Content Rules

> 블로그 포스트 작성 시 반드시 따르는 규칙. AI가 초안을 작성할 때도 이 규칙을 기준으로 한다.

---

## Frontmatter 필수 항목

```yaml
---
title: "제목 (60자 이내, 영어)"
description: "SEO 설명 (120~160자, 영어)"
pubDate: YYYY-MM-DD
category: "design-system | tokens | components | tailwind | ai | cli | devops"
tags: ["tag1", "tag2", "tag3"]  # 3~5개, 소문자 kebab-case
series: "design-to-code"        # 시리즈 포스트만
seriesOrder: 1                   # 시리즈 포스트만
draft: false
---
```

- `title`: 60자 이내. 명확하고 검색 친화적으로.
- `description`: 120~160자. 첫 문장이 핵심 내용 요약.
- `tags`: 3~5개. 카테고리와 중복 가능. 소문자 kebab-case (`design-tokens`, `radix-ui` 등).
- `draft: true`로 작성 시작 → 검토 완료 후 `draft: false`로 변경.

---

## 제목 구조 (Heading Hierarchy)

| 레벨 | 용도 | 규칙 |
|------|------|------|
| H1 (`#`) | **사용 금지** | frontmatter `title`에서 자동 렌더링 |
| H2 (`##`) | 주요 섹션 | 포스트당 3~5개 권장 |
| H3 (`###`) | H2 하위 세부 항목 | 필요 시만 사용 |
| H4 이하 | **사용 금지** | 스타일 미정의 |

---

## 본문 규칙

- **폰트**: Inter 18px, line-height 1.7 (CSS 자동)
- **문단 길이**: 3~5문장 이내
- **문단 구분**: 빈 줄 **1개** — 연속 빈 줄 2개 이상 금지
- **강조**: `**bold**` — 핵심 개념·주의사항에만 절제해서 사용
- **이탤릭**: `*italic*` — 용어 설명·인용에만

---

## 링크

- 앵커 텍스트는 의미 있는 단어로 — `click here` / `here` 금지
- 외부 링크: `[텍스트](URL)` — 보라색 underline 자동 적용
- 내부 링크: 상대 경로 사용 (`/category/tokens` 등)

---

## 코드 블록

언어 식별자 **필수**. 아래 기능 모두 사용 가능.

### 기본
````md
```tsx
const Button = () => <button>Click</button>
```
````

### 파일명 표시
````md
```tsx title="Button.tsx"
export const Button = () => <button>Click</button>
```
````

### Diff (추가/삭제)
````md
```tsx
- const old = 'remove this'  // [!code --]
+ const new = 'add this'     // [!code ++]
```
````

### 특정 줄 하이라이트
````md
```tsx {2,4-6}
line 1
line 2  // highlighted
line 3
line 4  // highlighted
line 5  // highlighted
```
````

### 포커스 (나머지 줄 흐리게)
````md
```tsx
const a = 1
const b = 2  // [!code focus]
const c = 3
```
````

### 단어 하이라이트
````md
```tsx
// [!code word:className]
const className = 'btn'
```
````

- 복사 버튼은 모든 코드 블록에 자동 표시
- 인라인 코드: 변수명·파일명·명령어에 `` `backtick` ``

---

## 이미지

| 항목 | 규칙 |
|------|------|
| 저장 위치 | `public/images/posts/[post-slug]/` |
| 권장 너비 | **1200px** (Retina 대응) |
| 포맷 | **WebP** 우선, PNG/JPG 허용 |
| 파일 크기 | **200KB 이하** |
| Alt 텍스트 | 필수 — `![설명](경로)` |

```md
![Button component with primary variant](./button-primary.webp)
```

---

## 기타 요소

### 인용 (Blockquote)
```md
> 핵심 포인트나 중요한 인용문에 사용.
```

### 구분선 (HR)
```md
---
```
주요 주제 전환 시 사용. H2 위에는 불필요 (margin-top 자동).

### 리스트
- 순서 없음: `-` (비순차 항목)
- 순서 있음: `1.` (단계별 순서가 중요한 경우)
- 리스트 안 리스트: 최대 2단계

### 테이블
비교 데이터에 사용. 3컬럼 이상 권장.

---

## 포스트 구조 (권장)

```md
---
frontmatter
---

도입 문단 — 무엇을, 왜 다루는지 (3~5문장)

## 섹션 1

## 섹션 2

## 섹션 3

## Conclusion / Wrapping Up

마무리 + 다음 포스트 예고 (시리즈의 경우)
```

---

## 파일 네이밍

- 파일명 = URL slug: `why-i-built-7onic.md`
- 소문자 + kebab-case
- 최대 50자 이내
- 저장 위치: `~/Documents/7onic-blog/src/content/blog/`
