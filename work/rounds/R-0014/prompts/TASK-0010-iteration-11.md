# TASK-0010 — iteração 11 (restrita, Codex): achados de spec do delivery-review-CTG-0004 (A23(b)(c)(d))

> Worker da orquestra `portal-pwa`, rodada `R-0014`, CLI do Codex, worktree
> `/Volumes/Thiamat II/stech/detran/.claude/worktrees/r-0009-maestro-execution-33aaac`. Uma
> tarefa; sua **última mensagem é o relatório**. Nunca `git`, nunca instalar, nunca produção,
> nunca `work/rounds/**`. O Engineer trabalha em paralelo em `sne-enrollment.service.ts` (porta
> obrigatória) — não toque produção. `pkill -f vitest` ao final (se o sandbox recusar, registre).
> Ninguém responde durante a execução.

Papel: **Inspector** (Art. 6). `work/rounds/R-0014/reviews/delivery-review-CTG-0004.json` (leia)
devolveu FAIL com três achados de spec; decisão **A23** (`plan.md` §Adendas — leia).

Leitura: `AGENTS.md`; `docs/meta/agents/inspector-tests.md`; `plan.md` A23 (e A15/A19 para o que já
vale); `contracts/CTG-0004.md` §4, §5, §6, §8 (C-4-56…59, 61, 64, 66, 67, 70);
`backend/app/tests/e2e/portal-stream.e2e.spec.ts` (inteiro — padrão de abrir `GET /stream`, ler
linhas, publicar no outbox, `Last-Event-ID`); `portal-routes.e2e.spec.ts` l. 460–540 (adesão SNE
de R-0009: 422 sem contato, 201, replay, `auditRows`); `backend/domains/portal/inbox/src/handwritten/{sne-enrollment.service,inbox.controller}.ts`
(só leitura: colunas de `portal.sne_enrollment`/`portal.push_subscription`, evento
`SNE_ADESAO_SOLICITADA`, cabeçalho `Idempotency-Replayed`); `backend/domains/portal/inbox/src/handwritten/inbox.service.spec.ts`
e `backend/domains/portal/inbox/tests/**` (unitários de R-0009 que constroem `PortalSneEnrollmentService`
— com a porta obrigatória, injete um stub `{ enrollCitizen: async () => ({ enrolled: true }) }`
onde faltar; nunca relaxe asserções); os seus specs.

Correções:

1. **C-4-56** (ordem adapter → banco → outbox): com a persona Prata **não aderida** (use
   `resetGoldenSubjectRows`/limpeza da adesão de fixture antes do caso), `POST /sne/enrollment` →
   201; afirme a linha em `portal.sne_enrollment` **e** o evento `SNE_ADESAO_SOLICITADA` no outbox
   (`auditRows`/consulta SQL como R-0009) **após** a resposta; e que o mock registrou a adesão
   (`GET /sne/enrollment` do próprio Portal devolve `enrolled: true` com `channel`).
2. **C-4-57** (`PROVIDER` → 503 sem gravação): app isolado com `PORTAL_SNE_PORT` substituído por
   fatia que lança `SenatranAdapterError('…', 'PROVIDER', 503, 0)` (mesmo mecanismo A19(c), em
   `portal-national-unavailable.e2e.spec.ts`), `POST /sne/enrollment` → 503
   `PORTAL.SNE_UPSTREAM_UNAVAILABLE` com `retryAfter`, **nenhuma** linha nova em `portal.sne_enrollment`
   e nenhum evento no outbox.
3. **C-4-59** (idempotência SNE e push): replay com a mesma chave e mesmo corpo → mesmo status/
   corpo e `Idempotency-Replayed: true`; chave reutilizada com corpo divergente → 409
   `PORTAL.IDEMPOTENT_KEY_REUSE_DIFFERENT_BODY { key }` — os quatro casos (SNE ×2, push ×2).
4. **C-4-61**: `vehicleId` **igual** a `a1204f2f-07f6-551a-9e82-0e28038d3049` (UUIDv5 canônico do
   chassi da fixture, contrato §3), `plate: 'PRT2A22'`, `model: 'FIAT/ARGO 1.0'`; corpo sem
   `renavam`/`chassi`.
5. **C-4-66/67 no stream**: abrir `GET /v1/portal/stream` para Prata e para Ouro (padrão C-0002-82),
   publicar no outbox um evento do sujeito Prata (mesmo mecanismo de R-0009), afirmar que só a
   conexão de Prata recebe a linha (Ouro nada) e varrer o `data` recebido contra **toda** a lista §6
   (CPF, `cpf_hash`, `tenantId`, e-mail, telefone, tokens internos) — nada de `GET /requests/{id}`
   como substituto.
6. **C-4-70**: remover o `it` (falsa cobertura); nota no relatório: os três `typecheck` são gate do
   maestro.
7. Rodar os arquivos tocados e a suíte e2e do app (segundo plano + polling); `pnpm --filter
@detran/portal-inbox test:unit` também (stub da porta); registrar as linhas `Tests`; `typecheck`
   → 0; `prettier --check` → OK. Vermelhos admitidos: só os que dependem da porta obrigatória em
   produção (Engineer em paralelo) — liste.

Entrega (última mensagem, formato da TASK-0010, "Tarefa: TASK-0010 (iteração 11)").
