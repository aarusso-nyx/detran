import { TestBed } from '@angular/core/testing';
import { StynxI18nService } from '@stynx-nyx/angular-i18n';
import { expect, it } from 'vitest';
import { loadMobileRuntime } from '../testing/runtime-module';

it('dados StynxError conhecido e erro desconhecido em rota/ação quando FieldShell captura então classifica, sanitiza e registra sem lançar', async () => {
  const runtime = await loadMobileRuntime('core/field-shell.component');
  const FieldShell = (runtime['FieldShell'] ??
    runtime['FieldShellComponent']) as
    | (new () => {
        capture?: (
          error: unknown,
          source: 'route' | 'action',
        ) => { code: string; context: Record<string, string> };
        diagnostics?: () => readonly unknown[];
      })
    | undefined;
  expect(FieldShell).toBeTypeOf('function');
  TestBed.resetTestingModule();
  const shell = TestBed.configureTestingModule({
    imports: [FieldShell as never],
    providers: [
      {
        provide: StynxI18nService,
        useValue: { translate: (key: string) => key },
      },
    ],
  }).createComponent(FieldShell as never).componentInstance as {
    capture: (
      error: unknown,
      source: 'route' | 'action',
    ) => { code: string; context: Record<string, string> };
    diagnostics: () => readonly unknown[];
  };
  expect(() =>
    shell.capture(
      {
        status: 409,
        code: 'TEAT.VERSION_CONFLICT',
        context: { tenantId: 'tenant-001', secret: 'must-not-leak' },
      },
      'action',
    ),
  ).not.toThrow();
  expect(shell.capture(new Error('unexpected'), 'route')).toMatchObject({
    code: 'TEAT.INTERNAL',
    context: expect.not.objectContaining({ secret: expect.anything() }),
  });
  expect(shell.diagnostics()).toHaveLength(2);
});
