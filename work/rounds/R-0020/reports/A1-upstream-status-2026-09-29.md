# A1 — estado da rota `sense record` → `audit scorecard`

**Papel:** Architect, Constituição Art. 7. **Data da consulta:** 2026-09-29. **Efeito:** leitura de fontes upstream; nenhuma mudança no pin, no código do DEVAI ou em `record/`.

| Fonte | Rota de leitura do scorecard | Consequência para R-0020 |
| --- | --- | --- |
| DEVAI 1.5.6 pinado | `record/proofs/freshness/readings` | Diverge da saída de `sense record` em `.devai/state/sensor-readings`; o scorecard não observa as leituras gravadas pelo verbo governado. |
| [Release v1.6.0](https://github.com/aarusso-nyx/devai/releases/tag/v1.6.0), publicada em 2026-09-26 | [O código da release](https://github.com/aarusso-nyx/devai/blob/v1.6.0/packages/cli/src/commands/audit/scorecard.ts#L63) ainda lê `record/proofs/freshness/readings`. | Atualizar para 1.6.0 não resolve A1. |
| [Commit `268bb83835e5`](https://github.com/aarusso-nyx/devai/commit/268bb83835e52d05f0932fd8f04d64e4b47104d5) no `main`, de 2026-09-27 | [A fachada atual](https://github.com/aarusso-nyx/devai/blob/main/packages/cli/src/commands/audit/scorecard.ts#L63) chama `resolveScorecardInputs`; [o resolvedor](https://github.com/aarusso-nyx/devai/blob/main/packages/loop/src/scorecard/inputs.ts#L95-L97) usa `.devai/state/sensor-readings`. | Correção existe na fonte principal, porém não constava de release publicada na consulta de 2026-09-29. |

O Owner adotou A1-3=B em `AUTHORIZATION-A1-3-2026-09-29.md`. Portanto, a ordem para CTG-0004 é: obter release que contenha a correção; decidir e aplicar o novo pin em mudança governada; ensaiar `sense record` e `audit scorecard` sobre candidato e HEAD declarados; só aceitar o merge com as quatro células `PASS` reais e sem regressão. O commit upstream isolado não é uma dependência publicada nem prova de integração no DETRAN.

A proposta revisada `contracts/CTG-0004-A1-proposal.md` continua com seu SHA e revisão cruzada originais; esta nota atualiza apenas o estado externo. A1-1 e A1-2 permanecem em consulta separada ao Owner.
