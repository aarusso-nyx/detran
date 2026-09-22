// R-0016 TASK-0004 (Inspector). CTG-0002.md §13 (C-02-54, segunda metade).
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { LegalBasisTagComponent } from './legal-basis-tag.component.js';
import { expectA11yStateInvariants } from '../../testing/a11y-state.spec-helper.js';
import {
  buildTestCatalog,
  markerI18nModule,
} from '../../testing/i18n-test-catalog.js';

@Component({
  selector: 'dash-legal-basis-tag-host',
  standalone: true,
  imports: [LegalBasisTagComponent],
  template: `<dash-legal-basis-tag legalBasis="CTB art. 289-A" />`,
})
class HostComponent {}

describe('shared/legal-basis-tag.component.ts (C-02-54)', () => {
  it('dado legalBasis "CTB art. 289-A" então <cite> com o texto e data-legal-basis', async () => {
    const catalog = buildTestCatalog([]);
    TestBed.configureTestingModule({
      imports: [markerI18nModule([]), HostComponent],
    });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const cite = element.querySelector('cite');
    expect(cite?.textContent).toContain('CTB art. 289-A');
    expect(element.querySelector('[data-legal-basis]')).not.toBeNull();
    await expectA11yStateInvariants(element, catalog, { component: true });
  });
});
