# R-0025 — pós-merge parcial de admissibilidade, PR #193

Architect, Art.7. Autorização: AUTHORIZATION.md adenda pós-merge; mensagens diretas
do Owner. Recibo documental dos verbos, sem edição manual das saídas de runtime.

- PR [#193](https://github.com/aarusso-nyx/detran/pull/193), candidato
  8fcb8d9c027567ab3293377f82859388ce57403c, integrado em
  e68266a0c83143fa099c37b0b3e5444e7bbb0484 às 16:52:16 de 18/10/2026,
  America/Sao_Paulo. Cinco checks obrigatórios PASS; backend-kernel e
  boat-documents-real também PASS; stack-smoke explicitamente SKIPPED pelo
  workflow, não contado como PASS. Recibo JW01-PR193-merged-ci.json.
- Observação executada com HEAD no merge exato antes de qualquer commit novo:
  EV-a388da7d4a565ec6, SC-20261018T195216-001. Assessment **YELLOW**, 0/45 cells
  passing, 43 UNKNOWN e 2 N/A; scorecard.overall permanece UNKNOWN.
  readiness_promoting=false. Lacuna de emissão de SensorReadings não foi corrigida
  nem convertida em qualidade verde pelos testes PASS. Saídas em
  .devai/state/audit-observations/e68266a0c83143fa099c37b0b3e5444e7bbb0484/.
- Evidência genérica parcial da R-0025 registrada pelo verbo, sequência1, insumo
  evidence-PR193-admissibility.json com hashes das fontes/recibos do recorte.
  Não é a evidência final dos seis CTGs planejados nem certificação de JW-01.
- Cadeia validada: 91 proof lines ancoradas, 53 historical gaps reconhecidos,
  head 735466bc4e70bff8e7951be14c9d66e00dceba0e8fd0bfc95bae82fc6f4f6272.
  Legacy chain permanece intacta. Nenhuma linha anterior reescrita.
- R-0025 continua **aberta**. Não executados round close, round seal, closure.json,
  PC ou promoção de readiness. TASK-0024…0027 completed apenas no recorte;
  tarefas históricas e escopo restante preservados.

## Próxima fatia e pendências

Recomendação em JW01-next-slice.md: fila de defesa→claim de caso DISTRIBUIDO→
EM_INSTRUCAO→dossiê. Primeiro resolver fonte do pool, tipos HTTP, navegação e
handoff ADMITIDO→DISTRIBUIDO; não criar transição/grant por analogia. Contrato e
sensores antes de wiring. Recomendação não inicia implementação.

OD-R25-016/017, IdP real, acesso individual intratenant, documentos de ofício,
diligências, minuta e demais jornadas seguem pendentes. R-0022 continua parada.
O recibo pré-PR JW01-maestro-verification.md é histórico: suas restrições de merge
foram superadas pela autorização posterior, mas limites de escopo e prova ficam.

## Preservação e validação

Checkout primário e três hashes de configuração de máquina conferidos novamente;
branch original e recovery de browser preservados. Somente worktree isolada
codex/r0025-post-merge utilizada; sem limpeza/remoção de worktrees.
Checks do pós-merge em JW01-post-merge-checks.log; cadeia e doctor em recibos
próprios. Este pacote muda apenas registros/documentação e saídas dos verbos;
não altera runtime, contratos, fontes de sensores ou limites de gates.


Validação final PASS (exit0): evidence verify --scope chain, doctor, proof anchors,
state index, rounds index, KB check/publish-check, devai:test e format:check.
Runtime e testes de aplicação não foram alterados nem executados novamente por
este pacote documental. Preservação atual em JW01-post-merge-preservation.json.
