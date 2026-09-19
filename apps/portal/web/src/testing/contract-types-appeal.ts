// R-0014 TASK-0015 (Inspector). Mesma técnica de `contract-types.ts` (CTG-0003a), aplicada ao
// par 2 (CTG-0003b §2–§3): `data/portal.client.ts` já existe (arquivo "altera" do contrato §1) e
// ainda não declara as sete leituras do §2.3 — `data/portal.client.reads.spec.ts` importa a
// instância REAL e faz `as unknown as PortalClientReads` para tipar contra a assinatura futura
// sem inventar valor nenhum (cada campo cita a seção do contrato de onde veio). Os demais
// arquivos do §1 (`data/portal-read.models.ts`, `data/read-status.ts`, `shared/{payment-comparison,
// process-timeline,prefilled-summary,wizard-resume}`, `features/**`) são inteiramente novos: a
// importação direta já falha com "Cannot find module" (comportamento esperado, §9) e não
// precisam deste cast.
import type { CommandResult } from './contract-types';

// —— §2.1 (transcrição mínima usada pelos specs deste arquivo; a forma completa fica em
// data/portal-read.models.ts, arquivo novo do Engineer — TASK-0016) ——

export interface AitListQueryContract {
  readonly vehicle?: string;
  readonly status?: string;
  readonly page?: number;
  readonly pageSize?: number;
}

export interface AitListPageContract {
  readonly items: readonly Record<string, unknown>[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
}

/** `GET aits/{aitId}` — OpenAPI: `{ [key: string]: unknown }` ([DIVERGE-1], OD-P69). */
export type AitDetailContract = Record<string, unknown>;

export interface AitPointsContract {
  readonly aitId: string;
  readonly pointsStatus: 'em_disputa' | 'definitivo' | 'none';
  readonly points: null;
}

export interface PointsSummaryContract {
  readonly definitivePoints: number;
  readonly disputedPoints: number;
  readonly byVehicle: readonly unknown[];
  readonly last12Months: readonly unknown[];
  readonly cachedAt: string | null;
}

export interface RequestListQueryContract {
  readonly state?: string;
  readonly kind?: string;
  readonly period?: string;
  readonly page?: number;
  readonly pageSize?: number;
}

export interface RequestListPageContract {
  readonly items: readonly Record<string, unknown>[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
}

/** `GET requests/{id}` — OpenAPI: `{ [key: string]: unknown }` ([DIVERGE-1], OD-P69). */
export type RequestDetailContract = Record<string, unknown>;

export type DecisionContract = Record<string, unknown>;

/** `PortalClient` (§2.3) — só as sete leituras novas do par 2. */
export interface PortalClientReads {
  listAits(query?: AitListQueryContract): Promise<AitListPageContract>;
  getAit(aitId: string): Promise<AitDetailContract>;
  getAitPoints(aitId: string): Promise<AitPointsContract>;
  getPointsSummary(): Promise<PointsSummaryContract>;
  listRequests(
    query?: RequestListQueryContract,
  ): Promise<RequestListPageContract>;
  getRequest(requestId: string): Promise<CommandResult<RequestDetailContract>>;
  getDecision(requestId: string): Promise<DecisionContract>;
}
