# Autorização A3 do Owner — normalização arquivística de TASKs legadas

**Data:** 2026-09-28. **Papel decisor:** Owner. **Rodada:** R-0020.

Após receber o relatório da lacuna de referência da TASK-0009 e a sequência de decisões necessárias para finalizar a rodada, o Owner declarou literalmente nesta sessão:

> Todas as propostas aceitas. Registre e prossiga

O referente concreto é `reports/RGR-TASK-0009-legacy-tasks.md`, SHA-256 `06d068e0ebef7201480264ad4274b33e9386719cc7b45d8304664836df8389a2`, e a resposta imediatamente anterior do maestro. A decisão **OD-R20-007 = A** aprova:

1. **Q1 / adenda A3:** preservar os bytes originais de cada TASK histórica alterada em sidecar imutável com SHA-256, vínculo verificável na TASK canônica e tabela antes/depois por caminho. O schema 2.0.0 e `verify:round-tasks` continuam estritos; cada novo valor precisa de fonte ou decisão específica.
2. **Q2 = A:** preparar tabela de fontes e propor o mapeamento explícito por classe e arquivo para `db_isolation: none` e outros valores sem correspondente demonstrado. Até a tabela permitir uma decisão semântica específica, o valor permanece `source_pending`. Esta aprovação **não** equivale a converter automaticamente `none` em `database` ou `cluster`.
3. **Q3 = A:** reservar seis IDs numéricos inéditos para as subtarefas corretivas da R-0007 e remapear suas referências, preservando os IDs literais antigos no sidecar e em índice de aliases. A alocação deve ser verificada contra colisões antes de uso.

A aceitação das propostas de finalização também autoriza prosseguir com a preparação de A1, OD-R20-004, OD-R20-006, ADR v2 e recibos históricos nos CTGs previstos. Ela não fornece, por si só, um piso numérico A1, uma escolha entre destinos das observações, o texto dos 11 recibos, a semântica dos 54 isolamentos `none` ou o aceite de uma ADR ainda não apresentada. Esses conteúdos serão apresentados ao Owner quando concretos e revisáveis, antes de efeitos dependentes deles.

Permanece obrigatório o ensaio em clone de todo `devai --write`, revisão da outra família, gates verdes, CI verde e um PR por CTG. Nenhum selo é inferido desta autorização.
