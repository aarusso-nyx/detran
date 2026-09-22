// DTOs zod dos comandos do ciclo (CTG-0002 §3.1, §3.2, §14.1; A19: zod nas
// dependências). Forma de `manifestation.service.ts`: o serviço faz o `parse`
// e traduz a falha em `DASH.VALIDATION_FAILED` (400, `context.field`) — com
// as exceções que o contrato fixa por código próprio, verificadas pelo
// serviço antes do zod: `category` (`DASH.ROOT_CAUSE_CATEGORY_INVALID`),
// `evidence.hash` ausente (`DASH.DUTY_EVIDENCE_REQUIRED`) ou malformado
// (`DASH.DUTY_EVIDENCE_HASH_INVALID`), `channel = 'manual'` sem `note`
// (`DASH.ALERT_ACK_MANUAL_NOTE_REQUIRED`). `passthrough` nunca: campos fora
// do contrato são ignorados (`strip`).
import { z } from 'zod';
import { DetranError } from '@detran/shared';

const LOCAL_DATE = /^\d{4}-\d{2}-\d{2}$/;
const SHA256_HEX = /^[0-9a-f]{64}$/;

export const AckAlertSchema = z.object({
  channel: z.enum(['origin', 'manual']),
  note: z.string().min(1).max(2000).optional(),
  onBehalfOf: z.uuid().optional(),
});
export type AckAlertDto = z.infer<typeof AckAlertSchema>;

export const TreatAlertSchema = z.object({
  originRef: z.string().min(1).max(120).optional(),
});
export type TreatAlertDto = z.infer<typeof TreatAlertSchema>;

export const CloseAlertSchema = z.object({
  note: z.string().min(1).max(2000).optional(),
});
export type CloseAlertDto = z.infer<typeof CloseAlertSchema>;

/** `category` é validada pelo serviço (código próprio do catálogo); `note`
 *  é sinónimo aceito de `description` (route contract §3.1). */
export const RootCauseSchema = z.object({
  category: z.string().min(1).max(20),
  description: z.string().min(1).max(2000).optional(),
  note: z.string().min(1).max(2000).optional(),
});
export type RootCauseDto = z.infer<typeof RootCauseSchema>;

/** `deadlineOn` (A21: `PrepareDutyDto.deadlineOn`, source_pending no §14.1) é
 *  o único caminho de comando que tenta fixar uma data-limite — deveres sem
 *  prazo legal recusam-no com `DASH.DUTY_NO_LEGAL_DEADLINE` (§7.1). */
export const PrepareDutySchema = z.object({
  draftRef: z.string().min(1).max(120).optional(),
  deadlineOn: z.string().regex(LOCAL_DATE).optional(),
});
export type PrepareDutyDto = z.infer<typeof PrepareDutySchema>;

export const SubmitDutySchema = z.object({
  submittedAt: z.iso.datetime({ offset: true }).optional(),
  protocol: z.string().min(1).max(120).optional(),
});
export type SubmitDutyDto = z.infer<typeof SubmitDutySchema>;

export const ProveDutySchema = z.object({
  evidence: z.object({
    protocol: z.string().min(1).max(120).optional(),
    captureUri: z.string().url().optional(),
    hash: z.string().regex(SHA256_HEX),
  }),
});
export type ProveDutyDto = z.infer<typeof ProveDutySchema>;

export const ArchiveDutySchema = z.object({
  note: z.string().min(1).max(2000).optional(),
});
export type ArchiveDutyDto = z.infer<typeof ArchiveDutySchema>;

export const SHA256_HEX_PATTERN = SHA256_HEX;

/** `parse` com falha traduzida em `DASH.VALIDATION_FAILED` (400). */
export function parseDto<T>(schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input ?? {});
  if (result.success) return result.data;
  const issue = result.error.issues[0];
  throw new DetranError('DASH.VALIDATION_FAILED', {
    status: 400,
    context: {
      field: issue ? issue.path.map(String).join('.') : undefined,
      reason: issue?.code,
    },
  });
}
