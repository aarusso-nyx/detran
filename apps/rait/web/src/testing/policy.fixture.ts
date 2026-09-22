// R-0012 TASK-0008 (Inspector). Transcrição INDEPENDENTE (nunca `import` em runtime) de
// `RAIT_COMMAND_RULES` (`backend/domains/shared/src/policy.ts` linhas 1427-1500, lidas em
// 2026-09-21) para o contrato CTG-0002b.md §7. A chave de política é `teat('inf', resource,
// action)` = `` `inf:${resource}:${action}` `` (`policy.ts` linha 9-12); a verdade em runtime
// continua sendo `RAIT_COMMAND_RULES` — esta fixture só existe para que
// `data/list-query.spec.ts`… não, para que `data/models/commands.spec.ts`/o spec de comandos
// (C-2B-13) prove, via `kb.ts` `readPolicyCommandRules()`, que a transcrição bate com o
// arquivo-fonte, sem que o teste importe `policy.ts` (fronteira `packages/senatran-adapter`
// não se aplica aqui, mas o princípio de isolamento do teste sim — `backend/**` é "não pode
// tocar" da TASK-0008; ler o texto do arquivo em `kb.ts` continua permitido, importar o módulo
// TypeScript de produção do backend não).
//
// Nomeação: os nomes de AÇÃO aqui são os de `policy.ts` (`answer-inquiry`, `extend-inquiry`,
// `open`/`open-inquiry`, `archive:seal`/`archive:apply-retention`, …), que DIVERGEM em alguns
// pontos da notação M8 do contrato §3.5 (`rait-case:answer` × `inf:rait-case:answer-inquiry`;
// `rait-case:extend` × `inf:rait-case:extend-inquiry`; `rait-collection:issue`,
// `rait-refund:order`, `rait-debt:handoff`, `rait-payment:reconcile` não têm comando M8 na §7 —
// só a §3.5 linhas 60-63 citam ficha). C-2B-13 compara `RAIT_COMMANDS` (M8) com
// `readPolicyCommandRules()` (este arquivo e `policy.ts` devem coincidir) e relata as
// divergências entre M8 e `policy.ts` — nunca as esconde nem as corrige aqui (OD-R12-026/027).

import type { RaitRoleCode } from './route-manifest.fixture';

export const RAIT_COMMAND_KEYS_FIXTURE: readonly string[] = [
  'inf:rait-case:protocol',
  'inf:rait-case:claim-next',
  'inf:rait-case:triage',
  'inf:rait-case:admit',
  'inf:rait-case:reject',
  'inf:rait-case:remit-jari',
  'inf:rait-case:receive-judging-body',
  'inf:rait-case:open-inquiry',
  'inf:rait-case:answer-inquiry',
  'inf:rait-case:extend-inquiry',
  'inf:rait-case:submit-draft',
  'inf:rait-case:withdraw',
  'inf:rait-case:redirect',
  'inf:rait-case:resolve-pending-content',
  'inf:rait-decision:sign',
  'inf:rait-decision:return-draft',
  'inf:rait-batch:open',
  'inf:rait-batch:draw',
  'inf:rait-batch:approve',
  'inf:rait-batch:accept',
  'inf:rait-batch:impede',
  'inf:rait-opinion:register',
  'inf:rait-agenda:close',
  'inf:rait-session:open',
  'inf:rait-session:adjourn',
  'inf:rait-session:vote',
  'inf:rait-session:casting-vote',
  'inf:rait-session:view-request',
  'inf:rait-session:proclaim',
  'inf:rait-session:convene-extraordinary',
  'inf:rait-minutes:generate',
  'inf:rait-minutes:sign',
  'inf:rait-minutes:publish',
  'inf:rait-appeal:authority-decide',
  'inf:rait-appeal:waive',
  'inf:rait-assignment:reassign',
  'inf:rait-impediment:declare',
  'inf:rait-impediment:suspicion',
  'inf:rait-schedule:publish',
  'inf:rait-member:mandate',
  'inf:rait-jeton:generate',
  'inf:rait-jeton:approve',
  'inf:rait-unit:constitute',
  'inf:rait-unit:activate',
  'inf:rait-clock:acknowledge-alert',
  'inf:rait-extinction:declare',
  'inf:rait-suspension-act:create',
  'inf:rait-parameter:update',
  'inf:rait-export:create',
  'inf:rait-quality-sample:review',
  'inf:rait-capacity-plan:publish',
  'inf:rait-incident:open',
  'inf:rait-integration:retry',
  'inf:rait-integration:reconcile',
  'inf:rait-collection:issue',
  'inf:rait-refund:order',
  'inf:rait-debt:handoff',
  'inf:rait-payment:reconcile',
  'inf:rait-archive:seal',
  'inf:rait-archive:apply-retention',
];

/** Papel → chaves concedidas (mesmas 60 linhas de `RAIT_COMMAND_RULES`, agrupadas por papel). */
export const ROLE_PERMISSIONS_FIXTURE: Readonly<
  Record<RaitRoleCode, readonly string[]>
> = {
  'rait-analyst': [
    'inf:rait-case:claim-next',
    'inf:rait-case:triage',
    'inf:rait-case:admit',
    'inf:rait-case:reject',
    'inf:rait-case:open-inquiry',
    'inf:rait-case:answer-inquiry',
    'inf:rait-case:extend-inquiry',
    'inf:rait-case:submit-draft',
    'inf:rait-impediment:declare',
    'inf:rait-clock:acknowledge-alert',
  ],
  'rait-coordinator': [
    'inf:rait-assignment:reassign',
    'inf:rait-schedule:publish',
    'inf:rait-clock:acknowledge-alert',
    'inf:rait-quality-sample:review',
    'inf:rait-capacity-plan:publish',
    'inf:rait-incident:open',
  ],
  'rait-secretary': [
    'inf:rait-case:protocol',
    'inf:rait-case:triage',
    'inf:rait-case:remit-jari',
    'inf:rait-case:receive-judging-body',
    'inf:rait-case:withdraw',
    'inf:rait-case:redirect',
    'inf:rait-case:resolve-pending-content',
    'inf:rait-batch:open',
    'inf:rait-batch:draw',
    'inf:rait-impediment:suspicion',
    'inf:rait-jeton:generate',
    'inf:rait-minutes:generate',
    'inf:rait-minutes:sign',
    'inf:rait-minutes:publish',
    'inf:rait-archive:seal',
    'inf:rait-archive:apply-retention',
  ],
  'rait-signing-authority': [
    'inf:rait-decision:sign',
    'inf:rait-decision:return-draft',
    'inf:rait-impediment:declare',
    'inf:rait-extinction:declare',
    'inf:rait-suspension-act:create',
  ],
  'rait-central-authority': [
    'inf:rait-appeal:authority-decide',
    'inf:rait-appeal:waive',
  ],
  'rait-rapporteur': [
    'inf:rait-case:open-inquiry',
    'inf:rait-case:answer-inquiry',
    'inf:rait-case:extend-inquiry',
    'inf:rait-batch:accept',
    'inf:rait-batch:impede',
    'inf:rait-opinion:register',
    'inf:rait-session:vote',
    'inf:rait-session:view-request',
    'inf:rait-impediment:declare',
    'inf:rait-clock:acknowledge-alert',
  ],
  'rait-chair': [
    'inf:rait-batch:approve',
    'inf:rait-agenda:close',
    'inf:rait-session:open',
    'inf:rait-session:adjourn',
    'inf:rait-session:vote',
    'inf:rait-session:casting-vote',
    'inf:rait-session:proclaim',
    'inf:rait-session:convene-extraordinary',
    'inf:rait-minutes:sign',
    'inf:rait-assignment:reassign',
    'inf:rait-schedule:publish',
    'inf:rait-jeton:approve',
    'inf:rait-clock:acknowledge-alert',
    'inf:rait-extinction:declare',
    'inf:rait-suspension-act:create',
    'inf:rait-incident:open',
  ],
  'rait-manager': [
    'inf:rait-assignment:reassign',
    'inf:rait-unit:constitute',
    'inf:rait-unit:activate',
    'inf:rait-clock:acknowledge-alert',
    'inf:rait-capacity-plan:publish',
    'inf:rait-incident:open',
    'inf:rait-integration:reconcile',
  ],
  'rait-hr': ['inf:rait-member:mandate'],
  'rait-finance': [
    'inf:rait-collection:issue',
    'inf:rait-refund:order',
    'inf:rait-debt:handoff',
    'inf:rait-payment:reconcile',
  ],
  'integration-operator': [
    'inf:rait-integration:retry',
    'inf:rait-integration:reconcile',
  ],
  AUDITOR: ['inf:rait-export:create'],
  'agency-admin': ['inf:rait-parameter:update'],
};
