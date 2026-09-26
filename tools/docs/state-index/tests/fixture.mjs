// R-0018 TASK-0002 (Inspector, Art. 6). CTG-0001 §6.1 e §7: construtor da árvore mínima válida
// ("fixture base") para os testes de `tools/docs/state-index/check.mjs`. A árvore vive inteira
// em diretório temporário (`fs.mkdtempSync(os.tmpdir())`); nenhum teste lê ou escreve a árvore
// real do repositório. `buildBaseTree` escreve a fixture base do §7 (duas ADRs, índices
// coerentes, `law/adr` em modo `pending` sem arquivos, rodadas R-0001 pré-método e R-0003
// fechada com PC-0001, `package.json` com DEVAI 1.5.6); os testes individuais mutam essa árvore
// para os casos positivos/negativos de cada `C-01-nn`.
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

export function mkTempRoot(prefix = 'state-index-') {
  return mkdtempSync(join(tmpdir(), prefix));
}

export function cleanupRoot(root) {
  rmSync(root, { recursive: true, force: true });
}

export function writeFile(root, relPath, content) {
  const full = join(root, relPath);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, content, 'utf8');
  return full;
}

export function readFile(root, relPath) {
  return readFileSync(join(root, relPath), 'utf8');
}

export function mkDir(root, relPath) {
  mkdirSync(join(root, relPath), { recursive: true });
}

export const ADR_0001_TEXT = `# ADR-0001: Alpha Decision

## Status

Accepted on 2026-01-01 by Owner decision.

## Context

Fixture context for ADR-0001.

## Decision

Fixture decision text.

## Consequences

Fixture consequences text.
`;

export const ADR_0002_TEXT = `# ADR-0002: Beta Decision

## Status

Accepted on 2026-01-02 by Owner decision.

## Context

Fixture context for ADR-0002.

## Decision

Fixture decision text.

## Consequences

Fixture consequences text.
`;

export const ADR_README_TEXT = `# ADR index (fixture)

| ADR | Título | Status | Vigência |
| --- | --- | --- | --- |
| [ADR-0001](ADR-0001-alpha-decision.md) | Alpha decision fixture. | Accepted | — |
| [ADR-0002](ADR-0002-beta-decision.md) | Beta decision fixture. | Accepted | — |

## Aliases

Números renumerados pela ADR-0035. Nenhum redirecionamento nesta fixture base.

| Número antigo | Redirecionamento | Número novo | Arquivo novo |
| --- | --- | --- | --- |
`;

export const DESIGN_DECISIONS_TEXT = `# DESIGN-DECISIONS (fixture)

| ADR | Decisão | Status | Vigência |
| --- | --- | --- | --- |
| [ADR-0001](docs/meta/adr/ADR-0001-alpha-decision.md) | Alpha decision fixture. | Accepted | — |
| [ADR-0002](docs/meta/adr/ADR-0002-beta-decision.md) | Beta decision fixture. | Accepted | — |
`;

export const LAW_ADR_README_PENDING_TEXT = `# adr (fixture)

**Authority:** Architect (Constitution Article 6).

Destino da série pendente de OD-R18-001.
`;

export const LAW_ADR_README_DISTINCT_TEXT = `# adr (fixture)

**Authority:** Architect (Constitution Article 6).

Série DEVAI distinta, com prefixo \`LAW-ADR-\` nos índices (OD-R18-001, opção b).
`;

export const LAW_ADR_README_MIGRATED_TEXT = `# adr (fixture)

**Authority:** Architect (Constitution Article 6).

Série migrada para \`docs/meta/adr/\` (OD-R18-001, opção a); os arquivos daqui são
redirecionamentos.
`;

export const ROUNDS_README_TEXT = `# rounds (fixture)

Governed by DEVAI 1.5.6.

| Rodada | Frente / escopo | Estado | PRs de merge | PC | Maestro |
| --- | --- | --- | --- | --- | --- |
| R-0001 | fixture pré-método | pré-método | — | — | — |
| R-0003 | fixture fechada | fechada | #1 | PC-0001 | Fixture |
`;

export function basePackageJson(devaiVersion = '1.5.6') {
  return JSON.stringify(
    {
      name: 'fixture',
      devDependencies: { '@aarusso-nyx/devai': devaiVersion },
    },
    null,
    2,
  );
}

export function baseConfig(overrides = {}) {
  return JSON.stringify(
    {
      schemaVersion: 1,
      lawAdrMode: 'pending',
      statusExceptions: {},
      preMethodRounds: ['R-0001'],
      ...overrides,
    },
    null,
    2,
  );
}

export const CONFIG_PATH = 'tools/docs/state-index/config.json';

export function buildBaseTree(root, { config } = {}) {
  writeFile(root, 'docs/meta/adr/ADR-0001-alpha-decision.md', ADR_0001_TEXT);
  writeFile(root, 'docs/meta/adr/ADR-0002-beta-decision.md', ADR_0002_TEXT);
  writeFile(root, 'docs/meta/adr/README.md', ADR_README_TEXT);
  writeFile(root, 'DESIGN-DECISIONS.md', DESIGN_DECISIONS_TEXT);
  writeFile(root, 'law/adr/README.md', LAW_ADR_README_PENDING_TEXT);
  writeFile(root, 'work/rounds/README.md', ROUNDS_README_TEXT);
  mkDir(root, 'work/rounds/R-0001');
  mkDir(root, 'work/rounds/R-0003');
  writeFile(
    root,
    'record/proofs/compliance/closures/PC-0001.json',
    JSON.stringify({ id: 'PC-0001', round_id: 'R-0003' }, null, 2),
  );
  writeFile(root, 'package.json', basePackageJson());
  writeFile(root, CONFIG_PATH, config ?? baseConfig());
  return root;
}

/** Extrai as linhas `<id> <arquivo>[:<linha>] <mensagem>` de stdout+stderr combinados. */
export function parseFindings(output) {
  const findings = [];
  for (const line of output.split('\n')) {
    const match = /^(C-01-\d{2})\s+(\S+)\s+(.*)$/.exec(line.trim());
    if (match) {
      findings.push({ id: match[1], file: match[2], message: match[3] });
    }
  }
  return findings;
}

export function findingIds(output) {
  return new Set(parseFindings(output).map((f) => f.id));
}
