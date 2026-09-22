import { TestBed } from '@angular/core/testing';
import type { Type } from '@angular/core';
import { expect, it } from 'vitest';
import {
  BOAT_ROUTE_PATHS,
  D05_ROUTE_PATH,
  TEAT_ROUTE_FIXTURE,
} from '../testing/route-contract.fixture';
import { expectTeatA11yState } from '../testing/a11y-state.spec-helper';
import { readMobileProductionSource } from '../testing/mobile-source';
import { loadConcreteRoutes } from '../testing/concrete-routes';

for (const expected of TEAT_ROUTE_FIXTURE) {
  if (expected.path === D05_ROUTE_PATH) {
    it('dada D-05 indisponível quando renderizada então anuncia a indisponibilidade sem carregar a feature', async () => {
      const route = (await loadConcreteRoutes()).find(
        (candidate) => candidate.path === expected.path,
      );
      expect(route?.data).toMatchObject({
        featureEnabled: false,
        state: 'unavailable',
      });
      expect(route?.loadComponent).toBeUndefined();
    });
  } else if (BOAT_ROUTE_PATHS.includes(expected.path)) {
    it(`dada /${expected.path} BOAT sem extensão local quando verificada então preserva loader boundary e não importa placeholder`, async () => {
      const route = (await loadConcreteRoutes()).find(
        (candidate) => candidate.path === expected.path,
      );
      expect(route?.data).toMatchObject({ boatExtension: true });
      expect(route?.loadComponent).toBeTypeOf('function');
      const source = readMobileProductionSource(
        'features/sinistro/sinistro.routes.ts',
      );
      expect(source).not.toContain('./features/sinistro/pages/');
      expect(source).not.toMatch(/<[^>]*>\s*TEAT\s*<\//);
    });
  } else {
    it(`dada /${expected.path} quando renderizada então mantém invariantes a11y e axe`, async () => {
      const route = (await loadConcreteRoutes()).find(
        (candidate) => candidate.path === expected.path,
      );
      expect(
        route?.loadComponent,
        `componente ausente: /${expected.path}`,
      ).toBeTypeOf('function');
      const component = (await route?.loadComponent?.()) as Type<unknown>;
      const fixture = TestBed.configureTestingModule({
        imports: [component],
      }).createComponent(component);
      fixture.detectChanges();
      await fixture.whenStable();
      await expectTeatA11yState(fixture.nativeElement as HTMLElement);
    });
  }
}
