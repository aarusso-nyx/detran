// R-0033 TASK-0002 (Inspector). C-05 no TestBed / P-12 (parte TestBed) (`frontend-preview-mode.md`
// §7; prompt TASK-0002 item 8): `expectNoSeriousA11yViolations` (axe-core 4.13.0, tags `wcag2a`,
// `wcag2aa`, `best-practice`; `src/testing/axe.spec-helper.ts`) sobre a faixa de prévia e sobre
// cada tela da JW-01 (passos 1–8, inventário §5.1) nos estados `loaded`, `empty`, `error`,
// `forbidden` (laço). As capturas reais 360/768/1280 e o axe no navegador ficam para
// TASK-0005/0006. Produção (TASK-0003): ainda não existe — falha de módulo esperada nesta entrega.
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, it } from 'vitest';
import { expectNoSeriousA11yViolations } from '../../testing/axe.spec-helper';
import { PreviewBarComponent } from './preview-bar.component';
import type { PreviewScreenState } from './preview-state.service';
import {
  configurePreview,
  createPreviewHarness,
  inventoryRowOf,
  JW01_SCREENS,
  previewSpecContext,
  resetPreviewDocument,
  setPreviewDocument,
  waitForScenario,
} from './preview.spec-helper';

/** Estados capturados da JW-01 (inventário §5.1; `loading` fica nos specs de cobertura). */
const A11Y_STATES: readonly PreviewScreenState[] = [
  'loaded',
  'empty',
  'error',
  'forbidden',
];

afterEach(() => resetPreviewDocument());

describe('C-05 — faixa de prévia sem violação serious/critical', () => {
  A11Y_STATES.forEach((state) => {
    it(`dado a faixa (rait-preview-bar) sob rait-analyst e pv_estado=${state} quando axe roda então nenhuma violação serious/critical`, async () => {
      setPreviewDocument('/painel', 'rait-analyst', state);
      await configurePreview(previewSpecContext().providers);
      const fixture = TestBed.createComponent(PreviewBarComponent);
      fixture.detectChanges();
      await fixture.whenStable();
      await expectNoSeriousA11yViolations(fixture.nativeElement as Element);
    });
  });
});

describe('C-05 — telas da JW-01 sob prévia sem violação serious/critical', () => {
  JW01_SCREENS.forEach((screen) => {
    const row = inventoryRowOf(screen.route);

    A11Y_STATES.forEach((state) => {
      it(`dado JW-01 passo ${screen.step} (${row.previewPath}) sob rait-analyst e pv_estado=${state} quando axe roda sobre a página então nenhuma violação serious/critical`, async () => {
        const url = setPreviewDocument(row.previewPath, 'rait-analyst', state);
        const harness = await createPreviewHarness(
          previewSpecContext().providers,
        );
        await harness.navigateByUrl(url);
        await waitForScenario(harness, state);
        await expectNoSeriousA11yViolations(
          harness.routeNativeElement as Element,
        );
      });
    });
  });
});
