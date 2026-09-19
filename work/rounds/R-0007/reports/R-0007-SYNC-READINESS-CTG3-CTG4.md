# R-0007 — sync e prontidão para CTG-0003/CTG-0004

Data: 2026-09-19  
Papel: Engineer (integração) / Inspector (observação dos gates)

## Identidade do candidato

- checkpoint CTG-0001/0002 preservado: `a72f6ce9a71475f654c8a021990137845b5eae9a`;
- branch de recuperação: `codex/r0007-ctg2-pass-20260919`;
- `origin/main` integrado: `b0df484dc0ae1fc1fa742a5f60ef00b17b1c348e`;
- primeiro merge funcional: `ad243346`;
- merge documental final: `660e9e80e3d44c6c7cfce4df855592e23a7305e7`.

O segundo avanço de `origin/main` alterou somente
`work/rounds/R-0013/{plan.md,prompts/00-maestro.md}`. Nenhum input técnico dos
gates de R-0007 mudou após o primeiro merge.

## Reconciliação realizada

- resolução composta de `AppModule`, erros compartilhados, política e scripts;
- regeneração oficial de parâmetros, blueprints e 58 clientes de contrato;
- inventários fechados de DDL e seed atualizados com os módulos de portal/EST;
- runner de backend fixado ao banco descartável explícito;
- inventário do sensor de upgrade atualizado para 57 DDLs ordinários e três
  fases manuais RAIT, sem relaxar asserções.

## Provas do candidato integrado

- `pnpm check`: PASS; inclui blueprints, 139 operações, 58 clientes, catálogo
  89/18/14, typecheck, limites arquiteturais, 1.314 testes do portal e build;
- `pnpm backend:test:ci`, tiers unit/integration/E2E: unit e integration PASS;
  app E2E 355 PASS e 2 `todo`;
- `pnpm backend:test:upgrade`: 18/18 PASS contra
  `detran_r7_ctg1_a2`, incluindo falhas injetadas, rollback, lock,
  idempotência, legado e equivalência fresh/upgrade;
- `pnpm exec devai evidence verify --scope chain`: PASS, head
  `453c9e53e7359ea5c1f01f8d2f534d7dc77bd0047bf71193e908aabfd11fe99f`;
- `pnpm format:check`, `pnpm docs:kb:check` e
  `pnpm docs:kb:publish-check`: PASS após o merge documental final.

A primeira tentativa E2E sem o serviço externo devolveu 21 falhas por 503. A
reexecução fiel ao CI, com `senatran-mock` em banco dedicado, passou 355/355;
logo não houve waiver nem alteração de teste. O primeiro ensaio de upgrade
falhou fechado porque o inventário R-0007 ainda listava 49 DDLs; após incluir
os oito DDLs legítimos de `main`, o mesmo sensor passou 18/18.

## Elegibilidade

1. **Elegível agora:** CTG-0003, iniciando por TASK-0009
   (Architect, `gpt-5.6-sol`/medium), 0/2.
2. TASK-0010 e TASK-0011 permanecem `gpt-5.6-terra`/high; TASK-0012 permanece
   `gpt-5.6-sol`/medium, conforme a direção OWNER de economia.
3. CTG-0004 está completamente materializada em TASK-0013…0018 e prompts
   correspondentes. Sua primeira tarefa, TASK-0013, permanece corretamente
   inelegível até TASK-0012 concluir CTG-0003.

Estado final deste procedimento: **READY para despachar TASK-0009**. Não foram
autorizados nem executados push, PR, merge em `main` ou início de CTG-0003.
