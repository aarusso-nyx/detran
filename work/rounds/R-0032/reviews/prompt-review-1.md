# Prompt-review R-0032 — O1–O2

Responda com **um único objeto JSON válido**, iniciado por `{` e terminado por `}`. Sem cerca Markdown, prefácio ou texto depois. Papel constitucional: **Auditor**; somente leitura. Você é o reviewer Claude Code Opus 5.5 da orquestra `portal-pec`, cuja família de maestro e workers é Codex. Examine o plano e os 14 prompts nesta worktree.

## Contexto e fontes

Leia, nesta ordem:

1. `docs/meta/agents/orchestra/README.md` §4–5 e `docs/meta/agents/README.md` §Regras comuns.
2. `work/rounds/R-0032/AUTHORIZATION.md`: o Owner autorizou somente O1–O2 em 2026-09-30, trocou a família, exigiu um prompt-review no bootstrap e vedou PR e delivery-review nesta sessão.
3. `docs/meta/adr/ADR-0034-pec-web-frontend.md` §Decisão 2–6, `work/campaigns/C-0002-consolidacao.md` §12 e `work/rounds/R-0032/plan.md` inteiro.
4. `work/rounds/R-0032/tasks/TASK-0001.json` até `TASK-0014.json`, `compositions.json`, e `prompts/TASK-0001.md` até `TASK-0014.md`.

Os 14 prompts são preparados agora para um review único. Somente TASK-0001/0002/0003/0008 são despachadas nesta sessão. Julgue suficiência da leitura fechada, papéis, fronteiras, modelos, critérios verificáveis, tríades e coerência com as decisões do Owner. Para TASK-0008, a autorização desta sessão cita specs PEC em `apps/portal/web`, em divergência com a tabela anterior de `plan.md` que cita chaves i18n; registre como achado se a solução do prompt criar uma contradição que exija decisão adicional. Não exija implementação de O3+ agora.

O baseline `pnpm check` falhou somente no sensor `tools/stack/revision.test.mjs:433`, cujo regex `/pec/` casa o caminho desta worktree; a correção pertence à R-0031. Isso não autoriza enfraquecer o teste. Os locks R-0020 e os caminhos `backend/domains/shared/src/policy.ts`, `backend/app/src/portal-delegation.providers.ts`, eventos/outbox `ch` e adaptadores de assinatura `ch` são intocáveis nesta sessão.

## Rubrica

1. Cada papel constitucional corresponde ao tipo de artefato; Architect define, Inspector testa, Engineer implementa.
2. Cada prompt contém lista de leitura fechada e suficiente, fronteira de escrita explícita e entrega verificável.
3. Os `target_modules` de O2 são disjuntos; workers não executam git, não instalam pacotes e não alteram testes de terceiros.
4. Cada `acceptance_commands` usa comando existente ou arquivo verificável, com resultado esperado; testes do Inspector podem ficar vermelhos até a implementação.
5. Nenhum valor normativo é inventado; as OD-R32-002…005 ficam no padrão fail-closed até resposta do Owner.
6. A opção (C) da OD-R32-001, a identidade `portal-delegation` da OD-R27-001 = (a), a junta médica nesta rodada e a ADR-0034 são preservadas.
7. Projeções só de metadados, dossiê do titular sem máscara com auditoria nos dois lados e negativos para terceiro, tenant, nível e `*` estão contratados; nenhuma permissão `CANDIDATO` é dada à sessão.
8. Modelos Codex equivalentes e reviewer Claude Opus 5.5 batem com a autorização.

**Primeiro ciclo exaustivo:** liste todos os achados `high` agora, com arquivo e linha; no ciclo de correção posterior, reavalie somente esses itens. `PASS` se não houver achado high; `REVIEW` para high corrigível sem mudar o plano; `FAIL` para contradição com Constituição, ADR ou decisão do Owner.

## Saída

```json
{
  "mode": "prompt-review",
  "round": "R-0032",
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [
    {
      "severity": "high | low",
      "item": 1,
      "file": "work/rounds/R-0032/prompts/TASK-0001.md",
      "line": 1,
      "claim": "descrição objetiva",
      "fix": "correção objetiva"
    }
  ],
  "notes": []
}
```

Leia os arquivos efetivos no checkout. Retorne somente o JSON.
