import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from '@angular/platform-browser/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';

import { DetranAppShellComponent } from '../src/lib/detran-shell.component.js';
import {
  DetranEmptyStateComponent,
  DetranErrorStateComponent,
  DetranLoadingStateComponent,
} from '../src/lib/detran-feedback.component.js';
import { DETRAN_THEME_TOKENS, setDetranTheme } from '../src/lib/theme.js';

beforeAll(() =>
  TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting()),
);
afterEach(() => TestBed.resetTestingModule());

describe('@detran/ui', () => {
  it('exposes stable DETRAN theme tokens and toggles the root theme selector', () => {
    expect(DETRAN_THEME_TOKENS.primary).toBe('#005ca9');
    const documentRef = document.implementation.createHTMLDocument('test');
    setDetranTheme('dark', documentRef);
    expect(documentRef.documentElement.dataset['detranTheme']).toBe('dark');
  });

  it('renders shell navigation and Portuguese-first feedback defaults', async () => {
    await TestBed.configureTestingModule({
      imports: [
        DetranAppShellComponent,
        DetranEmptyStateComponent,
        DetranLoadingStateComponent,
        DetranErrorStateComponent,
      ],
      providers: [provideRouter([])],
    }).compileComponents();
    const shell = TestBed.createComponent(DetranAppShellComponent);
    shell.componentInstance.applicationName = 'RAIT';
    shell.componentInstance.navigation = [
      { label: 'Processos', link: '/processos', icon: '›' },
    ];
    shell.detectChanges();
    expect(shell.nativeElement.textContent).toContain('RAIT');
    expect(shell.nativeElement.textContent).toContain('Processos');
    expect(new DetranEmptyStateComponent().message).toBe(
      'Nenhum registro encontrado.',
    );
    expect(new DetranLoadingStateComponent().label).toBe('Carregando…');
    expect(new DetranErrorStateComponent().title).toContain('Não foi possível');
  });
});
