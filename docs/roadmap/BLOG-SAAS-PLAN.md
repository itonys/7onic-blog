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

#### 자동 게시 (API 기반)

| 플랫폼 | API | 플랜 | 지역 |
|--------|-----|------|------|
| dev.to | REST API v1 | Free+ | 영어권 |
| Hashnode | GraphQL API | Basic+ | 영어권 |
| Qiita | REST API v2 | Pro | 일본 |
| Zenn | GitHub 연동 (자동) | Pro | 일본 |

#### 수동 복사 지원 (API 미지원 플랫폼)

| 플랫폼 | API 상태 | 지원 방식 | 지역 |
|--------|---------|---------|------|
| Velog | ❌ 공식 없음 | "Copy for Velog" 버튼 → MD 클립보드 | 한국 |
| Tistory | ⚠️ 2024 deprecated | "Copy for Tistory" 버튼 → HTML 변환 후 복사 | 한국 |
| Brunch | ❌ 폐쇄 | "Copy Markdown" | 한국 |
| Medium | ⚠️ API 제한적 | "Copy Markdown" | 영어권 |

**수동 복사 UX:**
- 대시보드 포스트 상세 화면에 플랫폼별 "Copy" 버튼
- 플랫폼 규칙에 맞게 자동 변환 후 클립보드 복사:
  - Velog: MD 그대로 (Velog가 MD 지원)
  - Tistory: HTML 변환 (Tistory 에디터는 HTML 기반)
  - Medium: MD + 이미지 URL 절대경로
- 유저는 해당 플랫폼 에디터에 붙여넣기만 하면 끝 (3초 작업)
- canonical URL 자동 포함 (SEO 중복 회피)

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

## 보안 / 법령 — 공통 프레임워크 참조

> **본 섹션의 상세 내용은 ai-project 공통 참조 문서를 참고한다.**
> `~/Documents/ai-project/docs/SAAS-SECURITY-COMPLIANCE.md`

### Blog SaaS에 적용되는 섹션

Blog SaaS는 **멀티테넌트 + 결제 + 유저 데이터 전체** 서비스 → 공통 프레임워크의 **§1 ~ §5 전체** 적용.

| 섹션 | 내용 | 적용 시점 |
|------|------|----------|
| §1 | 최소 필수 5가지 | Phase 1 MVP |
| §2 | 일본 법령 (특상법 / APPI / 소비자법) | Phase 1 MVP |
| §3 | 결제 보안 (PCI-DSS / Stripe 위임) | Phase 2 (유료 결제) |
| §4 | 멀티테넌트 격리 | Phase 1 MVP |
| §5 | 데이터 생명주기 (GDPR-ready) | Phase 1 MVP |
| §6 | Phase별 보안 우선순위 | 점진적 적용 |
| §7 | 운영 리듬 (분기 체크) | 서비스 런칭 이후 |
| §8 | 새 기능 체크리스트 | 기능 추가 매번 |

### Blog SaaS 고유 사항 (공통 문서에 없는 것)

- 교차 배포 API 키 암호화 저장 (dev.to / Hashnode / Zenn)
- 유저 커스텀 도메인 SSL 관리 (Cloudflare for SaaS)
- 포스트 원본 MD + 렌더링 HTML 동시 보관 전략

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
