---
id: IU-RAIT-038
title: Colegiado — convocação extraordinária — especificação de tela
status: draft
apps: [rait]
sources: [REF-CONTRAN-357, REF-CONTRAN-901-2022, REF-JARI-ORGANIZACAO-BENCHMARK]
updated: 2026-09-21
---

Ficha da rota `/colegiado/:orgao/extraordinaria` (`rait-web-frontend.md` §4; sem tela própria em
[IU-RAIT-001]).
Fontes: [UC-RAIT-021], [RN-RAIT-112], [RN-RAIT-139], [RN-RAIT-142].

## 1. Identidade

- id: `IU-RAIT-038`; rota: `/colegiado/:orgao/extraordinaria` (`route-manifest.md` #38);
  `screen: '—'`.
- módulo: `colegiado` (`rait-web-frontend.md` §2).
- página: `ExtraordinaryPage` (`rait-web-frontend.md` §5.3).
- nível: `L2` (`route-manifest.md` #38).
- slug i18n: `colegiado-orgao-extraordinaria` (`route-manifest.md` §A).

## 2. Acesso

- papel: `rait-chair` (`route-manifest.md` #38).
- guardas: `raitAuthGuard` + `roleGuard(['rait-chair'])` (M4).
- chave de política: `inf:rait-session:convene-extraordinary` (§7, notação
  `rait-session:convene-extraordinary` de JW-08 passo 7).
- pré-condição: escalonamento `CRITICO` recebido (`WF-RAIT-002` §6) ou projeção do gestor
  ([UC-RAIT-040]) indicando que a fila F-J-3 não cabe nas ordinárias antes dos marcos
  ([UC-RAIT-021] Pré-condições).

## 3. Entrada

- de onde se chega: `/colegiado/:orgao/pauta` (quando volume de `CRITICO` excede a capacidade
  ordinária, [UC-RAIT-005] Fluxo alternativo 2a); JW-08 passo 7.
- parâmetros de rota: `:orgao`.
- deep-link canônico: `/colegiado/jari/extraordinaria`.

## 4. Dados

- resolver: "convocação extraordinária" (`route-manifest.md` #38).
- cliente gerado: `data/api/session.client.ts`.
- campos exibidos: fila F-J-3 por dias restantes (`WF-RAIT-004` §2.2), capacidade das próximas
  sessões ordinárias ([UC-RAIT-021] Fluxo 1), quantas sessões remuneradas restam no mês
  ([UC-RAIT-021] AC-RAIT-021-2).
- calculado do backend: teto mensal de sessões remuneradas é parâmetro pendente de fonte
  (OD-012/OD-207, `open-decisions-rait.md` §A/§C) — a tela exibe "premissa de desenho — pendente
  de decisão" enquanto o valor não é definido ([UC-RAIT-043] Fluxo 1a; §E de
  `open-decisions-rait.md`).

## 5. Estados

- carregando: skeleton da lista F-J-3.
- vazio: "nenhum caso crítico fora da capacidade das ordinárias".
- erro recuperável: falha transitória ao convocar — retry.
- sem permissão: 403 → banner "sem permissão para esta ação".
- conflito: `RAIT.EXTRAORDINARY_NO_CRITICAL` (422) — convocação sem casos
  `ALERTA_N3`/`CRITICO`; `RAIT.SESSION_PAID_CAP_REACHED` (422) — teto mensal de sessões
  remuneradas atingido, parâmetro pendente de fonte (`rait-error-catalog.md` §3.7) → diálogo
  bloqueante com a base legal.
- indisponível: não se aplica (`L2`) — o parâmetro de teto pendente não bloqueia a rota, só o
  comando quando o teto (quando parametrizado) for atingido.

## 6. Comandos

| Ação (`recurso:ação`)                | Papel        | Pré-estado → pós-estado                                                              | Comando (§7, proposto)                              | Confirmação com efeito jurídico                                                                  | Erros esperados                                                   |
| ------------------------------------ | ------------ | ------------------------------------------------------------------------------------ | --------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| `rait.session:convene-extraordinary` | `rait-chair` | fila F-J-3 em `CRITICO` acima da capacidade → sessão criada com `extraordinary=true` | `POST /v1/inf/rait/sessions` (`extraordinary=true`) | "A convocação extraordinária só leva os casos em risco à pauta, salvo justificativa registrada." | `RAIT.EXTRAORDINARY_NO_CRITICAL`, `RAIT.SESSION_PAID_CAP_REACHED` |

Endpoint de comando: R-0007 CTG-0004 (`rait-web-frontend.md` §11). `If-Match` sempre exigido.

## 7. Saída

- sessão extraordinária criada: leva à formação de banca
  (`/colegiado/:orgao/sessoes/:id/banca`, [UC-RAIT-015]) e segue `WF-RAIT-003`.
- teto mensal já atingido (parâmetro pendente de fonte): presidente decide entre sessão não
  remunerada, com anuência registrada, ou escalonamento ao gestor para nova turma
  ([UC-RAIT-021] Fluxo alternativo 2a; ver `/gestao/turmas`, fora deste lote).
- sem quorum: `SESSAO_ADIADA` e incidente de capacidade ao gestor
  ([UC-RAIT-021] Fluxo alternativo 3a).

## 8. Segurança e LGPD

- pauta restrita aos casos em risco — texto livre da petição não é exibido além do necessário à
  seleção ([RN-RAIT-134]).
- nenhum segredo em URL/log.

## 9. Acessibilidade e atalhos

- `j/k`/`enter` para navegar a fila F-J-3.
- risco (`ALERTA_N3`/`CRITICO`) sempre por rótulo textual e ordenação, não só cor
  ([IU-RAIT-001] §4).
- foco visível; convocação com confirmação explícita do efeito jurídico (antecedência mínima ou
  registro de convocação curta em ata).

## 10. Testes

- unitário: a extraordinária só leva casos em risco ([UC-RAIT-021] AC-RAIT-021-1); o teto
  remuneratório é visível na convocação (AC-RAIT-021-2).
- roteamento: `rait-chair` ativa; demais papéis → `/sem-permissao`.
- estados: `RAIT.EXTRAORDINARY_NO_CRITICAL`; `RAIT.SESSION_PAID_CAP_REACHED` com o parâmetro
  "pendente de fonte".

## Componentes compartilhados

`RiskFlag`, `DeadlineChip`, `QueueTable`, `LegalBasisTooltip`.

## Chaves i18n

- `rait.screens.colegiado-orgao-extraordinaria.title` — "Convocação extraordinária"
- `rait.screens.colegiado-orgao-extraordinaria.intro` — "Casos críticos que não cabem nas sessões ordinárias"
- `rait.screens.colegiado-orgao-extraordinaria.empty` — "Nenhum caso crítico fora da capacidade das ordinárias"
- `rait.screens.colegiado-orgao-extraordinaria.cmd.convene` — "Convocar sessão extraordinária"
- `rait.screens.colegiado-orgao-extraordinaria.state.paid_cap_pending` — "Teto de sessões remuneradas: premissa de desenho — pendente de decisão"
