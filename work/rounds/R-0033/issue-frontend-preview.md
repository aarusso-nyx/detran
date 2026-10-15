# Texto da issue — frente `frontend-preview` (R-0033)

> Redigido por TASK-0001 (Architect, 2026-10-15). **Não aberto no GitHub**: o maestro decide
> quando abrir (`plan.md`: "Sem issue: TASK-0001 redige a issue da frente").

**Título:** R-0033 `frontend-preview` — prévia honesta do `rait-web` baseada em fixtures (JW-01)

## Contexto

Fase P da campanha C-0003 "produto primeiro" (`work/campaigns/C-0003-produto-primeiro.md` §2–§3).
O Owner decidiu (OD-C3-002…006, 2026-10-14) abrir a campanha por uma **prévia executável, honesta e
baseada em fixtures** do console `rait-web` (`apps/rait/web`, Angular 22 + `@detran/ui` + STYNX
1.4.0), jornada **JW-01 (analista, `rait-analyst`)**, para revisão UI/UX em paralelo ao
desenvolvimento. Canal: URL local (`ng serve --configuration preview`) + artefato estático
`dist/preview/` anexado ao PR (OD-C3-003). O pin STYNX de `main` não muda (OD-C3-005). OD-C3-007
(decidida (a) em 2026-10-15): o manifesto de rotas fica; a JW-01 foi reescrita nos passos 9–10 e,
na prévia, são os passos 1–8 mais a prova negativa das rotas de decisão e impedimentos sob
`rait-analyst`.

Regras que a prévia não quebra: sem dado real; sem contornar RLS nem guardas; nenhuma requisição a
`/v1` (rede bloqueada por interceptor, como o `homologation` do TEAT web, ADR-0033); nenhum
sucesso simulado (comandos continuam `RaitCommandUnavailableError` e a tela marca "não funcional
na prévia"); nenhum valor normativo inventado (`source_pending` visível); nenhum teste
enfraquecido; manifestos de disponibilidade intactos; nada em `backend/`, gerados, pin, política.

## Escopo (entregáveis 1–8 de `work/rounds/R-0033/plan.md`)

1. `docs/framework/arch/frontend-preview-mode.md` — contrato do modo prévia.
2. Configuração de build `preview` no `rait-web` (`angular.json`, `src/main.preview.ts`), com
   adapters de fixture na fronteira `data/api` e interceptor que bloqueia rede.
3. Shell, navegação, mapa de rotas e estados representativos (carregado, vazio, carregando, erro,
   acesso negado) em todas as rotas do manifesto, sob `preview`.
4. Prévia da JW-01 com capturas 360/768/1280, axe (`serious`/`critical` = 0) e a marca "PRÉVIA —
   DADOS FICTÍCIOS".
5. Artefato estático `dist/preview/` e URL local.
6. `docs/framework/arch/frontend-wiring-pattern.md` v0 (costuras de `main` que as rodadas J usam).
7. Shell + estados das demais superfícies (`portal-web`, `dashboard-web`, `teat-web`) sob
   `preview`, se o orçamento permitir; senão, checkpoint com o que falta.
8. Estimativa revisada da fase J a partir das lacunas reais rota × API.

## Critérios de aceitação (imutáveis; `plan.md` §Critérios)

- **C-01** `pnpm --filter @detran/<s> build --configuration preview` gera `dist/preview/` e
  `ng serve --configuration preview` sobe sem backend; o build `production` continua verde e sem
  `DETRAN_PREVIEW_MARK` em `dist/browser`.
- **C-02** Spec de cobertura: toda entrada `page` do manifesto renderiza sob `preview` com o
  interceptor bloqueando `/v1` (0 requisições) e sem erro no console.
- **C-03** Faixa "PRÉVIA — DADOS FICTÍCIOS" em 100 % das páginas; toda ação de comando exibe "não
  funcional na prévia" ao ser acionada (spec por ação do catálogo da jornada).
- **C-04** JW-01: cada tela do roteiro capturada em 360/768/1280 nos estados
  `loaded`/`empty`/`error`/`forbidden`; capturas versionadas em `work/rounds/R-0033/preview/`.
- **C-05** axe-core 4.13.0 nas telas da jornada sob `preview`: 0 violações `serious`/`critical`;
  demais listadas.
- **C-06** Nenhum valor normativo inventado: fixture rastreável a `docs/framework/arch/fixtures/`,
  `@example` gerado ou seed; `source_pending` visível onde faltar.
- **C-07** `lint`, `test`, `typecheck`, `build` do app verdes; testes existentes não editados
  salvo adição; `pnpm check` verde no fim.
- **C-08** `git diff origin/main...HEAD --name-only` sem `backend/`, `packages/senatran-adapter`,
  gerados, `tools/stynx-version.json`, `.github/workflows/`, `.devai/`, `record/`, `law/register`,
  `policy.ts`.
- **C-09** `frontend-preview-mode.md` e `frontend-wiring-pattern.md` v0 publicados;
  `work/rounds/README.md`, `waves.md`, `backlog.md` atualizados; ODs no registro canônico.
- **C-10** Delivery-review PASS (Opus 5.5); evidência `evidence-R-0033.json`; `round close` +
  `round seal`.

## Pendência do Owner

- **OD-C3-008** (proposta por TASK-0001): estender `rait-fixtures.json` com as coleções e campos
  que a seed `20-fixtures-rait.sql` já tem e a JSON não (partes, documentos, admissibilidade,
  diligências, atribuições, eventos, prazos, decisões…; campos obrigatórios de `cases`/`raitDrafts`),
  em PR próprio de fixture, antes de TASK-0003. Sem isso, 26 telas ficam parciais e 5 vazias em
  `loaded` (`work/rounds/R-0033/inventory-rait-web.md` §3–§4).

## Links

- Plano: `work/rounds/R-0033/plan.md`; autorização: `work/rounds/R-0033/AUTHORIZATION.md`.
- Contrato: `docs/framework/arch/frontend-preview-mode.md`.
- Padrão de ligação: `docs/framework/arch/frontend-wiring-pattern.md` (v0).
- Inventário: `work/rounds/R-0033/inventory-rait-web.md`.
- Campanha: `work/campaigns/C-0003-produto-primeiro.md`; registro de ODs:
  `docs/meta/knowledge-base/open-decisions-rait.md` §C-0003.
- Jornada: `docs/framework/arch/rait-web-journeys/JW-01-analista.md`.
- Lacunas de comando: `work/rounds/R-0025/command-gap-analysis.md` (issue #122).
