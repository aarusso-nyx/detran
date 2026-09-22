// Parâmetro operacional (contrato CTG-0002c §4.15; `rait-web-forms.md` §16; spec §9
// "Parâmetro"; ficha IU-RAIT-062 §6; [UC-RAIT-043]; [RN-RAIT-005]/[RN-RAIT-105]; catálogo
// §3.9; `parameter-catalogue.md`). O tipo do parâmetro (`value_type`), a origem legal e a
// lista de valores admitidos são fatos do catálogo, carregados pela página em `context`.
//
// Gate PARAMETRO_GATE (agregado: parâmetro) — contrato §5.1 linha 24:
// | pré-estado | papéis        | pré-condições                                | comando                | pós-estado | errorCodes |
// | null       | agency-admin  | motivo e vigência (§7); prazos legais        | rait-parameter:update  | null       | PARAMETER_LEGAL_READONLY, PARAMETER_EFFECTIVE_DATE_PAST,
// |            |               | somente leitura (§9)                          |                        |            | PARAMETER_SOURCE_PENDING, DEADLINE_LEGAL_READONLY |
import { z } from 'zod';
import {
  businessDaysPositiveInt,
  isoDate,
  tristate,
  type FieldMask,
  type FormGate,
} from './form-gate';

/** Tipos da coluna `Tipo` do `parameter-catalogue.md`, preservados como `value_type`. */
const INTEGER_TYPES = ['int', 'dias', 'anos'];
const NUMBER_TYPES = ['%', 'num', 'BRL'];
const JSON_TYPES = ['json', 'rule'];

export const ParametroSchema = z
  .strictObject({
    key: z.string().min(1),
    // Chave opcional: a ausência é a regra R2 `.value.required`, não um erro de tipo.
    value: z.unknown().optional(),
    reason: z.string().trim().min(1),
    effectiveFrom: isoDate,
    context: z.strictObject({
      today: isoDate,
      legalReadonly: tristate,
      sourcePending: tristate,
      valueType: z.string().nullable(),
      allowed: z.array(z.string()).nullable(),
    }),
  })
  .superRefine((value, ctx) => {
    const { context } = value;

    // R1: parâmetro de origem legal é somente leitura (PARAMETER_LEGAL_READONLY).
    if (context.legalReadonly === true) {
      ctx.addIssue({
        code: 'custom',
        path: ['key'],
        message: 'rait.forms.parametro.key.legal_readonly',
      });
    }

    // R2: o valor segue o tipo do parâmetro; tipo desconhecido só exige que haja valor.
    const typeInvalid = (): void => {
      ctx.addIssue({
        code: 'custom',
        path: ['value'],
        message: 'rait.forms.parametro.value.type_invalid',
      });
    };
    const raw = value.value;
    const valueType = context.valueType;
    if (valueType !== null && INTEGER_TYPES.includes(valueType)) {
      if (typeof raw !== 'number' || !Number.isInteger(raw) || raw < 0) {
        typeInvalid();
      }
    } else if (valueType === 'dias úteis') {
      if (!businessDaysPositiveInt.safeParse(raw).success) typeInvalid();
    } else if (valueType === 'F') {
      if (typeof raw !== 'boolean') typeInvalid();
    } else if (valueType !== null && NUMBER_TYPES.includes(valueType)) {
      if (typeof raw !== 'number' || !Number.isFinite(raw)) typeInvalid();
    } else if (valueType === 'enum') {
      if (
        typeof raw !== 'string' ||
        (context.allowed !== null && !context.allowed.includes(raw))
      ) {
        typeInvalid();
      }
    } else if (valueType !== null && JSON_TYPES.includes(valueType)) {
      if (typeof raw !== 'string' || raw.length === 0) {
        typeInvalid();
      } else {
        try {
          JSON.parse(raw);
        } catch {
          ctx.addIssue({
            code: 'custom',
            path: ['value'],
            message: 'rait.forms.parametro.value.json_invalid',
          });
        }
      }
    } else if (valueType === 'str') {
      if (typeof raw !== 'string' || raw.length === 0) typeInvalid();
    } else if (raw === undefined) {
      ctx.addIssue({
        code: 'custom',
        path: ['value'],
        message: 'rait.forms.parametro.value.required',
      });
    }

    // R3: vigência não retroage (PARAMETER_EFFECTIVE_DATE_PAST).
    if (value.effectiveFrom < context.today) {
      ctx.addIssue({
        code: 'custom',
        path: ['effectiveFrom'],
        message: 'rait.forms.common.date_past',
      });
    }

    // `context.sourcePending === true` não bloqueia: a tela mostra `rait.common.pendingSource`.
  });

export type ParametroBody = z.infer<typeof ParametroSchema>;

export const PARAMETRO_MASKS: Readonly<Record<string, FieldMask>> = {
  effectiveFrom: 'date',
};

export const PARAMETRO_GATE: FormGate = {
  preState: null,
  roles: ['agency-admin'],
  preconditions: [
    { note: 'motivo e vigência', source: 'rait-web-frontend.md §7' },
    {
      note: 'prazos legais somente leitura',
      source: 'rait-web-frontend.md §9',
    },
  ],
  command: 'rait-parameter:update',
  postState: null,
  errorCodes: [
    'RAIT.PARAMETER_LEGAL_READONLY',
    'RAIT.PARAMETER_EFFECTIVE_DATE_PAST',
    'RAIT.PARAMETER_SOURCE_PENDING',
    'RAIT.DEADLINE_LEGAL_READONLY',
  ],
};
