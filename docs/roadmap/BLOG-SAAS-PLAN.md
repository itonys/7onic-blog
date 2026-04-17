# Blog SaaS — 기획 로드맵

> 상태: 기획 단계 (미착수)
> 목적: 블로그 자동 배포 + 교차게시 인프라를 SaaS 수익 모델로 확장
> 최종 갱신: 2026-04-17

---

## 서비스 콘셉

**개인 블로그 + 블로그 전파 허브**

> "Write once, publish everywhere"

블로그를 소유하고, 동시에 모든 플랫폼으로 전파한다.
유저는 글 쓰는 것에만 집중 — 배포, 교차게시, OG 이미지는 전부 자동.

```
유저가 AI로 글 작성
→ MD 템플릿에 붙여넣기
→ 대시보드에 업로드
→ 개인 블로그 즉시 반영 (빌드 없음)
→ dev.to / Hashnode / Zenn / Qiita 동시 전파
```

### 경쟁 서비스와 차이
| 서비스 | 블로그 소유 | 커스텀 도메인 | 교차배포 | 브랜딩 | 데이터 이전 |
|---|---|---|---|---|---|
| Velog / Zenn | X (플랫폼 종속) | X | X | X (플랫폼 디자인) | 제한적 |
| dev.to / Hashnode | X (플랫폼 종속) | △ (Hashnode만) | X | △ | MD export |
| Ghost / Substack | O | O | X | O | O |
| Buffer / Hootsuite | X (블로그 아님) | — | O (SNS만) | — | — |
| **우리** | **O** | **O** | **O (dev.to, Hashnode, Zenn, Qiita)** | **O** | **O (MD 다운로드)** |

> **핵심 포지션**: Velog의 편리함 (MD 업로드 → 즉시 게시) + 자기 블로그의 독립성 (커스텀 도메인, SEO 축적, 데이터 소유권) + 교차배포 자동화

---

## 아키텍처 — Astro SSR 멀티테넌트

### 핵심 결정

유저마다 별도 사이트를 빌드하지 않는다.
**Astro 1개 앱이 SSR 모드로 모든 유저 블로그를 서빙한다.**

```
user1.blog.7onic.app  ─┐
user2.blog.7onic.app  ──→  Astro SSR 앱 1개 (Cloudflare Workers)
user3.blog.7onic.app  ─┘       ↓
                          서브도메인으로 유저 식별
                          KV/DB에서 설정 읽기
                          R2에서 포스트 읽기
                          Astro 컴포넌트로 렌더링
                          캐시 저장 → HTML 응답
```

### 왜 이 방식인가

| 비교 항목 | 유저별 정적 빌드 | SSR 멀티테넌트 |
|----------|---------------|--------------|
| 유저 1000명 시 빌드 | 월 3000+ 빌드 필요 | **빌드 없음** |
| 테마 업데이트 | 1000개 재빌드 | **1번 배포** |
| 빌드 실패 관리 | 매일 어딘가서 터짐 | **빌드 없음** |
| 설정 변경 반영 | 2~3분 대기 | **즉시** |
| 관리할 프로젝트 | 1000개 | **1개** |
| Astro 생태계 | ✅ | ✅ 동일 |

### Astro 프로젝트 구조

```
blog-saas/
├── astro.config.mjs          # output: 'server', adapter: cloudflare()
├── src/
│   ├── middleware.ts          # 서브도메인 → 유저 식별
│   ├── lib/
│   │   ├── config.ts         # KV에서 유저 설정 읽기
│   │   ├── posts.ts          # R2에서 포스트 읽기
│   │   ├── cache.ts          # 캐시 관리 (생성/무효화)
│   │   └── og.ts             # OG 이미지 생성 (satori)
│   ├── layouts/
│   │   └── BlogLayout.astro  # 유저 설정 주입된 공통 레이아웃
│   ├── components/
│   │   ├── Header.astro      # config.headerMenu 기반 동적 렌더링
│   │   ├── Sidebar.astro     # config.categories + config.series
│   │   ├── Footer.astro      # config.footer + config.socialLinks
│   │   ├── PostCard.astro
│   │   └── ThemeProvider.astro  # config.brandColor → CSS 변수 주입
│   ├── pages/
│   │   ├── index.astro          # 블로그 홈 (포스트 목록)
│   │   ├── [slug].astro         # 포스트 상세
│   │   ├── category/[id].astro  # 카테고리별 목록
│   │   ├── series/[id].astro    # 시리즈별 목록
│   │   ├── about.astro          # 작성자 소개
│   │   ├── og/[slug].png.ts     # OG 이미지 (on-demand + R2 캐시)
│   │   ├── rss.xml.ts           # RSS 피드
│   │   └── sitemap.xml.ts       # 사이트맵
│   ├── styles/
│   │   └── theme.css            # CSS 변수 기반 테마
│   └── themes/                  # 테마별 레이아웃 변형
│       ├── minimal-dark/
│       ├── minimal-light/
│       └── docs-style/
└── dashboard/                   # 대시보드 (Next.js 별도 앱)
    └── ...
```

### astro.config.mjs

```js
import { defineConfig } from 'astro/config'
import cloudflare from '@astrojs/cloudflare'

export default defineConfig({
  output: 'server',
  adapter: cloudflare({
    mode: 'advanced',
    runtime: { mode: 'off' }, // KV, R2 바인딩은 wrangler.toml에서
  }),
})
```

### 요청 흐름 상세

```
1. 유저 요청: user1.blog.7onic.app/my-post

2. Cloudflare Workers가 Astro SSR 앱 실행

3. middleware.ts:
   - Host 헤더에서 서브도메인 추출 → "user1"
   - Astro.locals.username = "user1"

4. [slug].astro 페이지:
   a. 캐시 확인 (user1:my-post)
      → 있으면 캐시 응답 반환 (렌더링 안 함)
   b. KV에서 user1 설정 읽기 → config JSON
   c. R2에서 my-post HTML 읽기
   d. Astro 컴포넌트 렌더링:
      - Header: config.headerMenu 기반
      - Sidebar: config.categories + config.series
      - 본문: post HTML (Shiki 하이라이팅 적용됨)
      - Footer: config.footer + config.socialLinks
      - CSS: config.brandColor → --color-brand 변수
   e. 완성된 HTML 캐시 저장
   f. 응답 반환

5. 다음 동일 요청 → 캐시에서 즉시 반환
```

### 캐시 전략

```
캐시 키: {username}:{path}
저장소: Cloudflare Cache API (무료, 엣지)

무효화 시점:
- 포스트 게시/수정/삭제 → 해당 포스트 + 홈 + 카테고리 + 시리즈 캐시 무효화
- 설정 변경 → 해당 유저 전체 캐시 무효화

캐시 TTL: 24시간 (변경 없으면 자동 갱신)
```

---

## 기술 스택

### 인프라 (전부 무료 티어)

| 서비스 | 용도 | 무료 한도 | 비용 |
|--------|------|----------|------|
| Cloudflare Workers | Astro SSR 서빙 | 일 10만 요청 | 0원 |
| Cloudflare KV | 유저 설정 JSON | 일 10만 읽기 / 1000 쓰기 | 0원 |
| Cloudflare R2 | 포스트 HTML + 미디어 | 10GB / 월 1000만 읽기 | 0원 |
| Supabase | 유저 계정 + 대시보드 데이터 | 50k MAU / 500MB | 0원 |
| Vercel | 대시보드 호스팅 (Next.js) | 무료 | 0원 |
| Stripe | 결제 | 결제 시 3.6% 수수료만 | 0원 |

### 스케일링

| 유저 수 | 인프라 상태 | 월 비용 |
|---------|-----------|--------|
| ~5,000명 | 무료 티어 내 | 0원 |
| ~100,000명 | Workers $5/월 | ~750엔 |

### 대시보드 UI

- **7onic 디자인 시스템** — 토큰 + 컴포넌트 그대로 사용
- Next.js + Supabase Auth + Stripe

---

## 유저 설정 스키마

### config JSON (KV 저장)

```json
{
  "username": "user1",
  "plan": "free",
  "theme": "minimal-dark",

  "blog": {
    "title": "My Developer Blog",
    "description": "Thoughts on frontend development",
    "language": "en"
  },

  "branding": {
    "logo": "r2://user1/uploads/logo.png",
    "favicon": "r2://user1/uploads/favicon.ico",
    "brandColor": "#7c3aed",
    "ogTemplate": "default"
  },

  "author": {
    "name": "Tony",
    "bio": "Frontend developer. Building things.",
    "avatar": "r2://user1/uploads/avatar.jpg"
  },

  "headerMenu": [
    { "label": "Home", "url": "/" },
    { "label": "About", "url": "/about" },
    { "label": "GitHub", "url": "https://github.com/user", "external": true }
  ],

  "categories": [
    { "id": "react", "label": "React" },
    { "id": "css", "label": "CSS" },
    { "id": "devops", "label": "DevOps" }
  ],

  "series": [
    { "id": "react-deep-dive", "label": "React Deep Dive", "description": "..." }
  ],

  "socialLinks": {
    "x": "@user",
    "github": "user",
    "linkedin": ""
  },

  "footer": {
    "text": "© 2026 Tony",
    "links": []
  },

  "integrations": {
    "devto": { "apiKey": "encrypted:...", "enabled": true },
    "hashnode": { "apiKey": "encrypted:...", "pubId": "...", "enabled": true },
    "zenn": { "enabled": false },
    "qiita": { "enabled": false },
    "analytics": { "gaId": "" },
    "comments": { "provider": "giscus", "repo": "", "enabled": false }
  },

  "domain": {
    "custom": "",
    "subdomain": "user1"
  }
}
```

### 포스트 데이터 (R2 저장)

```
R2 버킷 구조:
  users/
    user1/
      posts/
        my-first-post.json        ← 메타데이터
        my-first-post.html        ← 렌더링된 HTML (Shiki 적용)
        my-first-post.md          ← 원본 MD (교차게시 + 수정용)
      uploads/
        logo.png
        favicon.ico
        avatar.jpg
        posts/
          my-first-post/
            screenshot.webp       ← 포스트 이미지
      cache/
        og/
          my-first-post.png       ← OG 이미지 캐시
```

### 포스트 메타데이터 JSON

```json
{
  "slug": "my-first-post",
  "title": "My First Post",
  "description": "This is my first blog post",
  "pubDate": "2026-04-17T00:00:00.000Z",
  "updatedDate": null,
  "category": "react",
  "tags": ["react", "hooks", "typescript"],
  "series": "react-deep-dive",
  "seriesOrder": 1,
  "draft": false,
  "crossPost": {
    "devtoId": "3513177",
    "devtoUrl": "https://dev.to/user/...",
    "hashnodeId": "69e192f9",
    "hashnodeUrl": "https://user.hashnode.dev/..."
  }
}
```

---

## 유저 설정 기능 상세 (대시보드)

### 1. 블로그 기본 설정

| 항목 | 입력 방식 | 플랜 |
|------|----------|------|
| 블로그 제목 | 텍스트 (60자 이내) | 전체 |
| 블로그 설명 | 텍스트 (160자 이내) | 전체 |
| 언어 | 셀렉트 (en / ja / ko) | 전체 |
| 테마 선택 | 카드 프리뷰 → 클릭 | Free=1종 고정, Basic+=전체 |

### 2. 브랜딩

| 항목 | 입력 방식 | 플랜 |
|------|----------|------|
| 로고 | 이미지 업로드 (R2) | 전체 |
| 파비콘 | 이미지 업로드 (R2) | 전체 |
| 브랜드 컬러 | 컬러 피커 (기본 #7c3aed) | 전체 |
| 아바타 | 이미지 업로드 (R2) | 전체 |

#### 브랜드 컬러 구현

```css
/* ThemeProvider.astro가 config에서 읽어서 주입 */
:root {
  --color-brand: var(--user-brand-color, #7c3aed);
  --color-brand-hover: color-mix(in srgb, var(--color-brand) 85%, black);
  --color-brand-light: color-mix(in srgb, var(--color-brand) 10%, transparent);
}
```

### 3. 작성자 정보

| 항목 | 입력 방식 | 용도 |
|------|----------|------|
| 이름 | 텍스트 | 포스트 하단 author 영역, copyright |
| 한줄 소개 | 텍스트 (80자) | About 페이지, author 카드 |
| 아바타 | 이미지 업로드 | author 카드, OG 이미지 |

### 4. 네비게이션

#### 헤더 메뉴
- 대시보드에서 드래그 앤 드롭으로 순서 변경
- 항목 추가/삭제/이름 변경
- 외부 링크 지원 (external: true → 새 탭)
- 최대 6개

#### 사이드바 카테고리
- 카테고리 추가/삭제/이름 변경
- 포스트에서 카테고리 선택 시 이 목록에서 선택
- 카테고리 URL: `/category/{id}`

### 5. 시리즈 (그룹 기능)

- 시리즈 생성: ID + 라벨 + 설명
- 포스트 작성 시 시리즈 선택 + 순서 지정
- 시리즈 페이지: `/series/{id}` — 순서대로 목록 표시
- 시리즈 삭제 시 포스트는 유지 (시리즈 태그만 해제)

### 6. 소셜 링크

| 항목 | 입력 방식 |
|------|----------|
| X (Twitter) | @handle |
| GitHub | username |
| LinkedIn | URL |

→ 푸터 + 사이드바에 아이콘으로 표시

### 7. 푸터

| 항목 | 입력 방식 |
|------|----------|
| Copyright 텍스트 | 텍스트 (기본: `© {year} {author.name}`) |

### 8. 도메인

| 항목 | 입력 방식 | 플랜 |
|------|----------|------|
| 서브도메인 | `{username}.blog.7onic.app` (자동) | 전체 |
| 커스텀 도메인 | CNAME 설정 안내 + 검증 | Basic+ |

#### 커스텀 도메인 구현
```
유저가 대시보드에서 도메인 입력
→ CNAME 설정 안내 (user-blog.example.com → blog.7onic.app)
→ DNS 검증 (API로 CNAME 확인)
→ Cloudflare for SaaS로 SSL 자동 발급
→ Worker가 Host 헤더로 유저 매칭
```

---

## 포스트 게시 흐름 상세

### 포스트 업로드

```
1. 대시보드에서 글 작성 (3가지 입력 방식, 내부 저장은 전부 MD)
   - MD 파일 업로드 (AI로 생성한 글 붙여넣기)
   - MD 에디터 (코드 기반 + 실시간 프리뷰, 개발자용)
   - WYSIWYG 에디터 (Notion 스타일, 비개발자용)

2. 서버 처리:
   a. frontmatter 파싱 + 유효성 검증
      - title 60자 이내
      - description 120~160자
      - tags 3~5개
      - category가 유저 설정에 존재하는지
   b. MD → HTML 변환
      - remark/rehype 파이프라인
      - Shiki 코드 하이라이팅 (github-light/github-dark 듀얼)
      - 이미지 URL 처리 (상대경로 → R2 URL)
   c. R2에 저장:
      - {username}/posts/{slug}.md (원본)
      - {username}/posts/{slug}.html (렌더링)
      - {username}/posts/{slug}.json (메타데이터)
   d. Supabase에 포스트 인덱스 저장 (검색/정렬용)

3. 캐시 무효화:
   - 해당 포스트 페이지
   - 홈 (포스트 목록)
   - 해당 카테고리 페이지
   - 해당 시리즈 페이지
   - RSS
   - sitemap

4. 교차게시 (유저 설정에 따라):
   a. MD 원본 읽기
   b. canonical URL 생성: {user-domain}/{slug}
   c. dev.to API → POST /api/articles
   d. Hashnode GraphQL API → createStory
   e. (Pro) Zenn / Qiita API
   f. 반환된 ID/URL을 포스트 메타데이터에 기록

5. 대시보드에 결과 표시:
   - 블로그 ✅ / dev.to ✅ / Hashnode ✅
   - 각 URL 링크
```

### 포스트 수정

```
1. 대시보드에서 MD 수정 (원본 MD 로드)
2. 동일 파이프라인 실행 (HTML 재생성)
3. 캐시 무효화
4. 교차게시 업데이트 (기존 ID로 PUT/UPDATE)
```

### 포스트 삭제

```
1. R2에서 MD/HTML/JSON 삭제
2. Supabase 인덱스 삭제
3. 캐시 무효화
4. 교차게시 삭제는 수동 안내 (대부분 플랫폼이 API 삭제 미지원)
```

---

## OG 이미지 생성

### 구현 방식

```
요청: user1.blog.7onic.app/og/my-post.png

1. R2 캐시 확인 (users/user1/cache/og/my-post.png)
   → 있으면 즉시 반환

2. 없으면 on-demand 생성:
   a. KV에서 유저 설정 읽기 (brandColor, logo)
   b. R2에서 포스트 메타데이터 읽기 (title, tags)
   c. satori로 SVG 생성
      - 배경: brandColor 기반 그라데이션
      - 제목 + 태그 + 로고
   d. @resvg/resvg-wasm으로 PNG 변환 (Worker 환경)
   e. R2에 캐시 저장
   f. 응답 반환

3. 포스트 수정 시 OG 캐시도 무효화
```

### 테마별 OG 템플릿

- Free: 기본 템플릿 1종 (brandColor 그라데이션 + 제목)
- Pro: 커스텀 템플릿 선택 가능 (향후)

---

## 교차게시 상세

### 지원 플랫폼

| 플랫폼 | API | 플랜 |
|--------|-----|------|
| dev.to | REST API v1 | Free+ |
| Hashnode | GraphQL API | Basic+ |
| Zenn | 비공식 (GitHub 연동) | Pro |
| Qiita | REST API v2 | Pro |

### 교차게시 로직

```ts
async function crossPost(username: string, slug: string) {
  const config = await getConfig(username)
  const post = await getPostMD(username, slug)
  const meta = await getPostMeta(username, slug)
  const canonicalUrl = getCanonicalUrl(config, slug)

  const results = {}

  // dev.to
  if (config.integrations.devto.enabled) {
    const devto = await publishToDevto({
      title: meta.title,
      body: post,
      canonical: canonicalUrl,
      tags: meta.tags.map(t => t.replace(/-/g, '')), // 하이픈 제거
      existingId: meta.crossPost?.devtoId, // update 시
    })
    results.devto = devto
  }

  // Hashnode
  if (config.integrations.hashnode.enabled) {
    const hashnode = await publishToHashnode({
      title: meta.title,
      content: post,
      canonical: canonicalUrl,
      tags: meta.tags,
      pubId: config.integrations.hashnode.pubId,
      existingId: meta.crossPost?.hashnodeId,
    })
    results.hashnode = hashnode
  }

  // 결과를 포스트 메타데이터에 기록
  await updatePostMeta(username, slug, { crossPost: results })
  return results
}
```

### canonical URL 규칙

- 커스텀 도메인 있으면: `https://user-blog.example.com/{slug}/`
- 없으면: `https://user1.blog.7onic.app/{slug}/`
- 항상 유저 블로그가 canonical (플랫폼이 아님)

---

## 도메인 구조

| 용도 | 도메인 |
|---|---|
| 서비스 대시보드 | `blog.7onic.app` |
| 유저 블로그 (Free) | `{username}.blog.7onic.app` |
| 유저 블로그 (유료) | 커스텀 도메인 연결 |
| 우리 블로그 (데모) | `blog.7onic.design` (기존 Astro 정적) |

---

## 요금제

| 기능 | Free | Basic (500엔/월) | Pro (1000엔/월) |
|---|---|---|---|
| 블로그 수 | 1개 | 1개 | 3개 |
| 도메인 | `username.blog.7onic.app` | 커스텀 도메인 | 커스텀 도메인 |
| 월 포스트 | 3개 | 20개 | 무제한 |
| 교차게시 | dev.to만 | + Hashnode | + Zenn + Qiita |
| 테마 선택 | 1종 고정 | 전체 | 전체 |
| 브랜드 컬러 | ✅ | ✅ | ✅ |
| 로고/파비콘 | ✅ | ✅ | ✅ |
| 메뉴/카테고리/시리즈 | ✅ | ✅ | ✅ |
| 작성자 정보 | ✅ | ✅ | ✅ |
| 소셜 링크 | ✅ | ✅ | ✅ |
| OG 이미지 | 기본 템플릿 | 기본 템플릿 | 커스텀 가능 |
| Google Analytics | ❌ | ✅ | ✅ |
| 댓글 (Giscus) | ❌ | ✅ | ✅ |
| 미디어 스토리지 | 50MB | 500MB | 2GB |

---

## 수익 모델

- ARPU (평균): 650엔/유료유저 (Basic 70% + Pro 30% 가정)
- 유료 전환율: 3% (SaaS 평균)

| 목표 | 필요 유료유저 | 필요 총 유저 |
|---|---|---|
| 서버비 커버 | 8명 | 270명 |
| 순수익 +3만엔 | 65명 | 2200명 |
| 순수익 +5만엔 | 80명 | 2700명 |
| 순수익 +10만엔 | 175명 | 5800명 |

### 서버 비용

| 유저 수 | 인프라 상태 | 월 비용 |
|---------|-----------|--------|
| ~5,000명 | 전부 무료 티어 | 0원 |
| ~100,000명 | Workers 유료 ($5) | ~750엔 |

→ 비용이 발생하는 시점에 수익이 이미 초과하므로 리스크 없음

---

## AI 정책

- **앱 내 AI 기능 없음** — 토큰 비용 발생 없음
- 유저가 자신의 AI로 글 작성 후 MD만 가져오는 구조
- MD 템플릿 제공으로 AI 활용 유도

### MD 템플릿 (유저에게 제공)

```markdown
---
title: ""           # 60자 이내
description: ""     # 120-160자
pubDate: YYYY-MM-DD
category: ""
tags: []            # 3-5개
series: ""          # 시리즈 사용 시
seriesOrder: 1      # 시리즈 순서
---

본문
```

---

## 빌드 단계

### Phase 1 — MVP

> 목표: 최소 기능으로 유저가 블로그를 만들고 글을 올릴 수 있는 상태

- [ ] **인프라**
  - [ ] Astro SSR + Cloudflare Workers 세팅
  - [ ] Cloudflare KV 바인딩 (유저 설정)
  - [ ] Cloudflare R2 바인딩 (포스트 + 미디어)
  - [ ] Supabase 프로젝트 (유저 계정 + 포스트 인덱스)
  - [ ] 서브도메인 라우팅 (`*.blog.7onic.app` → Worker)
  - [ ] 캐시 레이어 (Cloudflare Cache API)
- [ ] **대시보드**
  - [ ] 인증 (GitHub OAuth + 이메일)
  - [ ] 블로그 기본 설정 (제목, 설명, 언어)
  - [ ] 브랜딩 (로고, 파비콘, 브랜드 컬러, 아바타)
  - [ ] 작성자 정보 (이름, 소개)
  - [ ] 헤더 메뉴 관리 (추가/삭제/순서변경)
  - [ ] 카테고리 관리
  - [ ] 시리즈 관리
  - [ ] 소셜 링크
  - [ ] 푸터 텍스트
  - [ ] MD 업로드 → 자동 포맷 적용 → 포스트 게시 (frontmatter 파싱 + 테마 + Shiki)
  - [ ] MD 다운로드 (원본 MD 내보내기, 다른 플랫폼 재사용)
  - [ ] MD 에디터 (코드 기반, 프리뷰 포함)
  - [ ] WYSIWYG 에디터 (비개발자용, 내부 저장은 MD)
  - [ ] 포스트 목록 + 수정/삭제
  - [ ] dev.to API 키 연결 + 교차게시
- [ ] **블로그 렌더링**
  - [ ] 테마 1종 (minimal-dark, 7onic 블로그 기반)
  - [ ] MD → HTML 파이프라인 (remark + rehype + Shiki)
  - [ ] 유저 설정 기반 동적 렌더링
  - [ ] RSS 피드 생성
  - [ ] sitemap 생성
  - [ ] OG 이미지 on-demand 생성

### Phase 2 — 과금 + 자동화

> 목표: 유료 전환 + 추가 플랫폼

- [ ] Stripe 결제 연동 (엔화)
- [ ] 플랜별 기능 잠금 UI
- [ ] Hashnode 교차게시 (Basic+)
- [ ] 커스텀 도메인 연결 (Cloudflare for SaaS)
- [ ] 테마 추가 (minimal-light, docs-style)
- [ ] 포스트 수정 시 교차게시 자동 업데이트

### Phase 3 — 확장

- [ ] Zenn + Qiita 교차게시 (Pro)
- [ ] OG 이미지 커스텀 템플릿 (Pro)
- [ ] Google Analytics 연동 (Basic+)
- [ ] 플랫폼별 조회수 합산 통계
- [ ] 실패 알림 (이메일)

### Phase 4 — 소셜 기능

- [ ] 댓글 — Giscus (Basic+)
- [ ] 공유 버튼 — X / LinkedIn
- [ ] 좋아요 카운터 (Supabase)
- [ ] 북마크 (로그인 유저 전용)

---

## 마케팅 전략

- **7onic 블로그 자체가 데모** — "이 블로그가 이 서비스로 만들어졌습니다"
- dev.to / Hashnode / Zenn 포스트로 타겟 유저 직접 유입
- 솔로 빌더 커뮤니티 (IndieHackers) 공략
- Product Hunt 런칭 (Phase 2 이후)

---

## 7onic 블로그에서 검증된 SaaS 기능 이슈

> 7onic 블로그를 직접 운영하면서 발견한 기능 요구사항과 엣지케이스. SaaS 구현 시 반드시 반영.

| # | 기능 | 7onic 블로그에서 배운 것 | SaaS 반영 사항 |
|---|------|----------------------|---------------|
| 1 | **Prev/Next 포스트 네비게이션** | 시리즈 내 네비게이션 우선, 시리즈 1개뿐이면 날짜순 폴백. 시리즈 끝에서 다른 시리즈로 넘어가면 맥락 끊김 → 혼합 폴백 금지 | `[slug].astro` 렌더링 시 시리즈/날짜 기반 prev/next 자동 계산. 유저 설정 불필요 (자동) |
| 2 | **모바일 코드 블록 overflow** | `pre`에 `max-width: 100%` + `overflow-x: auto`만으로는 부족. column flex의 `align-items: flex-start`가 부모 체인을 확장시킴. `.prose`에 `overflow-x: hidden` + 모바일에서 `align-items: stretch` 필수 | 테마 CSS에 기본 포함. 유저가 커스텀 CSS를 넣어도 깨지지 않게 `.prose` overflow 보호 |
| 3 | **`<!doctype html>` 누락** | 레이아웃 파일에 doctype 빠뜨리면 quirks mode → 모바일 viewport 무시 → 무한 가로 스크롤 | SSR 렌더링 시 doctype 자동 삽입. 테마 작성자가 실수해도 시스템이 보장 |
| 4 | **교차 배포 sanitization** | dev.to 태그에 하이픈 불가, CSS `@` at-rule이 멘션 링크로 변환됨, 코드 펜스 `title="..."` 제거 필요 | 플랫폼별 sanitizer를 파이프라인에 내장. 유저가 몰라도 자동 처리 |
| 5 | **pubDate 관리** | 배포 시 실제 시각으로 1회 설정, 수정 시 절대 변경 금지. 같은 날 여러 포스트는 시간으로 순서 보장 | 대시보드에서 "게시" 버튼 누른 시각을 자동 기록. 수정 시 pubDate 필드 읽기 전용 |
| 6 | **OG 이미지 자동 생성** | satori + sharp로 on-demand 생성. 포스트별 제목/태그/브랜드 컬러 반영 | R2 캐시 + 포스트 수정 시 캐시 무효화 (이미 설계됨) |
| 7 | **코드 블록 테마** | Shiki 듀얼 테마 (github-light/github-dark) + CSS 변수로 다크모드 전환 | 테마에 Shiki 설정 포함. 유저별 코드 테마 선택은 Phase 2 이후 |
| 8 | **모바일 네비게이션 순서** | Prev/Next 모바일에서 Next를 위에 배치 (읽기 흐름상 다음 글 우선) | 테마 CSS에 `order: -1` 기본 포함 |

---

## 장애 대응 — 데이터 손실 방지 정책

> **원칙: 유저 데이터는 절대 잃지 않는다.** 우리 서버가 완전히 죽어도 유저는 자기 글을 복구할 수 있어야 한다.

### 1. 다중 클라우드 백업

같은 클라우드(Cloudflare)에만 백업하면 전체 장애 시 백업도 같이 죽는다. **최소 1개는 다른 클라우드에 둔다.**

| 데이터 | 원본 | 백업 1 (일간) | 백업 2 (주간) |
|--------|------|-------------|-------------|
| 포스트 MD/HTML/JSON | Cloudflare R2 | 별도 R2 버킷 | AWS S3 또는 Backblaze B2 |
| 유저 설정 JSON | Cloudflare KV | KV 전체 덤프 → R2 | 외부 클라우드 |
| 계정 + 인덱스 | Supabase Postgres | Supabase 자동 백업 (Pro) | `pg_dump` → R2 |
| 미디어 | Cloudflare R2 | 별도 R2 버킷 미러 | 외부 (선택) |

### 2. 유저 자체 백업 (셀프 보호)

우리 서버가 완전히 죽어도 유저가 자기 글을 가지고 있어야 한다.

- **MD 일괄 다운로드** — 대시보드 "Export All" → 전체 포스트 + 메타데이터 ZIP
- **자동 GitHub 동기화** (Pro) — 유저 지정 GitHub repo에 포스트 자동 push
- **교차배포된 글은 살아있음** — dev.to / Hashnode에 이미 복사본 존재 (사실상 3중 백업)

### 3. 배포 중 삭제 방지

- **R2 오브젝트 버저닝** — 삭제/덮어쓰기 시 이전 버전 자동 보관 (30일)
- **배포 파이프라인에 DELETE 금지** — 포스트 게시/수정은 PUT만, 삭제는 대시보드 수동 확인 후에만
- **소프트 삭제** — 유저가 삭제해도 30일간 "휴지통"에 보관, 복구 가능
- **관리자 실수 방지** — 프로덕션 R2 버킷에 `block-delete` 정책, 배포 스크립트가 `rm -rf` 불가

### 4. 서버 다운 대응

- Cloudflare Workers는 글로벌 엣지 — 단일 서버 개념 아님, 전체 다운 확률 극히 낮음
- **정적 폴백 페이지** — 별도 DNS로 "점검 중" 페이지 (다른 호스팅)
- **Status 페이지** — `status.blog.7onic.app` (외부 모니터링 연동)
- **RTO 목표: 1시간** / **RPO 목표: 24시간** (최대 24시간치 데이터 손실 허용)

### 5. 복구 시나리오 연습 (분기별)

백업이 실제로 복구 가능한지 정기 테스트. "백업은 있는데 복구가 안 됨"이 가장 위험.

- Q1: R2 포스트 → 백업에서 1개 유저 전체 복구 테스트
- Q2: Supabase DB → `pg_dump`로 덤프 → 새 DB에 복원 테스트
- Q3: 시나리오 훈련 — "프로덕션 R2 버킷 전체 삭제" 가정 복구

---

## 보안 정책 — 확장 시 항상 적용할 원칙

> **원칙: 신뢰할 수 있는 공급자에게 위임하고, 우리가 직접 다뤄야 하는 것만 최소한으로 보관한다.** 기능 추가/서비스 확장 시 아래 체크리스트를 반드시 검토.

### 1. 결제 보안 (PCI-DSS)

결제 정보는 **절대 우리 서버를 거치지 않는다.** 카드 정보를 한 번이라도 다루면 PCI 규정 대상이 되어 비용/책임 폭증.

| 원칙 | 구현 |
|------|------|
| 카드 데이터 미보관 | Stripe Checkout / Elements — 카드 정보는 Stripe 서버에서만 처리 |
| 결제 토큰만 저장 | Stripe customer ID, subscription ID만 우리 DB에 |
| Webhook 서명 검증 | `stripe-signature` 헤더 검증 — 위조 방지 |
| 멱등성 (Idempotency) | Stripe `Idempotency-Key` 헤더 — 중복 결제 방지 |
| 결제 로그 분리 | 결제 이벤트는 별도 감사 로그, 카드 번호 일부도 기록 금지 |
| 환불/분쟁 프로세스 | Stripe Dashboard에서 관리, 유저 요청은 로그 남기기 |

### 2. 인증 / 인가

| 원칙 | 구현 |
|------|------|
| OAuth 우선 | GitHub / Google OAuth — 자체 비밀번호 최소화 |
| MFA | 유료 플랜 계정에 강제 또는 권장 |
| 세션 관리 | JWT `httpOnly` + `secure` + `SameSite=Lax` 쿠키, 짧은 만료 + refresh |
| Rate limiting | 로그인 시도, 가입, 결제 API 호출 제한 |
| 세션 무효화 | 비밀번호 변경 / 의심 활동 시 전체 세션 강제 종료 |

### 3. 멀티테넌트 격리

유저 A가 유저 B의 데이터를 절대 못 봐야 한다. **멀티테넌트 SaaS의 최대 리스크.**

| 원칙 | 구현 |
|------|------|
| 미들웨어 단계에서 테넌트 식별 | `Astro.locals.username` 설정 후 모든 핸들러에서 참조 |
| 서브도메인 검증 | 유저 A 블로그에서 유저 B 데이터 요청 불가 |
| DB RLS (Row Level Security) | Supabase RLS 정책으로 `user_id` 기반 자동 필터 |
| R2 경로 분리 | `users/{username}/...` 구조, 다른 유저 경로 접근 차단 |
| 관리자 권한 분리 | 어드민 대시보드는 별도 도메인 + IP 제한 + 2FA 필수 |

### 4. 데이터 암호화

| 원칙 | 구현 |
|------|------|
| 전송 중 (in transit) | HTTPS 전용, HSTS 헤더, TLS 1.2+ |
| 저장 중 (at rest) | R2 / Supabase 기본 암호화, KV 역시 |
| API 키 / 시크릿 | KV에 저장 시 암호화 (`"encrypted:..."`), Cloudflare Workers Secrets 활용 |
| 환경변수 관리 | `.env` 금지, Cloudflare/Vercel/Supabase Secrets 사용 |
| 비밀번호 해시 | bcrypt/argon2, 평문 저장 절대 금지 |

### 5. 컨텐츠 보안 (XSS / 인젝션)

유저가 올리는 MD / HTML은 잠재적 공격 벡터.

| 원칙 | 구현 |
|------|------|
| MD → HTML 시 sanitize | `rehype-sanitize` 화이트리스트 기반, `<script>` / `<iframe>` 차단 |
| 인라인 스크립트 금지 | CSP 헤더 `script-src 'self'` |
| CSP 헤더 | `default-src 'self'; img-src 'self' https:; ...` |
| CSRF 보호 | 상태 변경 API에 CSRF 토큰 또는 `SameSite` 쿠키 |
| 파일 업로드 검증 | MIME 타입 + 확장자 + 크기 제한, 악성 파일 스캔 |
| SQL 인젝션 방지 | Supabase 클라이언트 / Prisma 사용 (파라미터 바인딩) |

### 6. API 남용 방지

| 원칙 | 구현 |
|------|------|
| 유저별 Rate limit | Cloudflare Rate Limiting 또는 Worker KV 카운터 |
| 봇 가입 방지 | hCaptcha / Cloudflare Turnstile |
| 대용량 요청 차단 | 업로드 크기 제한 (MD 5MB, 이미지 10MB) |
| 스팸/악용 탐지 | 반복 가입, 대량 포스트 게시 패턴 감지 |
| Terms 위반 조치 | 불법/악성 컨텐츠 신고 → 수동 검토 → 계정 중지 프로세스 |

### 7. 로깅 / 감사

| 원칙 | 구현 |
|------|------|
| 감사 로그 | 로그인, 결제, 설정 변경, 계정 삭제 — 별도 append-only 로그 |
| 민감 정보 로그 금지 | 카드 번호, 비밀번호, API 키는 절대 로그에 남기지 않음 |
| 실패 로그인 추적 | 5회 이상 실패 시 계정 임시 잠금 + 알림 |
| 이상 활동 탐지 | 새 IP 로그인, 대량 API 호출 시 이메일 알림 |
| 로그 보관 기간 | 감사 로그 1년, 일반 로그 30일 |

### 8. 법적 컴플라이언스

| 원칙 | 구현 |
|------|------|
| GDPR / CCPA | 유저가 자기 데이터 전체 다운로드/삭제 요청 가능 |
| 개인정보처리방침 | 명시적 동의, 수집 항목 / 보관 기간 명시 |
| 이용약관 | 가입 시 체크박스, 주요 변경 시 재동의 |
| 쿠키 동의 | EU 유저 대상 쿠키 배너 |
| 특정상거래법 (일본) | 일본 유료 서비스 시 필수 표기 (업자명, 연락처 등) |

### 9. 의존성 / 공급망 보안

| 원칙 | 구현 |
|------|------|
| npm 패키지 검증 | 신뢰 가능한 패키지만, `npm audit` 정기 실행 |
| Lock 파일 커밋 | `package-lock.json` 반드시 커밋, CI에서 `npm ci` 사용 |
| 자동 업데이트 | Dependabot / Renovate로 보안 패치 자동 PR |
| SBOM | 주요 의존성 목록 문서화 |

### 10. 침해 대응 플랜

| 원칙 | 구현 |
|------|------|
| 침해 탐지 시 즉시 대응 | 계정 격리 → 증거 수집 → 근본 원인 분석 → 복구 |
| 유저 고지 의무 | 데이터 유출 시 72시간 이내 통지 (GDPR) |
| 인시던트 로그 | 발생 시각, 영향 범위, 조치 사항, 재발 방지 대책 기록 |
| 정기 보안 감사 | 분기 1회 전체 보안 리뷰 |

### 유저 데이터 생명주기 (가입 → 해지까지)

**원칙**: 유저는 언제든 자기 데이터를 가져가거나 삭제할 수 있어야 한다. 이는 권리이자 신뢰의 기반.

| 단계 | 수집/처리 | 유저가 할 수 있는 것 |
|------|----------|--------------------|
| 가입 | 이메일, OAuth ID, IP, 동의 타임스탬프만 최소 수집 | 수집 항목 사전 고지 + 동의 |
| 블로그 생성 | 서브도메인, 설정 JSON (KV), 포스트 (R2) | 언제든 전체 export (MD ZIP) |
| 포스트 작성 | MD 원본 + HTML + 메타데이터 | 개별 포스트 MD 다운로드 |
| 결제 | Stripe customer/subscription ID만 우리 DB | 결제 내역 조회 (Stripe Portal) |
| 교차배포 | API 키 암호화 저장 (KV) | 언제든 연결 해제, API 키 완전 삭제 |
| 미디어 업로드 | 이미지 (R2) | 개별/전체 삭제 |
| **계정 해지** | — | 30일 유예 (휴지통), 이후 물리 삭제 |
| **데이터 삭제 요청** | — | GDPR: 30일 이내 전체 삭제, 백업 포함 |
| **데이터 이전** | — | GDPR: 구조화된 MD + JSON export |

**유저가 "계정 완전 삭제" 요청 시 삭제 대상:**
- Supabase 유저 행 + 연관 테이블 (CASCADE)
- R2 `users/{username}/**/*` 전체
- KV `user:{username}` 키
- 백업 버킷에서도 30일 이내 제거
- 단, 법적 보관 의무 있는 데이터 (세금 관련 결제 기록 7년)는 익명화 후 보관

### 결제 정보 흐름도 (우리가 절대 직접 다루지 않는 것)

```
❌ 우리 서버를 거치지 않는 것:
   - 카드 번호 / CVV / 만료일
   - 유저의 결제 수단 정보
   - 청구지 주소

✅ 우리 서버에 저장하는 것:
   - Stripe Customer ID (cus_xxx)
   - Stripe Subscription ID (sub_xxx)
   - 플랜 상태 (free / basic / pro, 만료일)
   - 결제 이벤트 감사 로그 (금액, 성공/실패, Stripe 이벤트 ID)
```

**결제 플로우:**

```
1. 유저가 대시보드에서 "Pro 구독" 클릭
   ↓
2. 우리 서버가 Stripe Checkout Session 생성 (Customer ID 포함)
   ↓
3. 유저 → Stripe 결제 페이지로 리다이렉트 (우리 도메인 벗어남)
   ↓
4. 유저가 Stripe에서 결제 완료
   ↓
5. Stripe → 우리 서버로 Webhook 전송
   - stripe-signature 헤더로 검증 (위조 방지)
   - Idempotency-Key 확인 (중복 처리 방지)
   ↓
6. 우리 서버가 유저 플랜 상태 업데이트 (Supabase)
   ↓
7. 감사 로그 기록 (누가, 언제, 얼마, Stripe Event ID)
```

**절대 금지:**
- 카드 정보를 프론트엔드에서 우리 서버로 전송하는 코드
- Stripe API 응답을 그대로 로그에 남기기 (카드 마지막 4자리라도)
- 테스트 환경에서 실제 카드 번호 입력 (Stripe 테스트 카드만)

### 저가 SaaS의 현실적 보안 운영

> **전제**: 월 1000엔 이하 인디 SaaS. 엔터프라이즈 B2B가 아님.

#### 본질 3가지만 지키면 된다

1. **결제는 Stripe에 위임** — 카드 정보 우리 서버 절대 미경유 (PCI 위반 리스크 = 0)
2. **유저 데이터 기본 암호화 + 테넌트 격리** — R2/Supabase 기본 암호화 + RLS
3. **분기별 보안 체크 1시간** — 자동화된 것들 잘 돌아가는지만 확인

나머지 80%는 자동화 + 점진적 강화로 처리.

#### 운영 리듬

**매일 자동 (손 안 대도 됨):**
- Dependabot PR 대기 (크리티컬 보안 패치만 즉시 머지)
- Stripe 웹훅 실시간 처리
- 이상 로그인 탐지 알림

**분기별 체크리스트 (3개월마다 1시간):**
- [ ] `npm audit` 결과 확인
- [ ] 백업 복구 테스트 1개 유저
- [ ] 감사 로그 검토 (결제 이벤트)
- [ ] 비정상 활동 패턴 확인
- [ ] 의존성 주요 업데이트
- [ ] 법령 변경 확인 (GDPR / 일본 특상법)

**즉시 대응 (발생 시):**
- 🚨 크리티컬 보안 패치 (Dependabot HIGH/CRITICAL)
- 🚨 Stripe 이상 결제 알림
- 🚨 계정 탈취 의심 (새 국가/IP 로그인)
- 🚨 서비스 다운 (Status 페이지)

#### 리스크 현실 체크 (저가 SaaS 기준)

| 리스크 | 실제 영향 | 대비책 |
|--------|----------|--------|
| PCI 위반 벌금 | Stripe 위임 시 우리 무관 | ✅ Stripe만 쓰면 끝 |
| GDPR 벌금 | 매출 4% 또는 2000만€ 중 큰 값 → 인디 실질 수만엔 | ✅ MD export + 삭제 기능 |
| 집단소송 | 유저 적으면 경제성 없어서 거의 없음 | ✅ |
| 데이터 유출 | 기술적 피해는 작으나 **평판 치명적** | ✅ 기본 암호화 + 격리 |
| 서비스 장애 | 유저 이탈 | ✅ 다중 백업 (Phase 2) |

**가장 큰 리스크는 법적 처벌이 아니라 평판.** 한 번 터지면 복구 불가능 → 기본 3가지(결제/격리/암호화)만 타이트하게.

#### 99%의 인디 SaaS가 이렇게 운영한다

- Phase 1.5까지만 구현 (🔴 + 🟡)
- Phase 2 이후는 유저 늘어나면 자연스럽게 진행
- SOC 2 / 외부 감사 / 전담 보안팀 = **절대 필요 없음** (엔터프라이즈 진입 전까지)

---

### 일본 법령 체크리스트 (사업 주소지 기준)

우리는 일본 기반이므로 **일본 법이 가장 직접 영향**. EU GDPR은 EU 유저 대상일 때만 적용되지만, 일본 법은 항상 적용.

#### 1. 특定商取引法 (특정상거래법) — 유료 SaaS 필수

**위반 시**: 최대 300만엔 벌금 + 영업 정지

웹사이트 푸터 또는 별도 페이지에 아래 **11개 항목** 반드시 명시:

| 항목 | 내용 |
|------|------|
| 판매자 이름 | 법인명 또는 개인 본명 (필명 불가) |
| 소재지 | 실제 주소 (사서함 불가, 버추얼 오피스 조건부) |
| 전화번호 | 평일 연락 가능한 번호 |
| 이메일 | 문의 대응 이메일 |
| 대표자 | 법인이면 대표이사, 개인이면 운영자 |
| 판매 가격 | 세금 포함 표시 (내세 表示) |
| 추가 요금 | 결제 수수료 등 |
| 지불 시기 및 방법 | 월 구독 시 "매월 X일 자동 결제" |
| 해지 방법 | 대시보드에서 언제든 가능, 일할 계산 여부 |
| 환불 정책 | 디지털 서비스는 "환불 불가" 명시 가능 |
| 제공 시기 | 결제 즉시 이용 가능 |

**구현:** `/legal/commerce-law` 페이지 + 푸터 링크. 대시보드 결제 페이지에도 링크.

#### 2. 個人情報保護法 (개인정보보호법, APPI)

**위반 시**: 개인 1억엔 벌금, 법인 최대 1억엔 (2022 개정)

일본 APPI는 GDPR보다 느슨하지만 **기본 원칙은 동일**:

| 요구사항 | 구현 |
|---------|------|
| 이용 목적 명시 | 수집 시점에 "어디에 쓰는지" 명확히 |
| 동의 획득 | 가입 시 체크박스 (개인정보 제3자 제공 포함) |
| 안전 관리 조치 | 암호화, 접근 제어 (이미 있음) |
| 유출 신고 | 중대한 유출 시 개인정보보호위원회 신고 + 본인 통지 |
| 개시/정정/삭제 청구 대응 | 유저 요청 시 2주 내 응답 |
| 제3자 제공 제한 | Stripe, dev.to 등에 데이터 넘길 때 동의 명시 |

**구현:** `/legal/privacy` 개인정보처리방침 페이지. 가입 폼에 동의 체크박스.

#### 3. 消費者契約法 (소비자계약법)

**위반 시**: 해당 약관 조항 무효화, 소비자 단체 소송 대상

**부당 약관 금지** — 사업자에게만 유리한 조항은 무효:
- ❌ "어떤 경우에도 책임지지 않는다" (전면 면책)
- ❌ "환불 일체 불가" (귀책사유 불문)
- ❌ "우리가 일방적으로 약관 변경 가능"
- ✅ "당사 귀책 사유에 한해 책임 부담"
- ✅ "서비스 장애 시 해당 기간 요금 일할 환불"

**구현:** 이용약관(`/legal/terms`) 작성 시 변호사 리뷰 권장 (최초 1회).

#### 4. 資金決済法 (자금결제법) — Stripe 쓰면 비적용

우리가 결제 중개하지 않고 Stripe에 위임하면 **자금결제법 등록 불필요**. Stripe가 일본 법인(Stripe Japan)으로 등록되어 있어서 책임 짐.

> ⚠️ 만약 "크레딧" 같은 자체 포인트 시스템 도입 시 자금결제법 대상 될 수 있음 — Phase 3+에서 고려.

#### 5. 電気通信事業法 (전기통신사업법)

블로그 서비스는 "他人の通信を媒介する電気通信事業"에 해당 → **등록 불필요한 소규모 분류**에 해당 (2024 개정 후).

> ⚠️ 유저 간 메시징 / 댓글 시스템 도입 시 재검토 필요.

### 일본 법 체크리스트 (Phase별)

#### Phase 1 MVP — 필수

- [ ] 🔴 특정상거래법 표기 페이지 (`/legal/commerce-law`)
- [ ] 🔴 개인정보처리방침 페이지 (`/legal/privacy`)
- [ ] 🔴 이용약관 페이지 (`/legal/terms`)
- [ ] 🔴 가입 시 약관/개인정보 동의 체크박스
- [ ] 🔴 푸터에 3개 법적 페이지 링크

#### Phase 1.5 — 권장

- [ ] 🟡 변호사 리뷰 (최초 1회, 약관 + 처리방침)
- [ ] 🟡 유저 삭제 요청 프로세스 문서화
- [ ] 🟡 개인정보 유출 대응 절차 문서화 (72시간 내 신고)

#### Phase 2 — 확장

- [ ] 🟢 특상법 표기를 다국어 (en/ja/ko)
- [ ] 🟢 약관 변경 시 유저 재동의 시스템
- [ ] 🟢 DPO (개인정보 보호 책임자) 지정 — 유저 1만 명 이상 시

### 실질 리스크 요약

| 법령 | 이론상 최대 | 인디 SaaS 실질 |
|------|------------|-------------|
| 특상법 위반 | 300만엔 | 경고 → 시정 조치 → 미이행 시 벌금 |
| APPI 위반 | 1억엔 | 중대 유출 아니면 경고 수준 |
| 소비자계약법 | 약관 무효 | 실제 소송 드물지만 평판 리스크 |
| GDPR (EU 유저) | €20M | 인디 실질 €500~€5,000 |

→ **MVP 단계에서 법적 페이지 3개만 만들어도 90% 리스크 제거.** 변호사 리뷰 1회만 추가하면 99%.

---

### Phase별 보안 구현 우선순위

모든 보안 항목을 MVP에 넣지 않는다. **단계별로 필수/권장/선택을 명확히 구분.**

#### Phase 1 MVP — 절대 스킵 불가 (🔴 필수)

카드 정보 + 유저 격리 + 기본 인증만 타이트하게. 나머지는 기본값 수준.

- 🔴 Stripe 위임 — 카드 정보 우리 서버 절대 미경유
- 🔴 Stripe Webhook 서명 검증
- 🔴 HTTPS 전용 + HSTS 헤더
- 🔴 OAuth (GitHub/Google) 기반 인증
- 🔴 Multi-tenant 격리: Supabase RLS + 미들웨어 테넌트 검증
- 🔴 R2 경로 분리 (`users/{username}/...`)
- 🔴 비밀번호 해시 (자체 비밀번호 옵션 시)
- 🔴 세션 쿠키: `httpOnly` + `secure` + `SameSite`
- 🔴 MD → HTML sanitize (`rehype-sanitize`)
- 🔴 API 키 암호화 저장 (KV에 평문 금지)
- 🔴 MD export 기능 (GDPR 준비, 해지 시 데이터 이전)

#### Phase 1.5 — MVP 직후 보강 (🟡 권장)

유저 10명 넘어가기 전에 마무리. 큰 비용 아님.

- 🟡 감사 로그 — 결제, 계정 삭제, 권한 변경만 append-only 로그
- 🟡 Rate limiting — 로그인, 가입, 결제 API
- 🟡 hCaptcha / Turnstile — 봇 가입 방지
- 🟡 CSP 헤더 기본 설정 (`default-src 'self'`)
- 🟡 이용약관 + 개인정보처리방침 (일본 특정상거래법 포함)
- 🟡 R2 오브젝트 버저닝 + 소프트 삭제 (휴지통)

#### Phase 2 — 유저 늘어나면 (🟢 확장)

수백 명 규모에서 필요. 운영 안정화 단계.

- 🟢 다중 클라우드 백업 (R2 → AWS S3 or B2)
- 🟢 Supabase DB 자동 백업 + 정기 dump
- 🟢 실패 로그인 추적 + 계정 임시 잠금
- 🟢 이상 활동 탐지 (새 IP, 대량 API 호출)
- 🟢 MFA (유료 플랜 권장)
- 🟢 Dependabot / Renovate 자동 패치
- 🟢 `npm audit` CI 통합
- 🟢 Status 페이지 (status.blog.7onic.app)
- 🟢 GDPR 전체 삭제 프로세스 (백업 포함)

#### Phase 3+ — 엔터프라이즈 (🔵 필요 시)

B2B 고객 / 법인 계약 들어올 때. 비용 큼.

- 🔵 분기별 복구 훈련
- 🔵 외부 침투 테스트 (연 1회)
- 🔵 SOC 2 Type II 감사 (수천만원)
- 🔵 전담 보안 담당자
- 🔵 SIEM (보안 이벤트 통합 모니터링)
- 🔵 SBOM (공급망 투명성)

### 우선순위 요약 테이블

| 항목 | Phase 1 | Phase 1.5 | Phase 2 | Phase 3+ |
|------|:-:|:-:|:-:|:-:|
| Stripe PCI 위임 | 🔴 | | | |
| Multi-tenant RLS | 🔴 | | | |
| OAuth + 세션 | 🔴 | | | |
| MD sanitize | 🔴 | | | |
| MD export (GDPR) | 🔴 | | | |
| 감사 로그 | | 🟡 | | |
| Rate limiting | | 🟡 | | |
| CSP / Captcha | | 🟡 | | |
| 다중 클라우드 백업 | | | 🟢 | |
| MFA | | | 🟢 | |
| 이상 활동 탐지 | | | 🟢 | |
| GDPR 전체 삭제 | | | 🟢 | |
| SOC 2 | | | | 🔵 |
| 분기 복구 훈련 | | | | 🔵 |
| 침투 테스트 | | | | 🔵 |

---

### 확장 시 체크리스트 (새 기능 추가마다 반드시 확인)

```
□ 새 데이터는 누구 소유인가? (테넌트 격리)
□ 유저 입력이 들어오는가? (sanitize / validation)
□ 민감 정보가 있는가? (암호화 / 로그 제외)
□ 외부 API를 호출하는가? (API 키 관리 / 레이트 리밋)
□ 결제와 연동되는가? (Stripe 위임 / 웹훅 검증)
□ 감사 로그가 필요한가? (금융/법적 이벤트)
□ 악용 가능한가? (rate limit / captcha)
□ 권한 체크가 있는가? (RLS / 미들웨어)
```

---

## 미결 — 다음 브레인스토밍 대상

> 구현 전에 설계를 구체화해야 할 영역. 하나씩 파고들어서 리스크 사전 제거.

| # | 주제 | 핵심 질문 |
|---|------|----------|
| 1 | **Supabase 스키마 설계** | 테이블 구조, 인덱스, RLS 정책 — KV/R2와 Supabase의 역할 분담 경계 |
| 2 | **대시보드 UX 흐름** | 가입 → 첫 블로그 생성까지 몇 스텝? 온보딩 최소화 |
| 3 | **테마 구조** | 하나의 Astro SSR 앱에서 테마 전환 어떻게? 레이아웃 분기 vs 컴포넌트 분기 |
| 4 | **교차게시 실패 처리** | API 에러 시 재시도/알림 정책, 부분 성공 상태 관리 |
| 5 | **마이그레이션** | 다른 블로그(WordPress, Ghost, Medium 등)에서 이전 오는 유저 지원 방법 |

---

*최초 작성: 2026-04-16*
*전면 갱신: 2026-04-17 — Astro SSR 멀티테넌트 아키텍처 확정, 유저 설정 기능 상세 추가*
