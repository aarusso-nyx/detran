import { execFileSync } from 'node:child_process';
import {
  mkdtemp,
  readFile,
  readdir,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { format } from 'prettier';
import ts from 'typescript';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const FIXTURE = path.join(
  ROOT,
  'docs/framework/arch/fixtures/authz-route-role-matrix.json',
);

const ROLES = [
  'ADMIN',
  'ADMIN_CLINICA',
  'MEDICO',
  'PSICOLOGO',
  'RECEPCAO',
  'TECNICO_BIOMETRIA',
  'AUDITOR',
  'GESTOR',
  'SUPERVISOR',
  'GESTOR_DETRAN',
  'JUNTA',
  'CETRAN',
  'DPO',
  'SUPORTE',
  'CANDIDATO',
  'field-agent',
  'field-supervisor',
  'processing-operator',
  'traffic-authority',
  'agency-admin',
  'technical-admin',
  'bi-analyst',
  'integration-operator',
  'rait-analyst',
  'rait-coordinator',
  'rait-secretary',
  'rait-signing-authority',
  'rait-central-authority',
  'rait-rapporteur',
  'rait-chair',
  'rait-manager',
  'rait-hr',
  'rait-finance',
  'dash-operator',
  'dash-duty-owner',
  'CIDADAO',
] as const;

type Blocker = {
  id: string;
  route: string;
  point: string;
  source: string;
  reason: string;
};

type Matrix = {
  schemaVersion: 1;
  baseline: { ref: string; commit: string; stynx: string };
  profiles: ['local', 'complete'];
  mounts: ['default', 'speed-meters-on'];
  routeInventory: Array<{
    method: string;
    path: string;
    controller: string;
    handler: string;
    resource: string | null;
    action: string | null;
    public: boolean;
    profile: 'local' | 'complete';
    mounts: Array<'default' | 'speed-meters-on'>;
    globalGuards: string[];
    classGuards: string[];
    methodGuards: string[];
    controllerSource: string;
    handlerSource: string;
    internalDecisionMap: 'generated-no-explicit-authz' | 'pending';
    internalDecisionCandidates: string[];
  }>;
  principals: string[];
  notMaterializable: Array<{
    id: string;
    principal: string;
    profile: 'local' | 'complete';
    reason: string;
    source: string;
  }>;
  handlerNotEvaluated: Blocker[];
  cells: Array<{
    method: string;
    path: string;
    controller: string;
    handler: string;
    resource: string | null;
    action: string | null;
    public: boolean;
    principal: string;
    profile: 'local' | 'complete';
    outcome: 'allow' | '401' | '403';
    code: string | null;
    layer: string;
  }>;
};

type ProbeRow = Omit<Matrix['cells'][number], 'outcome'> & {
  status: number;
  handlerEvaluated?: boolean;
};

type ProbeInventory = Omit<
  Matrix['routeInventory'][number],
  | 'controllerSource'
  | 'handlerSource'
  | 'internalDecisionMap'
  | 'internalDecisionCandidates'
>;

function compare(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

async function filesUnder(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const children = await Promise.all(
    entries
      .filter(
        (entry) =>
          entry.name !== 'generated' && !entry.name.endsWith('.spec.ts'),
      )
      .map(async (entry) => {
        const target = path.join(directory, entry.name);
        if (entry.isDirectory()) return filesUnder(target);
        return entry.isFile() && target.endsWith('.ts') ? [target] : [];
      }),
  );
  return children.flat();
}

type ControllerSource = {
  source: string;
  authzFree: boolean;
  file?: string;
  handlerSources: Record<string, string>;
  internalDecisionCandidates: string[];
};

function importedFiles(source: string, file: string): string[] {
  return [...source.matchAll(/\bfrom\s+['"](\.{1,2}\/[^'"]+)['"]/g)]
    .map((match) => match[1]!)
    .map((specifier) =>
      path.resolve(
        path.dirname(file),
        specifier.endsWith('.js') ? `${specifier.slice(0, -3)}.ts` : specifier,
      ),
    );
}

function candidateDecisionLines(source: string, file: string): string[] {
  const relative = path.relative(ROOT, file);
  const pattern =
    /roles\.(?:includes|some)\(|getPrincipalFromRequest|isDetranActionAllowed|canDecideAitCancelRequest|tenantMismatch\(|UnauthorizedException|ForbiddenException|status:\s*(?:401|403)|DashboardLayerGate|@UseGuards\(/u;
  return source
    .split('\n')
    .flatMap((line, index) =>
      pattern.test(line) && !/^\s*(?:\/\/|\*)/u.test(line)
        ? [`${relative}:${index + 1}`]
        : [],
    );
}

async function controllerSources(): Promise<Map<string, ControllerSource>> {
  const roots = [
    path.join(ROOT, 'backend/app/src'),
    path.join(ROOT, 'backend/domains'),
  ];
  const files = (await Promise.all(roots.map(filesUnder))).flat();
  const contents = new Map<string, string>();
  await Promise.all(
    files.map(async (file) => {
      contents.set(file, await readFile(file, 'utf8'));
    }),
  );
  const sources = new Map<string, ControllerSource>();
  const generatedClasses = new Set<string>();
  const generatedControllers = new Set<string>();
  for (const file of files) {
    const source = contents.get(file)!;
    const relative = path.relative(ROOT, file);
    const generated = source.startsWith('// Generated from BP-');
    const hasInternalAuthz =
      /roles\.(?:includes|some)\(|getPrincipalFromRequest|isDetranActionAllowed|canDecideAitCancelRequest|@UseGuards\(/u.test(
        source,
      );
    if (generated && !hasInternalAuthz) {
      for (const match of source.matchAll(/export class (\w+)\b/g))
        generatedClasses.add(match[1]!);
    }
    const parsed = ts.createSourceFile(
      file,
      source,
      ts.ScriptTarget.Latest,
      true,
    );
    for (const node of parsed.statements) {
      if (
        !ts.isClassDeclaration(node) ||
        !node.name?.text.endsWith('Controller') ||
        !node.modifiers?.some(
          (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
        )
      )
        continue;
      const name = node.name.text;
      const handlerSources: Record<string, string> = {};
      for (const member of node.members) {
        if (!ts.isMethodDeclaration(member) || !member.name) continue;
        const method = member.name.getText(parsed);
        const line =
          parsed.getLineAndCharacterOfPosition(member.getStart(parsed)).line +
          1;
        handlerSources[method] = `${relative}:${line}`;
      }
      const line =
        parsed.getLineAndCharacterOfPosition(node.getStart(parsed)).line + 1;
      sources.set(name, {
        source: `${relative}:${line}`,
        authzFree: false,
        file,
        handlerSources,
        internalDecisionCandidates: [],
      });
      if (generated && !hasInternalAuthz) generatedControllers.add(name);
    }
  }
  for (const name of generatedControllers) {
    const base = name.slice(0, -'Controller'.length);
    const entry = sources.get(name)!;
    entry.authzFree =
      generatedClasses.has(`${base}Service`) &&
      generatedClasses.has(`${base}Repository`);
  }
  for (const entry of sources.values()) {
    if (entry.authzFree || !entry.file) continue;
    const queue: Array<{ file: string; depth: number }> = [
      { file: entry.file, depth: 0 },
    ];
    const visited = new Set<string>();
    const candidates = new Set<string>();
    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current.file)) continue;
      visited.add(current.file);
      const source = contents.get(current.file);
      if (!source) continue;
      for (const candidate of candidateDecisionLines(source, current.file))
        candidates.add(candidate);
      if (current.depth >= 2) continue;
      for (const imported of importedFiles(source, current.file))
        if (contents.has(imported))
          queue.push({ file: imported, depth: current.depth + 1 });
    }
    entry.internalDecisionCandidates = [...candidates].sort(compare);
  }
  sources.set('StynxHealthController', {
    source:
      'backend/app/node_modules/@stynx-nyx/health/dist/health/src/health.controller.js:22',
    authzFree: false,
    handlerSources: {},
    internalDecisionCandidates: [],
  });
  sources.set('SessionJwksController', {
    source:
      'backend/app/node_modules/@stynx-nyx/sessions/dist/sessions/src/jwks.controller.js:15',
    authzFree: false,
    handlerSources: {},
    internalDecisionCandidates: [],
  });
  sources.set('StynxAuthController', {
    source:
      'backend/app/node_modules/@stynx-nyx/auth/dist/auth/src/auth.controller.js:23',
    authzFree: false,
    handlerSources: {},
    internalDecisionCandidates: [],
  });
  sources.set('TenancyController', {
    source:
      'backend/app/node_modules/@stynx-nyx/tenancy/dist/tenancy/src/tenancy.controller.js:20',
    authzFree: false,
    handlerSources: {},
    internalDecisionCandidates: [],
  });
  return sources;
}

function validateProbeCoverage(rows: ProbeRow[]): void {
  const expected: Record<'local' | 'complete', string[]> = {
    local: [
      ...ROLES.map((role) => `role:${role}`),
      'none',
      'outside-tenant',
      'role:traffic-authority;decision_body=absent',
      'role:traffic-authority;decision_body=diretoria-fiscalizacao',
    ].sort(compare),
    complete: ['none'],
  };
  const byRoute = new Map<string, Set<string>>();
  for (const row of rows) {
    const routeKey = [
      row.profile,
      row.method,
      row.path,
      row.controller,
      row.handler,
    ].join('\u0000');
    const principals = byRoute.get(routeKey) ?? new Set<string>();
    if (principals.has(row.principal))
      throw new Error(`Sonda duplicada: ${routeKey} ${row.principal}`);
    principals.add(row.principal);
    byRoute.set(routeKey, principals);
  }
  const routeCounts = { local: 0, complete: 0 };
  for (const [key, actual] of byRoute) {
    const profile = key.split('\u0000')[0] as 'local' | 'complete';
    routeCounts[profile]++;
    if (
      JSON.stringify([...actual].sort(compare)) !==
      JSON.stringify(expected[profile])
    )
      throw new Error(`Catálogo incompleto na rota ${key}`);
  }
  if (routeCounts.local !== 1036 || routeCounts.complete !== 1042)
    throw new Error(
      `Rotas montadas divergentes: ${JSON.stringify(routeCounts)}`,
    );
}

function validateInventory(inventory: ProbeInventory[]): void {
  const keys = new Set<string>();
  const counts = { local: 0, complete: 0 };
  for (const route of inventory) {
    const key = [
      route.profile,
      route.method,
      route.path,
      route.controller,
      route.handler,
    ].join('\u0000');
    if (keys.has(key)) throw new Error(`Inventário duplicado: ${key}`);
    keys.add(key);
    counts[route.profile]++;
    if (route.mounts.length < 1 || route.globalGuards.length < 1)
      throw new Error(`Guardas/montagens ausentes: ${key}`);
  }
  if (counts.local !== 1036 || counts.complete !== 1042)
    throw new Error(`Inventário divergente: ${JSON.stringify(counts)}`);
}

function materializationLimits(
  policyResources: string[],
): Matrix['notMaterializable'] {
  const local = [
    'permissions:*',
    ...policyResources.map((resource) => `permissions:${resource}:*`),
    'device_id:present',
    'device_id:absent',
    'agent_id:present',
    'agent_id:absent',
  ].map((principal) => ({
    id: `local:${principal}`,
    principal,
    profile: 'local' as const,
    reason:
      'O token local só lê papéis, ator, tenant e decision_body; não codifica esta entrada.',
    source: 'backend/app/src/detran-runtime.ts:301-353',
  }));
  const complete = [
    ...ROLES.map((role) => `role:${role}`),
    'outside-tenant',
    'permissions:*',
    ...policyResources.map((resource) => `permissions:${resource}:*`),
    'device_id:present',
    'device_id:absent',
    'agent_id:present',
    'agent_id:absent',
    'role:traffic-authority;decision_body=absent',
    'role:traffic-authority;decision_body=diretoria-fiscalizacao',
  ].map((principal) => ({
    id: `complete:${principal}`,
    principal,
    profile: 'complete' as const,
    reason:
      'Token e sessão aceitos, mas STYNX 1.4.0 responde 500 REQUEST_CONTEXT_MUTATION_FORBIDDEN antes da decisão; papéis isolados também não chegam ao principal (roles: []).',
    source:
      'backend/app/node_modules/@stynx-nyx/auth/dist/auth/src/permission-query.service.js:103',
  }));
  return [...local, ...complete].sort((left, right) =>
    compare(left.id, right.id),
  );
}

export async function generate(): Promise<Matrix> {
  const [proof, sources] = await Promise.all([
    probeMountedRoutes(),
    controllerSources(),
  ]);
  const { rows: observed, inventory, policyResources } = proof;
  validateProbeCoverage(observed);
  validateInventory(inventory);
  if (new Set(policyResources).size !== policyResources.length)
    throw new Error('Recursos de política duplicados');
  const cells: Matrix['cells'] = [];
  const handlerNotEvaluated: Blocker[] = [];
  for (const row of observed) {
    const { status, handlerEvaluated, ...identity } = row;
    if (status === 200) {
      if (handlerEvaluated) {
        cells.push({
          ...identity,
          outcome: 'allow',
          code: null,
          layer: 'handler',
        });
        continue;
      }
      const controller = sources.get(row.controller);
      const route = `${row.method} ${row.path}`;
      handlerNotEvaluated.push({
        id: `${row.profile}:${route}:${row.controller}.${row.handler}:${row.principal}`,
        route,
        point: `${row.controller}.${row.handler}`,
        source:
          controller?.handlerSources[row.handler] ??
          controller?.source ??
          'unmapped',
        reason: controller?.authzFree
          ? 'APP_GUARD e guardas passaram; cadeia gerada controller/service/repository não contém decisão explícita, mas o handler ainda não foi executado.'
          : 'APP_GUARD e guardas de classe/método passaram; handler/serviço ainda não foi sondado.',
      });
      continue;
    }
    if (status !== 401 && status !== 403)
      throw new Error(
        `Status não classificável em ${row.method} ${row.path}: ${status}`,
      );
    cells.push({ ...identity, outcome: String(status) as '401' | '403' });
  }
  cells.sort((left, right) =>
    compare(
      [
        left.profile,
        left.method,
        left.path,
        left.controller,
        left.handler,
        left.principal,
      ].join('\u0000'),
      [
        right.profile,
        right.method,
        right.path,
        right.controller,
        right.handler,
        right.principal,
      ].join('\u0000'),
    ),
  );
  handlerNotEvaluated.sort((left, right) => compare(left.id, right.id));
  const routeInventory = inventory
    .map((route) => ({
      ...route,
      controllerSource: sources.get(route.controller)?.source ?? 'unmapped',
      handlerSource:
        sources.get(route.controller)?.handlerSources[route.handler] ??
        sources.get(route.controller)?.source ??
        'unmapped',
      internalDecisionMap: sources.get(route.controller)?.authzFree
        ? ('generated-no-explicit-authz' as const)
        : ('pending' as const),
      internalDecisionCandidates:
        sources.get(route.controller)?.internalDecisionCandidates ?? [],
    }))
    .sort((left, right) =>
      compare(
        [
          left.profile,
          left.method,
          left.path,
          left.controller,
          left.handler,
        ].join('\u0000'),
        [
          right.profile,
          right.method,
          right.path,
          right.controller,
          right.handler,
        ].join('\u0000'),
      ),
    );
  return {
    schemaVersion: 1,
    baseline: {
      ref: 'origin/main',
      commit: 'c4d5417ccaa510422f5f4ac0d326af2219001799',
      stynx: '1.4.0',
    },
    profiles: ['local', 'complete'],
    mounts: ['default', 'speed-meters-on'],
    routeInventory,
    principals: [
      ...ROLES.map((role) => `role:${role}`),
      'none',
      'outside-tenant',
      'permissions:*',
      ...policyResources.map((resource) => `permissions:${resource}:*`),
      'device_id:present',
      'device_id:absent',
      'agent_id:present',
      'agent_id:absent',
      'role:traffic-authority;decision_body=absent',
      'role:traffic-authority;decision_body=diretoria-fiscalizacao',
    ].sort(compare),
    notMaterializable: materializationLimits(policyResources),
    handlerNotEvaluated,
    cells,
  };
}

export async function serialize(matrix: Matrix): Promise<string> {
  return format(JSON.stringify(matrix), { parser: 'json' });
}

async function fixtureExists(): Promise<boolean> {
  try {
    return (await stat(FIXTURE)).isFile();
  } catch {
    return false;
  }
}

/**
 * The application is resolved through Vitest's workspace aliases.  A direct
 * tsx import of AppModule resolves package exports to missing workspace dist
 * files, so the CLI delegates the mounted-route proof to its e2e companion.
 * That companion still creates both real AppModule mounts and never replaces
 * an APP_GUARD.
 */
async function probeMountedRoutes(): Promise<{
  rows: ProbeRow[];
  inventory: ProbeInventory[];
  policyResources: string[];
}> {
  const directory = await mkdtemp(path.join(tmpdir(), 'detran-authz-matrix-'));
  const output = path.join(directory, 'probes.json');
  const databaseUrl = process.env.DETRAN_TEST_DATABASE_URL;
  if (!databaseUrl)
    throw new Error(
      'BLOCKED: DETRAN_TEST_DATABASE_URL descartável é obrigatório',
    );
  try {
    execFileSync(
      'pnpm',
      [
        '--filter',
        '@detran/app',
        'exec',
        'vitest',
        'run',
        '--config',
        'vitest.config.ts',
        'tests/e2e/authz-route-matrix.e2e.spec.ts',
        '--reporter=dot',
      ],
      {
        cwd: path.join(ROOT, 'backend/app'),
        env: {
          ...process.env,
          DATABASE_URL: databaseUrl,
          DETRAN_TEST_DATABASE_URL: databaseUrl,
          DB_NAME: new URL(databaseUrl).pathname.slice(1),
          DETRAN_TEST_TIER: 'e2e',
          DETRAN_AUTHZ_MATRIX_OUTPUT: output,
          LOG_LEVEL: 'silent',
        },
        stdio: 'inherit',
      },
    );
    return JSON.parse(await readFile(output, 'utf8')) as {
      rows: ProbeRow[];
      inventory: ProbeInventory[];
      policyResources: string[];
    };
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

async function main(): Promise<void> {
  const mode = process.argv.slice(2);
  const write = mode.length === 1 && mode[0] === '--write';
  if (!write && mode.length !== 0)
    throw new Error('Uso: route-role-matrix.ts [--write]');
  const text = await serialize(await generate());
  if (write) {
    await writeFile(FIXTURE, text, 'utf8');
    return;
  }
  if (!(await fixtureExists())) throw new Error(`Fixture ausente: ${FIXTURE}`);
  const saved = await readFile(FIXTURE, 'utf8');
  if (saved !== text) {
    if (process.env.DETRAN_AUTHZ_MATRIX_DIFF_OUTPUT)
      await writeFile(
        process.env.DETRAN_AUTHZ_MATRIX_DIFF_OUTPUT,
        text,
        'utf8',
      );
    throw new Error('authz-route-role-matrix diverge byte a byte');
  }
  const matrix = JSON.parse(saved) as Matrix;
  if (matrix.handlerNotEvaluated.length > 0 || matrix.cells.length === 0) {
    throw new Error(
      `Matriz incompleta: ${matrix.handlerNotEvaluated.length} camadas sem sonda e ${matrix.cells.length} células avaliadas`,
    );
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  void main().catch((error: unknown) => {
    const message = error instanceof Error ? error.stack : String(error);
    process.stderr.write(`${message}\n`);
    process.exitCode = 1;
  });
}
