# 7onic Blog — Documentation

> 블로그 프로젝트 문서 탐색 출발점. 작업 유형을 고르고 해당 섹션의 문서를 읽으세요.

---

## 🎯 작업 유형별 필수 읽기

| 작업 | 1순위 | 2순위 |
|------|-------|-------|
| **포스트 초안 작성** | `rules/CONTENT-RULES.md` | `state/CONTENT-PLAN.md` |
| **포스트 게시 (교차 배포)** | `state/POST-INDEX.md` | `roadmap/planned/SEO-CROSS-POSTING-PLAN.md` |
| **새 페이지 추가** | `templates/PAGE-TEMPLATE.astro` 또는 `PAGE-TEMPLATE-LIST.astro` | `../CLAUDE.md` (페이지 레이아웃 규칙) |
| **콘텐츠 기획** | `state/CONTENT-PLAN.md` (112편 계획) | — |
| **블로그 SaaS 확장 논의** | `roadmap/planned/BLOG-SAAS-PLAN.md` | `~/Documents/ai-project/docs/roadmap/planned/PROJECT-SCAFFOLD-PLAN.md` |

---

## 📁 디렉토리 지도

| 폴더 | 역할 | 언제 읽나 |
|------|------|-----------|
| `rules/` | 콘텐츠 작성 규칙 | 포스트 초안 전 |
| `state/` | 현재 게시 현황 + 콘텐츠 계획 | 게시 직후 / 다음 주제 결정 시 |
| `templates/` | 새 페이지 시작 템플릿 | 새 정적 페이지 추가 시 |
| `decisions/` | 아키텍처 결정 (ADR) | "왜?" 궁금할 때 |
| `roadmap/` | 로드맵 (active / planned / done) | 다음 작업 결정 시 |

---

## 🔁 새 문서 추가 시 결정 트리

```
Q. 종류는?
  규칙 (지켜야 할 것)           → rules/
  상태 (지금 어떤지)             → state/
  페이지/컴포넌트 템플릿         → templates/
  아키텍처 결정                  → decisions/
  할 일 / 계획                   → roadmap/{active|planned|done}/
```

---

## 🔗 관련 자원

- **루트 `CLAUDE.md`** — 블로그 프로젝트 작업 규칙 (doctype, 페이지 레이아웃 등)
- **`.claude/commands/`** — 스킬 (`/blog-new-post`, `/blog-publish`, `/blog-update`, `/blog-list`)
- **ai-project 연동**: `~/Documents/ai-project/docs/` — 결정 기록 · 완료 기능 · 토큰 예외 참조 소스

---

## 📜 변경 이력

- **2026-04-18**: ai-project와 동일한 구조화 플랜 적용 — 10 파일 재배치, 카테고리 분리.
