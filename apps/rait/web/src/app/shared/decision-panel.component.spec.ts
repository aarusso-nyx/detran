// R-0012 TASK-0008 (Inspector). CTG-0002b.md §5.11, §8 (C-2B-44, 59 parcial) —
// `shared/decision-panel.component.ts` ainda não existe (TASK-0009): falha de módulo esperada.
import { TestBed } from '@angular/core/testing';
import { StynxSessionService } from '@stynx-nyx/angular-auth';
import { DecisionPanelComponent } from './decision-panel.component';
import { createStynxSessionStub } from '../../testing/stynx-session.stub';
import { ROLE_PERMISSIONS_FIXTURE } from '../../testing/policy.fixture';
import type { RaitRoleCode } from '../../testing/route-manifest.fixture';
import { CASE_IDS, fixtureCase } from '../../testing/http-fixtures';
import {
  markerI18nModule,
  initializeMarkerI18n,
} from '../../testing/i18n-test-catalog';
import { expectA11yStateInvariants } from '../../testing/a11y-state.spec-helper';

const KEYS = [
  'rait.action.sign',
  'rait.action.return-draft',
  'rait.action.impede',
  'rait.decision.acolhida',
] as const;

async function render(role: RaitRoleCode, decision: unknown = null) {
  // A10 item a: TestBed.resetTestingModule() antes de cada configureTestingModule — alguns
  // it's chamam render() mais de uma vez (estados diferentes no mesmo teste) e o Angular
  // lança 'Cannot configure the test module when the test module has already been
  // instantiated' na segunda chamada sem o reset.
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    imports: [DecisionPanelComponent, markerI18nModule([...KEYS])],
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
  const fixture = TestBed.createComponent(DecisionPanelComponent);
  fixture.componentRef.setInput('case', fixtureCase(CASE_IDS.PRONTO_P_DECISAO));
  fixture.componentRef.setInput('decision', decision);
  fixture.detectChanges();
  return fixture;
}

describe('DecisionPanel (C-2B-44)', () => {
  it('dado decision null e permissões de rait-signing-authority então botões sign/return-draft/impede existem; decide sem grounds não emite; com kind "acolhida" e grounds emite; dado decision ≠ null então somente leitura com "rait.decision." + decision_kind e nenhum formulário', async () => {
    const authority = await render('rait-signing-authority');
    const host: HTMLElement = authority.nativeElement;
    expect(host.querySelector('[data-action="sign"]')).not.toBeNull();
    expect(host.querySelector('[data-action="return-draft"]')).not.toBeNull();
    expect(host.querySelector('[data-action="impede"]')).not.toBeNull();

    // A10 item a: assina o output e exercita o formulário com ESTE fixture ANTES de chamar
    // render() de novo — a próxima chamada reseta o TestBed (destrói `authority`) e uma
    // assinatura/consulta tardia lança NG0953 "Unexpected subscription to destroyed OutputRef".
    let decided: unknown;
    authority.componentInstance.decide.subscribe((value: unknown) => {
      decided = value;
    });
    host
      .querySelector('button[type="submit"]')
      ?.dispatchEvent(new Event('click'));
    expect(decided).toBeUndefined();

    const kindRadio = host.querySelector<HTMLInputElement>(
      'input[type="radio"][value="acolhida"]',
    );
    kindRadio?.click();
    const groundsField = host.querySelector<HTMLTextAreaElement>(
      'textarea[name="grounds"]',
    );
    if (groundsField) groundsField.value = 'fundamentação';
    groundsField?.dispatchEvent(new Event('input'));
    authority.detectChanges();
    host
      .querySelector('button[type="submit"]')
      ?.dispatchEvent(new Event('click'));
    expect(decided).toEqual({ kind: 'acolhida', grounds: 'fundamentação' });

    const decided2 = await render('rait-signing-authority', {
      decision_kind: 'acolhida',
      decided_at: '2026-09-14T00:00:00-04:00',
      signature_ref: 'sig-1',
    });
    expect(decided2.nativeElement.querySelector('form')).toBeNull();
    expect(decided2.nativeElement.textContent).toContain('acolhida');
  });
});

// A11 (delivery-review CTG-0002b-1, item 13; corrige C-2B-44 — a afirmação "rait-analyst não vê
// nenhuma ação" estava errada: `policy.ts` concede `inf:rait-impediment:declare` também a
// `rait-analyst` e a `rait-rapporteur`, além de `rait-signing-authority`; `rait-analyst` não vê
// `sign`/`return-draft` mas VÊ `impede`). Matriz completa sobre os 13 papéis canônicos para as
// três ações com gate — um `it` por (ação × papel), nunca um par exemplo.
const DECISION_PANEL_ROLES = Object.keys(
  ROLE_PERMISSIONS_FIXTURE,
) as readonly RaitRoleCode[];
const DECISION_PANEL_ACTIONS = [
  { action: 'sign' as const, key: 'inf:rait-decision:sign' },
  { action: 'return-draft' as const, key: 'inf:rait-decision:return-draft' },
  { action: 'impede' as const, key: 'inf:rait-impediment:declare' },
];

describe('DecisionPanel — matriz de autorização (A11)', () => {
  for (const { action, key } of DECISION_PANEL_ACTIONS) {
    for (const role of DECISION_PANEL_ROLES) {
      const granted = ROLE_PERMISSIONS_FIXTURE[role].includes(key);
      it(`dado papel "${role}" e decision null quando renderizado então o botão ${action} ${granted ? 'existe' : 'NÃO existe [negativo]'}`, async () => {
        const fixture = await render(role);
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

describe('DecisionPanel — a11y (C-2B-59)', () => {
  it('dado o componente renderizado (ready, decision null e não null) quando expectA11yStateInvariants + axe então nenhuma violação serious/critical', async () => {
    const open = await render('rait-signing-authority');
    await expectA11yStateInvariants(open.nativeElement);
    const decided = await render('rait-signing-authority', {
      decision_kind: 'acolhida',
      decided_at: '2026-09-14T00:00:00-04:00',
    });
    await expectA11yStateInvariants(decided.nativeElement);
  });
});
