---
id: IU-PORTAL-T12
title: Caixa de entrada / notificações — especificação de tela
status: draft
apps: [portal]
sources:
  [REF-CONTRAN-900, REF-CONTRAN-931, REF-LEI-14129-2021, REF-DETRANAM-SERVICOS]
updated: 2026-09-17
---

Ficha de [IU-PORTAL-001] T-12. Fontes: transversal (sem UC dedicado — [IU-PORTAL-001] §A),
[WF-PORTAL-003], [RN-PORTAL-124].

## 1. Identidade

`T-12`, "Suas notificações", app `portal`, rota `notificacoes` (`route-manifest.md` #21), módulo
`notificacoes`, `screen: 'T-12'`, `sheet: 'IU-PORTAL-T12'`.

## 2. Acesso

Ator CIDADAO nível simples; guarda `portalAuthGuard`, sem `entitlementGuard` (a caixa é do
próprio sujeito da sessão, sem alvo externo). Pré-condição: nenhuma além de sessão ativa.

## 3. Entrada

Ponto de entrada transversal — link do rodapé/cabeçalho do `CitizenShell`
(`portal-frontends.md` §5.1) e destino de qualquer notificação disparada por outro serviço
(`inbox.item` via SSE, ADR-0016). Sem parâmetro de rota; sem rascunho a recuperar (leitura +
marcação de lida).

## 4. Dados

`GET inbox?kind&read` (`portal-route-contract.md` §6): `{ items[]{ id, kind: acao_necessaria |
informativo, source: sne | portal, subject, summary, aitId?, requestId?, availableOn, readOn?,
fictitiousAcknowledgementOn? (só SNE), deadline?{ dueOn, ownedBy } } }`. `POST inbox/{id}/read`
registra leitura e, para item SNE, a evidência de ciência. Tempo real: `GET /v1/portal/stream`
(`inbox.item`), fallback de polling 60 s (`portal-frontends.md` §8). Nenhuma fixture como
fallback.

## 5. Estados

- **carregando**: esqueleto da lista.
- **vazio**: "Você não tem notificações." — não é erro.
- **sem elegibilidade / sem permissão**: não se aplica — a caixa é sempre do próprio sujeito.
- **erro recuperável**: falha ao carregar a lista — tentar novamente.
- **indisponível**: SSE/polling indisponível — a lista já carregada permanece visível, sem
  promessa de atualização em tempo real (`portal-frontends.md` §8 "offline").
- **sucesso**: lista com canal identificado por item ([RN-PORTAL-124] dever 1/4) e prazo já
  calculado quando houver ([RN-PORTAL-124] item `deadline`).

## 6. Comandos

"Marcar como lida" (`POST inbox/{id}/read`, idempotente por natureza da ação): para item de canal
`sne`, o registro de leitura é também evidência de ciência (`NOTIFICACAO_CIENCIA`, ADR-0016) — a
tela não distingue visualmente esse efeito adicional do cidadão, mas o `data-token` carrega
`source: sne` para suporte ([RN-PORTAL-124] item 4). Cada item linka direto para a tela relevante
do próprio item (`aitId`/`requestId`), nunca para a home genérica (`_intake/ux-notes.md`
"Trilha de apelação").

## 7. Saída

Cada item navega para a tela do assunto (`/autos/:aitId`, `/processos/:requestId`, etc.); "voltar"
retorna à própria caixa. Nada a salvar; sem confirmação de abandono.

## 8. Segurança

Escopo da sessão (ADR-0019); nenhum outro sujeito acessa a caixa de outro cidadão. Nada de
token/segredo em tela/URL/log; `data-token` só para o rótulo interno de `source`/`kind`, nunca
exibido cru na tela.

## 9. Acessibilidade

Lista navegável por teclado; item com pendência (`kind: acao_necessaria`) anunciado como tal por
leitor de tela, não só por cor (`_intake/ux-notes.md` §f, "nunca só vermelho/laranja"); mudança de
contagem de não lidas em `aria-live="polite"`.

## 10. Testes

Unitário: item SNE marca ciência ao ser lido (`fictitiousAcknowledgementOn` vs. `readOn`).
Roteamento: presença da rota para todo nível simples, ausência para anônimo. Jornada feliz: item
de diligência (`kind: acao_necessaria`) leva direto a T-11. Jornada de indisponibilidade: SSE cai,
lista já carregada permanece, sem erro bloqueante.

## Estados obrigatórios

| Estado            | Texto cidadão (chave i18n)                           | Ação seguinte                     |
| ----------------- | ---------------------------------------------------- | --------------------------------- |
| carregando        | `portal.states.loading`                              | —                                 |
| vazio             | `portal.screens.t12.empty`                           | —                                 |
| sem elegibilidade | n/a — caixa do próprio sujeito                       | —                                 |
| erro recuperável  | `portal.states.error` + `portal.common.action.retry` | tentar novamente                  |
| sem permissão     | n/a — caixa do próprio sujeito                       | —                                 |
| indisponível      | `portal.screens.t12.state.sem_tempo_real`            | lista carregada permanece visível |

## Chaves i18n

- `portal.screens.t12.title` — "Suas notificações"
- `portal.screens.t12.empty` — "Você não tem notificações."
- `portal.screens.t12.state.sem_tempo_real` — "Não conseguimos atualizar em tempo real agora —
  mostrando o que já foi carregado." ([RN-PORTAL-124] item 4; `portal-frontends.md` §8)
- `portal.screens.t12.cmd.marcar_lida` — "Marcar como lida"
- `portal.screens.t12.field.canal` — "Recebido por {source}" (`sne` ou "canal do PORTAL")
  ([RN-PORTAL-124] dever 1)
