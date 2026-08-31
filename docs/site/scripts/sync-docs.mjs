#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const siteRoot = resolve(here, '..');
const repoRoot = resolve(siteRoot, '../..');
const sourceDocs = join(repoRoot, 'docs');
const siteDocs = join(siteRoot, 'docs');
const staticAssets = join(siteRoot, 'static/docs-assets');
const githubBlob = 'https://github.com/aarusso-nyx/detran/blob/main/';
const sections = [
  'start',
  'theory',
  'framework',
  'roles',
  'adopters',
  'reference',
  'meta',
];
const markdownTargets = new Map();
const assetTargets = new Map();
const targetOwners = new Map();
const frontmatterOverrides = new Map();
let publicationPolicy;
let publishedLegalMarkdown;

function toPosix(path) {
  return path.split(sep).join('/');
}

function publishedName(name) {
  return name === 'README.md' ? 'index.md' : name;
}

function repoRelative(path) {
  return toPosix(relative(repoRoot, path));
}

function frontmatterStatus(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n/u);
  if (match === null) return undefined;
  const status = match[1].match(/^status:\s*["']?([^\s"']+)["']?\s*$/mu);
  return status?.[1];
}

function isWithin(relativePath, root) {
  return relativePath === root || relativePath.startsWith(`${root}/`);
}

function excludeDirectory(source) {
  const sourceRelative = repoRelative(source);
  return (
    sourceRelative.split('/').includes('_intake') ||
    isWithin(sourceRelative, 'docs/meta/knowledge-base') ||
    isWithin(sourceRelative, 'docs/reference/institutional')
  );
}

async function publishFile(source) {
  const sourceRelative = repoRelative(source);
  if (/\.(?:pdf|html|txt|docx)$/iu.test(sourceRelative)) return false;
  if (isWithin(sourceRelative, 'docs/reference/legal')) {
    return publishedLegalMarkdown.has(sourceRelative);
  }
  if (!/\.mdx?$/iu.test(sourceRelative)) return true;

  const content = await fs.readFile(source, 'utf8');
  const status = frontmatterStatus(content);
  if (status === 'draft' || status === 'stub') return false;
  if (
    publicationPolicy.product.roots.some((root) =>
      isWithin(sourceRelative, root),
    )
  ) {
    return publicationPolicy.product.statuses.includes(status);
  }
  return true;
}

async function loadPublicationPolicy() {
  publicationPolicy = JSON.parse(
    await fs.readFile(join(sourceDocs, '_ia/publication.json'), 'utf8'),
  );
  publishedLegalMarkdown = new Set([publicationPolicy.legal.catalog]);
  if (publicationPolicy.legal.publishCatalogEntries) {
    const catalog = resolve(repoRoot, publicationPolicy.legal.catalog);
    const content = await fs.readFile(catalog, 'utf8');
    for (const match of content.matchAll(/\]\(([^)\s#]+\.md)(?:#[^)]*)?\)/gu)) {
      const target = resolve(dirname(catalog), match[1]);
      const targetRelative = repoRelative(target);
      if (!isWithin(targetRelative, 'docs/reference/legal')) {
        throw new Error(`legal catalog target escapes legal root: ${match[1]}`);
      }
      publishedLegalMarkdown.add(targetRelative);
    }
  }
}

function claimTarget(source, target) {
  const prior = targetOwners.get(target);
  if (prior !== undefined && prior !== source) {
    throw new Error(
      `publication target collision: ${toPosix(relative(repoRoot, prior))} and ${toPosix(
        relative(repoRoot, source),
      )} both map to ${toPosix(relative(siteRoot, target))}`,
    );
  }
  targetOwners.set(target, source);
}

async function collectTree(source, docsTarget, assetTarget) {
  for (const entry of await fs.readdir(source, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const src = join(source, entry.name);
    if (entry.isDirectory()) {
      if (excludeDirectory(src)) continue;
      await collectTree(
        src,
        join(docsTarget, entry.name),
        join(assetTarget, entry.name),
      );
      continue;
    }
    if (!(await publishFile(src))) continue;
    if (/\.mdx?$/iu.test(entry.name)) {
      const target = join(docsTarget, publishedName(entry.name));
      claimTarget(src, target);
      markdownTargets.set(src, target);
    } else {
      const target = join(assetTarget, entry.name);
      claimTarget(src, target);
      assetTargets.set(src, target);
    }
  }
}

function splitLink(raw) {
  const match = raw.match(/^([^#?]+)(.*)$/u);
  return match === null ? null : { path: match[1], suffix: match[2] };
}

function rewriteLinks(content, source, target) {
  return content.replace(
    /(!?\[[^\]]*\]\()([^)\s]+)(\))/gu,
    (whole, open, raw, close) => {
      if (/^(?:https?:|mailto:|data:|#)/u.test(raw)) return whole;
      const parts = splitLink(raw);
      if (parts === null) return whole;
      const resolved = resolve(dirname(source), decodeURIComponent(parts.path));
      const mappedDoc =
        markdownTargets.get(resolved) ??
        markdownTargets.get(join(resolved, 'README.md')) ??
        markdownTargets.get(join(resolved, 'index.md'));
      if (mappedDoc !== undefined) {
        let rel = toPosix(relative(dirname(target), mappedDoc));
        if (!rel.startsWith('.')) rel = `./${rel}`;
        return `${open}${rel}${parts.suffix}${close}`;
      }
      const mappedAsset = assetTargets.get(resolved);
      if (mappedAsset !== undefined) {
        const rel = toPosix(relative(join(siteRoot, 'static'), mappedAsset));
        return `${open}/detran/${rel}${parts.suffix}${close}`;
      }
      if (resolved.startsWith(repoRoot) && !resolved.startsWith(siteRoot)) {
        const repoRel = toPosix(relative(repoRoot, resolved));
        return `${open}${githubBlob}${repoRel}${parts.suffix}${close}`;
      }
      return whole;
    },
  );
}

function projectFrontmatter(content, overrides, source) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n/u);
  if (match === null && overrides !== undefined) {
    throw new Error(
      `frontmatter override requires YAML frontmatter: ${toPosix(relative(repoRoot, source))}`,
    );
  }
  if (match === null) return content;

  const publishedFrontmatter = [];
  for (const [key, value] of Object.entries(overrides ?? {})) {
    if (typeof value !== 'string' || !/^[a-z][a-z0-9_-]*$/u.test(key)) {
      throw new Error(
        `invalid frontmatter override for ${toPosix(relative(repoRoot, source))}`,
      );
    }
    publishedFrontmatter.push(`${key}: ${JSON.stringify(value)}`);
  }
  const controlled =
    publishedFrontmatter.length === 0
      ? ''
      : `---\n${publishedFrontmatter.join('\n')}\n---\n`;
  const preserved = `<details><summary>Source metadata</summary>\n\n\`\`\`yaml\n${match[1]}\n\`\`\`\n\n</details>\n\n`;
  return `${controlled}${preserved}${content.slice(match[0].length)}`;
}

async function copyPublishedTrees() {
  for (const [source, target] of markdownTargets.entries()) {
    await fs.mkdir(dirname(target), { recursive: true });
    const content = projectFrontmatter(
      await fs.readFile(source, 'utf8'),
      frontmatterOverrides.get(source),
      source,
    );
    await fs.writeFile(target, rewriteLinks(content, source, target));
  }
  for (const [source, target] of assetTargets.entries()) {
    await fs.mkdir(dirname(target), { recursive: true });
    await fs.copyFile(source, target);
  }
}

async function collectAllowlist(entries) {
  for (const entry of entries) {
    const source = resolve(repoRoot, entry.source);
    const target = resolve(siteDocs, entry.dest);
    if (!source.startsWith(repoRoot) || !target.startsWith(siteDocs)) {
      throw new Error(
        `invalid publication mapping: ${entry.source} -> ${entry.dest}`,
      );
    }
    const stat = await fs.stat(source);
    if (!stat.isFile())
      throw new Error(`publication source is not a file: ${entry.source}`);
    claimTarget(source, target);
    if (/\.mdx?$/iu.test(source)) {
      markdownTargets.set(source, target);
      if (entry.frontmatter !== undefined)
        frontmatterOverrides.set(source, entry.frontmatter);
    } else assetTargets.set(source, join(staticAssets, entry.dest));
  }
}

async function emitCategories(manifest) {
  for (const section of manifest.sections) {
    const dir = join(siteDocs, section.id);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(
      join(dir, '_category_.json'),
      `${JSON.stringify({ label: section.label, position: section.position }, null, 2)}\n`,
    );
  }
  for (const [path, category] of Object.entries(manifest.categories)) {
    const dir = join(siteDocs, path);
    try {
      if (!(await fs.stat(dir)).isDirectory()) continue;
    } catch {
      continue;
    }
    await fs.writeFile(
      join(dir, '_category_.json'),
      `${JSON.stringify(category, null, 2)}\n`,
    );
  }
}

async function ensureDirectoryIndexes(dir = siteDocs) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name);
  const dirs = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
  for (const name of dirs) await ensureDirectoryIndexes(join(dir, name));
  if (files.includes('index.md')) return;

  const docFiles = files
    .filter((name) => /\.mdx?$/iu.test(name))
    .sort((a, b) => a.localeCompare(b));
  const indexableDirs = [];
  for (const name of dirs) {
    try {
      await fs.stat(join(dir, name, 'index.md'));
      indexableDirs.push(name);
    } catch {
      // Directories with no documentation remain unpublished navigation details.
    }
  }
  if (docFiles.length === 0 && indexableDirs.length === 0) return;

  const relDir = toPosix(relative(siteDocs, dir));
  const title =
    relDir.length === 0
      ? 'DETRAN documentation'
      : relDir.split('/').join(' / ');
  const lines = [`# ${title}`, ''];
  if (indexableDirs.length > 0) {
    lines.push('## Sections', '');
    for (const name of indexableDirs)
      lines.push(`- [${name}](./${name}/index.md)`);
    lines.push('');
  }
  if (docFiles.length > 0) {
    lines.push('## Pages', '');
    for (const name of docFiles) {
      const stem = name.replace(/\.mdx?$/iu, '');
      lines.push(`- [${stem}](./${name})`);
    }
    lines.push('');
  }
  await fs.writeFile(join(dir, 'index.md'), lines.join('\n'));
}

async function main() {
  await loadPublicationPolicy();
  const manifest = JSON.parse(
    await fs.readFile(join(sourceDocs, '_ia/categories.json'), 'utf8'),
  );
  await fs.rm(siteDocs, { recursive: true, force: true });
  await fs.rm(staticAssets, { recursive: true, force: true });

  for (const section of sections) {
    const source = join(sourceDocs, section);
    await fs.stat(source);
    await collectTree(
      source,
      join(siteDocs, section),
      join(staticAssets, section),
    );
  }
  await collectAllowlist(manifest.rootFileAllowlist);
  await copyPublishedTrees();
  await emitCategories(manifest);
  await ensureDirectoryIndexes();

  console.log(
    `docs sync complete: ${markdownTargets.size} pages, ${assetTargets.size} assets, ${sections.length} sections`,
  );
}

await main();
