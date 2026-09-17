// R-0014 TASK-0007 (Inspector). Helper de leitura das fichas de tela
// (docs/framework/product/transversal/portal/screens/*.md) e do catálogo i18n
// (src/app/i18n/portal.pt-BR.json) para os specs tela ↔ ficha ↔ rota ↔ i18n
// (src/app/screens/*.spec.ts). Listas fechadas com fonte em comentário — nenhum valor inventado
// (plan.md M9/M11, route-manifest.md, prompts/TASK-0007.md §Definições, e as atualizações do
// maestro de 2026-09-17 citadas no relatório de entrega).
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const testingDir = dirname(fileURLToPath(import.meta.url)); // .../src/testing
export const APP_SRC_ROOT = join(testingDir, '..'); // .../src
export const REPO_ROOT = join(testingDir, '..', '..', '..', '..', '..'); // raiz do monorepo
export const SCREENS_DIR = join(
  REPO_ROOT,
  'docs/framework/product/transversal/portal/screens',
);
export const I18N_CATALOG_PATH = join(
  APP_SRC_ROOT,
  'app/i18n/portal.pt-BR.json',
);
export const ERROR_CATALOG_PATH = join(
  REPO_ROOT,
  'docs/framework/arch/portal-error-catalog.md',
);

const SHEET_FILE_PATTERN = /^IU-PORTAL-T(\d{2})\.md$/;

/** Nomes dos arquivos de ficha em disco (ex.: `IU-PORTAL-T01.md`), ordenados. */
export function listSheetFiles(): string[] {
  return readdirSync(SCREENS_DIR)
    .filter((name) => SHEET_FILE_PATTERN.test(name))
    .sort();
}

/** `sheet` (`IU-PORTAL-Tnn`) de cada ficha em disco. */
export function listSheetIds(): string[] {
  return listSheetFiles().map((name) => name.replace(/\.md$/, ''));
}

/** Conteúdo bruto de uma ficha pelo id do `sheet` (ex.: `IU-PORTAL-T01`). */
export function readSheet(sheet: string): string {
  return readFileSync(join(SCREENS_DIR, `${sheet}.md`), 'utf8');
}

/** Front-matter simples (uma linha `chave: valor` por campo), mesmo padrão de
 * `tools/docs/kb/check.mjs` (função `frontMatter`, linhas ~80-90) — reimplementado aqui porque o
 * módulo não é reutilizável (script `.mjs` fora da fronteira de escrita do Inspector). */
export function frontMatter(text: string): Record<string, string> {
  if (!text.startsWith('---\n')) return {};
  const end = text.indexOf('\n---', 4);
  if (end < 0) return {};
  const result: Record<string, string> = {};
  for (const line of text.slice(4, end).split('\n')) {
    const match = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (match) result[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, '');
  }
  return result;
}

/** Corpo de uma seção `## <heading>` até o próximo `## ` (ou fim do arquivo). `heading` é o texto
 * exatamente como aparece após `## ` (ex.: `1. Identidade`, `Estados obrigatórios`). */
export function extractSection(text: string, heading: string): string {
  const lines = text.split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim() === `## ${heading}`);
  if (start < 0) return '';
  let end = lines.length;
  for (let index = start + 1; index < lines.length; index += 1) {
    if (/^##\s/.test(lines[index])) {
      end = index;
      break;
    }
  }
  return lines.slice(start + 1, end).join('\n');
}

/** Spans entre crases de um trecho (`` `foo` `` → `foo`), sem os apóstrofos. */
export function backtickSpans(text: string): string[] {
  return [...text.matchAll(/`([^`]+)`/g)].map((match) => match[1]);
}

/** Catálogo i18n do Portal como `Record<chave, texto>`. */
export function readCatalog(): Record<string, string> {
  return JSON.parse(readFileSync(I18N_CATALOG_PATH, 'utf8')) as Record<
    string,
    string
  >;
}

/** Códigos `PORTAL.<CODE>` (sem o prefixo) citados em `portal-error-catalog.md`. */
export function readErrorCatalogCodes(): Set<string> {
  const text = readFileSync(ERROR_CATALOG_PATH, 'utf8');
  const codes = new Set<string>();
  for (const match of text.matchAll(/PORTAL\.([A-Z_]+)/g)) {
    codes.add(match[1]);
  }
  return codes;
}

// 7 situações do backend que o Portal traduz (`INFRACTION_SITUATION_MAP`, projeção
// `infraction-view.projection.ts`; prompts/TASK-0007.md §Definições).
export const INFRACTION_SITUATIONS = [
  'aguardando_defesa',
  'em_defesa',
  'penalidade_aplicada',
  'em_recurso',
  'encerrada',
  'arquivada',
  'cancelada',
] as const;

// 13 estados do pedido (`REQUEST_TRANSITIONS`, guards/request.transitions.ts;
// prompts/TASK-0007.md §Definições; [WF-PORTAL-001] §Estados).
export const REQUEST_STATES = [
  'IDENTIFICADO',
  'SERVICO_SELECIONADO',
  'ELEGIBILIDADE_VERIFICADA',
  'INELEGIVEL',
  'PEDIDO_EM_COMPOSICAO',
  'AGUARDANDO_NIVEL_ASSINATURA',
  'AGUARDANDO_PAGAMENTO',
  'PROTOCOLADO',
  'EM_ANDAMENTO_NO_ORGAO',
  'RESULTADO_DISPONIVEL',
  'AVALIACAO_OFERECIDA',
  'CONCLUIDO',
  'DESISTIDO',
] as const;

// 5 badges do `CitizenStatusBadge` (portal-frontends.md §5.2; prompts/TASK-0007.md §Definições).
export const BADGES = [
  'em_analise',
  'aguardando_decisao',
  'em_diligencia',
  'decidido',
  'encerrado',
] as const;

// Estados do pedido com `badge_of` inequívoco na fonte (plan.md §Adendas — OD-P56 cobre os
// outros 9; reports/TASK-0006.md e TASK-0006-iteration-2.md): o catálogo real só define estes 4
// (verificado em portal.pt-BR.json) — o critério do prompt de TASK-0007 é "chaves ⊆ 13 estados e
// valores ⊆ 5 badges", não completude sobre os 13 (nota do maestro de 2026-09-17).
export const BADGE_OF_DEFINED_STATES = [
  'EM_ANDAMENTO_NO_ORGAO',
  'RESULTADO_DISPONIVEL',
  'CONCLUIDO',
  'DESISTIDO',
] as const;

// 7 eventos da linha do tempo (`PROCESS_TIMELINE_DOMAIN_EVENTS`,
// process-timeline.projection.ts; prompts/TASK-0007.md §Definições).
export const TIMELINE_EVENTS = [
  'RAIT_CASO_PROTOCOLADO',
  'RAIT_CASO_ESTADO_ALTERADO',
  'RAIT_EFEITO_SUSPENSIVO_INSTAURADO',
  'RAIT_RECURSO_RECEBIDO_JULGADOR',
  'RAIT_CASO_TRANSITADO',
  'ENCERRADO_DESISTENCIA',
  'RAIT_DECISAO_PUBLICADA',
] as const;

// Universo fechado de `serviceKey` (`PORTAL_SERVICE_KEYS`,
// src/testing/route-manifest.fixture.ts — 15 linhas de `portal.service_catalog` na fixture,
// incluindo `cancelamento_sne`, ∪ `junta_medica`; route-manifest.md §Invariantes, A4 do
// plan.md). Nem todo elemento aparece em `app.route-manifest.ts`: T-22 perdeu `serviceKey` (A4) e
// `cancelamento_sne` não está atrelado a nenhuma rota (OD-P55) — por isso os specs verificam o
// serviceKey *do manifesto real*, não esta lista, mas todo serviceKey do manifesto pertence a
// esta lista fechada.
export const SERVICE_KEYS = [
  'consulta_multas',
  'defesa_previa',
  'recurso_jari',
  'recurso_cetran',
  'indicacao_condutor',
  'pagamento',
  'adesao_sne',
  'cancelamento_sne',
  'consulta_cnh',
  'emissao_crlv',
  'consulta_bat',
  'consulta_exame',
  'junta_medica',
  'manifestar',
  'avaliar',
  'lgpd_declaracao',
] as const;

// As 6 linhas obrigatórias de "Estados obrigatórios" em toda ficha (plan.md M11; build pack
// WP-P4; prompts/TASK-0005.md §Tarefa).
export const MANDATORY_SCREEN_STATES = [
  'carregando',
  'vazio',
  'sem elegibilidade',
  'erro recuperável',
  'sem permissão',
  'indisponível',
] as const;

// As 12 seções `##` do esqueleto exato de ficha (prompts/TASK-0005.md §Tarefa).
export const SHEET_SECTIONS = [
  '1. Identidade',
  '2. Acesso',
  '3. Entrada',
  '4. Dados',
  '5. Estados',
  '6. Comandos',
  '7. Saída',
  '8. Segurança',
  '9. Acessibilidade',
  '10. Testes',
  'Estados obrigatórios',
  'Chaves i18n',
] as const;
