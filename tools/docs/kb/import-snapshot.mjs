#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SOURCE_REPO = process.env.DETRAN_REFS_SOURCE;
const SOURCE_REMOTE = 'https://github.com/aarusso-nyx/detran-refs.git';
const SOURCE_BRANCH = 'main';
const SOURCE_COMMIT = 'aa276b8e71866bfa9e012b23ee4a14b6fc6720a3';
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../..');
const manifestPath = path.join(
  root,
  'docs/meta/knowledge-base/import-manifest.json',
);

function git(args, options = {}) {
  return execFileSync('git', ['-C', SOURCE_REPO, ...args], {
    encoding: options.encoding ?? 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function mapPath(sourcePath) {
  if (sourcePath === '.gitignore') return null;
  if (sourcePath === 'README.md') return 'docs/meta/knowledge-base/index.md';
  if (sourcePath === 'CONVENTIONS.md')
    return 'docs/meta/knowledge-base/conventions.md';
  if (sourcePath === 'refs/INDEX.md') return 'docs/reference/legal/index.md';
  if (sourcePath === 'shared/glossary.md')
    return 'docs/framework/glossary/domain.md';
  if (sourcePath === 'shared/actors.md')
    return 'docs/framework/product/shared/actors.md';
  if (sourcePath.startsWith('shared/workflows/')) {
    return `docs/framework/product/shared/${sourcePath.slice('shared/'.length)}`;
  }
  for (const domain of ['inf', 'est', 'ch']) {
    if (sourcePath === domain || sourcePath.startsWith(`${domain}/`)) {
      return `docs/framework/product/domains/${sourcePath}`;
    }
  }
  if (sourcePath === 'transversal' || sourcePath.startsWith('transversal/')) {
    return `docs/framework/product/${sourcePath}`;
  }
  if (sourcePath === 'refs' || sourcePath.startsWith('refs/')) {
    return `docs/reference/legal/${sourcePath.slice('refs/'.length)}`;
  }
  if (sourcePath === 'entregaveis' || sourcePath.startsWith('entregaveis/')) {
    return `docs/reference/institutional/${sourcePath.slice('entregaveis/'.length)}`;
  }
  if (sourcePath === '_meta/check-corpus.py') return 'tools/docs/kb/check.mjs';
  if (sourcePath === '_meta/issues-export.py')
    return 'tools/docs/kb/issues-export.py';
  if (sourcePath === '_meta' || sourcePath.startsWith('_meta/')) {
    return `docs/meta/knowledge-base/${sourcePath.slice('_meta/'.length)}`;
  }
  throw new Error(`No destination mapping for ${sourcePath}`);
}

function rewriteMarkdown(sourcePath, destinationPath, input, sourcePaths) {
  let text = input
    .replace(
      /\/(?:Users|Volumes)\/[^\s`'")]*\/detran-refs/g,
      `repo://detran-refs@${SOURCE_COMMIT}`,
    )
    .replace(
      /\/(?:Users|Volumes)\/[^\s`'")]*\/stech\//g,
      'repo://historical-workspace/',
    );

  text = text.replace(
    /\]\(([^)\s]+)(\s+"[^"]*")?\)/g,
    (whole, rawTarget, title = '') => {
      if (/^(?:https?:|mailto:|file:|repo:|#)/.test(rawTarget)) return whole;
      const [targetWithoutAnchor, anchor = ''] = rawTarget.split('#', 2);
      const trailingSlash = targetWithoutAnchor.endsWith('/');
      const resolved = path.posix.normalize(
        path.posix.join(path.posix.dirname(sourcePath), targetWithoutAnchor),
      );
      const candidate = sourcePaths.has(resolved)
        ? resolved
        : sourcePaths.has(`${resolved}/INDEX.md`)
          ? `${resolved}/INDEX.md`
          : sourcePaths.has(`${resolved}/README.md`)
            ? `${resolved}/README.md`
            : null;
      if (!candidate) return whole;
      const mapped = mapPath(candidate);
      if (!mapped) return whole;
      let relative = path.posix.relative(
        path.posix.dirname(destinationPath),
        mapped,
      );
      if (!relative.startsWith('.')) relative = `./${relative}`;
      if (trailingSlash && !relative.endsWith('/')) relative += '/';
      const suffix = anchor ? `#${anchor}` : '';
      return `](${relative}${suffix}${title})`;
    },
  );
  return text;
}

function adaptIssuesExporter(input) {
  return input
    .replaceAll('_meta/issues-export.py', 'tools/docs/kb/issues-export.py')
    .replace(
      "REGISTER = pathlib.Path(__file__).resolve().parent / 'open-issues.md'",
      "REGISTER = pathlib.Path(__file__).resolve().parents[3] / 'docs' / 'meta' / 'knowledge-base' / 'open-issues.md'",
    )
    .replaceAll(
      '`_meta/open-issues.md`',
      '`docs/meta/knowledge-base/open-issues.md`',
    )
    .replaceAll(
      '`aarusso-nyx/detran-refs` → `_meta/open-issues.md`',
      '`detran` → `docs/meta/knowledge-base/open-issues.md`',
    )
    .replace(
      /Fonte completa e contexto: .*detran-refs.*open-issues\.md`\./,
      'Fonte completa e contexto: `detran` → `docs/meta/knowledge-base/open-issues.md`.',
    );
}

function refreshManifest() {
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  for (const entry of manifest.entries) {
    if (!entry.destinationPath) continue;
    const destination = path.join(root, entry.destinationPath);
    entry.importedDestinationSha256 = sha256(readFileSync(destination));
  }
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`refreshed ${manifest.entries.length} manifest entries`);
}

if (process.argv.includes('--refresh-manifest')) {
  refreshManifest();
  process.exit(0);
}

if (!SOURCE_REPO) {
  throw new Error(
    'Set DETRAN_REFS_SOURCE to a read-only checkout of the approved source commit',
  );
}

if (git(['status', '--porcelain']).trim()) {
  throw new Error('detran-refs has uncommitted work; refusing to import');
}
if (git(['rev-parse', 'HEAD']).trim() !== SOURCE_COMMIT) {
  throw new Error(
    `detran-refs HEAD is not the approved source commit ${SOURCE_COMMIT}`,
  );
}

const sourceTreeSha = git(['rev-parse', `${SOURCE_COMMIT}^{tree}`]).trim();
const sourceFiles = git(['ls-tree', '-r', '--name-only', '-z', SOURCE_COMMIT])
  .split('\0')
  .filter(Boolean);
const sourcePaths = new Set(sourceFiles);
const entries = [];

if (existsSync(manifestPath)) {
  const priorManifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  for (const priorEntry of priorManifest.entries) {
    if (!priorEntry.destinationPath || sourcePaths.has(priorEntry.sourcePath))
      continue;
    const staleDestination = path.join(root, priorEntry.destinationPath);
    if (
      !staleDestination.startsWith(`${root}${path.sep}`) ||
      !existsSync(staleDestination)
    )
      continue;
    unlinkSync(staleDestination);
    console.log(`removed superseded destination ${priorEntry.destinationPath}`);
  }
}

for (const sourcePath of sourceFiles) {
  const sourceBuffer = execFileSync(
    'git',
    ['-C', SOURCE_REPO, 'show', `${SOURCE_COMMIT}:${sourcePath}`],
    { encoding: null, maxBuffer: 64 * 1024 * 1024 },
  );
  const sourceSha256 = sha256(sourceBuffer);
  const destinationPath = mapPath(sourcePath);

  if (!destinationPath) {
    entries.push({
      sourcePath,
      disposition: 'excluded',
      reason: 'source repository infrastructure, not knowledge-base content',
      sourceSha256,
    });
    continue;
  }

  let destinationBuffer = sourceBuffer;
  let disposition = 'imported';
  if (sourcePath.endsWith('.md')) {
    destinationBuffer = Buffer.from(
      rewriteMarkdown(
        sourcePath,
        destinationPath,
        sourceBuffer.toString('utf8'),
        sourcePaths,
      ),
    );
  } else if (sourcePath === '_meta/issues-export.py') {
    destinationBuffer = Buffer.from(
      adaptIssuesExporter(sourceBuffer.toString('utf8')),
    );
    disposition = 'replaced';
  } else if (sourcePath === '_meta/check-corpus.py') {
    destinationBuffer = readFileSync(path.join(root, destinationPath));
    disposition = 'replaced';
  }

  const absoluteDestination = path.join(root, destinationPath);
  mkdirSync(path.dirname(absoluteDestination), { recursive: true });
  writeFileSync(absoluteDestination, destinationBuffer);
  entries.push({
    sourcePath,
    destinationPath,
    disposition,
    sourceSha256,
    importedDestinationSha256: sha256(destinationBuffer),
  });
}

const manifest = {
  schemaVersion: '1.0.0',
  importedOn: '2026-08-31',
  source: {
    repository: 'aarusso-nyx/detran-refs',
    remote: SOURCE_REMOTE,
    branch: SOURCE_BRANCH,
    commit: SOURCE_COMMIT,
    tree: sourceTreeSha,
  },
  policy: {
    historyImported: false,
    continuingSynchronization: false,
    targetAuthority: 'detran/docs',
  },
  baselines: {
    sourceFileCount: sourceFiles.length,
    artifactIdCount: 473,
    sourceReportedCanonicalWorkflowTokenCount: 383,
    canonicalWorkflowTokenCount: 382,
  },
  entries,
};
mkdirSync(path.dirname(manifestPath), { recursive: true });
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(
  `imported ${entries.filter((entry) => entry.destinationPath).length} files`,
);
console.log(
  `excluded ${entries.filter((entry) => !entry.destinationPath).length} files`,
);
console.log(`source tree ${sourceTreeSha}`);
