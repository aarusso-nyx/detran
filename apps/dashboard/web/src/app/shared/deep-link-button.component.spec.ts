// R-0016 TASK-0004 (Inspector). CTG-0002.md §13 (C-02-64; [RN-DASH-101]).
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { DeepLinkButtonComponent } from './deep-link-button.component.js';
import { expectA11yStateInvariants } from '../../testing/a11y-state.spec-helper.js';
import {
  buildTestCatalog,
  markerI18nModule,
} from '../../testing/i18n-test-catalog.js';
import type { OriginApp } from '../shared/models.js';

const KEYS = ['dashboard.common.deep_link'];

@Component({
  selector: 'dash-deep-link-button-host',
  standalone: true,
  imports: [DeepLinkButtonComponent],
  template: `<dash-deep-link-button [app]="app()" [href]="href()" />`,
})
class HostComponent {
  readonly app = signal<OriginApp>('RAIT');
  readonly href = signal('https://rait.example/casos/1');
}

describe('shared/deep-link-button.component.ts (C-02-64)', () => {
  it('dado app RAIT href externo então <a target=_blank rel=noopener> com deep_link{RAIT} e data-app', async () => {
    const catalog = buildTestCatalog(KEYS);
    TestBed.configureTestingModule({
      imports: [markerI18nModule(KEYS), HostComponent],
    });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const link = element.querySelector('a') as HTMLAnchorElement;
    expect(link.target).toBe('_blank');
    expect(link.rel).toContain('noopener');
    expect(link.textContent).toContain('RAIT');
    expect(link.textContent).toContain(catalog['dashboard.common.deep_link']);
    expect(
      link.closest('[data-app]')?.getAttribute('data-app') ??
        link.getAttribute('data-app'),
    ).toBe('RAIT');
    await expectA11yStateInvariants(element, catalog, { component: true });
  });

  it.each(['/monitoramento/x', '/x'])(
    'dado href relativo ao console (%s) então nenhum <a> e data-invalid true',
    (href) => {
      TestBed.configureTestingModule({
        imports: [markerI18nModule(KEYS), HostComponent],
      });
      const fixture = TestBed.createComponent(HostComponent);
      fixture.componentInstance.href.set(href);
      fixture.detectChanges();
      const element = fixture.nativeElement as HTMLElement;
      expect(element.querySelector('a')).toBeNull();
      expect(element.querySelector('[data-invalid="true"]')).not.toBeNull();
    },
  );
});
