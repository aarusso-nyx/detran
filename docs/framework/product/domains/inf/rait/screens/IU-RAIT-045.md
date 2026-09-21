---
id: IU-RAIT-045
title: Amostragem de qualidade — especificação de tela
status: draft
apps: [rait]
sources: [REF-CONTRAN-918, REF-CONTRAN-357]
updated: 2026-09-21
---

Ficha da rota `gestao/qualidade` (`rait-web-frontend.md` §4).
Fontes: [UC-RAIT-025], [JRN-RAIT-004].

## 1. Identidade

- id `IU-RAIT-045`; `path`: `gestao/qualidade` (route-manifest.md #46); `screen`: `—`.
- módulo `gestao`; página `QualitySamplingPage`, componente inteligente `SampleReviewList` (§5.3).
- nível `L1`; slug i18n `gestao-qualidade`.

## 2. Acesso

- papel: `rait-coordinator` (route-manifest.md linha 46; subcoordenador, ator de [UC-RAIT-025]).
- guardas: `raitAuthGuard`; `roleGuard(['rait-coordinator'])`.
- chave de política: `inf:rait-quality-sample:review` (comando citado em
  `rait-web-journeys/JW-02-coordenador.md` #5).

## 3. Entrada

- chega-se pela navegação do módulo `gestao`.
- aceita `?q=&ordem=&filtro=` para período.

## 4. Dados

- resolver: "amostragem e achados" (route-manifest.md).
- leitura pelo cliente CRUD do worklist (nível L1): amostra estratificada por revisor e
  enquadramento, sorteada pelo sistema sobre casos em `DECIDIDO_AUTORIDADE` do período
  ([UC-RAIT-025] fluxo 1; proposta 5% ou mínimo 10/mês, [WF-RAIT-004] §2.1 F-DP-Q).

## 5. Estados

- **carregando / vazio / erro recuperável / sem permissão**: padrão.

## 6. Comandos

| Ação (`recurso:ação`)        | Papel              | Pré-estado → pós-estado                        | Comando                          | Confirmação                                                               | Erros esperados |
| ---------------------------- | ------------------ | ---------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------- | --------------- |
| `rait-quality-sample:review` | `rait-coordinator` | item da amostra sem achado → achado registrado | não sourceado em §7 (`JW-02` #5) | "o achado não reabre a decisão comunicada" ([UC-RAIT-025] 2a; Owner C.22) | —               |

- `endpoint de comando: R-0007 CTG-0004`; `If-Match` sempre.
- achado grave em decisão já comunicada não reabre a decisão (Owner C.22); gera treinamento ou
  recurso de ofício da autoridade quando cabível ([UC-RAIT-025] 2a).

## 7. Saída

- achados individuais vão ao revisor como feedback; achados sistemáticos (mesmo vício de
  autuação) vão ao TEAT e à JARI ([UC-RAIT-025] fluxo 3; Res. 357 item 3.1.c).
- indicador de divergência por revisor atualizado no dashboard ([UC-RAIT-025] fluxo 4).

## 8. Segurança e LGPD

- comparação nominal entre revisores só em nível de gestão, com finalidade registrada.

## 9. Acessibilidade e atalhos

- `SampleReviewList` navegável por teclado; contraste AA.

## 10. Testes

- AC-RAIT-025-1 — amostra aleatória cobre todos os revisores e os enquadramentos mais frequentes.
- AC-RAIT-025-2 — três achados do mesmo vício geram comunicação ao TEAT/JARI com os AITs.
- roteamento: `rait-coordinator` ativa; demais papéis → `/sem-permissao`.

## Componentes compartilhados

Nenhum de §5.2 aplica diretamente; `SampleReviewList` (§5.3, gestao) é o componente inteligente.

## Chaves i18n

- `rait.screens.gestao-qualidade.title` — "Amostragem de qualidade"
- `rait.screens.gestao-qualidade.cmd.review` — "Registrar achado"
