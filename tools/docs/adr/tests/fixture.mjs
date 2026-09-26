// R-0018 TASK-0002 (Inspector, Art. 6). CTG-0001 §3, §5, §6.3, §7.6: construtor da árvore mínima
// para os testes de `tools/docs/adr/renumber.mjs`, em diretório temporário
// (`fs.mkdtempSync(os.tmpdir())`). Nunca escreve na árvore real do repositório; `--write` só roda
// sobre esses diretórios temporários.
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

export function mkTempRoot(prefix = 'adr-renumber-') {
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

export function readFileBuffer(root, relPath) {
  return readFileSync(join(root, relPath));
}

export function existsRel(root, relPath) {
  try {
    readFileSync(join(root, relPath));
    return true;
  } catch {
    return false;
  }
}

// Um único mapeamento de renumeração (número 0006 fixture "renumerado" para 0036), reaproveitando
// a estrutura do exemplo real do contrato (§3.2/§3.3) com nomes de fixture.
export const FROM_PATH = 'docs/meta/adr/ADR-0006-ops-field-fixture.md';
export const TO_PATH = 'docs/meta/adr/ADR-0036-ops-field-fixture.md';
export const POLICY_PATH = 'docs/meta/adr/ADR-0035-adr-numbering-policy.md';
export const KEPT_PATH = 'docs/meta/adr/ADR-0006-kept-fixture.md';
export const LIVE_PATH = 'docs/some/livepath.md';
export const HISTORICAL_PATH = 'work/rounds/R-0005/note.md';
export const OUT_OF_LOCK_PATH = 'backend/domain/note.ts';

export const REASON =
  'O número ADR-0006 permanece com a fixture `ADR-0006-kept-fixture.md`, que entrou antes na história first-parent.';

export const ORIGINAL_H1 = '# ADR-0006: Ops Field Fixture';
export const NEW_H1 = '# ADR-0036: Ops Field Fixture';

export const ORIGINAL_BODY = `${ORIGINAL_H1}

## Status

Accepted on 2026-08-24 by Owner decision.

## Context

Fixture context.

## Decision

Fixture decision.

## Consequences

Fixture consequences.
`;

export function policyLinkFromTo() {
  // dirname(TO_PATH) === dirname(POLICY_PATH): mesmo diretório.
  return 'ADR-0035-adr-numbering-policy.md';
}

export function policyLinkFromFrom() {
  // dirname(FROM_PATH) === dirname(POLICY_PATH): mesmo diretório.
  return 'ADR-0035-adr-numbering-policy.md';
}

export function expectedHeader() {
  return `${NEW_H1}

> **Proveniência.** Renumerada de \`${FROM_PATH}\` em R-0018 (CTG-0001), pela política da
> [ADR-0035](${policyLinkFromTo()}).
> ${REASON}
> O texto abaixo da linha horizontal é o original, byte a byte, inclusive o título com o número
> antigo.

---

`;
}

export function expectedToContent() {
  return expectedHeader() + ORIGINAL_BODY;
}

export function expectedStubContent() {
  return `${ORIGINAL_H1}

## Status

Renumerada para [ADR-0036](ADR-0036-ops-field-fixture.md).

Redirecionamento sem conteúdo normativo, pela política da [ADR-0035](${policyLinkFromFrom()}).
${REASON}
`;
}

export const LIVEPATH_LINE_SLUG = `Ver [ADR-0006](../adr/${FROM_PATH.split('/').pop()}) para o escopo da fixture.`;
export const LIVEPATH_LINE_BARE =
  'Também citado como ADR-0006 sem link em outro trecho da fixture.';
export const LIVEPATH_LINE_KEPT = `Número que fica: [ADR-0006](../adr/${KEPT_PATH.split('/').pop()}) permanece igual.`;
export const LIVEPATH_LINE_PERSISTED =
  'O identificador persistido ADR-0006-2026-08-24 não é uma citação.';

export function livePathText() {
  return `${LIVEPATH_LINE_SLUG}\n${LIVEPATH_LINE_BARE}\n${LIVEPATH_LINE_KEPT}\n${LIVEPATH_LINE_PERSISTED}\n`;
}

export function baseRenumberConfig(overrides = {}) {
  return JSON.stringify(
    {
      schemaVersion: 1,
      policyAdr: POLICY_PATH,
      entries: [{ from: FROM_PATH, to: TO_PATH, reason: REASON }],
      livePaths: [LIVE_PATH],
      historicalPrefixes: ['work/rounds/R-0005/'],
      outOfLockPrefixes: ['backend/'],
      ...overrides,
    },
    null,
    2,
  );
}

export const CONFIG_PATH = 'tools/docs/adr/renumber.config.json';

export function buildBaseTree(root, { config } = {}) {
  writeFile(root, FROM_PATH, ORIGINAL_BODY);
  writeFile(
    root,
    KEPT_PATH,
    '# ADR-0006: Kept Fixture\n\n## Status\n\nAccepted on 2026-08-24.\n',
  );
  writeFile(
    root,
    POLICY_PATH,
    '# ADR-0035: Adr Numbering Policy\n\n## Status\n\nProposed on 2026-09-26.\n',
  );
  writeFile(root, LIVE_PATH, livePathText());
  writeFile(root, HISTORICAL_PATH, livePathText());
  writeFile(root, OUT_OF_LOCK_PATH, `// ${LIVEPATH_LINE_SLUG}\n`);
  writeFile(root, CONFIG_PATH, config ?? baseRenumberConfig());
  return root;
}

/** Fotografia recursiva (relPath -> conteúdo utf8) de todos os arquivos sob `root`. */
export function snapshotTree(root) {
  const snapshot = {};
  function walk(dir) {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      const stat = statSync(full);
      if (stat.isDirectory()) {
        walk(full);
      } else {
        snapshot[full.slice(root.length + 1)] = readFileSync(full, 'utf8');
      }
    }
  }
  walk(root);
  return snapshot;
}
