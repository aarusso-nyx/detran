# TASK-0010 — iteração 4 (restrita, Codex): C-4-44/45 re-escopados (A16), seed de C-4-41

> Worker da orquestra `portal-pwa`, rodada `R-0014`, CLI do Codex, worktree
> `/Volumes/Thiamat II/stech/detran/.claude/worktrees/r-0009-maestro-execution-33aaac`. Uma
> tarefa; sua **última mensagem é o relatório**. Nunca `git`, nunca instalar, nunca produção,
> nunca `work/rounds/**`, nunca os specs e2e anteriores. `pkill -f vitest` ao final. Ninguém
> responde durante a execução.

Papel: **Inspector** (Art. 6). Após a iteração 3 (`reports/TASK-0010-iteration-3.md`), o maestro
decidiu **A16** (`work/rounds/R-0014/plan.md` §Adendas — leia): em R-0009 a criação de pedido de
`pagamento` já pára em 422 M15 (`work/rounds/R-0009/contracts/CTG-0002.md` §2, tabela
"POST requests {serviceKey ∈ …pagamento…} → 422 SERVICE_UNAVAILABLE delegacao_indisponivel_r0007");
um pedido semeado em `PEDIDO_EM_COMPOSICAO` é estado inalcançável e o 502 `DELEGATION_FAILED`
que você viu é o caminho de falha da delegação, não a parada M15.

Leitura: `AGENTS.md`; `docs/meta/agents/inspector-tests.md`; `plan.md` A16; `CTG-0002.md` §2
(linhas citadas) e §5 (`NOT_FOUND{kind}`); `docs/framework/arch/portal-error-catalog.md` §2
(`PORTAL.NOT_FOUND`); `backend/app/tests/e2e/portal-routes.e2e.spec.ts` l. 150–175 (seed de
`portal.manifestation` em `AVALIACAO_OFERECIDA`); os seus quatro arquivos.

Correções:

1. `portal-journeys.support.ts`: remover do seed o pedido `JOURNEY_REQUEST_ID` de pagamento em
   composição (e qualquer linha só usada por ele).
2. `portal-journeys.e2e.spec.ts`: C-4-43 (`GET /aits/…f0000005` 200) mantido; C-4-44 → após
   `POST /requests` pagamento devolver 422 M15 (assert código + `unavailableReason`), `PUT
/requests/{id}/draft` com `If-Match` sobre um id de pedido inexistente (uuid fixo do padrão
   `LOCAL`) → 404 `PORTAL.NOT_FOUND` `context.kind = 'request'`; C-4-45 → `POST
/requests/{id}/submit` com `Idempotency-Key` M17 sobre o mesmo id → 404 idem; C-4-46/47
   continuam (nada quitado, nenhum evento `payment.*` no outbox).
3. C-4-41: o seed passa a inserir a manifestação em `AVALIACAO_OFERECIDA` do sujeito Prata (padrão
   citado) e o `it` afirma o 201 de `POST /evaluations` com as cinco dimensões — vermelho por
   fixture ausente é seu, não de TASK-0011.
4. Rode `portal-journeys.e2e.spec.ts` (em segundo plano com log + polling) e registre a linha
   `Tests`; vermelhos remanescentes só os de §2–§3 (CDT Prata) — liste-os. `typecheck` → 0;
   `prettier --check` → OK.

Entrega (última mensagem, formato da TASK-0010, "Tarefa: TASK-0010 (iteração 4)").
