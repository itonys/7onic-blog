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

## Voice & Tone — 실제 사람이 쓴 글처럼

> AI가 초안을 작성하더라도, 최종 결과물은 **사람이 직접 쓴 글**처럼 읽혀야 한다. 아래 규칙을 반드시 따른다.

### 금지 패턴 (AI 느낌이 나는 글쓰기)

| 패턴 | 예시 | 왜 문제인가 |
|------|------|-------------|
| 깔끔한 병렬 반복 | "No X. No Y. No Z." / "Same values. Every format. Zero drift." | 기계적으로 깎아낸 느낌. 실제 사람은 이렇게 대칭적으로 쓰지 않음 |
| "Here's the thing:" 류 전환어 | "Here's the thing:", "Let me be clear:", "I want to be specific about" | 에세이 교과서 톤. 그냥 바로 말하면 됨 |
| 모든 문단이 논점에 봉사 | 도입→문제→시도→해결→정리 | 너무 완벽한 구조. 실제 글에는 약간의 우회, 괄호 속 사족, 자기 의심이 있음 |
| 겸손한 척 하는 자기 홍보 | "It's still a work in progress" (42개 컴포넌트 설명 직후) | 겸손과 자랑이 동시에 들어가면 어색함 |
| 감정 없는 평가 | "That's the right division of responsibility" | 판사처럼 선언. 실제 사람은 "이게 나한테 맞았다" 정도로 씀 |
| 글 마무리 포용 | "If you've ever X, you're in the right place" | 마케팅 카피. 블로그 글은 초대장이 아님 |
| 의미 없는 강조 반복 | 핵심 포인트를 bold + 반복 + 마무리 3중 강조 | 한 번이면 충분함 |

### 지향 패턴 (사람 느낌이 나는 글쓰기)

- **구체적인 기억으로 시작** — "핸드오프는 UI가 죽는 곳이다" 같은 선언 대신, 실제 경험 한 장면으로 열기
- **괄호 속 사족 허용** — 완벽하게 정제된 문장보다, 생각의 흐름이 보이는 글이 자연스러움
- **자기 의심 드러내기** — "이게 맞는지 한참 고민했다", "솔직히 처음엔 틀렸다" 같은 표현
- **길이 변주** — 긴 문장 뒤에 짧은 한 줄. 리듬이 단조로우면 기계적으로 읽힘
- **"you"보다 "I"** — 독자에게 강의하지 말고, 자기 이야기를 할 것. 독자는 공감하면 따라옴
- **과도한 정리 금지** — 불릿 리스트가 5개 넘어가면 재고. 모든 것을 정리하려는 충동은 AI 특유의 습관
- **마무리를 안 지어도 됨** — 모든 글이 깔끔한 결론으로 끝날 필요 없음. 열린 결말도 좋음

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
