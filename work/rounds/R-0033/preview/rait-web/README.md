# Captura e a11y da prévia do `rait-web` (R-0033 TASK-0005)

Scripts Node ESM (sem dependência nova) que exercitam a prévia (`ng serve --configuration preview`
ou o artefato estático `apps/rait/web/dist/preview`) conforme `roteiro-jw-01.md`. Usam
`playwright-core` 1.63.0 (devDependency de `apps/rait/web`) com o Google Chrome instalado
(`channel: 'chrome'`; nenhum navegador é baixado) e `axe-core` 4.13.0.

Arquivos: `lib.mjs` (roteiro executável, viewports, servidor estático), `capture.mjs`, `axe.mjs`,
`smoke.mjs`, `check.mjs`. Rodar sempre a partir da raiz do repositório.

## Modo (a) — build estático + servidor embutido

```bash
pnpm --filter @detran/rait-web exec ng build --configuration preview
node work/rounds/R-0033/preview/rait-web/capture.mjs
node work/rounds/R-0033/preview/rait-web/axe.mjs
node work/rounds/R-0033/preview/rait-web/check.mjs captures
node work/rounds/R-0033/preview/rait-web/check.mjs axe
```

Sem `PREVIEW_BASE_URL`, os scripts servem `apps/rait/web/dist/preview` em porta efêmera
(fallback SPA, sem proxy e sem `/v1`). Sem o diretório, falham com "execute `ng build
--configuration preview` antes".

## Modo (b) — contra `ng serve`

```bash
pnpm --filter @detran/rait-web exec ng serve --configuration preview --port 4201
PREVIEW_BASE_URL=http://localhost:4201 node work/rounds/R-0033/preview/rait-web/capture.mjs
PREVIEW_BASE_URL=http://localhost:4201 node work/rounds/R-0033/preview/rait-web/axe.mjs
```

`PREVIEW_OUT` muda a pasta de saída (padrão `work/rounds/R-0033/preview/rait-web/captures`).

## Saídas

- `captures/<passo>-<slug>-<estado>-<largura>.png` — 87 arquivos (7 telas × 4 estados × 3
  larguras + `/sem-permissao` × 3), `fullPage`.
- `captures/axe-report.json` — `{ generatedAt, baseUrl, axeVersion, pages: [{ url, state,
violations: [{ id, impact, nodes }] }] }`; nada é filtrado.

## Códigos de saída

- `capture.mjs`: 0 = todas as capturas feitas e provas negativas (`rait-secretary` →
  `/sem-permissao`) confirmadas; 1 = requisição a `/v1/`, `console.error`/erro de página, rota
  final inesperada, build ausente ou falha de navegação.
- `axe.mjs`: 0 = nenhuma violação `serious`/`critical`; 1 = existe ao menos uma (ou falha de
  execução). Violações menores ficam no relatório.
- `check.mjs captures`: 0 = contagem e nomes dos `.png` = `expectedCaptureCount()`; `axe`: 0 =
  `axe-report.json` sem `serious`/`critical`; `resolve`: 0 = `playwright-core` resolvido e
  `lib.mjs` importado sem efeito colateral. Qualquer falha = 1.
- `smoke.mjs`: 0 = `ng serve --configuration preview` respondeu `GET /` 200 com
  `rait-preview-root` em até 180 s (processo encerrado ao final); 1 = não subiu.

## Como ler

Abra as capturas na ordem do nome (passo, tela, estado, largura) com o `roteiro-jw-01.md` ao lado.
Cada captura mostra a faixa "PRÉVIA — DADOS FICTÍCIOS". Nada aqui cria dado nem aceita diálogo de
confirmação; os scripts apenas observam.
