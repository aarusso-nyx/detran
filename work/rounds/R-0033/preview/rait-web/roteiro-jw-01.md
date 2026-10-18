# Roteiro de revisão UI/UX — JW-01 (analista, `rait-analyst`)

Rodada R-0033 · TASK-0005 · fontes: `docs/framework/arch/rait-web-journeys/JW-01-analista.md`
(reescrita por TASK-0001, OD-C3-007 (a)), `work/rounds/R-0033/inventory-rait-web.md` §5,
`docs/framework/arch/frontend-preview-mode.md`. A tabela de URLs e nomes de captura tem a sua
versão executável em `lib.mjs` (`ROTEIRO`): se divergirem, vale `lib.mjs` e este arquivo é
corrigido.

Regras da revisão: todos os dados são fictícios (fixtures canônicas); onde a ficha não fixa o
texto, o revisor lê "texto da fixture" ou `source_pending` — nada é inventado aqui. Nenhum
comando é executado de verdade; a ação mostra "Indisponível nesta versão." (banner da tela) e a
faixa mostra "não funcional na prévia".

## Convenções

- **URL de prévia**: caminho + `?pv_papel=<papel>&pv_estado=<estado>`; `pv_estado` ∈
  `loaded|empty|loading|error|forbidden`; `pv_papel` ∈ os 13 papéis (`RAIT_ALL_ROLES`).
- **Estados capturados** (C-04): `loaded`, `empty`, `error`, `forbidden`. `loading` é opcional
  (coberto por specs, não por captura).
- **Larguras**: 360×800, 768×1024, 1280×800.
- **Nome do arquivo**: `<passo>-<slug-da-rota>-<estado>-<largura>.png`, em `captures/`.
- **A11y** (C-05): axe-core 4.13.0, tags `wcag2a`, `wcag2aa`, `best-practice`, largura 1280;
  critério = 0 violações `serious`/`critical`; as demais ficam listadas em `axe-report.json`.
- IDs de caso/ids das URLs: `rait-fixtures.md` §3 (06 `DISTRIBUIDO`, 07 `EM_INSTRUCAO`,
  08 `DILIGENCIA`, 09 `PRONTO_P_DECISAO`).

## Passo 0 — faixa de prévia e seletores

| Item           | O que ver                                                                                                                                                                          |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Faixa          | `[data-detran-preview-mark="DETRAN_PREVIEW_MARK"]` fixa no topo de toda página, com o texto "PRÉVIA — DADOS FICTÍCIOS" (`rait.states.preview_mark`), inclusive em `/sem-permissao` |
| Seletor estado | `<select>` nativo "Estado da tela" com Carregado / Vazio / Carregando / Erro / Acesso negado; trocar o estado recarrega a URL com `pv_estado`                                      |
| Seletor papel  | `<select>` nativo "Papel da sessão" com os 13 papéis (`rait.role.<código>`); trocar recarrega em `/?pv_papel=<papel>&pv_estado=<atual>`                                            |
| Ação           | `role="status"` na faixa: "Não funcional na prévia: <comando> não foi executado." após acionar um comando (texto distinto de "Indisponível nesta versão.")                         |
| Capturas       | sem captura própria: a faixa aparece em todas as capturas dos passos 1–8                                                                                                           |

## Passos 1–8

| Passo | Rota / URL de prévia (`loaded`)                                                   | Tela / ficha         | O que o revisor vê (título da ficha; componentes de `rait-web-frontend.md` §5)                                                                                                                                                                                  | Estados                                 | Ações → "não funcional na prévia"                                                                                                    | Capturas esperadas (nome base)                |
| ----- | --------------------------------------------------------------------------------- | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------- |
| 1     | `/painel?pv_papel=rait-analyst&pv_estado=loaded`                                  | T-01 · `IU-RAIT-002` | "Painel do turno"; `ShiftSummaryCards` (vencendo, diligências expirando, parados); SSE `live`. `empty`: tela sem slot de lista (A5 item 4) — host `ready`, nenhum `data-status="empty"`; as contagens (lidas de listas) ficam 0 e as listas curtas não aparecem | `loaded`, `empty`, `error`, `forbidden` | nenhuma (leitura agregada)                                                                                                           | `01-painel-<estado>-<largura>.png`            |
| 2     | `/fila/defesa?pv_papel=rait-analyst&pv_estado=loaded`                             | T-02 · `IU-RAIT-004` | "Fila de trabalho — defesa prévia"; `ClaimNextButton`, `QueueTable`                                                                                                                                                                                             | idem                                    | "puxar próximo" → `rait-case:claim-next` (após confirmação)                                                                          | `02-fila-defesa-<estado>-<largura>.png`       |
| 3–4   | `/casos/00000000-0000-7000-8000-000010000006/triagem?pv_papel=rait-analyst&…`     | T-03 · `IU-RAIT-008` | "Triagem de admissibilidade"; `AdmissibilityChecklist` (4 vereditos; sem vereditos na fixture)                                                                                                                                                                  | idem                                    | salvar checklist → `rait-case:triage`; "admitir" → `rait-case:admit`; "não conhecer" → `rait-case:reject`                            | `03-04-casos-triagem-<estado>-<largura>.png`  |
| 5     | `/casos/00000000-0000-7000-8000-000010000007/dossie?pv_papel=rait-analyst&…`      | T-04 · `IU-RAIT-009` | "Dossiê do caso / instrução"; `DossierViewer` (1 documento do caso 07 em `documents`; `attached_at` sem coluna na seed → `source_pending`, lacuna visível — D-06 (5)), `DocumentUploader`                                                                       | idem                                    | "anexar de ofício" (`rait-document:attach-official`): **botão ausente** (fail-closed)                                                | `05-casos-dossie-<estado>-<largura>.png`      |
| 6     | `/casos/00000000-0000-7000-8000-000010000008/diligencias?pv_papel=rait-analyst&…` | T-05 · `IU-RAIT-010` | "Abertura de diligência"; `InquiryForm` e um `InquiryCard` (1 diligência do caso 08 em `inquiries`)                                                                                                                                                             | idem                                    | "abrir diligência" → `rait-case:open-inquiry`; "responder" → `rait-case:answer`; "prorrogar" → `rait-case:extend` (após confirmação) | `06-casos-diligencias-<estado>-<largura>.png` |
| 7     | `/painel/retomar?pv_papel=rait-analyst&pv_estado=loaded`                          | T-06 · `IU-RAIT-003` | "Bandeja "prontos para retomar""; `ResumeTrayList` (`loaded` = lista vazia na fixture)                                                                                                                                                                          | idem                                    | nenhuma (leitura; a retomada abre `/casos/:id/dossie`)                                                                               | `07-painel-retomar-<estado>-<largura>.png`    |
| 8     | `/casos/00000000-0000-7000-8000-000010000007/minuta?pv_papel=rait-analyst&…`      | T-07 · `IU-RAIT-011` | "Editor de minuta"; `MinutaEditor` (minuta `rascunho` v1; texto "texto da fixture"/`source_pending`)                                                                                                                                                            | idem                                    | "enviar para assinatura" → `rait-case:submit-draft` (após confirmação)                                                               | `08-casos-minuta-<estado>-<largura>.png`      |

`<estado>` ∈ `loaded|empty|error|forbidden`; `<largura>` ∈ `360|768|1280`. Total dos passos 1–8:
7 telas × 4 estados × 3 larguras = 84 capturas. O layout `/casos/:id` redireciona à aba inicial do
analista (`triagem`) e não tem captura própria.

Em cada captura o revisor confere: a faixa de prévia visível; título e componentes da ficha; o
estado pedido (vazio mostra `data-status="empty"` no slot de lista — `PageState`/`QueueTable`/
`DossierViewer`; o painel, passo 1, não tem slot de lista e fica `ready` — A5 item 4; `error` =
500 `RAIT.INTERNAL`; `forbidden` = 403 `RAIT.FORBIDDEN_ACTION`); sem rolagem horizontal em 360;
foco visível.
Cada ação listada: acionar (e confirmar, quando houver diálogo) deve mostrar "Indisponível nesta
versão." no banner e "não funcional na prévia" na faixa, nunca sucesso.

## Antigos passos 9–10 (fora da JW-01 — OD-C3-007 (a))

A JW-01 reescrita: o passo 9 é visão do retorno da decisão em rotas `todos` (`/painel`,
`/casos/:id/resumo`, `/casos/:id/historico`) sem comando do analista; o passo 10 não tem rota
(`source_pending`). O manifesto é mantido: `/casos/:id/decisao` é só de `rait-signing-authority`
e `/casos/:id/impedimentos` só de `rait-rapporteur`/`rait-chair`. Nenhum papel é ampliado.

| Passo | URL de prévia                                                                                | Resultado esperado                          | Capturas                                       |
| ----- | -------------------------------------------------------------------------------------------- | ------------------------------------------- | ---------------------------------------------- |
| 9–10  | `/casos/00000000-0000-7000-8000-000010000009/decisao?pv_papel=rait-analyst&pv_estado=loaded` | termina em `/sem-permissao?de=<url pedida>` | `09-10-sem-permissao-loaded-<largura>.png` (3) |

Total do roteiro: 84 + 3 = **87** capturas (`expectedCaptureCount()`).

## Papéis — prova negativa

Mesmo roteiro com `pv_papel=rait-secretary` (guardas ativas, sem contorno): as rotas abaixo
devem terminar em `/sem-permissao?de=<url pedida>` (conferido por `capture.mjs`, sem PNG).

| Rota                                                                                          | Papel            | Resultado esperado    |
| --------------------------------------------------------------------------------------------- | ---------------- | --------------------- |
| `/fila/defesa?pv_papel=rait-secretary&pv_estado=loaded`                                       | `rait-secretary` | `/sem-permissao?de=…` |
| `/casos/00000000-0000-7000-8000-000010000007/minuta?pv_papel=rait-secretary&pv_estado=loaded` | `rait-secretary` | `/sem-permissao?de=…` |

## Acessibilidade (C-05)

`axe.mjs` roda sobre cada tela do roteiro × estado (`loaded|empty|error|forbidden`, 1280) e sobre
`/sem-permissao`; resultado em `axe-report.json`. Critério: **0** violações `serious`/`critical`
(`check.mjs axe`); as demais (`moderate`/`minor`) permanecem listadas, nunca filtradas.
