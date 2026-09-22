// R-0012 TASK-0008 (Inspector). CTG-0002b.md §5.9, §8 (C-2B-42, 59 parcial) —
// `shared/inquiry-card.component.ts` ainda não existe (TASK-0009): falha de módulo esperada.
// `*stynxHasPermission` composta com `StynxSessionService` (mesma abordagem de
// `case-header.component.spec.ts` — `facade.stub.ts`/`pageProviders` fora da fronteira desta
// tarefa).
import { TestBed } from '@angular/core/testing';
import { StynxSessionService } from '@stynx-nyx/angular-auth';
import { InquiryCardComponent } from './inquiry-card.component';
import { createStynxSessionStub } from '../../testing/stynx-session.stub';
import { ROLE_PERMISSIONS_FIXTURE } from '../../testing/policy.fixture';
import type { RaitRoleCode } from '../../testing/route-manifest.fixture';
import {
  markerI18nModule,
  initializeMarkerI18n,
} from '../../testing/i18n-test-catalog';
import { expectA11yStateInvariants } from '../../testing/a11y-state.spec-helper';

const KEYS = [
  'rait.common.addressee_requerente',
  'rait.common.extensions',
  'rait.action.answer-inquiry',
  'rait.action.extend-inquiry',
] as const;

function inquiry(overrides: Record<string, unknown> = {}) {
  return {
    id: 'i-1',
    addressee: 'requerente',
    subject: 'x',
    requested_at: '2026-09-14T00:00:00-04:00',
    due_on: '2026-09-23',
    extension_count: 1,
    outcome: null,
    ...overrides,
  };
}

async function render(role: RaitRoleCode, extensionCount = 1) {
  // A10 item a: TestBed.resetTestingModule() antes de cada configureTestingModule — alguns
  // it's chamam render() mais de uma vez (estados diferentes no mesmo teste) e o Angular
  // lança 'Cannot configure the test module when the test module has already been
  // instantiated' na segunda chamada sem o reset.
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    imports: [InquiryCardComponent, markerI18nModule([...KEYS])],
    providers: [
      {
        provide: StynxSessionService,
        useValue: createStynxSessionStub({
          active: true,
          permissions: [...ROLE_PERMISSIONS_FIXTURE[role]],
          claims: { roles: [role] },
        }),
      },
    ],
  });
  await initializeMarkerI18n();
  const fixture = TestBed.createComponent(InquiryCardComponent);
  fixture.componentRef.setInput(
    'inquiry',
    inquiry({ extension_count: extensionCount }),
  );
  fixture.detectChanges();
  return fixture;
}

describe('InquiryCard (C-2B-42)', () => {
  it('dado inquiry extension_count 1 e permissões de rait-analyst então botão extend desabilitado e answer habilitado', async () => {
    const analyst = await render('rait-analyst');
    const host: HTMLElement = analyst.nativeElement;
    const extendButton = host.querySelector<HTMLButtonElement>(
      '[data-action="extend"]',
    );
    const answerButton = host.querySelector<HTMLButtonElement>(
      '[data-action="answer"]',
    );
    expect(extendButton?.disabled).toBe(true);
    expect(answerButton?.disabled).toBeFalsy();
  });
});

// A11 (delivery-review CTG-0002b-1, item 13): matriz completa sobre os 13 papéis canônicos para
// as duas ações com gate (`answer` = `inf:rait-case:answer-inquiry`, `extend` =
// `inf:rait-case:extend-inquiry`, ambas concedidas a `rait-analyst` e `rait-rapporteur`
// — chaves reais de `policy.ts`, OD-R12-026) — um `it` por (ação × papel), nunca um par exemplo.
// `extension_count: 0` isola o gate de permissão da regra de negócio "prorrogação única"
// (C-2B-42), que desabilita `extend` independentemente da permissão.
const INQUIRY_CARD_ROLES = Object.keys(
  ROLE_PERMISSIONS_FIXTURE,
) as readonly RaitRoleCode[];
const INQUIRY_CARD_ACTIONS = [
  { action: 'answer' as const, key: 'inf:rait-case:answer-inquiry' },
  { action: 'extend' as const, key: 'inf:rait-case:extend-inquiry' },
];

describe('InquiryCard — matriz de autorização (A11)', () => {
  for (const { action, key } of INQUIRY_CARD_ACTIONS) {
    for (const role of INQUIRY_CARD_ROLES) {
      const granted = ROLE_PERMISSIONS_FIXTURE[role].includes(key);
      it(`dado papel "${role}" quando renderizado então o botão ${action} ${granted ? 'existe' : 'NÃO existe [negativo]'}`, async () => {
        const fixture = await render(role, 0);
        const button = fixture.nativeElement.querySelector(
          `[data-action="${action}"]`,
        );
        if (granted) {
          expect(button).not.toBeNull();
        } else {
          expect(button).toBeNull();
        }
      });
    }
  }
});

describe('InquiryCard — a11y (C-2B-59)', () => {
  it('dado o componente renderizado (ready) quando expectA11yStateInvariants + axe então nenhuma violação serious/critical', async () => {
    const fixture = await render('rait-analyst');
    await expectA11yStateInvariants(fixture.nativeElement);
  });
});
