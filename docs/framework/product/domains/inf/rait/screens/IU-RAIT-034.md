---
id: IU-RAIT-034
title: Colegiado — sessão ao vivo — especificação de tela
status: draft
apps: [rait]
sources: [REF-CONTRAN-357, REF-CETRAN-PROCESSO-INTERNO]
updated: 2026-09-21
---

Ficha da rota `/colegiado/:orgao/sessoes/:id` (`rait-web-frontend.md` §4; tela T-12 de
[IU-RAIT-001]).
Fontes: [UC-RAIT-006], [JRN-RAIT-002], [RN-RAIT-116], [RN-RAIT-117], [RN-RAIT-140],
[RN-RAIT-142].

## 1. Identidade

- id: `IU-RAIT-034`; rota: `/colegiado/:orgao/sessoes/:id` (`route-manifest.md` #34);
  `screen: 'T-12'`.
- módulo: `colegiado` (`rait-web-frontend.md` §2).
- página: `LiveSessionPage`; componente inteligente: `LiveSessionBoard` — "item corrente, quorum,
  votos, vista, retirada" (`rait-web-frontend.md` §5.3).
- nível: `L2` (`route-manifest.md` #34).
- slug i18n: `colegiado-orgao-sessoes-id` (`route-manifest.md` §A).

## 2. Acesso

- papéis: `rait-rapporteur`, `rait-chair`, `rait-secretary` — "todos do colegiado" = papéis de
  `/colegiado/:orgao` (`route-manifest.md` #34).
- guardas: `raitAuthGuard` +
  `roleGuard(['rait-rapporteur', 'rait-chair', 'rait-secretary'])` (M4).
- chave de política: `inf:rait-session:open` / `inf:rait-session:adjourn` (§7, `rait-chair`);
  `inf:rait-session:vote` / `inf:rait-session:casting-vote` (§7, `rait-rapporteur`,
  `rait-chair`); `inf:rait-session:view-request` (§7, `rait-rapporteur`);
  `inf:rait-session:proclaim` (§7, `rait-chair`).
- pré-condição: sessão convocada, casos em `PAUTADO` ([UC-RAIT-006] Pré-condições).

## 3. Entrada

- de onde se chega: `/colegiado/:orgao/sessoes` (linha da sessão) ou
  `/colegiado/:orgao/sessoes/:id/banca` (após confirmar a banca); [JRN-RAIT-002] passo 4; JW-04
  passo 5; JW-07 passo 5; JW-08 passos 4-5.
- parâmetros de rota: `:orgao`, `:id`.
- deep-link canônico: `/colegiado/jari/sessoes/:id`.

## 4. Dados

- resolver: 'sessão ao vivo: quorum, itens, votos ("todos do colegiado" = papéis de
  `/colegiado/:orgao`)' (`route-manifest.md` #34).
- cliente gerado: `data/api/session.client.ts`, `POST /v1/inf/rait/votes`,
  `.../sessions/{id}/commands/open|adjourn`, `.../agenda-items/{id}/commands/view|proclaim` (§7).
- campos exibidos: quorum exigido/observado, presidente/suplente presente, paridade (CETRAN —
  `QuorumIndicator`, [RN-RAIT-142]), item corrente (`RELATORIA_LIDA` · `VOTACAO` — `WF-RAIT-003`
  §Estados), tally de votos por membro (`VoteTally`).
- calculado do backend: quorum e paridade recalculados pelo servidor a cada item, nunca no
  cliente ([RN-RAIT-005]; [UC-RAIT-006] AC-RAIT-006-3).

## 5. Estados

- carregando: skeleton do `LiveSessionBoard`.
- vazio: não se aplica — sessão identificada.
- erro recuperável: falha transitória de conexão SSE — fallback por polling de 15 s
  (`rait-web-frontend.md` §8).
- sem permissão: `RAIT.FORBIDDEN_ORGAO` (403) → banner "sem permissão para esta ação".
- conflito: `RAIT.SESSION_STATE_INVALID` (409); `RAIT.SESSION_QUORUM_MISSING` (422);
  `RAIT.VOTE_MEMBER_IMPEDED` (422); `RAIT.VOTE_ITEM_NOT_OPEN` (409); `RAIT.VOTE_DUPLICATE`
  (409); `RAIT.CASTING_VOTE_NOT_TIED` (422); `RAIT.CASTING_VOTE_NOT_CHAIR` (403);
  `RAIT.PROCLAIM_NO_MAJORITY` (422) (`rait-error-catalog.md` §3.7).
- indisponível: banner `rait.states.stream_unavailable` (M10) quando a SSE cai duas vezes em
  60 s — continua por polling, não bloqueia a sessão.

## 6. Comandos

| Ação (`recurso:ação`)       | Papel                           | Pré-estado → pós-estado                                                | Comando (§7)                                    | Confirmação com efeito jurídico                                                                               | Erros esperados                                                              |
| --------------------------- | ------------------------------- | ---------------------------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `rait.session:open`         | `rait-chair`                    | `CONVOCACAO_ENVIADA` → `SESSAO_ABERTA` (ou `SESSAO_ADIADA` sem quorum) | `POST …/sessions/{id}/commands/open`            | "Sem quorum, a sessão é adiada e os casos retornam a `PRONTO_P_DECISAO`; os relógios legais seguem correndo." | `RAIT.SESSION_QUORUM_MISSING`, `RAIT.SESSION_STATE_INVALID`                  |
| `rait.session:adjourn`      | `rait-chair`                    | `SESSAO_ABERTA` → `SESSAO_ADIADA`                                      | `POST …/sessions/{id}/commands/adjourn`         | "Ao adiar, os relógios de prescrição não são pausados nem reiniciados."                                       | `RAIT.SESSION_STATE_INVALID`                                                 |
| `rait.session:vote`         | `rait-rapporteur`, `rait-chair` | item em `VOTACAO` → tally atualizado                                   | `POST /v1/inf/rait/votes`                       | "O voto fica vinculado ao membro e ao caso; membro impedido não é computado."                                 | `RAIT.VOTE_MEMBER_IMPEDED`, `RAIT.VOTE_ITEM_NOT_OPEN`, `RAIT.VOTE_DUPLICATE` |
| `rait.session:casting-vote` | `rait-chair`                    | empate → voto de qualidade registrado                                  | `POST /v1/inf/rait/votes` (`casting_vote=true`) | "O voto de qualidade é registrado como tal, distinto de um voto ordinário."                                   | `RAIT.CASTING_VOTE_NOT_TIED`, `RAIT.CASTING_VOTE_NOT_CHAIR`                  |
| `rait.session:view-request` | `rait-rapporteur`               | item lido → item reprogramado (vista concedida)                        | `POST …/agenda-items/{id}/commands/view`        | "A vista concede prazo até a sessão seguinte; nenhum relógio legal é suspenso."                               | `RAIT.VIEW_REQUEST_NOT_ALLOWED`                                              |
| `rait.session:proclaim`     | `rait-chair`                    | maioria ou desempate → `DECISAO_PROCLAMADA`; caso `[JULGADO_SESSAO]`   | `POST …/agenda-items/{id}/commands/proclaim`    | "A proclamação torna a decisão pública; quorum é reverificado antes de proclamar."                            | `RAIT.PROCLAIM_NO_MAJORITY`                                                  |

Endpoint de comando: R-0007 CTG-0004 (`rait-web-frontend.md` §11). `If-Match` sempre exigido em
todos os comandos.

## 7. Saída

- sem quorum: `SESSAO_ADIADA`, todos os casos pautados voltam a `PRONTO_P_DECISAO`, relógios
  seguem correndo ([UC-RAIT-006] AC-RAIT-006-1/AC-RAIT-006-2); adiamento sinalizado como risco
  sistêmico ([UC-RAIT-006] Fluxo alternativo 1a).
- item julgado: `DECISAO_PROCLAMADA`, caso `[JULGADO_SESSAO]`, avança à ata
  (`/colegiado/:orgao/sessoes/:id/ata`, IU-RAIT-036).
- provimento em `instancia=jari`: abre a janela do recurso da autoridade
  ([UC-RAIT-006] AC-RAIT-006-8) — visível em `/autoridade/provimentos`.
- decisão em `instancia=cetran`: só pode seguir para `TRANSITADO`
  ([UC-RAIT-006] AC-RAIT-006-9).
- SSE: `session.changed`, `agenda-item.changed` atualizam quorum, item corrente e tally ao vivo,
  para todos os participantes conectados.

## 8. Segurança e LGPD

- membro impedido no item não vota e não conta para o quorum daquele item
  ([UC-RAIT-006] AC-RAIT-006-4; [RN-RAIT-140]).
- votos individuais vinculados ao membro e ao caso, com fundamentação exigida para proclamar
  ([UC-RAIT-006] AC-RAIT-006-5).
- texto livre da petição não é reexibido em painel de votação além do necessário à deliberação
  ([RN-RAIT-134]).
- sustentação oral (`SUSTENTACAO_ORAL`) não faz parte do fluxo padrão — omitida por decisão do
  Owner (`WF-RAIT-003` §Sustentação oral; [OD-002], `open-decisions-rait.md` §A); a tela não
  oferece essa etapa como toggle de configuração.
- nenhum segredo em URL/log; `signature_ref` do kernel de assinatura não aparece nesta tela.

## 9. Acessibilidade e atalhos

- `v` para votar na sessão (`rait-web-frontend.md` §10, item 4).
- quorum e paridade sempre com rótulo textual e dias/números, não só cor
  ([IU-RAIT-001] §4; `QuorumIndicator`).
- foco visível; anúncio por `aria-live` a cada mudança de item corrente ou resultado de votação.

## 10. Testes

- unitário: sem quorum a sessão não abre ([UC-RAIT-006] AC-RAIT-006-1); relógios continuam
  correndo durante o adiamento (AC-RAIT-006-2); quorum de deliberação verificado por caso
  (AC-RAIT-006-3); impedimento por caso respeitado na votação (AC-RAIT-006-4); decisão por
  maioria simples com voto individual (AC-RAIT-006-5); empate resolve por voto de qualidade do
  presidente (AC-RAIT-006-6); provimento em JARI abre a janela da autoridade
  (AC-RAIT-006-8); decisão do CETRAN encerra a instância (AC-RAIT-006-9).
- roteamento: `rait-rapporteur`/`rait-chair`/`rait-secretary` ativam; demais papéis canônicos →
  `/sem-permissao` (M14).
- SSE: fallback por polling de 15 s após duas falhas em 60 s (M10).

## Componentes compartilhados

`QuorumIndicator`, `VoteTally`, `EventTimeline`, `ImpedimentDialog`, `LegalBasisTooltip`.

## Chaves i18n

- `rait.screens.colegiado-orgao-sessoes-id.title` — "Sessão ao vivo"
- `rait.screens.colegiado-orgao-sessoes-id.cmd.open` — "Abrir sessão"
- `rait.screens.colegiado-orgao-sessoes-id.cmd.adjourn` — "Adiar sessão"
- `rait.screens.colegiado-orgao-sessoes-id.cmd.vote` — "Votar"
- `rait.screens.colegiado-orgao-sessoes-id.cmd.casting_vote` — "Voto de qualidade"
- `rait.screens.colegiado-orgao-sessoes-id.cmd.view_request` — "Pedir vista"
- `rait.screens.colegiado-orgao-sessoes-id.cmd.proclaim` — "Proclamar decisão"
- `rait.screens.colegiado-orgao-sessoes-id.state.no_quorum` — "Sessão sem quorum — adiada"
