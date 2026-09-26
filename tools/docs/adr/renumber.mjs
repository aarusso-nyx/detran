#!/usr/bin/env node
// R-0018 TASK-0003 (Engineer, Art. 6). CTG-0001 §3, §5, §6.2, §6.3, §6.6 (C-01-28…C-01-35):
// renumeração de ADRs. Node ESM sem dependências. Ver CTG-0001 para a especificação completa.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

class UsageError extends Error {}

// ---------------------------------------------------------------------------
// Helpers replicados de check.mjs (deliberadamente independentes: cada ferramenta é um script Node
// ESM autônomo, sem dependências entre si).
// ---------------------------------------------------------------------------

function firstStatusLine(text) {
  const lines = text.split('\n').map((l) => l.replace(/\r$/, ''));
  const idx = lines.findIndex((l) => l.trim() === '## Status');
  if (idx === -1) return null;
  for (let i = idx + 1; i < lines.length; i++) {
    const t = lines[i].trim();
    if (t !== '') return { raw: t };
  }
  return null;
}

function stripBoldPrefix(s) {
  if (s.startsWith('**')) {
    const close = s.indexOf('**', 2);
    if (close !== -1) return s.slice(2, close) + s.slice(close + 2);
    return s.slice(2);
  }
  return s;
}

const STUB_LINE_RE = /^Renumerada para \[(ADR-\d{4})\]\(([^)\s]+)\)\.$/;

function parseStubLine(text) {
  const status = firstStatusLine(text);
  if (!status) return null;
  const first = stripBoldPrefix(status.raw);
  const m = STUB_LINE_RE.exec(first);
  if (!m) return null;
  return { newId: m[1], linkTarget: m[2] };
}

const BUILTIN_HISTORICAL_PREFIXES = [
  'record/',
  '.devai/state/',
  'docs/reference/',
];

function idFromPath(relPath) {
  const base = path.posix.basename(relPath);
  const m = /^(ADR-\d{4})-/.exec(base);
  return m ? m[1] : null;
}

function stemFromPath(relPath) {
  const base = path.posix.basename(relPath);
  return base.endsWith('.md') ? base.slice(0, -3) : base;
}

// ---------------------------------------------------------------------------
// Configuração
// ---------------------------------------------------------------------------

function isUnderAnyPrefix(relPath, prefixes) {
  return prefixes.some((p) => relPath.startsWith(p));
}

function validateConfig(config) {
  const errors = [];
  const historicalPrefixes = [
    ...BUILTIN_HISTORICAL_PREFIXES,
    ...(config.historicalPrefixes ?? []),
  ];
  const outOfLockPrefixes = config.outOfLockPrefixes ?? [];
  for (const lp of config.livePaths ?? []) {
    if (
      isUnderAnyPrefix(lp, historicalPrefixes) ||
      isUnderAnyPrefix(lp, outOfLockPrefixes)
    ) {
      errors.push(`livePath sob prefixo proibido (§5.5): ${lp}`);
    }
  }
  return errors;
}

// ---------------------------------------------------------------------------
// Templates §3.2/§3.3
// ---------------------------------------------------------------------------

function buildHeader(entry, config, newH1) {
  const policyLink = path.posix.relative(
    path.posix.dirname(entry.to),
    config.policyAdr,
  );
  return (
    `${newH1}\n\n` +
    `> **Proveniência.** Renumerada de \`${entry.from}\` em R-0018 (CTG-0001), pela política da\n` +
    `> [ADR-0035](${policyLink}).\n` +
    `> ${entry.reason}\n` +
    `> O texto abaixo da linha horizontal é o original, byte a byte, inclusive o título com o número\n` +
    `> antigo.\n\n---\n\n`
  );
}

function buildStub(entry, config, origH1) {
  const newLink = path.posix.relative(path.posix.dirname(entry.from), entry.to);
  const policyLink = path.posix.relative(
    path.posix.dirname(entry.from),
    config.policyAdr,
  );
  return (
    `${origH1}\n\n## Status\n\nRenumerada para [${entry.newId}](${newLink}).\n\n` +
    `Redirecionamento sem conteúdo normativo, pela política da [ADR-0035](${policyLink}).\n` +
    `${entry.reason}\n`
  );
}

// ---------------------------------------------------------------------------
// Reescrita de citações em livePaths (§5.2)
// ---------------------------------------------------------------------------

function computeEntryMeta(entry) {
  return {
    ...entry,
    oldId: idFromPath(entry.from),
    newId: idFromPath(entry.to),
    oldStem: stemFromPath(entry.from),
    newStem: stemFromPath(entry.to),
    sameDir: path.posix.dirname(entry.from) === path.posix.dirname(entry.to),
  };
}

/** Slugs (nome do arquivo sem `ADR-nnnn-` nem `.md`) de todo arquivo existente em
 * docs/meta/adr/ para um dado `oldId`, medidos no estado atual do disco. */
function buildSlugMap(root) {
  const dirAbs = path.join(root, 'docs/meta/adr');
  const map = new Map();
  if (!fs.existsSync(dirAbs)) return map;
  for (const name of fs.readdirSync(dirAbs)) {
    const m = /^(ADR-\d{4})-(.+)\.md$/.exec(name);
    if (!m) continue;
    const [, id, slug] = m;
    if (!map.has(id)) map.set(id, new Set());
    map.get(id).add(slug);
  }
  return map;
}

function processLine(line, entry, knownSlugs) {
  const { oldId, newId, oldStem, newStem, sameDir } = entry;
  const linkRe = /\[([^\]]*)\]\(([^)\s]+)\)/g;
  const parts = [];
  let lastIndex = 0;
  let m;
  const events = [];
  while ((m = linkRe.exec(line))) {
    const [full, linkText, target] = m;
    const start = m.index;
    const end = start + full.length;
    parts.push({ text: line.slice(lastIndex, start), consumed: false });
    const cleanTarget = target.split('#')[0];
    const targetBase = cleanTarget.split('/').pop();
    if (targetBase.startsWith(`${oldId}-`) && targetBase.endsWith('.md')) {
      const targetStem = targetBase.slice(0, -3);
      if (targetStem === oldStem) {
        if (sameDir) {
          const rewrittenTarget = target.split(oldStem).join(newStem);
          const rewrittenText = linkText.split(oldId).join(newId);
          parts.push({
            text: `[${rewrittenText}](${rewrittenTarget})`,
            consumed: true,
          });
          events.push({ type: 'REWRITE' });
        } else {
          parts.push({ text: full, consumed: true });
          events.push({ type: 'REVIEW', reason: 'com slug fora do diretório' });
        }
      } else {
        // Citação com o slug do arquivo que conserva o número (ou de outro arquivo existente):
        // intocada e não listada.
        parts.push({ text: full, consumed: true });
      }
    } else {
      parts.push({ text: full, consumed: false });
    }
    lastIndex = end;
  }
  parts.push({ text: line.slice(lastIndex), consumed: false });

  if (sameDir) {
    for (const part of parts) {
      if (!part.consumed && part.text.includes(oldStem)) {
        part.text = part.text.split(oldStem).join(newStem);
      }
    }
  }

  const bareRe = new RegExp(`${oldId}(?!\\d)`, 'g');
  const slugs = knownSlugs ?? new Set();
  for (const part of parts) {
    if (part.consumed) continue;
    bareRe.lastIndex = 0;
    let bm;
    while ((bm = bareRe.exec(part.text))) {
      const after = part.text.slice(bm.index + oldId.length);
      const slugMatch = /^-([a-z0-9-]+)/.exec(after);
      let isKnownSlug = false;
      if (slugMatch) {
        const candidate = slugMatch[1];
        isKnownSlug = [...slugs].some(
          (s) =>
            candidate === s ||
            candidate.startsWith(`${s}-`) ||
            candidate.startsWith(`${s}.`),
        );
      }
      if (!isKnownSlug) {
        events.push({ type: 'REVIEW', reason: 'sem slug' });
      }
    }
  }

  const outputLine = parts.map((p) => p.text).join('');
  return { outputLine, events };
}

function processLivePathContent(text, entries, slugMap) {
  const lines = text.split('\n');
  const allEvents = [];
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    for (const entry of entries) {
      const knownSlugs = slugMap.get(entry.oldId);
      const { outputLine, events } = processLine(line, entry, knownSlugs);
      line = outputLine;
      for (const ev of events) {
        allEvents.push({ lineNumber: i + 1, entry, ...ev });
      }
    }
    lines[i] = line;
  }
  return { newText: lines.join('\n'), events: allEvents };
}

// ---------------------------------------------------------------------------
// Análise de entradas (MOVE/STUB/SKIP/erro)
// ---------------------------------------------------------------------------

function analyzeEntry(root, entry) {
  const fromAbs = path.join(root, entry.from);
  const toAbs = path.join(root, entry.to);
  const fromExists = fs.existsSync(fromAbs);
  if (!fromExists) {
    return { status: 'error', message: `from ausente: ${entry.from}` };
  }
  const fromBuffer = fs.readFileSync(fromAbs);
  const fromText = fromBuffer.toString('utf8');
  const firstLine = fromText.split('\n')[0];
  const stubLine = parseStubLine(fromText);
  const toExists = fs.existsSync(toAbs);

  if (stubLine && stubLine.newId === entry.newId) {
    if (!toExists) {
      return {
        status: 'error',
        message: `to ausente apesar de from já ser stub: ${entry.to}`,
      };
    }
    const toText = fs.readFileSync(toAbs, 'utf8');
    const provenanceLine = toText.split('\n')[2] ?? '';
    const expectedPrefix = `> **Proveniência.** Renumerada de \`${entry.from}\``;
    if (!provenanceLine.startsWith(expectedPrefix)) {
      return {
        status: 'error',
        message: `to inconsistente com stub já aplicado: ${entry.to}`,
      };
    }
    return { status: 'skip' };
  }
  if (stubLine) {
    return {
      status: 'error',
      message: `from já é stub para outro id (${stubLine.newId}): ${entry.from}`,
    };
  }
  if (toExists) {
    return {
      status: 'error',
      message: `to existe sem ser o resultado já aplicado: ${entry.to}`,
    };
  }
  return { status: 'pending', fromBuffer, fromText, firstLine };
}

// ---------------------------------------------------------------------------
// Plano completo
// ---------------------------------------------------------------------------

function computePlan(root, config) {
  const errors = validateConfig(config);
  const entries = (config.entries ?? []).map(computeEntryMeta);
  if (errors.length) {
    return {
      lines: [],
      pending: 0,
      review: 0,
      errors,
      analyzed: [],
      livePathOutputs: [],
    };
  }

  const analyzed = entries.map((entry) => ({
    entry,
    result: analyzeEntry(root, entry),
  }));
  for (const { entry, result } of analyzed) {
    if (result.status === 'error') errors.push(result.message);
  }
  if (errors.length) {
    return {
      lines: [],
      pending: 0,
      review: 0,
      errors,
      analyzed: [],
      livePathOutputs: [],
    };
  }

  const lines = [];
  let pending = 0;
  for (const { entry, result } of analyzed) {
    if (result.status === 'skip') {
      lines.push(`SKIP ${entry.from} -> ${entry.newId}`);
    } else {
      lines.push(`MOVE ${entry.from} -> ${entry.to}`);
      lines.push(`STUB ${entry.from} -> ${entry.newId}`);
      pending += 2;
    }
  }

  const slugMap = buildSlugMap(root);
  let review = 0;
  const livePathOutputs = [];
  for (const lp of config.livePaths ?? []) {
    const abs = path.join(root, lp);
    if (!fs.existsSync(abs)) {
      errors.push(`livePath ausente: ${lp}`);
      continue;
    }
    const text = fs.readFileSync(abs, 'utf8');
    const { newText, events } = processLivePathContent(text, entries, slugMap);
    for (const ev of events) {
      if (ev.type === 'REWRITE') {
        lines.push(
          `REWRITE ${lp}:${ev.lineNumber} ${ev.entry.oldId} -> ${ev.entry.newId}`,
        );
        pending += 1;
      } else {
        lines.push(
          `REVIEW ${lp}:${ev.lineNumber} ${ev.entry.oldId} ${ev.reason}`,
        );
        review += 1;
      }
    }
    livePathOutputs.push({ lp, newText, changed: newText !== text });
  }
  if (errors.length) {
    return {
      lines: [],
      pending: 0,
      review: 0,
      errors,
      analyzed: [],
      livePathOutputs: [],
    };
  }

  return { lines, pending, review, errors: [], analyzed, livePathOutputs };
}

export function planRenumber({ root, config }) {
  const plan = computePlan(root, config);
  if (plan.errors.length) {
    return { lines: [], pending: 0, review: 0, errors: plan.errors };
  }
  return {
    lines: [
      ...plan.lines,
      `adr:renumber dry-run: ${plan.pending} pending, ${plan.review} review`,
    ],
    pending: plan.pending,
    review: plan.review,
    errors: [],
  };
}

export function applyRenumber({ root, config }) {
  const plan = computePlan(root, config);
  if (plan.errors.length) {
    return { lines: [], pending: 0, review: 0, errors: plan.errors };
  }

  for (const { entry, result } of plan.analyzed) {
    if (result.status !== 'pending') continue;
    const newH1 = result.firstLine.replace(entry.oldId, entry.newId);
    const header = buildHeader(entry, config, newH1);
    const toAbs = path.join(root, entry.to);
    fs.mkdirSync(path.dirname(toAbs), { recursive: true });
    fs.writeFileSync(toAbs, header + result.fromText, 'utf8');
    const stub = buildStub(entry, config, result.firstLine);
    fs.writeFileSync(path.join(root, entry.from), stub, 'utf8');
  }
  for (const { lp, newText, changed } of plan.livePathOutputs) {
    if (changed) fs.writeFileSync(path.join(root, lp), newText, 'utf8');
  }

  return {
    lines: [
      ...plan.lines,
      `adr:renumber write: ${plan.pending} applied, ${plan.review} review`,
    ],
    pending: plan.pending,
    review: plan.review,
    errors: [],
  };
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const opts = { root: null, config: null, write: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--') continue;
    else if (arg === '--root') opts.root = argv[++i];
    else if (arg === '--config') opts.config = argv[++i];
    else if (arg === '--write') opts.write = true;
    else throw new UsageError(`argumento desconhecido: ${arg}`);
  }
  return opts;
}

function main() {
  let opts;
  try {
    opts = parseArgs(process.argv.slice(2));
  } catch (err) {
    process.stderr.write(`adr:renumber: erro: ${err.message}\n`);
    process.exit(2);
    return;
  }
  const root = opts.root
    ? path.resolve(opts.root)
    : path.resolve(here, '../../..');
  const configPath = opts.config
    ? path.resolve(opts.config)
    : path.join(root, 'tools/docs/adr/renumber.config.json');

  let config;
  try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (err) {
    process.stderr.write(
      `adr:renumber: erro: config inválido: ${err.message}\n`,
    );
    process.exit(2);
    return;
  }

  let result;
  try {
    result = opts.write
      ? applyRenumber({ root, config })
      : planRenumber({ root, config });
  } catch (err) {
    process.stderr.write(`adr:renumber: erro: ${err.message}\n`);
    process.exit(2);
    return;
  }
  if (result.errors.length) {
    process.stderr.write(`adr:renumber: erro: ${result.errors[0]}\n`);
    process.exit(2);
    return;
  }
  process.stdout.write(result.lines.join('\n') + '\n');
  process.exit(0);
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main();
}
