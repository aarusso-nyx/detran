// R-0033 W3 — Inspector. Real Chrome over the static Portal preview build.
// Routes/personas/IDs are read from the manifest and Inspector inventory, never invented.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import {
  existsSync,
  readdirSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CAPTURE_STATES,
  VIEWPORTS,
  PREVIEW_MARK_SELECTOR,
  loadChromium,
  resolveAxePath,
  startStaticServer,
  watchViolations,
} from '../rait-web/lib.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, '../../../../..');
const reportPath = join(
  repo,
  'work/rounds/R-0033/reports/W3-portal-browser.json',
);
const captureDir = join(here, 'captures');
const canonicalDist = join(repo, 'apps/portal/web/dist/preview');
const dist = resolve(process.env.PREVIEW_DIST ?? canonicalDist);
const require = createRequire(join(repo, 'package.json'));
const ts = require('typescript');
const manifestPath = join(
  repo,
  'apps/portal/web/src/app/app.route-manifest.ts',
);
const transpiled = ts.transpileModule(readFileSync(manifestPath, 'utf8'), {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const { PORTAL_ROUTE_MANIFEST: manifest } = await import(
  `data:text/javascript;base64,${Buffer.from(transpiled).toString('base64')}`
);
const inventoryText = readFileSync(
  join(repo, 'work/rounds/R-0033/inventory-portal-web.md'),
  'utf8',
);
const inventory = new Map();
for (const line of inventoryText.split(/\r?\n/)) {
  if (!/^\|\s*\d+\s*\|/.test(line)) continue;
  const cells = line.split('|');
  const route = /`([^`]+)`/.exec(cells[2] ?? '')?.[1];
  const url = /`([^`]+)`/.exec(cells[7] ?? '')?.[1];
  assert(route && url, `Inventory row has no route/URL: ${line}`);
  assert(!inventory.has(route), `Duplicate inventory route ${route}`);
  inventory.set(route, url);
}
assert.equal(
  manifest.length,
  38,
  'W3 source route population changed; review coverage',
);
assert.equal(inventory.size, manifest.length);
for (const entry of manifest) assert(inventory.has(`/${entry.path}`));
const journey = manifest.filter((entry) =>
  entry.journeys.includes('JRN-PORTAL-001'),
);
assert.equal(journey.length, 8);
assert(
  existsSync(join(dist, 'index.html')),
  'Build Portal preview before running this browser check',
);
mkdirSync(captureDir, { recursive: true });

function buildHashes(dir, prefix = '') {
  return readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const relative = prefix + entry.name;
      return entry.isDirectory()
        ? buildHashes(join(dir, entry.name), relative + '/')
        : [
            {
              file: relative,
              sha256: createHash('sha256')
                .update(readFileSync(join(dir, entry.name)))
                .digest('hex'),
            },
          ];
    })
    .sort((a, b) => a.file.localeCompare(b.file));
}

const report = {
  status: 'running',
  generatedAt: new Date().toISOString(),
  sources: [
    'apps/portal/web/src/app/app.route-manifest.ts',
    'work/rounds/R-0033/inventory-portal-web.md',
  ],
  build: 'apps/portal/web/dist/preview',
  testedBuildDirectory: dist,
  testedBuildFiles: buildHashes(dist),
  networkScope:
    'networkRequests contains only /v1 or /v1/** requests; normal document/bundle/assets requests are allowed',
  browser: 'Google Chrome / Playwright channel chrome',
  expected: {
    routes: 38,
    journeyScreens: 8,
    captures: 8 * CAPTURE_STATES.length * VIEWPORTS.length,
    axe: 8 * CAPTURE_STATES.length,
    guardCounterexamples: 2,
  },
  networkRequests: [],
  consoleErrors: [],
  pageErrors: [],
  routes: [],
  captures: [],
  axe: [],
  guards: [],
  failures: [],
};
let server;
let browser;
function save() {
  writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');
}
function relativePreview(entry, state = 'loaded') {
  const url = new URL(
    inventory.get(`/${entry.path}`),
    'http://preview.invalid',
  );
  url.searchParams.set('pv_estado', state);
  return url.pathname + url.search;
}
async function open(page, url, violations, entry) {
  const response = await page.goto(server.baseUrl + url, { waitUntil: 'load' });
  assert.equal(response?.status(), 200, `Static document ${url}`);
  await page
    .locator(PREVIEW_MARK_SELECTOR)
    .waitFor({ state: 'visible', timeout: 30000 });
  await page.locator('h1').first().waitFor({ state: 'visible' });
  await page.waitForLoadState('networkidle');
  const final = new URL(page.url());
  const expected =
    entry?.serviceKey === 'junta_medica'
      ? '/servico-indisponivel/junta_medica'
      : url;
  assert.equal(
    final.pathname + final.search,
    expected,
    'Final URL must preserve the requested route, except the canonical unavailable service',
  );
  assert.match(
    await page.locator(PREVIEW_MARK_SELECTOR).innerText(),
    /PRÉVIA — DADOS FICTÍCIOS/,
  );
  if (entry) {
    const screen =
      entry.serviceKey === 'junta_medica' ? '' : (entry.screen ?? '');
    const screens = await page
      .locator('[data-screen]')
      .evaluateAll((nodes) =>
        nodes.map((node) => node.getAttribute('data-screen')),
      );
    assert(
      screens.includes(screen),
      `Missing real page data-screen=${screen} on ${url}`,
    );
  }
  assert.equal(violations.length, 0, violations.join('\n'));
  return final.pathname + final.search;
}
try {
  server = await startStaticServer(dist);
  const chromium = await loadChromium();
  browser = await chromium.launch({ channel: 'chrome', headless: true });
  report.browserVersion = browser.version();
  const context = await browser.newContext({ locale: 'pt-BR' });
  const page = await context.newPage();
  const violations = [];
  watchViolations(page, violations);
  page.on('request', (request) => {
    if (/^\/v1(?:\/|$)/.test(new URL(request.url()).pathname))
      report.networkRequests.push({
        method: request.method(),
        url: request.url(),
      });
  });
  page.on('console', (message) => {
    if (message.type() === 'error') report.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => report.pageErrors.push(error.message));
  page.on('dialog', (dialog) => dialog.dismiss());
  await page.setViewportSize({ width: 1280, height: 800 });
  for (const entry of manifest) {
    const url = relativePreview(entry);
    violations.length = 0;
    try {
      const finalUrl = await open(page, url, violations, entry);
      report.routes.push({
        route: entry.path,
        url,
        finalUrl,
        pass: true,
        violations: [...violations],
      });
    } catch (error) {
      report.routes.push({
        route: entry.path,
        url,
        pass: false,
        error: String(error),
        violations: [...violations],
      });
      report.failures.push(`route ${url}: ${error}`);
    }
  }
  for (const entry of journey)
    for (const state of CAPTURE_STATES)
      for (const [width, height] of VIEWPORTS) {
        const url = relativePreview(entry, state);
        violations.length = 0;
        await page.setViewportSize({ width, height });
        const file = `${String(manifest.indexOf(entry) + 1).padStart(2, '0')}-${entry.path.replace(/[^a-zA-Z0-9]+/g, '-')}-${state}-${width}.png`;
        try {
          const finalUrl = await open(page, url, violations, entry);
          await page.screenshot({
            path: join(captureDir, file),
            fullPage: true,
          });
          report.captures.push({
            route: entry.path,
            state,
            width,
            height,
            url,
            finalUrl,
            file: `work/rounds/R-0033/preview/portal-web/captures/${file}`,
            pass: true,
          });
          if (width === 1280) {
            await page.addScriptTag({ path: resolveAxePath() });
            const result = await page.evaluate(async () => {
              const result = await window.axe.run(document, {
                runOnly: {
                  type: 'tag',
                  values: ['wcag2a', 'wcag2aa', 'best-practice'],
                },
              });
              return {
                version: window.axe.version,
                violations: result.violations.map((violation) => ({
                  id: violation.id,
                  impact: violation.impact,
                  description: violation.description,
                  nodes: violation.nodes.map((node) => ({
                    target: node.target,
                    summary: node.failureSummary,
                  })),
                })),
              };
            });
            const blocking = result.violations.filter(
              (item) => item.impact === 'serious' || item.impact === 'critical',
            );
            report.axe.push({
              route: entry.path,
              state,
              url,
              width,
              pass: blocking.length === 0,
              ...result,
            });
            if (blocking.length)
              report.failures.push(
                `axe ${url}: ${blocking.map((item) => item.id).join(', ')}`,
              );
          }
          assert.equal(violations.length, 0, violations.join('\n'));
        } catch (error) {
          report.failures.push(`capture ${url} ${width}: ${error}`);
          report.captures.push({
            route: entry.path,
            state,
            width,
            height,
            url,
            pass: false,
            error: String(error),
            violations: [...violations],
          });
        }
        save();
      }
  // Real auth/assurance guards with canonical signature presets, no injected bypass.
  const defense = manifest.find(
    (entry) => entry.path === 'autos/:aitId/defesa/nova',
  );
  for (const [entry, persona, expectedPath] of [
    [manifest.find((item) => item.path === 'autos'), 'anonimo', '/'],
    [defense, 'simples', '/assinatura/elevacao'],
  ]) {
    const url = new URL(relativePreview(entry), 'http://preview.invalid');
    url.searchParams.set('pv_papel', persona);
    const relativeUrl = url.pathname + url.search;
    violations.length = 0;
    try {
      await page.goto(server.baseUrl + relativeUrl, { waitUntil: 'load' });
      await page.locator(PREVIEW_MARK_SELECTOR).waitFor({ state: 'visible' });
      await page.waitForLoadState('networkidle');
      const final = new URL(page.url());
      assert.equal(final.pathname, expectedPath);
      assert.equal(final.searchParams.get('retomar'), relativeUrl);
      assert.equal(violations.length, 0, violations.join('\n'));
      report.guards.push({
        persona,
        url: relativeUrl,
        finalUrl: final.pathname + final.search,
        pass: true,
      });
    } catch (error) {
      report.guards.push({
        persona,
        url: relativeUrl,
        pass: false,
        error: String(error),
        violations: [...violations],
      });
      report.failures.push(`guard ${persona}: ${error}`);
    }
  }
  assert.equal(
    report.networkRequests.length,
    0,
    'No Portal API request may leave the preview',
  );
  assert.equal(report.consoleErrors.length, 0, 'No console error');
  assert.equal(report.pageErrors.length, 0, 'No uncaught browser error');
  assert.equal(report.routes.length, report.expected.routes);
  assert.equal(
    report.captures.filter((item) => item.pass).length,
    report.expected.captures,
  );
  assert.equal(report.axe.length, report.expected.axe);
  assert.equal(report.guards.length, report.expected.guardCounterexamples);
} catch (error) {
  report.failures.push(String(error));
} finally {
  await browser?.close();
  await server?.close();
  report.status = report.failures.length ? 'failed' : 'passed';
  report.completedAt = new Date().toISOString();
  save();
}
console.log(
  JSON.stringify({
    status: report.status,
    routes: report.routes.length,
    captures: report.captures.filter((item) => item.pass).length,
    axe: report.axe.length,
    guards: report.guards.length,
    failures: report.failures.length,
    report: reportPath,
  }),
);
process.exitCode = report.failures.length ? 1 : 0;
