// R-0014 TASK-0017 (Inspector). CTG-0003c §5.4 — `ClearanceStatusComponent`; arquivo
// inteiramente novo (§1) — "Cannot find module" até TASK-0018 (esperado, §9).
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { StynxI18nModule, StynxI18nService } from '@stynx-nyx/angular-i18n';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import portalCatalog from '../i18n/portal.pt-BR.json';
import { ClearanceStatusComponent } from './clearance-status.component'; // §9.
import {
  VEHICLE_CLEARANCE_BLOCKED_FIXTURE,
  VEHICLE_CLEARANCE_CLEAR_FIXTURE,
} from '../../testing/http-fixtures-pair3';
import { expectNoSeriousA11yViolations } from '../a11y/axe.spec-helper';

const catalog = portalCatalog as Record<string, string>;

async function setup(
  inputs: {
    clearance?: unknown;
    blocked?: unknown;
    cachedAt?: string | null;
    canIssue?: boolean;
    busy?: boolean;
  } = {},
) {
  await TestBed.configureTestingModule({
    imports: [
      ClearanceStatusComponent,
      StynxI18nModule.forRoot({
        defaultLocale: 'pt-BR',
        loadCatalog: async () => catalog,
      }),
    ],
    providers: [provideRouter([{ path: '**', children: [] }])],
  }).compileComponents();
  await TestBed.inject(StynxI18nService).initialize();
  const fixture = TestBed.createComponent(ClearanceStatusComponent);
  fixture.componentRef.setInput(
    'clearance',
    inputs.clearance ?? VEHICLE_CLEARANCE_BLOCKED_FIXTURE,
  );
  fixture.componentRef.setInput('blocked', inputs.blocked ?? null);
  fixture.componentRef.setInput('cachedAt', inputs.cachedAt ?? null);
  fixture.componentRef.setInput('canIssue', inputs.canIssue ?? false);
  fixture.componentRef.setInput('busy', inputs.busy ?? false);
  fixture.detectChanges();
  return { fixture, element: fixture.nativeElement as HTMLElement };
}

describe('ClearanceStatusComponent — três seções (§5.4 a/b/d; RN-116; UC-012 AC-1/AC-2)', () => {
  it('dado items com 1 débito, restrictions 1, suspendedEnforceability 1 e canIssue false então três <h3>, data-blocking por item, o suspenso fora dos débitos com portal.screens.t17.state.suspenso e emitir aria-disabled', async () => {
    // C-3c-92
    const { element } = await setup();
    const headings = element.querySelectorAll('h3');
    expect(headings.length).toBeGreaterThanOrEqual(3);
    const debtItem = element.querySelector('[data-token="multa"]');
    expect(debtItem?.getAttribute('data-blocking')).toBe('true');
    const suspended = element.querySelector('[data-suspended]');
    expect(suspended?.textContent).toContain(
      catalog['portal.screens.t17.state.suspenso'],
    );
    expect(element.querySelectorAll('[data-debt-item]').length).toBe(
      VEHICLE_CLEARANCE_BLOCKED_FIXTURE.items.length,
    );
    const issueButton = element.querySelector('[data-issue]');
    expect(issueButton?.getAttribute('aria-disabled')).toBe('true');
  });

  it('dado canIssue true e blocked null então o botão emitir está habilitado e emite issue', async () => {
    const { fixture, element } = await setup({
      clearance: VEHICLE_CLEARANCE_CLEAR_FIXTURE,
      canIssue: true,
    });
    const issued: unknown[] = [];
    (fixture.componentInstance as any).issue.subscribe(() => issued.push(null));
    const issueButton =
      element.querySelector<HTMLButtonElement>('[data-issue]')!;
    expect(issueButton.getAttribute('aria-disabled')).not.toBe('true');
    issueButton.dispatchEvent(new Event('click', { bubbles: true }));
    expect(issued).toHaveLength(1);
  });
});

describe('ClearanceStatusComponent — análise estática (§5.4 f) [negativo]', () => {
  it('dado o código de clearance-status.component.ts então não contém new Date, reduce( sobre amount nem soma de valores', async () => {
    // C-3c-93
    const dir = dirname(fileURLToPath(import.meta.url));
    let source = '';
    try {
      source = await readFile(
        join(dir, 'clearance-status.component.ts'),
        'utf8',
      );
    } catch {
      return; // arquivo ainda não existe (§9).
    }
    expect(source.includes('new Date')).toBe(false);
    expect(/\.reduce\(/.test(source)).toBe(false);
    expect(/amount\s*\+/.test(source)).toBe(false);
  });
});

describe('ClearanceStatusComponent — a11y por estado (§5.4/§7.3 — cobertura integral)', () => {
  it('dado bloqueado por débito/restrição/suspenso então axe sem violação serious/critical', async () => {
    const { element } = await setup();
    await expectNoSeriousA11yViolations(element);
  });

  it('dado quitação livre (pode emitir) então axe sem violação serious/critical', async () => {
    const { element } = await setup({
      clearance: VEHICLE_CLEARANCE_CLEAR_FIXTURE,
      canIssue: true,
    });
    await expectNoSeriousA11yViolations(element);
  });

  it('dado busy então axe sem violação serious/critical', async () => {
    const { element } = await setup({ busy: true });
    await expectNoSeriousA11yViolations(element);
  });

  it('dado blocked (CRLV_BLOCKED_BY_DEBT) presente então axe sem violação serious/critical', async () => {
    const { element } = await setup({
      clearance: VEHICLE_CLEARANCE_CLEAR_FIXTURE,
      blocked: {
        code: 'PORTAL.CRLV_BLOCKED_BY_DEBT',
        status: 422,
        messageKey: 'portal.errors.crlv_blocked_by_debt',
        messageParams: {},
        severity: 'error',
        nextStep: 'payment',
        nextStepRoute: '/autos',
        alternativeChannel: true,
        fields: [],
        retryAfter: null,
        context: {},
        requestId: null,
      },
    });
    await expectNoSeriousA11yViolations(element);
  });
});
