// Harness dos specs `unit` dos projetores (R-0009 CTG-0002 §7, §13): tx falsa
// em memória (`@detran/portal-requests/tests/support/fake-sql.ts`) semeada
// com as fixtures de CTG-0001 §10 relevantes às projeções, porta de
// enriquecimento falsa (`INFRACTION_VIEW_SOURCE`), leitor de parâmetros falso
// (`PORTAL_PARAMETER_READER`, chaves reconhecidas pelo SUFIXO — nenhum literal
// `portal.*`/`collection.*` nos specs) e poller manual. Constrói
// `PortalProjectors` pelos metadados do construtor (`nest-construct.ts`).
import { vi } from 'vitest';

import {
  FakeSqlDatabase,
  type Row,
} from '../../../requests/tests/support/fake-sql.js';
import { constructInjectable } from '../../../requests/tests/support/nest-construct.js';
import {
  FIXED_NOW,
  INFRACTION_VIEWS,
  SERVICE_CATALOG,
  SUBJECTS,
  TENANT_ID,
  TENANT_SLUG,
  fakeDatabase,
  fakeRequestContext,
  fixedClock,
} from '../../../requests/tests/support/portal-fixtures.js';
import { INFRACTION_VIEW_SOURCE } from '../../src/handwritten/infraction-view.projection.js';
import { PORTAL_PARAMETER_READER } from '../../src/handwritten/national-reads.service.js';
import {
  PORTAL_PROJECTION_POLLER,
  PortalProjectors,
} from '../../src/handwritten/projectors.service.js';

export interface ApplyOutcome {
  projection: string;
  applied: boolean;
  skipped?: 'already_applied' | 'not_consumed' | 'stale_version';
  error?: string;
}

export interface AitIdentity {
  aitNumber: string;
  plate: string;
  occurredAt: string | Date;
  framingLabel: string;
  amount: number | null;
  subjectCpfHashes: string[];
}

export interface HarnessOptions {
  /** `loadAitIdentity` da porta falsa: aitId → identidade ou null. */
  identities?: Record<string, AitIdentity | null>;
  deadlines?: Array<{ kind: string; dueOn: string; ownedBy: string }>;
  /** Valores por SUFIXO da chave de parâmetro (`card_payment`, `installments`, …). */
  parameters?: Record<string, unknown>;
  catalog?: (rows: Row[]) => Row[];
  /** Semeadura adicional antes de construir o serviço. */
  seed?: (db: FakeSqlDatabase) => void;
}

function tokenKey(token: unknown, fallback: string): string {
  if (typeof token === 'symbol') return token.description ?? fallback;
  if (typeof token === 'function') return (token as { name: string }).name;
  return typeof token === 'string' ? token : fallback;
}

export function projectorsHarness(options: HarnessOptions = {}) {
  const db = new FakeSqlDatabase({
    tenantId: TENANT_ID,
    tenant: { slug: TENANT_SLUG },
    now: fixedClock.now,
  });
  db.seed(
    'portal.subject',
    Object.values(SUBJECTS).map((subject) => ({
      id: subject.id,
      cpf_hash: subject.cpfHash,
      name: '',
      govbr_level_observed: null,
      assurance_level_observed: subject.assurance,
      observed_at: FIXED_NOW,
      version: 1,
    })),
  );
  db.seed(
    'portal.service_catalog',
    (options.catalog ?? ((rows) => rows))(
      SERVICE_CATALOG.map((row) => ({ ...row })),
    ),
  );
  db.seed(
    'portal.infraction_view',
    INFRACTION_VIEWS.map((row) => ({
      ...row,
      payment_json: { ...(row.payment_json as Row) },
    })),
  );
  options.seed?.(db);

  const source = {
    loadAitIdentity: vi.fn(
      async (_tx: unknown, aitId: string) =>
        options.identities?.[aitId] ?? null,
    ),
    loadDeadlines: vi.fn(async () => options.deadlines ?? []),
  };
  const parameterCalls: string[] = [];
  const parameters = {
    get: vi.fn(async (key: string) => {
      parameterCalls.push(key);
      const suffix = key.split('.').pop() ?? key;
      const value = options.parameters?.[suffix];
      return {
        key,
        value_json: value === undefined ? null : value,
        source_pending: value === undefined,
      };
    }),
  };
  const poller = {
    intervalMs: 1000,
    schedule: vi.fn((_fn: () => void | Promise<void>) => () => undefined),
  };
  const providers: Record<string, unknown> = {
    [tokenKey(INFRACTION_VIEW_SOURCE, 'INFRACTION_VIEW_SOURCE')]: source,
    [tokenKey(PORTAL_PARAMETER_READER, 'PORTAL_PARAMETER_READER')]: parameters,
    [tokenKey(PORTAL_PROJECTION_POLLER, 'PORTAL_PROJECTION_POLLER')]: poller,
    PortalClock: fixedClock,
    Database: fakeDatabase(db.tx),
    RequestContext: fakeRequestContext(),
  };
  const projectors = constructInjectable(
    PortalProjectors,
    providers,
  ) as unknown as {
    applyEvent: (
      event: unknown,
      tx: unknown,
    ) => Promise<ApplyOutcome | ApplyOutcome[]>;
    rebuild: (tenantId: string, projection: string) => Promise<unknown>;
  };

  /** Aplica e devolve a saída da projeção pedida (o serviço pode devolver uma ou várias). */
  const apply = async (
    event: unknown,
    projection?: string,
  ): Promise<ApplyOutcome> => {
    const result = await projectors.applyEvent(event, db.tx);
    const outcomes = Array.isArray(result) ? result : [result];
    if (!projection) return outcomes[0]!;
    return (
      outcomes.find((outcome) => outcome.projection === projection) ??
      outcomes[0]!
    );
  };

  const view = (aitId: string): Row | undefined =>
    db.rows('portal.infraction_view').find((row) => row.ait_id === aitId);
  const appliedEvents = (eventId?: string): Row[] =>
    db
      .rows('portal.projection_applied_event')
      .filter((row) => eventId === undefined || row.event_id === eventId);

  return {
    db,
    projectors,
    apply,
    source,
    parameters,
    parameterCalls,
    poller,
    view,
    appliedEvents,
  };
}
