---
id: IU-PORTAL-T06
title: Meus processos (lista) — especificação de tela
status: draft
apps: [portal]
sources:
  [
    REF-CONTRAN-900,
    REF-CONTRAN-918,
    REF-BENCH-ESTADOS,
    REF-CTB-extracts-raw,
    REF-DECRETO-10543-2020,
    REF-LEI-14129-2021,
  ]
updated: 2026-09-17
---

Ficha de [IU-PORTAL-001] T-06. Fontes: [UC-PORTAL-005], [JRN-PORTAL-003], [RN-PORTAL-111],
[RN-PORTAL-112].

## 1. Identidade

- id: `T-06`; nome visível: "Meus processos".
- app: `portal`; módulo: `processos` (`portal-frontends.md` §4).
- rota: `/processos` (`route-manifest.md` #14); `screen: 'T-06'`, `sheet: 'IU-PORTAL-T06'`.

## 2. Acesso

- ator: CIDADAO nível simples — acompanhar é ato de consulta, nível **simples** ([RN-PORTAL-101]
  linha 1, Decreto 10.543/2020 art. 4º, I, "b"; nota de revisão de [JRN-PORTAL-003]: "nenhuma tela
  desta jornada deveria interromper [o cidadão] com pedido de confirmação de identidade adicional").
- `access`: `simples`; guardas `portalAuthGuard` + `assuranceGuard('simples')`; sem `entitlement`
  próprio (a lista é filtrada pelo vínculo do sujeito autenticado — `route-manifest.md` #14).

## 3. Entrada

- de onde se chega: navegação principal do `CitizenShell` (`portal-frontends.md` §5.1); link de
  notificação em T-12.
- sem parâmetros de rota; leitura pura.

## 4. Dados

- `GET /v1/portal/requests?state&kind&period` (`portal-route-contract.md` §5) → `{ items[]{
requestId, protocol, serviceKey, targetLabel, situation, nextAction{ by: citizen | agency | none,
label, dueOn? }, updatedAt } }` — projeção `portal.process_timeline` (via ADR-0020).
- ordenável por urgência de prazo, não só por data de protocolo — múltiplos processos simultâneos
  (ex.: frota) são filtráveis ([UC-PORTAL-005] 2a).
- status em linguagem cidadã e uma linha do tempo simplificada; o vocabulário interno do RAIT nunca
  vaza para o PORTAL ([UC-PORTAL-005] AC-PORTAL-005-3).

## 5. Estados

- **carregando**: skeleton da lista.
- **vazio**: nenhum processo protocolado — "Você ainda não tem nenhum processo em andamento" com
  caminho para consultar multas (T-14).
- **sem elegibilidade**: não se aplica (lista sempre restrita ao próprio sujeito, sem alvo externo a
  verificar).
- **erro recuperável**: falha transitória ao carregar a lista → retry.
- **sem permissão**: não se aplica (nível simples já é suficiente; nenhuma ação de nível superior
  ocorre nesta tela).
- **indisponível**: projeção fora do ar → banner "estamos sem acesso aos seus processos agora" +
  tentar novamente.
- **sucesso**: lista com status cidadão, de quem é a próxima ação (`nextAction.by`), e prazo
  destacado quando aplicável ([UC-PORTAL-005] AC-PORTAL-005-2).
- **processo sem movimentação recente**: sistema não deixa o status "parado" sem explicação — mostra
  a última ação e, quando disponível, a expectativa de prazo ([UC-PORTAL-005] 3a).

## 6. Comandos

Tela de leitura/navegação; cada item abre T-07 (detalhe). Nenhum comando de escrita nesta tela.

- filtro/ordenação por urgência de prazo é ação de UI local, sem chamada de escrita.
- "um clique não muda estado jurídico só pela UI" — abrir um item é só navegação.

## 7. Saída

- cada item leva a T-07; sem estado a salvar nesta tela.

## 8. Segurança

- vínculo: cada item já vem filtrado pelo `portal.entitlement` do sujeito autenticado no servidor —
  a lista nunca mistura processos de outro cidadão.
- titular sem máscara nos próprios processos ([RN-PORTAL-118] citada em `portal-frontends.md` §2.4).
- nenhum token interno em tela/URL/log; `situation` já chega traduzida.

## 9. Acessibilidade

- lista navegável por teclado, cada item com rótulo completo (protocolo + status + prazo) lido em
  voz alta de forma coerente.
- ordenação/filtro acessível via teclado, com `aria-live` ao reordenar.
- alvo de toque ≥ 44×44px em cada item da lista, mobile-first (`_intake/ux-notes.md` §g).

## 10. Testes

- unitário: ordenação por urgência de prazo; tradução de `situation` sem vazar token interno.
- roteamento: `assuranceGuard('simples')` presente e ausente.
- jornada feliz: múltiplos processos listados e filtráveis; jornada de vazio: nenhum processo →
  mensagem + caminho para T-14; jornada de erro: falha de leitura → retry.

## Estados obrigatórios

| Estado            | Texto cidadão (chave i18n)                                                     | Ação seguinte                         |
| ----------------- | ------------------------------------------------------------------------------ | ------------------------------------- |
| carregando        | "Carregando seus processos..." (`state.loading`)                               | nenhuma                               |
| vazio             | "Você ainda não tem nenhum processo em andamento" (`state.empty`)              | consultar multas (T-14)               |
| sem elegibilidade | não se aplica (lista sempre restrita ao próprio sujeito)                       | —                                     |
| erro recuperável  | "Não conseguimos carregar agora. Tente novamente." (`state.error_recoverable`) | tentar de novo                        |
| sem permissão     | não se aplica (nível simples já suficiente)                                    | —                                     |
| indisponível      | "Estamos sem acesso aos seus processos agora" (`state.unavailable`)            | tentar mais tarde + canal alternativo |

## Chaves i18n

- `portal.screens.t06.title` — "Meus processos" (obrigatória)
- `portal.screens.t06.state.loading` — "Carregando seus processos..."
- `portal.screens.t06.state.empty` — "Você ainda não tem nenhum processo em andamento"
- `portal.screens.t06.state.error_recoverable` — "Não conseguimos carregar agora. Tente novamente."
- `portal.screens.t06.state.unavailable` — "Estamos sem acesso aos seus processos agora"

Rótulos de estado interno (`portal.situation.*`), erros (`portal.errors.*`) e textos jurídicos
(`portal.legal.*`) são referenciados por TASK-0006, não redefinidos aqui.
