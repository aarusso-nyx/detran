import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import * as prettier from 'prettier';

/** Supplemental source crosswalk. It never emits a DEVAI reading or grants access. */
export interface ApiEndpoint {
  id: string;
  method: string;
  path: string;
  controller: {
    file: string;
    class: string;
    methodName: string;
    startLine: number;
    endLine: number;
  };
}
export interface ApiMap {
  schemaVersion: string;
  endpoints: ApiEndpoint[];
}
const ignored = new Set([
  'node_modules',
  'dist',
  'generated',
  '.git',
  'coverage',
  '.devai',
  '.vitest-cache',
  'build',
  'graft',
]);
const http = new Map(
  ['Get', 'Post', 'Put', 'Patch', 'Delete', 'Head', 'Options', 'All'].map(
    (name) => [name, name === 'All' ? 'ALL' : name.toUpperCase()],
  ),
);
const digest = (value: string) =>
  crypto.createHash('sha256').update(value).digest('hex');
const order = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);
const decorated = (node: ts.Node) =>
  ts.canHaveDecorators(node) ? (ts.getDecorators(node) ?? []) : [];
function metadata(node: ts.Node, sf: ts.SourceFile) {
  return decorated(node).map((d) => {
    const expression = d.expression;
    const callee = ts.isCallExpression(expression)
      ? expression.expression
      : expression;
    const name = ts.isIdentifier(callee)
      ? callee.text
      : ts.isPropertyAccessExpression(callee)
        ? callee.name.text
        : callee.getText(sf);
    const args = ts.isCallExpression(expression)
      ? [...expression.arguments]
      : [];
    return {
      name,
      args: args.map((a) => a.getText(sf)),
      literal: args[0] && ts.isStringLiteralLike(args[0]) ? args[0].text : null,
    };
  });
}
function walk(directory: string): string[] {
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .sort((a, b) => order(a.name, b.name))
    .flatMap((entry) => {
      const target = path.join(directory, entry.name);
      if (entry.isSymbolicLink() || ignored.has(entry.name)) return [];
      return entry.isDirectory()
        ? walk(target)
        : entry.isFile() && entry.name.endsWith('.controller.ts')
          ? [target]
          : [];
    });
}
function inside(root: string, relative: string) {
  const absolute = path.resolve(root, relative);
  if (
    path.relative(root, absolute).startsWith('..') ||
    path.isAbsolute(relative)
  )
    throw new Error(`Source escapes repository: ${relative}`);
  return absolute;
}
const controls = [
  {
    id: 'citizen-identity',
    file: 'backend/domains/portal/identity/src/handwritten/citizen.guard.ts',
    symbol: 'PortalCitizenGuard',
    constraint:
      'Requires principal, valid portal identity claims and canonical CIDADAO role. Permission wildcards and technical-admin do not bypass identity assurance; handler then uses the validated identity.',
  },
  {
    id: 'policy-delegation',
    file: 'backend/domains/shared/src/policy.guard.ts',
    symbol: 'DetranPolicyGuard',
    constraint:
      'Public bypasses this policy delegate; missing metadata returns true. A principal and isDetranActionAllowed are required only for non-public Resource/Action routes.',
  },
  {
    id: 'ordered-policy',
    file: 'backend/domains/shared/src/policy.ts',
    symbol: 'isDetranActionAllowed',
    constraint:
      'Evaluate ordered DPO, protocol, disabled, strict RAIT/provisioning rules before permission shortcuts, parameter roles, global admins and matrix fallback. Matrix membership alone is not a grant.',
  },
  {
    id: 'provisioning-context',
    file: 'backend/app/src/app.module.ts',
    symbol: 'ProvisioningPolicyGuard',
    constraint:
      'Provisioning paths require principal, tenant membership, command-specific roles or agent_id/device_id identity claims. Other paths delegate through DetranPolicyErrorGuard.',
  },
  {
    id: 'role-canonicalization',
    file: 'backend/domains/shared/src/roles.ts',
    symbol: 'canonicalRoles',
    constraint:
      'Use canonicalRoles rather than interpreting role spellings independently.',
  },
  {
    id: 'decorator-contract',
    file: 'backend/domains/shared/src/decorators.ts',
    symbol: 'Resource',
    constraint:
      'Resource and Action are metadata; they are not proof of an unconditional permission or of tenant, purpose or identity constraints.',
  },
];
const publicReviews: Record<
  string,
  { control: string; sources: string[]; tests: string[]; limitation: string }
> = {
  'POST /v1/ch/transmissions/callbacks/renach': {
    control:
      'RENACH HMAC over timestamp, tenant, event ID and exact raw body; constant-time signature comparison; configured secret, UUID tenant, event ID and 300-second clock window required. Seeds tenant-scoped SYSTEM_INTEGRATION principal.',
    sources: [
      'backend/app/src/renach-webhook.guard.ts',
      'backend/app/src/pec-renach-transmission.controller.ts',
    ],
    tests: ['backend/app/src/renach-webhook.guard.spec.ts'],
    limitation:
      'Guard unit coverage is shared; this entry does not assert an end-to-end callback replay or tenant isolation test executed.',
  },
  'POST /v1/ch/transmissions/callbacks/toxicology': {
    control:
      'Uses RenachWebhookGuard with the same secret, signed exact raw body, tenant/event/timestamp identity and 300-second window. Public bypasses application role policy, not this HMAC guard.',
    sources: [
      'backend/app/src/renach-webhook.guard.ts',
      'backend/app/src/pec-toxicology-inbound.controller.ts',
    ],
    tests: ['backend/app/src/renach-webhook.guard.spec.ts'],
    limitation:
      'Shared guard unit tests do not establish the entire toxicology request pipeline.',
  },
  'GET /v1/portal/brand': {
    control:
      'Deliberately anonymous catalogue read. RequestContext tenant required; SQL parameterized by tenant and Database.tx role app readonly; app host resolution is configuration dependent.',
    sources: [
      'backend/domains/portal/identity/src/handwritten/public.controller.ts',
      'backend/app/src/app.module.ts',
    ],
    tests: ['backend/app/tests/e2e/portal-identity.e2e.spec.ts'],
    limitation:
      'Unknown host is rejected only when host resolution is enabled. Existing tests explicitly cover fallback to local tenant when disabled.',
  },
  'GET /v1/portal/services': {
    control:
      'Deliberately anonymous catalogue read with tenant-scoped RequestContext, parameterized query and app readonly transaction.',
    sources: [
      'backend/domains/portal/identity/src/handwritten/public.controller.ts',
    ],
    tests: ['backend/app/tests/e2e/portal-identity.e2e.spec.ts'],
    limitation:
      'Shared public catalogue/host tests are references, not evidence of an execution in this export.',
  },
  'GET /v1/portal/services/:serviceKey': {
    control:
      'Anonymous tenant-scoped catalogue read; serviceKey is compared literally and passed as query parameter; absent service returns 404.',
    sources: [
      'backend/domains/portal/identity/src/handwritten/public.controller.ts',
    ],
    tests: ['backend/app/tests/e2e/portal-identity.e2e.spec.ts'],
    limitation: 'No role grant inferred from anonymous catalogue access.',
  },
  'POST /v1/portal/manifestations': {
    control:
      'Anonymous intake by existing Owner decision. Opportunistic identity is used only for matching tenant membership and CIDADAO claims; otherwise anonymous. Tenant-scoped app transaction, kind validation and service idempotency remain separate controls.',
    sources: [
      'backend/domains/portal/citizen-service/src/handwritten/manifestations.controller.ts',
      'backend/domains/portal/citizen-service/src/handwritten/manifestation.service.ts',
      'backend/app/src/app.module.ts',
    ],
    tests: [
      'backend/app/src/portal-opportunistic-auth.spec.ts',
      'backend/app/tests/e2e/portal-manifestation-tenant-isolation.e2e.spec.ts',
      'backend/app/tests/e2e/portal-routes.e2e.spec.ts',
    ],
    limitation:
      'Must preserve anonymous fallback rather than inventing an authentication requirement. Export does not execute database-backed tests.',
  },
};

export function exportAuthorization(repoRoot: string, api: ApiMap) {
  const root = path.resolve(repoRoot);
  if (
    api.schemaVersion !== '1.0.0' ||
    !Array.isArray(api.endpoints) ||
    !api.endpoints.length
  )
    throw new Error('Expected non-empty native API map 1.0.0');
  const sources = new Map<string, string>();
  function source(file: string) {
    const text = fs.readFileSync(inside(root, file), 'utf8');
    sources.set(file, digest(text));
    return text;
  }
  const found = new Map<
    string,
    {
      method: string;
      route: string;
      routeDynamic: boolean;
      startLine: number;
      endLine: number;
      resource: string | null;
      action: string | null;
      public: boolean;
      guards: string[];
      decoratorExpressions: string[];
    }
  >();
  for (const absolute of walk(root)) {
    const file = path.relative(root, absolute).split(path.sep).join('/');
    const text = fs.readFileSync(absolute, 'utf8');
    const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
    sf.forEachChild((node) => {
      if (!ts.isClassDeclaration(node)) return;
      const cm = metadata(node, sf),
        controller = cm.find((d) => d.name === 'Controller');
      if (!controller) return;
      sources.set(file, digest(text));
      for (const member of node.members) {
        if (!ts.isMethodDeclaration(member)) continue;
        const mm = metadata(member, sf),
          route = mm.find((d) => http.has(d.name));
        if (!route) continue;
        const key = `${file}#${node.name?.text ?? ''}.${member.name.getText(sf)}`;
        if (found.has(key))
          throw new Error(`Duplicate source endpoint: ${key}`);
        const resource =
          mm.find((d) => d.name === 'Resource') ??
          cm.find((d) => d.name === 'Resource');
        found.set(key, {
          method: http.get(route.name)!,
          route:
            `/${[controller.literal ?? '', route.literal ?? ''].filter(Boolean).join('/')}`
              .replace(/\/+/g, '/')
              .replace(/\/$/, '') || '/',
          routeDynamic:
            (controller.args.length > 0 && controller.literal === null) ||
            (route.args.length > 0 && route.literal === null),
          startLine:
            sf.getLineAndCharacterOfPosition(member.getStart(sf)).line + 1,
          endLine: sf.getLineAndCharacterOfPosition(member.getEnd()).line + 1,
          resource: resource?.literal ?? null,
          action: mm.find((d) => d.name === 'Action')?.literal ?? null,
          public: [...cm, ...mm].some((d) => d.name === 'Public'),
          guards: [
            ...new Set(
              [...cm, ...mm]
                .filter((d) => d.name === 'UseGuards')
                .flatMap((d) => d.args),
            ),
          ].sort(order),
          decoratorExpressions: [...cm, ...mm]
            .filter((d) =>
              ['Resource', 'Action', 'Public', 'UseGuards', 'Roles'].includes(
                d.name,
              ),
            )
            .map((d) => `${d.name}(${d.args.join(', ')})`),
        });
      }
    });
  }
  const ids = new Set<string>(),
    matched = new Set<string>();
  const endpoints = api.endpoints
    .map((endpoint) => {
      if (!endpoint.id || ids.has(endpoint.id))
        throw new Error(`Missing/duplicate native endpoint ID: ${endpoint.id}`);
      ids.add(endpoint.id);
      const c = endpoint.controller,
        key = `${c.file}#${c.class}.${c.methodName}`,
        item = found.get(key);
      if (!item || matched.has(key))
        throw new Error(`Missing/duplicate source binding: ${key}`);
      matched.add(key);
      if (
        item.method !== endpoint.method ||
        item.route !== endpoint.path ||
        item.startLine !== c.startLine ||
        item.endLine !== c.endLine
      )
        throw new Error(`Stale native API coordinates: ${key}`);
      const population = c.file.startsWith('backend/')
        ? 'application'
        : c.file.startsWith('senatran-mock/')
          ? 'mock'
          : c.file.startsWith('tools/')
            ? 'test-fixture'
            : 'other';
      const kind =
        population !== 'application'
          ? 'separate-population-unresolved'
          : item.routeDynamic
            ? 'unresolved'
            : item.public
              ? 'declared-public'
              : item.resource && item.action
                ? 'conditional-policy-reference'
                : 'unresolved';
      const review =
        item.public && !item.routeDynamic && population === 'application'
          ? publicReviews[`${endpoint.method} ${endpoint.path}`]
          : undefined;
      if (review) [...review.sources, ...review.tests].forEach(source);
      return {
        native_id: endpoint.id,
        method: endpoint.method,
        path: endpoint.path,
        population,
        source: {
          path: c.file,
          symbol: `${c.class}.${c.methodName}`,
          start_line: c.startLine,
          end_line: c.endLine,
        },
        binding: kind,
        resource: item.resource,
        action: item.action,
        policy_key:
          kind === 'conditional-policy-reference'
            ? `${item.resource}:${item.action}`
            : null,
        predicate:
          kind === 'conditional-policy-reference'
            ? 'ordered-policy + provisioning-context + route guards + downstream tenant/agency/identity/purpose checks'
            : null,
        guards: item.guards,
        decorator_expressions: item.decoratorExpressions,
        public_review: review ?? null,
        runtime_authorization_proven: false,
        limitations: [
          ...(population !== 'application'
            ? [
                'Included in denominator; mock/fixture guards and roles require their own policy assessment.',
              ]
            : []),
          ...(item.routeDynamic
            ? [
                'Native route path falls back for a nonliteral decorator argument; preserve endpoint and unresolved route-expression limitation.',
              ]
            : []),
          ...(kind === 'unresolved' || (kind === 'declared-public' && !review)
            ? ['Specific control review is required; no permission inferred.']
            : []),
        ],
      };
    })
    .sort((a, b) => order(a.native_id, b.native_id));
  if (matched.size !== found.size)
    throw new Error(
      `Native API map omits ${found.size - matched.size} source handlers`,
    );
  controls.forEach((control) => source(control.file));
  const tests = [
    {
      concern: 'role missing/unmapped; public delegate behavior',
      file: 'backend/domains/shared/src/policy.guard.spec.ts',
    },
    {
      concern: 'strict roles, global shortcuts and permission ordering',
      file: 'backend/domains/shared/src/policy.spec.ts',
    },
    {
      concern: 'tenant identity separation during public intake',
      file: 'backend/app/src/portal-opportunistic-auth.spec.ts',
    },
    {
      concern: 'identity assurance and citizen-role constraints',
      file: 'backend/domains/portal/identity/src/handwritten/citizen.guard.spec.ts',
    },
    {
      concern:
        'RAIT matching-purpose denial, orphan identity and narrowed projections',
      file: 'backend/app/tests/e2e/rait-p402-scope.e2e.spec.ts',
    },
    {
      concern:
        'RAIT decision rejects mismatched authority jurisdiction without effects',
      file: 'backend/domains/inf/rait-case/tests/unit/rait-case-behavioral-matrix.spec.ts',
    },
  ];
  tests.forEach((test) => source(test.file));
  source('tools/security/export-authorization.ts');
  const count = (
    predicate: (endpoint: (typeof endpoints)[number]) => boolean,
  ) => endpoints.filter(predicate).length;
  return {
    schemaVersion: '1.0.0',
    kind: 'detran-authorization-crosswalk',
    native_sensor_compatible: false,
    native_population_sha256: digest(
      JSON.stringify([...api.endpoints].sort((a, b) => order(a.id, b.id))),
    ),
    semantics:
      'Supplemental static representation. Conditional binding is not an unconditional role grant, runtime proof or machine verdict. Native unresolved readings are unchanged.',
    population: {
      total: endpoints.length,
      application_policy: count(
        (e) => e.binding === 'conditional-policy-reference',
      ),
      application_public: count((e) => e.binding === 'declared-public'),
      mock: count((e) => e.population === 'mock'),
      test_fixture: count((e) => e.population === 'test-fixture'),
      other: count((e) => e.population === 'other'),
      unresolved_application: count(
        (e) => e.population === 'application' && e.binding === 'unresolved',
      ),
    },
    controls,
    test_references: tests,
    known_gaps: [
      'Static links do not prove every tenant, agency, identity or purpose predicate on each request path.',
      'An unknown/new public route remains without reviewed control until a reviewed source-backed entry is added.',
      'DEVAI 2.6.3 does not consume this representation. No native unresolved count or verdict is replaced.',
    ],
    sources: [...sources]
      .sort(([a], [b]) => order(a, b))
      .map(([file, sha256]) => ({ path: file, sha256 })),
    endpoints,
  };
}

async function main() {
  const args = process.argv.slice(2),
    get = (flag: string) => args[args.indexOf(flag) + 1];
  if (!args.includes('--api-map'))
    throw new Error(
      'Usage: export-authorization.ts --api-map <native-api-map.json> [--repo-root <repo>] [--output <json> | --check <json>]',
    );
  if (args.includes('--output') && args.includes('--check'))
    throw new Error('Choose --output or --check');
  const value = exportAuthorization(
    args.includes('--repo-root') ? get('--repo-root') : process.cwd(),
    JSON.parse(fs.readFileSync(get('--api-map'), 'utf8')),
  );
  const text = await prettier.format(JSON.stringify(value), { parser: 'json' });
  if (args.includes('--check')) {
    if (fs.readFileSync(get('--check'), 'utf8') !== text)
      throw new Error('Authorization crosswalk is stale');
  } else if (args.includes('--output')) fs.writeFileSync(get('--output'), text);
  else process.stdout.write(text);
}
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)
  main();
