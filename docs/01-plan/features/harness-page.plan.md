# Plan: Harness Engineering Page

## Executive Summary

| Feature | harness-page |
|---------|-------------|
| Started | 2026-03-30 |
| Duration | Single session |

### Value Delivered

| Perspective | Description |
|-------------|-------------|
| **Problem** | 포트폴리오에 AI 하네스 엔지니어링 역량을 보여줄 메뉴가 없음 |
| **Solution** | NPC 메뉴에 "Harness" 항목 추가 + 전용 Scene으로 흐름도 표시 |
| **Function UX Effect** | 메뉴 선택 시 NPC 대화 -> 하네스 아키텍처 흐름도를 pretext 기반 타이포그래피로 표현 |
| **Core Value** | AI 코딩 에이전트의 구조적 품질 관리 접근법을 시각적으로 전달 |

---

## 1. Background

`~/.claude` 하위에 구성한 하네스 엔지니어링은 3-Tier Commander Pattern 기반의 AI 에이전트 오케스트레이션 시스템이다.

### 하네스 구성 요소 (회사정보 제외, 흐름만)

**Commander Procedure (5-Step)**:
1. **Plan + Design** - Opus가 직접 설계 문서 작성
2. **Dispatch** - Sonnet(Frontend) + Codex(Backend) 병렬 실행
3. **Cross-Evaluate** - 각자 만든 코드를 상대편이 검수
4. **Fix** - 문제 발견 시 수정 -> 재검수 (최대 3회)
5. **Merge + Commit** - 양쪽 검증 통과 후 통합

**Harness Design Principles**:
- Generator-Evaluator Separation: 자기 코드를 자기가 평가하지 않는다
- Runtime Evaluator: Playwright/curl로 실제 실행 검증
- Session Continuity: HANDOFF.md 기반 컨텍스트 이관
- "적게 넣어라" 원칙: 모델이 못하는 것만 구조화

**Task Router**:
- Opus: 설계/아키텍처/고위험 결정
- Sonnet: 프론트엔드 구현
- Codex: 백엔드 API/알고리즘
- Evaluator subagent: 교차 검수

**Reasoning First**:
- 추론(Design)과 구현(Implementation) 분리
- 구현 중 재결정 금지

---

## 2. Goal / Non-goals

### Goal
- NPC 메뉴에 "Harness" 항목 추가
- 메뉴 선택 시 하네스 엔지니어링 흐름을 시각적으로 표현하는 Scene
- pretext(`@chenglou/pretext`) 적용하여 텍스트 레이아웃 최적화
- 회사/개인정보 없이 순수 아키텍처 흐름만 보여줌

### Non-goals
- 실제 코드나 파일 내용 노출
- 외부 링크/GitHub 연동
- 편집/인터랙티브 데모

---

## 3. Scope

### 변경 파일 (예상 5개 미만)
1. `src/app/page.tsx` - MENU_ITEMS에 harness 추가 + HarnessScene 컴포넌트
2. `package.json` - `@chenglou/pretext` 의존성 추가

### 구현 내용

**메뉴 항목**:
```typescript
{ id: "harness", tag: "Engineering", label: "AI Harness", desc: "에이전트 오케스트레이션", url: null, action: "harness" }
```

**HarnessScene**: selfIntro와 유사한 패턴으로 새 Scene
- NPC 대사: 하네스 엔지니어링 소개 멘트
- 흐름도 영역: Commander Procedure 5-Step을 시각적으로 표현
- pretext로 텍스트 측정/레이아웃 처리
- 돌아가기 버튼

**흐름도 구성**:
```
[Opus: Plan + Design]
        |
   ┌────┴────┐
   v         v
[Sonnet]  [Codex]    <- Dispatch (병렬)
   |         |
   v         v
[Cross-Evaluate]     <- 상대편이 검수
        |
   [Fix x3]          <- 최대 3회 반복
        |
  [Merge + Commit]
```

**Harness Principles 표시**:
- Generator ≠ Evaluator (자기 코드 자기 평가 금지)
- Runtime Eval (실행 기반 QA)
- "적게 넣어라" (최소 구조)

---

## 4. pretext 적용 계획

`@chenglou/pretext`를 사용하여:
- 흐름도 텍스트의 정확한 측정 및 레이아웃
- DOM reflow 없이 빠른 텍스트 배치
- Canvas 기반 또는 절대 위치 배치로 흐름도 렌더링

적용이 복잡하거나 번들 크기가 과도하면 CSS 기반 대안을 고려.

---

## 5. Technical Notes

- Scene 타입에 `"harness"` 추가 (`type Scene = "main" | "selfIntro" | "selfIntroDetail" | "harness"`)
- VideoState는 harness scene에서 `idle` 유지 (별도 비디오 없음)
- 기존 NPC 대화 UI 패턴 재사용 (TypeWriter + dialogue-gradient)
