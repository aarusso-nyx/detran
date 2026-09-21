---
id: IU-RAIT-036
title: Colegiado — ata da sessão — especificação de tela
status: draft
apps: [rait]
sources: [REF-CONTRAN-357, REF-CONTRAN-918, REF-CTB-280-290]
updated: 2026-09-21
---

Ficha da rota `/colegiado/:orgao/sessoes/:id/ata` (`rait-web-frontend.md` §4; tela T-13 de
[IU-RAIT-001]).
Fontes: [UC-RAIT-020], [JRN-RAIT-002], [JRN-RAIT-003], [RN-RAIT-103], [RN-RAIT-130].

## 1. Identidade

- id: `IU-RAIT-036`; rota: `/colegiado/:orgao/sessoes/:id/ata` (`route-manifest.md` #36);
  `screen: 'T-13'`.
- módulo: `colegiado` (`rait-web-frontend.md` §2).
- página: `MinutesPage`; componentes inteligentes: `MinutesPreview`, `SignatureDialog`
  (`rait-web-frontend.md` §5.3).
- nível: `L2` (`route-manifest.md` #36).
- slug i18n: `colegiado-orgao-sessoes-id-ata` (`route-manifest.md` §A).

## 2. Acesso

- papéis: `rait-secretary`, `rait-chair` (`route-manifest.md` #36).
- guardas: `raitAuthGuard` + `roleGuard(['rait-secretary', 'rait-chair'])` (M4).
- chave de política: `inf:rait-minutes:generate` / `inf:rait-minutes:sign` /
  `inf:rait-minutes:publish` (§7).
- pré-condição: sessão em `DECISAO_PROCLAMADA` (`WF-RAIT-003`); presenças, votos e resultados
  registrados item a item ([UC-RAIT-020] Pré-condições).

## 3. Entrada

- de onde se chega: `/colegiado/:orgao/sessoes/:id` (após proclamar todos os itens); JW-04
  passo 6; JW-08 passo 6.
- parâmetros de rota: `:orgao`, `:id`.
- deep-link canônico: `/colegiado/jari/sessoes/:id/ata`.

## 4. Dados

- resolver: "ata gerada, assinatura, publicação" (`route-manifest.md` #36).
- cliente gerado: `data/api/session.client.ts`, `POST /v1/inf/rait/minutes`,
  `…/sign`, `…/publish` (§7).
- campos exibidos: pauta, presentes, quorum por item, relatoria, votos individuais, resultado,
  fundamentação, vistas, itens retirados ([UC-RAIT-020] Fluxo 1).
- calculado do backend: ata é gerada integralmente dos registros ao vivo — nenhum campo é
  digitado de memória ([UC-RAIT-020] AC-RAIT-020-1).

## 5. Estados

- carregando: skeleton do `MinutesPreview`.
- vazio: não se aplica — ata de uma sessão identificada.
- erro recuperável: falha transitória ao assinar/publicar — retry, sem perder o rascunho da ata.
- sem permissão: 403 → banner "sem permissão para esta ação".
- conflito: `RAIT.MINUTES_NOT_READY` (409) — gerar/assinar antes de `DECISAO_PROCLAMADA` de
  todos os itens; `RAIT.MINUTES_ALREADY_PUBLISHED` (409) — republicação
  (`rait-error-catalog.md` §3.7) → recarrega.
- indisponível: não se aplica (`L2`).

## 6. Comandos

| Ação (`recurso:ação`)   | Papel                          | Pré-estado → pós-estado                               | Comando (§7)                             | Confirmação com efeito jurídico                                                    | Erros esperados                                         |
| ----------------------- | ------------------------------ | ----------------------------------------------------- | ---------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `rait.minutes:generate` | `rait-secretary`               | `DECISAO_PROCLAMADA` (todos os itens) → `ATA_LAVRADA` | `POST /v1/inf/rait/minutes`              | "A ata é gerada dos registros ao vivo; nenhum campo é redigido do zero."           | `RAIT.MINUTES_NOT_READY`                                |
| `rait.minutes:sign`     | `rait-secretary`, `rait-chair` | `ATA_LAVRADA` → `ATA_ASSINADA`                        | `POST /v1/inf/rait/minutes/{id}/sign`    | "A assinatura do presidente e da secretaria torna a ata pronta para publicação."   | `RAIT.MINUTES_SIGNERS_MISSING`, `RAIT.SIGNATURE_FAILED` |
| `rait.minutes:publish`  | `rait-secretary`               | `ATA_ASSINADA` → publicada; casos `[COMUNICADO]`      | `POST /v1/inf/rait/minutes/{id}/publish` | "Ao publicar, inicia o prazo de 30 dias para recurso ao CETRAN-AM (marco `T-R2`)." | `RAIT.MINUTES_ALREADY_PUBLISHED`                        |

Endpoint de comando: R-0007 CTG-0004 (`rait-web-frontend.md` §11). `If-Match` sempre exigido.

## 7. Saída

- publicação: cada caso passa a `JULGADO_SESSAO → COMUNICADO`; evento `RAIT_DECISAO_PUBLICADA`
  com a data de publicação, armando `T-R2` ([UC-RAIT-020] Fluxo 3; [RN-RAIT-103]); comunicação
  individual ao recorrente ([UC-RAIT-007], fora desta ficha); se provido, autoridade centralizada
  notificada — visível em `/autoridade/provimentos` ([UC-RAIT-008]).
- relator ausente para assinar: presidente assina pelo colegiado, com registro; ata não fica
  retida ([UC-RAIT-020] Fluxo alternativo 2a).
- publicação parcial: `T-R2` só é armado para os itens efetivamente publicados; os demais ficam
  em pendência visível ([UC-RAIT-020] Fluxo alternativo 3a).
- ata assinada é imutável — só admite errata por deliberação registrada
  ([UC-RAIT-020] AC-RAIT-020-3).

## 8. Segurança e LGPD

- ata não contém texto livre da petição além do necessário à fundamentação registrada
  ([RN-RAIT-134]); terceiros suprimidos campo a campo ([RN-RAIT-137]).
- nenhum segredo em URL/log; `signature_ref` do kernel PAdES+TSA não é exibido como texto livre.

## 9. Acessibilidade e atalhos

- `j/k`/`enter` para navegar entre itens da ata.
- data-limite do recurso ao CETRAN sempre calculada e exibida com base legal ao lado
  ([IU-RAIT-001] §1; [RN-RAIT-103]).
- foco visível; assinatura com confirmação explícita do efeito jurídico (publicação = marco do
  prazo recursal).

## 10. Testes

- unitário: a ata nasce dos registros ([UC-RAIT-020] AC-RAIT-020-1); publicação é o marco
  (AC-RAIT-020-2); ata assinada é imutável (AC-RAIT-020-3).
- roteamento: `rait-secretary`/`rait-chair` ativam; demais papéis → `/sem-permissao`.
- estados: `RAIT.MINUTES_NOT_READY`; `RAIT.MINUTES_ALREADY_PUBLISHED`.

## Componentes compartilhados

`SignatureDialog`, `EventTimeline`, `DeadlineChip`, `LegalBasisTooltip`.

## Chaves i18n

- `rait.screens.colegiado-orgao-sessoes-id-ata.title` — "Ata da sessão"
- `rait.screens.colegiado-orgao-sessoes-id-ata.cmd.generate` — "Gerar ata"
- `rait.screens.colegiado-orgao-sessoes-id-ata.cmd.sign` — "Assinar ata"
- `rait.screens.colegiado-orgao-sessoes-id-ata.cmd.publish` — "Publicar decisões"
- `rait.screens.colegiado-orgao-sessoes-id-ata.state.not_ready` — "Ainda há itens sem decisão proclamada"
