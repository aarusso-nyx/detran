// C-03/C-06 — existing Portal invariants and axe, same real journey screens in every state.
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { expectA11yStateInvariants } from '../../testing/a11y-state.spec-helper';
import { readCatalog } from '../../testing/kb';
import { expectNoSeriousA11yViolations } from '../a11y/axe.spec-helper';
import { PreviewRootComponent } from './preview-root.component';
import { PREVIEW_SCREEN_STATES } from './preview-state.service';
import {
  configurePreview,
  expectJourneyScenario,
  expectNoNetwork,
  JOURNEY,
  openScreen,
  setPreviewDocument,
} from './preview.spec-helper';

describe('C-03 — accessible preview bar', () => {
  it('has two named controls and no serious/critical axe violation', async () => {
    setPreviewDocument('/autos');
    await configurePreview();
    const fixture = TestBed.createComponent(PreviewRootComponent);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const bar = (
      fixture.nativeElement as HTMLElement
    ).querySelector<HTMLElement>('portal-preview-bar')!;
    expect(bar).not.toBeNull();
    expect(bar.querySelectorAll('select')).toHaveLength(2);
    for (const select of bar.querySelectorAll('select'))
      expect(select.labels?.length).toBeGreaterThan(0);
    await expectNoSeriousA11yViolations(bar);
    expectNoNetwork();
  });
});
describe('C-06 — JRN-PORTAL-001 accessibility per state', () => {
  for (const entry of JOURNEY)
    for (const state of PREVIEW_SCREEN_STATES) {
      it(`/${entry.path} ${state}: one heading, named status region, axe`, async () => {
        const { root } = await openScreen(entry, state);
        await expectJourneyScenario(root, state, entry);
        await expectA11yStateInvariants(root, readCatalog());
        expectNoNetwork();
      });
    }
});
