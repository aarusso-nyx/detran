# R-0021 — preflight do fechamento

Papel: Architect (Astra/preparador). Achado somente de leitura durante a CI do PR #151; este relatório pertence ao CTG-0007, não altera o candidato publicado do CTG-0002.

O `TASK_ROUND_INACTIVE` observado pelo maestro tem uma causa concreta no DEVAI 1.5.6 instalado. Em `node_modules/@aarusso-nyx/devai/dist/runtime/index/release-host.js:188222`, `authorizationIsActive` exige que `work/rounds/R-0021/AUTHORIZATION.md` contenha os marcadores literais `status: active` e `GRANTED`, além de não existir `close-state.jsonl`. O documento atual registra corretamente a autorização expressa do Owner, mas não contém esses dois marcadores de máquina. Não é falta de autorização do Owner e não exige uma nova pergunta.

Antes de executar `round close`, o Architect deve materializar esses marcadores na autorização existente, preservando integralmente as decisões e registrando que se trata da representação da autorização já concedida. Fazer isso no CTG-0007 e incluir no seu review, sem atualizar o PR #151 por esse motivo. A mesma precondição é usada por `round close` (`release-host.js:217962`), de modo que ignorá-la impediria o fechamento.

`round close` chama `closePhase`; `round seal` chama `closeGovernedRound` (`release-host.js:218176`), que aplica `assertClosePreconditions`. A rejeição `ROUND_ARCHIVE_VALIDATION_NOT_GREEN` é desta segunda operação. Portanto, manter os critérios transferidos como `fail`, emitir o close real e não fabricar `record.md`, `close-state.jsonl` ou selo. As linhas citadas pertencem ao bundle instalado de `@aarusso-nyx/devai@1.5.6` e são referência de inspeção, não arquivos a editar.

Este preflight não executou mutações DEVAI, não alterou a autorização e não produz um recibo de fechamento. O maestro continua sendo o único escritor do Git e das provas.

Para o orçamento consolidado, acrescentar uma entrada distinta `astra-upstream-and-supervision`: estimativa de 125.000 tokens de entrada única e 12.000 de saída para publicação/verificação das 19 issues, supervisão após o handoff e este preflight. É estimativa conservadora, não telemetria bruta; não substitui nem duplica as entradas de planejamento/materialização anteriores ao handoff. Ajustar ao encerramento se surgir telemetria disponível.

Janela: manter o limite atual de 5 horas. O maestro histórico preservado em `inputs/00-maestro-before-A1.md` prevê duas janelas (§0) e retomada por novo maestro após checkpoint (§10). A instrução do Owner é executar até a conclusão mantendo limites de janela e retomada. Portanto, se for necessário, o preparador iniciará uma nova sessão limpa Sol/high a partir do checkpoint ao fim desta janela; não é necessário ampliar esta sessão em duas horas nem pedir nova autorização para a retomada já prevista. Preservar o consumo da janela 1, sem reiniciar contadores antes do limite ou perder a contabilidade global.
