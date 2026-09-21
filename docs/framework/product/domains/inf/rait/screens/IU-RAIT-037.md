---
id: IU-RAIT-037
title: Colegiado — itens com vista e prazos — especificação de tela
status: draft
apps: [rait]
sources: [REF-CONTRAN-901-2022, REF-CONTRAN-357, REF-JARI-ORGANIZACAO-BENCHMARK]
updated: 2026-09-21
---

Ficha da rota `/colegiado/:orgao/vistas` (`rait-web-frontend.md` §4; sem tela própria em
[IU-RAIT-001]).
Fontes: [UC-RAIT-019], [RN-RAIT-105], [RN-RAIT-116], [RN-RAIT-117].

## 1. Identidade

- id: `IU-RAIT-037`; rota: `/colegiado/:orgao/vistas` (`route-manifest.md` #37);
  `screen: '—'`.
- módulo: `colegiado` (`rait-web-frontend.md` §2).
- página: `ViewsPage` (`rait-web-frontend.md` §5.3).
- nível: `L2` (`route-manifest.md` #37).
- slug i18n: `colegiado-orgao-vistas` (`route-manifest.md` §A).

## 2. Acesso

- papéis: `rait-chair`, `rait-rapporteur` (`route-manifest.md` #37).
- guardas: `raitAuthGuard` + `roleGuard(['rait-chair', 'rait-rapporteur'])` (M4).
- chave de política: `PATCH agenda-items/{id}` (JW-07 passo 6, análoga à notação §7); deferimento
  de vista é ato do presidente na sessão (IU-RAIT-034), não desta tela.
- pré-condição: sessão em `RELATORIA_LIDA` ou `VOTACAO` para o item (`WF-RAIT-003`); membro
  presente, não impedido no item ([UC-RAIT-019] Pré-condições).

## 3. Entrada

- de onde se chega: `/colegiado/:orgao/sessoes/:id` (item com vista concedida); JW-07 passo 6;
  JW-08 (fluxo de telas, ramal de item reprogramado).
- parâmetros de rota: `:orgao`.
- lista aceita `?q=&ordem=&filtro=`.
- deep-link canônico: `/colegiado/jari/vistas`.

## 4. Dados

- resolver: "itens com vista e prazos" (`route-manifest.md` #37).
- cliente gerado: `data/api/session.client.ts`, `PATCH /v1/inf/rait/agenda-items/{id}` (§7).
- campos exibidos: item com vista concedida, prazo (proposta: até a sessão ordinária seguinte,
  prorrogável uma vez por motivo registrado — [UC-RAIT-019] Fluxo 1), voto-vista pendente ou
  registrado.
- calculado do backend: prazo de vista não suspende `T-JUL-24M`/`T-PAR-3A`
  ([UC-RAIT-019] AC-RAIT-019-1; [RN-RAIT-105]) — exibido, nunca recalculado no cliente.

## 5. Estados

- carregando: skeleton da lista de vistas.
- vazio: "nenhum item com vista pendente".
- erro recuperável: falha transitória ao registrar o voto-vista — retry, mantém o texto.
- sem permissão: 403 `RAIT.FORBIDDEN_ORGAO` → banner "sem permissão para esta ação".
- conflito: `RAIT.VIEW_DEADLINE_EXCEEDED` (409) — devolução de vista após o prazo
  (`rait-error-catalog.md` §3.7) → recarrega.
- indisponível: não se aplica (`L2`).

## 6. Comandos

| Ação                 | Papel             | Pré-estado → pós-estado                                                             | Comando (§7)                           | Confirmação com efeito jurídico                                                         | Erros esperados               |
| -------------------- | ----------------- | ----------------------------------------------------------------------------------- | -------------------------------------- | --------------------------------------------------------------------------------------- | ----------------------------- |
| registrar voto-vista | `rait-rapporteur` | item com vista concedida → voto-vista registrado, item pronto para a pauta seguinte | `PATCH /v1/inf/rait/agenda-items/{id}` | "O voto-vista é anexado ao item; nenhum relógio legal é reiniciado por causa da vista." | `RAIT.VIEW_DEADLINE_EXCEEDED` |

Endpoint de comando: R-0007 CTG-0004 (`rait-web-frontend.md` §11). `If-Match` sempre exigido.

## 7. Saída

- voto-vista registrado no prazo: item entra na pauta seguinte com prioridade obrigatória, à
  frente da ordem FIFO ([UC-RAIT-019] AC-RAIT-019-2) — volta a `/colegiado/:orgao/pauta`.
- voto-vista não registrado no prazo: item entra na pauta assim mesmo, omissão conta como
  retenção no perfil do membro ([UC-RAIT-019] Fluxo alternativo 3a; `WF-RAIT-002` §5).
- relator vencido na sessão seguinte: sistema exige designação de redator do acórdão, registrado
  em ata ([UC-RAIT-019] AC-RAIT-019-3).

## 8. Segurança e LGPD

- texto livre da petição/voto-vista acessível só no contexto de instrução do item
  ([RN-RAIT-134]).
- nenhum segredo em URL/log.

## 9. Acessibilidade e atalhos

- `j/k`/`enter` para navegar e abrir o item com vista.
- prazo de vista sempre exibido com o efeito da omissão em texto, nunca só cor
  ([IU-RAIT-001] §4).
- foco visível; registro do voto-vista com erro de forma associado ao campo.

## 10. Testes

- unitário: vista não suspende nenhum relógio ([UC-RAIT-019] AC-RAIT-019-1); item volta com
  prioridade (AC-RAIT-019-2); designação de redator do voto vencedor (AC-RAIT-019-3).
- roteamento: `rait-chair`/`rait-rapporteur` ativam; demais papéis → `/sem-permissao`.
- estados: `RAIT.VIEW_DEADLINE_EXCEEDED`; vazio.

## Componentes compartilhados

`DeadlineChip`, `QueueTable`, `LegalBasisTooltip`.

## Chaves i18n

- `rait.screens.colegiado-orgao-vistas.title` — "Vistas"
- `rait.screens.colegiado-orgao-vistas.intro` — "Itens com vista concedida, aguardando voto-vista"
- `rait.screens.colegiado-orgao-vistas.empty` — "Nenhum item com vista pendente"
- `rait.screens.colegiado-orgao-vistas.cmd.register_view_vote` — "Registrar voto-vista"
- `rait.screens.colegiado-orgao-vistas.state.deadline_exceeded` — "O prazo de devolução da vista já venceu"
