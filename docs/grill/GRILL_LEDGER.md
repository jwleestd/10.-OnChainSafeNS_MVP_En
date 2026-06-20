RESOLVED: 10 / TOTAL: 10
- [x] T1 | CORE  | Phase-0 첫 화면/주요 UX 진입 구조 확정 | depends:- | status:RESOLVED | decision:`/`는 랜딩 페이지 + 핵심 기능 3종 CTA로 유지하고 기능 실행은 별도 라우트에서 수행 | applied:docs/0.PRD_v1_opus46_fn.md, docs/0.SRS_v1opus46_fn.md, AGENTS.md
- [x] T2 | CORE  | Phase-0 사용자 인증 UX 범위 확정 | depends:T1 | status:RESOLVED | decision:랜딩은 공개, 기능 소개·실행 페이지와 lookup/resolve 포함 기능 API는 이메일 인증 후 진행 | applied:docs/0.PRD_v1_opus46_fn.md, docs/0.SRS_v1opus46_fn.md, AGENTS.md
- [x] T3 | CORE  | Safe-Name 등록/리졸브/데모 이체의 화면 결합 방식 확정 | depends:T1 | status:RESOLVED | decision:`/safe-name`은 등록 → 리졸브 확인 → 데모 이체 순차 Wizard로 구성 | applied:docs/0.PRD_v1_opus46_fn.md, docs/0.SRS_v1opus46_fn.md, AGENTS.md
- [x] T4 | CORE  | 사기 조회 후 신고 전환 UX 확정 | depends:T1 | status:RESOLVED | decision:조회 결과 카드의 "이 주소 신고하기" 액션으로 신고 영역에 진입하고 주소·체인을 프리필 | applied:docs/0.PRD_v1_opus46_fn.md, docs/0.SRS_v1opus46_fn.md, AGENTS.md
- [x] T5 | CORE  | 운영자 승인 대시보드의 최소 검토 정보와 승인 기준 확정 | depends:T1 | status:RESOLVED | decision:주소·체인·피해내역·증빙·신고시각 + 동일 주소 신고 수, 기존 FRAUD_ADDRESS 상태, 신고자 허위 신고 누적 수를 표시하고 위험도 수동 선택은 강제하지 않음 | applied:docs/0.PRD_v1_opus46_fn.md, docs/0.SRS_v1opus46_fn.md, AGENTS.md
- [x] T6 | CORE  | Phase-0 이메일 발송 실패/재시도 처리 정책 확정 | depends:T2 | status:RESOLVED | decision:인증 코드 발송 실패는 HTTP 502로 실패 처리, 신고/승인/이체 통지 실패는 로그만 남기고 핵심 DB 처리는 성공 유지하며 자동 재시도 없음 | applied:docs/0.PRD_v1_opus46_fn.md, docs/0.SRS_v1opus46_fn.md, tasks/0.TASKS_LIST_v0_2_opus47_fn.md, AGENTS.md
- [x] T7 | CORE  | 통합 API 에러 응답 포맷 적용 수준 확정 | depends:- | status:RESOLVED | decision:`lib/api-response.ts` 중앙 헬퍼(`successResponse`, `errorResponse`, `withErrorHandler`)를 필수 구현하고 모든 `/api/v1/*` Route Handler에 적용 | applied:docs/0.PRD_v1_opus46_fn.md, docs/0.SRS_v1opus46_fn.md, tasks/0.TASKS_LIST_v0_2_opus47_fn.md, AGENTS.md
- [x] T8 | CORE  | Phase-0 테스트 전략의 구현 착수 기준 확정 | depends:- | status:RESOLVED | decision:Phase-0부터 Playwright E2E를 필수 Gate로 적용하고 REQ-P0-001~019 19개 시나리오 전체 green을 Phase-1a 전환 조건으로 삼음 | applied:docs/0.PRD_v1_opus46_fn.md, docs/0.SRS_v1opus46_fn.md, tasks/0.TASKS_LIST_v0_2_opus47_fn.md, AGENTS.md
- [x] T9 | MINOR | 시드 데이터 규모 불일치 정리 | depends:- | status:RESOLVED | decision:Phase-0 seed 규모는 `FRAUD_ADDRESS 30 + SAFE_NAME 10 + USER 5 + OPERATOR 1`, 수용 검증은 `FRAUD_REPORT 100` 기준으로 통일 | applied:docs/0.PRD_v1_opus46_fn.md, docs/0.SRS_v1opus46_fn.md, tasks/0.TASKS_LIST_v0_2_opus47_fn.md, AGENTS.md
- [x] T10 | MINOR | PRD/SRS 비용 기준 숫자 불일치 정리 | depends:- | status:RESOLVED | decision:커스텀 도메인 포함 SRS 비용 Gate로 통일: Phase-0 `≤ $22`, Phase-1a `≤ $86`, Phase-1b→Phase-2 `≤ $140` | applied:docs/0.PRD_v1_opus46_fn.md, docs/0.SRS_v1opus46_fn.md, tasks/0.TASKS_LIST_v0_2_opus47_fn.md, AGENTS.md

---

## Scope

- Reference: `tasks/0.TASKS_LIST_v0_2_opus47_fn.md`, `docs/0.PRD_v1_opus46_fn.md`, `docs/0.SRS_v1opus46_fn.md`
- Direction: unresolved UX flow, technical stack, and implementation design decisions before follow-up implementation
- Completion: all listed topics resolved
- Output: PRD, SRS, and current project Agent Harness
