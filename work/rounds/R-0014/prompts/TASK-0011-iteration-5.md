# TASK-0011 — iteração 5 (restrita, Codex): `PORTAL_SNE_PORT` obrigatório (A23(a))

> Worker da orquestra `portal-pwa`, rodada `R-0014`, CLI do Codex, worktree
> `/Volumes/Thiamat II/stech/detran/.claude/worktrees/r-0009-maestro-execution-33aaac`. Uma
> tarefa; sua **última mensagem é o relatório**. Nunca `git`, nunca instalar, nunca specs/testes,
> nunca `work/rounds/**`. O Inspector trabalha em paralelo nos specs — não os toque. Ninguém
> responde durante a execução.

Papel: **Engineer** (Art. 6). `delivery-review-CTG-0004` (ciclo 1) apontou em
`backend/domains/portal/inbox/src/handwritten/sne-enrollment.service.ts` l. 228/275: `PORTAL_SNE_PORT`
é `@Optional()` e a chamada nacional só ocorre em `if (this.sne)` — sem provider a adesão persiste
e publica sem passar pelo adapter, contra o contrato §4 (adapter → banco → outbox). Decisão
**A23(a)** (`work/rounds/R-0014/plan.md` §Adendas — leia).

Leitura: `plan.md` A23; `contracts/CTG-0004.md` §4 e §9; `sne-enrollment.service.ts` (inteiro);
`backend/domains/portal/inbox/src/inbox.module.ts` (ou onde o serviço é provido);
`backend/app/src/portal-national-read.providers.ts` (`PORTAL_SNE_PORT_PROVIDER`, já global);
`backend/domains/portal/inbox/src/handwritten/inbox.service.spec.ts` e `backend/domains/portal/inbox/tests/**`
(só para saber como o serviço é construído nos testes — **não** os edite; se ficarem vermelhos por
falta de porta, registre: o Inspector injeta o stub).

Correção (só produção do inbox e, se necessário, `backend/app/src`): `@Inject(PORTAL_SNE_PORT) private readonly sne: PortalSnePort`
sem `@Optional()`; `enroll()` chama `this.sne.enrollCitizen(...)` **incondicionalmente** antes de
consultar/gravar `portal.sne_enrollment` e antes de publicar `SNE_ADESAO_SOLICITADA`; retorno
`enrolled !== true` não persiste; erros do adapter → códigos §4. Cancelamento continua local
([DIVERGE-2]/OD-P106). Comentário de cabeçalho atualizado (A23(a)).

Validação: `pnpm --filter @detran/app typecheck` → 0; `pnpm --filter @detran/portal-inbox typecheck`
→ 0; `pnpm --filter @detran/portal-inbox test:unit` (segundo plano + polling) → registre `Tests`
(vermelhos só por serviço construído sem porta — liste-os para o Inspector); `prettier --write` nos
tocados. Não rode a suíte e2e (o maestro roda).

Entrega (última mensagem, formato da TASK-0011, "Tarefa: TASK-0011 (iteração 5)").
