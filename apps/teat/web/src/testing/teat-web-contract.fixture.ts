import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export const TEAT_WEB_ROLES = [
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

export type TeatWebRole = (typeof TEAT_WEB_ROLES)[number];

export interface TeatWebRouteFixture {
  readonly path: string;
  readonly sheet?: string;
  readonly uxCode?: string;
  readonly allowedRoles: readonly TeatWebRole[];
  readonly guards: readonly string[];
  readonly client: string;
  readonly module: string;
  readonly sse: boolean;
  readonly titleKey?: string;
  readonly h1TitleKey?: string;
}

interface WebMatrix {
  readonly expectedScreens: number;
  readonly screens: readonly Readonly<{
    screenId: string;
    uxCode: string;
    route: string;
    roles: readonly string[];
  }>[];
}

const repositoryRoot = resolve(process.cwd(), '../../..');
const contract = readFileSync(
  resolve(repositoryRoot, 'docs/framework/arch/teat-web-contract.md'),
  'utf8',
);
const routeContract = readFileSync(
  resolve(repositoryRoot, 'docs/framework/arch/teat-route-contract.md'),
  'utf8',
);
const matrix = JSON.parse(
  readFileSync(
    resolve(
      repositoryRoot,
      'docs/framework/product/domains/inf/teat/ux-parity/web-matrix.json',
    ),
    'utf8',
  ),
) as WebMatrix;

function unquote(value: string): string {
  return value.replaceAll('`', '').trim();
}

function canonicalRole(role: string): TeatWebRole {
  const canonical = role === 'auditor' ? 'AUDITOR' : role;
  if (!(TEAT_WEB_ROLES as readonly string[]).includes(canonical)) {
    throw new Error(`papel TEAT fora do catálogo fechado: ${role}`);
  }
  return canonical as TeatWebRole;
}

function parseIdentity(
  value: string,
): Readonly<{ sheet: string; uxCode: string }> | undefined {
  const matches = [...value.matchAll(/`([^`]+)`/g)].map((match) => match[1]);
  return matches.length === 2 &&
    matches[0] !== undefined &&
    matches[1] !== undefined
    ? { sheet: matches[0], uxCode: matches[1] }
    : undefined;
}

function parseGuards(value: string): readonly string[] {
  if (value === 'G') return ['authGuard', 'tenantGuard', 'roleGuard'];
  if (value === 'G*') {
    return ['authGuard', 'tenantGuard', 'roleGuard', 'contextGuard'];
  }
  return value.split('→').map((guard) => guard.trim());
}

function parseTitleKeys(
  value: string,
): Readonly<{ titleKey?: string; h1TitleKey?: string }> {
  const normalized = unquote(value);
  if (normalized.includes('source_pending')) return {};
  const split = normalized.match(/^data:\s*([^;]+);\s*h1:\s*(.+)$/);
  return split?.[1] !== undefined && split[2] !== undefined
    ? { titleKey: split[1].trim(), h1TitleKey: split[2].trim() }
    : { titleKey: normalized };
}

const routeRows = contract
  .split('\n')
  .filter((line) => /^\|\s+`(?:\/|\*\*)/.test(line));

export const TEAT_WEB_ROUTE_FIXTURE: readonly TeatWebRouteFixture[] =
  routeRows.map((line) => {
    const cells = line
      .split('|')
      .slice(1, -1)
      .map((cell) => cell.trim());
    const identity = parseIdentity(cells[1] ?? '');
    const path = unquote(cells[0] ?? '');
    const roles = (cells[2] ?? '')
      .split(',')
      .map((role) => unquote(role))
      .filter((role) => role !== '')
      .map(canonicalRole);
    return {
      path,
      ...(identity === undefined ? {} : identity),
      allowedRoles: roles,
      guards: parseGuards(unquote(cells[3] ?? '')),
      client: unquote(cells[4] ?? ''),
      module: unquote(cells[6] ?? ''),
      sse: unquote(cells[7] ?? '') === 'sim',
      ...parseTitleKeys(cells[5] ?? ''),
    };
  });

export const TEAT_WEB_MATRIX = matrix;

const sseContract = routeContract.match(
  /## 7\. Fluxo SSE[\s\S]*?(?=\n## 8\.)/,
)?.[0];
if (sseContract === undefined) {
  throw new Error('seção fechada do fluxo SSE não encontrada');
}

export const TEAT_WEB_SSE_EVENT_TOPICS = [
  ...sseContract.matchAll(/`([^`]+\.[^`]+)`/g),
]
  .map((match) => match[1] as string)
  .filter((topic) => !topic.endsWith('.md'));

export const TEAT_WEB_SSE_TOPICS_BY_PATH = Object.fromEntries(
  TEAT_WEB_ROUTE_FIXTURE.filter((entry) => entry.sse).map((entry) => [
    entry.path,
    entry.client.includes('source_pending')
      ? ([] as const)
      : entry.client === 'ait'
        ? TEAT_WEB_SSE_EVENT_TOPICS.filter((topic) => topic.startsWith('ait.'))
        : TEAT_WEB_SSE_EVENT_TOPICS,
  ]),
) as Readonly<Record<string, readonly string[]>>;

const TEAT_I18N = JSON.parse(
  readFileSync(
    resolve(repositoryRoot, 'docs/framework/arch/i18n/teat.pt-BR.json'),
    'utf8',
  ),
) as Readonly<Record<string, string>>;
const BOAT_I18N = JSON.parse(
  readFileSync(
    resolve(repositoryRoot, 'docs/framework/arch/i18n/boat.pt-BR.json'),
    'utf8',
  ),
) as Readonly<Record<string, string>>;

// Runtime merge: BOAT keys remain byte-identical, including source_pending markers.
export const TEAT_WEB_I18N = {
  ...TEAT_I18N,
  ...BOAT_I18N,
} as Readonly<Record<string, string>>;
