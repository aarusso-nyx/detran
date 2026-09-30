// Hotfix fix/offline-numbering-shift-races — tradução das violações dos índices únicos parciais
// de "uma linha ativa" de `ops` para a recusa de negócio do catálogo TEAT.
//
// Os comandos (`open-shift`, `reserve-numbering`) já devolvem o código próprio; as rotas CRUD
// geradas e `FieldOperationsController` gravam direto pela porta de repositório e, sem esta
// tradução, a violação `23505` chegava ao cliente como 500. A restrição de turno obrigatório
// da reserva (`23514`) segue o mesmo caminho. O mapa é fechado: só os índices e a restrição
// listados são traduzidos, e qualquer outro erro segue intocado para os filtros do app.
import type {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
} from '@nestjs/common';
import { Injectable, Module } from '@nestjs/common';
import { ApplicationConfig } from '@nestjs/core';
import { RequestContext } from '@stynx-nyx/core';
import { Database, type Transaction } from '@stynx-nyx/data';
import { catchError, from, type Observable } from 'rxjs';

import { DetranError, withTenantContext } from '@detran/shared';

type Query = (
  sql: string,
  values: readonly unknown[],
) => Promise<{ rows: Record<string, unknown>[] }>;

/** O que a requisição recusada gravaria: corpo e, no `PATCH`, o `:id` da linha. */
export interface RejectedWrite {
  body: Record<string, unknown>;
  id: string | null;
}

interface UniqueRule {
  /** `23505` (índice único) ou `23514` (restrição `check`). */
  sqlState: '23505' | '23514';
  code: string;
  status: number;
  message: string;
  /** Contexto do catálogo, lido na linha ativa que já ocupa a chave. */
  context(query: Query, write: RejectedWrite): Promise<Record<string, unknown>>;
}

const text = (value: unknown): string | null =>
  typeof value === 'string' && value ? value : null;

/**
 * A chave da linha recusada. Com RLS ativa na tabela o Postgres omite os
 * valores da chave no `DETAIL` da violação, então ela vem do corpo e, para o
 * que o corpo não traz (`PATCH`), da linha atual do `:id`.
 */
async function keyOf(
  query: Query,
  table: 'ops.ops_shift' | 'ops.numbering_reservation',
  columns: readonly string[],
  write: RejectedWrite,
): Promise<Record<string, string | null>> {
  const current = write.id
    ? (
        await query(
          `select ${columns.join(', ')} from ${table} where id = $1`,
          [write.id],
        )
      ).rows[0]
    : undefined;
  return Object.fromEntries(
    columns.map((column) => [
      column,
      text(write.body[column]) ?? text(current?.[column]),
    ]),
  );
}

/** Índice → recusa de negócio (teat-error-catalog.md). */
export const ACTIVE_UNIQUE_RULES: Readonly<Record<string, UniqueRule>> = {
  ux_ops_shift_tenant_id_agent_id_open: {
    sqlState: '23505',
    status: 409,
    code: 'TEAT.SHIFT_ALREADY_OPEN',
    message: 'Já existe turno aberto para o agente.',
    async context(query, write) {
      const key = await keyOf(query, 'ops.ops_shift', ['agent_id'], write);
      const open = await query(
        `select id, device_id from ops.ops_shift
          where agent_id = $1 and status = 'open' limit 1`,
        [key.agent_id],
      );
      const row = open.rows[0];
      return {
        shiftId: row ? String(row.id) : null,
        deviceId: row ? String(row.device_id) : null,
      };
    },
  },
  ux_numbering_reservation_tenant_id_device_id_shift_id_reserved: {
    sqlState: '23505',
    status: 409,
    code: 'TEAT.NUMBERING_RESERVATION_ACTIVE_EXISTS',
    message: 'Já existe reserva vigente para o dispositivo e turno.',
    async context(query, write) {
      const key = await keyOf(
        query,
        'ops.numbering_reservation',
        ['device_id', 'shift_id'],
        write,
      );
      const active = await query(
        `select id from ops.numbering_reservation
          where device_id = $1 and shift_id = $2 and status = 'reserved'
          limit 1`,
        [key.device_id, key.shift_id],
      );
      const row = active.rows[0];
      return { reservationId: row ? String(row.id) : null };
    },
  },
  // §5.10 (CTG-0002): reserva `reserved` exige turno.
  ck_ops_numbering_reservation_reserved_shift: {
    sqlState: '23514',
    status: 422,
    code: 'TEAT.VALIDATION_FAILED',
    message: 'Dados inválidos para o comando.',
    async context() {
      return { fields: [{ path: 'shift_id', rule: 'required' }] };
    },
  },
};

interface PgUniqueViolation {
  code: '23505' | '23514';
  constraint: string;
}

/** A violação do Postgres, direta ou na cadeia de `cause` de um invólucro. */
export function uniqueViolationOf(
  error: unknown,
): PgUniqueViolation | undefined {
  let current: unknown = error;
  for (let depth = 0; depth < 5 && current; depth += 1) {
    const candidate = current as Partial<PgUniqueViolation> & {
      cause?: unknown;
    };
    if (
      (candidate.code === '23505' || candidate.code === '23514') &&
      typeof candidate.constraint === 'string'
    )
      return candidate as PgUniqueViolation;
    current = candidate.cause;
  }
  return undefined;
}

function rejectedWrite(context: ExecutionContext): RejectedWrite {
  if (context.getType() !== 'http') return { body: {}, id: null };
  const request = context.switchToHttp().getRequest<{
    body?: unknown;
    params?: Record<string, string | undefined>;
  }>();
  const body =
    request.body && typeof request.body === 'object'
      ? (request.body as Record<string, unknown>)
      : {};
  return { body, id: request.params?.id ?? null };
}

@Injectable()
export class UniqueViolationInterceptor implements NestInterceptor {
  constructor(
    private readonly database: Database,
    private readonly requestContext: RequestContext,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next
      .handle()
      .pipe(
        catchError((error: unknown) =>
          from(this.translate(error, rejectedWrite(context))),
        ),
      );
  }

  private async translate(
    error: unknown,
    write: RejectedWrite,
  ): Promise<never> {
    const violation = uniqueViolationOf(error);
    const rule = violation ? ACTIVE_UNIQUE_RULES[violation.constraint] : null;
    if (!violation || !rule || rule.sqlState !== violation.code) throw error;
    const context = await withTenantContext(
      this.database,
      this.requestContext,
      (tx: Transaction) =>
        rule.context(
          (sql, values) =>
            (
              tx as unknown as {
                query(
                  sql: string,
                  values: readonly unknown[],
                ): Promise<{ rows: Record<string, unknown>[] }>;
              }
            ).query(sql, values),
          write,
        ),
    ).catch(() => ({}));
    throw new DetranError(rule.code, {
      status: rule.status,
      context,
      message: rule.message,
      cause: error,
    });
  }
}

@Injectable()
class UniqueViolationInterceptorRegistrar {
  constructor(
    applicationConfig: ApplicationConfig,
    interceptor: UniqueViolationInterceptor,
  ) {
    applicationConfig.addGlobalInterceptor(interceptor);
  }
}

@Module({
  providers: [UniqueViolationInterceptor, UniqueViolationInterceptorRegistrar],
})
export class UniqueViolationInterceptorModule {}
