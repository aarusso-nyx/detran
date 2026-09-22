// Intake físico (contrato CTG-0002c §4.1; `rait-web-forms.md` §2; spec §9 "Intake físico";
// ficha IU-RAIT-020 §6; [UC-RAIT-001]; [RN-RAIT-106]; [RN-RAIT-001]; catálogo §3.2 e §3.3).
// Validação de forma só orienta; o marco de tempestividade é do canal e a data de referência
// chega em `context.today` ([RN-RAIT-005]).
//
// Gate INTAKE_FISICO_GATE (agregado: caso) — contrato §5.1 linha 1:
// | pré-estado | papéis          | pré-condições                                  | comando            | pós-estado  | errorCodes |
// | null       | rait-secretary  | conteúdo mínimo ou pendência aberta (§7);      | rait-case:protocol | PROTOCOLADO | INTAKE_MULTIPLE_AIT, INTAKE_DUPLICATE_INSTANCE,
// |            |                 | um AIT, CPF/CNPJ válidos, marco ≤ hoje (§9);   |                    |             | INTAKE_INFRACTION_STATE_INVALID, INTAKE_CHANNEL_MARK_MISSING,
// |            |                 | marco pelo canal utilizado (RN-RAIT-106)       |                    |             | INTAKE_MINIMUM_CONTENT, DOCUMENT_INVALID, DATE_IN_FUTURE,
// |            |                 |                                                |                    |             | PARTY_LEGITIMACY_INVALID, FILE_TYPE_UNSUPPORTED, FILE_TOO_LARGE,
// |            |                 |                                                |                    |             | VALIDATION_FAILED, IDEMPOTENCY_REPLAY |
import { z } from 'zod';
import {
  DOCUMENT_ACCEPT,
  aitNumber,
  cpfOrCnpj,
  isoDate,
  plateBr,
  type FieldMask,
  type FormGate,
} from './form-gate';
import { RAIT_COMMUNICATION_CHANNELS } from '../data/models/tokens';
import type { RaitLegitimacyBasis } from '../data/models/case.models';

/** Tokens de `CreateRaitPartyDto.legitimacy_basis` (OD-R12-045: enum literal com `satisfies`). */
export const LEGITIMACY_BASES = [
  'proprietario',
  'condutor',
  'embarcador',
  'transportador',
  'possuidor_equiparado',
  'principal_condutor',
] as const satisfies readonly RaitLegitimacyBasis[];

/** Peça digitalizada; `origin: 'requerente'` é fixado pela página, não é campo (§4.1). */
export const IntakeDocumentSchema = z.strictObject({
  kind: z.string().trim().min(1),
  fileName: z.string().min(1),
  contentType: z.enum(DOCUMENT_ACCEPT),
  sizeBytes: z.number().int().nonnegative(),
  digitisedFromPaper: z.boolean(),
});

export type IntakeDocumentBody = z.infer<typeof IntakeDocumentSchema>;

export const IntakeFisicoSchema = z
  .strictObject({
    channel: z.enum(RAIT_COMMUNICATION_CHANNELS),
    markOn: isoDate,
    plate: plateBr,
    aitNumber,
    applicant: z.strictObject({
      name: z.string().trim().min(1),
      document: cpfOrCnpj,
      // §9 "endereço" sem campo em `CreateRaitPartyDto` (OD-R12-041).
      address: z.string().trim().min(1),
      legitimacyBasis: z.enum(LEGITIMACY_BASES).nullable(),
    }),
    // `false` não bloqueia o protocolo (INTAKE_SIGNATURE_MISSING só na admissão, catálogo §3.3).
    signaturePresent: z.boolean(),
    documents: z.array(IntakeDocumentSchema).min(1),
    context: z.strictObject({ today: isoDate }),
  })
  .superRefine((value, ctx) => {
    // R3: marco ≤ hoje (§9; [RN-RAIT-106]) — `today` vem do servidor pela página.
    if (value.markOn > value.context.today) {
      ctx.addIssue({
        code: 'custom',
        path: ['markOn'],
        message: 'rait.forms.common.date_future',
      });
    }
  });

export type IntakeFisicoBody = z.infer<typeof IntakeFisicoSchema>;

/** A máscara do documento troca para `'cnpj'` por `documentMaskFor` acima de 11 dígitos. */
export const INTAKE_FISICO_MASKS: Readonly<Record<string, FieldMask>> = {
  markOn: 'date',
  plate: 'placa',
  aitNumber: 'ait',
  'applicant.document': 'cpf',
};

export const INTAKE_FISICO_GATE: FormGate = {
  preState: null,
  roles: ['rait-secretary'],
  preconditions: [
    {
      note: 'conteúdo mínimo ou pendência aberta',
      source: 'rait-web-frontend.md §7',
    },
    {
      note: 'um AIT por requerimento; CPF/CNPJ válidos; data do marco ≤ hoje',
      source: 'rait-web-frontend.md §9',
    },
    {
      note: 'marco de tempestividade pelo canal utilizado, nunca pela chegada ao julgador',
      source: 'RN-RAIT-106',
    },
  ],
  command: 'rait-case:protocol',
  postState: 'PROTOCOLADO',
  errorCodes: [
    'RAIT.INTAKE_MULTIPLE_AIT',
    'RAIT.INTAKE_DUPLICATE_INSTANCE',
    'RAIT.INTAKE_INFRACTION_STATE_INVALID',
    'RAIT.INTAKE_CHANNEL_MARK_MISSING',
    'RAIT.INTAKE_MINIMUM_CONTENT',
    'RAIT.DOCUMENT_INVALID',
    'RAIT.DATE_IN_FUTURE',
    'RAIT.PARTY_LEGITIMACY_INVALID',
    'RAIT.FILE_TYPE_UNSUPPORTED',
    'RAIT.FILE_TOO_LARGE',
    'RAIT.VALIDATION_FAILED',
    'RAIT.IDEMPOTENCY_REPLAY',
  ],
};
