---
id: IU-RAIT-015
title: Comunicações do caso — especificação de tela
status: draft
apps: [rait]
sources: [REF-CONTRAN-918, REF-CTB-extracts-raw]
updated: 2026-09-21
---

Ficha da rota `casos/:id/comunicacoes` (`rait-web-frontend.md` §4; sem tela própria em
[IU-RAIT-001], aba do layout T-04). Fontes: [WF-RAIT-001] §Eventos de domínio.

## 1. Identidade

- id: `IU-RAIT-015`; `path`: `casos/:id/comunicacoes` (`route-manifest.md` #15).
- `screen`: `—`.
- módulo: `caso`; componente inteligente: `CommunicationsPage` (`rait-web-frontend.md` §5.3).
- nível: `L2` (`route-manifest.md`).
- slug i18n: `casos-id-comunicacoes`.

## 2. Acesso

- papéis: `rait-secretary` (`route-manifest.md` #15).
- guardas: as de `/casos/:id` + `roleGuard(['rait-secretary'])`.
- sem comando de mutação nesta ficha: a expedição de comunicação ocorre automaticamente na
  transição de estado (`DECIDIDO_AUTORIDADE`/`JULGADO_SESSAO`/`NAO_CONHECIDO` →
  `COMUNICADO`, [WF-RAIT-001]) e não é disparada manualmente por esta tela.

## 3. Entrada

- de onde se chega: navegação de aba a partir de `/casos/:id`.
- parâmetros de rota: `:id` (herdado do layout).
- deep-link canônico: `/casos/:id/comunicacoes`.

## 4. Dados

- resolver: "envios e marcos de ciência" (`route-manifest.md` #15).
- clientes: `data/api/case.client.ts` (histórico de comunicações do caso).
- calculado do backend: evento `RAIT_DECISAO_PUBLICADA` (disparado em
  `DECIDIDO_AUTORIDADE|JULGADO_SESSAO → COMUNICADO`, [WF-RAIT-001] §Eventos) e o marco de ciência
  por canal (Portal/SNE), consumidos por esta tela apenas como leitura.

## 5. Estados

- **carregando**: skeleton da lista de envios.
- **vazio**: nenhuma comunicação expedida ainda.
- **erro recuperável**: falha ao carregar o histórico; retry.
- **sem permissão**: papel fora de `rait-secretary` — `RAIT.FORBIDDEN_ACTION` (403).
- **indisponível (parcial)**: `RAIT.UPSTREAM_SNE_UNAVAILABLE` (503, catálogo §3.11) — badge
  "pendente de retransmissão" no item, a tela local prossegue (catálogo §4).

## 6. Comandos

Nenhum comando de mutação nesta tela — a expedição é automática na transição de estado do caso
([WF-RAIT-001] §Eventos); a tela é o histórico de envios e marcos de ciência.

## 7. Saída

- não navega a outra rota por ação própria; SSE (`case.changed`) atualiza a lista quando uma nova
  comunicação é expedida.

## 8. Segurança e LGPD

- histórico de comunicações não exibe texto livre da petição ([RN-RAIT-134]); dado de terceiro
  citado é suprimido ([RN-RAIT-137]).

## 9. Acessibilidade e atalhos

- estado "pendente de retransmissão" comunicado por rótulo textual, nunca só por cor
  ([IU-RAIT-001] §4).

## 10. Testes

- roteamento: `rait-secretary` ativa; demais papéis → `/sem-permissao` (M14).
- estado "pendente de retransmissão" (`RAIT.UPSTREAM_SNE_UNAVAILABLE`) como critério de aceitação,
  ligado ao catálogo de erros §4.

## Componentes compartilhados

`CaseHeader`, `EventTimeline` (`rait-web-frontend.md` §5.2).

## Chaves i18n

- `rait.screens.casos-id-comunicacoes.title` — "Comunicações"
- `rait.screens.casos-id-comunicacoes.intro` — "Envios e marcos de ciência do caso."
- `rait.screens.casos-id-comunicacoes.empty` — "Nenhuma comunicação expedida ainda."
- `rait.screens.casos-id-comunicacoes.state.pending-retransmission` — "Pendente de retransmissão"
