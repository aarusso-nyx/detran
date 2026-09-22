// Tipos comuns, máscaras e helpers zod dos formulários (contrato CTG-0002c §2; consolidado
// `docs/framework/arch/rait-web-forms.md` §1). Um `FormGate` é documentação verificável:
// transcreve pré-estado, papéis, pré-condições, comando, pós-estado e `errorCodes` da spec
// §6.6/§7/§9, dos workflows e do catálogo de erros — NUNCA decide permissão (isso é
// `*stynxHasPermission` com a chave de `RAIT_COMMAND_RULES` e o servidor).
//
// Validação de forma só orienta: prazo, tempestividade e ordem de fila são somente leitura no
// cliente ([RN-RAIT-005], [RN-RAIT-141]). A data civil de referência (`today`) é injetada pela
// página em `context` (§2.4); nenhum arquivo de `forms/` lê relógio, facade, guarda ou HTTP. A
// comparação de datas civis ISO ('YYYY-MM-DD') é lexicográfica — nenhuma aritmética aqui.
import { z } from 'zod';
import type { RaitCommand } from '../data/models/commands';
import type { RaitErrorCode } from '../core/error-codes';
import type { RaitRoleCode } from '../app.route-manifest';

/** Pré-condição transcrita da fonte (spec §7/§9, ficha ou RN), com a fonte literal. */
export interface GatePrecondition {
  readonly note: string;
  readonly source: string;
}

/** Transcrição da linha de transição (contrato §2.1, §5.1); nunca decide permissão. */
export interface FormGate {
  /** Tokens do agregado alvo do comando; `null` = criação. */
  readonly preState: readonly string[] | null;
  /** Papéis da linha real de `RAIT_COMMAND_RULES` (contrato §3). */
  readonly roles: readonly RaitRoleCode[];
  readonly preconditions: readonly GatePrecondition[];
  /** Notação M8 `'<recurso>:<ação>'` (`RAIT_COMMANDS`). */
  readonly command: RaitCommand;
  /** Token pós-transição; `null` = estado inalterado. */
  readonly postState: string | null;
  readonly errorCodes: readonly RaitErrorCode[];
}

export type FieldMask = 'cpf' | 'cnpj' | 'placa' | 'ait' | 'date' | 'protocol';

/** Padrão de exibição por máscara (contrato §2.1). */
export const FIELD_MASK_PATTERNS: Readonly<Record<FieldMask, string>> = {
  cpf: '000.000.000-00',
  cnpj: '00.000.000/0000-00',
  placa: 'AAA0A00',
  // Formato do número do AIT sem fonte no corpus lido → `source_pending` (OD-R12-039).
  ait: '',
  // Exibição pt-BR; o valor do controle é sempre 'YYYY-MM-DD' (build-pack §0.4).
  date: 'dd/mm/aaaa',
  // Forma das fixtures ('RAIT-2026-000001'); formato oficial → OD-R12-039.
  protocol: 'RAIT-0000-000000',
};

/** ≤ 11 dígitos → `'cpf'`; senão `'cnpj'` (contrato §2.1). */
export function documentMaskFor(raw: string): 'cpf' | 'cnpj' {
  return onlyDigits(raw).length <= 11 ? 'cpf' : 'cnpj';
}

/** Data civil ISO 'YYYY-MM-DD' (comparação lexicográfica é segura). */
export const isoDate = z.iso.date();

/** Tri-estado do §2.4: `true` passa, `false` gera issue, `null` = fato indisponível. */
export const tristate = z.boolean().nullable();

/** Tipos aceitos nos anexos (catálogo §3.2 `FILE_TYPE_UNSUPPORTED`; [UC-RAIT-001]). O tamanho
 * máximo vem do servidor (`FILE_TOO_LARGE { maxBytes }`) — sem limite no cliente (OD-R12-040). */
export const DOCUMENT_ACCEPT = [
  'application/pdf',
  'image/jpeg',
  'image/png',
] as const;

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

/** Dois dígitos verificadores módulo 11 (algoritmo público); 11 dígitos iguais são recusados. */
export function cpfCheckDigits(digits: string): boolean {
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false;
  const check = (length: number): number => {
    let sum = 0;
    for (let index = 0; index < length; index += 1) {
      sum += Number(digits[index]) * (length + 1 - index);
    }
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };
  return check(9) === Number(digits[9]) && check(10) === Number(digits[10]);
}

/** Dígitos verificadores com pesos 5..2 e 6..2 (algoritmo público); 14 iguais são recusados. */
export function cnpjCheckDigits(digits: string): boolean {
  if (digits.length !== 14 || /^(\d)\1{13}$/.test(digits)) return false;
  const check = (length: number): number => {
    let weight = length - 7;
    let sum = 0;
    for (let index = 0; index < length; index += 1) {
      sum += Number(digits[index]) * weight;
      weight -= 1;
      if (weight < 2) weight = 9;
    }
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };
  return check(12) === Number(digits[12]) && check(13) === Number(digits[13]);
}

/** CPF ou CNPJ: normaliza para dígitos e confere os verificadores (§9 "CPF/CNPJ válidos"). */
export const cpfOrCnpj = z
  .string()
  .transform(onlyDigits)
  .pipe(
    z
      .string()
      .refine(
        (digits) =>
          (digits.length === 11 && cpfCheckDigits(digits)) ||
          (digits.length === 14 && cnpjCheckDigits(digits)),
        { message: 'rait.forms.common.document_invalid' },
      ),
  );

/** Mercosul 'AAA0A00' e padrão anterior 'AAA0000'. */
export const PLATE_BR = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/;

export const plateBr = z
  .string()
  .transform((value) => value.toUpperCase().replace(/[\s-]/g, ''))
  .pipe(
    z.string().regex(PLATE_BR, { message: 'rait.forms.common.plate_invalid' }),
  );

/** Separadores que denunciam mais de um AIT no mesmo campo (§9 "um AIT por requerimento"). */
export const AIT_SEPARATORS = /[\s,;/]/;

export const aitNumber = z
  .string()
  .trim()
  .min(1)
  .refine((value) => !AIT_SEPARATORS.test(value), {
    message: 'rait.forms.common.ait_single',
  });

/** Data civil não posterior a `today` (injetado pela página; §2.2). */
export function dateNotAfterToday(today: string) {
  return isoDate.refine((value) => value <= today, {
    message: 'rait.forms.common.date_future',
  });
}

/** Data civil não anterior a `today` (injetado pela página; §2.2). */
export function dateNotBeforeToday(today: string) {
  return isoDate.refine((value) => value >= today, {
    message: 'rait.forms.common.date_past',
  });
}

/** Período válido: fim ≥ início (strings ISO, comparação lexicográfica). */
export function periodValid(start: string, end: string): boolean {
  return end >= start;
}

/** Dias úteis; converter em data civil é do servidor ([RN-RAIT-005]). */
export const businessDaysPositiveInt = z.number().int().positive();

/** Toda `issue` do zod vira chave i18n (§2.3): regra própria fixa a chave em `message`; as
 * demais caem em `rait.forms.common.*` pelo código da issue. */
export function issueMessageKey(issue: z.core.$ZodIssue): string {
  if (issue.message.startsWith('rait.')) return issue.message;
  switch (issue.code) {
    case 'invalid_type':
    case 'too_small':
      return 'rait.forms.common.required';
    case 'too_big':
      return 'rait.forms.common.too_long';
    case 'invalid_format':
      return 'rait.forms.common.format_invalid';
    case 'invalid_value':
      return 'rait.forms.common.enum_invalid';
    case 'unrecognized_keys':
      return 'rait.forms.common.unknown_field';
    default:
      return 'rait.forms.common.invalid';
  }
}
