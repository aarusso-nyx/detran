import { expect, it } from 'vitest';

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
  expect(ROLES).toHaveLength(9);
  expect(
    victimAccessGuard({ role: 'field-agent', purpose: 'access', audit: true }),
  ).toBe(true);
  expect(
    victimAccessGuard({ role: 'field-agent', purpose: '', audit: true }),
  ).toBe(false);
  expect(
    victimAccessGuard({ role: 'field-agent', purpose: 'access', audit: false }),
  ).toBe(false);
  expect(
    victimAccessGuard({
      role: 'integration-operator',
      purpose: 'access',
      audit: true,
    }),
  ).toBe(false);
});

it('dadas as portas reais quando substituídas por doubles então RenaestPort usa somente outbox/adapter', async () => {
  const module = await import('./ports.js');
  expect(module.BOAT_PORTS).toEqual([
    'GpsPort',
    'CameraPort',
    'SignaturePort',
    'SketchPort',
    'MobileEncryptedStorePort',
    'AttestationPort',
  ]);
  const renaest = new module.RenaestPort({
    outbox: { submit: async () => undefined },
  });
  await expect(renaest.submitCrash({ id: 'crash-001' })).resolves.toBeDefined();
  expect(renaest).not.toHaveProperty('http');
  expect(renaest).not.toHaveProperty('fetch');
});

it('dado o catálogo runtime real quando carregado então preserva 114 chaves, 13 markers bloqueados e a11y das doze telas', async () => {
  const module = await import('./i18n-catalog.js');
  expect(Object.keys(module.BOAT_PT_BR_CATALOG)).toHaveLength(114);
  expect(
    Object.values(module.BOAT_PT_BR_CATALOG).filter(
      (value) => value === 'source_pending:OD-R15-004',
    ),
  ).toHaveLength(13);
  const a11y = await import('./a11y.js');
  await expect(
    a11y.assertBoatA11y({ screens: 12, forbidden: ['serious', 'critical'] }),
  ).resolves.toBe(true);
});
