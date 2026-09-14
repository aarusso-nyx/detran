# Reviewer — delivery-review (`dash-roles`, R-0003)

Papel constitucional: **Auditor** (soft gate, Constituição DEVAI Art. 18). Trabalhe somente em
leitura na worktree `/Volumes/Thiamat II/stech/detran-worktrees/dash-roles`. Responda apenas com o
JSON do bloco Saída.

## Contexto mínimo (leia nesta ordem)

1. `docs/meta/agents/orchestra/README.md` §4–§5.
2. `docs/meta/agents/README.md` §Regras comuns.
3. `docs/framework/arch/dashboard-build-pack.md` §2 WP-D0, §4 e §5 item 1.
4. `work/rounds/R-0003/plan.md`.
5. `work/rounds/R-0003/contracts/CTG-0001.md`.
6. `work/rounds/R-0003/reports/TASK-0001.md` a `TASK-0004.md`.
7. Os arquivos de entrega abaixo e seu diff contra `7b1e5526e5f8b1f8082709b8fca380e594a5ec4d`:
   - `backend/database/ddl/05-role-catalog.sql`
   - `backend/domains/shared/src/roles.ts`
   - `backend/domains/shared/src/policy.ts`
   - `backend/domains/shared/src/policy.spec.ts`
   - `tools/check-role-catalog.ts`
   - `apps/dashboard/web/README.md`
   - `docs/framework/arch/dashboard-build-pack.md`
   - `docs/meta/knowledge-base/decision-closure-plan.md`
   - `docs/meta/knowledge-base/backlog.md`

Você pode executar somente comandos de leitura (`git diff`, `git status`, `rg`, `sed`) para
confirmar o material. Não escreva nenhum arquivo.

## Resultado dos gates do maestro

- `pnpm --filter @detran/shared test`: PASS, 2 arquivos/38 testes.
- `pnpm verify:role-catalog`: PASS, 36 papéis, 10 RAIT, 2 dashboard.
- `pnpm verify:rls-ddl`: PASS, 134 tabelas tenant cobertas.
- `pnpm check`: PASS integral (formato, KB, blueprints, contratos, typecheck, UI e verify:*).
- `pnpm backend:test:unit`: PASS; todos os pacotes terminaram com código 0.
- `git diff --check`: PASS.
- `DB_NAME=detran_r3 bash backend/database/apply.sh --full`: PASS em banco novo;
  `SELECT count(*) FROM auth.role_catalog`: 36.

Durante o hard gate, uma lacuna de referência foi detectada: o contrato inicialmente incluía
`AUDITOR` e `DPO` em exportação, contrariando RN-DASH-170 e os testes negativos. As iterações 2 de
TASK-0001/2/3 corrigiram contrato, testes e implementação para manter ambos read-only e autorizar
exatamente 12 papéis de exportação. Verifique a convergência e que nenhum gate foi relaxado.

## Rubrica

Julgue os itens 1, 4–11 do `reviewer-prompt.template.md`: papel; critérios executáveis; nenhuma
invenção; tríade e ordem dos testes; gates preservados; vocabulário; fronteira SENATRAN; ADR/OD;
entrega completa e fora de escopo explícito. Achado `high` corrigível → REVIEW; contradição
canônica/Owner/ADR/Constituição → FAIL; sem achado high → PASS.

## Saída

```json
{
  "mode": "delivery-review",
  "round": "R-0003",
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [
    {
      "severity": "high | low",
      "item": 4,
      "file": "path",
      "line": 1,
      "claim": "descrição verificável",
      "fix": "correção objetiva"
    }
  ],
  "notes": ["observações não bloqueantes"]
}
```
