# /blog-new-post

블로그 포스트 초안을 작성하고 Markdown 파일로 생성한다. 단순 요약이 아니라 **한 사람이 쓴 개인 블로그**로 읽히게 한다.

---

## ⛔ 품질 3대 원칙 (절대 금지)

| # | 원칙 | 위반 시 |
|---|------|--------|
| 1 | **데이터 창작·과장·추측 금지** — 숫자·날짜·버전·사건·결정은 반드시 ai-project 문서에서 근거를 찾아 인용. "아마", "대략", "많은 사람이" 같은 모호한 표현 금지 | 초안 폐기, 근거 확보 후 재작성 |
| 2 | **AI 냄새 제거** — `docs/CONTENT-RULES.md`의 Voice & Tone 섹션 12가지 금지 패턴 준수. 깔끔한 병렬 반복, "Here's the thing:", 균일한 문장 품질, 분산된 자기비하, 완벽한 결론 등은 즉시 AI 시그널 | 해당 문단 재작성 |
| 3 | **설명형·광고형 금지** — 인디 개발자가 혼자 겪은 과정을 스토리로. 결과 나열·기능 설명·CTA 조합은 마케팅 카피 | 구조 재설계 |

> 이 3원칙은 체크리스트(하단)에서 자기 검증하고 보고에 결과를 명시한다.

---

## 실행 순서

1. **(필수) ai-project 결정 기록 Read** — 주제 관련 사실 확보:
   - `~/Documents/ai-project/docs/decisions/DECISIONS-INDEX.md` — 아키텍처 결정 인덱스
   - `~/Documents/ai-project/docs/COMPLETED-FEATURES-INDEX.md` — 무엇이 언제 구현됐는지
   - `~/Documents/ai-project/docs/roadmap/DEPLOY-PLAN.md` — 배포 타임라인
   - `~/Documents/ai-project/docs/TOKEN-EXCEPTIONS-INDEX.md` — 현실과 타협한 예외
   - `~/Documents/ai-project/CHANGELOG.md` + `cli/CHANGELOG.md` — 릴리즈 순서·날짜·이유
   - 주제에 해당하는 개별 결정 파일이 있다면 `~/Documents/ai-project/docs/decisions/*.md` Read
2. **(필수) Voice & Tone 규칙 Read** — `docs/CONTENT-RULES.md`의 Voice & Tone 섹션 전체
3. **(필수) 톤 레퍼런스 Read** — `src/content/blog/why-i-built-7onic.md` 1회. 이 포스트의 리듬·문장 길이 변주·괄호 속 사족·자기 의심 표현이 기준
4. **주제 ↔ 결정 기록 교차 확인** — 유저가 제공한 키포인트가 문서에 실제로 있는지 검증. 없으면 유저에게 근거 요청, 추측으로 채우지 않는다
5. **(필수 게이트) Hot take 한 줄 선언** — 하단 "Hot Take 선언" 섹션 참고. **유저 승인 전 본문 작성 금지**
6. 새 시리즈면 `src/consts.ts` SERIES 배열에 추가
7. `src/content/blog/[slug].md` 생성

---

## Hot Take 선언 (초안 전 필수 게이트)

독자를 끌어들이는 건 구조가 아니라 **관점**이다. 초안에 들어가기 전, 이 글의 hot take 한 줄을 유저에게 먼저 보고하고 **승인받는다**. 약한 hot take면 유저가 거절하거나 주제를 다시 잡는다.

### Hot take 판정 기준

| 약함 (탈락) | 강함 (통과) |
|-------------|-------------|
| 7onic is a design system | I stopped filing Figma comments and just wrote the components |
| Figma tokens are better than hardcoding | I spent a weekend on Style Dictionary and threw it out |
| Tailwind v4 has some new features | The reason we jumped to v4 had nothing to do with the new syntax |
| Our CI uses npm ci now | We reversed our own CI decision after npm got supply-chain-attacked |

- **탈락 시그널**: 주제 공표 · 일반론 · 제품 소개 · "장점 설명" 형
- **통과 시그널**: 1인칭 · 구체적 행동/포기/뒤집음 · 반직관적이거나 논쟁적 · 독자가 "왜?"를 묻고 싶어짐

### 보고 형식 (유저에게)

```
Hot take 제안: "..."
근거 문서: [DECISIONS-INDEX / CHANGELOG / CONTENT-PLAN의 어느 항목]
승인하시면 초안 진행합니다.
```

---

## 톤 & 보이스 — 인디 개발자 개인 블로그

**지향**: 혼자 만드는 개발자가 금요일 밤 GitHub 이슈 쓰듯 솔직하게 쓴 글. 기쁨·피로·의심·뿌듯함·답답함이 다 나온다.

**회피**: 기업 블로그, 컨설팅 톤, 튜토리얼 요약, 제품 소개서.

### 필수 요소 (최소 3개 이상 포함)

- **구체적 순간·장면** — 날짜, 그때 뭘 보고 있었는지, 어떤 기분이었는지
- **실패·오류·잘못된 판단** — 처음에 이렇게 했는데 틀렸다. 원복했다
- **뒤집은 결정** — `CI-PUBLISH-WORKFLOW` 2026-04-17 뒤집힘 같은 실제 기록
- **자기 의심** — "이게 맞는지 이틀 고민", "솔직히 처음엔 틀렸다"
- **감정의 불균일** — 한 섹션은 집요하게 파고, 한 섹션은 3줄로 쳐낸다. 고른 길이 = AI
- **괄호 속 사족** — 본문에서 벗어나는 짧은 부연. 완벽하게 정리하려는 충동 억제
- **유머는 건조하게** — 자기 상황을 관찰하듯. 농담하듯 설명하면 싸구려

### 바로 피해야 할 문장들

- "In this post, we'll explore..." / "Let's dive in" / "Here's the thing:"
- "No X. No Y. No Z." 3박자 병렬
- "The model is better. Debugging is clearer. color-mix killed a burden." 같은 결론형 3연타
- "If you've ever X, you're in the right place" 류 초대장 마무리

---

## 스토리 구조 (권장 아크)

완벽한 해결 선언 금지. 아래 흐름 중 하나를 따르되, 각 단계 길이는 불균일하게.

```
구체적 순간 (언제, 뭘 보고 있었나)
  ↓
문제 인식 (처음엔 이게 문제인 줄 몰랐다)
  ↓
시도 → 실패 → 우회
  ↓
현재 판단 (이게 맞는지 아직 모른다, 지금까진 이렇게 쓰고 있다)
  ↓
열린 결말 또는 다음에 고민할 것
```

- 모든 포스트를 같은 템플릿으로 찍어내면 AI. 어떤 포스트는 긴 도입부 + 짧은 본문, 어떤 포스트는 바로 코드부터 시작.
- "Conclusion" 섹션이 반드시 필요한 건 아니다. 열린 결말 허용.

---

## 데이터 인용 원칙

- **버전·날짜·숫자는 구체적으로** — "최근" ❌ → "2026-04-17" ✅. "컴포넌트 많이" ❌ → "42개" ✅. "버전 올림" ❌ → "v0.2.7" ✅
- **결정의 "왜"는 DECISIONS-INDEX에서 그대로** — 의역하되 사실을 비틀지 않는다
- **없는 사건은 만들지 않는다** — "그때 트위터에서 반응이 좋았다" 같은 문장은 실제 있지 않으면 금지
- **뒤집힌 결정은 숨기지 않는다** — `CI-PUBLISH-WORKFLOW` 처럼 과거 결정이 뒤집혔다면 그게 포스트의 핵심 소재가 될 수 있다. 깔끔한 서사보다 진짜 서사

---

## 초안 작성 기준

- **모델**: Opus 권장
- **언어**: 영어. **네이티브가 쓴 것처럼** 읽혀야 함 — 번역투·교과서 영어 금지
- **길이**: 1200~2000 단어 (주제에 따라 유연)
- `docs/CONTENT-RULES.md` 전체 규칙 준수

---

## Frontmatter 자동 생성

유저가 별도로 지정하지 않으면 AI가 판단:
- `title`: 60자 이내 — 광고형 제목 금지. 구체성·호기심 우선 ("Why I Built 7onic", "What Actually Changed in Tailwind v4")
- `description`: 120~160자 — 결과 나열 대신 여정의 한 순간
- `tags`: 3~5개
- `category`: 내용에 맞는 것
- `draft: true`
- `pubDate`: 빈 값 (`/blog-publish` Step 0에서 주입)

---

## 오프닝 3문단 특별 검증

**독자의 80%는 오프닝에서 스크롤 이탈한다.** 초안 완성 후 첫 3문단만 따로 떼서 아래 3가지 기준을 만족하는지 확인한다. 하나라도 탈락하면 오프닝만 재작성. 본문이 아무리 좋아도 오프닝이 약하면 안 읽힌다.

### 기준 3가지

1. **첫 문장 = 장면·순간·기억·고유명** — 선언·정의·주제 공표는 탈락
   - ❌ "Design systems are essential for consistency."
   - ❌ "In this post, I'll explain why I built 7onic."
   - ✅ "I remember the exact moment I gave up on handoffs."
2. **구체적 디테일 최소 1개** — 3문단 안에 숫자/날짜/파일명/사람/도구명 중 하나 이상
   - ❌ "At some point, things started drifting."
   - ✅ "The spacing was off by 2 pixels. The border radius was `8px` instead of `6px`."
3. **긴장·의문·아이러니** — 독자가 "그래서?" · "왜?" · "이상한데?" 를 느끼게 하는 요소
   - ❌ 모든 문장이 서술적이고 평온함
   - ✅ "I left a Figma comment. It got fixed in the next sprint. Then the same thing happened on the next component. And the next one. For ten years."

> 이 검증은 하단 체크리스트보다 먼저 수행한다.

---

## 완료 전 자기 검증 체크리스트

초안 저장 직전 AI가 스스로 7가지를 체크하고 보고에 결과 포함:

- [ ] **Hot take** — 유저가 승인한 hot take가 글에서 명확히 드러나는가?
- [ ] **Fact** — 모든 숫자·날짜·버전·사건이 ai-project 문서에서 나왔는가? (만든 것 없음)
- [ ] **AI smell** — 금지 패턴 12개 중 하나도 걸리지 않는가? (특히 병렬 3박자, "Here's the thing", 균일 문장)
- [ ] **Story** — 구체적 순간으로 시작했는가? 실패·의심·뒤집음이 들어갔는가?
- [ ] **Voice** — "I"로 말하고 있는가? 기업 블로그 톤이 섞이지 않았는가?
- [ ] **Length variation** — 섹션별 길이가 균일하지 않은가? 코드 없는 섹션도 섞였는가?
- [ ] **Opening 3문단** — 위 "오프닝 3문단 특별 검증" 3가지 기준 모두 통과했는가?

---

## 완료 후 보고

- 생성된 파일 경로
- frontmatter 요약 (title, description, category, tags)
- **Hot take 한 줄** — 유저가 승인한 버전 그대로 명시
- **인용 근거 요약** — 어느 문서의 어느 결정·버전·날짜를 썼는지 리스트 (예: "DECISIONS-INDEX의 CI-PUBLISH-WORKFLOW 뒤집힘 2026-04-17 인용", "CHANGELOG v0.2.7 참조")
- **오프닝 3문단 검증 결과** — 3가지 기준 각각 통과 여부
- **체크리스트 결과** — 7개 항목 각각 통과/보류 + 보류 이유
- 유저가 검토·수정할 포인트
- 확정되면 `draft: false` 변경 → `/blog-publish` 실행 안내
