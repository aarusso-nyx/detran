// R-0033 TASK-0002 (Inspector). C-06 / P-13 / P-15 / P-17 / D-03 / D-05 / D-06 / D-07
// (`frontend-preview-mode.md` §1 item 3, §2, §7, §9; prompt TASK-0002 item 7). Com a fixture
// canônica carregada (`rait-fixtures.json` lido do disco): cada `Preview<Cliente>Client.list*()`
// devolve só itens cujo `id` existe na coleção correspondente do JSON (mapa método → coleção do
// inventário §2; método sem coleção → lista vazia, D-07); todo `list*`/`get*` do cliente real é
// sobrescrito; `PreviewClock.now()` = `Date.parse('2026-09-14T12:00:00-04:00')`, constante;
// `PreviewStynxSessionService.state().tenantId` = tenant das fixtures; sob `loaded` nenhum texto
// `source_pending` nas telas da JW-01 exceto a minuta (passo 8, única prevista pelo inventário).
// Produção (TASK-0003): ainda não existe — falha de módulo esperada nesta entrega.
import type { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { StynxSessionService } from '@stynx-nyx/angular-auth';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
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
import { PREVIEW_SOURCE_PENDING } from './preview-fixtures';
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
      listRaitParty: null,
      listRaitDocument: null,
      listRaitPendingContent: 'raitPendingContents',
      listRaitRedirect: 'raitRedirects',
      listRaitAdmissibility: null,
      listRaitDeadline: null,
      listRaitInquiry: null,
      listRaitDraft: 'raitDrafts',
      listRaitDecision: null,
      listRaitCommunication: null,
      listRaitCaseEvent: null,
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
      listRaitAssignment: null,
      listRaitImpediment: null,
      listRaitSubstituteDuty: 'raitSubstituteDuties',
      listRaitBench: 'raitBenches',
      listRaitClock: 'clocks',
      listRaitClockAlert: null,
    },
  },
  {
    name: 'SessionClient',
    real: SessionClient,
    preview: PreviewSessionClient,
    lists: {
      listRaitSession: 'sessions',
      listRaitAgendaItem: 'agendaItems',
      listRaitAttendance: null,
      listRaitVote: null,
      listRaitMinutes: null,
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
      for (const method of readMethodsOf(client.real, /^(list|get)[A-Z]/)) {
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

describe('C-06 — list* sem coleção na fixture devolve lista vazia, nunca inventada (D-07)', () => {
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
