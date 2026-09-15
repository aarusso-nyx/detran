# Orquestras de execução — método (meta-orquestração)

**Autoridade:** Architect (Constituição Art. 6). Aplica `AGENTS.md`, a Constituição DEVAI
(`.devai/pin/constitution.md`) e os manuais de `docs/meta/agents/` ao backlog de implementação
descrito nos build packs (`docs/framework/arch/*-build-pack.md`). Não cria governança nova: dá
forma operacional ao que a Constituição já exige (arts. 10, 17, 18, 19, 23, 24, 25, 27, 35, 37).

Lema: **planeje muito para trabalhar pouco.** O custo caro é retrabalho, não planejamento.

## 1. Unidades

| Termo         | Definição                                                                                                                                                                                                                              |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Frente**    | um pacote de trabalho (WP) de um build pack, ou um grupo acoplado de WPs, cujos grupos acoplados declaram, cada um, os upstreams que precisam estar em `main` para o merge (abertura só exige `main` atualizado). Lista em `waves.md`. |
| **Orquestra** | maestro + reviewer + workers dedicados a uma frente. Vive numa sessão nova, sem contexto anterior, iniciada com um único prompt (`prompts/00-maestro.md`).                                                                             |
| **Rodada**    | rodada DEVAI (`R-nnnn`) por frente: `work/rounds/R-nnnn/{plan.md, tasks/, prompts/, compositions.json, reviews/, budget.json}`; evidência e `audit observe` por rodada.                                                                |
| **Worktree**  | `../detran-worktrees/<frente>` sobre o branch `orchestra/<frente>`; a raiz do repositório fica reservada a humanos (Art. 27).                                                                                                          |
| **Tarefa**    | unidade atribuída a um worker: JSON no esquema DEVAI `task.schema.json` (`tasks/TASK-nnnn.json`), com critérios de aceitação executáveis.                                                                                              |

## 2. Papéis e famílias

| Papel        | Quem                                                                      | Responsabilidade                                                                                                  |
| ------------ | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Maestro**  | modelo **grande** (GPT-5.6 Sol ou Fable 5.1); é o agente da sessão        | planner: lê, decompõe, escreve os prompts, dispara, verifica, commita, grava evidência, abre e mescla o PR        |
| **Reviewer** | modelo da **outra família** (nível grande ou médio), via ponte de CLI     | avalia os prompts dos workers antes do disparo e o diff de cada tarefa antes do PR; veredito PASS / REVIEW / FAIL |
| **Workers**  | modelos **médio/pequeno da mesma família do maestro**, subagentes nativos | executam uma tarefa cada, dentro da fronteira de escrita do seu papel constitucional; nunca tocam no git          |

Regras fixas: o reviewer nunca é da família do maestro (Art. 18, 23); workers nunca são da outra
família (decisão do Owner, 2026-09-14); duas orquestras ativas por vez, uma com maestro Sol e outra
com maestro Fable, para distribuir o consumo entre as janelas de 5 h de cada família.

Escolha de modelo por tarefa: `model-ladder.md`.

## 3. Ciclo de uma frente (o que o prompt do maestro executa)

```text
bootstrap ─► leitura obrigatória ─► plan.md + tasks/*.json ─► prompts/*.md
   ─► reviewer (prompt-review) ─► disparo dos workers ─► checkpoint (hard gates)
   ─► reviewer (delivery-review) ─► commit + evidência ─► PR ─► CI ─► merge
   ─► devai audit observe ─► round close ─► relatório + budget.json
```

Cada passo tem uma saída obrigatória em `work/rounds/R-nnnn/`; um passo sem saída não aconteceu.
O detalhe está em `maestro-prompt.template.md`.

## 4. Correção formal (não negociável)

1. **Tríade acoplada por comando ou entidade** (Art. 24): Architect define contrato, guardas e
   critérios → Inspector escreve os testes → Engineer implementa até os testes passarem. Uma
   tarefa por papel, mesmo `coupled_task_group`, merge na mesma ordem. Quem define a referência não
   atua sobre ela (Art. 10).
2. **Locks por módulo** (`target_modules`, Art. 25): duas tarefas nunca escrevem no mesmo módulo ao
   mesmo tempo; `backend/domains/shared/src/policy.ts`, `roles.ts` e o DDL são módulos de lock.
3. **Nada inventado**: valor sem fonte vira linha `source_pending` no catálogo de parâmetros
   (`docs/framework/arch/parameter-catalogue.md`) ou questão `OD-*`; nunca constante silenciosa.
4. **Código gerado não se edita** (ADR-0007): muda o blueprint, regenera, commita junto.
5. **Gates nunca se enfraquecem** (Art. 17, 29–31): `pnpm check`, tier de teste do WP,
   `blueprints:check`, `contracts:check`, `verify:*`. Falha é triada (bug / sensor / política /
   lacuna) antes de qualquer correção.
6. **Um PR por frente** (ou por grupo acoplado, quando a frente é grande), pelo template de PR, com
   papel declarado e evidência DEVAI.
7. **Vocabulário canônico**: estados, timers, papéis e erros vêm dos catálogos e workflows; a UI só
   traduz rótulos.
8. **Política prova presença e ausência**: toda matriz de grants tem testes positivos para os
   papéis listados e negativos para todos os papéis canônicos omitidos. Grants derivados por
   analogia são proibidos; qualquer ampliação exige fonte canônica ou decisão do Owner.
9. **Fixtures provadas no CI**: toda rodada que entrega fixtures (`backend/database/seed/*.sql`) prova
   `bash backend/database/seed.sh` em banco limpo **e** o job `backend-kernel` executa `seed.sh` após o
   reset (passo criado em R-0006); um seed novo que não carrega sob `seed.sh` é `plant-bug` da rodada que
   o criou (R-0004: `05-parameters.sql` sem contexto de tenant abortava o seed e o CI não percebia).
10. **Pacote novo montado no `AppModule`** entra também em `backend/app/vitest.config.ts` (alias para
    `src/index.ts`) e em `backend/app/package.json`; a fronteira do Engineer de wiring inclui esses dois
    arquivos (R-0006: o tier e2e do app falhou por resolução de `dist/` inexistente).
11. **`devai audit observe` exige o HEAD exato**: observar o merge logo após `git fetch`, antes de qualquer
    commit novo; ao aceitar a cadeia de `main` num merge, as observações do branch caem e são refeitas
    no fechamento sobre o merge final (R-0006).
12. **Histórico publicado não se reescreve**: rebase é permitido somente antes do primeiro push.
    Depois de publicar o branch, integre avanços do upstream ou de `main` com merge normal, rode de
    novo os gates e faça push sem força. `--force`, `--force-with-lease` e equivalentes são proibidos.

## 5. Parcimônia de tokens

- **Orçamento por janela de 5 h e por família**, declarado no prompt do maestro
  (`{{ORCAMENTO_5H}}`) e contabilizado em `budget.json` (estimativa por tarefa: tokens de leitura,
  tokens de saída, chamadas ao reviewer).
- **Planejamento é a fase cara e única**: o maestro lê o corpus uma vez e transfere para os
  prompts exatamente o que cada worker precisa; workers recebem listas de leitura fechadas, nunca
  "leia o repositório".
- **Workers pequenos por padrão**; médio só para modelagem, guardas de estado e frontend com
  STYNX/Angular; grande nunca como worker.
- **Esforço baixo para transcrição, alto só para decisão**; o reviewer roda uma vez por prompt e
  uma vez por entrega (máximo dois ciclos de REVIEW por item; depois escala ao humano). O primeiro
  ciclo é exaustivo; os seguintes ficam **restritos aos itens corrigidos** (R-0006: sete ciclos de
  prompt-review com achados novos sobre texto inalterado a cada ciclo).
- **Corte por janela**: se o orçamento da janela acabar, o maestro grava `checkpoint` (estado das
  tarefas em `plan.md` §Retomada) e para; a próxima sessão retoma pelo mesmo prompt.
- **Nunca reler o que já está em `plan.md`**: o plano é a memória da orquestra.

## 6. Escalada (Arts. 19 e 23)

| Situação                                              | Ação                                                                                   |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------- |
| hard gate falha após a entrega do worker              | triagem; 1 nova tentativa no mesmo nível com o achado no prompt                        |
| segunda falha                                         | 1 tentativa no nível acima da mesma família                                            |
| reviewer FAIL duas vezes no mesmo item                | reviewer da outra família decide entre as versões; se persistir, `escalated` ao humano |
| bloqueio por decisão do Owner (OD) ou por dependência | `checkpoint`; registrar em `plan.md` §Bloqueios; entregar o que não depende            |

Cada escalada é registrada na tarefa (`iteration_trail`).

## 7. Evidência e fechamento

```bash
pnpm exec devai evidence record --kind generic --round R-nnnn --repo-root . --as-role engineer --input work/rounds/R-nnnn/evidence-<tarefa>.json --write --format human
pnpm exec devai evidence verify --scope chain --repo-root . --show-head --format human
pnpm exec devai audit observe --repo-root . --at <sha-40> --round R-nnnn --as-role auditor --write --format human   # após o merge
pnpm exec devai round close --round R-nnnn --repo-root . --input work/rounds/R-nnnn/closure.json --as-role architect --write --format human
```

A cadeia governada é `record/proofs/chain.json`; nunca editar à mão.

## 8. Ponte entre famílias

`tools/orchestra/bridge.sh <codex|claude> <modelo> <prompt.md> <saida.json> [<worktree>]` invoca a
CLI da outra família de forma não interativa e somente leitura, grava a saída em
`work/rounds/R-nnnn/reviews/` com o hash do prompt e do resultado. É o único caminho pelo qual o
reviewer entra na orquestra. Antes de calcular o hash, a ponte valida e normaliza o JSON com o
Prettier; saída inválida falha sem criar o registro `.bridge.json`. Sem tokens no repositório: a
autenticação é a da CLI instalada.

## 9. Correções pendentes nos build packs (PR próprio, antes da onda 2)

Gates que citam comandos inexistentes e que os maestros devem substituir pelos reais até a
correção: `ng build` de `apps/rait/web` e `pnpm --filter @detran/rait-web test` (não há pacote;
usar `pnpm --filter @detran/ui build|test` até o app existir), `openapi-typescript` (invocar por
script a criar em WP-C/WP-T3), "`contracts:check` estendido" (o script atual não valida exemplos
de comandos). O build pack do RAIT não tem seção OD própria: as questões vivem em
`docs/meta/knowledge-base/open-decisions-rait.md`.

Numeração de DDL nos build packs colide com arquivos existentes: BOAT cita `40-est-crash.sql`
(`40-ch-clinical-network.sql` existe) e DASHBOARD cita `50-dashboard.sql` (`50-ch-telehealth.sql`
existe); o RAIT diz que os DDL "34…37 já foram incluídos" no `apply.sh`, mas o script aplica
`ddl/*.sql` por ordem lexicográfica. Os planos das rodadas usam `70-est-crash.sql`,
`80-dashboard.sql`, `38/39/57/58-inf-*.sql`, `13/16/17/18/19-ops-*.sql` e `61…64-portal-*.sql`;
a tarefa de documentação de cada rodada corrige o build pack correspondente.

## Arquivos deste método

| Arquivo                                 | Uso                                                                 |
| --------------------------------------- | ------------------------------------------------------------------- |
| `README.md`                             | este método                                                         |
| `model-ladder.md`                       | escada de modelos, esforço e escolha por tipo de tarefa             |
| `waves.md`                              | frentes, dependências, locks, família do maestro, rodadas           |
| `maestro-prompt.template.md`            | prompt único da orquestra (agnóstico de família)                    |
| `reviewer-prompt.template.md`           | prompt do reviewer (modos prompt-review e delivery-review)          |
| `worker-prompt.template.md`             | esqueleto dos prompts de worker, por papel                          |
| `task.template.json`                    | tarefa no esquema DEVAI (`task.schema.json` 2.0.0)                  |
| `../../../../tools/orchestra/bridge.sh` | ponte de CLI para o reviewer                                        |
| `../../../../work/rounds/`              | instâncias por rodada (R-0003…R-0016, uma por frente de `waves.md`) |
