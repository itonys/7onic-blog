# SEO 교차배포 강화 플랜

> 상태: 기획 단계 (미착수)
> 목적: 교차배포 포스트의 구글 SEO 최적화 및 플랫폼별 검색 노출 향상
> 최초 작성: 2026-04-17
> 전제: `publish-post.ts`에 이미 `canonical_url` / `originalArticleURL` 설정됨

---

## 현재 상태 — 이미 된 것 vs 안 된 것

### ✅ 이미 구현된 SEO 기반

| 항목 | 코드 | 효과 |
|------|------|------|
| dev.to `canonical_url` | `article.canonical_url: canonicalUrl` (line 95) | Google에 원본 사이트 신호 전달 |
| Hashnode `originalArticleURL` | `originalArticleURL: canonicalUrl` (line 155) | Hashnode가 canonical rel 태그 삽입 |
| 슬러그 기반 URL | `${CANONICAL_BASE}/${slug}/` | 원본 주소 고정 |

> **핵심**: `canonical_url` 설정이 이미 되어 있으므로 구글 중복 콘텐츠 패널티는 이미 방지됨.
> 아래 3가지 기능은 **추가 최적화**다.

---

## Feature 2 — 포스트 하단 "Original Post" 링크 추가

### SEO 효과 정직한 평가

| 대상 | 효과 | 근거 |
|------|------|------|
| **구글 검색 순위** | ❌ 없음 | `canonical_url` meta tag이 이미 있음. 본문 링크는 추가 신호 미비. |
| **레퍼럴 트래픽** | ✅ 있음 | 플랫폼 독자가 원본 블로그로 유입 |
| **독자 신뢰도** | ✅ 있음 | "이 글의 원본은 여기" → 브랜드 인지 |
| **플랫폼 커뮤니티** | ✅ 있음 | dev.to/Hashnode 독자가 팬이 되면 직접 방문 |

### 구현 방식

본문 끝에 자동으로 구분선 + 출처 추가:

```markdown
---

*Originally published at [blog.7onic.design](https://blog.7onic.design/post-slug/)*
```

구글 SEO가 아닌 **레퍼럴 트래픽과 브랜드 빌딩**이 실제 목적.

### 구현 난이도

낮음 (5분). `sanitizeContent()` 또는 API 호출 전 content 문자열에 append.

---

## Feature 3 — 플랫폼별 태그(키워드) 다르게 배포

### SEO 효과 정직한 평가

| 대상 | 효과 | 근거 |
|------|------|------|
| **구글 검색 순위** | ❌ 없음 | 플랫폼 태그는 구글 크롤러에 영향 없음 |
| **플랫폼 검색/추천** | ✅✅ 높음 | dev.to와 Hashnode는 태그 기반 피드 존재. 적절한 태그 = 노출 증가 |
| **팔로우/구독** | ✅ 있음 | 태그 팔로워에게 노출 → 팔로워 증가 |

> 실제로 dev.to에서 `#webdev` `#programming` 같은 범용 태그를 쓰면 노출 폭발적으로 증가함.
> 현재 우리 블로그 태그를 그대로 쓰면 플랫폼 인기 태그와 불일치 가능.

### 현재 문제

```typescript
// 현재: 원본 태그 그대로 사용 (최대 4개 slicing만)
const tags = (fm.tags ?? []).slice(0, 4) as string[];
const devtoTags = tags.map((t) => t.replace(/-/g, ''));
```

`tailwind-v4`, `css`, `frontend` → dev.to에서 낮은 노출 (인기 태그: `webdev`, `javascript`, `programming`, `beginners`)

### 구현 방식 A — frontmatter 직접 지정 (단순)

```yaml
---
tags: [tailwind, css, frontend, design-system]   # 원본 블로그용
devto_tags: [webdev, css, javascript, programming]   # dev.to 인기 태그로 매핑
hashnode_tags: [tailwindcss, css, webdev, frontend]   # Hashnode 인기 태그
---
```

- 포스트마다 수동 지정
- 정확하지만 매번 신경 써야 함

### 구현 방식 B — 태그 자동 매핑 (권장)

`scripts/lib/tag-map.ts` 생성:

```typescript
// 우리 태그 → 플랫폼 인기 태그 매핑
const DEVTO_TAG_MAP: Record<string, string> = {
  'tailwind': 'css',
  'tailwind-v4': 'css',
  'design-system': 'webdev',
  'typescript': 'typescript',
  'nextjs': 'nextjs',
  'astro': 'javascript',
  'react': 'react',
  'frontend': 'webdev',
  'css': 'css',
  'animation': 'webdev',
};

// dev.to 범용 보완 태그 (항상 포함)
const DEVTO_BASE_TAGS = ['webdev', 'programming'];

export function mapDevtoTags(tags: string[]): string[] {
  const mapped = tags.map((t) => DEVTO_TAG_MAP[t] ?? t.replace(/-/g, ''));
  const combined = [...new Set([...DEVTO_BASE_TAGS, ...mapped])];
  return combined.slice(0, 4);  // dev.to max 4
}
```

frontmatter에서 `devto_tags` 없으면 자동 매핑. 있으면 우선.

- 구현 난이도: 중간 (30분)
- 효과: 가장 높음

---

## 구현 우선순위

| 기능 | 구글 SEO | 플랫폼 SEO | 구현 난이도 | 추천 순위 |
|------|---------|-----------|------------|----------|
| Feature 3 — 플랫폼별 태그 | ❌ | ✅✅ 높음 | 중간 | **1순위** |
| Feature 2 — Original Post 링크 | ❌ | ✅ 레퍼럴 | 낮음 | **2순위** |
| ~~Feature 1 — 플랫폼별 타이틀~~ | — | — | 자동화 불가 | **제외** |

> **구글 SEO (검색 순위)** 관점: `canonical_url`이 이미 설정된 이상 추가로 할 수 있는 것은 거의 없다.
> 세 기능 모두 구글 순위보다 **플랫폼 내 노출/레퍼럴 트래픽** 효과가 실제 목적.

---

## 구글 순위를 실제로 올리려면

현재 설정 이상으로 구글 순위를 올리는 방법:

| 방법 | 효과 | 구현 |
|------|------|------|
| **원본 블로그 로딩 속도** | ✅✅ 높음 | Core Web Vitals 개선 |
| **내부 링크 구조** | ✅ 있음 | 포스트 간 관련 링크 추가 |
| **구조화 데이터(JSON-LD)** | ✅ 있음 | BlogPosting schema 추가 |
| **포스트 길이/깊이** | ✅ 있음 | 2000자 이상 깊이 있는 글 |
| **백링크** | ✅✅ 높음 | 플랫폼에서 원본으로 링크 = 백링크 (Feature 2가 여기에 해당) |

---

## 구현 단계

### Phase 1 — Feature 2 + Feature 3 (우선, 1~2시간)

- [ ] `scripts/lib/tag-map.ts` — dev.to / Hashnode 태그 매핑 테이블
- [ ] `publish-post.ts` — `mapDevtoTags()`, `mapHashnodeTags()` 적용
- [ ] `publish-post.ts` — 본문 끝 Original Post 링크 자동 추가
- [ ] frontmatter `devto_tags` / `hashnode_tags` 있으면 우선 사용
- [ ] 기존 발행 포스트 `--update`로 재발행하여 태그 업데이트

### Phase 2 — 구조화 데이터 (선택, 1시간)

- [ ] `BlogPost.astro`에 `<script type="application/ld+json">` 추가
- [ ] BlogPosting schema: title, author, datePublished, image, url

---

## Blog SaaS 이식성

| 현재 스크립트 구현 | SaaS 재사용 |
|-----------------|-----------|
| `scripts/lib/tag-map.ts` | → `src/lib/tag-map.ts` (그대로) |
| Original Post footer 로직 | → 대시보드 설정에서 on/off 가능하게 |

---

## 관련 자산

- `scripts/publish-post.ts` — 구현 대상 스크립트
- `docs/roadmap/planned/PUBLISH-SCRIPT-HARDENING-PLAN.md` — 스크립트 강화 로드맵 (Phase 1 완료 후 SEO 기능 통합)
- `docs/roadmap/planned/BLOG-SAAS-PLAN.md` — SaaS 버전 참조
