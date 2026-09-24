import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { readCanonicalMobileMatrix } from '../testing/canonical-mobile-matrix';
import {
  createHomologationAitScenario,
  TEAT_HOMOLOGATION_AIT,
} from './shared/homologation-ait.port';
import {
  createTeatMobileHomologationSync,
  TEAT_MOBILE_HOMOLOGATION_SYNC,
} from './shared/homologation-sync.port';
import { HomologationTransitionPanelComponent } from './shared/homologation-transition-panel.component';
import catalog from './i18n/teat.pt-BR.json';
import { TeatI18n } from './core/i18n.service';

@Component({ standalone: true, template: '<p>Destino demonstrativo</p>' })
class DemoDestinationComponent {}

function configurePanel(): void {
  TestBed.configureTestingModule({
    imports: [HomologationTransitionPanelComponent],
    providers: [
      provideRouter([
        { path: 'ait-vehicle', component: DemoDestinationComponent },
        { path: 'sync-conflict', component: DemoDestinationComponent },
      ]),
      {
        provide: TeatI18n,
        useValue: {
          translate: (key: string) =>
            (catalog as Readonly<Record<string, string>>)[key] ?? key,
        },
      },
      {
        provide: TEAT_HOMOLOGATION_AIT,
        useFactory: createHomologationAitScenario,
      },
      {
        provide: TEAT_MOBILE_HOMOLOGATION_SYNC,
        useFactory: createTeatMobileHomologationSync,
      },
    ],
  });
}

describe('ADR-0033 — painel DOM das 576 transições canônicas', () => {
  it('obtém rótulos do tradutor injetado, não do JSON estático', () => {
    configurePanel();
    TestBed.overrideProvider(TeatI18n, {
      useValue: { translate: (key: string) => `locale:${key}` },
    });
    const fixture = TestBed.createComponent(
      HomologationTransitionPanelComponent,
    );
    fixture.componentRef.setInput('screenId', 'auth-login');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain(
      'locale:teat.navigation.homologationAction.',
    );
    expect(fixture.nativeElement.textContent).toContain('locale:teat.screens.');
  });

  it('preserva índice, ordem, multiplicidade, ação e destino para as 67 origens', () => {
    const { matrix } = readCanonicalMobileMatrix();
    configurePanel();
    const fixture = TestBed.createComponent(
      HomologationTransitionPanelComponent,
    );
    let total = 0;
    for (const screen of matrix.screens) {
      fixture.componentRef.setInput('screenId', screen.screenId);
      fixture.detectChanges();
      const panel = fixture.nativeElement.querySelector(
        `[data-homologation-transitions="${screen.screenId}"]`,
      ) as HTMLElement | null;
      expect(panel, `painel de ${screen.screenId}`).not.toBeNull();
      const buttons = [
        ...(panel?.querySelectorAll('[data-transition-index]') ?? []),
      ] as HTMLButtonElement[];
      const expected = matrix.transitions
        .map((transition, index) => ({ ...transition, index }))
        .filter((transition) => transition.from === screen.screenId);
      expect(
        buttons.map((button) => ({
          index: Number(button.dataset['transitionIndex']),
          action: button.dataset['action'],
          to: button.dataset['to'],
        })),
        `arestas DOM de ${screen.screenId}`,
      ).toEqual(
        expected.map(({ index, action, to }) => ({ index, action, to })),
      );
      total += buttons.length;
    }
    expect(total).toBe(576);
    expect(
      matrix.transitions.filter((entry) => entry.condition !== ''),
    ).toHaveLength(197);
    expect(
      matrix.transitions.some((entry) => entry.to === 'ait-speed-measurement'),
    ).toBe(false);
  });

  it('rotula as 97 ações e destinos com o catálogo, sem mostrar screenIds técnicos', () => {
    const { matrix } = readCanonicalMobileMatrix();
    const translations = catalog as Readonly<Record<string, string>>;
    const firstIndexByAction = new Map<string, number>();
    matrix.transitions.forEach((transition, index) => {
      if (!firstIndexByAction.has(transition.action)) {
        firstIndexByAction.set(transition.action, index);
      }
    });
    expect(firstIndexByAction.size).toBe(97);
    configurePanel();
    const fixture = TestBed.createComponent(
      HomologationTransitionPanelComponent,
    );
    for (const screen of matrix.screens) {
      fixture.componentRef.setInput('screenId', screen.screenId);
      fixture.detectChanges();
      for (const [index, transition] of matrix.transitions.entries()) {
        if (transition.from !== screen.screenId) continue;
        const button = fixture.nativeElement.querySelector(
          `[data-homologation-transitions="${screen.screenId}"] [data-transition-index="${index}"]`,
        ) as HTMLButtonElement | null;
        expect(button).not.toBeNull();
        const firstIndex = firstIndexByAction.get(transition.action);
        const actionKey = `teat.navigation.homologationAction.${firstIndex}`;
        const destinationKey =
          transition.to === '__previous__'
            ? 'teat.navigation.previous'
            : `teat.screens.${transition.to}.title`;
        expect(translations[actionKey], actionKey).toBeTypeOf('string');
        expect(translations[destinationKey], destinationKey).toBeTypeOf(
          'string',
        );
        expect(button?.textContent).toContain(translations[actionKey]);
        expect(button?.textContent).toContain(translations[destinationKey]);
        if (transition.to !== '__previous__') {
          expect(button?.textContent).not.toContain(`→ ${transition.to}`);
        }
      }
    }
  });

  it('nega as 197 arestas condicionais sem fato sintético prévio, sem fallback implícito', async () => {
    const { matrix } = readCanonicalMobileMatrix();
    configurePanel();
    const fixture = TestBed.createComponent(
      HomologationTransitionPanelComponent,
    );
    const router = TestBed.inject(Router);
    let denied = 0;
    for (const screen of matrix.screens) {
      fixture.componentRef.setInput('screenId', screen.screenId);
      fixture.detectChanges();
      for (const [index, transition] of matrix.transitions.entries()) {
        if (
          transition.from !== screen.screenId ||
          transition.condition === ''
        ) {
          continue;
        }
        const button = fixture.nativeElement.querySelector(
          `[data-homologation-transitions="${screen.screenId}"] [data-transition-index="${index}"]`,
        ) as HTMLButtonElement | null;
        expect(button, `aresta condicional ${index}`).not.toBeNull();
        button?.click();
        fixture.detectChanges();
        await fixture.whenStable();
        expect(router.url, `aresta ${index} não pode inferir condição`).toBe(
          '/',
        );
        expect(
          fixture.nativeElement.querySelector('[role="alert"]'),
        ).not.toBeNull();
        denied += 1;
      }
    }
    expect(denied).toBe(197);
  });

  it('nega condicional AIT sem fato validado e não transforma destino BOAT em página TEAT', async () => {
    configurePanel();
    const fixture = TestBed.createComponent(
      HomologationTransitionPanelComponent,
    );
    const router = TestBed.inject(Router);
    fixture.componentRef.setInput('screenId', 'ait-start');
    fixture.detectChanges();
    const next = fixture.nativeElement.querySelector(
      '[data-homologation-transitions="ait-start"] [data-action="Continuar"][data-to="ait-vehicle"]',
    ) as HTMLButtonElement | null;
    expect(next).not.toBeNull();
    next?.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(router.url).toBe('/');
    expect(
      fixture.nativeElement.querySelector('[role="alert"]'),
    ).not.toBeNull();

    fixture.componentRef.setInput('screenId', 'home');
    fixture.detectChanges();
    const boat = fixture.nativeElement.querySelector(
      '[data-homologation-transitions="home"] [data-to="crash-start"]',
    ) as HTMLButtonElement | null;
    expect(boat).not.toBeNull();
    boat?.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(router.url).toBe('/');
    expect(
      fixture.nativeElement.querySelector('[role="alert"]'),
    ).not.toBeNull();
  });

  it('permite arestas condicionais apenas após fatos sintéticos validados de AIT e sync', async () => {
    configurePanel();
    const fixture = TestBed.createComponent(
      HomologationTransitionPanelComponent,
    );
    const router = TestBed.inject(Router);
    const ait = TestBed.inject(TEAT_HOMOLOGATION_AIT);
    await ait.start({ approach: 'with-approach' });
    fixture.componentRef.setInput('screenId', 'ait-start');
    fixture.detectChanges();
    const next = fixture.nativeElement.querySelector(
      '[data-homologation-transitions="ait-start"] [data-action="Continuar"][data-to="ait-vehicle"]',
    ) as HTMLButtonElement | null;
    expect(next).not.toBeNull();
    next?.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(router.url).toBe('/ait-vehicle');

    const sync = TestBed.inject(TEAT_MOBILE_HOMOLOGATION_SYNC);
    fixture.componentRef.setInput('screenId', 'sync');
    fixture.detectChanges();
    const conflict = fixture.nativeElement.querySelector(
      '[data-homologation-transitions="sync"] [data-action="Abrir conflito"][data-to="sync-conflict"]',
    ) as HTMLButtonElement | null;
    expect(conflict).not.toBeNull();
    conflict?.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(router.url).toBe('/ait-vehicle');
    sync.enqueue();
    sync.fail();
    sync.retry();
    sync.markConflict();
    conflict?.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(router.url).toBe('/sync-conflict');
  });
});
