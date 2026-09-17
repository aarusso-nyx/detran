Papel: Architect (transcrição)
Tarefa: TASK-0006 (iteração 3 — correção dos 3 defeitos do TASK-0007)
Arquivos criados/alterados: `apps/portal/web/src/app/i18n/portal.pt-BR.json` (3 mudanças, conforme instruído)
Comandos executados e saída resumida:
- `node -e "JSON.parse(...)"` → JSON válido
- `node_modules/.bin/prettier --check apps/portal/web/src/app/i18n/portal.pt-BR.json` → `All matched files use Prettier code style!`
- `npx vitest run --config vitest.config.ts` (suíte completa, em `apps/portal/web`) → `Test Files 17 passed (17)`, `Tests 472 passed (472)`
- `node tools/parameters/verify.mjs --check-generated --check-usage` → `OK (87 entries, 18 flags, 14 i18n namespaces, 0 errors)`

Critérios de aceitação:
- `pnpm --filter @detran/portal-web test` → 0 failed, 472 esperados: PASS (472 passed, 0 failed)
- `pnpm verify:parameter-catalogue` OK: PASS
- `pnpm format:check` OK (arquivo tocado): PASS

Correções aplicadas (defeitos #1–#3 de `reports/TASK-0007.md` §Defeitos encontrados):
1. Acrescentada `"portal.legal.consequencias_desistencia.v1.source": "UC-PORTAL-006 passo 2; RN-RAIT-123"` — [UC-PORTAL-006] é a fonte do texto; a RN aplicável é [RN-RAIT-123] (desistência por escrito até o julgamento), citada nas "Regras aplicáveis" do próprio UC.
2. Acrescentada `"portal.legal.consequencias_indicacao.v1.source": "UC-PORTAL-004; RN-PORTAL-104"`, conforme citação explícita do coordenador.
3. Corrigida a grafia `portal.requests.nextAction.INELIGIVEL` → `portal.requests.nextAction.INELEGIVEL` (token canônico confirmado em `request.transitions.ts` linhas 21/56/72 e [WF-PORTAL-001] §Estados; chave irmã `portal.situation.request.INELEGIVEL` já estava correta). Correção pontual de grafia introduzida nesta própria rodada — não uma renomeação de chave estabelecida.

Fora do escopo / deixado: nenhum arquivo além de `portal.pt-BR.json` foi tocado; nenhuma outra chave alterada.
OD tocadas ou propostas: nenhuma (conforme recomendação do próprio Inspector — correção direta, não OD).
Bloqueios: nenhum
