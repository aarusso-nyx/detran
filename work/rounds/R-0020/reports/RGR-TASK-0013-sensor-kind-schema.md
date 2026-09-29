# RGR — TASK-0013: `sweep` obrigatório versus enum de SensorReading

**Emissor:** Engineer TASK-0013; triagem Architect/maestro. **Classe:** `reference-gap`. **Risco:** alto — declarar conformidade falsa do sweep e quatro PASS sobre leituras que o schema pinado rejeita. **Estado:** TASK-0013 em `rgr_pending`; CTG-0004 sem PR e sem elegibilidade de merge. Este RGR não altera o schema, o registry, os presets, os testes nem o gate A1-3=B.

## Contradição demonstrada

O contrato `CTG-0004.md` exige que `sweep` selecione **todos os 49 kinds `read`** do registry e valide cada `SensorReading` contra o schema DEVAI pinado. O `sense-presets.json` 1.5.6 lista os 49. Quatro desses kinds estão no registry e no preset, mas **não** no enum `properties.sensor.properties.kind.enum` de `sensor-reading.schema.json`:

| Kind | Registry | Preset sweep | Schema 1.5.6 |
| --- | --- | --- | --- |
| `decision_record_integrity` | `read` | membro | ausente |
| `decision_citation_resolution` | `read` | membro | ausente |
| `archive_immutability` | `read` | membro | ausente |
| `round_record_integrity` | `read` | membro | ausente |

Fontes instaladas: registry SHA-256 `0910facf9d6ffb9b73dc937c3973dcf1d7d8a5fd62272e0154376b85ff7d7806`; preset SHA-256 `96715fa3743f6881d716d2183b505792e1d6f12a470432edc5da679e2e005c12`; schema SHA-256 `dcfb7fc245266d462e789dcc9f437d28cb27564c7b57f7136ae453fae4ba931f`. A comparação determinística de conjuntos dá 59 kinds no registry, 49 `read`, 60 valores no enum, **4 registry-minus-schema** acima e 5 schema-minus-registry (`api_test`, `contract_validation`, `db_test`, `journey_test`, `mutation_test`). Os quatro ausentes continuam ausentes no schema da [release v1.6.0](https://github.com/aarusso-nyx/devai/blob/v1.6.0/law/schemas/sensor-reading.schema.json) e do [`main` consultado em 2026-09-29](https://github.com/aarusso-nyx/devai/blob/main/law/schemas/sensor-reading.schema.json).

O worker interrompeu a TASK conforme a regra 5 do prompt. O arquivo parcial `tools/devai/sense.mjs` (SHA-256 `68ebf6b299942739b8e7cfffc33d97f5dfb3ed2ff4237757d15caf7edbdfc2d0`) **não aplica o documento do schema pinado a campo algum**: contém um validador escrito à mão e valida `sensor.kind` contra o registry. Por isso os 14 testes de TASK-0012 ficam tecnicamente verdes; esse GREEN **não** satisfaz o contrato nem o schema. `package.json` contém somente a adição parcial do script `devai:sense`. Os dois arquivos foram preservados em commit WIP `282623928fdb210d697296247e936b3e9c569b35` na branch local `rgr/TASK-0013`; a worktree temporária do RGR foi removida, e a worktree compartilhada `orchestra/devai-sensors` foi limpa desses dois caminhos. A branch RGR não é PR nem entrega do CTG-0004; nenhum desses arquivos pode entrar em commit de entrega antes da correção do validador. O `pnpm check` iniciado pelo worker não teve resultado conclusivo; não se alega PASS. Um ensaio prévio de `sense run --preset baseline --dry-run` sem `--write` saiu 2 (`AUTHORITY_WRITE_CONSENT_REQUIRED`), sem leitura real; nenhum `sense record`, `--write`, `--publish` ou sensor real foi executado.

## Perguntas estruturadas e decisão Architect

| qid | Pergunta | Opções e consequência | Disposição |
| --- | --- | --- | --- |
| RGR-R20-0013-Q1 | Como resolver a divergência entre os quatro kinds obrigatórios e o enum? | **A:** correção na fonte DEVAI, com teste de emissão e validação dos quatro kinds, release e novo pin governado. **B:** adenda de sweep incompleto, mantendo CTG-0004 bloqueado e quatro PASS pendentes. | **A** é o caminho de execução sob A1-3=B. B não satisfaz o gate. Referência de acompanhamento upstream: issue/PR `source_pending`; este RGR documenta o defeito sem modificar o repositório DEVAI. |
| RGR-R20-0013-Q2 | As duas correções DEVAI devem sair na mesma release? | **A:** mesma release para enum e rota do scorecard. **B:** releases separadas, desde que a versão final pinada contenha comprovadamente ambas as correções. | **A ou B** são tecnicamente válidas; o gate exige um único pin final que inclua ambas. Nenhuma release atual cumpre isso. |
| RGR-R20-0013-Q3 | A pausa por RGR consome tentativa de implementação? | **A:** manter `iteration_count: 0` porque não houve correção sobre uma referência resolvida. **B:** contar uma tentativa, deixando apenas uma após a correção upstream. | **A.** Art. 22 pausa a TASK até resolução da fonte; não há falha de remediação do Engineer. `max_iterations: 2` permanece intacto. |

As perguntas Q1/Q2 explicitam a dependência de fonte externa, sem reabrir a decisão Owner A1-3=B nem autorizar escrita no DEVAI. Se uma solução alternativa exigir mudar o critério de aceitação, ela dependerá de nova decisão Owner; nenhuma é inferida aqui.

## Disposição governada necessária

1. Obter correção no próprio DEVAI que reconcilie o enum do schema, o registry e os presets, com teste upstream de emissão/validação para os quatro kinds; publicar release. A correção de rota do scorecard no commit [`268bb83835e5`](https://github.com/aarusso-nyx/devai/commit/268bb83835e52d05f0932fd8f04d64e4b47104d5) também precisa integrar essa release.
2. Decidir e aplicar o novo pin no DETRAN por procedimento governado, ensaiar em clone, acrescentar caracterização Inspector que valide as **49 leituras** contra o schema efetivamente pinado e retomar TASK-0013 com aplicação do documento JSON Schema integral, sem cópia local das regras. O conjunto `sweep` e as leituras inválidas não podem ser ocultados, pulados nem reclassificados como PASS.
3. Depois, ainda cumprir A1-1/A1-2, executar leituras governadas, obter quatro PASS reais, baseline sem regressão, revisão cruzada e CI verde antes do PR/merge CTG-0004. A1-3=B permanece em vigor; CTG-0005/0006 e fechamento de R-0020 continuam seriais.

Não há decisão Owner inferível que autorize trocar o enum DEVAI por uma validação local mais fraca. Uma adenda alternativa que não produza leituras para esses quatro kinds teria de registrar `sweep` incompleto e manter o CTG-0004 bloqueado sob A1-3=B; não é aplicada neste RGR.
