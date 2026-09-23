// R-0012 TASK-0014 (Inspector). CTG-0002b.md §8 — C-2B-88/89, restritos a `features/**` (a
// fronteira desta tarefa: `shared/**`/`data/**` são do CTG-0002b-1/TASK-0008 — "no que lhes cabe",
// plan.md M7/A8). Nenhum arquivo de `features/**` existe ainda além dos `*.routes.ts` (TASK-0006)
// e dos `*.spec.ts` desta entrega: as verificações abaixo já valem para o que existe hoje e
// continuam válidas conforme o Engineer (TASK-0015) acrescenta `features/<modulo>/pages/*.ts`.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { APP_SRC_ROOT } from '../../testing/kb';

const FEATURES_ROOT = join(APP_SRC_ROOT, 'app', 'features');

/** Só `features/**\/*.ts` (produção e spec — mesmo escopo do verificador de parâmetros, A1). */
function listFeatureSourceFiles(): string[] {
  const files: string[] = [];
  function walk(dir: string): void {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (entry.name.endsWith('.ts')) files.push(path);
    }
  }
  walk(FEATURES_ROOT);
  return files.sort();
}

/** OD-R12-025: páginas que usam `StynxConfirmDialogComponent` (ação com efeito jurídico, guia
 * §3.3) — lista fechada, transcrita do relatório de entrega do TASK-0015 (iteração 1; adenda
 * A14 do maestro, iteração restrita 4 do Inspector). */
const CONFIRM_DIALOG_RELATIVE_PATHS: readonly string[] = [
  'assinatura/pages/signing-decision.page.ts',
  'autoridade/pages/provided-appeals.page.ts',
  'caso/pages/case-decision.page.ts',
  'caso/pages/draft.page.ts',
  'caso/pages/impediments.page.ts',
  'caso/pages/inquiries.page.ts',
  'caso/pages/triage.page.ts',
  'colegiado/pages/agenda-builder.page.ts',
  'colegiado/pages/batch-detail.page.ts',
  'colegiado/pages/batches.page.ts',
  'colegiado/pages/bench.page.ts',
  'colegiado/pages/extraordinary.page.ts',
  'colegiado/pages/live-session.page.ts',
  'colegiado/pages/minutes.page.ts',
  'colegiado/pages/opinion.page.ts',
  'colegiado/pages/rapporteur-cases.page.ts',
  'colegiado/pages/views.page.ts',
  'fila/pages/defense-pool-queue.page.ts',
  'gestao/pages/incidents.page.ts',
  'gestao/pages/risk-case-drilldown.page.ts',
  'protocolo/pages/intake-new.page.ts',
  'protocolo/pages/pending-content.page.ts',
  'protocolo/pages/redirects.page.ts',
  'protocolo/pages/remittances.page.ts',
  'protocolo/pages/withdrawals.page.ts',
];
const CONFIRM_DIALOG_FILES: ReadonlySet<string> = new Set(
  CONFIRM_DIALOG_RELATIVE_PATHS.map((relative) =>
    join(FEATURES_ROOT, relative),
  ),
);

describe('C-2B-88 — fronteiras de import em features/** [negativo]', () => {
  it('dado listFeatureSourceFiles() (produção, sem specs — os specs importam HttpTestingController de propósito) quando varridos então nenhum import de "@angular/common/http" fora de features (a leitura HTTP vive em data/api/**, core/**)', () => {
    const httpImportMarker = ['from', "'@angular/common/http'"].join(' ');
    for (const file of listFeatureSourceFiles()) {
      if (file.endsWith('.spec.ts')) continue;
      const text = readFileSync(file, 'utf8');
      expect(text, file.split('/apps/rait/web/src/').pop()).not.toContain(
        httpImportMarker,
      );
    }
  });

  it('dado listFeatureSourceFiles() quando varridos então "@stynx-nyx/angular-ui" só aparece nas páginas com StynxConfirmDialogComponent (lista fechada, OD-R12-025) ou em specs (assertivas de teste)', () => {
    for (const file of listFeatureSourceFiles()) {
      if (file.endsWith('.spec.ts')) continue;
      const text = readFileSync(file, 'utf8');
      const imports = text.includes("from '@stynx-nyx/angular-ui'");
      if (imports && !CONFIRM_DIALOG_FILES.has(file)) {
        throw new Error(
          `${file}: importa @stynx-nyx/angular-ui fora da lista fechada (OD-R12-025) — acrescente à lista quando a página usar StynxConfirmDialogComponent`,
        );
      }
    }
    expect(true).toBe(true);
  });
});

describe('C-2B-89 — nenhum literal "rait.<x>.changed" nem dos 9 namespaces de token em features/** [negativo]', () => {
  const changedPattern = /['"`]rait\.[a-z-]+\.changed['"`]/;
  const tokenNamespacePattern =
    /['"`]rait\.(caseState|sessionState|infractionState|infractionSubstate|riskFlag|memberStatus|orgState|closureMotive|timer)\./;

  listFeatureSourceFiles().forEach((file) => {
    it(`dado ${file.split('/apps/rait/web/src/').pop()} quando lido então nenhum literal "rait.<x>.changed" nem dos namespaces de token`, () => {
      const text = readFileSync(file, 'utf8');
      expect(changedPattern.test(text)).toBe(false);
      expect(tokenNamespacePattern.test(text)).toBe(false);
    });
  });
});
