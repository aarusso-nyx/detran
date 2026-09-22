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
  type DetranPolicyKey,
} from './policy.js';
import { withTenantContext } from './tenant-context.js';

describe('DETRAN unified policy kit', () => {
  it('dado cada regra CTG-0001 quando consultada por todos os papéis então concede somente os papéis canônicos permitidos', () => {
    const rules: Array<[string, string[]]> = [
      ['est:crash-record:create', ['field-agent']],
      ...[
        'crash-record',
        'crash-vehicle',
        'crash-person',
        'crash-sketch',
        'crash-scene-duty',
        'crash-damage',
        'crash-witness',
        'crash-link',
      ].map(
        (resource) =>
          [
            `est:${resource}:read`,
            [
              'field-agent',
              'field-supervisor',
              'processing-operator',
              'traffic-authority',
            ],
          ] as [string, string[]],
      ),
      ['est:crash-subject-request:read', ['processing-operator', 'AUDITOR']],
      ...[
        'crash-record',
        'crash-vehicle',
        'crash-person',
        'crash-victim',
        'crash-sketch',
        'crash-scene-duty',
        'crash-damage',
        'crash-witness',
        'crash-link',
        'crash-renaest-submission',
        'crash-subject-request',
      ].flatMap((resource) => [
        [`est:${resource}:update`, []] as [string, string[]],
        ...(resource === 'crash-record'
          ? []
          : [[`est:${resource}:create`, []] as [string, string[]]]),
      ]),
      ['est:crash-record:start', ['field-agent']],
      [
        'est:crash-record:report',
        ['field-agent', 'processing-operator', 'traffic-authority'],
      ],
      ['est:crash-record:add-vehicle', ['field-agent']],
      ['est:crash-record:add-person', ['field-agent']],
      ['est:crash-record:add-victim', ['field-agent']],
      ['est:crash-record:record-duty', ['field-agent']],
      ['est:crash-record:add-damage', ['field-agent']],
      ['est:crash-record:add-witness', ['field-agent']],
      [
        'est:crash-record:attach-sketch',
        ['field-agent', 'processing-operator'],
      ],
      ['est:crash-record:link', ['field-agent', 'processing-operator']],
      ['est:crash-record:record', ['field-agent']],
      ['est:crash-record:complement', ['processing-operator']],
      [
        'est:crash-record:validate',
        ['processing-operator', 'traffic-authority'],
      ],
      ['est:crash-record:close', ['field-supervisor', 'traffic-authority']],
      ['est:crash-record:cancel', ['field-agent', 'traffic-authority']],
      [
        'est:crash-record:transmit',
        ['processing-operator', 'traffic-authority'],
      ],
      [
        'est:crash-record:rectify',
        ['processing-operator', 'traffic-authority'],
      ],
      ['est:crash-record:archive', ['traffic-authority']],
      [
        'est:crash-victim:read',
        [
          'field-agent',
          'field-supervisor',
          'processing-operator',
          'traffic-authority',
          'AUDITOR',
        ],
      ],
      [
        'est:crash-renaest-submission:read',
        [
          'processing-operator',
          'traffic-authority',
          'integration-operator',
          'AUDITOR',
        ],
      ],
      [
        'est:crash-subject-request:subject-request',
        ['processing-operator', 'AUDITOR', 'CIDADAO'],
      ],
      ...[
        'crash-record',
        'crash-vehicle',
        'crash-person',
        'crash-victim',
        'crash-sketch',
        'crash-scene-duty',
        'crash-damage',
        'crash-witness',
        'crash-link',
        'crash-renaest-submission',
        'crash-subject-request',
      ].map(
        (resource) =>
          [`est:${resource}:delete`, ['technical-admin']] as [string, string[]],
      ),
    ];
    const globallyAllowed = new Set([
      'ADMIN',
      'GESTOR_DETRAN',
      'SUPORTE',
      'technical-admin',
    ]);
    const failures: string[] = [];
    for (const [resource, permitted] of rules) {
      const expected = new Set([...permitted, ...globallyAllowed]);
      for (const role of DETRAN_ROLES) {
        const actual = isDetranActionAllowed(
          { roles: [role], permissions: [] },
          resource.split(/:(?=[^:]+$)/)[0],
          resource.split(':').at(-1)!,
        );
        if (actual !== expected.has(role))
          failures.push(
            `${resource} para ${role}: esperado ${expected.has(role)}`,
          );
      }
    }
    expect(failures).toEqual([]);
  });

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
    // R-0009 CTG-0002 §10 (M19, ADR-0019): `portal:appeal:create` deu lugar a
    // `portal:request:create` — única asserção pré-existente alterada por TASK-0006.
    expect(
      isDetranActionAllowed(
        { roles: ['CIDADAO'], permissions: [] },
        'portal:request',
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

describe('R-0013 CTG-0003 — política estrita de provisionamento offline', () => {
  for (const resource of [
    'grant-reservation-binding',
    'provisioning-reconciliation',
  ]) {
    it.each(['read', 'create', 'update', 'delete'])(
      `dado CRUD gerado ops:${resource} quando %s é solicitado então nenhuma identidade ou permissão concede acesso`,
      (action) => {
        const key = `ops:${resource}:${action}` as DetranPolicyKey;
        expect(Object.hasOwn(DETRAN_POLICY_MATRIX, key)).toBe(true);
        expect(DETRAN_POLICY_MATRIX[key]).toEqual([]);
        for (const role of [...DETRAN_ROLES, '']) {
          for (const permissions of [[], ['*'], ['ops:*'], [key]]) {
            expect(
              isDetranActionAllowed(
                { roles: role ? [role] : [], permissions },
                `ops:${resource}`,
                action,
              ),
              `${key} role=${role} permissions=${permissions.join(',')}`,
            ).toBe(false);
          }
          expect(permissionsForRoles(role ? [role] : [])).not.toContain(key);
        }
      },
    );
  }
  const globalOrOmittedRoles = DETRAN_ROLES.filter(
    (role) =>
      !['technical-admin', 'agency-admin', 'field-supervisor'].includes(role),
  );
  const staticRules = [
    {
      action: 'create-key-challenge',
      allowed: ['technical-admin', 'agency-admin'],
    },
    {
      action: 'issue-provisioning-package',
      allowed: ['agency-admin', 'field-supervisor'],
    },
    { action: 'readiness', allowed: ['agency-admin', 'technical-admin'] },
    {
      action: 'revoke-offline-grant',
      allowed: ['agency-admin', 'technical-admin'],
    },
  ] as const;
  const identityOnlyActions = [
    'register-device-key',
    'download-provisioning-package',
    'record-provisioning-receipt',
    'reconcile-offline-grant',
  ] as const;

  it('dado cada comando estático quando cada papel canônico é avaliado então concede somente a matriz A5 sem bypass global ou wildcard', () => {
    for (const rule of staticRules) {
      const key = `ops:provisioning:${rule.action}` as DetranPolicyKey;
      expect(DETRAN_POLICY_MATRIX[key]).toEqual(rule.allowed);
      for (const role of DETRAN_ROLES) {
        expect(
          isDetranActionAllowed(
            { roles: [role], permissions: [] },
            'ops:provisioning',
            rule.action,
          ),
          `${key} para ${role}`,
        ).toBe((rule.allowed as readonly string[]).includes(role));
        expect(
          isDetranActionAllowed(
            { roles: [role], permissions: ['*'] },
            'ops:provisioning',
            rule.action,
          ),
          `${key} não recebe bypass wildcard para ${role}`,
        ).toBe((rule.allowed as readonly string[]).includes(role));
      }
    }
  });

  it('dado cada operação dependente de vínculo quando papel ou wildcard isolado é apresentado então a política recusa antes da validação dinâmica', () => {
    for (const action of identityOnlyActions) {
      const key = `ops:provisioning:${action}` as DetranPolicyKey;
      expect(DETRAN_POLICY_MATRIX[key]).toEqual([]);
      for (const role of DETRAN_ROLES) {
        expect(
          isDetranActionAllowed(
            { roles: [role], permissions: [] },
            'ops:provisioning',
            action,
          ),
          `${key} sem vínculo para ${role}`,
        ).toBe(false);
        expect(
          isDetranActionAllowed(
            { roles: [role], permissions: ['*'] },
            'ops:provisioning',
            action,
          ),
          `${key} wildcard isolado para ${role}`,
        ).toBe(false);
      }
    }
  });

  it('dado papéis globais e omitidos quando o conjunto é enumerado então ADMIN, GESTOR_DETRAN e SUPORTE permanecem explicitamente fora da matriz A5', () => {
    expect(globalOrOmittedRoles).toContain('ADMIN');
    expect(globalOrOmittedRoles).toContain('GESTOR_DETRAN');
    expect(globalOrOmittedRoles).toContain('SUPORTE');
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
 * recursos; os testes abaixo provam o estado real (exceções nomeadas —
 * OD-309), em vez de falhar às ciências. Achado registrado como OD-309
 * (`docs/meta/knowledge-base/open-decisions-rait.md`): confirmar em R-0007
 * se os grants de `RAIT_COMMAND_RULES` para estes dois recursos são
 * intencionais ou devem ser retirados/ajustados quando a matriz completa
 * dos 23 recursos entrar.
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
   * Achado (ver comentário do describe) — exceções nomeadas, OD-309:
   * `RAIT_COMMAND_RULES` grava estas chaves de ação gerada. Todos os
   * outros recursos e ações negam para todo papel além de
   * `GLOBAL_ADMIN_ROLES`.
   */
  const PRE_EXISTING_COMMAND_GRANTS: Readonly<
    Record<string, Readonly<Record<string, readonly string[]>>>
  > = {
    'rait-suspension-act': {
      create: ['rait-signing-authority', 'rait-chair'],
    },
    'rait-export': { create: ['AUDITOR'] },
  };

  const STRICT_COMMAND_GRANTS: Readonly<
    Record<string, Readonly<Record<string, readonly string[]>>>
  > = {
    'rait-schedule': { create: ['rait-coordinator'] },
    'rait-batch': { create: ['rait-secretary'] },
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
      const strictRoles = STRICT_COMMAND_GRANTS[resource]?.[action];
      const exceptionRoles =
        PRE_EXISTING_COMMAND_GRANTS[resource]?.[action] ?? [];
      for (const role of DETRAN_ROLES) {
        const expected = strictRoles
          ? strictRoles.includes(role)
          : (GLOBAL_ADMIN_ROLES as readonly string[]).includes(role) ||
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
    it(`dado o recurso novo inf:${resource} sem matriz quando isDetranActionAllowed é chamado para read/create/update/delete então nega para todo papel canônico de roles.ts, exceto GLOBAL_ADMIN_ROLES e a exceção nomeada da matriz de comando — OD-309 (M17)`, () => {
      expectDeniedForEveryRole(resource);
      expectResourceHasNoGeneratedMatrixEntry(resource);
    });
  }
});

/**
 * CTG-0001 (R-0008, TASK-0002) — AIT completo: `inf:ait:archive`,
 * `inf:ait:review-concurrency`, `inf:ait-cancel-request:{create,review,decide}`
 * (§5 do contrato) e `canDecideAitCancelRequest` (M3, §5). `canDecideAitCancelRequest`
 * ainda não é exportado por `policy.ts` (TASK-0003, Engineer) — é acessado via
 * `import * as policyModule` para que a ausência do nome falhe só dentro do
 * teste que o usa (assertion "expected undefined"), nunca no carregamento do
 * arquivo inteiro, preservando os testes já verdes acima.
 */
describe('CTG-0001 §5 — AIT completo: archive, review-concurrency, ait-cancel-request, canDecideAitCancelRequest (TASK-0002)', () => {
  const allowed = (roles: string[], resource: string, action: string) =>
    isDetranActionAllowed({ roles, permissions: [] }, resource, action);

  /** Os oito papéis canônicos da família TEAT (plan.md §0, roles.ts). */
  const TEAT_CANONICAL_ROLES = [
    'field-agent',
    'field-supervisor',
    'processing-operator',
    'traffic-authority',
    'agency-admin',
    'technical-admin',
    'AUDITOR',
    'integration-operator',
  ] as const;

  function expectGrantedOnlyTo(
    resource: string,
    action: string,
    grantedRoles: readonly string[],
  ): void {
    for (const role of TEAT_CANONICAL_ROLES) {
      if (role === 'technical-admin') {
        // technical-admin está em GLOBAL_ADMIN_ROLES: '*' o libera para toda
        // chave, sem entrar na lista estática de papéis concedidos.
        expect(
          allowed([role], resource, action),
          `technical-admin deveria passar por GLOBAL_ADMIN_ROLES ('*') em ${resource}:${action}`,
        ).toBe(true);
        continue;
      }
      const expected = (grantedRoles as readonly string[]).includes(role);
      expect(
        allowed([role], resource, action),
        `${resource}:${action} para o papel ${role} deveria ser ${expected}`,
      ).toBe(expected);
    }
  }

  it('C-0001-05 — dado inf:ait:archive quando consultado então só traffic-authority; negado para os outros seis papéis TEAT; technical-admin passa por "*"', () => {
    expectGrantedOnlyTo('inf:ait', 'archive', ['traffic-authority']);
  });

  it('C-0001-06 — dado inf:ait:review-concurrency quando consultado então permitido para traffic-authority e AUDITOR, negado para os demais', () => {
    expectGrantedOnlyTo('inf:ait', 'review-concurrency', [
      'traffic-authority',
      'AUDITOR',
    ]);
  });

  it('C-0001-07 — dado inf:ait-cancel-request:{create,review,decide} então os três pares existem com os papéis do contrato §5', () => {
    expectGrantedOnlyTo('inf:ait-cancel-request', 'create', [
      'field-agent',
      'field-supervisor',
      'traffic-authority',
    ]);
    expectGrantedOnlyTo('inf:ait-cancel-request', 'review', [
      'traffic-authority',
    ]);
    expectGrantedOnlyTo('inf:ait-cancel-request', 'decide', [
      'traffic-authority',
    ]);
  });

  it('C-0001-07 — dado a superfície CRUD gerada então inf:ait-cancel-request:{read,create} e inf:ait-cancel-request-event:{read,create,update,delete} existem na matriz; inf:ait-cancel-request:{update,delete} não existem (OD-T60: AitCancelRequestController gerado só expõe list|get desde CTG-0001 §12)', () => {
    for (const action of ['read', 'create']) {
      expect(
        `inf:ait-cancel-request:${action}` in DETRAN_POLICY_MATRIX,
        `inf:ait-cancel-request:${action} deveria existir na matriz (superfície CRUD gerada, §5)`,
      ).toBe(true);
    }
    for (const action of ['update', 'delete']) {
      expect(
        `inf:ait-cancel-request:${action}` in DETRAN_POLICY_MATRIX,
        `inf:ait-cancel-request:${action} deveria ter sido removida (OD-T60: sem rota, CRUD gerado é list|get)`,
      ).toBe(false);
    }
    for (const action of ['read', 'create', 'update', 'delete']) {
      expect(
        `inf:ait-cancel-request-event:${action}` in DETRAN_POLICY_MATRIX,
        `inf:ait-cancel-request-event:${action} deveria existir na matriz (superfície CRUD gerada, §5)`,
      ).toBe(true);
    }
  });

  it('OD-T60 — dado qualquer papel canônico então nenhum recebe inf:ait-cancel-request:{update,delete} como chave explícita, nem por permissionsForRoles (negativo universal; technical-admin passa só por GLOBAL_ADMIN_ROLES/"*")', () => {
    for (const role of TEAT_CANONICAL_ROLES) {
      for (const action of ['update', 'delete'] as const) {
        if (role !== 'technical-admin') {
          expect(
            allowed([role], 'inf:ait-cancel-request', action),
            `inf:ait-cancel-request:${action} não deveria ser concedido a ${role}`,
          ).toBe(false);
        }
        expect(
          permissionsForRoles([role]).includes(
            `inf:ait-cancel-request:${action}`,
          ),
          `permissionsForRoles(${role}) nunca deveria conter a chave explícita inf:ait-cancel-request:${action}`,
        ).toBe(false);
      }
    }
  });

  it('§5 — dado a superfície CRUD gerada então inf:normative-metrological-table e inf:signature-policy existem, restritos a INF_ADMIN_ROLES (agency-admin, technical-admin)', () => {
    for (const resource of [
      'normative-metrological-table',
      'signature-policy',
    ]) {
      expect(allowed(['agency-admin'], `inf:${resource}`, 'read')).toBe(true);
      expect(allowed(['agency-admin'], `inf:${resource}`, 'create')).toBe(true);
      expect(allowed(['field-agent'], `inf:${resource}`, 'create')).toBe(false);
    }
  });

  it('M18 — dado ops:offline-numbering-reservation:{reserve,cancel} (alias duplicado da origem) então as chaves foram removidas da matriz (route contract: rota única numbering-reservation)', () => {
    expect(
      'ops:offline-numbering-reservation:reserve' in DETRAN_POLICY_MATRIX,
    ).toBe(false);
    expect(
      'ops:offline-numbering-reservation:cancel' in DETRAN_POLICY_MATRIX,
    ).toBe(false);
    // A rota única sobrevivente continua concedida (não é tocada por esta remoção).
    expect(
      allowed(['field-agent'], 'ops:numbering-reservation', 'reserve'),
    ).toBe(true);
  });

  describe('canDecideAitCancelRequest (C-0001-08, M3/H.39/OD-T01)', () => {
    it('dado traffic-authority sem claims.decision_body quando addressedTo="diretoria-fiscalizacao" então false', async () => {
      const policyModule = (await import('./policy.js')) as unknown as {
        canDecideAitCancelRequest?: (
          principal: {
            roles: string[];
            permissions: string[];
            claims?: Record<string, unknown>;
          },
          addressedTo: 'traffic-authority' | 'diretoria-fiscalizacao',
        ) => boolean;
      };
      const principal = {
        roles: ['traffic-authority'],
        permissions: [],
        claims: {},
      };
      expect(
        policyModule.canDecideAitCancelRequest?.(
          principal,
          'diretoria-fiscalizacao',
        ),
      ).toBe(false);
    });

    it('dado traffic-authority com claims.decision_body="diretoria-fiscalizacao" quando addressedTo="diretoria-fiscalizacao" então true', async () => {
      const policyModule = (await import('./policy.js')) as unknown as {
        canDecideAitCancelRequest?: (
          principal: {
            roles: string[];
            permissions: string[];
            claims?: Record<string, unknown>;
          },
          addressedTo: 'traffic-authority' | 'diretoria-fiscalizacao',
        ) => boolean;
      };
      const principal = {
        roles: ['traffic-authority'],
        permissions: [],
        claims: { decision_body: 'diretoria-fiscalizacao' },
      };
      expect(
        policyModule.canDecideAitCancelRequest?.(
          principal,
          'diretoria-fiscalizacao',
        ),
      ).toBe(true);
    });

    it('dado traffic-authority sem claim quando addressedTo="traffic-authority" então true (não exige o claim)', async () => {
      const policyModule = (await import('./policy.js')) as unknown as {
        canDecideAitCancelRequest?: (
          principal: {
            roles: string[];
            permissions: string[];
            claims?: Record<string, unknown>;
          },
          addressedTo: 'traffic-authority' | 'diretoria-fiscalizacao',
        ) => boolean;
      };
      const principal = {
        roles: ['traffic-authority'],
        permissions: [],
        claims: {},
      };
      expect(
        policyModule.canDecideAitCancelRequest?.(
          principal,
          'traffic-authority',
        ),
      ).toBe(true);
    });

    it('dado technical-admin sem o claim quando addressedTo="diretoria-fiscalizacao" então false (a competência é atributo, não papel; não passa por isDetranActionAllowed "*")', async () => {
      const policyModule = (await import('./policy.js')) as unknown as {
        canDecideAitCancelRequest?: (
          principal: {
            roles: string[];
            permissions: string[];
            claims?: Record<string, unknown>;
          },
          addressedTo: 'traffic-authority' | 'diretoria-fiscalizacao',
        ) => boolean;
      };
      const principal = {
        roles: ['technical-admin'],
        permissions: ['*'],
        claims: {},
      };
      expect(
        policyModule.canDecideAitCancelRequest?.(
          principal,
          'diretoria-fiscalizacao',
        ),
      ).toBe(false);
    });
  });
});

/**
 * CTG-0002 §8 (R-0008, TASK-0004) — campo, numeração e sincronização: as
 * chaves novas de `TEAT_RULES` e de `OPS_SURFACE_RULES` que TASK-0005 escreve,
 * e a ausência definitiva do alias `ops:offline-numbering-reservation:*` (M18).
 *
 * Toda linha abaixo é transcrição literal da §8 do contrato; nenhum papel é
 * inferido. Os pares que ainda não existem falham hoje por comportamento
 * ausente (Engineer, TASK-0005), nunca por erro de escrita.
 */
describe('R-0008 CTG-0002 §8 — política de campo, numeração e sincronização (TASK-0004)', () => {
  const allowed = (roles: string[], resource: string, action: string) =>
    isDetranActionAllowed({ roles, permissions: [] }, resource, action);

  /** Os oito papéis canônicos da família TEAT (CTG-0001 §0, roles.ts). */
  const TEAT_CANONICAL_ROLES = [
    'field-agent',
    'field-supervisor',
    'processing-operator',
    'traffic-authority',
    'agency-admin',
    'technical-admin',
    'AUDITOR',
    'integration-operator',
  ] as const;

  function expectGrantedOnlyTo(
    resource: string,
    action: string,
    grantedRoles: readonly string[],
  ): void {
    for (const role of TEAT_CANONICAL_ROLES) {
      if (role === 'technical-admin') {
        // technical-admin está em GLOBAL_ADMIN_ROLES: '*' o libera para toda
        // chave, sem entrar na lista estática de papéis concedidos.
        expect(
          allowed([role], resource, action),
          `technical-admin deveria passar por GLOBAL_ADMIN_ROLES ('*') em ${resource}:${action}`,
        ).toBe(true);
        continue;
      }
      const expected = (grantedRoles as readonly string[]).includes(role);
      expect(
        allowed([role], resource, action),
        `${resource}:${action} para o papel ${role} deveria ser ${expected}`,
      ).toBe(expected);
    }
  }

  describe('§8 — chaves novas de TEAT_RULES (rotas manuscritas)', () => {
    it('ops:operational-device:close-shift — field-agent e field-supervisor (origem teat-policy.ts)', () => {
      expectGrantedOnlyTo('ops:operational-device', 'close-shift', [
        'field-agent',
        'field-supervisor',
      ]);
    });

    it('ops:operational-device:handoff-session — field-agent e field-supervisor (OD-T15: chave nova, por analogia com close-shift)', () => {
      expectGrantedOnlyTo('ops:operational-device', 'handoff-session', [
        'field-agent',
        'field-supervisor',
      ]);
    });

    it('ops:operational-device:{block,unblock,wipe} — só technical-admin (route contract §4.2)', () => {
      for (const action of ['block', 'unblock', 'wipe']) {
        expectGrantedOnlyTo('ops:operational-device', action, [
          'technical-admin',
        ]);
      }
    });

    it('ops:homologation:{renew,cancel-by-audit} — agency-admin e technical-admin (origem)', () => {
      for (const action of ['renew', 'cancel-by-audit']) {
        expectGrantedOnlyTo('ops:homologation', action, [
          'agency-admin',
          'technical-admin',
        ]);
      }
    });
  });

  describe('§8 — chaves de comando já existentes, preservadas', () => {
    it('ops:numbering-reservation:reserve — só field-agent (OD-T23: prevalece a fonte mais restrita)', () => {
      expectGrantedOnlyTo('ops:numbering-reservation', 'reserve', [
        'field-agent',
      ]);
    });

    it('ops:numbering-reservation:cancel — field-agent e field-supervisor', () => {
      expectGrantedOnlyTo('ops:numbering-reservation', 'cancel', [
        'field-agent',
        'field-supervisor',
      ]);
    });

    it('ops:sync-batch:submit — só field-agent', () => {
      expectGrantedOnlyTo('ops:sync-batch', 'submit', ['field-agent']);
    });

    it('ops:sync-conflict:resolve — field-supervisor e processing-operator', () => {
      expectGrantedOnlyTo('ops:sync-conflict', 'resolve', [
        'field-supervisor',
        'processing-operator',
      ]);
    });
  });

  describe('§8 — chaves novas de OPS_SURFACE_RULES (superfícies CRUD do route contract §4.3)', () => {
    const surfaces: Array<[string, string, readonly string[]]> = [
      ['numbering-range', 'read', ['agency-admin', 'technical-admin']],
      ['numbering-range', 'create', ['agency-admin', 'technical-admin']],
      ['numbering-range', 'update', ['agency-admin', 'technical-admin']],
      [
        'numbering-reservation',
        'read',
        ['field-agent', 'field-supervisor', 'processing-operator'],
      ],
      [
        'numbering-consumption',
        'read',
        ['field-agent', 'field-supervisor', 'processing-operator'],
      ],
      [
        'sync-batch',
        'read',
        ['field-supervisor', 'processing-operator', 'technical-admin'],
      ],
      [
        'sync-receipt',
        'read',
        ['field-agent', 'field-supervisor', 'processing-operator'],
      ],
      [
        'sync-queue-item',
        'read',
        ['field-supervisor', 'processing-operator', 'technical-admin'],
      ],
      [
        'sync-conflict',
        'read',
        ['field-supervisor', 'processing-operator', 'technical-admin'],
      ],
      [
        'session-handoff',
        'read',
        ['field-supervisor', 'processing-operator', 'traffic-authority'],
      ],
      [
        'device-event',
        'read',
        ['field-supervisor', 'processing-operator', 'technical-admin'],
      ],
      [
        'operation',
        'read',
        [
          'field-agent',
          'field-supervisor',
          'processing-operator',
          'traffic-authority',
        ],
      ],
      ['operation', 'create', ['field-supervisor', 'agency-admin']],
      [
        'team-agent',
        'read',
        [
          'field-agent',
          'field-supervisor',
          'processing-operator',
          'traffic-authority',
        ],
      ],
      ['team-agent', 'create', ['field-supervisor', 'agency-admin']],
      [
        'patrol-vehicle',
        'read',
        [
          'field-agent',
          'field-supervisor',
          'processing-operator',
          'traffic-authority',
        ],
      ],
      ['patrol-vehicle', 'create', ['agency-admin']],
      [
        'measurement-instrument',
        'read',
        [
          'field-agent',
          'field-supervisor',
          'processing-operator',
          'traffic-authority',
        ],
      ],
      ['measurement-instrument', 'create', ['agency-admin']],
      [
        'approach',
        'read',
        [
          'field-agent',
          'field-supervisor',
          'processing-operator',
          'traffic-authority',
        ],
      ],
      ['approach', 'create', ['field-agent']],
    ];

    for (const [resource, action, roles] of surfaces) {
      it(`ops:${resource}:${action} — ${roles.join(', ')}`, () => {
        expectGrantedOnlyTo(`ops:${resource}`, action, roles);
      });
    }

    const agencySurfaces = [
      'agency-unit',
      'agency-jurisdiction',
      'agency-competence',
    ];

    it('ops:{agency-unit,agency-jurisdiction,agency-competence}:read — os quatro papéis de campo mais agency-admin', () => {
      for (const resource of agencySurfaces) {
        expectGrantedOnlyTo(`ops:${resource}`, 'read', [
          'field-agent',
          'field-supervisor',
          'processing-operator',
          'traffic-authority',
          'agency-admin',
        ]);
      }
    });

    it('ops:{agency-unit,agency-jurisdiction,agency-competence}:create — só agency-admin', () => {
      for (const resource of agencySurfaces) {
        expectGrantedOnlyTo(`ops:${resource}`, 'create', ['agency-admin']);
      }
    });
  });

  describe('§8 — remoção do alias duplicado da origem (M18)', () => {
    it('dado ops:offline-numbering-reservation:{reserve,cancel} então as duas chaves não existem na matriz (a rota única é numbering-reservation)', () => {
      for (const action of ['reserve', 'cancel']) {
        expect(
          `ops:offline-numbering-reservation:${action}` in DETRAN_POLICY_MATRIX,
          `ops:offline-numbering-reservation:${action} deveria ter sido removida em M18`,
        ).toBe(false);
      }
    });

    it('dado qualquer papel canônico então nenhum recebe ops:offline-numbering-reservation:reserve, nem por permissionsForRoles', () => {
      for (const role of TEAT_CANONICAL_ROLES) {
        expect(
          permissionsForRoles([role]).includes(
            'ops:offline-numbering-reservation:reserve',
          ),
        ).toBe(false);
      }
    });
  });
});

/**
 * CTG-0003 §7 (R-0008, TASK-0006) — evidência, custódia, bodycam, snapshots e
 * catálogo/pacote normativo: as chaves novas de `TEAT_RULES` e de
 * `OPS_SURFACE_RULES` que TASK-0007 escreve, e a remoção definitiva do par
 * `snapshot-person`/`snapshot-vehicle` (os controladores gerados declaram
 * `ops:person`/`ops:vehicle`, nunca `ops:snapshot-*`).
 *
 * Toda linha abaixo é transcrição literal da §7 do contrato; nenhum papel é
 * inferido. Os pares que ainda não existem falham hoje por comportamento
 * ausente (Engineer, TASK-0007), nunca por erro de escrita.
 */
describe('R-0008 CTG-0003 §7 — política de evidência, snapshots e normativo (TASK-0006)', () => {
  const allowed = (roles: string[], resource: string, action: string) =>
    isDetranActionAllowed({ roles, permissions: [] }, resource, action);

  /** Os oito papéis canônicos da família TEAT (CTG-0001 §0, roles.ts). */
  const TEAT_CANONICAL_ROLES = [
    'field-agent',
    'field-supervisor',
    'processing-operator',
    'traffic-authority',
    'agency-admin',
    'technical-admin',
    'AUDITOR',
    'integration-operator',
  ] as const;

  function expectGrantedOnlyTo(
    resource: string,
    action: string,
    grantedRoles: readonly string[],
  ): void {
    for (const role of TEAT_CANONICAL_ROLES) {
      if (role === 'technical-admin') {
        // technical-admin está em GLOBAL_ADMIN_ROLES: '*' o libera para toda
        // chave, sem entrar na lista estática de papéis concedidos.
        expect(
          allowed([role], resource, action),
          `technical-admin deveria passar por GLOBAL_ADMIN_ROLES ('*') em ${resource}:${action}`,
        ).toBe(true);
        continue;
      }
      const expected = (grantedRoles as readonly string[]).includes(role);
      expect(
        allowed([role], resource, action),
        `${resource}:${action} para o papel ${role} deveria ser ${expected}`,
      ).toBe(expected);
    }
  }

  describe('§7 — chaves novas de TEAT_RULES (comandos de evidência e acesso a bodycam)', () => {
    it('ops:evidence:complete-upload — field-agent e processing-operator (origem)', () => {
      expectGrantedOnlyTo('ops:evidence', 'complete-upload', [
        'field-agent',
        'processing-operator',
      ]);
    });

    it('ops:evidence:validate — processing-operator, AUDITOR e technical-admin (origem "evidence:validate", auditor canonizado em AUDITOR)', () => {
      expectGrantedOnlyTo('ops:evidence', 'validate', [
        'processing-operator',
        'AUDITOR',
        'technical-admin',
      ]);
    });

    it('ops:evidence:purge-unverified — só technical-admin (chave nova)', () => {
      expectGrantedOnlyTo('ops:evidence', 'purge-unverified', [
        'technical-admin',
      ]);
    });

    it('ops:evidence-access-request:create — processing-operator e traffic-authority (origem)', () => {
      expectGrantedOnlyTo('ops:evidence-access-request', 'create', [
        'processing-operator',
        'traffic-authority',
      ]);
    });

    it('ops:evidence-access-request:update — processing-operator e traffic-authority (origem, sem rota nesta rodada — §4.11 nota final)', () => {
      expectGrantedOnlyTo('ops:evidence-access-request', 'update', [
        'processing-operator',
        'traffic-authority',
      ]);
    });

    it('ops:evidence-access-request:approve — só traffic-authority (origem)', () => {
      expectGrantedOnlyTo('ops:evidence-access-request', 'approve', [
        'traffic-authority',
      ]);
    });

    it('ops:evidence-access-request:deny — só traffic-authority (origem)', () => {
      expectGrantedOnlyTo('ops:evidence-access-request', 'deny', [
        'traffic-authority',
      ]);
    });

    it('ops:evidence-access-request:deliver — processing-operator e traffic-authority (origem)', () => {
      expectGrantedOnlyTo('ops:evidence-access-request', 'deliver', [
        'processing-operator',
        'traffic-authority',
      ]);
    });
  });

  describe('§7 — chaves de comando já existentes, preservadas (CTG-0001/CTG-0002)', () => {
    it('ops:evidence:initiate-upload — field-agent e processing-operator', () => {
      expectGrantedOnlyTo('ops:evidence', 'initiate-upload', [
        'field-agent',
        'processing-operator',
      ]);
    });

    it('ops:evidence:link — field-agent e processing-operator', () => {
      expectGrantedOnlyTo('ops:evidence', 'link', [
        'field-agent',
        'processing-operator',
      ]);
    });

    it('ops:evidence:add-custody-event — field-agent, processing-operator, AUDITOR e technical-admin', () => {
      expectGrantedOnlyTo('ops:evidence', 'add-custody-event', [
        'field-agent',
        'processing-operator',
        'AUDITOR',
        'technical-admin',
      ]);
    });

    it('ops:probative-package:generate — processing-operator, AUDITOR e technical-admin', () => {
      expectGrantedOnlyTo('ops:probative-package', 'generate', [
        'processing-operator',
        'AUDITOR',
        'technical-admin',
      ]);
    });

    it('ops:external-query:create — field-agent, field-supervisor, processing-operator e traffic-authority (§5.1, mesma chave da superfície CRUD reaproveitada pelo comando)', () => {
      expectGrantedOnlyTo('ops:external-query', 'create', [
        'field-agent',
        'field-supervisor',
        'processing-operator',
        'traffic-authority',
      ]);
    });

    it('inf:normative-catalog:{publish,retire} — agency-admin e technical-admin', () => {
      for (const action of ['publish', 'retire']) {
        expectGrantedOnlyTo('inf:normative-catalog', action, [
          'agency-admin',
          'technical-admin',
        ]);
      }
    });

    it('inf:mobile-normative-package:{publish,retire} — agency-admin e technical-admin', () => {
      for (const action of ['publish', 'retire']) {
        expectGrantedOnlyTo('inf:mobile-normative-package', action, [
          'agency-admin',
          'technical-admin',
        ]);
      }
    });

    it('inf:mobile-normative-package:validate — field-agent, field-supervisor, agency-admin e technical-admin (§6.4 — field-agent lê conteúdo, não publica)', () => {
      expectGrantedOnlyTo('inf:mobile-normative-package', 'validate', [
        'field-agent',
        'field-supervisor',
        'agency-admin',
        'technical-admin',
      ]);
    });
  });

  describe('§7 — chaves novas de OPS_SURFACE_RULES (superfícies CRUD do route contract §4.4/§4.5)', () => {
    const surfaces: Array<[string, string, readonly string[]]> = [
      [
        'external-query',
        'read',
        [
          'field-agent',
          'field-supervisor',
          'processing-operator',
          'traffic-authority',
          'AUDITOR',
        ],
      ],
      ['evidence', 'create', ['field-agent', 'processing-operator']],
      ['evidence', 'update', ['processing-operator', 'technical-admin']],
      [
        'evidence-link',
        'read',
        [
          'field-supervisor',
          'processing-operator',
          'traffic-authority',
          'AUDITOR',
          'technical-admin',
        ],
      ],
      [
        'custody-event',
        'read',
        [
          'field-supervisor',
          'processing-operator',
          'traffic-authority',
          'AUDITOR',
          'technical-admin',
        ],
      ],
      [
        'probative-package',
        'read',
        [
          'field-supervisor',
          'processing-operator',
          'traffic-authority',
          'AUDITOR',
          'technical-admin',
        ],
      ],
      [
        'probative-package-item',
        'read',
        [
          'field-supervisor',
          'processing-operator',
          'traffic-authority',
          'AUDITOR',
          'technical-admin',
        ],
      ],
      [
        'storage-intent',
        'read',
        [
          'field-supervisor',
          'processing-operator',
          'traffic-authority',
          'AUDITOR',
          'technical-admin',
        ],
      ],
      [
        'evidence-access-request',
        'read',
        [
          'field-supervisor',
          'processing-operator',
          'traffic-authority',
          'AUDITOR',
          'technical-admin',
        ],
      ],
      ['evidence-link', 'create', ['field-agent', 'processing-operator']],
      [
        'custody-event',
        'create',
        ['field-agent', 'processing-operator', 'AUDITOR', 'technical-admin'],
      ],
      [
        'probative-package',
        'create',
        ['processing-operator', 'AUDITOR', 'technical-admin'],
      ],
      [
        'probative-package-item',
        'create',
        ['processing-operator', 'technical-admin'],
      ],
      ['storage-intent', 'create', ['field-agent', 'processing-operator']],
      [
        'evidence-access-request',
        'create',
        ['processing-operator', 'traffic-authority'],
      ],
    ];

    for (const [resource, action, roles] of surfaces) {
      it(`ops:${resource}:${action} — ${roles.join(', ')}`, () => {
        expectGrantedOnlyTo(`ops:${resource}`, action, roles);
      });
    }

    const snapshotSurfaces = [
      ['person', 'read'],
      ['person', 'create'],
      ['vehicle', 'read'],
      ['vehicle', 'create'],
      ['person-document', 'read'],
      ['person-document', 'create'],
      ['vehicle-snapshot', 'read'],
      ['vehicle-snapshot', 'create'],
    ] as const;

    it('ops:{person,vehicle,person-document,vehicle-snapshot}:{read,create} — field-agent, field-supervisor, processing-operator, traffic-authority e technical-admin (§4.5, controladores gerados de BP-OPS-SNAPSHOTS-001)', () => {
      for (const [resource, action] of snapshotSurfaces) {
        expectGrantedOnlyTo(`ops:${resource}`, action, [
          'field-agent',
          'field-supervisor',
          'processing-operator',
          'traffic-authority',
        ]);
      }
    });
  });

  describe('§7 — remoção do alias duplicado da origem (`ops:snapshot-person`/`ops:snapshot-vehicle`)', () => {
    it('dado ops:snapshot-{person,vehicle}:{read,create} então as quatro chaves não existem na matriz (a rota gerada é ops:person/ops:vehicle, nunca ops:snapshot-*)', () => {
      for (const resource of ['snapshot-person', 'snapshot-vehicle']) {
        for (const action of ['read', 'create']) {
          expect(
            `ops:${resource}:${action}` in DETRAN_POLICY_MATRIX,
            `ops:${resource}:${action} deveria ter sido removida em M18 (CTG-0003 §7)`,
          ).toBe(false);
        }
      }
    });

    it('dado qualquer papel canônico então nenhum recebe ops:snapshot-person:read, nem por permissionsForRoles', () => {
      for (const role of TEAT_CANONICAL_ROLES) {
        expect(
          permissionsForRoles([role]).includes('ops:snapshot-person:read'),
        ).toBe(false);
      }
    });
  });
});

/**
 * CTG-0004 §2/§4/§5/§8 (R-0008, TASK-0008) — medidas administrativas,
 * alcoolemia, velocidade, SSE e integrações (WP-T2). `inf:administrative-measure:*`
 * e `inf:alcohol-procedure:*` já existem em `TEAT_RULES` (ported ahead of
 * TASK-0009, verificado por leitura direta de `policy.ts` linhas 663–706): os
 * testes abaixo passam hoje. `ops:stream:read` e `ops:integration:{read,retry}`
 * são chaves NOVAS pedidas pelo contrato (§8) e ainda não existem — os dois
 * últimos `describe` ficam vermelhos até TASK-0009, comportamento ausente,
 * nunca ajuste de teste (regra 7 do prompt).
 */
describe('CTG-0004 §2/§4/§5/§8 — medidas, alcoolemia, velocidade, SSE, integrações (TASK-0008)', () => {
  const allowed = (roles: string[], resource: string, action: string) =>
    isDetranActionAllowed({ roles, permissions: [] }, resource, action);

  /** Os oito papéis canônicos da família TEAT (plan.md §0, roles.ts). */
  const TEAT_CANONICAL_ROLES = [
    'field-agent',
    'field-supervisor',
    'processing-operator',
    'traffic-authority',
    'agency-admin',
    'technical-admin',
    'AUDITOR',
    'integration-operator',
  ] as const;

  function expectGrantedOnlyTo(
    resource: string,
    action: string,
    grantedRoles: readonly string[],
  ): void {
    for (const role of TEAT_CANONICAL_ROLES) {
      if (role === 'technical-admin') {
        expect(
          allowed([role], resource, action),
          `technical-admin deveria passar por GLOBAL_ADMIN_ROLES ('*') em ${resource}:${action}`,
        ).toBe(true);
        continue;
      }
      const expected = (grantedRoles as readonly string[]).includes(role);
      expect(
        allowed([role], resource, action),
        `${resource}:${action} para o papel ${role} deveria ser ${expected}`,
      ).toBe(expected);
    }
    // rait-test-strategy.md §2: "negado para pelo menos um papel RAIT fora da lista".
    expect(
      allowed(['rait-analyst'], resource, action),
      `${resource}:${action} nunca deveria conceder a um papel RAIT`,
    ).toBe(false);
  }

  describe('§4 — inf:administrative-measure:* (C-0004: matriz de política das medidas)', () => {
    it('start — field-agent, processing-operator', () => {
      expectGrantedOnlyTo('inf:administrative-measure', 'start', [
        'field-agent',
        'processing-operator',
      ]);
    });
    it('register-retention — field-agent, processing-operator', () => {
      expectGrantedOnlyTo('inf:administrative-measure', 'register-retention', [
        'field-agent',
        'processing-operator',
      ]);
    });
    it('register-removal — field-agent, processing-operator', () => {
      expectGrantedOnlyTo('inf:administrative-measure', 'register-removal', [
        'field-agent',
        'processing-operator',
      ]);
    });
    it('inventory-vehicle — field-agent, processing-operator', () => {
      expectGrantedOnlyTo('inf:administrative-measure', 'inventory-vehicle', [
        'field-agent',
        'processing-operator',
      ]);
    });
    it('apply-term — field-agent, processing-operator', () => {
      expectGrantedOnlyTo('inf:administrative-measure', 'apply-term', [
        'field-agent',
        'processing-operator',
      ]);
    });
    it('release — field-supervisor, traffic-authority (403 TEAT.MEASURE_RELEASE_NOT_ALLOWED nos demais, §4.6)', () => {
      expectGrantedOnlyTo('inf:administrative-measure', 'release', [
        'field-supervisor',
        'traffic-authority',
      ]);
    });
    it('conclude — só traffic-authority', () => {
      expectGrantedOnlyTo('inf:administrative-measure', 'conclude', [
        'traffic-authority',
      ]);
    });
    it('cancel — só traffic-authority (a rota sempre responde 409, §4.7)', () => {
      expectGrantedOnlyTo('inf:administrative-measure', 'cancel', [
        'traffic-authority',
      ]);
    });
  });

  describe('§5 — inf:alcohol-procedure:* (C-0004: matriz de política da alcoolemia)', () => {
    it('start — só field-agent', () => {
      expectGrantedOnlyTo('inf:alcohol-procedure', 'start', ['field-agent']);
    });
    it('record-test — só field-agent', () => {
      expectGrantedOnlyTo('inf:alcohol-procedure', 'record-test', [
        'field-agent',
      ]);
    });
    it('record-refusal — só field-agent', () => {
      expectGrantedOnlyTo('inf:alcohol-procedure', 'record-refusal', [
        'field-agent',
      ]);
    });
    it('record-psychomotor-signs — só field-agent', () => {
      expectGrantedOnlyTo('inf:alcohol-procedure', 'record-psychomotor-signs', [
        'field-agent',
      ]);
    });
    it('forward — só field-agent', () => {
      expectGrantedOnlyTo('inf:alcohol-procedure', 'forward', ['field-agent']);
    });
    it('close — field-agent, field-supervisor', () => {
      expectGrantedOnlyTo('inf:alcohol-procedure', 'close', [
        'field-agent',
        'field-supervisor',
      ]);
    });
  });

  describe('§6 — inf:speed-measurement:create (atrás de teat.speed_meters, INF_FIELD_LEGAL_ROLES)', () => {
    it('create — field-agent, field-supervisor, processing-operator, traffic-authority, technical-admin (INF_FIELD_LEGAL_ROLES; agency-admin/AUDITOR/integration-operator negados)', () => {
      // INF_FIELD_LEGAL_ROLES inclui technical-admin explicitamente (não só via
      // GLOBAL_ADMIN_ROLES) — expectGrantedOnlyTo cobre os dois caminhos porque
      // ambos concedem true.
      for (const role of [
        'field-agent',
        'field-supervisor',
        'processing-operator',
        'traffic-authority',
      ] as const) {
        expect(allowed([role], 'inf:speed-measurement', 'create')).toBe(true);
      }
      for (const role of [
        'agency-admin',
        'AUDITOR',
        'integration-operator',
      ] as const) {
        expect(allowed([role], 'inf:speed-measurement', 'create')).toBe(false);
      }
    });
  });

  /**
   * §8 (M17/OD-T17) — `ops:stream:read`: chave NOVA, todos os oito papéis
   * TEAT (o stream só entrega o que o papel já lê por outra chave — não é
   * ampliação de acesso). Vermelho até TASK-0009 acrescentar a linha em
   * `TEAT_RULES`.
   */
  describe('§8 (OD-T17) — ops:stream:read: todos os oito papéis TEAT, nenhum papel PEC/RAIT/DASHBOARD', () => {
    it('dado cada um dos oito papéis TEAT quando ops:stream:read então permitido', () => {
      for (const role of TEAT_CANONICAL_ROLES) {
        expect(
          allowed([role], 'ops:stream', 'read'),
          `ops:stream:read deveria ser permitido para ${role} (OD-T17)`,
        ).toBe(true);
      }
    });
    it('dado um papel PEC (CANDIDATO) ou RAIT (rait-analyst) quando ops:stream:read então negado', () => {
      expect(allowed(['CANDIDATO'], 'ops:stream', 'read')).toBe(false);
      expect(allowed(['rait-analyst'], 'ops:stream', 'read')).toBe(false);
    });
  });

  /**
   * §8 (route contract §4.6) — `ops:integration:{read,retry}`: só
   * integration-operator e technical-admin. Vermelho até TASK-0009.
   */
  describe('§8 — ops:integration:{read,retry}: só integration-operator e technical-admin', () => {
    it('read — integration-operator, technical-admin; negado para os outros seis papéis TEAT', () => {
      expectGrantedOnlyTo('ops:integration', 'read', ['integration-operator']);
    });
    it('retry — integration-operator, technical-admin; negado para os outros seis papéis TEAT', () => {
      expectGrantedOnlyTo('ops:integration', 'retry', ['integration-operator']);
    });
  });
});

/**
 * work/rounds/R-0009/contracts/CTG-0001.md §3/§8, §11 C-0001-52 (M19; plan.md M19) —
 * `portal:identity:read`: única linha que TASK-0004 acrescenta a `policy.ts` neste grupo (o
 * bloco `PORTAL_RULES` completo é CTG-0002/TASK-0007). Fica vermelho até TASK-0004 acrescentar
 * `['portal:identity:read', ['CIDADAO']]`. Negativos exaustivos por todos os papéis canônicos de
 * `DETRAN_ROLES`, exceto a exceção declarada de `GLOBAL_ADMIN_ROLES` (a guarda de identidade —
 * `PortalCitizenGuard`, M4 — nega essas quatro depois, fora do escopo de `policy.spec.ts`).
 *
 * Nota de divergência (registrada no relatório de TASK-0003): o texto de §11 C-0001-52 fala em
 * "32 papéis... negativos", mas a lista enumerada em §3 (`negativo pela política`) tem 31 nomes;
 * 31 é o valor internamente consistente com `DETRAN_ROLES.length === 36` (36 − 1 CIDADAO − 4
 * `GLOBAL_ADMIN_ROLES`), verificado abaixo programaticamente contra `roles.ts`.
 *
 * `portal:appeal:create`/`portal:appeal:read-own` (linhas existentes, ver teste acima em
 * "grants RAIT command and surface rules only to RAIT staff roles") não são removidas nem
 * alteradas aqui — permanecem até CTG-0002/TASK-0007 (M19).
 */
describe('CTG-0001 §3/§8 (M19, TASK-0003) — portal:identity:read: CIDADAO positivo, negativos exaustivos', () => {
  const PORTAL_GLOBAL_ADMIN_ROLES = [
    'ADMIN',
    'GESTOR_DETRAN',
    'SUPORTE',
    'technical-admin',
  ] as const;

  it('C-0001-52 — dado portal:identity:read quando isDetranActionAllowed então CIDADAO permitido; ADMIN/GESTOR_DETRAN/SUPORTE/technical-admin permitidos por GLOBAL_ADMIN_ROLES (exceção declarada — a guarda de identidade nega depois, M4); os demais 31 papéis canônicos negados', () => {
    for (const role of DETRAN_ROLES) {
      const expected =
        role === 'CIDADAO' ||
        (PORTAL_GLOBAL_ADMIN_ROLES as readonly string[]).includes(role);
      expect(
        isDetranActionAllowed(
          { roles: [role], permissions: [] },
          'portal:identity',
          'read',
        ),
        `portal:identity:read para o papel ${role} deveria ser ${expected}`,
      ).toBe(expected);
    }
  });

  it('dado os papéis canônicos fora de CIDADAO e GLOBAL_ADMIN_ROLES quando contados então são exatamente 31 (36 papéis − 1 CIDADAO − 4 GLOBAL_ADMIN_ROLES)', () => {
    const negatives = DETRAN_ROLES.filter(
      (role) =>
        role !== 'CIDADAO' &&
        !(PORTAL_GLOBAL_ADMIN_ROLES as readonly string[]).includes(role),
    );
    expect(DETRAN_ROLES).toHaveLength(36);
    expect(negatives).toHaveLength(31);
  });

  it('dado portal:appeal:create e portal:appeal:read-own quando CTG-0002/TASK-0007 remove as linhas então AUSENTES da matriz e negadas a CIDADAO (M19, ADR-0019 — este `it` nasceu em TASK-0003 com prazo declarado até CTG-0002; C-0002-83)', () => {
    expect('portal:appeal:create' in DETRAN_POLICY_MATRIX).toBe(false);
    expect('portal:appeal:read-own' in DETRAN_POLICY_MATRIX).toBe(false);
    expect(
      isDetranActionAllowed(
        { roles: ['CIDADAO'], permissions: [] },
        'portal:appeal',
        'create',
      ),
    ).toBe(false);
    expect(
      isDetranActionAllowed(
        { roles: ['CIDADAO'], permissions: [] },
        'portal:appeal',
        'read-own',
      ),
    ).toBe(false);
  });
});

/**
 * work/rounds/R-0009/contracts/CTG-0002.md §10 e §13 C-0002-83 (M19, TASK-0006) — bloco
 * `PORTAL_RULES` completo (29 chaves, só `CIDADAO`). Fica vermelho até TASK-0007 colar o bloco
 * em `policy.ts` e remover `portal:appeal:{create,read-own}` (ADR-0019: o caso é do RAIT).
 * Grants (orchestra/README.md §4.8): positivo `CIDADAO`; negativos pela política = todos os
 * demais papéis canônicos de `roles.ts`; exceção declarada = `GLOBAL_ADMIN_ROLES` (`ADMIN`,
 * `GESTOR_DETRAN`, `SUPORTE`, `technical-admin`), que `isDetranActionAllowed` libera para toda
 * chave e a `PortalCitizenGuard` (CTG-0001 §3, A3(a)) barra depois — fora do escopo deste spec.
 * `portal:complaint:*` (PEC, `TEAT_RULES`, M2) permanece como está.
 */
describe('CTG-0002 §10 (M19, TASK-0006) — PORTAL_RULES: CIDADAO positivo, negativos exaustivos, portal:appeal ausente', () => {
  const PORTAL_GLOBAL_ADMIN_ROLES = [
    'ADMIN',
    'GESTOR_DETRAN',
    'SUPORTE',
    'technical-admin',
  ] as const;

  /** Transcrição literal de CTG-0002 §10.1 (29 chaves). */
  const PORTAL_RULE_KEYS = [
    'portal:identity:read',
    'portal:identity:elevate',
    'portal:identity:represent',
    'portal:identity:update',
    'portal:ait:read',
    'portal:request:create',
    'portal:request:compose',
    'portal:request:submit',
    'portal:request:withdraw',
    'portal:request:read',
    'portal:request:respond',
    'portal:request:evaluate',
    'portal:inbox:read',
    'portal:inbox:acknowledge',
    'portal:sne-enrollment:read',
    'portal:sne-enrollment:enroll',
    'portal:sne-enrollment:cancel',
    'portal:push-subscription:create',
    'portal:document:read',
    'portal:vehicle:read',
    'portal:vehicle:issue',
    'portal:crash:read',
    'portal:exam:read',
    'portal:manifestation:manifest',
    'portal:manifestation:read',
    'portal:manifestation:acknowledge',
    'portal:evaluation:evaluate',
    'portal:service-charter:read',
    'portal:stream:read',
  ] as const;

  /** `portal:complaint:*` (M2) — estado de `TEAT_RULES` em `policy.ts`, inalterado por CTG-0002. */
  const COMPLAINT_RULES: Array<[string, readonly string[]]> = [
    [
      'portal:complaint:create',
      ['CANDIDATO', 'DPO', 'AUDITOR', 'GESTOR_DETRAN', 'SUPORTE'],
    ],
    [
      'portal:complaint:read',
      ['CANDIDATO', 'DPO', 'AUDITOR', 'GESTOR_DETRAN', 'SUPORTE'],
    ],
    ['portal:complaint:update', ['DPO', 'AUDITOR', 'GESTOR_DETRAN', 'SUPORTE']],
  ];

  it('C-0002-83 — dado PORTAL_RULES então as 29 chaves existem na matriz com exatamente [CIDADAO]', () => {
    expect(PORTAL_RULE_KEYS).toHaveLength(29);
    for (const key of PORTAL_RULE_KEYS) {
      expect(
        key in DETRAN_POLICY_MATRIX,
        `${key} deveria existir em DETRAN_POLICY_MATRIX`,
      ).toBe(true);
      expect(
        [
          ...(DETRAN_POLICY_MATRIX[key as keyof typeof DETRAN_POLICY_MATRIX] ??
            []),
        ],
        key,
      ).toEqual(['CIDADAO']);
    }
  });

  it('C-0002-83 — dado cada chave de PORTAL_RULES quando isDetranActionAllowed então CIDADAO permitido, os 31 papéis canônicos restantes negados e ADMIN/GESTOR_DETRAN/SUPORTE/technical-admin permitidos (GLOBAL_ADMIN_ROLES — exceção declarada, barrada pela PortalCitizenGuard)', () => {
    const negatives = DETRAN_ROLES.filter(
      (role) =>
        role !== 'CIDADAO' &&
        !(PORTAL_GLOBAL_ADMIN_ROLES as readonly string[]).includes(role),
    );
    expect(negatives).toHaveLength(31);
    for (const key of PORTAL_RULE_KEYS) {
      const [domain, resource, action] = key.split(':') as [
        string,
        string,
        string,
      ];
      const resourceKey = `${domain}:${resource}`;
      for (const role of DETRAN_ROLES) {
        const expected =
          role === 'CIDADAO' ||
          (PORTAL_GLOBAL_ADMIN_ROLES as readonly string[]).includes(role);
        expect(
          isDetranActionAllowed(
            { roles: [role], permissions: [] },
            resourceKey,
            action,
          ),
          `${key} para o papel ${role} deveria ser ${expected}`,
        ).toBe(expected);
      }
      expect(
        isDetranActionAllowed(
          { roles: [], permissions: [] },
          resourceKey,
          action,
        ),
        `${key} sem papel`,
      ).toBe(false);
    }
  });

  it("C-0002-83 — dado a matriz então as chaves 'portal:*' fora de 'portal:complaint:*' são exatamente as 29 de PORTAL_RULES (nenhuma sobra, nenhuma falta) e 'portal:appeal:*' está ausente", () => {
    const portalKeys = Object.keys(DETRAN_POLICY_MATRIX)
      .filter(
        (key) =>
          key.startsWith('portal:') && !key.startsWith('portal:complaint:'),
      )
      .sort();
    expect(portalKeys).toEqual([...PORTAL_RULE_KEYS].sort());
    expect(portalKeys.some((key) => key.startsWith('portal:appeal:'))).toBe(
      false,
    );
    expect('portal:appeal:create' in DETRAN_POLICY_MATRIX).toBe(false);
    expect('portal:appeal:read-own' in DETRAN_POLICY_MATRIX).toBe(false);
    for (const role of DETRAN_ROLES) {
      if ((PORTAL_GLOBAL_ADMIN_ROLES as readonly string[]).includes(role))
        continue;
      expect(
        isDetranActionAllowed(
          { roles: [role], permissions: [] },
          'portal:appeal',
          'create',
        ),
        role,
      ).toBe(false);
      expect(
        isDetranActionAllowed(
          { roles: [role], permissions: [] },
          'portal:appeal',
          'read-own',
        ),
        role,
      ).toBe(false);
    }
  });

  it("C-0002-83 — dado 'portal:complaint:*' (PEC, M2) então inalterado: os mesmos papéis de TEAT_RULES e CIDADAO negado", () => {
    for (const [key, roles] of COMPLAINT_RULES) {
      expect(
        [
          ...(DETRAN_POLICY_MATRIX[key as keyof typeof DETRAN_POLICY_MATRIX] ??
            []),
        ],
        key,
      ).toEqual([...roles]);
      const [, resource, action] = key.split(':') as [string, string, string];
      expect(
        isDetranActionAllowed(
          { roles: ['CIDADAO'], permissions: [] },
          `portal:${resource}`,
          action,
        ),
        key,
      ).toBe(false);
      expect(
        isDetranActionAllowed(
          { roles: ['CANDIDATO'], permissions: [] },
          `portal:${resource}`,
          action,
        ),
        key,
      ).toBe(roles.includes('CANDIDATO'));
    }
  });
});

describe('R-0007 CTG-0002 worklist and session command policy matrix', () => {
  const commandRules = [
    ['rait-schedule', 'create', ['rait-coordinator']],
    ['rait-schedule', 'publish', ['rait-coordinator']],
    ['rait-batch', 'create', ['rait-secretary']],
    ['rait-batch', 'approve', ['rait-chair']],
    ['rait-batch-item', 'accept', ['rait-rapporteur']],
    ['rait-batch-item', 'impediment', ['rait-rapporteur']],
    [
      'rait-assignment',
      'reassign',
      ['rait-coordinator', 'rait-manager', 'rait-chair'],
    ],
    ['rait-batch', 'draw', ['rait-secretary']],
    ['rait-session', 'close-agenda', ['rait-chair']],
    ['rait-session', 'open', ['rait-chair']],
    ['rait-session', 'adjourn', ['rait-chair', 'rait-secretary']],
    ['rait-session', 'convene-extraordinary', ['rait-chair']],
    ['rait-agenda-item', 'read', ['rait-rapporteur']],
    ['rait-agenda-item', 'view', ['rait-rapporteur']],
    ['rait-agenda-item', 'withdraw', ['rait-chair']],
    ['rait-vote', 'create', ['rait-chair', 'rait-rapporteur']],
    ['rait-agenda-item', 'proclaim', ['rait-chair']],
    ['rait-minutes', 'create', ['rait-secretary']],
    ['rait-minutes', 'sign', ['rait-chair', 'rait-rapporteur']],
    ['rait-minutes', 'publish', ['rait-secretary']],
  ] as const;

  it.each(commandRules)(
    'dado o comando CTG-0002 %s:%s quando avaliado então permite somente os papéis canônicos',
    (resource, action, allowedRoles) => {
      for (const role of allowedRoles) {
        expect(
          isDetranActionAllowed(
            { roles: [role], permissions: [] },
            `inf:${resource}`,
            action,
          ),
        ).toBe(true);
      }
      for (const role of DETRAN_ROLES.filter(
        (candidate) => !(allowedRoles as readonly string[]).includes(candidate),
      )) {
        expect(
          isDetranActionAllowed(
            { roles: [role], permissions: [] },
            `inf:${resource}`,
            action,
          ),
        ).toBe(false);
      }
    },
  );

  it('dada uma tentativa de criar sustentação oral quando avaliada então nenhum papel canônico é autorizado', () => {
    for (const role of DETRAN_ROLES) {
      expect(
        isDetranActionAllowed(
          { roles: [role], permissions: [] },
          'inf:rait-oral-argument',
          'create',
        ),
      ).toBe(false);
    }
  });
});

describe('R-0007 CTG-0001 — matriz exaustiva dos comandos do caso RAIT', () => {
  const commandRules: ReadonlyArray<
    readonly [string, string, readonly string[]]
  > = [
    ['inf:rait-case', 'admit', ['rait-analyst']],
    ['inf:rait-case', 'reject', ['rait-analyst']],
    ['inf:rait-case', 'remit-jari', ['rait-secretary']],
    ['inf:rait-case', 'receive-judging-body', ['rait-secretary']],
    ['inf:rait-case', 'submit-draft', ['rait-analyst']],
    ['inf:rait-decision', 'sign', ['rait-signing-authority']],
    ['inf:rait-decision', 'return-draft', ['rait-signing-authority']],
    ['inf:rait-case', 'withdraw', ['rait-secretary']],
    ['inf:rait-case', 'redirect', ['rait-secretary']],
    ['inf:rait-case', 'resolve-pending-content', ['rait-secretary']],
    ['inf:rait-case', 'claim-next', ['rait-analyst']],
    ['inf:rait-case', 'answer-inquiry', ['rait-analyst', 'rait-rapporteur']],
    ['inf:rait-case', 'extend-inquiry', ['rait-analyst', 'rait-rapporteur']],
  ];
  const globalAdminRoles = new Set([
    'ADMIN',
    'GESTOR_DETRAN',
    'SUPORTE',
    'technical-admin',
  ]);

  for (const [resource, action, positiveRoles] of commandRules) {
    it(`dado o par ${resource}:${action} quando cada papel canônico é avaliado então concede só os papéis do contrato`, () => {
      for (const role of DETRAN_ROLES) {
        const expected =
          globalAdminRoles.has(role) || positiveRoles.includes(role);
        expect(
          isDetranActionAllowed(
            { roles: [role], permissions: [] },
            resource,
            action,
          ),
          `${resource}:${action} para ${role}`,
        ).toBe(expected);
      }
    });
  }

  it('dado expire quando um papel humano tenta executar então a política permanece fechada', () => {
    for (const role of DETRAN_ROLES) {
      expect(
        isDetranActionAllowed(
          { roles: [role], permissions: [] },
          'inf:rait-inquiry',
          'expire',
        ),
      ).toBe(globalAdminRoles.has(role));
    }
  });

  it('preserva OD-309 somente nos dois pares de comando explicitamente nomeados', () => {
    expect(
      isDetranActionAllowed(
        { roles: ['rait-signing-authority'], permissions: [] },
        'inf:rait-suspension-act',
        'create',
      ),
    ).toBe(true);
    expect(
      isDetranActionAllowed(
        { roles: ['rait-chair'], permissions: [] },
        'inf:rait-suspension-act',
        'create',
      ),
    ).toBe(true);
    expect(
      isDetranActionAllowed(
        { roles: ['AUDITOR'], permissions: [] },
        'inf:rait-export',
        'create',
      ),
    ).toBe(true);
  });
});
