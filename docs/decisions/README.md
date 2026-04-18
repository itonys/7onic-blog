# Decisions — 아키텍처 결정 (ADR)

블로그 구현 과정의 의도적 선택 기록.

## ADR 목록

| 번호 | 파일 | 주제 |
|------|------|------|
| 001 | `001-mobile-overflow-fix.md` | 모바일 가로 스크롤 방지 (`<!doctype html>` 누락 → quirks mode 버그) |
| 002 | `002-post-navigation.md` | 포스트 이전/다음 네비게이션 (시리즈 vs 날짜 기준) |

## 파일 추가 기준

새 ADR 작성 조건:

- **Yes**: 의도적 선택, 다른 옵션도 실제 고려, "왜 이렇게 했지?" 나중에 물을 가능성 있음
- **No**: 단순 구현, 버그 수정 (커밋 메시지로 충분)

**네이밍**: `NNN-kebab-case-topic.md` (`003-og-palette-hash.md` 같은 형식)

## 관련 폴더

- `../rules/` — 결정이 규칙화된 것 (예: CONTENT-RULES)
- `../roadmap/` — 결정이 계획으로 이어진 것
