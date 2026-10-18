// R-0033 TASK-0005 — axe-core (C-05) sobre as telas da JW-01: tela × estado, largura 1280,
// tags `wcag2a`, `wcag2aa`, `best-practice` (mesmas de `src/testing/axe.spec-helper.ts`).
// Escreve `axe-report.json` (nada é filtrado); sai com 1 se houver `serious`/`critical`.
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  AXE_WIDTH,
  DEFAULT_OUT,
  ROTEIRO,
  acquireBaseUrl,
  loadChromium,
  openPreview,
  previewUrl,
  resolveAxePath,
} from './lib.mjs';

const out = resolve(process.env.PREVIEW_OUT ?? DEFAULT_OUT);
mkdirSync(out, { recursive: true });
const reportPath = resolve(out, 'axe-report.json');

let server;
let browser;
let blocking = 0;
let failed = false;
try {
  server = await acquireBaseUrl();
  const chromium = await loadChromium();
  browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await (await browser.newContext({ locale: 'pt-BR' })).newPage();
  await page.setViewportSize({ width: AXE_WIDTH, height: 800 });
  page.on('dialog', (dialog) => dialog.dismiss());
  const axePath = resolveAxePath();

  const pages = [];
  let axeVersion = null;
  for (const entry of ROTEIRO) {
    for (const estado of entry.estados) {
      const url = previewUrl(entry.path, entry.papel, estado);
      await openPreview(page, server.baseUrl, url);
      await page.addScriptTag({ path: axePath });
      const result = await page.evaluate(async () => {
        const results = await window.axe.run(document, {
          runOnly: {
            type: 'tag',
            values: ['wcag2a', 'wcag2aa', 'best-practice'],
          },
        });
        return {
          version: window.axe.version,
          violations: results.violations.map((violation) => ({
            id: violation.id,
            impact: violation.impact,
            nodes: violation.nodes.map((node) => ({
              target: node.target.join(' '),
            })),
          })),
        };
      });
      axeVersion = result.version;
      const serious = result.violations.filter(
        (v) => v.impact === 'serious' || v.impact === 'critical',
      );
      blocking += serious.length;
      pages.push({ url, state: estado, violations: result.violations });
      console.log(
        `${serious.length === 0 ? 'ok' : 'FALHA'} ${url} — ${result.violations.length} violação(ões), ${serious.length} serious/critical`,
      );
    }
  }
  writeFileSync(
    reportPath,
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        baseUrl: server.baseUrl,
        axeVersion,
        pages,
      },
      null,
      2,
    )}\n`,
  );
} catch (error) {
  failed = true;
  console.error(error instanceof Error ? error.message : error);
} finally {
  await browser?.close();
  await server?.close();
}
process.exit(failed || blocking > 0 ? 1 : 0);
