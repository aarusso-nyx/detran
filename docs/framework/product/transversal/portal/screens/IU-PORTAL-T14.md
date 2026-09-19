---
id: IU-PORTAL-T14
title: Minhas multas e pontuação — especificação de tela
status: draft
apps: [portal]
sources: [REF-DECRETO-10543-2020, REF-LEI-14129-2021, REF-LEI-13460-2017]
updated: 2026-09-17
---

Ficha de [IU-PORTAL-001] T-14. Fontes: [UC-PORTAL-010], [JRN-PORTAL-004], [RN-PORTAL-103].

## 1. Identidade

`T-14`, "Minhas multas e pontuação", app `portal`, rota `autos` (`route-manifest.md` #8), módulo
`autos`, `screen: 'T-14'`, `sheet: 'IU-PORTAL-T14'`.

## 2. Acesso

Ator CIDADAO nível simples ([UC-PORTAL-010] pré-condições, Decreto 10.543/2020 art.4º I, "b");
guarda `portalAuthGuard`, sem `entitlementGuard` de alvo único — a lista é filtrada pelo próprio
CPF autenticado; `serviceAvailabilityGuard('consulta_multas')`.

## 3. Entrada

Ponto de entrada mais frequente do PORTAL, acessado da tela inicial ([JRN-PORTAL-004] narrativa
1). Sem parâmetro de rota; nenhum outro número além do CPF identifica o cidadão
([RN-PORTAL-103], [UC-PORTAL-010] AC-1).

## 4. Dados

`GET aits?vehicle&status&page` (`portal-route-contract.md` §4): `{ items[]{ aitId, aitNumber,
plate, occurredAt, framingLabel, amount, situation, deadlines[]{ kind, dueOn, ownedBy },
pointsStatus: em_disputa | definitivo | none, actions[]{ key, available, reason?,
minimumAssurance } }, total, page, pageSize }` — projeção `portal.infraction_view`. `GET
points-summary`: total, por veículo, últimos 12 meses. Nenhuma fixture como fallback.

## 5. Estados

- **carregando**: esqueleto da resposta direta + lista.
- **vazio**: CPF sem nenhum vínculo encontrado — explicado, não tratado como erro técnico
  ([UC-PORTAL-010] alt. 2a).
- **sem elegibilidade / sem permissão**: não se aplica — a consulta é sempre do próprio CPF.
- **erro recuperável**: falha ao carregar a lista — tentar novamente.
- **indisponível**: `serviceAvailabilityGuard` com `consulta_multas: unavailable` → tela de
  indisponibilidade com motivo, nunca 404.
- **sucesso**: resposta direta de pontuação antes da tabela ([JRN-PORTAL-004] narrativa 2), cada
  item com ação disponível ou motivo de ausência ([UC-PORTAL-010] AC-2).

## 6. Comandos

Nenhum comando de escrita nesta tela. Cada item da lista linka para a ação seguinte relevante
(defender T-02, indicar condutor T-05, pagar T-13) ou diz explicitamente que não há ação
([UC-PORTAL-010] passo 3/AC-2). Filtro por veículo (PJ com frota) ou por status ([UC-PORTAL-010]
passo 4) — filtragem client-side sobre a página carregada, sem mudar estado do servidor.

## 7. Saída

Cada item navega para `/autos/:aitId` (T-01) ou diretamente para a ação (defesa/indicação/
pagamento). Filtro/paginação não persiste entre sessões.

## 8. Segurança

Identificação só por CPF ([RN-PORTAL-103]); nenhum outro número exigido. Nada de token/segredo em
tela/URL/log.

## 9. Acessibilidade

A resposta direta (pontuação) é o primeiro conteúdo lido, antes da tabela ([JRN-PORTAL-004]
narrativa 2 — "sem rolagem"); cada linha da lista é acionável ou diz por que não é mais, nunca uma
linha morta de tabela sem contexto para leitor de tela; contraste testado para uso ao ar livre
(`_intake/ux-notes.md` §f).

## 10. Testes

Unitário: nenhum campo de identificação além de CPF é obrigatório (AC-1). Jornada feliz: cada
item da lista traz ação ou motivo de ausência (AC-2). Jornada de pontuação: pontos em disputa
distintos de definitivos ([RN-RAIT-131], citado por [JRN-PORTAL-004] narrativa 4 — não são
lançados até esgotados os recursos). Jornada de vazio: CPF sem vínculo é explicado, não é erro
técnico (alt. 2a).

## Estados obrigatórios

| Estado            | Texto cidadão (chave i18n)                           | Ação seguinte                                        |
| ----------------- | ---------------------------------------------------- | ---------------------------------------------------- |
| carregando        | `portal.states.loading`                              | —                                                    |
| vazio             | `portal.screens.t14.empty`                           | ir à ouvidoria se achar que há divergência (alt. 2b) |
| sem elegibilidade | n/a — consulta do próprio CPF                        | —                                                    |
| erro recuperável  | `portal.states.error` + `portal.common.action.retry` | tentar novamente                                     |
| sem permissão     | n/a — consulta do próprio CPF                        | —                                                    |
| indisponível      | `portal.states.service_unavailable`                  | canal alternativo ([RN-PORTAL-105])                  |

## Chaves i18n

- `portal.screens.t14.title` — "Minhas multas e pontuação"
- `portal.screens.t14.intro` — "Veja sua pontuação e o que fazer com cada multa."
  ([JRN-PORTAL-004] narrativa 2)
- `portal.screens.t14.empty` — "Não encontramos nenhum registro para o seu CPF."
  ([UC-PORTAL-010] alt. 2a)
- `portal.screens.t14.cmd.filtrar_veiculo` — "Filtrar por veículo"
- `portal.screens.t14.field.pontos_disputa` — "Pontos em disputa — ainda podem não se confirmar."
  ([RN-RAIT-131], via [JRN-PORTAL-004] narrativa 4)
