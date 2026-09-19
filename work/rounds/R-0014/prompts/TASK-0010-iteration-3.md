# TASK-0010 — iteração 3 (restrita, Codex): asserções determinísticas, C-4-32, C-4-44/45, exceção A15 do lint

> Worker da orquestra `portal-pwa`, rodada `R-0014`, CLI do Codex, worktree
> `/Volumes/Thiamat II/stech/detran/.claude/worktrees/r-0009-maestro-execution-33aaac`. Uma
> tarefa; sua **última mensagem é o relatório**. Nunca `git`, nunca instalar, nunca produção,
> nunca `work/rounds/**`, nunca os specs e2e anteriores. Nunca deixe processo vivo (`pkill -f vitest`
> ao final). Ninguém responde durante a execução.

Papel: **Inspector** (Art. 6). Iteração 2 (`reports/TASK-0010-iteration-2.md`) trouxe 80 `it`;
o maestro rodou a suíte inteira em banco recém-semeado: `Test Files 3 failed | 13 passed (16)`,
`Tests 12 failed | 230 passed | 2 todo (244)`. Dos 12 vermelhos, 8 são comportamento pendente de
TASK-0011 (C-4-55/58/59/60/61/63/64 e o 503 nacional) e **4 são defeitos de spec** — além de um
padrão vedado em 25 asserções. Corrija:

## Leitura obrigatória (lista fechada)

- `AGENTS.md`; `CODESTYLE.md` §Tests; `docs/meta/agents/inspector-tests.md`
- `work/rounds/R-0014/contracts/CTG-0004.md` §1 (tabela e matriz), §6, §8; `work/rounds/R-0014/plan.md` §Adendas **A15** (decisão desta iteração)
- `work/rounds/R-0009/contracts/CTG-0002.md` §2 (rota `PUT requests/{id}/draft` e `POST …/submit`: ETag, `If-Match`, corpo do draft) e §3 (M8: o que `submit` devolve para `pagamento` sem R-0007)
- `docs/framework/schemas/portal-request-draft.schema.json`; `backend/app/tests/e2e/portal-requests.e2e.spec.ts` (padrão real de draft/submit com ETag)
- `docs/framework/arch/portal-route-contract.md` §3 (`GET me` — "titular vê sem máscara") e §7 (`GET crashes/{id}` — `thirdPartyFieldsSuppressed`)
- Os seus quatro arquivos (inteiros)

## Correções

1. **Asserções por conjunto de status são vedadas (A15):** substitua **todas** as 25 ocorrências de
   `expect([…]).toContain(r.status)` (journeys l. 182, 202, 224, 228, 232, 249, 258, 294, 335, 354,
   362, 366, 380, 384, 388; national-mock l. 67, 109, 120, 135, 209, 227; payload-lint l. 185, 189,
   193, 223) pelo status **e corpo** exatos que o contrato fixa para aquele critério (cite a
   linha do contrato em comentário). Onde o valor hoje é 503 por fixture ausente e o contrato fixa
   200 (leituras CDT do CPF Prata), afirme **200** — fica vermelho até TASK-0011 e é classificado
   como tal. Onde o contrato fixa 422 M15, afirme 422 + `PORTAL.SERVICE_UNAVAILABLE` +
   `unavailableReason`; 404 só quando o contrato manda (`NOT_FOUND{kind}`).
2. **C-4-32:** o campo `thirdPartyFieldsSuppressed: true` é canônico; a asserção passa a verificar
   a ausência de **valores** de terceiros (nome/CPF/placa de terceiro da fixture, ou chaves de
   terceiro dentro de `summary`) e `thirdPartyFieldsSuppressed === true`.
3. **C-4-44/C-4-45 (JRN-010):** fluxo real de draft/submit como `portal-requests.e2e.spec.ts`:
   `GET /requests/{id}` → `ETag`; `PUT …/draft` com `If-Match` = esse ETag e corpo válido pelo
   schema → 200 e ETag novo; `POST …/submit` com `Idempotency-Key` M17 → o resultado que CTG-0002
   §3/M15 fixa para `pagamento` sem R-0007 (afirme código e `unavailableReason`); nada de corpo `{}`
   nem `If-Match: "4"` chutado. Se a fixture `JOURNEY_REQUEST_ID` não estiver no estado que o
   contrato exige, ajuste o seed (`seedJourneyFixtures`) com os valores canônicos do padrão de
   `portal-routes.e2e.spec.ts`.
4. **C-4-68 (A15):** exceção fechada — o CPF da persona autenticada é admitido **só** em
   `GET /identity/me`, campo `cpf`; continue proibindo CPF em todas as outras rotas e CPF de outra
   persona em qualquer rota (inclua um `it` negativo: CPF de Ouro nunca aparece nas respostas de Prata).
5. Rode os três arquivos (`DETRAN_TEST_TIER=e2e pnpm --filter @detran/app exec vitest run tests/e2e/portal-journeys.e2e.spec.ts` etc., em segundo plano com log + polling, como na iteração 2)
   e registre as linhas literais; classifique cada vermelho remanescente "critério → § pendente de
   TASK-0011". `pnpm --filter @detran/app typecheck` → 0; `prettier --check` nos tocados → OK.

## Entrega (última mensagem, formato da TASK-0010, "Tarefa: TASK-0010 (iteração 3)")
