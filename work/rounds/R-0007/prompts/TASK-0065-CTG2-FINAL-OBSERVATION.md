# TASK-0065 — observação final independente do candidato CTG-0002

Papel Art. 6: Inspector, Terra/high, limite 1/1. Somente leitura/execução; único
arquivo gravável é `work/rounds/R-0007/tasks/TASK-0065.json`. Leia AGENTS,
CTG-0002, contrato/plano técnico de fechamento, TASK-0008/0047–0050/0058–0064
e ADR-0027. Não corrija nada e não regenere.

Observe o candidato atual no banco dedicado `detran_r7_ctg1_a2`, usando sempre
URLs explícitas e `role_app_backend` nos testes de request path. Exija coleção
positiva; zero testes é FAIL.

Execute e registre:

1. suites completas de shared, case, worklist e session nos tiers unit e
   integration aplicáveis;
2. app unit e os três E2E CTG-0002 production-path;
3. `pnpm blueprints:check`, `pnpm contracts:check`,
   `pnpm verify:rls-ddl`, `pnpm verify:decorators`;
4. typechecks shared/case/worklist/session/app;
5. `pnpm check` e `pnpm backend:test:ci`;
6. `pnpm devai:doctor`, evidência chain e `git diff --check`.

Confirme também por inspeção:

- 20 POSTs manuscritos CTG-0002, exatamente um por rota;
- zero POST/PATCH/DELETE gerado para schedules, batches, votes e minutes;
- zero método HTTP para oral arguments;
- hashes dos sensores finais de TASK-0049/0060/0064;
- blueprints case 1.1.7, worklist 1.4.1, session 1.2.1 e hash agregado de
  geração `06344da4fb582a7758af68608f59c5c9d8751186421eff9722bd2c9ae085d237`;
- tabelas/fixtures 20 cases, 4 sessions, 3 agenda items, sem reset/seed.

Qualquer RED deve ser relatado com comando, arquivo/teste e causa provável;
não marque PASS parcial como fechamento. Diferencie a nota operacional de
rate-limit distribuído e a ausência de configuração externa de document trust
de um defeito CTG-0002. Não declare revisão independente de Auditor nem merge.
