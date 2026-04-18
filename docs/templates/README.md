# Templates — 페이지 시작 템플릿

새 정적 `.astro` 페이지 추가 시 복사해서 시작. 포스트(`.md`) 아님.

## 문서 목록

| 파일 | 패턴 | 예시 페이지 | page-top 위치 |
|------|------|-----------|--------------|
| `PAGE-TEMPLATE.astro` | **Pattern A** — 단순 콘텐츠 | about, 단순 정적 페이지 | `<main class="main-content page-top">` |
| `PAGE-TEMPLATE-LIST.astro` | **Pattern B** — 목록 + 헤더 | 커스텀 리스트 페이지 | `<div class="page-header page-top">` (main 안) |

> 동적 라우트(`/series/[id]`, `/category/[id]`)는 템플릿 불필요 — `src/consts.ts`에 항목 추가하면 자동 생성.

## 파일 추가 기준

- **Yes**: 여러 페이지에서 반복되는 레이아웃 구조
- **No**: 단일 페이지 고유 레이아웃 → 해당 페이지에 직접 작성

## 관련 자원

- `../../CLAUDE.md` — 페이지 레이아웃 규칙 전반 (`<!doctype html>`, `.page-wrapper` width, Sidebar 등)
