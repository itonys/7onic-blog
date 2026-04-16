# /blog-publish

블로그 포스트를 배포한다. git push (Vercel 자동 배포) + dev.to + Hashnode 교차 게시.

## 실행 전 체크리스트

1. `src/content/blog/[slug].md` 파일 Read
2. 아래 항목 확인 후 문제 있으면 중단하고 유저에게 보고:
   - [ ] `draft: false` 인지 확인
   - [ ] `title` 60자 이내
   - [ ] `description` 120~160자
   - [ ] `tags` 3~5개
   - [ ] `category` 유효한 값
   - [ ] `pubDate` 날짜 형식 정확
   - [ ] 시리즈 포스트면 `series` + `seriesOrder` 있는지

## 실행 순서

### Step 1 — git push (Vercel 자동 배포)
```bash
git add src/content/blog/[slug].md
git commit -m "post: [title]"
git push origin main
```

### Step 2 — 교차 게시
```bash
npm run publish-post -- "[slug]"
```
> 스크립트 미구현 시: 유저에게 dev.to / Hashnode 수동 게시 안내

### Step 3 — 완료 보고
- `blog.7onic.design/[slug]` URL 안내
- dev.to / Hashnode 게시 URL (교차 게시 시)

## 주의

- 유저 명시적 허락 없이 커밋·푸시 금지
- canonical URL은 항상 `blog.7onic.design` 기준
