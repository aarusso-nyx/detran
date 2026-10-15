# R-0033 — autorização do Owner

status: active

GRANTED — representação para o runtime DEVAI 1.5.6 da autorização expressa do Owner registrada
abaixo. Estes marcadores não ampliam o escopo do `plan.md` nem alteram as decisões OD-C3-001…006.

Papel: Architect (registro no bootstrap pelo maestro). Fonte: mensagem do Owner no chat da sessão
que iniciou este maestro (Claude Code, família Claude), em **2026-10-15** (America/Sao_Paulo).
Texto literal, sem correção:

> R-0003 authorized. proceed ith ir work while wait for ci

## Leitura registrada pelo maestro

- **"R-0003"** é lido como **R-0033**: a R-0003 (`dash-roles`) está fechada desde 2026-09-14
  (PC-0001, PR #32, `work/rounds/README.md`) e não admite reabertura; a única rodada proposta e
  aguardando autorização em 2026-10-15 era a R-0033 `frontend-preview`
  (`work/campaigns/C-0003-produto-primeiro.md` §4 fase P; `work/rounds/R-0033/plan.md`). O
  contexto da mensagem (resposta ao relato de abertura da C-0003 e do PR #182) confirma a leitura.
- **"proceed … while wait for ci"**: o CI referido é o do PR #182 (registro da parada da R-0022,
  OD-C3-006), em execução no momento da autorização; a rodada começa sem esperar o merge.
- A autorização cobre o `prompts/00-maestro.md` e o `plan.md` da R-0033 **como escritos** em
  `claude/detran-r22-handoff-03f872` (commit `101753a4`).

## Escopo autorizado

- Abrir e executar R-0033 `frontend-preview` conforme `work/rounds/R-0033/plan.md` (objetivo,
  contrato do modo prévia, tabela de tarefas TASK-0001…0008, ondas O1…O4, critérios C-01…C-10) e
  `prompts/00-maestro.md` (fluxo OD-C2-005: branch única, um commit por tarefa, um prompt-review
  no bootstrap, `acceptance_commands` por tarefa, CI local completo + uma delivery-review + um PR
  no fim).
- Superfície e jornada: `rait-web`, JW-01 (analista) — OD-C3-002 (a). Canal de revisão: URL local
  + `dist/preview/` anexado ao PR — OD-C3-003 (a). k6/mutation continuam não executados —
  OD-C3-004 (a). PR #179 (STYNX 1.5.3) é decidido fora desta rodada; o pin não muda — OD-C3-005 (a).

## Desvios registrados no bootstrap (2026-10-15)

1. **Família do maestro.** O `plan.md` e o `00-maestro.md` nomeiam maestro **Sol 6** (Codex CLI)
   com reviewer **Opus 5.5** pela ponte `claude`. O Owner dirigiu uma sessão da família **Claude**
   (Claude Code, Fable 5.1) a executar o prompt. Pela regra fixa do método (reviewer sempre da
   outra família; `orchestra/README.md` §2), o reviewer desta execução é **Codex Sol 6**
   (`gpt-6-sol`, `tools/orchestra/bridge.sh codex`) e os workers são subagentes da família Claude
   (`claude-opus-5-5`, `claude-sonnet-5`, `model-ladder.md`). Nenhum papel foi invertido.
2. **Worktree e branch.** Em vez de `detran-worktrees/frontend-preview` sobre `origin/main`, a
   execução usa a worktree criada pelo app para esta sessão
   (`.claude/worktrees/frontend-preview-5281e3`, branch `claude/frontend-preview-5281e3`), cortada
   de `claude/detran-r22-handoff-03f872` (PR #182, só registro, sem código) — abertura **empilhada**
   (OD-C2-005). O PR da rodada só abre depois do merge do #182; o branch nunca é reescrito.
3. **Sem push nem PR nesta janela.** Esta janela produz commits locais (bootstrap, prompts, O1,
   O2 e, se o orçamento permitir, TASK-0003 até o marco M1). Push e PR exigem autorização
   explícita do Owner no chat, ainda não dada.

## Limites que permanecem

- Nenhuma mudança em `backend/`, `packages/senatran-adapter`, arquivos gerados,
  `tools/stynx-version.json`, `.github/workflows/`, `.devai/`, `record/`, `law/register`,
  `backend/domains/shared/src/policy.ts` (C-08).
- Nenhum dado real em fixture; nenhum valor normativo inventado (`source_pending` visível);
  nenhum teste existente editado para passar; nenhum contorno de guarda ou RLS; a prévia nunca
  chama `/v1`.
- Critérios de aceitação C-01…C-10 imutáveis; mudança só por adenda numerada com decisão do Owner.
- Parada imediata e relato: dado real em fixture; prévia que só funcione com mudança de
  backend/política/pin; timebox de M1 vencido sem shell servível; orçamento da janela a 80 %.
