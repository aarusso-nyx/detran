---
id: IU-RAIT-016
title: Impedimentos e suspeição do caso — especificação de tela
status: draft
apps: [rait]
sources: [REF-LEI-9784-1999, REF-CONTRAN-357, REF-CONTRAN-901-2022]
updated: 2026-09-21
---

Ficha da rota `casos/:id/impedimentos` (`rait-web-frontend.md` §4; sem tela própria em
[IU-RAIT-001], aba do layout T-04). Fontes: [UC-RAIT-026], [RN-RAIT-140], [RN-RAIT-141].

## 1. Identidade

- id: `IU-RAIT-016`; `path`: `casos/:id/impedimentos` (`route-manifest.md` #16).
- `screen`: `—`.
- módulo: `caso`; componente inteligente: `ImpedimentsPage` / `ImpedimentDialog`
  (`rait-web-frontend.md` §5.2, §5.3).
- nível: `L2` (`route-manifest.md`).
- slug i18n: `casos-id-impedimentos`.

## 2. Acesso

- papéis: `rait-rapporteur`, `rait-chair` (`route-manifest.md` #16).
- guardas: as de `/casos/:id` + `roleGuard(['rait-rapporteur', 'rait-chair'])`.
- chave de política: `inf:rait-impediment:declare` / `inf:rait-impediment:suspicion`
  (`rait-web-frontend.md` §7).
- pré-condição: caso com responsável designado (`DISTRIBUIDO`, `EM_INSTRUCAO`, `DILIGENCIA`,
  `PRONTO_P_DECISAO`, `PAUTADO` — [UC-RAIT-026] Pré-condições).

## 3. Entrada

- de onde se chega: navegação de aba a partir de `/casos/:id`; declaração de impedimento a
  qualquer momento pelo relator (JW-01 passo 10, JW-07 passo 1).
- parâmetros de rota: `:id` (herdado do layout).
- deep-link canônico: `/casos/:id/impedimentos`.

## 4. Dados

- resolver: "declarar impedimento / arguições" (`route-manifest.md` #16; [UC-RAIT-026]).
- clientes: `data/api/case.client.ts` (`rait_impediment`).
- calculado do backend: exclusão do membro impedido em sorteios futuros e da contagem de quorum
  do item na sessão ([UC-RAIT-026] passo 4); tipo (`impedimento` × `suspeicao`) e fundamento
  persistidos pelo backend.

## 5. Estados

- **carregando**: skeleton do `ImpedimentsPage`.
- **vazio**: nenhum impedimento/suspeição registrado no caso.
- **erro recuperável**: falha ao registrar; retry.
- **sem permissão**: papel fora de `rait-rapporteur`/`rait-chair` — `RAIT.FORBIDDEN_ACTION` (403).
- **erro de negócio**: `RAIT.MEMBER_IMPEDED` (422, catálogo §3.4) — impedimento já registrado
  para o membro no caso.

## 6. Comandos

| Ação (`recurso:ação`)         | Papel                | Pré-estado → pós-estado                                  | Comando                                                                      | Confirmação com efeito jurídico                                                                                   | Erros esperados       |
| ----------------------------- | -------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | --------------------- |
| `rait.impediment:declare`     | `rait-rapporteur`    | inalterado (caso redistribuído se relator impedido)      | `POST /v1/inf/rait/impediments` (endpoint de comando: R-0007 CTG-0004)       | "O caso é redistribuído sem aproveitar nenhum trabalho de mérito seu" ([UC-RAIT-026] passo 2; AC-RAIT-026-3)      | `RAIT.MEMBER_IMPEDED` |
| `rait.impediment:suspicion`   | interessado (Portal) | inalterado até decisão do presidente                     | `POST /v1/inf/rait/impediments` (endpoint de comando: R-0007 CTG-0004)       | "O presidente decide em até 5 dias úteis; indeferida, o caso segue sem efeito suspensivo" ([UC-RAIT-026] passo 3) | —                     |
| decidir arguição (presidente) | `rait-chair`         | suspeição arguida → deferida (redistribui) \| indeferida | `PATCH /v1/inf/rait/impediments/{id}` (endpoint de comando: R-0007 CTG-0004) | "Indeferida, cabe recurso sem efeito suspensivo (Lei 9.784 art. 21)" ([UC-RAIT-026] passo 3)                      | —                     |

- `If-Match` sempre exigido (`rait-web-frontend.md` §7).
- impedimento é declarado antes de qualquer acesso ao mérito ([RN-RAIT-140]; AC-RAIT-004-1, do
  lado da relatoria em `/colegiado/:orgao/relatoria`, fora do lote A).

## 7. Saída

- impedimento declarado redistribui o caso ao pool sem aproveitar trabalho de mérito
  ([UC-RAIT-026] passo 2, AC-RAIT-026-3); a tela permanece mostrando o registro histórico.
- suspeição arguida aguarda decisão do presidente na própria tela (estado "aguardando decisão").

## 8. Segurança e LGPD

- fundamento do impedimento/suspeição não expõe dado de terceiro além do necessário
  ([RN-RAIT-134], [RN-RAIT-137]).

## 9. Acessibilidade e atalhos

- foco visível no `ImpedimentDialog`; nenhuma informação de risco só por cor ([IU-RAIT-001] §4).

## 10. Testes

- roteamento: `rait-rapporteur`/`rait-chair` ativam; demais papéis → `/sem-permissao` (M14).
- critérios ligados a [UC-RAIT-026]: AC-RAIT-026-1 (impedimento exclui do caso, não do pool),
  AC-RAIT-026-2 (suspeição tem decisão e prazo de 5 dias úteis), AC-RAIT-026-3 (nada do impedido
  é reaproveitado).

## Componentes compartilhados

`ImpedimentDialog`, `CaseHeader` (`rait-web-frontend.md` §5.2).

## Chaves i18n

- `rait.screens.casos-id-impedimentos.title` — "Impedimentos e suspeição"
- `rait.screens.casos-id-impedimentos.intro` — "Declarações de impedimento e arguições de suspeição do caso."
- `rait.screens.casos-id-impedimentos.empty` — "Nenhum impedimento registrado."
- `rait.screens.casos-id-impedimentos.cmd.declare` — "Declarar impedimento"
- `rait.screens.casos-id-impedimentos.state.awaiting-decision` — "Aguardando decisão do presidente"
