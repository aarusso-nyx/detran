// R-0018 TASK-0002 (Inspector, Art. 6). CTG-0001 §2.2 e §7.3 (C-01-13): testes unitários da
// função pura `classifyStatus(text, relPath, exceptions)` exportada por `../check.mjs` (§6.6).
// Este arquivo falha inteiro por `ERR_MODULE_NOT_FOUND` até TASK-0003 criar `check.mjs`; isso é
// esperado nesta entrega (o módulo de produção ainda não existe).
import assert from 'node:assert/strict';
import test from 'node:test';
import { classifyStatus } from '../check.mjs';

const REL_PATH = 'docs/meta/adr/ADR-9999-fixture.md';

test('C-01-13 dado um arquivo com "## Status" e palavra-chave Accepted quando classifyStatus roda então devolve Accepted', () => {
  const text =
    '# ADR-9999: Fixture\n\n## Status\n\nAccepted on 2026-01-01 by Owner decision.\n';
  assert.equal(classifyStatus(text, REL_PATH, {}), 'Accepted');
});

test('dado "## Status" com palavra-chave em português (Aceita) quando classifyStatus roda então devolve Accepted', () => {
  const text =
    '# ADR-9999: Fixture\n\n## Status\n\nAceita pelo Owner em 2026-01-01.\n';
  assert.equal(classifyStatus(text, REL_PATH, {}), 'Accepted');
});

test('dado "## Status" com Proposed/Proposta quando classifyStatus roda então devolve Proposed', () => {
  const proposedEn = '# ADR-9999\n\n## Status\n\nProposed on 2026-01-01.\n';
  const proposedPt =
    '# ADR-9999\n\n## Status\n\nProposta pelo Architect em 2026-01-01.\n';
  assert.equal(classifyStatus(proposedEn, REL_PATH, {}), 'Proposed');
  assert.equal(classifyStatus(proposedPt, REL_PATH, {}), 'Proposed');
});

test('dado "## Status" com Superseded/Substituída quando classifyStatus roda então devolve Superseded', () => {
  const supersededEn = '# ADR-9999\n\n## Status\n\nSuperseded by ADR-0002.\n';
  const supersededPt =
    '# ADR-9999\n\n## Status\n\nSubstituída pela ADR-0002.\n';
  assert.equal(classifyStatus(supersededEn, REL_PATH, {}), 'Superseded');
  assert.equal(classifyStatus(supersededPt, REL_PATH, {}), 'Superseded');
});

test('dado "## Status" com prefixo "**" quando classifyStatus roda então o prefixo é ignorado', () => {
  const text =
    '# ADR-9999\n\n## Status\n\n**Accepted** pelo Owner em 2026-01-01.\n';
  assert.equal(classifyStatus(text, REL_PATH, {}), 'Accepted');
});

test('dado "## Status" com "Renumerada para [ADR-nnnn](…)." quando classifyStatus roda então devolve Renumbered', () => {
  const text =
    '# ADR-9999\n\n## Status\n\nRenumerada para [ADR-0037](ADR-0037-fixture.md).\n';
  assert.equal(classifyStatus(text, REL_PATH, {}), 'Renumbered');
});

test('dado um arquivo sem "## Status" mas com a linha "- Status: Accepted" quando classifyStatus roda então devolve Accepted', () => {
  const text = '# ADR-9999: Fixture\n\n- Status: Accepted\n\nTexto.\n';
  assert.equal(classifyStatus(text, REL_PATH, {}), 'Accepted');
});

test('dado a linha "- Status:" com pontuação final quando classifyStatus roda então a pontuação é descartada', () => {
  const text = '# ADR-9999: Fixture\n\n- Status: Accepted.\n\nTexto.\n';
  assert.equal(classifyStatus(text, REL_PATH, {}), 'Accepted');
});

test('C-01-13 dado prosa "Owner decision …" sem "## Status", sem "- Status:" e sem exceção quando classifyStatus roda então devolve null', () => {
  const text =
    '# ADR-9999: Fixture\n\nOwner decision on 2026-01-01 approves this ADR.\n';
  assert.equal(classifyStatus(text, REL_PATH, {}), null);
});

test('C-01-13 dado a mesma prosa listada em statusExceptions quando classifyStatus roda então devolve a classe da exceção (não null)', () => {
  const text =
    '# ADR-9999: Fixture\n\nOwner decision on 2026-01-01 approves this ADR.\n';
  const exceptions = { [REL_PATH]: 'Accepted' };
  assert.equal(classifyStatus(text, REL_PATH, exceptions), 'Accepted');
});
