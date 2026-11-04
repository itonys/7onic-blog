# Velog 한국어판 규칙

> 영문 블로그 글을 공개하면 같은 글의 한국어판을 Velog (`velog.io/@henotony`) 시리즈 「디자인 시스템 만들기」 에 올린다. 번역이 아니라 Velog 독자에게 맞게 **다시 쓴다**. 숫자 · 날짜 · 사건은 영문 원문 그대로 (새 사실 추가 금지).
> 최초 작성: 2026-11-04 (#15 ~ #19 를 쓰며 정리)

## 1. 파일

- 위치: `velog/NN-<영문 slug>.md` — `NN` = 시리즈 번호 (다음 번호는 `npm run velog` 마지막 줄)
- frontmatter (스크립트가 읽음):

```yaml
---
number: 20
title: "#20 제목"
series: "디자인 시스템 만들기"
tags:
  - "7onic"
  - "..."            # 3~5개
description: "Velog 소개 칸 (150자 안쪽)"
source: https://blog.7onic.design/<slug>/
velogUrl:            # 올린 뒤 채움
postedAt:            # 올린 뒤 채움 (YYYY-MM-DD)
---
```

- frontmatter 아래가 Velog 본문 칸에 그대로 붙여 넣는 내용

## 2. 본문 형식 (기존 #1 ~ #19 기준)

- 첫 줄: `# [회고 종류] 제목` — 예: `[API 회고]` `[배포 회고]` `[MCP 회고]` `[AI 회고]` `[회고]`. Velog 제목 칸의 제목과 달라도 됨 (더 길고 구체적으로)
- 첫 문단: "안녕하세요, 디자인 시스템 [7onic](https://7onic.design)을 만들고 있는 개자이너입니다."
- 문체: 합니다체. 장난스러운 회고 톤 (괄호 속 사족 · 자조 허용). 영문판의 Voice & Tone 원칙 (`CONTENT-RULES.md`) 을 한국어로 적용
- 섹션 사이: 빈 줄 + `<br />` + 빈 줄
- 코드 블록 · 표는 영문판과 같게. 영어 인용문은 그대로 두고 필요하면 바로 아래에 괄호로 뜻
- 영문 블로그 다른 글을 가리키는 링크는 **전체 주소** (`https://blog.7onic.design/<slug>/`)
- 끝맺음 (고정):

```md
### [7onic](https://7onic.io/) · [Design System](https://7onic.design/)
본 글은 본인의 7onic 영문 원문 [블로그 글](https://blog.7onic.design/<slug>/)을 한국어로 다시 쓴 것입니다.
```

- 회사 · 동료가 특정될 단서는 영문판과 같은 기준으로 뺀다

## 3. 올리는 법 (유저)

1. `npm run velog -- <번호>` → 제목이 클립보드에 → Velog 제목 칸에 붙여넣기 → Enter → 본문이 클립보드에 → 본문 칸에 붙여넣기
2. 터미널에 나온 시리즈 · 태그 · 소개를 각 칸에 입력
3. 올린 뒤 알려 주면 AI 가 Velog 공개 목록으로 확인하고 `velogUrl` · `postedAt` 을 채운다

부분만 다시 복사: `--title` · `--body`
