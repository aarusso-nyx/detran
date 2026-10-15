// R-0033 TASK-0005 — captura das telas da JW-01 (C-04): tela × estado × largura, `fullPage`.
// Sai com código 1 se houver requisição a `/v1/`, `console.error` ou prova negativa falha.
// Nunca cria dados; nunca aceita diálogos (apenas os dispensa sem confirmar).
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  DEFAULT_OUT,
  NEGATIVAS_PAPEL,
  acquireBaseUrl,
  expectedCaptures,
  loadChromium,
  openPreview,
  previewUrl,
  watchViolations,
} from './lib.mjs';

const out = resolve(process.env.PREVIEW_OUT ?? DEFAULT_OUT);
mkdirSync(out, { recursive: true });

let server;
let browser;
let failed = 0;
try {
  server = await acquireBaseUrl();
  const chromium = await loadChromium();
  browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ locale: 'pt-BR' });
  const page = await context.newPage();
  const violations = [];
  watchViolations(page, violations);
  page.on('dialog', (dialog) => dialog.dismiss());

  for (const item of expectedCaptures()) {
    violations.length = 0;
    await page.setViewportSize({ width: item.width, height: item.height });
    const finalPath = await openPreview(page, server.baseUrl, item.url);
    const isForbidden = finalPath === '/sem-permissao';
    if (isForbidden !== Boolean(item.entry.negative)) {
      violations.push(
        `rota final inesperada: ${finalPath} (esperado ${item.entry.negative ? '/sem-permissao' : 'a tela do roteiro'})`,
      );
    }
    await page.screenshot({ path: resolve(out, item.file), fullPage: true });
    if (violations.length > 0) {
      failed += 1;
      console.error(`FALHA ${item.file}\n  ${violations.join('\n  ')}`);
    } else {
      console.log(`ok ${item.file}`);
    }
  }

  // Provas negativas por papel (guardas ativas): sem captura, só a rota final.
  for (const neg of NEGATIVAS_PAPEL) {
    violations.length = 0;
    await page.setViewportSize({ width: 1280, height: 800 });
    const finalPath = await openPreview(
      page,
      server.baseUrl,
      previewUrl(neg.path, neg.papel, 'loaded'),
    );
    if (finalPath !== '/sem-permissao') {
      failed += 1;
      console.error(
        `FALHA prova negativa ${neg.papel} ${neg.path}: rota final ${finalPath}`,
      );
    } else if (violations.length > 0) {
      failed += 1;
      console.error(
        `FALHA prova negativa ${neg.papel} ${neg.path}\n  ${violations.join('\n  ')}`,
      );
    } else {
      console.log(`ok negativa ${neg.papel} ${neg.path} -> /sem-permissao`);
    }
  }
} catch (error) {
  failed += 1;
  console.error(error instanceof Error ? error.message : error);
} finally {
  await browser?.close();
  await server?.close();
}
process.exit(failed > 0 ? 1 : 0);
