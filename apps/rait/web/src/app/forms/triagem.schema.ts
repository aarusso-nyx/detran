// Triagem de admissibilidade (contrato CTG-0002c §4.2; `rait-web-forms.md` §3; spec §9
// "Triagem" e §6.6; ficha IU-RAIT-008 §6; [UC-RAIT-002]; [RN-RAIT-001]; [RN-RAIT-122];
// [RN-RAIT-105]/[RN-RAIT-005]; catálogo §3.5). A tempestividade é calculada pelo servidor e só
// espelhada em `context.timelinessVerdict` — não existe controle para ela (R1).
//
// Gates (agregado: caso) — contrato §5.1 linhas 2 a 4:
// | export              | pré-estado                 | papéis                        | pré-condições                                         | comando          | pós-estado    | errorCodes |
// | TRIAGEM_GATE        | [TRIAGEM_ADMISSIBILIDADE]  | rait-analyst, rait-secretary  | TRIAGEM_ADMISSIBILIDADE (§7); tempestividade somente  | rait-case:triage | null          | TRIAGE_TIMELINESS_READONLY, PROCURATION_UNVERIFIED,
// |                     |                            |                               | leitura (§9)                                          |                  |               | CASE_STATE_INVALID, VALIDATION_FAILED |
// | TRIAGEM_ADMIT_GATE  | [TRIAGEM_ADMISSIBILIDADE]  | rait-analyst                  | 4 vereditos registrados (§7); passa nos 4 critérios    | rait-case:admit  | ADMITIDO      | TRIAGE_INCOMPLETE, INTAKE_SIGNATURE_MISSING, CASE_STATE_INVALID |
// | TRIAGEM_REJECT_GATE | [TRIAGEM_ADMISSIBILIDADE]  | rait-analyst                  | 4 vereditos (§7); fundamento citando o inciso do art.  | rait-case:reject | NAO_CONHECIDO | TRIAGE_INCOMPLETE, NON_ADMISSION_REASON_REQUIRED,
// |                     |                            |                               | 4º da Res. 900 (§9)                                    |                  |               | CASE_STATE_INVALID |
import { z } from 'zod';
import { tristate, type FormGate } from './form-gate';
import { RAIT_CASE_STATES } from '../data/models/tokens';
import type { RaitNonAdmissionReason } from '../data/models/case.models';

/** Critérios editáveis do checklist; `tempestividade` é somente leitura (R1). */
export const TRIAGE_CRITERIA = [
  'legitimidade',
  'assinatura',
  'pedido_compativel',
] as const;

/** Hipóteses do art. 4º da Res. 900/2022 (`RaitCase.non_admission_reason`). */
export const NON_ADMISSION_REASONS = [
  'intempestivo',
  'ilegitimo',
  'sem_assinatura',
  'pedido_incompativel',
] as const satisfies readonly RaitNonAdmissionReason[];

/** Heurística de forma do §9 "citando o inciso do art. 4º" (OD-R12-051). */
export const ART4_INCISO = /\bart\.?\s*4[ºo°]?\b[\s\S]*\b(I|II|III|IV)\b/i;

export const VerdictSchema = z.strictObject({
  verdict: z.boolean().nullable(),
  reason: z.string().trim(),
});

export const TriagemSchema = z
  .strictObject({
    verdicts: z.strictObject({
      legitimidade: VerdictSchema,
      assinatura: VerdictSchema,
      pedido_compativel: VerdictSchema,
    }),
    outcome: z.enum(['triage', 'admit', 'reject']),
    nonAdmissionReason: z.enum(NON_ADMISSION_REASONS).nullable(),
    nonAdmissionGrounds: z.string().trim(),
    context: z.strictObject({
      timelinessVerdict: tristate,
      caseState: z.enum(RAIT_CASE_STATES).nullable(),
    }),
  })
  .superRefine((value, ctx) => {
    const { verdicts, outcome, context } = value;

    // R3: admitir ou não conhecer exige veredito e fundamento por critério (catálogo
    // TRIAGE_INCOMPLETE); em 'triage' (salvar checklist) vereditos parciais são aceitos.
    if (outcome === 'admit' || outcome === 'reject') {
      for (const criterion of TRIAGE_CRITERIA) {
        const entry = verdicts[criterion];
        if (entry.verdict === null) {
          ctx.addIssue({
            code: 'custom',
            path: ['verdicts', criterion, 'verdict'],
            message: 'rait.forms.triagem.verdicts.incomplete',
          });
        }
        if (entry.reason.length === 0) {
          ctx.addIssue({
            code: 'custom',
            path: ['verdicts', criterion, 'reason'],
            message: 'rait.forms.triagem.verdicts.reason_required',
          });
        }
      }
    }

    // R4: [RN-RAIT-001] — falhou um critério, não será conhecido.
    if (outcome === 'admit') {
      const reproved =
        TRIAGE_CRITERIA.some(
          (criterion) => verdicts[criterion].verdict === false,
        ) || context.timelinessVerdict === false;
      if (reproved) {
        ctx.addIssue({
          code: 'custom',
          path: ['outcome'],
          message: 'rait.forms.triagem.outcome.admit_blocked',
        });
      }
    }

    if (outcome === 'reject') {
      // R2a: hipótese do art. 4º obrigatória.
      if (value.nonAdmissionReason === null) {
        ctx.addIssue({
          code: 'custom',
          path: ['nonAdmissionReason'],
          message: 'rait.forms.triagem.nonAdmissionReason.required',
        });
      } else {
        // R5: a hipótese corresponde a um critério reprovado (veredito `null` nada dispara).
        const verdictOf: Readonly<
          Record<(typeof NON_ADMISSION_REASONS)[number], boolean | null>
        > = {
          intempestivo: context.timelinessVerdict,
          ilegitimo: verdicts.legitimidade.verdict,
          sem_assinatura: verdicts.assinatura.verdict,
          pedido_incompativel: verdicts.pedido_compativel.verdict,
        };
        if (verdictOf[value.nonAdmissionReason] === true) {
          ctx.addIssue({
            code: 'custom',
            path: ['nonAdmissionReason'],
            message: 'rait.forms.triagem.nonAdmissionReason.mismatch',
          });
        }
      }
      // R2b: fundamentação cita o art. 4º e o inciso.
      if (!ART4_INCISO.test(value.nonAdmissionGrounds)) {
        ctx.addIssue({
          code: 'custom',
          path: ['nonAdmissionGrounds'],
          message: 'rait.forms.triagem.nonAdmissionGrounds.cite_art4',
        });
      }
    }

    // R6: estado espelhado fora do pré-estado do gate (§2.4).
    if (
      context.caseState !== null &&
      context.caseState !== 'TRIAGEM_ADMISSIBILIDADE'
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['outcome'],
        message: 'rait.forms.common.state_invalid',
      });
    }
  });

export type TriagemBody = z.infer<typeof TriagemSchema>;

export const TRIAGEM_GATE: FormGate = {
  preState: ['TRIAGEM_ADMISSIBILIDADE'],
  roles: ['rait-analyst', 'rait-secretary'],
  preconditions: [
    { note: 'TRIAGEM_ADMISSIBILIDADE', source: 'rait-web-frontend.md §7' },
    {
      note: 'tempestividade somente leitura',
      source: 'rait-web-frontend.md §9',
    },
  ],
  command: 'rait-case:triage',
  postState: null,
  errorCodes: [
    'RAIT.TRIAGE_TIMELINESS_READONLY',
    'RAIT.PROCURATION_UNVERIFIED',
    'RAIT.CASE_STATE_INVALID',
    'RAIT.VALIDATION_FAILED',
  ],
};

export const TRIAGEM_ADMIT_GATE: FormGate = {
  preState: ['TRIAGEM_ADMISSIBILIDADE'],
  roles: ['rait-analyst'],
  preconditions: [
    { note: '4 vereditos registrados', source: 'rait-web-frontend.md §7' },
    {
      note: 'passa nos 4 critérios de admissibilidade',
      source: 'WF-RAIT-001 §Transições',
    },
  ],
  command: 'rait-case:admit',
  postState: 'ADMITIDO',
  errorCodes: [
    'RAIT.TRIAGE_INCOMPLETE',
    'RAIT.INTAKE_SIGNATURE_MISSING',
    'RAIT.CASE_STATE_INVALID',
  ],
};

export const TRIAGEM_REJECT_GATE: FormGate = {
  preState: ['TRIAGEM_ADMISSIBILIDADE'],
  roles: ['rait-analyst'],
  preconditions: [
    { note: '4 vereditos registrados', source: 'rait-web-frontend.md §7' },
    {
      note: 'não conhecimento exige fundamento citando o inciso do art. 4º da Res. 900',
      source: 'rait-web-frontend.md §9',
    },
  ],
  command: 'rait-case:reject',
  postState: 'NAO_CONHECIDO',
  errorCodes: [
    'RAIT.TRIAGE_INCOMPLETE',
    'RAIT.NON_ADMISSION_REASON_REQUIRED',
    'RAIT.CASE_STATE_INVALID',
  ],
};
