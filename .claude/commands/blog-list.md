# /blog-list

블로그 포스트 목록과 교차 게시 상태를 확인한다.

## 실행 순서

1. `src/content/blog/` 안의 모든 `.md` 파일 목록 확인 (`_` 제외)
2. 각 파일의 frontmatter에서 아래 정보 추출:
   - `title`, `pubDate`, `category`, `series`, `seriesOrder`, `draft`, `devtoId`, `hashnodeId`
3. 아래 형식으로 보고:

## 보고 형식

### 게시된 포스트

| # | slug | title | pubDate | category | dev.to | Hashnode |
|---|------|-------|---------|----------|--------|---------|
| 1 | slug | title | date | category | ✅/❌ | ✅/❌ |

### 드래프트

| slug | title | 비고 |
|------|-------|------|
| ... | ... | draft: true |

### 시리즈 진행 현황

- Design to Code: #1 ✅ → #2 ❌ → ...

### 요약

- 총 게시 포스트: N개
- 드래프트: N개
- dev.to 미게시: N개
- Hashnode 미게시: N개
