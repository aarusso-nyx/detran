---
id: IU-RAIT-004
title: Fila de trabalho — defesa prévia — especificação de tela
status: draft
apps: [rait]
sources: [REF-CONTRAN-900, REF-CONTRAN-918, REF-CTB-extracts-raw]
updated: 2026-09-21
---

Ficha da rota `fila/defesa` (`rait-web-frontend.md` §4; tela T-02 de [IU-RAIT-001]).
Fontes: [UC-RAIT-003], [JRN-RAIT-001].

## 1. Identidade

- id: `IU-RAIT-004`; `path`: `fila/defesa` (`route-manifest.md` #4).
- `screen`: `T-02`; módulo: `fila` (`rait-web-frontend.md` §2).
- página: `DefensePoolQueuePage`; componentes inteligentes: `ClaimNextButton` (bloqueado por
  `WIP`), `QueueTable` (`rait-web-frontend.md` §5.3).
- nível: `L2` (`route-manifest.md`).
- slug i18n: `fila-defesa`.

## 2. Acesso

- papéis: `rait-analyst` (`route-manifest.md` #4).
- guardas: `raitAuthGuard` + `roleGuard(['rait-analyst'])`.
- chave de política: `inf:rait-case:claim-next` para o botão "puxar próximo"
  (`rait-web-frontend.md` §7).
- pré-condição: caso em `ADMITIDO` no pool `defesa_previa`, revisor `DISPONIVEL`/`EM_PLANTAO` e
  `WIP` abaixo do limite ([WF-RAIT-004] §3-§4).

## 3. Entrada

- de onde se chega: `/` via `RoleHomeRedirect` (papel `rait-analyst`, rota inicial `/painel`, não
  diretamente `/fila/defesa`); navegação lateral do módulo `fila`; atalho `n` a partir de qualquer
  tela para "puxar próximo" ([JRN-RAIT-001] passo 2; `rait-web-frontend.md` §5.1 `ShortcutService`).
- parâmetros de rota: nenhum.
- `?q=&ordem=&filtro=`: aceita filtro/ordenação sincronizados com a tabela — a ordem exibida é
  sempre a ordem única do backend, não recalculada no cliente ([RN-RAIT-141]).
- deep-link canônico: `/fila/defesa`.

## 4. Dados

- resolver: "fila coletiva do pool `defesa_previa` + botão 'puxar próximo'" (`route-manifest.md`
  #4; [UC-RAIT-003]).
- clientes: `data/api/worklist.client.ts` (`case`, `worklist`) — fila `F-DP-2` ([WF-RAIT-004] §2.1).
- calculado do backend: ordem única (risco → prioridade legal → tempestividade, [RN-RAIT-141]);
  `WIP` do revisor logado ([WF-RAIT-004] §4).

## 5. Estados

- **carregando**: skeleton da `QueueTable`.
- **vazio**: fila sem casos elegíveis — `RAIT.QUEUE_EMPTY` (409, catálogo §3.4) ao tentar puxar;
  a tela mostra "fila vazia no momento", sem bloquear a navegação.
- **erro recuperável**: falha ao carregar a fila; retry.
- **sem permissão**: banner "sem permissão para esta ação" quando `RAIT.FORBIDDEN_ACTION` (403) —
  ocorre se a chave `inf:rait-case:claim-next` não estiver concedida ao papel logado.
- **conflito**: `RAIT.ASSIGNMENT_ALREADY_ACTIVE` (409) — caso já tem responsável ativo; recarrega
  a fila.

## 6. Comandos

| Ação (`recurso:ação`)  | Papel          | Pré-estado → pós-estado                                               | Comando                                                                          | Confirmação com efeito jurídico                                            | Erros esperados                                                                                             |
| ---------------------- | -------------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `rait.case:claim-next` | `rait-analyst` | `ADMITIDO`→`DISTRIBUIDO`→`EM_INSTRUCAO` (`rait-web-frontend.md` §6.6) | `POST /v1/inf/rait/pools/{id}/claim-next` (endpoint de comando: R-0007 CTG-0004) | "Ao puxar, o caso passa a ser sua responsabilidade e sai da fila coletiva" | `RAIT.QUEUE_EMPTY`, `RAIT.ASSIGNMENT_WIP_LIMIT`, `RAIT.MEMBER_NOT_AVAILABLE`, `RAIT.MEMBER_IMPEDED` (JW-01) |

- `If-Match` sempre exigido nas ações de comando desta tela (`rait-web-frontend.md` §7).

## 7. Saída

- "puxar próximo" bem-sucedido redireciona a `/casos/:id/triagem` (o caso sai da fila coletiva no
  mesmo ato, [JRN-RAIT-001] passo 2).
- a tela permanece se o comando falhar (fila vazia, limite de `WIP`, membro impedido/indisponível).
- SSE atualiza a fila quando outro revisor puxa um caso (`assignment.changed`,
  `rait-web-frontend.md` §8).

## 8. Segurança e LGPD

- `QueueTable` nunca exibe o texto livre da exposição de fatos do requerimento ([RN-RAIT-134]).
- terceiros citados no caso não aparecem na lista ([RN-RAIT-137]).

## 9. Acessibilidade e atalhos

- `n` puxa o próximo caso da fila a partir de qualquer tela; `j`/`k` navegam a lista;
  `enter` abre o item selecionado (`rait-web-frontend.md` §10).
- risco comunicado por ordenação e rótulo textual, nunca só por cor ([IU-RAIT-001] §4).

## 10. Testes

- roteamento: `rait-analyst` ativa; demais papéis → `/sem-permissao` (M14).
- critérios ligados a [UC-RAIT-003] e à sequência de [JW-01-analista.md]: puxar → `DISTRIBUIDO` →
  `EM_INSTRUCAO` → redireciona à triagem.
- estados fila vazia/`WIP` atingido/membro impedido como critérios de aceitação.

## Componentes compartilhados

`QueueTable`, `RiskFlag`, `DeadlineChip` (`rait-web-frontend.md` §5.2, §5.3).

## Chaves i18n

- `rait.screens.fila-defesa.title` — "Fila de defesa prévia"
- `rait.screens.fila-defesa.intro` — "Casos admitidos aguardando instrução."
- `rait.screens.fila-defesa.empty` — "Fila vazia no momento."
- `rait.screens.fila-defesa.cmd.claim-next` — "Puxar próximo"
