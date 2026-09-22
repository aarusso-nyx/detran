// R-0016 TASK-0006 (Engineer). Tipos comuns dos 9 schemas de `forms/` (contrato CTG-0002.md §11;
// cópia adaptada de apps/portal/web/src/app/forms/form-gate.ts, sem `serviceKey`/`minimumAssurance`
// — camada e sessão são do backend/servidor, não deste arquivo). Um `FormGate` é documentação
// verificável: transcreve a política, a pré-condição (estado) e o comando da tabela §Decisões 3
// — NUNCA decide permissão (isso é `*stynxHasPermission`/`session.can` e o servidor); nenhum
// arquivo de `forms/` importa facade, guardas, relógio, `HttpClient`, `core/` ou `shared/`.

/** Referência textual a um código `DASH.*` do catálogo de erros; `forms/` não importa
 * `core/error-codes.ts` (fronteira TASK-0005 × TASK-0006). */
export type DashErrorCodeRef = `DASH.${string}`;

export type GateCommand =
  | 'alert:ack'
  | 'alert:close'
  | 'alert:annotate'
  | 'duty-cycle:start'
  | 'duty-cycle:prepare'
  | 'duty-cycle:submit'
  | 'duty-cycle:prove'
  | 'duty-cycle:archive'
  | 'export:create'
  | 'indicator-config:update'
  | 'indicator-config:publish'
  | 'generated-report:request'
  | 'transparency-audit:audit'
  | null; // null = sem comando (finalidade N2 é cabeçalho X-Purpose)

export interface GatePrecondition {
  /** Token de estado da tabela §Decisões 3 (ex.: 'NOTIFICADO'); null quando não há pré-estado único. */
  readonly state: string | null;
  /** Texto da coluna "Gate" da tabela §Decisões 3, literal. */
  readonly note: string;
  /** Erro que o servidor devolve quando a pré-condição falha. */
  readonly violation: DashErrorCodeRef | null;
  /** Aviso quando o servidor aceita e avisa (nunca bloqueia). */
  readonly warning: DashErrorCodeRef | null;
}

export interface FormGate {
  /** Chave `dashboard:<recurso>:<ação>`; transcrição, NUNCA usada para permitir (§Decisões 3). */
  readonly policy: `dashboard:${string}:${string}` | null;
  readonly precondition: GatePrecondition;
  readonly command: GateCommand;
  /** Pós-estado/efeito literal da tabela §Decisões 3. */
  readonly effect: string;
}

/** sha-256 hex = 64 dígitos hex (OD-D16-011); usado por `DASH.DUTY_EVIDENCE_HASH_INVALID`. */
export const SHA256_HEX = /^[0-9a-fA-F]{64}$/;
