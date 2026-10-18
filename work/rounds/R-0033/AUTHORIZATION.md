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
  - `dist/preview/` anexado ao PR — OD-C3-003 (a). k6/mutation continuam não executados —
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

## Adenda B1 — ciclo 3 restrito do prompt-review e OD-C3-007 (Owner, 2026-10-15)

Pergunta do maestro, depois de `reviews/prompt-review-2.json` (Sol 6, FAIL: 11 de 13 achados
resolvidos, 2 restantes corrigidos pela adenda A2 do `plan.md`): autorizar um terceiro ciclo
restrito aos 2 itens, ou aceitar A2 sem resubmissão, ou parar. Resposta do Owner, recebida na
sessão-mãe e transmitida ao maestro, texto literal:

> Owner decision: (a) run prompt-review cycle 3 restricted to the 2 remaining items and proceed
> to O1/O2 on PASS. OD-C3-007: (a) keep the manifest, rewrite JW-01 steps 9–10.

Efeitos (precedente R-0022 Adenda B1):

- **Ciclo 3 restrito** aos itens 1 (JW-01 passos 9–10) e 10 (prova executável do `ng serve` do
  portal) do ciclo 2. `PASS` → ondas O1 e O2; `FAIL` ou `REVIEW` → parada e relato ao Owner, sem
  ciclo 4. Não dispensa PASS.
- **OD-C3-007 decidida (a):** o manifesto de rotas permanece (`/casos/:id/decisao` só
  `rait-signing-authority`; `/casos/:id/impedimentos` só `rait-rapporteur`/`rait-chair`); a
  jornada `docs/framework/arch/rait-web-journeys/JW-01-analista.md` é reescrita nos passos 9–10
  (o analista não acessa essas rotas; a decisão assinada chega-lhe por outro meio documentado e a
  declaração de impedimento do analista fica fora da JW-01 até fonte canônica). A reescrita é
  tarefa de Architect (TASK-0001, lock ampliado pela decisão — adenda A3 do `plan.md`); os SVG
  gerados dos blocos Mermaid ficam como follow-up (não há gerador no repositório).
- Permanecem: nenhum push, nenhum PR, nenhuma mudança de código fora dos locks da rodada.

## Adenda B2 — OD-C3-008 decidida (a): PR próprio de paridade da fixture (Owner, 2026-10-15)

Pergunta do maestro, no relatório da janela 1 (OD-C3-008 proposta por TASK-0001): a fixture
`docs/framework/arch/fixtures/rait-fixtures.json` não traz coleções nem campos obrigatórios que a
seed `backend/database/seed/20-fixtures-rait.sql` tem. Resposta do Owner, recebida na sessão-mãe
e transmitida ao maestro, texto literal:

> Owner decision OD-C3-008: (a) open a separate fixture PR transcribing the missing collections
> and fields from seed 20-fixtures-rait.sql into rait-fixtures.json with the same ids, before
> TASK-0003.

Efeitos e leitura do maestro (instrução de aplicação recebida junto da decisão):

- A mudança de fixture é **PR próprio contra `main`**, não empilhado na R-0033: branch cortado de
  `origin/main` (`51ec27f0` no momento da decisão), transcrevendo da seed para a JSON **exatamente**
  as coleções e os campos que `work/rounds/R-0033/inventory-rait-web.md` lista como ausentes, com
  os mesmos ids, nada inventado (`source_pending` onde a seed não tem valor), `rait-fixtures.md`
  atualizado e os specs que consomem a fixture mantidos verdes. Mudança de contrato de teste
  (`rait-fixtures.md` §Regras): autoria/verificação por Inspector; revisão pela outra família
  (Codex) antes do merge.
- **Push e PR autorizados só para o branch da fixture.** O branch da R-0033
  (`claude/frontend-preview-5281e3`) continua sem push e sem PR.
- TASK-0003 só começa depois do merge desse PR e da integração de `origin/main` por merge na
  branch da rodada.

## Adenda B3 — continuação autorizada pelo Owner (2026-10-18)

Fonte: mensagem expressa do Owner na sessão de continuação; texto literal:

> Resume R-0033 from claude/frontend-preview-5281e3, reconcile it with current main, finish the Portal preview and remaining checks, and open a PR.

Autoriza retomar o checkpoint `aca40880`, reconciliar `main`, concluir a prévia Portal
(TASK-0009 Inspector → TASK-0007 Engineer), executar os checks restantes e abrir o PR
da R-0033. A restrição histórica de push/PR desta rodada fica superada neste escopo.
Não autoriza merge, `round close` ou `round seal`; esses efeitos permanecem pendentes.
O escopo, os critérios C-01…C-10 e as decisões existentes permanecem vinculantes.
OD-C3-009 continua aberta e não bloqueia esta prévia; nenhum papel é ampliado.

Continuação em worktree isolada
`/Volumes/Development/.codex/worktrees/r0033-portal-preview/detran`, branch
`codex/r0033-portal-preview`. O maestro atual pertence à família Codex/Sol; a
revisão de entrega pela outra família (Claude) está planejada, sem veredito ainda.
As famílias, versões e limitações de janela anteriormente registradas são história
das execuções de 2026-10-15, preservadas integralmente.

## Adenda B4 — merge, evidência, auditoria e fechamento (Owner, 2026-10-18)

Fonte: mensagem expressa do Owner na sessão de continuação; texto literal:

> Merge PR #191 now that all required checks are green, then complete R-0033’s post-merge evidence, audit, and closure steps.

Autoriza o merge do PR #191 com checks obrigatórios verdes e os passos pós-merge
para evidência, auditoria e fechamento da R-0033, incluindo os verbos de close/seal
aplicáveis. Supera o limite histórico de B3 para esses efeitos. Não amplia escopo
runtime, decisões de produto, papéis ou campanha; não autoriza alterar cadeias à mão.

Merge informado e confirmado pelo maestro: `b4d4d932bb49c58a5df20090a4d49d433a3c0599`.
Cinco checks verdes do candidato `2554ff83fe1e3acb3b1e0e601a6f8750d61cbae7`.
Auditoria exata do merge concluída pelo verbo `audit observe`: `EV-18e9b5c6a93d228a`.
O ZIP publicado em <https://github.com/user-attachments/files/33632020/preview-R-0033.zip>
foi verificado (693124 bytes, 83 entradas, SHA256
`db39717beb8c75e3e4e523bbbbbf5e7f9b930e2a269685517980e525f075672f`).

Vínculos de decisão para o insumo de fechamento: **D-1** = abertura autorizada de
2026-10-15 e B1/B2/B3; **D-2** = juízo Architect de fechamento do escopo entregue,
ancorado nesta autorização B4, nos gates/review e na observação exata do merge.
`closure.json` preparado nesta etapa é insumo do verbo, não recibo de sua execução:
DEVAI atribui PC/data e produz o registro canônico. Close/seal só serão declarados
executados após os respectivos recibos; nenhuma saída de runtime é fabricada.
