import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

const repoRoot = process.cwd();
const adapterRoot = join(repoRoot, 'packages/senatran-adapter');
const runtimeRoots = ['apps', 'backend', 'packages'];
const sourceExtension = /\.(?:[cm]?[jt]sx?|json)$/u;
const forbiddenPatterns = [
  {
    label: 'a SENATRAN-family base-URL environment variable',
    expression:
      /\b(?:SENATRAN|RENACH|RENAINF|RENAEST|SNE|CDT)_(?:BASE_URL|MOCK_BASE_URL|REAL_BASE_URL)\b/gu,
  },
  {
    label: 'the SENATRAN operator header',
    expression: /x-cpf-usuario/giu,
  },
  {
    label: 'the mock certificate-simulation header',
    expression: /x-client-cert-cn/giu,
  },
  {
    label: 'a direct SENATRAN-family HTTP hostname',
    expression:
      /https?:\/\/[^\s'"`]*(?:senatran|wsdenatran|renach|renainf|renaest)[^\s'"`]*/giu,
  },
  {
    label: 'a direct HTTP URL to a SENATRAN national path',
    expression:
      /https?:\/\/[^\s'"`]+\/v1\/(?:renach|renainf|renaest|sne|cdt|condutores|veiculos|infracoes|indicadores|ConsultaCSV|restricoesJudiciaisAtivas|rouboFurto)(?:\/|\b)/giu,
  },
] as const;

const violations: string[] = [];
const files = runtimeRoots.flatMap((root) => walk(join(repoRoot, root)));

for (const file of files) {
  if (!sourceExtension.test(file) || isInside(file, adapterRoot)) continue;
  const source = readFileSync(file, 'utf8');
  for (const pattern of forbiddenPatterns) {
    pattern.expression.lastIndex = 0;
    for (const match of source.matchAll(pattern.expression)) {
      const line = source.slice(0, match.index).split('\n').length;
      violations.push(
        `${relative(repoRoot, file)}:${line} contains ${pattern.label}: ${match[0]}`,
      );
    }
  }
}

if (violations.length > 0) {
  throw new Error(
    `SENATRAN boundary violations (ADR-0003):\n${violations.join('\n')}`,
  );
}

console.log(
  `SENATRAN boundary verification passed: ${files.length} runtime files scanned; packages/senatran-adapter is the sole HTTP/auth boundary.`,
);

function walk(directory: string): string[] {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (
        ['node_modules', 'dist', 'coverage', '.angular'].includes(entry.name)
      ) {
        return [];
      }
      return walk(path);
    }
    return entry.isFile() ? [path] : [];
  });
}

function isInside(path: string, directory: string): boolean {
  return path === directory || path.startsWith(`${directory}/`);
}
