# R-0036 — medição dos 43 itens concluída

Commit avaliado: `e9e45a4a6cbed5cfd394c716c79a55b1aca386b8`. DEVAI publicado **2.6.3**, confirmado como `latest` e adotado por operações registradas. STYNX **1.5.3** preservado.

**43 itens medidos**, sem itens parciais ou bloqueados por medição. Os 11 bloqueios originais foram resolvidos. Resultado nativo: **24 PASS, 10 REVIEW, 9 FAIL, zero UNKNOWN e 2 N/A**. O resultado geral é **FAIL**; esta avaliação não estabelece prontidão de produto ou autorização de integração.

| Indicador | Avaliação inicial | Avaliação atual |
| --- | --- | --- |
| Medidos / parciais / bloqueados | 19 / 13 / 11 | 43 / 0 / 0 |
| PASS / REVIEW / FAIL / UNKNOWN | 18 / 10 / 12 / 3 | 24 / 10 / 9 / 0 |
| N/A | F1:T1 e F4:T5 | Os mesmos dois |

A comparação reflete mudanças de instrumento, entradas e população observada. Não representa melhoria de comportamento do produto: nenhuma correção de produto foi implementada neste trabalho.

## Evidências e limites

- Cobertura **unitária local** de todas as 2.574 fontes de implementação: **23.583 / 43.685 linhas = 53,98%**, veredito REVIEW. Fontes geradas incluídas; relatórios V8 originais e contadores de linha exatos preservados. Limites nativos 80/50 e limites originais por pacote mantidos. Não é cobertura RC, de integração ou E2E.
- Unitários: **12.260 aprovados, zero falhas e 161 TODOs preservados**, em 569 arquivos. Integração: **1.515 aprovados, zero falhas**. E2E: **1.853 aprovados e as duas falhas HTTP 402 preexistentes**, registradas em BL-0016.
- Censo: 63 pacotes, 62 configurações unitárias, 90 arquivos de integração e 54 E2E. Suítes vazias/ausentes e quatro arquivos dos modos real/in-house estão explicitamente excluídos desta rodada local. O teste de upgrade de prioridade roda pelo comando existente de upgrade na tarefa E2E.
- Desempenho local autorizado em ADR-0044: três caminhos reais de requisição, 5 aquecimentos e 30 amostras por cenário, concorrência 1. Maior p50 **8.04 ms**, maior p95 **8.81 ms**, menor vazão **123.88 req/s**, zero erros. Metas iniciais generosas não representam capacidade de produção.
- CI histórico: **93 execuções push/main verificadas**, 92 sucessos, sem filtros não verificados; mediana **1.684 s** e p95 **2.280 s**, FAIL pelos limites existentes. IDs, tentativas e quantis reproduzidos a partir dos dados arquivados. Não é CI deste commit.
- Segurança: **37 vulnerabilidades** (5 críticas, 15 altas, 13 moderadas, 4 baixas). Lint: **1.135 erros e 1 aviso**. Os resultados são mantidos e têm tarefas de produto separadas.
- Sete inventários completos: 1.151 endpoints, 91 rotas, 82 arquivos SQL atuais e 361 declarações CREATE TABLE. São inventários estáticos. Há 45 vínculos estáticos de autorização e 1.106 não resolvidos, além de 70 candidatos a PII sem rótulo. Isso não prova ausência de proteção nem violação legal. O PASS nativo de data handling permanece com essa limitação explícita.
- O leitor de desempenho do inventário usa **21 observações históricas persistidas**, p95 **2917 ms**, e não apenas tempos deste commit. Todos os insumos contribuintes estão arquivados.

Os diagnósticos suplementares `site_drift` e `action_effect_inference` continuam UNKNOWN e têm suas lacunas registradas. Eles não pertencem às 43 coordenadas aplicáveis; não receberam crédito de prontidão.

## Entregas

- [Scorecard nativo](scorecard.json).
- [Registro completo das 43 linhas](evaluation-register.json): critérios, populações, comandos, leituras, limites e responsáveis.
- [Comparação por célula](baseline-comparison.json) e [fechamento dos 11 bloqueios originais](raw/original-blocker-closure.json).
- [Manifesto das evidências de medição](evidence-manifest.json) e [revisão suplementar](supplemental-review-manifest.json).
- [Backlog priorizado separado](raw/remediation-backlog.md), com BL-0013 a BL-0023 abertos. BL-0002 a BL-0012 foram resolvidos por operações registradas.
- [Triagem de governança](raw/governance-finding-triage.json) e [incertezas fora do grid](raw/diagnostic-dispositions.json).

## Validação e preservação

56 instâncias de leituras canônicas foram validadas contra o schema instalado e arquivadas com bytes exatos. As 45 coordenadas são únicas; as 43 aplicáveis têm vereditos sustentados. Os 11 bloqueios originais têm leitura atual e próxima ação de produto quando necessária.

36 controles do coletor/relatório e 56 testes de governança passaram, assim como corpus legal, estado, STYNX, tarefas/índice de rodadas, provas e doctor. A formatação completa apontou somente o arquivo privado preexistente `.claude/settings.local.json`, fora do Git; ele foi preservado.

Limites, N/A, constituição fixada e cadeia legada foram preservados por hash; o prefixo da cadeia governada foi comparado com a avaliação inicial e o commit congelado. A cadeia continua com 53 lacunas históricas reconhecidas. A tentativa de leituras concorrentes em 9f496432 foi preservada; a rodada atual registra a cobertura prévia antes de emitir sua substituta na primeira passagem.

A rodada R-0036 permanece formalmente aberta para revisão e remediações separadas. O trabalho de replanejamento e a decisão P4 permanecem independentes.
