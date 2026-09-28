# Autorização parcial A3.2/A3.3 do Owner — cinco escolhas do CTG-0003

**Data:** 2026-09-28. **Papel decisor:** Owner. **Rodada:** R-0020. **Estado:** decisões 1–5 aceitas; questão 6 pendente.

Depois da apresentação das seis perguntas e suas consequências, o Owner respondeu:

```text
1A; 2B;  3A; 4A; 5A;

Sobre 6: Entendo que apps/ e backend/ tenham que ter a mesma autoridade que src/

Em um monorepo monoproject naturalmente o codigo iria em src/; com multistack src/ pode se desdobrar em /apps, /mobile, /backend, /frontend.

Aceite as 5 primeiras respostas e comente sobre 6 antes de definirmos
.
```

As escolhas referem-se à enumeração de seis perguntas imediatamente anterior na conversa e às propostas revisadas pelo reviewer: `contracts/CTG-0003-A3.2-proposal.md` SHA-256 `52ac0bc9410d41864be4d7fb72c2d075568b78641c31e58913cffc4c59fde014`, `contracts/CTG-0003-A3.2-expc-reconstruction.md` SHA-256 `5a7c983233638f2911d36d77b8234bc42acb52e03a7e9937e1c7602232c819f7` e `contracts/CTG-0003-A3.3-gap-proposal.md` SHA-256 `236c70fa6678ff66e5840d9879400bec2354889feb4fd068c77b7df5c2e82542`.

1. **1A — A3.2.** Autorizar os dez aliases CTG distintos para 31 TASKs, os doze títulos editoriais exatos da proposta, quatro referências `INV-*` externas como tags, destino arquivístico dos quatro `executor.note` e dos campos EV/REC conforme a proposta. A trilha especial R-0006 TASK-0003 segue T1 abaixo. Cada original alterado exige sidecar byte a byte, SHA-256, vínculo e relatório antes/depois; colisão ou consumidor operacional não previsto mantém o arquivo pendente.
2. **2B — onze PCs R-0007.** Autorizar o método, índice separado e onze candidatos de composição **arquivística nova** da adenda hashada, inclusive seis seleções `exact` prospectivas. `historical_equivalence=false` é obrigatório; nenhum PC novo é apresentado como composição ou despacho histórico. Aplicação depende de guarda técnica específica, testes Inspector e revisão cruzada. Fonte divergente ou guarda não demonstrada mantém a classe pendente.
3. **3A — G0/D1/S1/C1/P1.** Autorizar a guarda estática de store/backlog e demais caminhos de estado R-0007, proibição operacional de despacho, disposição D1 dos três snapshots superseded com originais e índice, `checkpoint` arquivístico das duas tentativas incompletas, C1 com ciclos runtime preexistentes inventariados e zero ciclos novos da projeção, e P1 para as dez posições. G0 não bloqueia `tools/orchestra/worker.sh`; a guarda técnica específica exigida por 2B deve ser desenhada, testada e aprovada antes de aplicar PCs B. A ordem regular dos selos permanece; não há autorização de G1 ou exceção de sequência.
4. **4A — U1/T1.** Autorizar o índice de pré-condições PREP limitado à ordem comprovada do ledger, com horários de despacho e sucesso desconhecidos, e o índice consultável da trilha de escalada R-0006 TASK-0003. Não criar terceiro worker, horário ou PASS retroativo.
5. **5A — R1.** Escolher `discipline: owner` somente como rótulo arquivístico das duas transcrições antigas, preservando o literal anterior e a declaração histórica de Owner delegado. Esta escolha **não ratifica** escrita passada, não amplia autoridade e **não autoriza aplicação ainda**: a classificação de `apps/dashboard/web/README.md` e `backend/domains/ops/README.md` (questão 6) permanece pendente, assim como a matriz por caminho e eventual revisão do contrato.

O Owner apresentou uma tese para a questão 6, não sua decisão final. Nenhuma regra para `apps/`, `backend/`, `mobile/` ou `frontend/`, nenhuma alteração da Constituição, da fonte de política ou de `.devai/config/` está autorizada por esta resposta. A implementação das cinco escolhas é condicionada aos gates do CTG-0003, ao ensaio em clone de cada verbo DEVAI com escrita, à revisão de entrega `PASS` e ao CI verde antes do merge. Nenhuma TASK histórica, PC ou selo é alterado por este registro.
