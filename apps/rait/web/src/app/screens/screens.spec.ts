// R-0012 TASK-0005 (Inspector). Critérios C-2A-56…57 do contrato `CTG-0002a.md` §11: tela ↔
// ficha ↔ rota ↔ i18n. Usa só `RAIT_ROUTE_MANIFEST_FIXTURE` (independente de `app.route-manifest.ts`)
// e `kb.ts` sobre as 63 fichas reais em disco (já mescladas de CTG-0001, `main`). Este spec pode
// falhar hoje só se `src/app/i18n/rait.pt-BR.json` (catálogo do app, TASK-0006) ainda não existir.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { RAIT_ROUTE_MANIFEST_FIXTURE } from '../../testing/route-manifest.fixture';
import {
  APP_SRC_ROOT,
  listSheetFiles,
  readSheet,
  readAppCatalog,
} from '../../testing/kb';

describe('C-2A-56 — cada entrada com sheet ↔ ficha ↔ i18n', () => {
  const withSheet = RAIT_ROUTE_MANIFEST_FIXTURE.filter(
    (
      entry,
    ): entry is typeof entry & { sheet: NonNullable<typeof entry.sheet> } =>
      entry.sheet !== null,
  );

  it('dado o manifesto quando filtradas as entradas com sheet então são 63', () => {
    expect(withSheet).toHaveLength(63);
  });

  withSheet.forEach((entry) => {
    it(`dado a entrada ${entry.path} (${entry.sheet}) quando lida a ficha então id/path/screen batem e i18nKeys existem no catálogo do app`, () => {
      const sheet = readSheet(entry.sheet);
      expect(sheet.id).toBe(entry.sheet);
      expect(sheet.path).toBe(entry.path);
      if (entry.screen !== null) {
        expect(sheet.screen).toBe(entry.screen);
      }
      const slug =
        entry.path === ''
          ? 'home'
          : entry.path.replace(/:/g, '').replace(/\//g, '-');
      const app = readAppCatalog();
      for (const key of sheet.i18nKeys) {
        expect(key.startsWith(`rait.screens.${slug}.`), key).toBe(true);
        expect(Object.prototype.hasOwnProperty.call(app, key), key).toBe(true);
      }
    });
  });
});

describe('C-2A-57 — listSheetFiles() × manifesto', () => {
  it('dado listSheetFiles() quando comparado ao manifesto então exatamente os 63 ids IU-RAIT-002…064', () => {
    const files = listSheetFiles();
    const ids = files.map((file) => file.replace(/\.md$/, ''));
    const expected = [...Array(63)].map(
      (_, index) => `IU-RAIT-${String(index + 2).padStart(3, '0')}`,
    );
    expect(ids).toEqual(expected);
  });

  it('dado listSheetFiles() quando comparado ao manifesto então nenhum arquivo a mais', () => {
    const fromManifest = new Set(
      RAIT_ROUTE_MANIFEST_FIXTURE.map((entry) => entry.sheet).filter(
        (sheet): sheet is NonNullable<typeof sheet> => sheet !== null,
      ),
    );
    const fromDisk = new Set(
      listSheetFiles().map((file) => file.replace(/\.md$/, '')),
    );
    expect(fromDisk).toEqual(fromManifest);
  });
});

// R-0012 TASK-0014 (Inspector). CTG-0002b.md §8 C-2B-81 (segunda parte — a primeira, "toda chave
// rait.screens.<slug>.* citada existe em readAppCatalog()", já é C-2A-56 acima): para cada rota
// L1/L2 do manifesto, todas as chaves cmd.*/field.*/state.* que a ficha cita em "## Chaves i18n"
// devem aparecer literalmente no fonte da página (`features/<modulo>/pages/<arquivo>.page.ts`);
// chaves sem uso em páginas L1 (M13, OD-R12-034) são só relatadas, nunca falham. Mapa path →
// arquivo transcrito da tabela §6.1 (50 páginas: 43 L2 + 1 layout + 6 L1).
const PAGE_FILE_BY_PATH: Readonly<Record<string, string>> = {
  painel: 'painel/pages/shift-dashboard.page.ts',
  'painel/retomar': 'painel/pages/resume-tray.page.ts',
  'fila/defesa': 'fila/pages/defense-pool-queue.page.ts',
  'fila/recurso/:orgao': 'fila/pages/rapporteur-queue.page.ts',
  'casos/:id': 'caso/pages/case-layout.page.ts',
  'casos/:id/resumo': 'caso/pages/case-summary.page.ts',
  'casos/:id/triagem': 'caso/pages/triage.page.ts',
  'casos/:id/dossie': 'caso/pages/dossier.page.ts',
  'casos/:id/diligencias': 'caso/pages/inquiries.page.ts',
  'casos/:id/minuta': 'caso/pages/draft.page.ts',
  'casos/:id/decisao': 'caso/pages/case-decision.page.ts',
  'casos/:id/prazos': 'caso/pages/deadlines.page.ts',
  'casos/:id/partes': 'caso/pages/parties.page.ts',
  'casos/:id/comunicacoes': 'caso/pages/communications.page.ts',
  'casos/:id/impedimentos': 'caso/pages/impediments.page.ts',
  'casos/:id/historico': 'caso/pages/history.page.ts',
  protocolo: 'protocolo/pages/intake-list.page.ts',
  'protocolo/novo': 'protocolo/pages/intake-new.page.ts',
  'protocolo/pendencias': 'protocolo/pages/pending-content.page.ts',
  'protocolo/remessas': 'protocolo/pages/remittances.page.ts',
  'protocolo/redirecionamentos': 'protocolo/pages/redirects.page.ts',
  'protocolo/desistencias': 'protocolo/pages/withdrawals.page.ts',
  assinatura: 'assinatura/pages/signing-queue.page.ts',
  'assinatura/:caseId': 'assinatura/pages/signing-decision.page.ts',
  'autoridade/provimentos': 'autoridade/pages/provided-appeals.page.ts',
  'colegiado/:orgao/distribuicao': 'colegiado/pages/batches.page.ts',
  'colegiado/:orgao/distribuicao/:loteId':
    'colegiado/pages/batch-detail.page.ts',
  'colegiado/:orgao/relatoria': 'colegiado/pages/rapporteur-cases.page.ts',
  'colegiado/:orgao/relatoria/:caseId/voto': 'colegiado/pages/opinion.page.ts',
  'colegiado/:orgao/pauta': 'colegiado/pages/agenda-builder.page.ts',
  'colegiado/:orgao/sessoes': 'colegiado/pages/sessions.page.ts',
  'colegiado/:orgao/sessoes/:id': 'colegiado/pages/live-session.page.ts',
  'colegiado/:orgao/sessoes/:id/banca': 'colegiado/pages/bench.page.ts',
  'colegiado/:orgao/sessoes/:id/ata': 'colegiado/pages/minutes.page.ts',
  'colegiado/:orgao/vistas': 'colegiado/pages/views.page.ts',
  'colegiado/:orgao/extraordinaria': 'colegiado/pages/extraordinary.page.ts',
  'gestao/radar': 'gestao/pages/risk-radar.page.ts',
  'gestao/radar/:caseId': 'gestao/pages/risk-case-drilldown.page.ts',
  'gestao/producao': 'gestao/pages/production.page.ts',
  'gestao/capacidade': 'gestao/pages/capacity-plan.page.ts',
  'gestao/turmas': 'gestao/pages/units.page.ts',
  'gestao/incidentes': 'gestao/pages/incidents.page.ts',
  'gestao/qualidade': 'gestao/pages/quality-sampling.page.ts',
  'organizacao/membros': 'organizacao/pages/members.page.ts',
  'organizacao/pools': 'organizacao/pages/pools.page.ts',
  'arquivo/busca': 'arquivo/pages/archive-search.page.ts',
  'arquivo/casos/:id': 'arquivo/pages/sealed-dossier.page.ts',
  'arquivo/retencao': 'arquivo/pages/retention-queue.page.ts',
  'auditoria/trilha': 'auditoria/pages/audit-trail.page.ts',
  conta: 'conta/pages/account.page.ts',
};

describe('C-2B-81 — chaves cmd.*/field.*/state.* da ficha usadas no fonte da página (L1/L2)', () => {
  const l1l2 = RAIT_ROUTE_MANIFEST_FIXTURE.filter(
    (entry) =>
      entry.sheet !== null &&
      (entry.level === 'L1' || entry.level === 'L2' || entry.kind === 'layout'),
  );

  it('dado o mapa path → arquivo de página quando comparado às rotas L1/L2 então cobre as 50 páginas', () => {
    expect(Object.keys(PAGE_FILE_BY_PATH)).toHaveLength(50);
    for (const entry of l1l2) {
      expect(PAGE_FILE_BY_PATH[entry.path], entry.path).toBeDefined();
    }
  });

  l1l2.forEach((entry) => {
    const file = PAGE_FILE_BY_PATH[entry.path];
    if (file === undefined) return;
    it(`dado a ficha ${entry.sheet} (${entry.path}) quando lida então toda chave cmd.*/field.*/state.* aparece em ${file}`, () => {
      const sheet = readSheet(entry.sheet as string);
      const usageKeys = sheet.i18nKeys.filter((key) =>
        /\.(cmd|field|state)\./.test(key),
      );
      if (usageKeys.length === 0) return;
      if (entry.level === 'L1') {
        // M13/OD-R12-034: páginas L1 não têm botão de comando — chaves cmd.* da ficha ficam
        // sem uso no catálogo; reportado, nunca falha aqui.
        return;
      }
      const source = readFileSync(
        join(APP_SRC_ROOT, 'app', 'features', file),
        'utf8',
      );
      for (const key of usageKeys) {
        expect(source, `${file}: chave ausente ${key}`).toContain(key);
      }
    });
  });
});
