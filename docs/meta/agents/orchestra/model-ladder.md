# Escada de modelos e escolha por tarefa

**Autoridade:** Architect. Heurística revisável a cada rodada (registrar ajustes em `waves.md`
§Histórico); não é texto constitucional (Art. 23: famílias concretas são política F5).

## Famílias e níveis (decisão do Owner, 2026-09-14)

| Nível       | OpenAI (Codex CLI) | Anthropic (Claude Code) | Uso na orquestra                                                                   |
| ----------- | ------------------ | ----------------------- | ---------------------------------------------------------------------------------- |
| **Grande**  | GPT-5.6 **Sol**    | **Fable 5.1**           | maestro; reviewer quando a frente muda DDL, política ou contrato; RGR              |
| **Médio**   | GPT-5.6 **Terra**  | **Opus 5**              | architect-blueprint, guardas de estado, engineer-frontend, reviewer padrão         |
| **Pequeno** | GPT-5.6 **Luna**   | **Sonnet 5**            | transcriber-docs, inspector-tests, engineer-backend em tarefas de contrato fechado |

Identificadores na CLI: Claude aceita os apelidos `fable`, `opus`, `sonnet` em `--model`; Codex
usa o id do modelo em `-m` (confirmar o id exato de Sol/Terra/Luna com `codex --help` ou
`~/.codex/config.toml` antes da primeira ponte; registrar em `waves.md` §Histórico).

Esforço (reasoning/effort): **baixo** para transcrição e testes de contrato fechado; **médio** para
implementação de comandos; **alto** para modelagem, guardas e revisão; **máximo** só no maestro na
fase de planejamento.

## Escolha por tipo de tarefa

| Tipo de tarefa                                                                | Papel Art. 6              | Nível                                                | Esforço | Família                                                                                   |
| ----------------------------------------------------------------------------- | ------------------------- | ---------------------------------------------------- | ------- | ----------------------------------------------------------------------------------------- |
| Decompor a frente, escrever prompts, decidir modelagem em RGR                 | Architect                 | grande                                               | máximo  | a do maestro                                                                              |
| Blueprint, DDL, guardas de transição, contrato de comando                     | Architect                 | médio                                                | alto    | mesma do maestro                                                                          |
| Testes de matriz de transição, política, RLS, prazos, SSE                     | Inspector                 | pequeno (médio para matrizes grandes)                | médio   | mesma do maestro                                                                          |
| Comando de backend com contrato e testes já escritos                          | Engineer                  | pequeno                                              | médio   | mesma do maestro                                                                          |
| Regeneração de blueprints/contratos e refatorações amplas guiadas por scripts | Engineer                  | pequeno                                              | baixo   | mesma do maestro (Codex tende a render melhor em execução de scripts e refatoração ampla) |
| Fichas de tela, contratos de payload, i18n, glossários                        | Owner delegado / Engineer | pequeno                                              | baixo   | mesma do maestro (Claude tende a render melhor em coerência com o corpus e documentação)  |
| Frontend Angular 22 sobre `@detran/ui` e STYNX                                | Engineer                  | médio                                                | médio   | mesma do maestro                                                                          |
| Revisão de prompts e de entregas                                              | Auditor (soft gate)       | médio; grande se a frente muda DDL/política/contrato | alto    | **outra** família                                                                         |
| Auditoria pós-merge (`audit observe`)                                         | Auditor                   | rotina DEVAI                                         | —       | —                                                                                         |

## Desempate (Art. 23, em nomes)

1. Mesma pergunta ao modelo da **outra família, mesmo nível** (Sol ↔ Fable, Terra ↔ Opus, Luna ↔ Sonnet).
2. Se persistir: **nível acima da mesma família** do maestro.
3. Se persistir: **nível acima da outra família**.
4. Humano (Owner ou Architect), registrado como `escalated`.

## Orçamento de referência (calibrar em `budget.json`)

| Item                                                | Ordem de grandeza por ocorrência                                                         |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| planejamento do maestro (leitura + plano + prompts) | 150–300 k tokens de entrada, 30–60 k de saída                                            |
| tarefa de worker pequeno (Sonnet)                   | 30–80 k únicos; **120–200 k brutos** com releituras em cache (R-0006: 124–195 k)         |
| tarefa de worker médio (Opus)                       | 80–200 k únicos; **160–360 k brutos** (R-0006: 160–363 k, 44–110 chamadas de ferramenta) |
| chamada do reviewer                                 | 20–60 k                                                                                  |
| checkpoint (gates, sem LLM)                         | 0                                                                                        |

Regra prática por janela de 5 h de uma família: **um** planejamento de maestro ou **seis a oito**
tarefas de worker pequeno com suas revisões. Contabilize em `budget.json` os tokens **únicos** (convenção
de R-0003/R-0006: ≈ ¼ dos brutos do subagente) e registre os brutos na nota da entrada. Duas frentes simultâneas só se forem de famílias
diferentes.
