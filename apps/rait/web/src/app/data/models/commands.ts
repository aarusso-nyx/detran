// Catálogo dos comandos que o app EXPÕE (contrato CTG-0002b §2 `commands.ts`; §3.5 tabela, coluna
// "M8", na ordem da tabela). Notação M8 = `'<recurso>:<ação>'` = chave de política de
// `RAIT_COMMAND_RULES` (`backend/domains/shared/src/policy.ts`) sem o prefixo `inf:`
// (`permissionKeyOf`). NÃO é tabela de permissões (M4): a verdade em runtime é
// `RAIT_COMMAND_RULES`, lida pela sessão STYNX (`*stynxHasPermission`); divergências entre a
// notação M8 e as chaves reais (`rait-case:answer` × `inf:rait-case:answer-inquiry`, 18 ações só
// de ficha) são OD-R12-026/027 — reportadas, nunca corrigidas em silêncio. Todo método de comando
// dos clientes lança `RaitCommandUnavailableError(<M8>)` até R-0007 CTG-0004 (M8).

export const RAIT_COMMANDS = [
  'rait-case:protocol',
  'rait-case:claim-next',
  'rait-case:triage',
  'rait-case:admit',
  'rait-case:reject',
  'rait-case:remit-jari',
  'rait-case:receive-judging-body',
  'rait-case:open-inquiry',
  'rait-case:answer',
  'rait-case:extend',
  'rait-case:submit-draft',
  'rait-decision:sign',
  'rait-decision:return-draft',
  'rait-batch:open',
  'rait-batch:draw',
  'rait-batch:approve',
  'rait-batch:accept',
  'rait-batch:impede',
  'rait-opinion:register',
  'rait-agenda:close',
  'rait-session:open',
  'rait-session:adjourn',
  'rait-session:vote',
  'rait-session:casting-vote',
  'rait-session:view-request',
  'rait-session:proclaim',
  'rait-minutes:generate',
  'rait-minutes:sign',
  'rait-minutes:publish',
  'rait-appeal:authority-decide',
  'rait-appeal:waive',
  'rait-case:withdraw',
  'rait-assignment:reassign',
  'rait-impediment:declare',
  'rait-impediment:suspicion',
  'rait-schedule:publish',
  'rait-member:mandate',
  'rait-jeton:generate',
  'rait-jeton:approve',
  'rait-unit:constitute',
  'rait-unit:activate',
  'rait-clock:acknowledge-alert',
  'rait-extinction:declare',
  'rait-suspension-act:create',
  'rait-parameter:update',
  'rait-export:create',
  'rait-document:attach-official',
  'rait-case:resolve-pending-content',
  'rait-case:redirect',
  'rait-impediment:decide',
  'rait-attendance:confirm',
  'rait-attendance:summon-substitute',
  'rait-session:register-view-vote',
  'rait-session:convene-extraordinary',
  'rait-pool:update',
  'rait-capacity-plan:publish',
  'rait-quality-sample:review',
  'rait-integration:retry',
  'rait-integration:reconcile',
  'rait-collection:issue',
  'rait-refund:order',
  'rait-debt:handoff',
  'rait-payment:reconcile',
  'rait-calendar:update',
] as const;

export type RaitCommand = (typeof RAIT_COMMANDS)[number];

const POLICY_PREFIX = 'inf';

/** `'rait-case:admit'` → `'inf:rait-case:admit'` (chave de `RAIT_COMMAND_RULES`, M4). */
export function permissionKeyOf(command: RaitCommand): `inf:${RaitCommand}` {
  return `${POLICY_PREFIX}:${command}`;
}

/** Build-pack §0.6 `{ reason?, legalBasis?, …campos }`. */
export interface CommandBody {
  readonly reason?: string;
  readonly legalBasis?: string;
}

/** Build-pack §0.2: a resposta de comando traz `ETag` (Portal §2.3). */
export interface CommandResult<T> {
  readonly body: T;
  readonly etag: string | null;
}
