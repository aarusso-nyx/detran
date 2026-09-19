// Tipos comuns dos schemas de formulário (plan.md M12; contrato CTG-0003a §6.1). Um `FormGate` é
// documentação verificável: transcreve o nível mínimo, a pré-condição (estado/timer) e o comando
// da spec §7 — NUNCA decide permissão (isso é `SessionFacade.canPerform` e o servidor) e nenhum
// arquivo de `forms/` importa facade, guardas ou relógio.
import { z } from 'zod';
import type { PortalErrorCode } from '../core/error-boundary';

export type GateCommand =
  | 'submit' // POST requests/{id}/submit (ciclo comum)
  | 'withdraw' // POST requests/{id}/withdraw
  | 'respond_diligence' // POST requests/{id}/diligences/{did}/responses
  | 'elevate' // POST identity/assurance/elevations
  | 'update_preferences' // PUT identity/preferences (par 3)
  | 'manifest' // POST manifestations (par 3)
  | 'evaluate'; // POST evaluations | POST requests/{id}/evaluation (par 3)

export interface GatePrecondition {
  /** Token de estado da spec §7 (ex.: 'NOTIFICADO_AUTUACAO', 'open'). */
  readonly state: string | null;
  /** Código de timer da spec §7 (ex.: 'T-DEF'); avaliado SÓ no servidor. */
  readonly timer: string | null;
  /** Texto da coluna "Gate" da spec §7, literal. */
  readonly note: string;
  /** Erro que o servidor devolve quando falha. */
  readonly violation: PortalErrorCode | null;
  /** Aviso quando "protocola e avisa". */
  readonly warning: PortalErrorCode | null;
}

export interface FormGate {
  readonly serviceKey: string | null;
  /** Chave em `me.actRequirements[]` (null: ato sem linha própria). */
  readonly actKey: string | null;
  /** Transcrição; NUNCA usada para permitir/negar. */
  readonly minimumAssurance: 'none' | 'simples' | 'avancada';
  readonly precondition: GatePrecondition;
  readonly command: GateCommand;
  /** Estado resultante / delegação, literal da spec §7 ou contrato §5.1. */
  readonly effect: string;
}

/** `{ textVersion, acceptedAt }` (ISO 8601 com fuso, como as fixtures) — compartilhado. */
export const ConsequenceAckSchema = z.strictObject({
  textVersion: z.string().min(1),
  acceptedAt: z.iso.datetime({ offset: true }),
});

export type ConsequenceAckBody = z.infer<typeof ConsequenceAckSchema>;
