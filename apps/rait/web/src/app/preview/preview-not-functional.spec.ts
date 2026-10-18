// R-0033 TASK-0002 (Inspector). C-03 (ações) / P-07 / P-08 / P-20 / M2 / M6 / D-11
// (`frontend-preview-mode.md` §6, §7, §9; prompt TASK-0002 item 4). (a) Lista fechada de comandos
// acionáveis da JW-01 (`inventory-rait-web.md` §5.2: `claim-next`, `triage`, `admit`, `reject`,
// `open-inquiry`, `submit-draft`): a ação da página é acionada (confirmando o
// `stynx-confirm-dialog` quando a ficha exige) → `PreviewActionLog.entries()` ganha exatamente a
// string M8, a faixa (`<p role="status">`) mostra "Não funcional na prévia: <M8> não foi
// executado.", a página mostra o banner "Indisponível nesta versão." (`rait.common.unavailable`,
// texto distinto), o `CommandRunner.error()` da facade é `kind 'unavailable'`, nenhuma requisição,
// nenhuma navegação de sucesso. As ações são acionadas pelo método da página que o botão chama
// (o botão é provado presente sob `*stynxHasPermission`); `open-inquiry` e `submit-draft` exigem
// texto livre (assunto, fatos, fundamentos) que nenhuma fonte canônica fornece — o spec não o
// inventa e aciona o método diretamente. (b) Botões provados por ausência (§5.2/§4 item 3); A5
// item 5 (b): no passo 6 a coleção `inquiries` (A4) tem registro do caso da URL — a prova passa a
// positiva: um `rait-inquiry-card` por diligência da JSON desse caso e "responder"/"prorrogar"
// (`rait-case:answer`/`rait-case:extend`, strings M8 de `RAIT_COMMANDS` usadas por
// `CaseFacade.answerInquiry`/`extendInquiry`) acionados como não funcionais, nunca sucesso.
// (c) Cada `Preview<Cliente>Client` estende o cliente real e sobrescreve todo método de comando
// (lido do protótipo); os 64 métodos registram a string M8 e rejeitam
// `RaitCommandUnavailableError` com o mesmo `command` (tabela §6). Produção (TASK-0003): ainda não
// existe — falha de módulo esperada nesta entrega.
import { HttpTestingController } from '@angular/common/http/testing';
import type { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import type { RouterTestingHarness } from '@angular/router/testing';
import { StynxConfirmDialogComponent } from '@stynx-nyx/angular-ui';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from 'vitest';
import { readAppCatalog } from '../../testing/kb';
import { RaitCommandUnavailableError } from '../core/error-boundary';
import { CaseClient } from '../data/api/case.client';
import { CollectionClient } from '../data/api/collection.client';
import { InfractionClient } from '../data/api/infraction.client';
import { IntegrationClient } from '../data/api/integration.client';
import { NotificationClient } from '../data/api/notification.client';
import { OrgClient } from '../data/api/org.client';
import { RaitHttp } from '../data/api/rait-http';
import { SessionClient } from '../data/api/session.client';
import { WorklistClient } from '../data/api/worklist.client';
import { CaseFacade } from '../data/facades/case.facade';
import { QueueFacade } from '../data/facades/queue.facade';
import { RAIT_COMMANDS } from '../data/models';
import { DraftPageComponent } from '../features/caso/pages/draft.page';
import { InquiriesPageComponent } from '../features/caso/pages/inquiries.page';
import { TriagePageComponent } from '../features/caso/pages/triage.page';
import { DefensePoolQueuePageComponent } from '../features/fila/pages/defense-pool-queue.page';
import { PreviewCaseClient } from './adapters/preview-case.client';
import { PreviewCollectionClient } from './adapters/preview-collection.client';
import { PreviewInfractionClient } from './adapters/preview-infraction.client';
import { PreviewIntegrationClient } from './adapters/preview-integration.client';
import { PreviewNotificationClient } from './adapters/preview-notification.client';
import { PreviewOrgClient } from './adapters/preview-org.client';
import { PreviewSessionClient } from './adapters/preview-session.client';
import { PreviewWorklistClient } from './adapters/preview-worklist.client';
import { PreviewActionLog } from './preview-action-log';
import { PreviewBarComponent } from './preview-bar.component';
import {
  configurePreview,
  createPreviewHarness,
  inventoryRowOf,
  notFunctionalText,
  pathnameOf,
  previewSpecContext,
  readFixturesJson,
  resetPreviewDocument,
  setPreviewDocument,
  settle,
} from './preview.spec-helper';

/** `rait.common.unavailable` do catálogo do app ("Indisponível nesta versão."), lido do disco. */
const UNAVAILABLE_TEXT = readAppCatalog()['rait.common.unavailable'];

let getList: MockInstance;
let getOne: MockInstance;

beforeEach(() => {
  getList = vi.spyOn(RaitHttp.prototype, 'getList');
  getOne = vi.spyOn(RaitHttp.prototype, 'getOne');
});

afterEach(() => {
  vi.restoreAllMocks();
  resetPreviewDocument();
});

function expectNoNetwork(): void {
  TestBed.inject(HttpTestingController).verify();
  expect(getList).not.toHaveBeenCalled();
  expect(getOne).not.toHaveBeenCalled();
}

function pageOf<T>(harness: RouterTestingHarness, type: Type<T>): T {
  const debug = harness.fixture.debugElement.query(By.directive(type));
  expect(debug, type.name).not.toBeNull();
  return debug.componentInstance as T;
}

function pageElementOf(
  harness: RouterTestingHarness,
  type: Type<unknown>,
): HTMLElement {
  const debug = harness.fixture.debugElement.query(By.directive(type));
  expect(debug, type.name).not.toBeNull();
  return debug.nativeElement as HTMLElement;
}

/** Critérios editáveis do checklist (`triage.page.ts` `EDITABLE_CRITERIA`); veredito = escolha do usuário. */
const EDITABLE_CRITERIA = ['legitimidade', 'assinatura', 'pedido_compativel'];

function checkAllCriteriaTrue(element: HTMLElement): void {
  for (const criterion of EDITABLE_CRITERIA) {
    const radio = element.querySelector<HTMLInputElement>(
      `rait-admissibility-checklist li[data-criterion="${criterion}"] input[type="radio"][value="true"]`,
    );
    expect(radio, criterion).not.toBeNull();
    (radio as HTMLInputElement).checked = true;
    (radio as HTMLInputElement).dispatchEvent(new Event('change'));
  }
}

/** Primeira opção não vazia do `<select>` de inciso (`NON_ADMISSION_REASONS` da página, lido do DOM). */
function chooseFirstReason(element: HTMLElement): void {
  const select = element.querySelector<HTMLSelectElement>(
    '#rait-triage-reason',
  );
  expect(select).not.toBeNull();
  const option = [...(select?.options ?? [])].find(
    (candidate) => candidate.value !== '',
  );
  expect(option).toBeDefined();
  (select as HTMLSelectElement).value = (option as HTMLOptionElement).value;
  (select as HTMLSelectElement).dispatchEvent(new Event('change'));
}

/**
 * Confirmação de efeito jurídico (`createConfirmQueue`, guia §3.3): o diálogo está aberto e nada
 * foi registrado antes do "confirmar"; então confirma.
 */
function confirmDialog(harness: RouterTestingHarness): void {
  harness.detectChanges();
  expect(TestBed.inject(PreviewActionLog).entries()).toHaveLength(0);
  const dialog = harness.fixture.debugElement.query(
    By.directive(StynxConfirmDialogComponent),
  );
  expect(dialog).not.toBeNull();
  const instance = dialog.componentInstance as StynxConfirmDialogComponent;
  expect(instance.open).toBe(true);
  instance.confirm.emit();
}

interface Jw01Action {
  readonly step: string;
  /** String M8 (`RaitCommandUnavailableError.command`, contrato §6). */
  readonly command: string;
  readonly route: string;
  readonly page: Type<unknown>;
  /** Botão sob `*stynxHasPermission` que a ação usa na página. */
  readonly button: string;
  readonly facade: 'case' | 'queue';
  /** A ficha exige confirmação (`stynx-confirm-dialog`) antes do comando. */
  readonly confirm: boolean;
  /** Aciona a ação como o botão o faz (e confirma o diálogo quando `confirm`). */
  readonly trigger: (harness: RouterTestingHarness) => void;
}

/** Inventário §5.2 — comandos acionáveis da JW-01 (lista fechada; P-07). */
const JW01_ACTIONS: readonly Jw01Action[] = [
  {
    step: '2',
    command: 'rait-case:claim-next',
    route: 'fila/defesa',
    page: DefensePoolQueuePageComponent,
    button: '[data-primary-action][data-command="rait-case:claim-next"]',
    facade: 'queue',
    confirm: true,
    trigger: (harness) => {
      pageOf(harness, DefensePoolQueuePageComponent).requestClaimNext();
      confirmDialog(harness);
    },
  },
  {
    step: '3',
    command: 'rait-case:triage',
    route: 'casos/:id/triagem',
    page: TriagePageComponent,
    button: '[data-action="triage"]',
    facade: 'case',
    confirm: false,
    trigger: (harness) => {
      checkAllCriteriaTrue(pageElementOf(harness, TriagePageComponent));
      harness.detectChanges();
      pageOf(harness, TriagePageComponent).saveChecklist();
    },
  },
  {
    step: '4',
    command: 'rait-case:admit',
    route: 'casos/:id/triagem',
    page: TriagePageComponent,
    button: '[data-action="admit"]',
    facade: 'case',
    confirm: true,
    trigger: (harness) => {
      pageOf(harness, TriagePageComponent).requestAdmit();
      confirmDialog(harness);
    },
  },
  {
    step: '4',
    command: 'rait-case:reject',
    route: 'casos/:id/triagem',
    page: TriagePageComponent,
    button: '[data-action="reject"]',
    facade: 'case',
    confirm: true,
    trigger: (harness) => {
      chooseFirstReason(pageElementOf(harness, TriagePageComponent));
      harness.detectChanges();
      pageOf(harness, TriagePageComponent).requestReject();
      confirmDialog(harness);
    },
  },
  {
    step: '6',
    command: 'rait-case:open-inquiry',
    route: 'casos/:id/diligencias',
    page: InquiriesPageComponent,
    button: '[data-open-inquiry] [data-action="open"]',
    facade: 'case',
    confirm: true,
    trigger: (harness) => {
      pageOf(harness, InquiriesPageComponent).requestOpenFromForm();
      confirmDialog(harness);
    },
  },
  {
    step: '8',
    command: 'rait-case:submit-draft',
    route: 'casos/:id/minuta',
    page: DraftPageComponent,
    button: '[data-action="submit"]',
    facade: 'case',
    confirm: true,
    trigger: (harness) => {
      pageOf(harness, DraftPageComponent).requestSubmit();
      confirmDialog(harness);
    },
  },
];

async function openJw01(route: string) {
  const path = inventoryRowOf(route).previewPath;
  const url = setPreviewDocument(path, 'rait-analyst', 'loaded');
  const harness = await createPreviewHarness(previewSpecContext().providers);
  await harness.navigateByUrl(url);
  await settle(harness);
  const barFixture = TestBed.createComponent(PreviewBarComponent);
  barFixture.detectChanges();
  return { harness, path, barFixture };
}

function commandErrorOf(facade: Jw01Action['facade']) {
  return facade === 'case'
    ? TestBed.inject(CaseFacade).command.error()
    : TestBed.inject(QueueFacade).command.error();
}

/** Corpo comum de P-07: aciona, espera `kind 'unavailable'` e confere log, faixa, banner, rede. */
async function expectNotFunctional(action: Jw01Action): Promise<void> {
  const { harness, path, barFixture } = await openJw01(action.route);
  const log = TestBed.inject(PreviewActionLog);
  const page = pageElementOf(harness, action.page);
  expect(page.querySelector(action.button)).not.toBeNull();

  action.trigger(harness);

  await vi.waitFor(() => {
    harness.detectChanges();
    expect(commandErrorOf(action.facade)?.kind).toBe('unavailable');
  });
  expect(commandErrorOf(action.facade)?.command).toBe(action.command);
  expect(log.entries().map((entry) => entry.command)).toEqual([action.command]);

  barFixture.detectChanges();
  const status = (barFixture.nativeElement as HTMLElement).querySelector(
    'p[role="status"]',
  );
  expect(status?.textContent?.trim()).toBe(notFunctionalText(action.command));

  const banners = [...page.querySelectorAll('rait-error-banner')].map(
    (banner) => banner.textContent ?? '',
  );
  expect(banners.some((text) => text.includes(UNAVAILABLE_TEXT))).toBe(true);
  expect(UNAVAILABLE_TEXT).not.toBe(notFunctionalText(action.command));

  expect(pathnameOf(TestBed.inject(Router).url)).toBe(path);
  expectNoNetwork();
}

describe('C-03 — ações da JW-01 na prévia: "não funcional na prévia", nunca sucesso (P-07, M6)', () => {
  JW01_ACTIONS.forEach((action) => {
    it(`dado JW-01 passo ${action.step} sob rait-analyst quando ${action.command} é acionado${action.confirm ? ' e confirmado' : ''} então PreviewActionLog registra só "${action.command}", a faixa mostra "${notFunctionalText(action.command)}", a página mostra "${UNAVAILABLE_TEXT}" (kind unavailable) e nenhuma requisição sai`, async () => {
      await expectNotFunctional(action);
    });
  });

  it('dado a lista fechada da JW-01 (inventário §5.2) quando contada então 6 comandos acionáveis, todos em RAIT_COMMANDS', () => {
    expect(JW01_ACTIONS.map((action) => action.command)).toEqual([
      'rait-case:claim-next',
      'rait-case:triage',
      'rait-case:admit',
      'rait-case:reject',
      'rait-case:open-inquiry',
      'rait-case:submit-draft',
    ]);
    for (const action of JW01_ACTIONS) {
      expect(RAIT_COMMANDS as readonly string[]).toContain(action.command);
    }
  });
});

describe('C-03 — botões da JW-01 provados por ausência (inventário §4 item 3, §5.2)', () => {
  it('dado JW-01 passo 5 (dossiê) sob rait-analyst quando renderizado então "anexar de ofício" (rait-document:attach-official) não existe — chave fora de RAIT_COMMAND_RULES, fail-closed [negativo]', async () => {
    const { harness } = await openJw01('casos/:id/dossie');
    const root = harness.routeNativeElement as HTMLElement;
    expect(root.querySelector('[data-attach-official]')).toBeNull();
    expect(root.querySelector('[data-action="attach-official"]')).toBeNull();
    expect(TestBed.inject(PreviewActionLog).entries()).toHaveLength(0);
  });
});

// --- passo 6: diligências da fixture (A5 item 5 (b)) ---------------------------------------------

const INQUIRIES_ROUTE = 'casos/:id/diligencias';

interface FixtureInquiry {
  readonly id: string;
  readonly caseId: string;
  readonly subject: string;
}

/** Diligências de `rait-fixtures.json` (`inquiries`, A4) do caso da URL de prévia do passo 6. */
function inquiriesOfStep6(): readonly FixtureInquiry[] {
  const caseId = inventoryRowOf(INQUIRIES_ROUTE).previewPath.split('/')[2];
  const inquiries = readFixturesJson()[
    'inquiries'
  ] as readonly FixtureInquiry[];
  return inquiries.filter((inquiry) => inquiry.caseId === caseId);
}

/** Primeira diligência da JSON do caso do passo 6 (id lido do disco, nunca transcrito). */
function firstInquiryIdOfStep6(): string {
  const first = inquiriesOfStep6()[0];
  expect(first).toBeDefined();
  return (first as FixtureInquiry).id;
}

/** "responder"/"prorrogar" do `InquiryCard` (ficha 010 §6; `inquiries.page.ts`). */
const INQUIRY_CARD_ACTIONS: readonly Jw01Action[] = [
  {
    step: '6',
    command: 'rait-case:answer',
    route: INQUIRIES_ROUTE,
    page: InquiriesPageComponent,
    button: 'rait-inquiry-card [data-action="answer"]',
    facade: 'case',
    confirm: false,
    trigger: (harness) => {
      pageOf(harness, InquiriesPageComponent).answer(firstInquiryIdOfStep6());
    },
  },
  {
    step: '6',
    command: 'rait-case:extend',
    route: INQUIRIES_ROUTE,
    page: InquiriesPageComponent,
    button: 'rait-inquiry-card [data-action="extend"]',
    facade: 'case',
    confirm: true,
    trigger: (harness) => {
      pageOf(harness, InquiriesPageComponent).requestExtend(
        firstInquiryIdOfStep6(),
      );
      confirmDialog(harness);
    },
  },
];

describe('C-03 — passo 6: diligências da fixture e "responder"/"prorrogar" não funcionais (A5 item 5 (b))', () => {
  it('dado inquiries de rait-fixtures.json quando filtradas pelo caso da URL do passo 6 então há ao menos um registro (A4)', () => {
    expect(inquiriesOfStep6().length).toBeGreaterThan(0);
  });

  it('dado JW-01 passo 6 (diligências) sob rait-analyst em loaded quando renderizado então um rait-inquiry-card por diligência da JSON do caso, com o assunto da JSON, e nada registrado no PreviewActionLog', async () => {
    const expected = inquiriesOfStep6();
    const { harness } = await openJw01(INQUIRIES_ROUTE);
    const root = harness.routeNativeElement as HTMLElement;
    const cards = [...root.querySelectorAll('rait-inquiry-card')];
    expect(cards).toHaveLength(expected.length);
    expect(
      cards.map(
        (card) =>
          card
            .querySelector('.rait-inquiry-card__subject')
            ?.textContent?.trim() ?? '',
      ),
    ).toEqual(expected.map((inquiry) => inquiry.subject));
    expect(TestBed.inject(PreviewActionLog).entries()).toHaveLength(0);
  });

  it('dado as ações do InquiryCard quando lidas então rait-case:answer e rait-case:extend, ambas em RAIT_COMMANDS', () => {
    expect(INQUIRY_CARD_ACTIONS.map((action) => action.command)).toEqual([
      'rait-case:answer',
      'rait-case:extend',
    ]);
    for (const action of INQUIRY_CARD_ACTIONS) {
      expect(RAIT_COMMANDS as readonly string[]).toContain(action.command);
    }
  });

  INQUIRY_CARD_ACTIONS.forEach((action) => {
    it(`dado JW-01 passo 6 sob rait-analyst quando ${action.command} é acionado no rait-inquiry-card${action.confirm ? ' e confirmado' : ''} então PreviewActionLog registra só "${action.command}", a faixa mostra "${notFunctionalText(action.command)}", a página mostra "${UNAVAILABLE_TEXT}" (kind unavailable) e nenhuma requisição sai`, async () => {
      await expectNotFunctional(action);
    });
  });
});

// --- adapters ----------------------------------------------------------------------------------

type AnyClass = abstract new (...args: never[]) => object;

interface AdapterPair {
  readonly name: string;
  readonly real: AnyClass;
  readonly preview: AnyClass;
  /** Método → string M8 (contrato §6, tabela "Cliente | Método → string M8"). */
  readonly commands: Readonly<Record<string, string>>;
}

const ADAPTERS: readonly AdapterPair[] = [
  {
    name: 'CaseClient',
    real: CaseClient,
    preview: PreviewCaseClient,
    commands: {
      protocol: 'rait-case:protocol',
      triage: 'rait-case:triage',
      saveAdmissibility: 'rait-admissibility:create',
      admit: 'rait-case:admit',
      reject: 'rait-case:reject',
      remitJari: 'rait-case:remit-jari',
      receiveJudgingBody: 'rait-case:receive-judging-body',
      openInquiry: 'rait-case:open-inquiry',
      answerInquiry: 'rait-case:answer',
      extendInquiry: 'rait-case:extend',
      submitDraft: 'rait-case:submit-draft',
      signDecision: 'rait-decision:sign',
      returnDraft: 'rait-decision:return-draft',
      authorityDecide: 'rait-appeal:authority-decide',
      waive: 'rait-appeal:waive',
      withdraw: 'rait-case:withdraw',
      declareExtinction: 'rait-extinction:declare',
      attachOfficialDocument: 'rait-document:attach-official',
      resolvePendingContent: 'rait-case:resolve-pending-content',
      redirect: 'rait-case:redirect',
    },
  },
  {
    name: 'WorklistClient',
    real: WorklistClient,
    preview: PreviewWorklistClient,
    commands: {
      claimNext: 'rait-case:claim-next',
      openBatch: 'rait-batch:open',
      drawBatch: 'rait-batch:draw',
      approveBatch: 'rait-batch:approve',
      acceptBatchItem: 'rait-batch:accept',
      impedeBatchItem: 'rait-batch:impede',
      reassign: 'rait-assignment:reassign',
      declareImpediment: 'rait-impediment:declare',
      registerSuspicion: 'rait-impediment:suspicion',
      publishSchedule: 'rait-schedule:publish',
      registerMandate: 'rait-member:mandate',
      constituteUnit: 'rait-unit:constitute',
      activateUnit: 'rait-unit:activate',
      acknowledgeClockAlert: 'rait-clock:acknowledge-alert',
      decideImpediment: 'rait-impediment:decide',
      updatePool: 'rait-pool:update',
    },
  },
  {
    name: 'SessionClient',
    real: SessionClient,
    preview: PreviewSessionClient,
    commands: {
      registerOpinion: 'rait-opinion:register',
      closeAgenda: 'rait-agenda:close',
      openSession: 'rait-session:open',
      adjournSession: 'rait-session:adjourn',
      vote: 'rait-session:vote',
      castingVote: 'rait-session:casting-vote',
      requestView: 'rait-session:view-request',
      proclaim: 'rait-session:proclaim',
      generateMinutes: 'rait-minutes:generate',
      signMinutes: 'rait-minutes:sign',
      publishMinutes: 'rait-minutes:publish',
      confirmAttendance: 'rait-attendance:confirm',
      summonSubstitute: 'rait-attendance:summon-substitute',
      registerViewVote: 'rait-session:register-view-vote',
      conveneExtraordinary: 'rait-session:convene-extraordinary',
    },
  },
  {
    name: 'OrgClient',
    real: OrgClient,
    preview: PreviewOrgClient,
    commands: {
      generateJetonSheet: 'rait-jeton:generate',
      approveJetonSheet: 'rait-jeton:approve',
      createSuspensionAct: 'rait-suspension-act:create',
      updateParameter: 'rait-parameter:update',
      createExport: 'rait-export:create',
      publishCapacityPlan: 'rait-capacity-plan:publish',
      reviewQualitySample: 'rait-quality-sample:review',
      updateCalendar: 'rait-calendar:update',
    },
  },
  {
    name: 'IntegrationClient',
    real: IntegrationClient,
    preview: PreviewIntegrationClient,
    commands: {
      retry: 'rait-integration:retry',
      reconcile: 'rait-integration:reconcile',
    },
  },
  {
    name: 'CollectionClient',
    real: CollectionClient,
    preview: PreviewCollectionClient,
    commands: {
      issueDocument: 'rait-collection:issue',
      orderRefund: 'rait-refund:order',
      handoffDebt: 'rait-debt:handoff',
      reconcilePayment: 'rait-payment:reconcile',
    },
  },
  {
    name: 'InfractionClient',
    real: InfractionClient,
    preview: PreviewInfractionClient,
    commands: {},
  },
  {
    name: 'NotificationClient',
    real: NotificationClient,
    preview: PreviewNotificationClient,
    commands: {},
  },
];

const NON_COMMAND_MEMBERS: ReadonlySet<string> = new Set([
  'constructor',
  'etagOf',
]);

/** Métodos de comando do cliente real, lidos do protótipo (nem `list*`/`get*`, nem `etagOf`). */
function commandMethodsOf(type: AnyClass): readonly string[] {
  return Object.getOwnPropertyNames(type.prototype)
    .filter((name) => !NON_COMMAND_MEMBERS.has(name))
    .filter((name) => !/^(list|get)[A-Z]/.test(name))
    .sort();
}

async function configureAdapters(): Promise<void> {
  setPreviewDocument('/painel', 'rait-analyst', 'loaded');
  await configurePreview(previewSpecContext().providers);
}

describe('C-03 — adapters estendem os clientes reais e sobrescrevem todo comando (M2)', () => {
  ADAPTERS.forEach((pair) => {
    it(`dado providePreviewMode() quando ${pair.name} é injetado então a instância é Preview${pair.name} e também instanceof ${pair.name}`, async () => {
      await configureAdapters();
      const instance = TestBed.inject(pair.real as Type<object>);
      expect(instance).toBeInstanceOf(pair.preview);
      expect(instance).toBeInstanceOf(pair.real);
      expect(pair.preview.prototype).toBeInstanceOf(pair.real);
    });

    it(`dado o protótipo de ${pair.name} quando lidos os métodos de comando então cada um é sobrescrito em Preview${pair.name} e coincide com a tabela §6 (${Object.keys(pair.commands).length})`, () => {
      const methods = commandMethodsOf(pair.real);
      expect(methods).toEqual(Object.keys(pair.commands).sort());
      for (const method of methods) {
        expect(
          Object.prototype.hasOwnProperty.call(pair.preview.prototype, method),
          `${pair.name}.${method}`,
        ).toBe(true);
      }
    });
  });

  it('dado a tabela §6 quando somadas as strings M8 então 65, iguais (conjunto e ordem-livre) a RAIT_COMMANDS', () => {
    const all = ADAPTERS.flatMap((pair) => Object.values(pair.commands));
    expect(all).toHaveLength(65);
    expect(new Set(all)).toEqual(new Set(RAIT_COMMANDS));
  });
});

describe('C-03 — cada comando dos adapters registra a string M8 e rejeita RaitCommandUnavailableError (P-08, D-11)', () => {
  ADAPTERS.forEach((pair) => {
    Object.entries(pair.commands).forEach(([method, command]) => {
      it(`dado Preview${pair.name}.${method}() quando chamado então PreviewActionLog ganha "${command}" e a promessa rejeita RaitCommandUnavailableError("${command}") sem requisição`, async () => {
        await configureAdapters();
        const instance = TestBed.inject(pair.real as Type<object>) as Record<
          string,
          () => Promise<unknown>
        >;
        const log = TestBed.inject(PreviewActionLog);

        const outcome = instance[method]();
        await expect(outcome).rejects.toBeInstanceOf(
          RaitCommandUnavailableError,
        );
        await expect(outcome).rejects.toMatchObject({ command });
        expect(log.entries().map((entry) => entry.command)).toEqual([command]);
        expectNoNetwork();
      });
    });
  });
});
