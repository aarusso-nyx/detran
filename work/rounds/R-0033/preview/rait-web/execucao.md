# Execução da prévia JW-01 do `rait-web` — R-0033 TASK-0006

Worker `engineer-frontend` (Papel: Engineer), 2026-10-15, worktree
`.claude/worktrees/frontend-preview-5281e3`, branch `claude/frontend-preview-5281e3`.

- **HEAD:** `96256370a7ff00e8850416f7eaa1d933359d1d49` (TASK-0004), com as alterações não
  commitadas de TASK-0006 na árvore de trabalho (`src/app/preview/preview-bar.component.ts`,
  `src/app/preview/preview.providers.ts`, `README.md`). O artefato e o manifesto foram gerados
  dessa árvore; o maestro commita e, se a árvore mudar, reconstrói a prévia e regenera o manifesto.
- **Comando do artefato:** `pnpm --filter @detran/rait-web exec ng build --configuration preview`
  → `apps/rait/web/dist/preview/` (48 arquivos, 1 184 617 bytes; `index.html`,
  `main-XUV3CDKX.js`, 40 chunks, `styles-LSNMVM7I.css`, `runtime-config.js`, `prerendered-routes.json`, `3rdpartylicenses.txt`,
  `assets/preview/{rait-fixtures,calendar-2026}.json`). Prova versionada:
  `dist-preview.manifest.json` (`path`, `bytes`, `sha256` de cada arquivo).
- **Fixtures servidas = fonte:** sha256 de `assets/preview/rait-fixtures.json`
  (`d6918256…f307`) e `calendar-2026.json` (`2b9bc62c…50f1`) iguais aos de
  `docs/framework/arch/fixtures/`.

## Ordem (D-12) e resultados

| #   | Comando                                                                | Resultado                                                                     |
| --- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| 1   | `pnpm --filter @detran/rait-web typecheck`                             | exit 0                                                                        |
| 2   | `pnpm --filter @detran/rait-web lint`                                  | exit 0                                                                        |
| 3   | `pnpm --filter @detran/rait-web test`                                  | 163 arquivos (+1 skipped); 4958 passed, 139 todo, 0 failed                    |
| 4   | `pnpm --filter @detran/rait-web build` (production)                    | exit 0                                                                        |
| 5   | gate negativo (`grep -rl DETRAN_PREVIEW_MARK dist/browser`)            | vazio — "production sem marca de prévia: OK"                                  |
| 6   | `pnpm --filter @detran/rait-web exec ng build --configuration preview` | exit 0                                                                        |
| 7   | gate positivo (`grep -rl DETRAN_PREVIEW_MARK dist/preview`)            | `main-XUV3CDKX.js`                                                            |
| 8   | `node work/rounds/R-0033/preview/rait-web/capture.mjs`                 | exit 0; 87 capturas + 2 provas negativas `rait-secretary` → `/sem-permissao`  |
| 9   | `node work/rounds/R-0033/preview/rait-web/check.mjs captures`          | "ok: 87 capturas == expectedCaptureCount()"                                   |
| 10  | `node work/rounds/R-0033/preview/rait-web/axe.mjs`                     | exit 0; 29 páginas, 0 `serious`/`critical`                                    |
| 11  | `node work/rounds/R-0033/preview/rait-web/check.mjs axe`               | "ok: 0 serious/critical em 29 páginas (axe 4.13.0); 13 violação(ões) menores" |
| 12  | manifesto + conferência `sha256` (`node -e` de `tasks/TASK-0006.json`) | "48 arquivos conferidos, 0 divergentes"                                       |
| 13  | `grep -q "configuration preview" apps/rait/web/README.md`              | exit 0                                                                        |
| 14  | `node work/rounds/R-0033/preview/rait-web/smoke.mjs`                   | "ok: … respondeu 200 com rait-preview-root"; processo encerrado               |

`axe-report.json` é escrito por `axe.mjs` em `captures/axe-report.json` (`DEFAULT_OUT` de
`lib.mjs`; `check.mjs axe` lê dali). Violações listadas, todas `moderate`: `landmark-unique` × 4
(`.detran-sidenav > nav`, fila/defesa e retomar em `loaded`/`empty`) e `heading-order` × 9 (`h3`
dos slots vazios e `#rait-dossier-1-requerente` do dossiê) — origem no kit e em `shared/`.

## Percurso do roteiro ao vivo (`ng serve --configuration preview`, `rait-analyst`)

| Passo | Tela                | `loaded` (fixture)                                                                                                                            | `empty`                                      | `error` / `forbidden`         |
| ----- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | ----------------------------- |
| 1     | `/painel`           | `ready`; contagens Admitido 2, Em diligência 1, Prontos para retomar 0, alertas 5; fila curta com `RAIT-2026-000004`                          | `ready`, contagens 0, sem listas (A5 item 4) | `rait-error-banner` 500 / 403 |
| 2     | `/fila/defesa`      | `ready`; 1 linha `RAIT-2026-000004` `Admitido` (caso 04)                                                                                      | `empty` (2 `[data-status=empty]`)            | idem                          |
| 3–4   | triagem caso 06     | caso carregado; checklist sem vereditos (fixture sem `admissibility` do 06 → slots `empty`, A4); tempestividade "Parâmetro pendente de fonte" | `empty`                                      | 2 banners (caso + checklist)  |
| 5     | dossiê caso 07      | `ready`; 1 documento `requerimento.pdf` `sha256:req07`; `attached_at` célula vazia (D-06 (5)); sem "anexar de ofício"                         | `empty` (`rait-dossier-viewer`)              | 2 banners                     |
| 6     | diligências caso 08 | `ready`; formulário de abertura + 1 `rait-inquiry-card` (Órgão autuador, assunto da fixture, prazo `T-DIL`)                                   | `empty`                                      | 2 banners                     |
| 7     | `/painel/retomar`   | lista vazia (fixture) → `empty`                                                                                                               | `empty`                                      | 1 banner                      |
| 8     | minuta caso 07      | `ready`; minuta v1 `Rascunho`; fatos/fundamentos vazios (estado local da página, D-06; TASK-0004)                                             | `empty` (lista de versões)                   | 2 banners                     |
| 9–10  | decisão caso 09     | `/sem-permissao?de=…` (guarda ativa)                                                                                                          | —                                            | —                             |

Ações (todas sob `rait-analyst`, confirmadas quando há diálogo): `rait-case:claim-next`,
`rait-case:triage`, `rait-case:admit`, `rait-case:reject`, `rait-case:open-inquiry`,
`rait-case:answer`, `rait-case:extend`, `rait-case:submit-draft` → faixa "Não funcional na prévia:
<comando> não foi executado." e banner da página "Indisponível nesta versão."; nenhuma requisição a
`/v1`. "Anexar de ofício" ausente (fail-closed). Provas negativas `rait-secretary` (`/fila/defesa`,
minuta 07) → `/sem-permissao`. Campos de formulário preenchidos só para habilitar os botões, com o
texto `source_pending`; nada persiste.

## Correções feitas no módulo de prévia

1. `preview-bar.component.ts` — `min-height: 1.5em` no `<p role="status">`: vazio, ele tinha altura
   0 e `openPreview` (`lib.mjs`) espera o primeiro `[role="status"]` **visível** em ordem de
   documento (o da faixa) — sem isso `capture.mjs`/`axe.mjs` estouravam o tempo na primeira URL.
2. `preview.providers.ts` — `provideEnvironmentInitializer` declara `<link rel="icon" href="data:,">`
   quando o documento não tem ícone: o navegador pedia `/favicon.ico` (fora de `GET assets/**`),
   recebia 404 e gerava `console.error` na primeira carga, que `capture.mjs` trata como violação.

## Achados fora do lock (não corrigidos)

- **360 px com rolagem horizontal:** `table.stynx-table` em `/fila/defesa` (`loaded` 433 px,
  `error`/`forbidden` 407 px) e `rait-deadline-chip` do `rait-inquiry-card` em diligências 08
  (`loaded` 402 px). Origem: kit/`shared/`.
- Cabeçalhos da `rait-queue-table` exibem o nome do campo (`protocol_number`, `state`, `flag`,
  `due_on`) — `features/queue-columns.ts`, OD-R12-028.
- Minuta: rótulo "Autor" sem nome (`draft.page.ts` não liga `authorLabel`).
- Já conhecidos (A5 item 8): `Format: date` um dia a menos (`due_on` 2026-09-23 → 22/09/2026);
  `ui.pagination.*` e `ui.confirmDialog.cancel` sem tradução; `main.ts` sem
  `withInterceptorsFromDi()`; cores literais da faixa sem tokens `--detran-*`.
