import { describe, expect, it, vi } from 'vitest';

import {
  DETRAN_ROLES,
  ROLE_ALIASES,
  DASHBOARD_ROLES,
  canonicalRoles,
} from './roles.js';
import {
  DETRAN_POLICY_MATRIX,
  isDetranActionAllowed,
  permissionsForRoles,
  dashboardLayerFor,
  dashboardLayerAllows,
} from './policy.js';
import { withTenantContext } from './tenant-context.js';

describe('DETRAN unified policy kit', () => {
  it('deduplicates only TEAT auditor into the PEC AUDITOR role', () => {
    expect(DETRAN_ROLES).toHaveLength(36);
    expect(ROLE_ALIASES.auditor).toBe('AUDITOR');
    expect(canonicalRoles(['auditor', 'AUDITOR', 'field-supervisor'])).toEqual([
      'AUDITOR',
      'field-supervisor',
    ]);
  });

  it('grants RAIT command and surface rules only to RAIT staff roles', () => {
    expect(
      isDetranActionAllowed(
        { roles: ['rait-analyst'], permissions: [] },
        'inf:rait-case',
        'claim-next',
      ),
    ).toBe(true);
    expect(
      isDetranActionAllowed(
        { roles: ['rait-analyst'], permissions: [] },
        'inf:rait-decision',
        'sign',
      ),
    ).toBe(false);
    expect(
      isDetranActionAllowed(
        { roles: ['rait-signing-authority'], permissions: [] },
        'inf:rait-decision',
        'sign',
      ),
    ).toBe(true);
    expect(
      isDetranActionAllowed(
        { roles: ['rait-chair'], permissions: [] },
        'inf:rait-session',
        'proclaim',
      ),
    ).toBe(true);
    expect(
      isDetranActionAllowed(
        { roles: ['rait-rapporteur'], permissions: [] },
        'inf:rait-session',
        'proclaim',
      ),
    ).toBe(false);
    expect(
      isDetranActionAllowed(
        { roles: ['field-agent'], permissions: [] },
        'inf:rait-case',
        'read',
      ),
    ).toBe(false);
    expect(
      isDetranActionAllowed(
        { roles: ['AUDITOR'], permissions: [] },
        'inf:rait-case',
        'read',
      ),
    ).toBe(true);
    expect(
      isDetranActionAllowed(
        { roles: ['AUDITOR'], permissions: [] },
        'inf:rait-case',
        'update',
      ),
    ).toBe(false);
  });

  it('keeps every policy key domain namespaced', () => {
    expect(Object.keys(DETRAN_POLICY_MATRIX).length).toBeGreaterThan(140);
    expect(
      Object.keys(DETRAN_POLICY_MATRIX).every(
        (key) => key.split(':').length === 3,
      ),
    ).toBe(true);
  });

  it('closes the WP-T0 policy gaps: ops read surfaces, speed catalogue and BOAT decisions', () => {
    const allowed = (roles: string[], resource: string, action: string) =>
      isDetranActionAllowed({ roles, permissions: [] }, resource, action);
    expect(allowed(['field-supervisor'], 'ops:homologation', 'read')).toBe(
      true,
    );
    expect(allowed(['field-agent'], 'ops:homologation', 'read')).toBe(false);
    expect(
      allowed(['integration-operator'], 'ops:application-version', 'read'),
    ).toBe(true);
    // complete-upload and validate return with their routes in WP-T2
    expect(
      allowed(['processing-operator'], 'ops:evidence', 'complete-upload'),
    ).toBe(false);
    expect(allowed(['AUDITOR'], 'ops:evidence', 'validate')).toBe(false);
    expect(allowed(['agency-admin'], 'inf:speed-meter', 'create')).toBe(true);
    expect(allowed(['field-agent'], 'inf:speed-meter', 'create')).toBe(false);
    expect(allowed(['field-agent'], 'inf:speed-measurement', 'create')).toBe(
      true,
    );
    expect(allowed(['bi-analyst'], 'inf:speed-measurement', 'read')).toBe(true);
    // steering H.39/BOAT corpus: validate by processing-operator or traffic-authority
    expect(
      allowed(['processing-operator'], 'est:crash-record', 'validate'),
    ).toBe(true);
    expect(allowed(['traffic-authority'], 'est:crash-record', 'validate')).toBe(
      true,
    );
    expect(allowed(['field-supervisor'], 'est:crash-record', 'validate')).toBe(
      false,
    );
    expect(
      allowed(['processing-operator'], 'est:crash-record', 'attach-sketch'),
    ).toBe(true);
  });

  it('preserves PEC, TEAT, and citizen decisions', () => {
    expect(
      isDetranActionAllowed(
        { roles: ['MEDICO'], permissions: [] },
        'ch:encounter',
        'sign',
      ),
    ).toBe(true);
    expect(
      isDetranActionAllowed(
        { roles: ['field-agent'], permissions: [] },
        'ops:evidence',
        'add-custody-event',
      ),
    ).toBe(true);
    expect(
      isDetranActionAllowed(
        { roles: ['field-agent'], permissions: [] },
        'ops:homologation',
        'create',
      ),
    ).toBe(false);
    expect(
      isDetranActionAllowed(
        { roles: ['agency-admin'], permissions: [] },
        'inf:normative-catalog',
        'create',
      ),
    ).toBe(true);
    expect(
      isDetranActionAllowed(
        { roles: ['field-agent'], permissions: [] },
        'inf:normative-catalog',
        'create',
      ),
    ).toBe(false);
    expect(
      isDetranActionAllowed(
        { roles: ['field-agent'], permissions: [] },
        'inf:alcohol-test',
        'create',
      ),
    ).toBe(true);
    expect(
      isDetranActionAllowed(
        { roles: ['field-agent'], permissions: [] },
        'inf:ait',
        'finalize',
      ),
    ).toBe(true);
    expect(
      isDetranActionAllowed(
        { roles: ['field-agent'], permissions: [] },
        'inf:ait',
        'accept',
      ),
    ).toBe(false);
    expect(
      isDetranActionAllowed(
        { roles: ['CIDADAO'], permissions: [] },
        'portal:appeal',
        'create',
      ),
    ).toBe(true);
    expect(permissionsForRoles(['technical-admin'])).toEqual(['*']);
  });

  it('reserves retention review for the DPO role', () => {
    expect(
      isDetranActionAllowed(
        { roles: ['DPO'], permissions: [] },
        'ch:retention',
        'review',
      ),
    ).toBe(true);
    expect(
      isDetranActionAllowed(
        { roles: ['GESTOR_DETRAN'], permissions: ['*'] },
        'ch:retention',
        'review',
      ),
    ).toBe(false);
  });

  it('AC-PEC-011-6 confines candidate access to the ownership-checked dossier route', () => {
    const candidate = { roles: ['CANDIDATO'], permissions: [] };
    expect(
      isDetranActionAllowed(candidate, 'ch:candidate-dossier', 'read'),
    ).toBe(true);
    expect(
      isDetranActionAllowed(
        candidate,
        'ch:candidate-dossier',
        'feedback-request',
      ),
    ).toBe(true);
    expect(isDetranActionAllowed(candidate, 'ch:report', 'read')).toBe(false);
    expect(isDetranActionAllowed(candidate, 'ch:patient', 'read')).toBe(false);
  });

  it('always uses the app role for request-path transactions', async () => {
    const tx = vi.fn(
      async (work: (trx: never) => Promise<string>, options: unknown) => {
        expect(options).toEqual({ readonly: true, role: 'app' });
        return work({} as never);
      },
    );
    const result = await withTenantContext(
      { tx } as never,
      {
        hasActiveContext: () => true,
        snapshot: () => ({
          requestId: 'request-1',
          tenantId: 'tenant-1',
          actorId: 'actor-1',
          startedAt: new Date(),
        }),
      },
      async () => 'ok',
      { readonly: true },
    );
    expect(result).toBe('ok');
  });

  it('fails before touching the database when tenant context is missing', async () => {
    const tx = vi.fn();
    await expect(
      withTenantContext(
        { tx } as never,
        { hasActiveContext: () => false, snapshot: () => ({}) as never },
        async () => undefined,
      ),
    ).rejects.toThrow('active request context');
    expect(tx).not.toHaveBeenCalled();
  });
});

describe('DASHBOARD roles, dashboard:* policy matrix and access layers (WP-D0, CTG-0001)', () => {
  const allowed = (roles: string[], resource: string, action: string) =>
    isDetranActionAllowed({ roles, permissions: [] }, resource, action);

  // CTG-0001 §5 — exhaustive role -> maximum layer table (36 roles).
  const N2_TRANSVERSAL = ['agency-admin', 'GESTOR_DETRAN', 'AUDITOR', 'DPO'];
  const N2_OWN_AREA = [
    'rait-manager',
    'rait-coordinator',
    'rait-chair',
    'traffic-authority',
    'GESTOR',
  ];
  const N1_ROLES = [
    'dash-operator',
    'dash-duty-owner',
    'technical-admin',
    'integration-operator',
    'bi-analyst',
  ];
  const N0_ROLES = [
    'ADMIN',
    'ADMIN_CLINICA',
    'MEDICO',
    'PSICOLOGO',
    'RECEPCAO',
    'TECNICO_BIOMETRIA',
    'SUPERVISOR',
    'JUNTA',
    'CETRAN',
    'SUPORTE',
    'CANDIDATO',
    'field-agent',
    'field-supervisor',
    'processing-operator',
    'rait-analyst',
    'rait-secretary',
    'rait-signing-authority',
    'rait-central-authority',
    'rait-rapporteur',
    'rait-hr',
    'rait-finance',
    'CIDADAO',
  ];
  const ROLE_LAYER: Record<string, 'N0' | 'N1' | 'N2'> = Object.fromEntries([
    ...N2_TRANSVERSAL.map((role) => [role, 'N2'] as const),
    ...N2_OWN_AREA.map((role) => [role, 'N2'] as const),
    ...N1_ROLES.map((role) => [role, 'N1'] as const),
    ...N0_ROLES.map((role) => [role, 'N0'] as const),
  ]);

  // CTG-0001 §3 — the 32 dashboard:<resource>:<action> permissions after WP-D0.
  const DASH_N0_ROLES = DETRAN_ROLES.filter(
    (role) => role !== 'CANDIDATO' && role !== 'CIDADAO',
  );
  const DASH_EXPORT_ROLES = [
    'agency-admin',
    'GESTOR_DETRAN',
    'rait-manager',
    'rait-coordinator',
    'rait-chair',
    'traffic-authority',
    'GESTOR',
    'dash-operator',
    'dash-duty-owner',
    'technical-admin',
    'integration-operator',
    'bi-analyst',
  ];
  // CTG-0001 §7 — these roles receive every key through GLOBAL_ADMIN_ROLES,
  // even when omitted from an individual static grant list.
  const GLOBAL_ADMIN_ROLE_GRANTS = [
    'ADMIN',
    'GESTOR_DETRAN',
    'SUPORTE',
    'technical-admin',
  ];
  const DASHBOARD_PERMISSION_MATRIX: Record<string, readonly string[]> = {
    'dashboard:alert:read': [
      'dash-operator',
      'rait-manager',
      'rait-coordinator',
      'rait-chair',
      'traffic-authority',
      'GESTOR',
      'agency-admin',
      'technical-admin',
      'AUDITOR',
    ],
    'dashboard:alert:ack': [
      'dash-operator',
      'rait-manager',
      'rait-coordinator',
      'rait-chair',
      'traffic-authority',
      'GESTOR',
      'agency-admin',
      'technical-admin',
      'integration-operator',
    ],
    'dashboard:alert:treat': [
      'rait-manager',
      'rait-coordinator',
      'rait-chair',
      'traffic-authority',
      'GESTOR',
      'agency-admin',
      'technical-admin',
      'integration-operator',
    ],
    'dashboard:alert:close': ['dash-operator'],
    'dashboard:alert:annotate': ['technical-admin', 'integration-operator'],
    'dashboard:incident:read': [
      'rait-manager',
      'rait-coordinator',
      'rait-chair',
      'traffic-authority',
      'GESTOR',
      'agency-admin',
      'AUDITOR',
    ],
    'dashboard:duty:read': DASH_N0_ROLES,
    'dashboard:duty-cycle:read': DASH_N0_ROLES,
    'dashboard:duty-cycle:start': ['dash-duty-owner', 'agency-admin'],
    'dashboard:duty-cycle:prepare': ['dash-duty-owner', 'agency-admin'],
    'dashboard:duty-cycle:submit': ['dash-duty-owner', 'agency-admin'],
    'dashboard:duty-cycle:prove': ['dash-duty-owner', 'agency-admin'],
    'dashboard:duty-cycle:archive': ['dash-operator', 'agency-admin'],
    'dashboard:indicator:read': DASH_N0_ROLES,
    'dashboard:indicator-config:read': [
      'bi-analyst',
      'agency-admin',
      'technical-admin',
      'AUDITOR',
    ],
    'dashboard:indicator-config:update': [
      'bi-analyst',
      'agency-admin',
      'technical-admin',
    ],
    'dashboard:indicator-config:publish': [
      'bi-analyst',
      'agency-admin',
      'technical-admin',
    ],
    'dashboard:bi-panel:read': [
      'bi-analyst',
      'agency-admin',
      'technical-admin',
      'AUDITOR',
    ],
    'dashboard:bi-panel:publish': [
      'bi-analyst',
      'agency-admin',
      'technical-admin',
    ],
    'dashboard:generated-report:read': [
      'bi-analyst',
      'agency-admin',
      'technical-admin',
      'AUDITOR',
    ],
    'dashboard:generated-report:request': [
      'bi-analyst',
      'agency-admin',
      'technical-admin',
    ],
    'dashboard:generated-report:complete': ['bi-analyst', 'technical-admin'],
    'dashboard:generated-report:fail': ['bi-analyst', 'technical-admin'],
    'dashboard:source:read': [
      'technical-admin',
      'integration-operator',
      'dash-operator',
      'AUDITOR',
    ],
    'dashboard:export:create': DASH_EXPORT_ROLES,
    'dashboard:export:approve': ['agency-admin'],
    'dashboard:audit-trail:read': [
      'AUDITOR',
      'DPO',
      'agency-admin',
      'rait-manager',
      'rait-coordinator',
      'rait-chair',
      'traffic-authority',
      'GESTOR',
    ],
    'dashboard:comparison:read': [
      'agency-admin',
      'rait-manager',
      'rait-coordinator',
      'rait-chair',
      'traffic-authority',
      'GESTOR',
      'bi-analyst',
      'AUDITOR',
    ],
    'dashboard:transparency-audit:read': [
      'technical-admin',
      'agency-admin',
      'AUDITOR',
    ],
    'dashboard:transparency-audit:audit': ['technical-admin', 'agency-admin'],
    'dashboard:dataset:read': DASH_N0_ROLES,
    'dashboard:kpi:read': ['agency-admin', 'dash-operator', 'AUDITOR'],
  };
  // CTG-0001 §3, the five `(=)` rules preserved verbatim from before WP-D0.
  const PRESERVED_RULE_KEYS = [
    'dashboard:indicator-config:publish',
    'dashboard:bi-panel:publish',
    'dashboard:generated-report:request',
    'dashboard:generated-report:complete',
    'dashboard:generated-report:fail',
  ];

  it('catalogs the two DASHBOARD roles inside DETRAN_ROLES (CTG-0001 §1)', () => {
    expect(DASHBOARD_ROLES).toEqual(['dash-operator', 'dash-duty-owner']);
    expect(DETRAN_ROLES).toContain('dash-operator');
    expect(DETRAN_ROLES).toContain('dash-duty-owner');
  });

  it('canonicalizes dash-operator and dash-duty-owner as themselves (CTG-0001 §8.1.2)', () => {
    expect(canonicalRoles(['dash-operator'])).toEqual(['dash-operator']);
    expect(canonicalRoles(['dash-duty-owner'])).toEqual(['dash-duty-owner']);
  });

  it('preserves the auditor alias alongside a DASHBOARD role (CTG-0001 §8.1.3)', () => {
    expect(canonicalRoles(['auditor', 'dash-operator'])).toEqual([
      'AUDITOR',
      'dash-operator',
    ]);
  });

  it('defines the dashboard:* matrix exactly as CTG-0001 §3 (32 permissions)', () => {
    for (const [key, roles] of Object.entries(DASHBOARD_PERMISSION_MATRIX)) {
      expect(new Set(DETRAN_POLICY_MATRIX[key as never])).toEqual(
        new Set(roles),
      );
    }
    const dashboardKeys = Object.keys(DETRAN_POLICY_MATRIX).filter((key) =>
      key.startsWith('dashboard:'),
    );
    expect(dashboardKeys.sort()).toEqual(
      Object.keys(DASHBOARD_PERMISSION_MATRIX).sort(),
    );
    expect(dashboardKeys).toHaveLength(32);
  });

  it('keeps the five pre-existing dashboard rules unchanged (CTG-0001 §8.1.6)', () => {
    for (const key of PRESERVED_RULE_KEYS) {
      expect(new Set(DETRAN_POLICY_MATRIX[key as never])).toEqual(
        new Set(DASHBOARD_PERMISSION_MATRIX[key]),
      );
    }
  });

  it('grants every (role, permission) pair of CTG-0001 §3 through isDetranActionAllowed (CTG-0001 §8.1.7)', () => {
    for (const [key, roles] of Object.entries(DASHBOARD_PERMISSION_MATRIX)) {
      const [, resource, action] = key.split(':');
      for (const role of roles) {
        const permissions = permissionsForRoles([role]);
        expect(
          isDetranActionAllowed(
            { roles: [role], permissions },
            `dashboard:${resource}`,
            action,
          ),
        ).toBe(true);
      }
    }
  });

  it('denies every dashboard permission to every canonical role omitted from its effective grant (CTG-0001 §7, §8.2)', () => {
    for (const [key, grantedRoles] of Object.entries(
      DASHBOARD_PERMISSION_MATRIX,
    )) {
      const [, resource, action] = key.split(':');
      const granted = new Set([...grantedRoles, ...GLOBAL_ADMIN_ROLE_GRANTS]);
      for (const role of DETRAN_ROLES) {
        if (!granted.has(role)) {
          expect(
            allowed([role], `dashboard:${resource}`, action),
            `${role} unexpectedly holds ${key}`,
          ).toBe(false);
        }
      }
    }
  });

  it('dash-operator holds exactly its granted dashboard actions (CTG-0001 §8.1.8)', () => {
    const granted: Array<[string, string]> = [
      ['dashboard:alert', 'read'],
      ['dashboard:alert', 'ack'],
      ['dashboard:alert', 'close'],
      ['dashboard:duty-cycle', 'archive'],
      ['dashboard:source', 'read'],
      ['dashboard:kpi', 'read'],
      ['dashboard:duty', 'read'],
      ['dashboard:duty-cycle', 'read'],
      ['dashboard:indicator', 'read'],
      ['dashboard:dataset', 'read'],
      ['dashboard:export', 'create'],
    ];
    for (const [resource, action] of granted) {
      expect(allowed(['dash-operator'], resource, action)).toBe(true);
    }
  });

  it('dash-duty-owner holds exactly its granted dashboard actions (CTG-0001 §8.1.9)', () => {
    const granted: Array<[string, string]> = [
      ['dashboard:duty-cycle', 'start'],
      ['dashboard:duty-cycle', 'prepare'],
      ['dashboard:duty-cycle', 'submit'],
      ['dashboard:duty-cycle', 'prove'],
      ['dashboard:duty', 'read'],
      ['dashboard:duty-cycle', 'read'],
      ['dashboard:indicator', 'read'],
      ['dashboard:dataset', 'read'],
      ['dashboard:export', 'create'],
    ];
    for (const [resource, action] of granted) {
      expect(allowed(['dash-duty-owner'], resource, action)).toBe(true);
    }
  });

  it('AUDITOR holds every dashboard:<resource>:read permission of CTG-0001 §3 (CTG-0001 §8.1.10)', () => {
    const readKeys = Object.keys(DASHBOARD_PERMISSION_MATRIX).filter((key) =>
      key.endsWith(':read'),
    );
    for (const key of readKeys) {
      const [, resource, action] = key.split(':');
      expect(allowed(['AUDITOR'], `dashboard:${resource}`, action)).toBe(true);
    }
  });

  it('computes the maximum layer per role over the exhaustive CTG-0001 §5 table', () => {
    for (const [role, layer] of Object.entries(ROLE_LAYER)) {
      expect(dashboardLayerFor([role])).toBe(layer);
    }
  });

  it('accumulates the highest layer across combined roles (CTG-0001 §8.1.12, ADR-0005)', () => {
    expect(dashboardLayerFor(['dash-operator', 'agency-admin'])).toBe('N2');
  });

  it('defaults to N0 for empty, unknown or non-staff role lists and never throws (CTG-0001 §8.1.13)', () => {
    expect(dashboardLayerFor([])).toBe('N0');
    expect(dashboardLayerFor(['papel-inexistente'])).toBe('N0');
    expect(dashboardLayerFor(['CIDADAO'])).toBe('N0');
    expect(() => dashboardLayerFor(['papel-inexistente'])).not.toThrow();
  });

  it('canonicalizes the auditor alias before computing the layer (CTG-0001 §8.1.14)', () => {
    expect(dashboardLayerFor(['auditor'])).toBe('N2');
  });

  it('allows dash-operator at N0 and N1 (CTG-0001 §8.1.15)', () => {
    expect(dashboardLayerAllows(['dash-operator'], 'N0')).toBe(true);
    expect(dashboardLayerAllows(['dash-operator'], 'N1')).toBe(true);
  });

  it('allows rait-manager at N2 (CTG-0001 §8.1.16)', () => {
    expect(dashboardLayerAllows(['rait-manager'], 'N2')).toBe(true);
  });

  it('never grants N3, for any single role or the union of all 36 roles (CTG-0001 §8.2.17)', () => {
    for (const role of DETRAN_ROLES) {
      expect(dashboardLayerAllows([role], 'N3')).toBe(false);
    }
    expect(dashboardLayerAllows([...DETRAN_ROLES], 'N3')).toBe(false);
  });

  it('never computes N3 as a layer, for any role, the empty list or an unknown role (CTG-0001 §8.2.18)', () => {
    for (const role of DETRAN_ROLES) {
      expect(dashboardLayerFor([role])).not.toBe('N3');
    }
    expect(dashboardLayerFor([])).not.toBe('N3');
    expect(dashboardLayerFor(['papel-inexistente'])).not.toBe('N3');
  });

  it('denies layers above each role ceiling (CTG-0001 §8.2.19)', () => {
    expect(dashboardLayerAllows(['dash-operator'], 'N2')).toBe(false);
    expect(dashboardLayerAllows(['dash-duty-owner'], 'N2')).toBe(false);
    expect(dashboardLayerAllows(['bi-analyst'], 'N2')).toBe(false);
    expect(dashboardLayerAllows(['integration-operator'], 'N2')).toBe(false);
    expect(dashboardLayerAllows(['field-agent'], 'N1')).toBe(false);
    expect(dashboardLayerAllows(['CIDADAO'], 'N1')).toBe(false);
  });

  it('denies dash-operator every action outside its grant (CTG-0001 §8.2.20)', () => {
    const denied: Array<[string, string]> = [
      ['dashboard:alert', 'treat'],
      ['dashboard:alert', 'annotate'],
      ['dashboard:duty-cycle', 'start'],
      ['dashboard:duty-cycle', 'prepare'],
      ['dashboard:duty-cycle', 'submit'],
      ['dashboard:duty-cycle', 'prove'],
      ['dashboard:export', 'approve'],
      ['dashboard:indicator-config', 'read'],
      ['dashboard:indicator-config', 'update'],
      ['dashboard:indicator-config', 'publish'],
      ['dashboard:bi-panel', 'read'],
      ['dashboard:bi-panel', 'publish'],
      ['dashboard:generated-report', 'read'],
      ['dashboard:generated-report', 'request'],
      ['dashboard:generated-report', 'complete'],
      ['dashboard:generated-report', 'fail'],
      ['dashboard:transparency-audit', 'read'],
      ['dashboard:transparency-audit', 'audit'],
      ['dashboard:audit-trail', 'read'],
      ['dashboard:comparison', 'read'],
      ['dashboard:incident', 'read'],
    ];
    for (const [resource, action] of denied) {
      expect(allowed(['dash-operator'], resource, action)).toBe(false);
    }
  });

  it('denies dash-duty-owner every action outside its grant (CTG-0001 §8.2.21)', () => {
    const denied: Array<[string, string]> = [
      ['dashboard:alert', 'read'],
      ['dashboard:alert', 'ack'],
      ['dashboard:alert', 'treat'],
      ['dashboard:alert', 'close'],
      ['dashboard:alert', 'annotate'],
      ['dashboard:incident', 'read'],
      ['dashboard:duty-cycle', 'archive'],
      ['dashboard:export', 'approve'],
      ['dashboard:audit-trail', 'read'],
      ['dashboard:comparison', 'read'],
      ['dashboard:kpi', 'read'],
      ['dashboard:source', 'read'],
    ];
    for (const [resource, action] of denied) {
      expect(allowed(['dash-duty-owner'], resource, action)).toBe(false);
    }
  });

  it('denies AUDITOR every dashboard mutation (CTG-0001 §8.2.22)', () => {
    const denied: Array<[string, string]> = [
      ['dashboard:alert', 'ack'],
      ['dashboard:alert', 'treat'],
      ['dashboard:alert', 'close'],
      ['dashboard:alert', 'annotate'],
      ['dashboard:duty-cycle', 'start'],
      ['dashboard:duty-cycle', 'prepare'],
      ['dashboard:duty-cycle', 'submit'],
      ['dashboard:duty-cycle', 'prove'],
      ['dashboard:duty-cycle', 'archive'],
      ['dashboard:indicator-config', 'update'],
      ['dashboard:indicator-config', 'publish'],
      ['dashboard:bi-panel', 'publish'],
      ['dashboard:generated-report', 'request'],
      ['dashboard:generated-report', 'complete'],
      ['dashboard:generated-report', 'fail'],
      ['dashboard:export', 'create'],
      ['dashboard:export', 'approve'],
      ['dashboard:transparency-audit', 'audit'],
    ];
    for (const [resource, action] of denied) {
      expect(allowed(['AUDITOR'], resource, action)).toBe(false);
    }
  });

  it('denies DPO the dashboard export permissions, read-only by CTG-0001 §8.2.22', () => {
    expect(allowed(['DPO'], 'dashboard:export', 'create')).toBe(false);
    expect(allowed(['DPO'], 'dashboard:export', 'approve')).toBe(false);
  });

  it('denies bi-analyst and integration-operator the actions CTG-0001 §8.2.23 names', () => {
    expect(allowed(['bi-analyst'], 'dashboard:export', 'approve')).toBe(false);
    expect(allowed(['bi-analyst'], 'dashboard:alert', 'read')).toBe(false);
    expect(allowed(['bi-analyst'], 'dashboard:alert', 'ack')).toBe(false);
    expect(allowed(['bi-analyst'], 'dashboard:incident', 'read')).toBe(false);
    expect(allowed(['integration-operator'], 'dashboard:alert', 'read')).toBe(
      false,
    );
    expect(allowed(['integration-operator'], 'dashboard:alert', 'close')).toBe(
      false,
    );
    expect(
      allowed(['integration-operator'], 'dashboard:incident', 'read'),
    ).toBe(false);
    expect(
      allowed(['integration-operator'], 'dashboard:audit-trail', 'read'),
    ).toBe(false);
    for (const action of ['start', 'prepare', 'submit', 'prove', 'archive']) {
      expect(
        allowed(['integration-operator'], 'dashboard:duty-cycle', action),
      ).toBe(false);
    }
  });

  it('denies every dashboard mutation to non-DASHBOARD roles, and denies org-only reads to non-staff roles (CTG-0001 §8.2.24)', () => {
    const noDomainRoles = [
      'field-agent',
      'MEDICO',
      'rait-analyst',
      'CANDIDATO',
      'CIDADAO',
    ];
    const mutationKeys = Object.keys(DASHBOARD_PERMISSION_MATRIX).filter(
      (key) => !key.endsWith(':read'),
    );
    for (const role of noDomainRoles) {
      for (const key of mutationKeys) {
        const [, resource, action] = key.split(':');
        expect(allowed([role], `dashboard:${resource}`, action)).toBe(false);
      }
    }
    for (const role of ['CANDIDATO', 'CIDADAO']) {
      expect(allowed([role], 'dashboard:duty', 'read')).toBe(false);
      expect(allowed([role], 'dashboard:duty-cycle', 'read')).toBe(false);
      expect(allowed([role], 'dashboard:indicator', 'read')).toBe(false);
      expect(allowed([role], 'dashboard:dataset', 'read')).toBe(false);
    }
  });

  it('confines every dashboard:* key to the 15 CTG-0001 resources and never writes another domain (CTG-0001 §8.2.25)', () => {
    const allowedResources = new Set([
      'alert',
      'incident',
      'duty',
      'duty-cycle',
      'indicator',
      'indicator-config',
      'bi-panel',
      'generated-report',
      'source',
      'export',
      'audit-trail',
      'comparison',
      'transparency-audit',
      'dataset',
      'kpi',
    ]);
    const dashboardKeys = Object.keys(DETRAN_POLICY_MATRIX).filter((key) =>
      key.startsWith('dashboard:'),
    );
    for (const key of dashboardKeys) {
      const [, resource] = key.split(':');
      expect(allowedResources.has(resource as string)).toBe(true);
    }
    expect(
      Object.keys(DETRAN_POLICY_MATRIX).some((key) =>
        ['inf:', 'ch:', 'est:', 'ops:', 'portal:'].some(
          (prefix) => key.startsWith(prefix) && key.includes('dashboard'),
        ),
      ),
    ).toBe(false);
  });
});

/**
 * CTG-0002 — recursos sem matriz até R-0007 (M17(c), delivery-review-CTG-0002
 * ciclo 1, achado 4; work/rounds/R-0006/plan.md). `rait-org`, `collection` e
 * `rait-integration` ficam desmontados do `AppModule` nesta rodada, mas os
 * recursos NOVOS dos módulos já montados (`rait-case`, `rait-worklist`,
 * `rait-session`) continuam expostos pela superfície CRUD gerada — por isso
 * a política precisa provar ausência (README da orquestra §4 regra 8) para
 * os 23 recursos abaixo, em toda ação gerada (`read`, `create`, `update`,
 * `delete`) e todo papel canônico de `roles.ts`, até R-0007 criar a matriz
 * real.
 *
 * Dois papéis são exceção estrutural, não gap desta rodada:
 * `GLOBAL_ADMIN_ROLES` (`ADMIN`, `GESTOR_DETRAN`, `SUPORTE`,
 * `technical-admin`) — `isDetranActionAllowed` os libera para toda chave
 * antes de consultar `DETRAN_POLICY_MATRIX` (mesmo comportamento que
 * `permissionsForRoles(['technical-admin'])` devolve `['*']`, provado acima
 * em "preserves PEC, TEAT, and citizen decisions"); isto é válido para
 * qualquer recurso do sistema, não uma lacuna dos recursos novos.
 *
 * Escopo da negativa: só a superfície CRUD **gerada** (`read`/`create`/
 * `update`/`delete`, `api.resources[].operations`), que é o que M17(c) e
 * "guarda falha fechado" cobrem. Vários destes recursos já têm ação de
 * **comando** gravada em `RAIT_COMMAND_RULES` de rodada anterior
 * (worklist/org, TASK-0004/0005) — `rait-unit:constitute/activate`,
 * `rait-schedule:publish`, `rait-batch:open/draw/approve/accept/impede`,
 * `rait-incident:open`, `rait-quality-sample:review`,
 * `rait-capacity-plan:publish` — nenhuma delas é `read`/`create`/`update`/
 * `delete`, então ficam fora desta negativa (comando ≠ superfície gerada;
 * fora do escopo desta tarefa).
 *
 * Achado (não corrigido aqui — Inspector não edita `policy.ts`, manual
 * `inspector-tests.md` §Não pode tocar): duas dessas chaves de comando
 * COINCIDEM com uma ação gerada — `inf:rait-suspension-act:create`
 * (`rait-signing-authority`, `rait-chair`) e `inf:rait-export:create`
 * (`AUDITOR`). Isso contradiz a premissa "a matriz não contém nenhuma chave
 * `inf:<recurso>:*` destes recursos" para a ação `create` desses dois
 * recursos; os testes abaixo provam o estado real (com a exceção nomeada)
 * em vez de falhar às ciências, e o achado vai para
 * `docs/meta/knowledge-base/open-decisions-rait.md` (relatório desta tarefa).
 */
describe('CTG-0002 — recursos sem matriz até R-0007 (M17)', () => {
  const GENERATED_ACTIONS = ['read', 'create', 'update', 'delete'] as const;
  const GLOBAL_ADMIN_ROLES = [
    'ADMIN',
    'GESTOR_DETRAN',
    'SUPORTE',
    'technical-admin',
  ] as const;
  /**
   * Achado (ver comentário do describe): `RAIT_COMMAND_RULES` grava estas
   * duas chaves de ação gerada, de rodada anterior. Único par (recurso,
   * ação gerada) com uma exceção; todos os outros recursos e ações negam
   * para todo papel além de `GLOBAL_ADMIN_ROLES`.
   */
  const PRE_EXISTING_COMMAND_GRANTS: Readonly<
    Record<string, Readonly<Record<string, readonly string[]>>>
  > = {
    'rait-suspension-act': {
      create: ['rait-signing-authority', 'rait-chair'],
    },
    'rait-export': { create: ['AUDITOR'] },
  };

  /**
   * Só confere as 4 chaves de ação **gerada** (`read`/`create`/`update`/
   * `delete`) do recurso — nunca todas as chaves `inf:<recurso>:*`, porque
   * várias destas 23 já têm ações de comando pré-existentes fora deste
   * conjunto (ver comentário do describe); essas ficam fora do escopo desta
   * negativa, não são o gap que M17(c) endereça.
   */
  function expectResourceHasNoGeneratedMatrixEntry(resource: string): void {
    const grantedActions = Object.keys(
      PRE_EXISTING_COMMAND_GRANTS[resource] ?? {},
    );
    const presentGeneratedKeys = GENERATED_ACTIONS.filter(
      (action) => `inf:${resource}:${action}` in DETRAN_POLICY_MATRIX,
    ).map((action) => `inf:${resource}:${action}`);
    expect(presentGeneratedKeys.sort()).toEqual(
      grantedActions.map((action) => `inf:${resource}:${action}`).sort(),
    );
  }

  function expectDeniedForEveryRole(resource: string): void {
    for (const action of GENERATED_ACTIONS) {
      const exceptionRoles =
        PRE_EXISTING_COMMAND_GRANTS[resource]?.[action] ?? [];
      for (const role of DETRAN_ROLES) {
        const expected =
          (GLOBAL_ADMIN_ROLES as readonly string[]).includes(role) ||
          exceptionRoles.includes(role);
        expect(
          isDetranActionAllowed(
            { roles: [role], permissions: [] },
            `inf:${resource}`,
            action,
          ),
          `inf:${resource}:${action} para o papel ${role} deveria ser ${expected}`,
        ).toBe(expected);
      }
    }
  }

  const NEW_RESOURCES = [
    'rait-unit',
    'rait-schedule',
    'rait-schedule-slot',
    'rait-batch',
    'rait-batch-item',
    'rait-substitute-duty',
    'rait-bench',
    'rait-pending-content',
    'rait-redirect',
    'rait-draft',
    'rait-holiday',
    'rait-suspension-act',
    'rait-jeton-sheet',
    'rait-jeton-line',
    'rait-incident',
    'rait-quality-sample',
    'rait-capacity-plan',
    'rait-export',
    'collection-document',
    'payment',
    'refund-order',
    'debt-handoff',
    'rait-reconciliation',
  ];

  it(`cataloga exatamente os 23 recursos novos de CTG-0002 sem matriz (M17)`, () => {
    expect(NEW_RESOURCES).toHaveLength(23);
    expect(new Set(NEW_RESOURCES).size).toBe(23);
  });

  for (const resource of NEW_RESOURCES) {
    it(`dado o recurso novo inf:${resource} sem matriz quando isDetranActionAllowed é chamado para read/create/update/delete então nega para todo papel canônico de roles.ts, exceto GLOBAL_ADMIN_ROLES e a exceção nomeada da matriz de comando (M17)`, () => {
      expectDeniedForEveryRole(resource);
      expectResourceHasNoGeneratedMatrixEntry(resource);
    });
  }
});
