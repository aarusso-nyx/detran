// Fechamento de pauta (contrato CTG-0002c §4.8; `rait-web-forms.md` §9; spec §9 "Pauta" e §6.6;
// ficha IU-RAIT-032 §6; [UC-RAIT-005]; [WF-RAIT-003] §Formação de pauta e §Convocação; catálogo
// §3.7). Os dois números da convocação (`daysUntilSession` e `shortNoticeMinimumDays`, este do
// parâmetro T-CONV do catálogo) vêm do servidor: o cliente nunca conta dias ([RN-RAIT-005]).
//
// Gate PAUTA_GATE (agregado: sessão) — contrato §5.1 linha 15:
// | pré-estado        | papéis     | pré-condições                                       | comando           | pós-estado     | errorCodes |
// | [FORMANDO_PAUTA]  | rait-chair | itens com parecer, N3/CRÍTICO incluídos (§7); casos | rait-agenda:close | PAUTA_FECHADA  | AGENDA_ITEM_WITHOUT_OPINION, AGENDA_CRITICAL_MISSING,
// |                   |            | PRONTO_P_DECISAO → PAUTADO (§6.6); convocação com   |                   |                | AGENDA_SHORT_NOTICE, AGENDA_ITEM_DUPLICATE,
// |                   |            | no mínimo 5 dias úteis (WF-RAIT-003)                |                   |                | SESSION_STATE_INVALID |
import { z } from 'zod';
import { tristate, type FormGate } from './form-gate';
import { RAIT_RISK_FLAGS, RAIT_SESSION_STATES } from '../data/models/tokens';

/** Linha da fila espelhada (fatos do servidor; §2.4). */
export const PautaItemSchema = z.strictObject({
  caseId: z.uuid(),
  hasOpinion: tristate,
  riskFlag: z.enum(RAIT_RISK_FLAGS).nullable(),
});

export const PautaSchema = z
  .strictObject({
    sessionId: z.uuid(),
    items: z.array(PautaItemSchema).min(1),
    shortNoticeAck: z.boolean(),
    context: z.strictObject({
      criticalCaseIds: z.array(z.uuid()),
      daysUntilSession: z.number().int().nullable(),
      shortNoticeMinimumDays: z.number().int().nullable(),
      sessionState: z.enum(RAIT_SESSION_STATES).nullable(),
    }),
  })
  .superRefine((value, ctx) => {
    const { items, context } = value;

    const seen = new Set<string>();
    items.forEach((item, index) => {
      // R1: item sem parecer recusado (`null` = fato indisponível, nada dispara).
      if (item.hasOpinion === false) {
        ctx.addIssue({
          code: 'custom',
          path: ['items', index, 'caseId'],
          message: 'rait.forms.pauta.items.without_opinion',
        });
      }
      // R4: casos únicos na pauta.
      if (seen.has(item.caseId)) {
        ctx.addIssue({
          code: 'custom',
          path: ['items', index, 'caseId'],
          message: 'rait.forms.pauta.items.duplicate',
        });
      }
      seen.add(item.caseId);
    });

    // R2: todo caso em risco crítico do servidor entra na pauta ([WF-RAIT-003]).
    const included = new Set(items.map((item) => item.caseId));
    if (context.criticalCaseIds.some((caseId) => !included.has(caseId))) {
      ctx.addIssue({
        code: 'custom',
        path: [],
        message: 'rait.forms.pauta.items.critical_missing',
      });
    }

    // R3: convocação abaixo da antecedência mínima exige confirmação (§9); ambos os números
    // vêm do servidor — `null` em qualquer um deles não dispara nada.
    if (
      context.daysUntilSession !== null &&
      context.shortNoticeMinimumDays !== null &&
      context.daysUntilSession < context.shortNoticeMinimumDays &&
      !value.shortNoticeAck
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['shortNoticeAck'],
        message: 'rait.forms.pauta.shortNoticeAck.required',
      });
    }

    // R5: estado espelhado fora do pré-estado do gate.
    if (
      context.sessionState !== null &&
      context.sessionState !== 'FORMANDO_PAUTA'
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['sessionId'],
        message: 'rait.forms.common.state_invalid',
      });
    }
  });

export type PautaBody = z.infer<typeof PautaSchema>;

export const PAUTA_GATE: FormGate = {
  preState: ['FORMANDO_PAUTA'],
  roles: ['rait-chair'],
  preconditions: [
    {
      note: 'itens com parecer; N3/CRÍTICO incluídos',
      source: 'rait-web-frontend.md §7',
    },
    {
      note: 'casos PRONTO_P_DECISAO → PAUTADO',
      source: 'rait-web-frontend.md §6.6',
    },
    {
      note: 'convocação com no mínimo 5 dias úteis de antecedência (pendente regimento)',
      source: 'WF-RAIT-003 §Convocação',
    },
  ],
  command: 'rait-agenda:close',
  postState: 'PAUTA_FECHADA',
  errorCodes: [
    'RAIT.AGENDA_ITEM_WITHOUT_OPINION',
    'RAIT.AGENDA_CRITICAL_MISSING',
    'RAIT.AGENDA_SHORT_NOTICE',
    'RAIT.AGENDA_ITEM_DUPLICATE',
    'RAIT.SESSION_STATE_INVALID',
  ],
};
