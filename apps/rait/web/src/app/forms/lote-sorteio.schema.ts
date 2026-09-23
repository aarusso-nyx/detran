// Lote de sorteio (contrato CTG-0002c §4.7; `rait-web-forms.md` §8; spec §9 "Lote de sorteio";
// fichas IU-RAIT-028 e IU-RAIT-029 §6; [WF-RAIT-004] §5 passos 1–5 e §9; [RN-RAIT-141];
// [RN-RAIT-140]; [RN-RAIT-142]; catálogo §3.4). Casos e membros elegíveis são calculados pelo
// servidor e apenas exibidos (`BatchDrawViewer`): o cliente só coleta as exclusões motivadas.
//
// Gates (agregado: lote) — contrato §5.1 linhas 12 a 14:
// | export                    | pré-estado       | papéis         | pré-condições                                     | comando           | pós-estado    | errorCodes |
// | LOTE_SORTEIO_GATE         | null             | rait-secretary | casos sem relator (§7); lote semanal, LOTE_ABERTO | rait-batch:open   | LOTE_ABERTO   | BATCH_STATE_INVALID, IDEMPOTENCY_REPLAY |
// | LOTE_SORTEIO_DRAW_GATE    | [LOTE_ABERTO]    | rait-secretary | membros ATIVO e DISPONIVEL/EM_PLANTAO; exclui      | rait-batch:draw   | LOTE_SORTEADO | BATCH_NO_ELIGIBLE_MEMBERS, BATCH_STATE_INVALID,
// |                           |                  |                | impedimento/suspeição (WF-RAIT-004 §5)            |                   |               | MEMBER_IMPEDED, MEMBER_NOT_AVAILABLE, ASSIGNMENT_ALREADY_ACTIVE |
// | LOTE_SORTEIO_APPROVE_GATE | [LOTE_SORTEADO]  | rait-chair     | ata assinada pelo presidente (PAdES+TSA)          | rait-batch:approve| LOTE_ACEITO   | BATCH_SEED_TAMPERED, BATCH_STATE_INVALID |
import { z } from 'zod';
import { isoDate, type FieldMask, type FormGate } from './form-gate';
import type { RaitBatchKind } from '../data/models/worklist.models';

/** `RaitBatch.kind` ainda sem lista em `tokens.ts` (OD-R12-045). */
export const LOTE_SORTEIO_KINDS = [
  'semanal',
  'extraordinario',
] as const satisfies readonly RaitBatchKind[];

/** Exclusão manual motivada (§9 "somente leitura exceto exclusões manuais motivadas"). */
export const LoteSorteioExclusionSchema = z.strictObject({
  memberId: z.uuid(),
  reason: z.string().trim().min(1),
});

export const LoteSorteioSchema = z
  .strictObject({
    poolId: z.uuid(),
    kind: z.enum(LOTE_SORTEIO_KINDS),
    weekStart: isoDate,
    // Sem transporte no contrato até R-0007 (OD-R12-046).
    manualExclusions: z.array(LoteSorteioExclusionSchema).default([]),
  })
  .superRefine((value, ctx) => {
    // R2: `memberId` únicos na lista de exclusões.
    const seen = new Set<string>();
    value.manualExclusions.forEach((exclusion, index) => {
      if (seen.has(exclusion.memberId)) {
        ctx.addIssue({
          code: 'custom',
          path: ['manualExclusions', index, 'memberId'],
          message: 'rait.forms.lote-sorteio.manualExclusions.duplicate',
        });
      }
      seen.add(exclusion.memberId);
    });
  });

export type LoteSorteioBody = z.infer<typeof LoteSorteioSchema>;

export const LOTE_SORTEIO_MASKS: Readonly<Record<string, FieldMask>> = {
  weekStart: 'date',
};

export const LOTE_SORTEIO_GATE: FormGate = {
  preState: null,
  roles: ['rait-secretary'],
  preconditions: [
    { note: 'casos sem relator', source: 'rait-web-frontend.md §7' },
    {
      note: 'lote semanal (proposta); LOTE_ABERTO',
      source: 'WF-RAIT-004 §5 passo 1',
    },
  ],
  command: 'rait-batch:open',
  postState: 'LOTE_ABERTO',
  errorCodes: ['RAIT.BATCH_STATE_INVALID', 'RAIT.IDEMPOTENCY_REPLAY'],
};

export const LOTE_SORTEIO_DRAW_GATE: FormGate = {
  preState: ['LOTE_ABERTO'],
  roles: ['rait-secretary'],
  preconditions: [
    {
      note: 'membros elegíveis ATIVO e DISPONIVEL/EM_PLANTAO; exclui quem lavrou o AIT ou tem impedimento/suspeição',
      source: 'WF-RAIT-004 §5 passos 2–3',
    },
  ],
  command: 'rait-batch:draw',
  postState: 'LOTE_SORTEADO',
  errorCodes: [
    'RAIT.BATCH_NO_ELIGIBLE_MEMBERS',
    'RAIT.BATCH_STATE_INVALID',
    'RAIT.MEMBER_IMPEDED',
    'RAIT.MEMBER_NOT_AVAILABLE',
    'RAIT.ASSIGNMENT_ALREADY_ACTIVE',
  ],
};

export const LOTE_SORTEIO_APPROVE_GATE: FormGate = {
  preState: ['LOTE_SORTEADO'],
  roles: ['rait-chair'],
  preconditions: [
    {
      note: 'ata assinada pelo presidente (PAdES+TSA)',
      source: 'WF-RAIT-004 §5 passo 4',
    },
  ],
  command: 'rait-batch:approve',
  postState: 'LOTE_ACEITO',
  errorCodes: ['RAIT.BATCH_SEED_TAMPERED', 'RAIT.BATCH_STATE_INVALID'],
};
