# Reviewer R-0015 — delivery-review CTG-0001

Você é `claude opus`, Auditor soft gate de família oposta ao maestro GPT-5.6 Sol. Trabalhe somente
em leitura em `/Volumes/Thiamat II/stech/detran-worktrees/boat-mobile`. Papel: Auditor; não edite.
Responda somente com o JSON base64 do fim.

## Leitura fechada

1. `docs/meta/agents/orchestra/README.md` §4 itens 13–18, §5 e §10;
2. `work/rounds/R-0015/plan.md`, `route-manifest.md`, `contracts/CTG-0001.md` e `CTG-0002.md`;
3. `work/rounds/R-0015/reports/TASK-0001.md`…`TASK-0007.md`;
4. `work/rounds/R-0015/tasks/TASK-0001.json`…`TASK-0007.json`;
5. os arquivos alterados/listados abaixo e `git diff` da worktree;
6. fontes para confronto: `boat-frontends.md`, `boat-error-catalog.md`, matriz mobile,
   `owner-ballots/ballot-03-boat-catalogos.md`, `open-issues.md` DT-047/049 e `IU-BOAT-001`.

## Entrega a julgar

- norma/allowlist e tooling: `docs/framework/arch/parameter-catalogue.md`,
  `tools/parameters/{parser,verify}.mjs`, `tools/parameters/tests/allowlist-boat.test.mjs`, três
  gerados de parâmetros;
- 17 fichas `docs/framework/product/domains/est/boat/screens/IU-BOAT-{S,W}-*.md` e
  `docs/meta/knowledge-base/import-manifest.json`;
- `docs/framework/arch/i18n/boat.pt-BR.json`;
- `apps/boat/mobile/src/lib/navigation/transitions.ts`, `transitions.test.ts` e
  `tsconfig.transitions.json`;
- `package.json`; artefatos de orquestração R-0015.

## Rubrica

1. Fronteiras e papéis: Architect/Inspector/Engineer, somente Inspector alterou testes.
2. Nenhum valor inventado: OD-R15-001…003 continuam propostas/source_pending; não viram screenId,
   papel ou requisito canônico.
3. 17 fichas têm 12 seções, front-matter válido, rotas/slugs/fontes/gates consistentes; KB 773/446.
4. Semente tem exatamente as chaves fechadas pelo contrato, textos com fonte, sem parâmetro
   disfarçado; `boat.*` é só i18n e parâmetros BOAT continuam `est.*`.
5. Parser e verifier são fail-closed; spec 8/8 e suíte 51/51; gerados determinísticos.
6. Transições: exatamente 149 em ordem, seis campos preservados, 94/78/23, duas S-12 separadas;
   teste não deriva o esperado da produção e não usa conjunto de status/escape/skip.
7. `test:boat-transitions` inclui typecheck e está em `pnpm check` uma vez.
8. Nenhum teste/gate enfraquecido; comandos/resultados dos relatórios são coerentes.
9. Nenhum sibling/SENATRAN direto; CTG-0002 segue bloqueado e sem implementação especulativa.
10. Completude do CTG-0001 e parcimônia.

O primeiro delivery-review é exaustivo. PASS = nenhum high; REVIEW = high corrigível; FAIL =
contradição canônica/Owner/ADR/Constituição ou fronteira violada.

Contexto operacional: TASK-0003 inicialmente gravou por engano um arquivo untracked idêntico na
raiz. O maestro comparou SHA-256, garantiu a cópia na worktree e removeu somente esse arquivo
untracked; a raiz voltou limpa nos caminhos afetados. Julgue a entrega atual, mas registre qualquer
risco residual. O `pnpm check` completo foi iniciado em background; o maestro anexará o resultado
ao fechamento antes do commit.

## Saída

```json
{
  "mode": "delivery-review",
  "round": "R-0015",
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [
    {
      "severity": "high | low",
      "item": 1,
      "file": "path",
      "line": 1,
      "claim_b64": "YmFzZTY0",
      "fix_b64": "YmFzZTY0"
    }
  ],
  "notes_b64": []
}
```

Todo claim/fix/note deve ser UTF-8 em base64 RFC 4648 nos campos `_b64`. Não emita campos
textuais, cercas Markdown, aspas internas, barras invertidas ou prosa.
