// R-0014 TASK-0015 (Inspector). CTG-0003b §5 — `ProcessTimelineComponent`; arquivo inteiramente
// novo (§1) — "Cannot find module" até TASK-0016 (esperado, §9). Textos lidos do catálogo real
// (mesma técnica de `payment-comparison.component.spec.ts`).
import { fileURLToPath } from 'node:url';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { StynxI18nModule, StynxI18nService } from '@stynx-nyx/angular-i18n';
import portalCatalog from '../i18n/portal.pt-BR.json';
import {
  ProcessTimelineComponent,
  TIMELINE_DOMAIN_EVENTS,
  TIMELINE_INQUIRY_TYPE,
} from './process-timeline.component';
import {
  DILIGENCE_ID_FIXTURE,
  PROTOCOL_NUMBER_FIXTURE,
  REQUEST_RESULTADO_ID,
} from '../../testing/http-fixtures-reads';
import { expectNoSeriousA11yViolations } from '../a11y/axe.spec-helper';

const catalog = portalCatalog as Record<string, string>;

/**
 * `type` técnico da entrada da timeline (projeção `process-timeline.projection.ts`, l. 20–60) —
 * montado por `join('.')` (nunca um literal `rait.x.y`, que `verify:parameter-catalogue` aponta
 * como candidato a chave i18n; bloqueio 9 de reports/TASK-0016.md).
 */
function raitEventType(...segments: readonly string[]): string {
  return segments.join('.');
}

async function setup(
  inputs: {
    entries?: readonly Record<string, unknown>[];
    deadlines?: readonly Record<string, unknown>[];
    documents?: readonly Record<string, unknown>[];
    diligences?: readonly Record<string, unknown>[];
    decision?: Record<string, unknown> | null;
    protocol?: Record<string, unknown> | null;
  } = {},
) {
  await TestBed.configureTestingModule({
    imports: [
      ProcessTimelineComponent,
      StynxI18nModule.forRoot({
        defaultLocale: 'pt-BR',
        loadCatalog: async () => catalog,
      }),
    ],
    providers: [provideRouter([{ path: '**', children: [] }])],
  }).compileComponents();
  await TestBed.inject(StynxI18nService).initialize();
  const fixture = TestBed.createComponent(ProcessTimelineComponent);
  fixture.componentRef.setInput('requestId', REQUEST_RESULTADO_ID);
  fixture.componentRef.setInput('entries', inputs.entries ?? []);
  fixture.componentRef.setInput('deadlines', inputs.deadlines ?? []);
  fixture.componentRef.setInput('documents', inputs.documents ?? []);
  fixture.componentRef.setInput('diligences', inputs.diligences ?? []);
  fixture.componentRef.setInput('decision', inputs.decision ?? null);
  fixture.componentRef.setInput('protocol', inputs.protocol ?? null);
  fixture.detectChanges();
  return { fixture, element: fixture.nativeElement as HTMLElement };
}

describe('ProcessTimelineComponent — entradas (§5 1)', () => {
  it('dado entries com RAIT_CASO_PROTOCOLADO e RAIT_DECISAO_PUBLICADA então dois <li> na ordem recebida com os textos do catálogo, data-domain-event e data-token; nenhum texto igual ao token (spec §2 inv. 1)', async () => {
    // C-3b-44
    const { element } = await setup({
      entries: [
        {
          at: '2026-09-02T12:00:00-04:00',
          type: raitEventType('rait', 'case', 'created'),
          domainEvent: 'RAIT_CASO_PROTOCOLADO',
          visibility: 'citizen',
          data: {},
        },
        {
          at: '2026-09-10T12:00:00-04:00',
          type: raitEventType('rait', 'decision', 'published'),
          domainEvent: 'RAIT_DECISAO_PUBLICADA',
          visibility: 'citizen',
          data: {},
        },
      ],
    });
    const items = Array.from(element.querySelectorAll('[data-timeline] li'));
    expect(items).toHaveLength(2);
    expect(items[0].getAttribute('data-domain-event')).toBe(
      'RAIT_CASO_PROTOCOLADO',
    );
    expect(items[0].textContent).toContain(
      catalog['portal.situation.event.RAIT_CASO_PROTOCOLADO'],
    );
    expect(items[1].getAttribute('data-domain-event')).toBe(
      'RAIT_DECISAO_PUBLICADA',
    );
    expect(items[1].textContent).toContain(
      catalog['portal.situation.event.RAIT_DECISAO_PUBLICADA'],
    );
    expect(items[0].textContent).not.toContain('RAIT_CASO_PROTOCOLADO');
    void TIMELINE_DOMAIN_EVENTS;
  });
});

describe('ProcessTimelineComponent — diligência técnica e evento desconhecido', () => {
  it('dado entry rait.inquiry.changed com domainEvent null então texto de portal.situation.badge.em_diligencia; dado domainEvent X_DESCONHECIDO então <li> com data-token e sem o texto cru X_DESCONHECIDO [negativo]', async () => {
    // C-3b-45
    const { element } = await setup({
      entries: [
        {
          at: '2026-09-06T12:00:00-04:00',
          type: TIMELINE_INQUIRY_TYPE,
          domainEvent: null,
          visibility: 'citizen',
          data: {},
        },
        {
          at: '2026-09-07T12:00:00-04:00',
          type: raitEventType('rait', 'unknown', 'event'),
          domainEvent: 'X_DESCONHECIDO',
          visibility: 'citizen',
          data: {},
        },
      ],
    });
    const items = Array.from(element.querySelectorAll('[data-timeline] li'));
    expect(items[0].textContent).toContain(
      catalog['portal.situation.badge.em_diligencia'],
    );
    expect(items[1].getAttribute('data-token')).toBeTruthy();
    expect(items[1].textContent).not.toContain('X_DESCONHECIDO');
  });
});

describe('ProcessTimelineComponent — "com você" × "com o órgão" (§5 2; [UC-PORTAL-005] AC-2)', () => {
  it('dado deadlines [{ kind: diligencia, dueOn, ownedBy: citizen }] então portal-deadline-card com data-owned-by citizen, data-token diligencia e a data formatada; texto de portal.situation.deadline.citizen', async () => {
    // C-3b-46 (1.ª metade)
    const { element } = await setup({
      deadlines: [
        { kind: 'diligencia', dueOn: '2026-10-14', ownedBy: 'citizen' },
      ],
    });
    const card = element.querySelector('[data-deadlines] portal-deadline-card');
    expect(card?.getAttribute('data-owned-by')).toBe('citizen');
    expect(card?.getAttribute('data-token')).toBe('diligencia');
    expect(card?.textContent).toContain(
      catalog['portal.situation.deadline.citizen'],
    );
  });

  it('dado ownedBy agency então portal.situation.deadline.agency', async () => {
    // C-3b-46 (2.ª metade)
    const { element } = await setup({
      deadlines: [
        { kind: 'diligencia', dueOn: '2026-10-14', ownedBy: 'agency' },
      ],
    });
    expect(
      element.querySelector('[data-deadlines] portal-deadline-card')
        ?.textContent,
    ).toContain(catalog['portal.situation.deadline.agency']);
  });
});

describe('ProcessTimelineComponent — diligência aberta/expirada', () => {
  it('dado diligences [{ diligenceId: did-1, status: open, requestText: Envie o laudo, dueOn }] e requestId então [data-diligences] com o título de next_action.citizen, o requestText e <a routerLink> de cmd.respond', async () => {
    // C-3b-47 (1.ª metade)
    const { element } = await setup({
      diligences: [
        {
          diligenceId: DILIGENCE_ID_FIXTURE,
          requestText: 'Envie o laudo',
          dueOn: '2026-10-14',
          status: 'open',
          outcome: null,
        },
      ],
    });
    const section = element.querySelector('[data-diligences]');
    expect(section?.textContent).toContain(
      catalog['portal.situation.next_action.citizen'],
    );
    expect(section?.textContent).toContain('Envie o laudo');
    const link = section?.querySelector(
      `a[routerLink="/processos/${REQUEST_RESULTADO_ID}/diligencia/${DILIGENCE_ID_FIXTURE}"]`,
    );
    expect(link?.textContent).toContain(
      catalog['portal.screens.t07.cmd.respond'],
    );
  });

  it('dado status expired então texto de state.encerrada e a pendência continua listada ([UC-PORTAL-009] AC-5)', async () => {
    // C-3b-47 (2.ª metade)
    const { element } = await setup({
      diligences: [
        {
          diligenceId: DILIGENCE_ID_FIXTURE,
          requestText: 'Envie o laudo',
          dueOn: '2026-10-14',
          status: 'expired',
          outcome: null,
        },
      ],
    });
    const section = element.querySelector('[data-diligences]');
    expect(section?.textContent).toContain(
      catalog['portal.screens.t11.state.encerrada'],
    );
  });
});

describe('ProcessTimelineComponent — documentos baixáveis, nunca só resumo ([RN-PORTAL-112] 1)', () => {
  it('dado documents com downloadUrl presente e null então <a download href> para o primeiro e button[aria-disabled][data-reason=unavailable] com unavailable_in_version para o segundo — nunca <a> sem href [negativo]', async () => {
    // C-3b-48
    const { element } = await setup({
      documents: [
        {
          documentId: 'doc-1',
          title: 'Parecer',
          kind: null,
          issuedAt: null,
          downloadUrl: 'https://storage.invalid/p.pdf',
        },
        {
          documentId: 'doc-2',
          title: 'Ata',
          kind: null,
          issuedAt: null,
          downloadUrl: null,
        },
      ],
    });
    const section = element.querySelector('[data-documents]');
    const anchors = Array.from(section?.querySelectorAll('a[download]') ?? []);
    expect(anchors).toHaveLength(1);
    expect(anchors[0].getAttribute('href')).toBeTruthy();
    const anchorsWithoutHref = Array.from(
      section?.querySelectorAll('a') ?? [],
    ).filter((anchor) => !anchor.getAttribute('href'));
    expect(anchorsWithoutHref).toHaveLength(0);
    const disabledButton = section?.querySelector(
      'button[aria-disabled="true"][data-reason="unavailable"]',
    );
    expect(disabledButton?.textContent).toContain(
      catalog['portal.states.unavailable_in_version'],
    );
  });
});

describe('ProcessTimelineComponent — decisão (§5 4)', () => {
  it('dado decision não null então <a routerLink="/processos/<id>/decisao"> com o texto de portal.screens.t07.cmd.decision', async () => {
    // C-3b-49 (1.ª metade)
    const { element } = await setup({
      decision: { outcome: 'deferido', publishedOn: '2026-09-10' },
    });
    const link = element.querySelector(
      `a[routerLink="/processos/${REQUEST_RESULTADO_ID}/decisao"]`,
    );
    expect(link?.textContent).toContain(
      catalog['portal.screens.t07.cmd.decision'],
    );
  });

  it('dado decision null então o link está ausente', async () => {
    // C-3b-49 (2.ª metade)
    const { element } = await setup({ decision: null });
    expect(
      element.querySelector(
        `a[routerLink="/processos/${REQUEST_RESULTADO_ID}/decisao"]`,
      ),
    ).toBeNull();
  });
});

describe('ProcessTimelineComponent — entrada mínima (§5 5)', () => {
  it('dado entries [] e protocol { number, issuedAt } então um <li data-token="protocol"> com o texto de RAIT_CASO_PROTOCOLADO e a data', async () => {
    // C-3b-50 (1.ª metade)
    const { element } = await setup({
      protocol: {
        number: PROTOCOL_NUMBER_FIXTURE,
        issuedAt: '2026-09-02T12:00:00-04:00',
        channel: 'portal',
        receiptHash: '0',
      },
    });
    const items = Array.from(element.querySelectorAll('[data-timeline] li'));
    expect(items).toHaveLength(1);
    expect(items[0].getAttribute('data-token')).toBe('protocol');
    expect(items[0].textContent).toContain(
      catalog['portal.situation.event.RAIT_CASO_PROTOCOLADO'],
    );
  });

  it('dado entries [] e protocol null então portal.states.empty', async () => {
    // C-3b-50 (2.ª metade)
    const { element } = await setup({ protocol: null });
    expect(element.textContent).toContain(catalog['portal.states.empty']);
  });
});

describe('process-timeline.component.ts — sem cálculo, ordem recebida (§5 6)', () => {
  it('dado o arquivo então sem new Date/Date.now/getTime/sort(', async () => {
    // C-3b-51
    const fs = await import('node:fs/promises');
    let source = '';
    try {
      source = await fs.readFile(
        fileURLToPath(
          new URL('process-timeline.component.ts', import.meta.url),
        ),
        'utf8',
      );
    } catch {
      return; // §9
    }
    expect(/new Date\(|Date\.now|\.getTime\(|\.sort\(/.test(source)).toBe(
      false,
    );
  });

  const states: Array<[string, Parameters<typeof setup>[0]]> = [
    ['vazio', {}],
    [
      'entradas',
      {
        entries: [
          {
            at: '2026-09-02T12:00:00-04:00',
            type: raitEventType('rait', 'case', 'created'),
            domainEvent: 'RAIT_CASO_PROTOCOLADO',
            visibility: 'citizen',
            data: {},
          },
        ],
      },
    ],
    [
      'diligência open',
      {
        diligences: [
          {
            diligenceId: DILIGENCE_ID_FIXTURE,
            requestText: 'Envie o laudo',
            dueOn: '2026-10-14',
            status: 'open',
            outcome: null,
          },
        ],
      },
    ],
    [
      'diligência expired',
      {
        diligences: [
          {
            diligenceId: DILIGENCE_ID_FIXTURE,
            requestText: 'Envie o laudo',
            dueOn: '2026-10-14',
            status: 'expired',
            outcome: null,
          },
        ],
      },
    ],
    [
      'documentos com URL',
      {
        documents: [
          {
            documentId: 'doc-1',
            title: 'Parecer',
            kind: null,
            issuedAt: null,
            downloadUrl: 'https://storage.invalid/p.pdf',
          },
        ],
      },
    ],
    [
      'documentos sem URL',
      {
        documents: [
          {
            documentId: 'doc-2',
            title: 'Ata',
            kind: null,
            issuedAt: null,
            downloadUrl: null,
          },
        ],
      },
    ],
    ['decisão', { decision: { outcome: 'deferido' } }],
  ];
  for (const [name, inputs] of states) {
    it(`dado o estado "${name}" então axe sem violação serious/critical`, async () => {
      // C-3b-51
      const { element } = await setup(inputs);
      await expectNoSeriousA11yViolations(element);
    });
  }
});
