# publish-post.ts 강화 로드맵

> 상태: 기획 단계 (미착수)
> 목적: 현재 Happy Path만 있는 교차게시 스크립트를 BACKEND-RULES §1 준수하도록 개선
> 최초 작성: 2026-04-18
> 근거 문서: `~/Documents/ai-project/docs/rules/shared/BACKEND-RULES.md`
> **Phase M 통합 (2026-04-20)**: 본 플랜은 `~/Documents/ai-project/docs/roadmap/planned/MICRO-SAAS-ENGINE-PLAN.md` **Phase M-2 공통 lib 프로토타입**. 여기서 만드는 `scripts/lib/http-client.ts` · 구조화 logger · 에러 타입 계층이 Phase M-3 PROJECT-SCAFFOLD-PLAN §5 공통 lib 4종의 **첫 실증 구현체**. 블로그 프로젝트에서 먼저 검증한 뒤 스캐폴드 CLI에 승격.

---

## 현재 상태 — Happy Path 위반

`scripts/publish-post.ts` (215줄) 분석 결과:

| BACKEND-RULES 항목 | 현재 | 위반 |
|-------------------|------|------|
| §1.1 Timeout 명시 | ❌ 없음 | `fetch` 기본 timeout은 무한 |
| §1.2 Retry with Backoff | ❌ 없음 | 일시적 5xx에도 즉시 실패 |
| §1.3 에러 분류 | ❌ 없음 | 400과 500 동일 처리 |
| §1.4 Circuit Breaker | ❌ 없음 | API 다운 시 계속 시도 |
| §1.5 Idempotency Key | ⚠️ 일부 | `devtoId`로 중복 방지만 |
| §1.6 Rate Limit 대응 | ❌ 없음 | 429 받으면 그냥 실패 |
| §1.8 공통 클라이언트 | ❌ 없음 | raw `fetch` 2곳 |
| §1.10 Observability | ⚠️ 일부 | `console.log`만, 구조화 X |
| §3 에러 처리 | ❌ 없음 | try/catch 부재 |

**실제 사용자 경험 문제:**
- API 느림 → 스크립트 무한 대기
- 일시적 503 → 즉시 실패, 수동 재실행 필요
- 네트워크 끊김 → 에러 메시지만 보고 추측
- Rate limit → 알 수 없이 게시 실패

---

## 개선 목표

### 1. 공통 HTTP 클라이언트 프로토타입 구축

`scripts/lib/http-client.ts` 생성. BACKEND-RULES §1 전체 준수:

- Timeout (AbortController)
- Exponential backoff retry
- 재시도 대상 분류 (transient vs permanent)
- Rate limit 대응 (Retry-After 헤더)
- Circuit breaker (5회 연속 실패 시 30초 open)
- Idempotency Key 자동 주입
- 구조화 로그 (단계별 진행 상황)

### 2. 에러 타입 계층

`scripts/lib/errors.ts` 생성. BACKEND-RULES §3 준수:

- `PublishError` (베이스)
- `TransientError` (재시도 대상)
- `PermanentError` (즉시 실패)
- `RateLimitError` (Retry-After 처리)

### 3. `publish-post.ts` 리팩토링

- 공통 클라이언트 통해서만 API 호출
- 각 플랫폼별 Adapter 분리 (`adapters/devto.ts`, `adapters/hashnode.ts`)
- 실패 시 상세 로그 + 재시도 안내
- 부분 성공 처리 (dev.to만 성공, Hashnode 실패 → 재시도 가능하도록)

---

## Blog SaaS 이식성

**이 개선이 Blog SaaS의 공통 자산이 된다.**

| 현재 스크립트 | Blog SaaS 재사용 |
|------------|----------------|
| `scripts/lib/http-client.ts` | → `src/lib/http-client.ts` (그대로) |
| `scripts/lib/errors.ts` | → `src/lib/errors.ts` (그대로) |
| `scripts/adapters/devto.ts` | → `src/infrastructure/api/devto.client.ts` |
| `scripts/adapters/hashnode.ts` | → `src/infrastructure/api/hashnode.client.ts` |

**즉, 이 개선 = Blog SaaS 백엔드 기초 공사를 미리 하는 셈.**

---

## 구현 단계

### Phase 1 — 기초 인프라 (2~3시간)

- [ ] `scripts/lib/http-client.ts` — Timeout + Retry + 에러 분류
- [ ] `scripts/lib/errors.ts` — 에러 타입 계층
- [ ] `scripts/lib/logger.ts` — 구조화 로그 (JSON Lines)

### Phase 2 — Adapter 분리 (1~2시간)

- [ ] `scripts/adapters/devto.ts` — dev.to 전용 어댑터
- [ ] `scripts/adapters/hashnode.ts` — Hashnode 전용 어댑터
- [ ] 각 어댑터가 공통 클라이언트 사용

### Phase 3 — publish-post.ts 리팩토링 (1시간)

- [ ] 어댑터 사용으로 전환
- [ ] 에러 발생 시 상세 로그 + 재시도 가이드
- [ ] 부분 성공 처리 (한 플랫폼 실패해도 다른 플랫폼 결과 보존)

### Phase 4 — 회귀 테스트 (30분)

- [ ] 기존 포스트 재발행 테스트 (idempotency 검증)
- [ ] 고의 실패 시나리오 테스트 (잘못된 API 키, 존재 안 하는 엔드포인트)
- [ ] Rate limit 시뮬레이션 (폭풍 실행)

### Phase 5 — Circuit Breaker (선택, 2시간)

- [ ] 5회 연속 실패 시 30초 open
- [ ] Half-open 상태에서 1회 시도 후 재평가

> Circuit Breaker는 단발성 스크립트에서는 과할 수 있음. Blog SaaS 이식 시 필수.

---

## 품질 기준

### 필수

- ✅ 모든 외부 API 호출이 공통 클라이언트 경유
- ✅ 어떤 실패 상황에도 **유저에게 명확한 피드백**
- ✅ 일시 에러 시 자동 재시도 (최대 3회)
- ✅ 영구 에러 시 즉시 실패 + 원인 표시
- ✅ Rate limit 시 Retry-After 존중

### 출력 예시 (목표)

```
[2026-04-18 22:15:32] publish-post.ts started
  post: tailwind-v4-migration-what-actually-changed
  platforms: dev.to, hashnode

[22:15:33] [dev.to] POST /api/articles (attempt 1/3)
[22:15:34] [dev.to] ✓ 201 Created (id: 3515176, duration: 892ms)
[22:15:34] [hashnode] POST gql.hashnode.com (attempt 1/3)
[22:15:35] [hashnode] ⚠ 503 Service Unavailable, retrying in 1s
[22:15:36] [hashnode] POST gql.hashnode.com (attempt 2/3)
[22:15:37] [hashnode] ✓ 200 OK (id: 69e2132c, duration: 1240ms)

[22:15:37] Summary:
  dev.to:   ✓ 게시 완료 https://dev.to/7onic/...
  hashnode: ✓ 게시 완료 https://7onic.hashnode.dev/...

Total: 5.1s
```

**vs 현재:**
```
Publishing to dev.to...
Done.
Publishing to hashnode...
Done.
```
(timeout/retry/실패 시나리오 정보 전혀 없음)

---

## 실행 우선순위

| 우선순위 | 근거 |
|---------|------|
| 🔴 높음 | 교차게시는 이미 사용 중, 실패 시 수동 복구 귀찮음 |
| 🟡 중간 | Blog SaaS 구현 전에 끝내면 이식성 높음 |
| 🟢 낮음 | 현재 사용 빈도가 낮으면 Blog SaaS 시점에 통합 |

**실제 착수 판단 기준:**
- 최근 1~2개월간 교차게시 실패 경험 있음? → 🔴
- Blog SaaS 착수가 2주 이내? → 🟡 (통합 진행)
- 둘 다 아님? → 🟢 (현재 스크립트 유지)

---

## 관련 자산

- `~/Documents/ai-project/docs/rules/shared/BACKEND-RULES.md` §1, §3, §10 준수 대상
- `~/Documents/ai-project/docs/roadmap/planned/PROJECT-SCAFFOLD-PLAN.md` 공통 lib/http-client.ts 프로토타입 참조
- `~/Documents/7onic-blog/docs/roadmap/planned/BLOG-SAAS-PLAN.md` 교차배포 아키텍처 목표

---

## 미결

- [ ] Circuit Breaker 단발성 스크립트에 적용할지 결정
- [ ] 로그 파일로 저장 여부 (현재는 stdout만)
- [ ] Dead Letter 큐 개념 도입 (Blog SaaS 이식 시 필수, 스크립트에선 과함)
- [ ] Qiita / Zenn Adapter 추가 시점 (SaaS 이식 전에 추가하면 이식 쉬움)
