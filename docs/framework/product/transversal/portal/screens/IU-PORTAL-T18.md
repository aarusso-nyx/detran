---
id: IU-PORTAL-T18
title: Buscar meu boletim de sinistro — especificação de tela
status: draft
apps: [portal]
sources: [REF-CONTRAN-808-2020, REF-LEI-13709-2018]
updated: 2026-09-17
---

Ficha de [IU-PORTAL-001] T-18. Fontes: [UC-PORTAL-013], [RN-PORTAL-118].

## 1. Identidade

`T-18`, "Buscar meu boletim de sinistro", app `portal`, rota `sinistros` (`route-manifest.md`
#27), módulo `sinistros`, `screen: 'T-18'`, `sheet: 'IU-PORTAL-T18'`.

## 2. Acesso

Ator CIDADAO nível simples ([UC-PORTAL-013] pré-condições); guarda `portalAuthGuard`, sem
`entitlementGuard` de alvo único (a lista é filtrada pelo vínculo do CPF do solicitante com cada
registro); `serviceAvailabilityGuard('consulta_bat')`.

## 3. Entrada

Acessa-se de "Meus registros de sinistro" no `CitizenShell` ou a partir de uma notificação
recebida sobre veículo envolvido em ocorrência registrada por terceiro ([UC-PORTAL-013] passo 1).
Sem parâmetro de rota (lista/busca); o vínculo do solicitante é verificado por item antes de
exibir qualquer conteúdo ([UC-PORTAL-013] pré-condições).

## 4. Dados

`GET crashes` (`portal-route-contract.md` §7): projeção BOAT restrita a registros em `FECHADO`/
`INTEGRADO` ([WF-BOAT-001], já canônico via [UC-PORTAL-013]) — busca por vocabulário coloquial
([IU-PORTAL-001] T-18 nota; algoritmo de busca é decisão de implementação, fora desta ficha).
Nenhuma fixture como fallback.

## 5. Estados

- **carregando**: esqueleto da lista/busca.
- **vazio**: nenhum sinistro encontrado para o vínculo do cidadão — explicado, não erro técnico
  (mesmo padrão de [UC-PORTAL-010] alt. 2a).
- **sem elegibilidade / sem permissão**: solicitante sem vínculo comprovado com um sinistro
  específico → acesso negado com explicação, direciona a canal formal (ouvidoria/LGPD)
  ([UC-PORTAL-013] alt. 2b) — a lista em si nunca é "sem permissão" (é filtrada pelo vínculo).
- **erro recuperável**: registro ainda em `RASCUNHO`/`EM_ATENDIMENTO` (não fechado) — informa que
  está em elaboração, sem expor dado parcial como definitivo ([UC-PORTAL-013] alt. 2a).
- **indisponível**: falha de leitura da projeção BOAT — tentar novamente.
- **sucesso**: lista de sinistros pertinentes à condição do cidadão em cada um (condutor,
  proprietário, vítima ou representante).

## 6. Comandos

Nenhum comando de escrita nesta tela — é busca/lista, delegando o detalhe a T-19 (lote C, fora
desta ficha). Cada resultado linka para o próprio sinistro.

## 7. Saída

Cada resultado navega para o detalhe do sinistro (T-19). Sem rascunho a salvar.

## 8. Segurança

Vínculo do CPF do solicitante verificado por item antes de exibir qualquer conteúdo
([UC-PORTAL-013] passo 2). Titular vê o próprio dado sem máscara nos resultados que lhe dizem
respeito ([RN-PORTAL-118]); dado de saúde de terceiro permanece protegido mesmo na lista
([UC-PORTAL-013] AC-2). Todo acesso a registro com dado sensível é auditado ([UC-PORTAL-013]
AC-3).

## 9. Acessibilidade

Campo de busca com rótulo em linguagem coloquial, não jargão de boletim ([IU-PORTAL-001] T-18
nota); resultado da busca anunciado em `aria-live="polite"`; lista navegável por teclado.

## 10. Testes

Unitário: busca não retorna sinistro sem vínculo comprovado do solicitante (AC-4, `FECHADO`/
`INTEGRADO` apenas). Roteamento: presença da rota para nível simples. Jornada feliz: titular
localiza o próprio sinistro e vê seus dados sem máscara (AC-1). Jornada de proteção: dado de
saúde de terceiro não aparece na lista (AC-2).

## Estados obrigatórios

| Estado            | Texto cidadão (chave i18n)               | Ação seguinte                                           |
| ----------------- | ---------------------------------------- | ------------------------------------------------------- |
| carregando        | `portal.states.loading`                  | —                                                       |
| vazio             | `portal.screens.t18.empty`               | ir à ouvidoria se achar que há um sinistro não listado  |
| sem elegibilidade | `portal.screens.t18.state.sem_vinculo`   | canal formal (ouvidoria/LGPD) ([UC-PORTAL-013] alt. 2b) |
| erro recuperável  | `portal.screens.t18.state.em_elaboracao` | aguardar; o registro ainda está em atendimento          |
| sem permissão     | `portal.screens.t18.state.sem_vinculo`   | canal formal (ouvidoria/LGPD)                           |
| indisponível      | `portal.states.unavailable`              | tentar mais tarde                                       |

## Chaves i18n

- `portal.screens.t18.title` — "Buscar meu boletim de sinistro"
- `portal.screens.t18.intro` — "Busque pelo que você lembra do ocorrido." ([IU-PORTAL-001] T-18
  nota, "vocabulário coloquial")
- `portal.screens.t18.empty` — "Não encontramos nenhum sinistro vinculado a você."
- `portal.screens.t18.state.sem_vinculo` — "Não encontramos vínculo seu com este registro."
  ([UC-PORTAL-013] alt. 2b)
- `portal.screens.t18.state.em_elaboracao` — "Este registro ainda está sendo elaborado pelo
  órgão." ([UC-PORTAL-013] alt. 2a)
- `portal.screens.t18.cmd.buscar` — "Buscar"
