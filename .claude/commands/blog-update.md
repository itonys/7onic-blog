# /blog-update

기존 블로그 포스트를 수정하고 배포한다.

## 실행 순서

1. `src/content/blog/[slug].md` Read
2. 유저가 요청한 수정사항 적용
3. `updatedDate` frontmatter 오늘 날짜로 업데이트
4. 유저 검토 후 → 허락 시 아래 실행:

```bash
git add src/content/blog/[slug].md
git commit -m "update: [변경 내용 요약]"
git push origin main
```

### 교차 게시 업데이트
```bash
npm run publish-post -- "[slug]" --update
```

## 주의

- `updatedDate`는 수정 시 항상 갱신
- 큰 내용 변경 시 dev.to / Hashnode도 함께 업데이트
- 커밋·푸시는 반드시 유저 허락 후
