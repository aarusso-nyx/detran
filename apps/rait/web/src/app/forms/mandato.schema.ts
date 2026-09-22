// Mandato de membro (contrato CTG-0002c §4.12; `rait-web-forms.md` §13; spec §9 "Mandato";
// ficha IU-RAIT-047 §6; [UC-RAIT-037]; [RN-RAIT-140]; [RN-RAIT-142]; [WF-RAIT-004] §9;
// catálogo §3.10). Dupla composição e sobreposição de mandato são fatos do servidor
// espelhados em `context` (§2.4).
//
// Gate MANDATO_GATE (agregado: membro do pool) — contrato §5.1 linha 21:
// | pré-estado | papéis   | pré-condições                                | comando              | pós-estado | errorCodes |
// | null       | rait-hr  | ato publicado (§7); sem posse não há         | rait-member:mandate  | ATIVO      | MANDATE_ACT_REQUIRED, MANDATE_DUAL_BODY, MANDATE_OVERLAP,
// |            |          | distribuição (ficha 047 §6)                  |                      |            | MANDATE_ACTIVE_ASSIGNMENTS, IDEMPOTENCY_REPLAY |
//
// O término de mandato (`ATIVO → MANDATO_ENCERRADO`, ficha 047) usa o mesmo comando com
// `mandateEndsOn`; o corpo do comando é de R-0007.
import { z } from 'zod';
import {
  isoDate,
  periodValid,
  tristate,
  type FieldMask,
  type FormGate,
} from './form-gate';
import { RAIT_JUDGING_BODIES } from '../data/models/tokens';
import type {
  RaitMemberRole,
  RaitRepresentationBlock,
} from '../data/models/worklist.models';

/** `RaitPoolMember.member_role` ainda sem lista em `tokens.ts` (OD-R12-045). */
export const MEMBER_ROLES = [
  'analista',
  'relator',
  'presidente',
  'coordenador',
  'secretaria',
  'autoridade',
] as const satisfies readonly RaitMemberRole[];

/** `RaitPoolMember.representation_block` (paridade do CETRAN, [RN-RAIT-142]). */
export const REPRESENTATION_BLOCKS = [
  'executivo_estadual',
  'municipal_rodoviario',
  'sociedade_civil',
] as const satisfies readonly RaitRepresentationBlock[];

export const MandatoSchema = z
  .strictObject({
    poolId: z.uuid(),
    personId: z.uuid(),
    memberRole: z.enum(MEMBER_ROLES),
    appointmentActRef: z.string().trim().min(1),
    representationBlock: z.enum(REPRESENTATION_BLOCKS).nullable(),
    isSubstitute: z.boolean(),
    mandateStartsOn: isoDate,
    mandateEndsOn: isoDate.nullable(),
    context: z.strictObject({
      judgingBody: z.enum(RAIT_JUDGING_BODIES).nullable(),
      otherBodyActiveMandate: tristate,
      overlapsExisting: tristate,
    }),
  })
  .superRefine((value, ctx) => {
    const { context } = value;

    // R1: dupla composição JARI × CETRAN bloqueada ([RN-RAIT-140]; MANDATE_DUAL_BODY).
    if (context.otherBodyActiveMandate === true) {
      ctx.addIssue({
        code: 'custom',
        path: ['personId'],
        message: 'rait.forms.mandato.personId.dual_body',
      });
    }

    // R2: mandato sobreposto no mesmo órgão (MANDATE_OVERLAP).
    if (context.overlapsExisting === true) {
      ctx.addIssue({
        code: 'custom',
        path: ['mandateStartsOn'],
        message: 'rait.forms.mandato.mandateStartsOn.overlap',
      });
    }

    // R3: no CETRAN o bloco de representação é obrigatório ([RN-RAIT-142]).
    if (
      context.judgingBody === 'cetran' &&
      value.representationBlock === null
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['representationBlock'],
        message: 'rait.forms.mandato.representationBlock.required',
      });
    }

    // R4: fim do mandato não é anterior ao início.
    if (
      value.mandateEndsOn !== null &&
      !periodValid(value.mandateStartsOn, value.mandateEndsOn)
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['mandateEndsOn'],
        message: 'rait.forms.common.period_invalid',
      });
    }
  });

export type MandatoBody = z.infer<typeof MandatoSchema>;

export const MANDATO_MASKS: Readonly<Record<string, FieldMask>> = {
  mandateStartsOn: 'date',
  mandateEndsOn: 'date',
};

export const MANDATO_GATE: FormGate = {
  preState: null,
  roles: ['rait-hr'],
  preconditions: [
    { note: 'ato publicado', source: 'rait-web-frontend.md §7' },
    { note: 'sem posse não há distribuição', source: 'IU-RAIT-047 §6' },
  ],
  command: 'rait-member:mandate',
  postState: 'ATIVO',
  errorCodes: [
    'RAIT.MANDATE_ACT_REQUIRED',
    'RAIT.MANDATE_DUAL_BODY',
    'RAIT.MANDATE_OVERLAP',
    'RAIT.MANDATE_ACTIVE_ASSIGNMENTS',
    'RAIT.IDEMPOTENCY_REPLAY',
  ],
};
