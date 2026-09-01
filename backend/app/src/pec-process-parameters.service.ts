import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Database, type Transaction } from '@stynx-nyx/data';
import { withTenantContext } from '@detran/shared';

type JsonScalar = boolean | number | string;
export type ProcessParameterValue = Record<string, unknown>;

export interface ProcessParameterRecord {
  key: string;
  value: ProcessParameterValue;
  description: string | null;
  updatedAt: string;
  updatedBy: string;
}

export interface UpsertProcessParameterCommand {
  value: ProcessParameterValue;
  description?: string;
}

export interface FeatureEvaluation {
  flag: string;
  value: JsonScalar;
  source: 'tenant' | 'default' | 'fallback';
  context: { tenantId?: string };
}

type SqlTransaction = Transaction & {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[]; rowCount?: number }>;
};

type SettingsRow = { settings: Record<string, unknown> };
type StoredParameter = {
  value: ProcessParameterValue;
  description: string | null;
  updatedAt: string;
  updatedBy: string;
};

const PARAMETER_KEY = /^[a-z][a-z0-9.-]{0,119}$/u;
const MAX_VALUE_BYTES = 32 * 1024;

@Injectable()
export class PecProcessParametersService {
  constructor(
    private readonly database: Database,
    private readonly requestContext: RequestContext,
  ) {}

  list(): Promise<ProcessParameterRecord[]> {
    return this.transaction(
      async (transaction) => {
        const document = await this.readDocument(transaction, false);
        return Object.entries(document)
          .sort(([left], [right]) => left.localeCompare(right))
          .map(([key, record]) => ({ key, ...record }));
      },
      { readonly: true },
    );
  }

  async upsert(
    rawKey: string,
    command: UpsertProcessParameterCommand,
  ): Promise<ProcessParameterRecord> {
    const key = this.normalizeKey(rawKey);
    const value = this.validateValue(key, command.value);
    const description = this.normalizeDescription(command.description);
    const context = this.requestContext.snapshot();
    const updatedAt = new Date().toISOString();
    const record: StoredParameter = {
      value,
      description,
      updatedAt,
      updatedBy: context.actorId!,
    };

    await this.transaction(async (transaction) => {
      const document = await this.readDocument(transaction, true);
      document[key] = record;
      await this.writeDocument(transaction, document);
    });
    return { key, ...record };
  }

  async remove(rawKey: string): Promise<{ key: string }> {
    const key = this.normalizeKey(rawKey);
    await this.transaction(async (transaction) => {
      const document = await this.readDocument(transaction, true);
      if (!Object.hasOwn(document, key)) {
        throw new NotFoundException('Process parameter not found');
      }
      delete document[key];
      await this.writeDocument(transaction, document);
    });
    return { key };
  }

  async evaluate(
    rawFlag: string,
    fallback: JsonScalar,
  ): Promise<FeatureEvaluation> {
    const flag = this.normalizeKey(rawFlag);
    const context = this.requestContext.snapshot();
    const document = await this.transaction(
      (transaction) => this.readDocument(transaction, false),
      { readonly: true },
    );
    const definition = document[`feature.${flag}`]?.value;
    if (!definition) {
      return {
        flag,
        value: fallback,
        source: 'fallback',
        context: this.featureContext(context.tenantId),
      };
    }
    const tenants = definition.tenants as Record<string, unknown> | undefined;
    const tenantValue = context.tenantId
      ? tenants?.[context.tenantId]
      : undefined;
    if (this.isScalar(tenantValue)) {
      return {
        flag,
        value: tenantValue,
        source: 'tenant',
        context: this.featureContext(context.tenantId),
      };
    }
    return {
      flag,
      value: definition.default as JsonScalar,
      source: 'default',
      context: this.featureContext(context.tenantId),
    };
  }

  private transaction<T>(
    work: (transaction: SqlTransaction) => Promise<T>,
    options: { readonly?: boolean } = {},
  ): Promise<T> {
    return withTenantContext(
      this.database,
      this.requestContext,
      (transaction) => work(transaction as SqlTransaction),
      options,
    );
  }

  private async readDocument(
    transaction: SqlTransaction,
    lock: boolean,
  ): Promise<Record<string, StoredParameter>> {
    if (lock) {
      await transaction.query(
        `insert into tenancy.tenant_settings (tenant_id)
         values (auth.current_tenant())
         on conflict (tenant_id) do nothing`,
      );
    }
    const result = await transaction.query<SettingsRow>(
      `select settings
         from tenancy.tenant_settings
        where tenant_id = auth.current_tenant()${lock ? ' for update' : ''}`,
    );
    const settings = result.rows[0]?.settings ?? {};
    const ch = this.asObject(settings.ch);
    return { ...this.asObject(ch.processParameters) } as Record<
      string,
      StoredParameter
    >;
  }

  private async writeDocument(
    transaction: SqlTransaction,
    document: Record<string, StoredParameter>,
  ): Promise<void> {
    await transaction.query(
      `update tenancy.tenant_settings
          set settings = settings || jsonb_build_object(
                'ch', coalesce(settings->'ch', '{}'::jsonb) ||
                      jsonb_build_object('processParameters', $1::jsonb)
              ),
              updated_at = clock_timestamp()
        where tenant_id = auth.current_tenant()`,
      [JSON.stringify(document)],
    );
  }

  private normalizeKey(raw: string): string {
    const key = raw.trim().toLowerCase();
    if (!PARAMETER_KEY.test(key)) {
      throw new BadRequestException('Invalid process parameter key');
    }
    return key;
  }

  private normalizeDescription(value: string | undefined): string | null {
    if (value === undefined) return null;
    const description = value.trim();
    if (!description || description.length > 240) {
      throw new BadRequestException(
        'Description must contain 1 to 240 characters',
      );
    }
    return description;
  }

  private validateValue(key: string, value: unknown): ProcessParameterValue {
    if (!value || Array.isArray(value) || typeof value !== 'object') {
      throw new BadRequestException(
        'Process parameter value must be an object',
      );
    }
    let serialized: string;
    try {
      serialized = JSON.stringify(value);
    } catch {
      throw new BadRequestException(
        'Process parameter value must be JSON serializable',
      );
    }
    if (Buffer.byteLength(serialized, 'utf8') > MAX_VALUE_BYTES) {
      throw new BadRequestException('Process parameter value exceeds 32 KiB');
    }
    const parsed = JSON.parse(serialized) as ProcessParameterValue;
    if (key.startsWith('feature.')) this.validateFeatureDefinition(parsed);
    return parsed;
  }

  private validateFeatureDefinition(value: ProcessParameterValue): void {
    if (!this.isScalar(value.default)) {
      throw new BadRequestException(
        'Feature parameter requires a scalar default',
      );
    }
    if (value.tenants === undefined) return;
    if (
      !value.tenants ||
      Array.isArray(value.tenants) ||
      typeof value.tenants !== 'object'
    ) {
      throw new BadRequestException('Feature tenants must be an object');
    }
    const tenants = this.asObject(value.tenants);
    if (Object.values(tenants).some((entry) => !this.isScalar(entry))) {
      throw new BadRequestException('Feature tenant values must be scalar');
    }
  }

  private isScalar(value: unknown): value is JsonScalar {
    return (
      typeof value === 'boolean' ||
      typeof value === 'string' ||
      (typeof value === 'number' && Number.isFinite(value))
    );
  }

  private asObject(value: unknown): Record<string, unknown> {
    return value && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  }

  private featureContext(tenantId: string | undefined): { tenantId?: string } {
    return tenantId ? { tenantId } : {};
  }
}
