// R-0033 TASK-0005 — verificações determinísticas (aceitação de TASK-0006).
//   node check.mjs captures  -> nº de .png em captures/ == expectedCaptureCount()
//   node check.mjs axe       -> axe-report.json sem `serious`/`critical`
//   node check.mjs resolve   -> playwright-core resolvido; lib.mjs importa sem efeito colateral
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  DEFAULT_OUT,
  expectedCaptureCount,
  expectedCaptures,
  playwrightVersion,
  resolveAxePath,
  resolvePlaywright,
} from './lib.mjs';

const out = resolve(process.env.PREVIEW_OUT ?? DEFAULT_OUT);
const mode = process.argv[2];

function fail(message) {
  console.error(`FALHA: ${message}`);
  process.exit(1);
}

if (mode === 'captures') {
  if (!existsSync(out)) fail(`${out} não existe`);
  const found = readdirSync(out).filter((name) => name.endsWith('.png'));
  const expected = new Set(expectedCaptures().map((item) => item.file));
  const missing = [...expected].filter((name) => !found.includes(name));
  const extra = found.filter((name) => !expected.has(name));
  if (
    found.length !== expectedCaptureCount() ||
    missing.length ||
    extra.length
  ) {
    fail(
      `${found.length} .png encontrados, ${expectedCaptureCount()} esperados; faltam: ${missing.join(', ') || '—'}; sobram: ${extra.join(', ') || '—'}`,
    );
  }
  console.log(`ok: ${found.length} capturas == expectedCaptureCount()`);
} else if (mode === 'axe') {
  const reportPath = resolve(out, 'axe-report.json');
  if (!existsSync(reportPath)) fail(`${reportPath} não existe`);
  const report = JSON.parse(readFileSync(reportPath, 'utf8'));
  const blocking = report.pages.flatMap((entry) =>
    entry.violations
      .filter((v) => v.impact === 'serious' || v.impact === 'critical')
      .map((v) => `${entry.url} ${v.id} (${v.impact})`),
  );
  if (blocking.length > 0)
    fail(`violações serious/critical:\n  ${blocking.join('\n  ')}`);
  const others = report.pages.reduce(
    (sum, entry) => sum + entry.violations.length,
    0,
  );
  console.log(
    `ok: 0 serious/critical em ${report.pages.length} páginas (axe ${report.axeVersion}); ${others} violação(ões) menores listadas no relatório`,
  );
} else if (mode === 'resolve') {
  let resolved;
  try {
    resolved = resolvePlaywright();
  } catch (error) {
    fail(
      `playwright-core não resolve a partir de apps/rait/web: ${error.message}`,
    );
  }
  console.log(`playwright-core ${playwrightVersion()} -> ${resolved}`);
  console.log(`axe.min.js -> ${resolveAxePath()}`);
  console.log(
    `lib.mjs importado; ${expectedCaptureCount()} capturas esperadas`,
  );
} else {
  fail('uso: node check.mjs captures | axe | resolve');
}
