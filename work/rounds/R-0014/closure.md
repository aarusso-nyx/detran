# R-0014 — rascunho de fechamento

Fonte: método da orquestra §10. Este rascunho é para revisão do maestro; não executa fechamento.

## Frente

Frente `portal-pwa`, rodada R-0014, WP-P4, WP-P5 e WP-P6.

A frente entregou o primeiro app do monorepo: 27 telas e 38 rotas.

Incluiu i18n, PWA, cache cifrado de CNH-e/CRLV-e, SSE, push e 11 jornadas.

O ambiente nacional foi o `senatran-mock`; nenhuma homologação externa é afirmada.

## PRs e SHAs de merge

| PR  | Merge                                      | Evidência                                  | Observação            |
| --- | ------------------------------------------ | ------------------------------------------ | --------------------- |
| #60 | `1396f1a6d7cedf2afe5b0f90b9ef1be164c86015` | `EV-52da76e473e87074` (generic sequence 1) | `observe` no SHA      |
| #61 | `2888c9b08dc67a65c3fe102ad5713e04585fc5ec` | `EV-df053f818be6cddb` (generic sequence 2) | `observe` no SHA      |
| #62 | `ddca5272c491cbde41798a2066514d27e473bcd8` | `EV-8df469cfe9b50983` (generic sequence 3) | `observe` no SHA      |
| #63 | `d2412558a05c8ef75935eafaea13ad535d58c7a5` | `EV-fec4e3aefd72f4c2` (generic sequence 4) | `observe` no SHA      |
| #64 | `4c3be45395bafed288186fff7c65e0748f62fe99` | `EV-274b31e6fd107475` (generic sequence 5) | `observe` no SHA      |
| #65 | `11d939f66b413948f6369bb65dabd9b6813302d2` | `EV-2ce4332d24b5875a` (generic sequence 6) | `EV-631e1db24c09716e` |

As evidências estão em `record/proofs/chain.json`; os observados são os commits de merge acima.

## Gates por CTG

CTG-0001: allowlist i18n, parâmetros, lint, testes, typecheck e build foram registrados na evidência.

CTG-0002: `docs:kb:check`, publicação KB e cruzamento tela/ficha/rota/i18n foram registrados.

CTG-0003a, 0003b e 0003c: typecheck, testes, lint, build e `axe` por rota foram registrados.

CTG-0004: 11 e2e contra `senatran-mock`, lint de payload e tiers backend foram registrados.

CTG-0005: cabe ao maestro rodar `docs:kb:check`, `docs:kb:publish-check`, catálogo, formato e os gates finais.

B1 não permite declarar Lighthouse como executado: a evidência automática é `axe-core` em TestBed por rota.

## Orçamento

`budget.json` estima 6.959.875 tokens de entrada e 1.262.818 de saída para a rodada.

A janela 4 encerrou com aproximadamente 4,93 M tokens únicos acumulados.

CTG-0001 teve quatro reviews de delivery/prompt registrados.

CTG-0002 teve dois ciclos de delivery e três prompt-reviews na janela correspondente.

CTG-0003a teve dois delivery-reviews; CTG-0003b teve seis; CTG-0003c teve dois.

CTG-0004 teve três delivery-reviews: FAIL, FAIL contestado e PASS.

No CTG-0004, contrato teve duas iterações, Inspector onze e Engineer cinco.

## Desvios e amendments

B0: prompt-review estrutural falhou; o maestro corrigiu e registrou ciclo restrito.

B1: Lighthouse exigia Chrome/serviço externo; substituído por `axe` por rota (M3).

B2: reviewer temporário pela ponte Claude/Opus, autorizado e marcado como desvio de família.

B3: a partir de 2026-09-19 workers e reviewer passaram ao Codex; maestro permaneceu Claude.

A12 fixou fronteiras disjuntas, regra transversal no módulo dono e leitura integral de vereditos.

A15 vedou asserções por conjunto de status e escapes condicionais.

A18 exige um app isolado por arquivo de spec.

A19(c) proíbe `SENATRAN_*_BASE_URL` em `backend/**`.

A24 preservou o enum canônico do fio e registrou OD-P61, em vez de mudar OpenAPI por paráfrase.

## Pendências

OD-P15: gov.br institucional real e parâmetros de retorno.

OD-P16: homologação SNE real; a rodada só prova o mock via `SnePort`.

OD-P17: montagem de privacy; OD-P19: junta médica e produtores PEC/BOAT.

OD-P61, OD-P88, OD-P102 e OD-P103…OD-P108 permanecem no backlog com donos e fontes.

Lighthouse CI permanece pendente, sem reduzir o gate `axe` atual.

Delegações reais permanecem `delegacao_indisponivel_r0007` até a frente R-0007.

## Lições

Apontar o Architect à fonte de dados do serviço, não só ao seed de mesmo nome.

Comandos acima de 30 s exigem execução pelo maestro em segundo plano, log e polling.

O sandbox não fornece `pkill`; isolamento deve ser estrutural no spec.

Manter `typecheck` como critério de Inspector e Architect explícito em toda tríade.

Usar Terra/médio ou Sonnet/médio para matrizes grandes, sem reduzir estados.

## Próxima ação do maestro

Após revisar este rascunho, registrar a evidência final e executar:

```bash
pnpm exec devai round close --round R-0014 --repo-root . --input work/rounds/R-0014/closure.json --as-role architect --write --format human
```
