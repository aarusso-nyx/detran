import { TestBed } from '@angular/core/testing';
import { run } from 'axe-core';
import { expect, it, vi } from 'vitest';

const ROLES = [
  'field-agent',
  'field-supervisor',
  'processing-operator',
  'traffic-authority',
  'agency-admin',
  'technical-admin',
  'AUDITOR',
  'bi-analyst',
  'integration-operator',
] as const;

it('dado victimAccessGuard real quando avaliado então exige papel, finalidade e auditoria', async () => {
  const { victimAccessGuard } = await import('./victim-access.guard.js');
  for (const role of ROLES) {
    const allowed = role === 'field-agent' || role === 'field-supervisor';
    expect
      .soft(
        victimAccessGuard({ role, purpose: 'access', audit: true }),
        `${role}: presença/ausência`,
      )
      .toBe(allowed);
    if (allowed) {
      expect
        .soft(
          victimAccessGuard({ role, purpose: '', audit: true }),
          `${role}: finalidade vazia`,
        )
        .toBe(false);
      expect
        .soft(
          victimAccessGuard({ role, purpose: 'access', audit: false }),
          `${role}: auditoria falsa`,
        )
        .toBe(false);
    }
  }
});

it('dados os seis tokens nativos quando resolvidos no TestBed então expõem doubles executáveis', async () => {
  const module = await import('./ports.js');
  const gps = {
    locate: vi.fn(async () => ({ latitude: -23, longitude: -46, accuracy: 4 })),
  };
  const camera = {
    capture: vi.fn(async () => ({
      assetId: 'asset-001',
      sha256: 'sha256:photo',
    })),
  };
  const signature = {
    capture: vi.fn(async () => ({
      signature: 'signed',
      signedAt: '2026-09-24T13:00:00Z',
    })),
  };
  const sketch = { save: vi.fn(async (drawing: string) => ({ drawing })) };
  const store = {
    get: vi.fn(async () => 'encrypted-value'),
    set: vi.fn(async () => undefined),
  };
  const attestation = {
    attest: vi.fn(async () => ({
      deviceId: 'device-001',
      attestation: 'valid',
    })),
  };
  TestBed.configureTestingModule({
    providers: [
      { provide: module.BOAT_GPS_PORT, useValue: gps },
      { provide: module.BOAT_CAMERA_PORT, useValue: camera },
      { provide: module.BOAT_SIGNATURE_PORT, useValue: signature },
      { provide: module.BOAT_SKETCH_PORT, useValue: sketch },
      { provide: module.BOAT_ENCRYPTED_STORE_PORT, useValue: store },
      { provide: module.BOAT_ATTESTATION_PORT, useValue: attestation },
    ],
  });
  await expect(
    TestBed.inject(module.BOAT_GPS_PORT).locate(),
  ).resolves.toMatchObject({ accuracy: 4 });
  await expect(
    TestBed.inject(module.BOAT_CAMERA_PORT).capture(),
  ).resolves.toMatchObject({ assetId: 'asset-001' });
  await expect(
    TestBed.inject(module.BOAT_SIGNATURE_PORT).capture(),
  ).resolves.toMatchObject({ signature: 'signed' });
  await expect(
    TestBed.inject(module.BOAT_SKETCH_PORT).save('line'),
  ).resolves.toEqual({ drawing: 'line' });
  await expect(
    TestBed.inject(module.BOAT_ENCRYPTED_STORE_PORT).get('draft'),
  ).resolves.toBe('encrypted-value');
  await TestBed.inject(module.BOAT_ENCRYPTED_STORE_PORT).set(
    'draft',
    'ciphertext',
  );
  await expect(
    TestBed.inject(module.BOAT_ATTESTATION_PORT).attest(),
  ).resolves.toMatchObject({ deviceId: 'device-001' });
  expect(gps.locate).toHaveBeenCalledOnce();
  expect(camera.capture).toHaveBeenCalledOnce();
  expect(signature.capture).toHaveBeenCalledOnce();
  expect(sketch.save).toHaveBeenCalledWith('line');
  expect(store.get).toHaveBeenCalledWith('draft');
  expect(store.set).toHaveBeenCalledWith('draft', 'ciphertext');
  expect(attestation.attest).toHaveBeenCalledOnce();
});

it('dado RenaestPort quando envia sinistro então usa somente outbox/adapter', async () => {
  const module = await import('./ports.js');
  const renaest = new module.RenaestPort({
    outbox: { submit: async () => undefined },
  });
  await expect(renaest.submitCrash({ id: 'crash-001' })).resolves.toBeDefined();
  expect(renaest).not.toHaveProperty('http');
  expect(renaest).not.toHaveProperty('fetch');
});

it('dado o catálogo runtime real quando carregado então preserva 114 chaves e 13 marcadores bloqueados', async () => {
  const module = await import('./i18n-catalog.js');
  expect(Object.keys(module.BOAT_PT_BR_CATALOG)).toHaveLength(114);
  expect(
    Object.values(module.BOAT_PT_BR_CATALOG).filter(
      (value) => value === 'source_pending:OD-R15-004',
    ),
  ).toHaveLength(13);
});

it('dadas as doze páginas BOAT quando montadas então axe não encontra impacto serious/critical', async () => {
  const pages = await import('./pages/boat-pages.js');
  const components = Object.entries(pages)
    .filter(([name]) => name.endsWith('PageComponent'))
    .map(([, component]) => component);
  expect(components).toHaveLength(12);
  const rendered: string[] = [];
  for (const component of components) {
    const fixture = TestBed.configureTestingModule({
      imports: [component as never],
    }).createComponent(component as never);
    fixture.detectChanges();
    const result = await run(fixture.nativeElement as HTMLElement, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
    });
    expect
      .soft(
        result.violations.filter(
          (violation) =>
            violation.impact === 'serious' || violation.impact === 'critical',
        ),
        component.name,
      )
      .toEqual([]);
    rendered.push((fixture.nativeElement as HTMLElement).textContent ?? '');
    fixture.destroy();
    TestBed.resetTestingModule();
  }
  const text = rendered.join(' ');
  expect(text).not.toContain('source_pending:OD-R15-004');
  expect(text).toMatch(/fotografar a cena, não o sofrimento/i);
  expect(text).toMatch(/sinistro/i);
});
