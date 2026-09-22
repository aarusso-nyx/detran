// R-0011 TASK-0011 (Inspector) — testes de `tools/domain-boundaries/verify.mjs`
// contra a especificação de M6 (plan R-0011) / CTG-0001.md §7 (ADR-0020 §Decision
// 4). `verify.mjs` em si é fronteira do Engineer (TASK-0003, M6) — este arquivo
// nunca é ajustado para "passar"; ele documenta o contrato-alvo e roda contra o
// `verify.mjs` de R-0010, que ainda não foi generalizado. Vários casos abaixo
// falham hoje de propósito ("vermelho esperado" — ver o relatório de entrega
// para a razão de cada um); TASK-0003 os torna verdes ao generalizar o script.
//
// Fixtures em `tools/domain-boundaries/tests/fixtures/<caso>/backend/domains/...`
// (árvores sintéticas mínimas — nenhum dado inventado além do necessário para
// exercitar a regra). O script aceita a raiz como `argv[2]` e varre a raiz
// inteira quando as duas raízes de consumo de R-0010
// (`backend/domains/dashboard/crashes/src`, `backend/domains/integration/renaest-mirror/src`)
// não existem sob ela — nenhuma fixture aqui as recria, então cada uma varre a
// própria árvore sintética inteira (contrato preservado, CTG-0001.md §7 "a
// varredura real é backend/domains/**").
//
// Atualização (iteração restrita — 3 achados de
// work/rounds/R-0011/reviews/delivery-review-CTG-0001.json sobre
// tools/domain-boundaries/verify.mjs, itens 7×2 + 10): TASK-0003 já
// generalizou o script — os casos (a)…(k) acima, antes vermelhos, rodam
// verdes hoje. Os casos (l)/(m)/(n) abaixo cobrem três lacunas que a
// delivery-review encontrou na versão generalizada; ficam vermelhos até o
// Engineer corrigi-las (mesma regra: este arquivo nunca é ajustado para
// "passar").
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const testsDir = dirname(fileURLToPath(import.meta.url));
const domainBoundariesDir = resolve(testsDir, '..');
const verifyScript = join(domainBoundariesDir, 'verify.mjs');
const fixturesDir = join(testsDir, 'fixtures');

function verify(caseName) {
  const root = join(fixturesDir, `case-${caseName}`);
  try {
    return {
      status: 0,
      output: execFileSync('node', [verifyScript, root], {
        encoding: 'utf8',
      }),
    };
  } catch (error) {
    return {
      status: error.status ?? 1,
      output: `${error.stdout ?? ''}${error.stderr ?? ''}`,
    };
  }
}

// (a) M6 "leituras cruzadas somente em arquivos *.projection.ts que exportam
// consumedEvents literal não vazio" / CTG-0001.md §7.1.5 e §7.3.1.
// VERMELHO ESPERADO hoje: o `verify.mjs` de R-0010 só implementa a exceção de
// `consumedEvents` para o par exato `schema === 'integration' && table ===
// 'outbox'` (linha `if (schema === 'integration' && table === 'outbox')`);
// para qualquer outro schema de domínio (aqui `inf`) a leitura cruzada é
// sempre violação, projection ou não — TASK-0003 generaliza essa exceção para
// todos os schemas de domínio.
test('dado projections/x.projection.ts com consumedEvents literal não vazio quando lê inf.rait_case então verify:domain-boundaries aceita (M6 exceção de projeção; CTG-0001 §7.1.5) — vermelho esperado', () => {
  const result = verify('a-projection-consumed-events');
  assert.equal(result.status, 0, result.output);
});

// (b) M6 regra geral de violação / CTG-0001.md §7.1.4, §7.3.2.
test('dado reader.ts (não .projection.ts) quando lê inf.rait_case então verify:domain-boundaries rejeita com "cross-domain boundary read/write inf.rait_case" e o caminho relativo (M6; CTG-0001 §7.1.4)', () => {
  const result = verify('b-non-projection-reader');
  assert.equal(result.status, 1, result.output);
  assert.match(
    result.output,
    /backend\/domains\/dashboard\/monitor\/src\/handwritten\/reader\.ts: cross-domain boundary read\/write inf\.rait_case/,
  );
});

// (c) M6/CTG-0001.md §7.1.6 "*.projection.ts sem consumedEvents (ausente,
// vazio ou não literal) → violação própria, mesmo sem leitura cruzada".
test('dado x.projection.ts sem consumedEvents exportado quando lê est.crash então verify:domain-boundaries rejeita (M6; CTG-0001 §7.1.6)', () => {
  const result = verify('c-projection-missing-consumed-events');
  assert.equal(result.status, 1, result.output);
});

test('dado x.projection.ts com consumedEvents = [] as const (vazio) quando lê est.crash então verify:domain-boundaries rejeita (M6; CTG-0001 §7.1.6)', () => {
  const result = verify('c2-projection-empty-consumed-events');
  assert.equal(result.status, 1, result.output);
});

// (d) M6 "tabelas de vocabulário global *_ref (DDL 1x, sem tenant)" admitidas
// / CTG-0001.md §7.1.5, §7.3.3.
// VERMELHO ESPERADO hoje: o `verify.mjs` de R-0010 não tem nenhuma exceção
// para tabelas `*_ref` — qualquer leitura de outro schema de domínio é
// violação, inclusive vocabulário global; TASK-0003 adiciona essa admissão.
test('dado portal/x/src/handwritten/timers.ts quando lê inf.infraction_timer_ref (vocabulário global *_ref) então verify:domain-boundaries aceita (M6; CTG-0001 §7.1.5) — vermelho esperado', () => {
  const result = verify('d-global-ref');
  assert.equal(result.status, 0, result.output);
});

// (e) M6 "schemas de plataforma ops.* e integration.* (parâmetros, agência,
// outbox, espelhos)" sempre admitidos / CTG-0001.md §7.1.5.
// VERMELHO ESPERADO hoje: o `verify.mjs` de R-0010 trata `integration.outbox`
// como exceção ESTRITA (exige *.projection.ts + consumedEvents, não como
// schema de plataforma incondicional); um arquivo comum (y.ts) que lê
// `integration.outbox` viola hoje. `ops.*` já é admitido hoje (nem está em
// `DOMAIN_SCHEMAS`), então só a metade `integration.outbox` deste caso é
// vermelha — TASK-0003 generaliza `integration.*` para admissão incondicional
// de plataforma, como `ops.*` já é.
test('dado inf/x/src/handwritten/y.ts quando lê ops.parameter e escreve em integration.outbox então verify:domain-boundaries aceita ambos como schemas de plataforma (M6; CTG-0001 §7.1.5) — vermelho esperado (integration.outbox)', () => {
  const result = verify('e-platform-schemas');
  assert.equal(result.status, 0, result.output);
});

// (f) M6 "dívidas conhecidas ... declarada e impressa (nunca silenciosa)"
// / CTG-0001.md §7.1.7: `known debt: <file> reads <table> (<OD>)`, hoje só
// `backend/domains/ops/field/src/handwritten/shift-readiness.ts` → OD-D15.
// VERMELHO ESPERADO hoje: o `verify.mjs` de R-0010 não tem lista de dívidas
// conhecidas — TASK-0003 a introduz (M6).
test('dado ops/field/src/handwritten/shift-readiness.ts quando lê inf.normative_mobile_package então verify:domain-boundaries aceita como dívida declarada e imprime OD-D15 (M6; CTG-0001 §7.1.7) — vermelho esperado', () => {
  const result = verify('f-known-debt');
  assert.equal(result.status, 0, result.output);
  assert.match(result.output, /OD-D15/);
});

// (g) M6/CTG-0001.md §7.1.7 "a dívida é por caminho exato, não por
// schema/tabela" — mesmo `shift-readiness.ts`, arquivo diferente
// (`other.ts`) não herda a exceção.
test('dado ops/field/src/handwritten/other.ts (mesma leitura de shift-readiness.ts, caminho diferente) quando lê inf.normative_mobile_package então verify:domain-boundaries rejeita — a dívida OD-D15 é por caminho exato, não por schema (M6; CTG-0001 §7.1.7)', () => {
  const result = verify('g-debt-exact-path');
  assert.equal(result.status, 1, result.output);
});

// (h) M6/CTG-0001.md §7.1.1 exclusões de varredura: tests/, *.spec.ts,
// vitest.config.ts, src/generated/.
// VERMELHO ESPERADO hoje (as 4): `filesUnder` do `verify.mjs` de R-0010
// percorre a árvore inteira e só ignora `node_modules`/`.git` — nenhuma das
// quatro exclusões de M6 existe ainda; TASK-0003 as adiciona.
test('dado leitura cruzada em backend/domains/.../tests/leak.ts quando verify:domain-boundaries roda então ignora o arquivo (M6 exclusão tests/; CTG-0001 §7.1.1) — vermelho esperado', () => {
  const result = verify('h1-tests-dir');
  assert.equal(result.status, 0, result.output);
});

test('dado leitura cruzada em backend/domains/.../leak.spec.ts quando verify:domain-boundaries roda então ignora o arquivo (M6 exclusão *.spec.ts; CTG-0001 §7.1.1) — vermelho esperado', () => {
  const result = verify('h2-spec-ts');
  assert.equal(result.status, 0, result.output);
});

test('dado leitura cruzada em backend/domains/.../vitest.config.ts quando verify:domain-boundaries roda então ignora o arquivo (M6 exclusão vitest.config.ts; CTG-0001 §7.1.1) — vermelho esperado', () => {
  const result = verify('h3-vitest-config');
  assert.equal(result.status, 0, result.output);
});

test('dado leitura cruzada em backend/domains/.../src/generated/leak.ts quando verify:domain-boundaries roda então ignora o arquivo (M6 exclusão src/generated/; CTG-0001 §7.1.1) — vermelho esperado', () => {
  const result = verify('h4-src-generated');
  assert.equal(result.status, 0, result.output);
});

// (i) M6/CTG-0001.md §7.1.2, §7.1.4 — leitura do próprio schema nunca é
// violação (owner === schema).
test('dado dashboard/monitor/src/handwritten/reader.ts quando lê dashboard.alert (próprio schema) então verify:domain-boundaries aceita (M6; CTG-0001 §7.1.4)', () => {
  const result = verify('i-own-schema');
  assert.equal(result.status, 0, result.output);
});

// (j) M6/CTG-0001.md §7.1.1 "backend/app/src (raiz de composição) fica fora
// nesta rodada (OD-D16, impresso como aviso skipped: backend/app/src
// (OD-D16))".
test('dado backend/app/src/x.ts (fora de backend/domains) quando lê ch.exam então verify:domain-boundaries aceita — backend/app/src está fora do gate nesta rodada (OD-D16; M6; CTG-0001 §7.1.1)', () => {
  const result = verify('j-app-src-out-of-scope');
  assert.equal(result.status, 0, result.output);
});

// (k) M6/CTG-0001.md §7.1.8 "sucesso domain boundaries verified (N files) +
// avisos + dívidas, exit 0".
test('dado uma árvore sem violações (1 arquivo) quando verify:domain-boundaries roda então a saída de sucesso termina com "domain boundaries verified (1 files)" (M6; CTG-0001 §7.1.8)', () => {
  const result = verify('k-success-count');
  assert.equal(result.status, 0, result.output);
  assert.match(result.output, /domain boundaries verified \(1 files\)\n$/);
});

// (n) delivery-review-CTG-0001.json item 10 (severity low, verify.mjs linha
// 139): "OD-D16 fica apenas em comentário; o gate não imprime o aviso
// obrigatório skipped: backend/app/src (OD-D16), previsto no CTG-0001
// §7.1.1." Fix pedido: "Emitir o aviso de escopo excluído em toda execução e
// afirmá-lo no teste do caso OD-D16." Casos novos (não alteram (j)/(k) acima,
// que continuam verdes): mesmas fixtures de (j) e (k), aviso adicional.
// VERMELHO ESPERADO — hoje o script nunca imprime essa linha.
test('dado backend/app/src/x.ts (mesma árvore do caso j) quando verify:domain-boundaries roda então imprime skipped: backend/app/src (OD-D16) em toda execução (CTG-0001 §7.1.1; delivery-review item 10) — vermelho esperado', () => {
  const result = verify('j-app-src-out-of-scope');
  assert.match(result.output, /skipped: backend\/app\/src \(OD-D16\)/);
});

test('dado uma árvore sem backend/app/src (mesma árvore do caso k) quando verify:domain-boundaries roda então ainda assim imprime skipped: backend/app/src (OD-D16) — o aviso de escopo excluído é declarado, não condicional (CTG-0001 §7.1.1; delivery-review item 10) — vermelho esperado', () => {
  const result = verify('k-success-count');
  assert.match(result.output, /skipped: backend\/app\/src \(OD-D16\)/);
});

// (l) delivery-review-CTG-0001.json item 7 (severity high, verify.mjs linha
// 120): "O gate permite qualquer acesso SQL cruzado de um arquivo
// *.projection.ts com consumedEvents, inclusive INSERT/UPDATE/DELETE... Isso
// contradiz ADR-0020 (\"a projection never writes back\") e CTG-0001 §7.1.5,
// que admite apenas leituras cruzadas." Fix pedido: "Classificar o verbo SQL
// capturado; permitir a exceção de projection somente para FROM/JOIN e
// falhar para INTO/UPDATE/DELETE em schema de outro domínio." VERMELHO
// ESPERADO nos quatro casos abaixo: hoje `verify.mjs` não distingue o verbo
// (SQL_ACCESS_RE captura from/join/into/update/delete-from igual, e
// `violationsFor` só olha `isProjection && events`), então uma escrita
// cruzada com consumedEvents passa hoje (exit 0) — o alvo é exit 1.
test('dado x.projection.ts com consumedEvents literal quando faz insert into inf.rait_case então verify:domain-boundaries rejeita — projeção nunca escreve de volta (ADR-0020 §3; CTG-0001 §7.1.5; delivery-review item 7) — vermelho esperado', () => {
  const result = verify('l1-projection-write-insert');
  assert.equal(result.status, 1, result.output);
  assert.match(result.output, /inf\.rait_case/);
});

test('dado y.projection.ts com consumedEvents literal quando faz update est.crash então verify:domain-boundaries rejeita — projeção nunca escreve de volta (ADR-0020 §3; CTG-0001 §7.1.5; delivery-review item 7) — vermelho esperado', () => {
  const result = verify('l2-projection-write-update');
  assert.equal(result.status, 1, result.output);
  assert.match(result.output, /est\.crash/);
});

test('dado z.projection.ts com consumedEvents literal quando faz delete from portal.request então verify:domain-boundaries rejeita — projeção nunca escreve de volta (ADR-0020 §3; CTG-0001 §7.1.5; delivery-review item 7) — vermelho esperado', () => {
  const result = verify('l3-projection-write-delete');
  assert.equal(result.status, 1, result.output);
  assert.match(result.output, /portal\.request/);
});

// A leitura cruzada (`from inf.x`) continua admitida no mesmo arquivo — só a
// escrita (tabela diferente, inf.notification_log, para a asserção não
// ambiguar) é rejeitada.
test('dado w.projection.ts com consumedEvents literal, leitura de inf.rait_case e escrita em inf.notification_log no mesmo arquivo quando verify:domain-boundaries roda então rejeita citando só a escrita — a leitura continua admitida (CTG-0001 §7.1.5; delivery-review item 7) — vermelho esperado', () => {
  const result = verify('l4-projection-read-and-write');
  assert.equal(result.status, 1, result.output);
  assert.match(result.output, /inf\.notification_log/);
  assert.doesNotMatch(result.output, /inf\.rait_case/);
});

// (m) delivery-review-CTG-0001.json item 7 (severity high, verify.mjs linha
// 151): "A lista KNOWN_DEBTS só imprime dívidas encontradas; não detecta nem
// avisa uma dívida obsoleta. CTG-0001 §7.1.7 exige aviso stale debt quando a
// entrada deixa de corresponder a violação real." Interpretação de §7.1.7
// ("entrada que não corresponde mais a uma violação real → aviso, não
// falha") cobre as duas formas de "não corresponder mais": o arquivo existe
// mas não tem mais a leitura, e o arquivo nem existe na árvore. VERMELHO
// ESPERADO nos dois: hoje `verify.mjs` nunca imprime "stale debt" (só imprime
// dívidas efetivamente encontradas).
test('dado shift-readiness.ts sem a leitura de inf.normative_mobile_package quando verify:domain-boundaries roda então exit 0 com "stale debt" citando o caminho e OD-D15 (CTG-0001 §7.1.7; delivery-review item 7) — vermelho esperado', () => {
  const result = verify('m1-stale-debt-no-read');
  assert.equal(result.status, 0, result.output);
  assert.match(result.output, /stale debt/);
  assert.match(
    result.output,
    /backend\/domains\/ops\/field\/src\/handwritten\/shift-readiness\.ts/,
  );
  assert.match(result.output, /OD-D15/);
});

test('dado uma árvore onde shift-readiness.ts nem existe quando verify:domain-boundaries roda então exit 0 com "stale debt" citando o caminho e OD-D15 (CTG-0001 §7.1.7; delivery-review item 7) — vermelho esperado', () => {
  const result = verify('m2-stale-debt-file-missing');
  assert.equal(result.status, 0, result.output);
  assert.match(result.output, /stale debt/);
  assert.match(
    result.output,
    /backend\/domains\/ops\/field\/src\/handwritten\/shift-readiness\.ts/,
  );
  assert.match(result.output, /OD-D15/);
});
