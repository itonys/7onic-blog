# Roadmap — 블로그 프로젝트 로드맵

블로그 인프라·SEO·SaaS 확장 계획.

---

## 📊 현황 (2026-04-20)

| 상태 | 수 | 폴더 |
|------|----|------|
| ⚙️ 진행 중 | 0 | `active/` |
| 📋 계획 | 3 | `planned/` |
| ✅ 완료 | 0 | `done/` |

블로그 K-1~K-6 런칭 완료는 ai-project `roadmap/done/BLOG-PLAN.md`에 통합 기록.

> **ai-project Phase M 연계 (2026-04-20)**: `PUBLISH-SCRIPT-HARDENING-PLAN`은 ai-project `MICRO-SAAS-ENGINE-PLAN` **Phase M-2 공통 lib 프로토타입**으로 지정됨. `BLOG-SAAS-PLAN`은 Phase M-4 본인 마이크로 SaaS 포트폴리오의 2번째 후보. 상세: ai-project `docs/decisions/ROADMAP-RESTRUCTURE-2026-04-20.md`

---

## 📋 Planned (미착수)

| 파일 | 내용 | 착수 조건 |
|------|------|-----------|
| `planned/SEO-CROSS-POSTING-PLAN.md` | 교차배포 SEO 강화 (Original Post 링크, 메타 보강) | 기획 확정 후 |
| `planned/PUBLISH-SCRIPT-HARDENING-PLAN.md` | `publish-post.ts` 강화 (타임아웃/재시도/에러 계층). **ai-project Phase M-2 공통 lib 프로토타입** | ai-project BACKEND-RULES §1·§3·§10 적용 시 / Phase M-2 착수 시 |
| `planned/BLOG-SAAS-PLAN.md` | 블로그 → SaaS 확장 (장기 비전). **ai-project Phase M-4 포트폴리오 2번째 후보** | 개인 블로그 누적 데이터 확보 후 |

---

## 🔁 상태 전환 규칙

| 전환 | 조건 |
|------|------|
| `planned/` → `active/` | 착수 결정 시 (유저 승인 후) |
| `active/` → `done/` | 모든 Phase ✅ 완료 시 |
| `done/` 유지 | 참조용 아카이브 |

## 파일 추가 기준

| 상태 | 폴더 |
|------|------|
| 신규 아이디어 · 기획 완료 | `planned/` |
| 착수 확정 · 구현 중 | `active/` |
| 완료 | `done/` |

## 관련 자원

- `~/Documents/ai-project/docs/roadmap/` — 디자인 시스템 로드맵 (BACKEND-RULES, PROJECT-SCAFFOLD 등 참조)
- `../state/CONTENT-PLAN.md` — 콘텐츠 계획 (로드맵과 별개)
