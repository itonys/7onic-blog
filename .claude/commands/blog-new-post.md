# /blog-new-post

블로그 포스트 초안을 작성하고 Markdown 파일로 생성한다.

## 실행 순서

1. `docs/CONTENT-RULES.md`를 Read 도구로 읽는다.
2. `src/content/blog/` 안의 기존 포스트 파일들을 확인해 시리즈 순서, 태그 패턴, 파일 네이밍을 파악한다.
3. 유저가 제공한 주제/키포인트를 바탕으로 포스트 초안을 작성한다.
4. `src/content/blog/[slug].md` 파일을 생성한다.

## 초안 작성 기준

- **언어**: 영어
- **톤**: 엔지니어 친화적, 직설적, 실용적 — 플러프 없이
- **길이**: 1200~2000 단어 권장
- CLAUDE.md 콘텐츠 규칙 전체 준수

## Frontmatter 자동 생성

유저가 별도로 지정하지 않으면 AI가 판단:
- `title`: 주제 기반 60자 이내
- `description`: 120~160자 SEO 최적화
- `tags`: 3~5개 관련 태그
- `category`: 내용에 맞는 카테고리
- `draft: true` (기본값 — 유저 검토 후 false로 변경)
- `pubDate`: 오늘 날짜

## 완료 후 보고

- 생성된 파일 경로
- frontmatter 요약 (title, description, category, tags)
- 유저가 검토·수정할 포인트 안내
- 확정되면 `/blog-publish` 실행 안내
