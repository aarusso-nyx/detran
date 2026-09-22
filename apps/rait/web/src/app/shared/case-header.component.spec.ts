// R-0012 TASK-0008 (Inspector). CTG-0002b.md §5.5, §8 (C-2B-38, 59 parcial) —
// `shared/case-header.component.ts` ainda não existe (TASK-0009): falha de módulo esperada.
// `pageProviders`/`stubFacade` (contrato §7 `src/testing/facade.stub.ts`) NÃO estão na fronteira
// de escrita desta tarefa (TASK-0008.md "Pode tocar" só lista
// `http-fixtures/policy.fixture/clock.stub` + acréscimos de `kb.ts`) — a diretiva
// `*stynxHasPermission` é testada aqui compondo diretamente `StynxSessionService`
// (`createStynxSessionStub`, já existente do CTG-0002a) com as permissões de
// `ROLE_PERMISSIONS_FIXTURE`, sem depender de um `facade.stub.ts` que este arquivo não cria
// (registrado como observação de fronteira no relatório de entrega).
import { TestBed } from '@angular/core/testing';
import { StynxSessionService } from '@stynx-nyx/angular-auth';
import { CaseHeaderComponent } from './case-header.component';
import { createStynxSessionStub } from '../../testing/stynx-session.stub';
import { ROLE_PERMISSIONS_FIXTURE } from '../../testing/policy.fixture';
import {
  CASE_IDS,
  fixtureCase,
  fixtureClock,
} from '../../testing/http-fixtures';
import type { RaitRoleCode } from '../../testing/route-manifest.fixture';
import {
  markerI18nModule,
  initializeMarkerI18n,
} from '../../testing/i18n-test-catalog';
import { expectA11yStateInvariants } from '../../testing/a11y-state.spec-helper';

const KEYS = ['rait.common.suspensiveEffect'] as const;

function sessionProvider(role: RaitRoleCode) {
  return {
    provide: StynxSessionService,
    useValue: createStynxSessionStub({
      active: true,
      permissions: [...ROLE_PERMISSIONS_FIXTURE[role]],
      claims: { roles: [role] },
    }),
  };
}

async function render(inputs: {
  role: RaitRoleCode;
  parties?: readonly unknown[];
  clocks?: readonly unknown[];
  actions?: readonly { command: string; labelKey: string; route?: string }[];
}) {
  // A10 item a: TestBed.resetTestingModule() antes de cada configureTestingModule — alguns
  // it's chamam render() mais de uma vez (estados diferentes no mesmo teste) e o Angular
  // lança 'Cannot configure the test module when the test module has already been
  // instantiated' na segunda chamada sem o reset.
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    imports: [CaseHeaderComponent, markerI18nModule([...KEYS])],
    providers: [sessionProvider(inputs.role)],
  });
  await initializeMarkerI18n();
  const fixture = TestBed.createComponent(CaseHeaderComponent);
  fixture.componentRef.setInput('case', fixtureCase(CASE_IDS.EM_INSTRUCAO));
  fixture.componentRef.setInput('parties', inputs.parties ?? []);
  fixture.componentRef.setInput('clocks', inputs.clocks ?? []);
  fixture.componentRef.setInput('actions', inputs.actions ?? []);
  fixture.detectChanges();
  return fixture;
}

describe('CaseHeader (C-2B-38)', () => {
  it('dado 1 parte requerente (person_name "X", document_number "123") e 2 relógios então protocol_number visível, rait-case-state-badge, "X" visível e "123" NÃO visível [negativo], 2 rait-risk-flag', async () => {
    const fixture = await render({
      role: 'rait-analyst',
      parties: [
        {
          role: 'requerente',
          person_name: 'X',
          document_number: '123',
        },
      ],
      clocks: [
        fixtureClock('00000000-0000-7000-8000-000024000001'),
        fixtureClock('00000000-0000-7000-8000-000024000002'),
      ],
    });
    const host: HTMLElement = fixture.nativeElement;
    expect(host.textContent).toContain('RAIT-2026-000007');
    expect(host.querySelector('rait-case-state-badge')).not.toBeNull();
    expect(host.textContent).toContain('X');
    expect(host.textContent).not.toContain('123');
    expect(host.querySelectorAll('rait-risk-flag').length).toBe(2);
  });

  it('dado actions [{ command: "rait-case:admit", labelKey }] e permissões de rait-analyst então o botão existe e (click) emite "rait-case:admit"', async () => {
    const allowed = await render({
      role: 'rait-analyst',
      actions: [{ command: 'rait-case:admit', labelKey: 'rait.action.admit' }],
    });
    const button: HTMLButtonElement | null =
      allowed.nativeElement.querySelector('button');
    expect(button).not.toBeNull();
    let emitted: string | undefined;
    allowed.componentInstance.action.subscribe((value: string) => {
      emitted = value;
    });
    button?.click();
    expect(emitted).toBe('rait-case:admit');
  });
});

// A11 (delivery-review CTG-0002b-1, item 13): matriz completa sobre os 13 papéis canônicos de
// `ROLE_PERMISSIONS_FIXTURE` para a ação `rait-case:admit` (`inf:rait-case:admit`, concedida só a
// `rait-analyst`) — um `it` por papel, nunca um par exemplo.
const CASE_HEADER_ACTION = {
  command: 'rait-case:admit',
  labelKey: 'rait.action.admit',
};
const CASE_HEADER_PERMISSION_KEY = 'inf:rait-case:admit';
const ALL_ROLES = Object.keys(
  ROLE_PERMISSIONS_FIXTURE,
) as readonly RaitRoleCode[];

describe('CaseHeader — matriz de autorização (A11)', () => {
  for (const role of ALL_ROLES) {
    const granted = ROLE_PERMISSIONS_FIXTURE[role].includes(
      CASE_HEADER_PERMISSION_KEY,
    );
    it(`dado papel "${role}" quando renderizado com actions [rait-case:admit] então o botão ${granted ? 'existe' : 'NÃO existe [negativo]'}`, async () => {
      const fixture = await render({
        role,
        actions: [CASE_HEADER_ACTION],
      });
      const button = fixture.nativeElement.querySelector('button');
      if (granted) {
        expect(button).not.toBeNull();
      } else {
        expect(button).toBeNull();
      }
    });
  }
});

describe('CaseHeader — a11y (C-2B-59)', () => {
  it('dado o componente renderizado (ready) quando expectA11yStateInvariants + axe então nenhuma violação serious/critical', async () => {
    const fixture = await render({ role: 'rait-analyst' });
    await expectA11yStateInvariants(fixture.nativeElement);
  });
});
