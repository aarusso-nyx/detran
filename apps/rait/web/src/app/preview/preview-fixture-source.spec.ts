// R-0033 TASK-0002 (Inspector). C-06 / P-13 / P-15 / P-17 / D-03 / D-05 / D-06 / D-07
// (`frontend-preview-mode.md` §1 item 3, §2, §7, §9; prompt TASK-0002 item 7). Com a fixture
// canônica carregada (`rait-fixtures.json` lido do disco): cada `Preview<Cliente>Client.list*()`
// devolve só itens cujo `id` existe na coleção correspondente do JSON (mapa método → coleção do
// inventário §2; método sem coleção → lista vazia, D-07); todo `list*`/`get*` do cliente real é
// sobrescrito; `PreviewClock.now()` = `Date.parse('2026-09-14T12:00:00-04:00')`, constante;
// `PreviewStynxSessionService.state().tenantId` = tenant das fixtures; sob `loaded` nenhum texto
// `source_pending` nas telas da JW-01 exceto a minuta (passo 8, única prevista pelo inventário).
// Adenda A5 item 5 (B5, estado A4 da fixture: 49 coleções, PR #184): as 14 leituras antes sem
// coleção (`listRaitParty` … `listRaitMinutes`) mapeiam às coleções novas; para cada uma, `list*`
// devolve exatamente os ids da coleção (sem filtro e filtrado pelo pai — caso, sessão, item de
// pauta, relógio) e `get*` resolve o registro da JSON, tudo derivado da JSON lida do disco. O
// bloco D-07 fica restrito às leituras cuja coleção não existe na JSON (`InfractionClient`,
// `NotificationClient`; `rait-fixtures.md` §10: infrações e avisos não são transcritos).
import { HttpTestingController } from '@angular/common/http/testing';
import {
  convertToParamMap,
  type ActivatedRouteSnapshot,
  type RouterStateSnapshot,
} from '@angular/router';
import { roleGuard } from '../core/guards/role.guard';
import { caseAccessGuard } from '../core/guards/case-access.guard';
import type { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { StynxSessionService } from '@stynx-nyx/angular-auth';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { APP_SRC_ROOT } from '../../testing/kb';
import { RaitSessionFacade } from '../core/session.facade';
import { RaitStreamTransport } from '../core/stream-transport';
import { CaseClient } from '../data/api/case.client';
import { CollectionClient } from '../data/api/collection.client';
import { InfractionClient } from '../data/api/infraction.client';
import { IntegrationClient } from '../data/api/integration.client';
import { NotificationClient } from '../data/api/notification.client';
import { OrgClient } from '../data/api/org.client';
import { SessionClient } from '../data/api/session.client';
import { WorklistClient } from '../data/api/worklist.client';
import { RaitClock } from '../data/clock';
import type { ListPage } from '../data/models';
import { PreviewCaseClient } from './adapters/preview-case.client';
import { PreviewCollectionClient } from './adapters/preview-collection.client';
import { PreviewInfractionClient } from './adapters/preview-infraction.client';
import { PreviewIntegrationClient } from './adapters/preview-integration.client';
import { PreviewNotificationClient } from './adapters/preview-notification.client';
import { PreviewOrgClient } from './adapters/preview-org.client';
import { PreviewSessionClient } from './adapters/preview-session.client';
import { PreviewWorklistClient } from './adapters/preview-worklist.client';
import { PREVIEW_NOW_ISO, PreviewClock } from './preview-clock';
import {
  PREVIEW_SOURCE_PENDING,
  PreviewFixtureStore,
} from './preview-fixtures';
import {
  PreviewSessionFacade,
  PreviewStynxSessionService,
} from './preview-session';
import { PreviewStreamTransport } from './preview-stream-transport';
import {
  configurePreview,
  createPreviewHarness,
  fixtureIdsOf,
  fixtureTenantId,
  fixtureToday,
  inventoryRowOf,
  JW01_SCREENS,
  previewSpecContext,
  readFixturesJson,
  resetPreviewDocument,
  setPreviewDocument,
  settle,
} from './preview.spec-helper';

afterEach(() => resetPreviewDocument());

async function configureLoaded(): Promise<void> {
  setPreviewDocument('/painel', 'rait-analyst', 'loaded');
  await configurePreview(previewSpecContext().providers);
}

type AnyClass = abstract new (...args: never[]) => object;

interface ClientSource {
  readonly name: string;
  readonly real: AnyClass;
  readonly preview: AnyClass;
  /**
   * Método de lista → chave de nível 1 de `rait-fixtures.json` (inventário §2, coluna "Método de
   * leitura → chave da fixture"); `null` = leitura sem chave na fixture (coluna `source_pending`).
   */
  readonly lists: Readonly<Record<string, string | null>>;
}

const CLIENTS: readonly ClientSource[] = [
  {
    name: 'CaseClient',
    real: CaseClient,
    preview: PreviewCaseClient,
    lists: {
      listRaitCase: 'cases',
      listRaitParty: 'parties',
      listRaitDocument: 'documents',
      listRaitPendingContent: 'raitPendingContents',
      listRaitRedirect: 'raitRedirects',
      listRaitAdmissibility: 'admissibility',
      listRaitDeadline: 'deadlines',
      listRaitInquiry: 'inquiries',
      listRaitDraft: 'raitDrafts',
      listRaitDecision: 'decisions',
      listRaitCommunication: 'communications',
      listRaitCaseEvent: 'caseEvents',
    },
  },
  {
    name: 'WorklistClient',
    real: WorklistClient,
    preview: PreviewWorklistClient,
    lists: {
      listRaitUnit: 'raitUnits',
      listRaitPool: 'pools',
      listRaitPoolMember: 'poolMembers',
      listRaitSchedule: 'raitSchedules',
      listRaitScheduleSlot: 'raitScheduleSlots',
      listRaitBatch: 'raitBatches',
      listRaitBatchItem: 'raitBatchItems',
      listRaitAssignment: 'assignments',
      listRaitImpediment: 'impediments',
      listRaitSubstituteDuty: 'raitSubstituteDuties',
      listRaitBench: 'raitBenches',
      listRaitClock: 'clocks',
      listRaitClockAlert: 'clockAlerts',
    },
  },
  {
    name: 'SessionClient',
    real: SessionClient,
    preview: PreviewSessionClient,
    lists: {
      listRaitSession: 'sessions',
      listRaitAgendaItem: 'agendaItems',
      listRaitAttendance: 'attendance',
      listRaitVote: 'votes',
      listRaitMinutes: 'minutes',
    },
  },
  {
    name: 'OrgClient',
    real: OrgClient,
    preview: PreviewOrgClient,
    lists: {
      listRaitHoliday: 'raitHolidays',
      listRaitSuspensionAct: 'raitSuspensionActs',
      listRaitJetonSheet: 'raitJetonSheets',
      listRaitJetonLine: 'raitJetonLines',
      listRaitIncident: 'raitIncidents',
      listRaitQualitySample: 'raitQualitySamples',
      listRaitCapacityPlan: 'raitCapacityPlans',
      listRaitExport: 'raitExports',
    },
  },
  {
    name: 'IntegrationClient',
    real: IntegrationClient,
    preview: PreviewIntegrationClient,
    lists: { listRaitReconciliation: 'raitReconciliations' },
  },
  {
    name: 'CollectionClient',
    real: CollectionClient,
    preview: PreviewCollectionClient,
    lists: {
      listCollectionDocument: 'collectionDocuments',
      listPayment: 'payments',
      listRefundOrder: 'refundOrders',
      listDebtHandoff: 'debtHandoffs',
    },
  },
  {
    name: 'InfractionClient',
    real: InfractionClient,
    preview: PreviewInfractionClient,
    lists: {
      listInfraction: null,
      listInfractionTimer: null,
      listInfractionEvent: null,
    },
  },
  {
    name: 'NotificationClient',
    real: NotificationClient,
    preview: PreviewNotificationClient,
    lists: {
      listNotice: null,
      listNoticeAcknowledgement: null,
      listNoticeDeliveryAttempt: null,
    },
  },
];

function readMethodsOf(type: AnyClass, prefix: RegExp): readonly string[] {
  return Object.getOwnPropertyNames(type.prototype)
    .filter((name) => prefix.test(name))
    .sort();
}

async function listOf(
  client: ClientSource,
  method: string,
): Promise<ListPage<{ readonly id: string }>> {
  const instance = TestBed.inject(client.real as Type<object>) as Record<
    string,
    (query: object) => Promise<ListPage<{ readonly id: string }>>
  >;
  return instance[method]({});
}

describe('C-06 — mapa método de lista → coleção da fixture (inventário §2)', () => {
  CLIENTS.forEach((client) => {
    it(`dado o protótipo de ${client.name} quando lidos os list* então coincidem com o mapa do inventário §2`, () => {
      expect(readMethodsOf(client.real, /^list[A-Z]/)).toEqual(
        Object.keys(client.lists).sort(),
      );
    });

    it(`dado o protótipo de ${client.name} quando lidos list*/get* então Preview${client.name} sobrescreve cada um (nenhuma leitura chega a RaitHttp)`, () => {
      for (const method of readMethodsOf(
        client.real,
        /^(list|get|verify)[A-Z]/,
      )) {
        expect(
          Object.prototype.hasOwnProperty.call(
            client.preview.prototype,
            method,
          ),
          `${client.name}.${method}`,
        ).toBe(true);
      }
    });
  });

  it('dado as coleções citadas no mapa quando procuradas em rait-fixtures.json então todas existem (nenhuma coleção inventada)', () => {
    const fixtures = readFixturesJson();
    const cited = CLIENTS.flatMap((client) =>
      Object.values(client.lists).filter(
        (collection): collection is string => collection !== null,
      ),
    );
    for (const collection of cited) {
      expect(fixtures, collection).toHaveProperty(collection);
    }
  });
});

describe('C-06 — list* com coleção na fixture devolve só ids da coleção (loaded)', () => {
  CLIENTS.forEach((client) => {
    Object.entries(client.lists)
      .filter((entry): entry is [string, string] => entry[1] !== null)
      .forEach(([method, collection]) => {
        it(`dado a fixture canônica e pv_estado=loaded quando Preview${client.name}.${method}({}) então todo item.id ∈ ${collection} de rait-fixtures.json`, async () => {
          await configureLoaded();
          const ids = fixtureIdsOf(collection);
          const page = await listOf(client, method);
          for (const item of page.items) {
            expect(ids.has(item.id), `${method} → ${item.id}`).toBe(true);
          }
          expect(page.items.length).toBeLessThanOrEqual(ids.size);
        });
      });
  });
});

/**
 * A5 item 5 (a): as 14 leituras que A4 ligou às coleções novas da JSON. `parent` = campo de
 * `filtro` do `ListQuerySpec` do cliente real (`data/api/*.client.ts`) e o campo correspondente
 * do registro da JSON (`rait-fixtures.md` §10, convenção camelCase); `get` = leitura unitária do
 * cliente real.
 */
interface A4Read {
  readonly client: string;
  readonly list: string;
  readonly get: string;
  readonly collection: string;
  readonly parent: { readonly filtro: string; readonly fixture: string };
}

const CASE_PARENT = { filtro: 'case_id', fixture: 'caseId' } as const;

const A4_READS: readonly A4Read[] = [
  {
    client: 'CaseClient',
    list: 'listRaitParty',
    get: 'getRaitParty',
    collection: 'parties',
    parent: CASE_PARENT,
  },
  {
    client: 'CaseClient',
    list: 'listRaitDocument',
    get: 'getRaitDocument',
    collection: 'documents',
    parent: CASE_PARENT,
  },
  {
    client: 'CaseClient',
    list: 'listRaitAdmissibility',
    get: 'getRaitAdmissibility',
    collection: 'admissibility',
    parent: CASE_PARENT,
  },
  {
    client: 'CaseClient',
    list: 'listRaitDeadline',
    get: 'getRaitDeadline',
    collection: 'deadlines',
    parent: CASE_PARENT,
  },
  {
    client: 'CaseClient',
    list: 'listRaitInquiry',
    get: 'getRaitInquiry',
    collection: 'inquiries',
    parent: CASE_PARENT,
  },
  {
    client: 'CaseClient',
    list: 'listRaitDecision',
    get: 'getRaitDecision',
    collection: 'decisions',
    parent: CASE_PARENT,
  },
  {
    client: 'CaseClient',
    list: 'listRaitCommunication',
    get: 'getRaitCommunication',
    collection: 'communications',
    parent: CASE_PARENT,
  },
  {
    client: 'CaseClient',
    list: 'listRaitCaseEvent',
    get: 'getRaitCaseEvent',
    collection: 'caseEvents',
    parent: CASE_PARENT,
  },
  {
    client: 'WorklistClient',
    list: 'listRaitAssignment',
    get: 'getRaitAssignment',
    collection: 'assignments',
    parent: CASE_PARENT,
  },
  {
    client: 'WorklistClient',
    list: 'listRaitImpediment',
    get: 'getRaitImpediment',
    collection: 'impediments',
    parent: CASE_PARENT,
  },
  {
    client: 'WorklistClient',
    list: 'listRaitClockAlert',
    get: 'getRaitClockAlert',
    collection: 'clockAlerts',
    parent: { filtro: 'clock_id', fixture: 'clockId' },
  },
  {
    client: 'SessionClient',
    list: 'listRaitAttendance',
    get: 'getRaitAttendance',
    collection: 'attendance',
    parent: { filtro: 'session_id', fixture: 'sessionId' },
  },
  {
    client: 'SessionClient',
    list: 'listRaitVote',
    get: 'getRaitVote',
    collection: 'votes',
    parent: { filtro: 'agenda_item_id', fixture: 'agendaItemId' },
  },
  {
    client: 'SessionClient',
    list: 'listRaitMinutes',
    get: 'getRaitMinutes',
    collection: 'minutes',
    parent: { filtro: 'session_id', fixture: 'sessionId' },
  },
];

type FixtureRecord = Readonly<Record<string, unknown>> & {
  readonly id: string;
};

/** Registros de uma coleção em array de `rait-fixtures.json`, lidos do disco. */
function fixtureRecordsOf(collection: string): readonly FixtureRecord[] {
  const value = readFixturesJson()[collection];
  if (!Array.isArray(value)) {
    throw new Error(`rait-fixtures.json: ${collection} não é coleção em array`);
  }
  return value as readonly FixtureRecord[];
}

function clientOf(name: string): ClientSource {
  const client = CLIENTS.find((candidate) => candidate.name === name);
  if (!client) throw new Error(`cliente ${name} fora de CLIENTS`);
  return client;
}

function instanceOf(
  name: string,
): Record<string, (arg: unknown) => Promise<unknown>> {
  return TestBed.inject(clientOf(name).real as Type<object>) as Record<
    string,
    (arg: unknown) => Promise<unknown>
  >;
}

function sortedIds(items: readonly { readonly id: string }[]): string[] {
  return items.map((item) => item.id).sort();
}

/** S1-A4 / T0: default analyst is triage T before admission, M otherwise;
 * archived cases are unavailable to that purpose. Documents have no T field set.
 * Derive the exact expected subset from canonical source rows, never adapter output.
 */
function analystVisibleRecords(read: A4Read): readonly FixtureRecord[] {
  const records = fixtureRecordsOf(read.collection);
  if (read.client !== 'CaseClient') return records;
  const cases = fixtureRecordsOf('cases');
  return records.filter((record) => {
    const parent = cases.find((row) => row.id === record['caseId']);
    if (!parent || parent['archived'] === true) return false;
    return (
      read.collection !== 'documents' ||
      !['PROTOCOLADO', 'TRIAGEM_ADMISSIBILIDADE'].includes(
        String(parent['state']),
      )
    );
  });
}

describe('C-06 — as 14 leituras de A4 leem as coleções novas da JSON (A5 item 5 (a))', () => {
  it('dado A4_READS quando comparado ao mapa CLIENTS então as 14 leituras, cada uma mapeada à sua coleção, e cada coleção é array não vazio na JSON', () => {
    expect(A4_READS).toHaveLength(14);
    for (const read of A4_READS) {
      expect(clientOf(read.client).lists[read.list], read.list).toBe(
        read.collection,
      );
      expect(
        fixtureRecordsOf(read.collection).length,
        read.collection,
      ).toBeGreaterThan(0);
      expect(
        readMethodsOf(clientOf(read.client).real, /^get[A-Z]/),
        `${read.client}.${read.get}`,
      ).toContain(read.get);
    }
  });

  it('preserves every canonical A4 collection in the fixture store and its complete parent membership', async () => {
    await configureLoaded();
    const stored = await TestBed.inject(PreviewFixtureStore).load();
    for (const read of A4_READS) {
      const records = fixtureRecordsOf(read.collection);
      expect(stored).toHaveProperty(read.collection, records);
      const parentCollection =
        read.parent.fixture === 'caseId'
          ? 'cases'
          : read.parent.fixture === 'clockId'
            ? 'clocks'
            : read.parent.fixture === 'agendaItemId'
              ? 'agendaItems'
              : 'sessions';
      const parentIds = fixtureIdsOf(parentCollection);
      for (const record of records)
        expect(
          parentIds.has(String(record[read.parent.fixture])),
          `${read.collection} ${record.id}`,
        ).toBe(true);
    }
    TestBed.inject(HttpTestingController).expectNone(() => true);
  });

  A4_READS.forEach((read) => {
    it(`dado a fixture canônica e pv_estado=loaded quando Preview${read.client}.${read.list}({}) então ids e total são exatamente o subconjunto autorizado de ${read.collection}`, async () => {
      await configureLoaded();
      const records = analystVisibleRecords(read);
      const page = (await instanceOf(read.client)[read.list]({})) as ListPage<{
        readonly id: string;
      }>;
      expect(sortedIds(page.items)).toEqual(sortedIds(records));
      expect(page.total).toBe(records.length);
    });

    it(`dado a fixture canônica e pv_estado=loaded quando Preview${read.client}.${read.list}({ filtro: { ${read.parent.filtro} } }) para cada ${read.parent.fixture} da JSON então os ids são exatamente os registros autorizados de ${read.collection} desse pai (inclusive negação vazia)`, async () => {
      await configureLoaded();
      const records = fixtureRecordsOf(read.collection);
      const parents = [
        ...new Set(
          records.map((record) => String(record[read.parent.fixture])),
        ),
      ];
      expect(parents.length).toBeGreaterThan(0);
      for (const parent of parents) {
        const expected = analystVisibleRecords(read).filter(
          (record) => String(record[read.parent.fixture]) === parent,
        );
        const page = (await instanceOf(read.client)[read.list]({
          filtro: { [read.parent.filtro]: parent },
        })) as ListPage<{ readonly id: string }>;
        expect(sortedIds(page.items), `${read.list} ${parent}`).toEqual(
          sortedIds(expected),
        );
        expect(page.total, `${read.list} ${parent}`).toBe(expected.length);
      }
    });

    it(`dado a fixture canônica e pv_estado=loaded quando Preview${read.client}.${read.get}(id) para cada registro de ${read.collection} então resolve os registros autorizados e nega explicitamente os demais sem removê-los da JSON`, async () => {
      await configureLoaded();
      const visibleIds = new Set(
        analystVisibleRecords(read).map((record) => record.id),
      );
      expect(
        visibleIds.size,
        `${read.collection} positive authorized control`,
      ).toBeGreaterThan(0);
      for (const record of fixtureRecordsOf(read.collection)) {
        if (!visibleIds.has(record.id)) {
          await expect(
            instanceOf(read.client)[read.get](record.id),
            `${read.get} denied ${record.id}`,
          ).rejects.toThrow();
          continue;
        }
        const found = (await instanceOf(read.client)[read.get](
          record.id,
        )) as Readonly<Record<string, unknown>>;
        expect(found['id'], `${read.get} ${record.id}`).toBe(record.id);
        expect(found[read.parent.filtro], `${read.get} ${record.id}`).toBe(
          record[read.parent.fixture],
        );
      }
      TestBed.inject(HttpTestingController).expectNone(() => true);
    });
  });
});

describe('C-06 — list* sem coleção na fixture devolve lista vazia, nunca inventada (D-07)', () => {
  it('dado o mapa CLIENTS após o PR #184 (A4/A5) quando filtradas as leituras sem coleção então só InfractionClient e NotificationClient (nenhuma leitura de CaseClient/WorklistClient/SessionClient/OrgClient/IntegrationClient/CollectionClient fica sem coleção)', () => {
    const withoutCollection = CLIENTS.filter((client) =>
      Object.values(client.lists).some((collection) => collection === null),
    ).map((client) => client.name);
    expect(withoutCollection).toEqual([
      'InfractionClient',
      'NotificationClient',
    ]);
    for (const name of withoutCollection) {
      expect(
        Object.values(clientOf(name).lists).every(
          (collection) => collection === null,
        ),
        name,
      ).toBe(true);
    }
  });

  CLIENTS.forEach((client) => {
    Object.entries(client.lists)
      .filter((entry) => entry[1] === null)
      .forEach(([method]) => {
        it(`dado a fixture canônica sem chave para ${method} e pv_estado=loaded quando Preview${client.name}.${method}({}) então items = [] e total = 0`, async () => {
          await configureLoaded();
          const page = await listOf(client, method);
          expect(page.items).toEqual([]);
          expect(page.total).toBe(0);
        });
      });
  });
});

describe('C-06 — relógio fixo (P-15, D-05)', () => {
  it('dado preview-clock.ts quando lido então PREVIEW_NOW_ISO = 2026-09-14T12:00:00-04:00 e começa por today da fixture', () => {
    expect(PREVIEW_NOW_ISO).toBe('2026-09-14T12:00:00-04:00');
    expect(PREVIEW_NOW_ISO.startsWith(fixtureToday())).toBe(true);
  });

  it('dado providePreviewMode() quando RaitClock é injetado então é PreviewClock e now() = Date.parse(PREVIEW_NOW_ISO), constante entre chamadas', async () => {
    await configureLoaded();
    const clock = TestBed.inject(RaitClock);
    expect(clock).toBeInstanceOf(PreviewClock);
    expect(clock.now()).toBe(Date.parse('2026-09-14T12:00:00-04:00'));
    expect(clock.now()).toBe(clock.now());
  });

  it('dado src/app/preview/** (produção, sem specs) quando varrido então nenhum arquivo chama Date.now [negativo]', () => {
    const needle = ['Date', 'now('].join('.');
    const offenders = previewSourceFiles().filter((file) =>
      readFileSync(file, 'utf8').includes(needle),
    );
    expect(offenders).toEqual([]);
  });
});

describe('C-06 — sessão sintética (D-03) e substituições (M2/P-17)', () => {
  it('dado providePreviewMode() quando StynxSessionService é injetado então é PreviewStynxSessionService com tenantId = tenant de rait-fixtures.json', async () => {
    await configureLoaded();
    const session = TestBed.inject(StynxSessionService);
    expect(session).toBeInstanceOf(PreviewStynxSessionService);
    expect(session.state().tenantId).toBe(fixtureTenantId());
  });

  it('dado a sessão sintética sob rait-analyst quando lido state() então ativa, sem tokens nem sid, claims só com cognito:groups e roles = [rait-analyst] (sem sub/name/email)', async () => {
    await configureLoaded();
    const state = TestBed.inject(StynxSessionService).state();
    expect(state.active).toBe(true);
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.sid).toBeNull();
    expect(state.claims).toEqual({
      'cognito:groups': ['rait-analyst'],
      roles: ['rait-analyst'],
    });
  });

  it('dado providePreviewMode() quando RaitSessionFacade, RaitStreamTransport são injetados então PreviewSessionFacade e PreviewStreamTransport', async () => {
    await configureLoaded();
    expect(TestBed.inject(RaitSessionFacade)).toBeInstanceOf(
      PreviewSessionFacade,
    );
    expect(TestBed.inject(RaitStreamTransport)).toBeInstanceOf(
      PreviewStreamTransport,
    );
  });
});

/** Arquivos de produção de `src/app/preview/**` (exclui `*.spec.ts` e o helper de specs). */
function previewSourceFiles(): string[] {
  const root = join(APP_SRC_ROOT, 'app', 'preview');
  const files: string[] = [];
  function walk(dir: string): void {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (
        (entry.name.endsWith('.ts') || entry.name.endsWith('.json')) &&
        !entry.name.endsWith('.spec.ts') &&
        entry.name !== 'preview.spec-helper.ts'
      ) {
        files.push(path);
      }
    }
  }
  walk(root);
  return files.sort();
}

describe('C-06 — nenhum dado fixado no código da prévia (P-13)', () => {
  const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

  it('dado src/app/preview/** (produção) quando varrido então nenhum UUID além do tenant das fixtures [negativo]', () => {
    const tenant = fixtureTenantId();
    const found = previewSourceFiles().flatMap((file) =>
      [...readFileSync(file, 'utf8').matchAll(UUID)]
        .map((match) => match[0].toLowerCase())
        .filter((uuid) => uuid !== tenant)
        .map((uuid) => `${file.split('/src/app/').pop()}: ${uuid}`),
    );
    expect(found).toEqual([]);
  });

  it('dado src/app/preview/** (produção) quando varrido então nenhum nome de pessoa de rait-fixtures.json users[].name aparece (a persona não é exibida, D-03) [negativo]', () => {
    const users = readFixturesJson()['users'] as readonly {
      readonly name: string;
    }[];
    const found = previewSourceFiles().flatMap((file) => {
      const text = readFileSync(file, 'utf8');
      return users
        .filter((user) => text.includes(user.name))
        .map((user) => `${file.split('/src/app/').pop()}: ${user.name}`);
    });
    expect(found).toEqual([]);
  });

  it('dado preview-fixtures.ts quando lido então PREVIEW_SOURCE_PENDING = "source_pending" (D-06)', () => {
    expect(PREVIEW_SOURCE_PENDING).toBe('source_pending');
  });
});

describe('C-06 — source_pending só onde o inventário o prevê (telas da JW-01 em loaded)', () => {
  JW01_SCREENS.filter((screen) => !screen.sourcePendingAllowed).forEach(
    (screen) => {
      const row = inventoryRowOf(screen.route);
      it(`dado JW-01 passo ${screen.step} (${row.previewPath}) sob rait-analyst em loaded quando renderizada então nenhum texto "source_pending" (o inventário não o prevê nesta tela) [negativo]`, async () => {
        const url = setPreviewDocument(
          row.previewPath,
          'rait-analyst',
          'loaded',
        );
        const harness = await createPreviewHarness(
          previewSpecContext().providers,
        );
        await harness.navigateByUrl(url);
        await settle(harness);
        const text = (harness.routeNativeElement as HTMLElement).textContent;
        expect(text).not.toContain('source_pending');
      });
    },
  );

  it('dado JW01_SCREENS quando filtradas as telas com source_pending previsto então só o passo 8 (/casos/:id/minuta, inventário §5.1 e §3 linha 11)', () => {
    expect(
      JW01_SCREENS.filter((screen) => screen.sourcePendingAllowed).map(
        (screen) => screen.route,
      ),
    ).toEqual(['casos/:id/minuta']);
  });
});

// D23 is a fixture-backed READ, not an M8 command or an authorization bypass.
describe('D23 canonical case access before five preview presentation states', () => {
  it('classifies verifyCaseAccess explicitly as an overridden control READ', () => {
    expect(Object.getOwnPropertyNames(CaseClient.prototype)).toContain(
      'verifyCaseAccess',
    );
    expect(Object.hasOwn(PreviewCaseClient.prototype, 'verifyCaseAccess')).toBe(
      true,
    );
  });
  for (const state of [
    'loaded',
    'empty',
    'loading',
    'error',
    'forbidden',
  ] as const) {
    it(`${state}: a role omitted from triage remains denied before the control read`, async () => {
      setPreviewDocument('/painel', 'rait-hr', state);
      await configurePreview(previewSpecContext().providers);
      const client = TestBed.inject(CaseClient);
      const verify = vi.spyOn(client, 'verifyCaseAccess');
      const value = TestBed.runInInjectionContext(() =>
        roleGuard(['rait-analyst', 'rait-secretary'])(
          {} as ActivatedRouteSnapshot,
          { url: '/casos/fixture/triagem' } as RouterStateSnapshot,
        ),
      );
      expect(value).not.toBe(true);
      expect(verify).not.toHaveBeenCalled();
      TestBed.inject(HttpTestingController).expectNone(() => true);
      TestBed.inject(HttpTestingController).verify();
    });
    for (const known of [true, false]) {
      it(`${state}: real guard ${known ? 'accepts only canonical case' : 'denies unknown fixture ID'} with zero HTTP`, async () => {
        setPreviewDocument('/painel', 'rait-analyst', state);
        await configurePreview(previewSpecContext().providers);
        const id = known
          ? [...fixtureIdsOf('cases')][0]!
          : '71000000-0000-7000-8000-000000009999';
        let result: unknown;
        let settled = false;
        const pending = TestBed.runInInjectionContext(() =>
          caseAccessGuard(
            {
              paramMap: convertToParamMap({ id }),
            } as unknown as ActivatedRouteSnapshot,
            { url: `/casos/${id}` } as RouterStateSnapshot,
          ),
        );
        void Promise.resolve(pending).then((value) => {
          result = value;
          settled = true;
        });
        await vi.waitFor(() => expect(settled).toBe(true), { timeout: 250 });
        expect(result).toBe(known);
        const client = TestBed.inject(CaseClient);
        expect(client.etagOf('cases', id)).toBeNull();
        if (!known)
          await expect(client.verifyCaseAccess(id)).rejects.toThrow(
            `rait-preview-fixture-missing:cases:${id}`,
          );
        TestBed.inject(HttpTestingController).expectNone(() => true);
        TestBed.inject(HttpTestingController).verify();
      });
    }
  }
});
