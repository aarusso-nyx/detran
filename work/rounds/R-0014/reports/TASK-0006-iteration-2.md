All checks pass. Final report for this restricted iteration:

Papel: Architect (transcrição)
Tarefa: TASK-0006 (iteração 2 — adenda A4)
Arquivos criados/alterados: `apps/portal/web/src/app/i18n/portal.pt-BR.json` (acréscimo de 1 chave: `portal.services.junta_medica`, inserida na posição alfabética do namespace `portal.services`, imediatamente após `portal.services.indicacao_condutor` — única linha alterada)
Comandos executados e saída resumida:
- `node -e "JSON.parse(...)"` → JSON válido
- `node_modules/.bin/prettier --check apps/portal/web/src/app/i18n/portal.pt-BR.json` → `All matched files use Prettier code style!`
- `npx vitest run --config vitest.config.ts src/app/i18n/i18n-keys.spec.ts` (em `apps/portal/web`) → 1 arquivo, 3 testes, todos PASS
- `node tools/parameters/verify.mjs --check-generated --check-usage` → `OK (87 entries, 18 flags, 14 i18n namespaces, 0 errors)`

Critérios de aceitação:
- JSON válido: PASS
- `pnpm --filter @detran/portal-web test -- src/app/i18n/i18n-keys.spec.ts` verde: PASS
- `pnpm verify:parameter-catalogue` OK: PASS
- `pnpm format:check` OK (arquivo tocado): PASS

Contagem por namespace: `portal.services` passou de 14 para 15 chaves (`junta_medica` acrescentada); nenhum outro namespace alterado nesta iteração.

Fora do escopo / deixado:
- Texto transcrito de [WF-PORTAL-001] §Catálogo de serviços, linha "Requerer junta médica/psicológica (discordar do resultado)" — usei "Requerer junta médica ou psicológica" (barra convertida para "ou" e o parêntese descritivo interno omitido), consistente com o estilo cidadão já aplicado às demais 14 chaves de `portal.services` nesta tarefa.
- `acompanhar_manifestacao`: nenhuma chave criada (T-22 perdeu `serviceKey`, conforme A4).
- `cancelamento_sne`: nenhuma chave criada (permanece em aberto por OD-P55).

OD tocadas ou propostas: nenhuma (OD-P55 e OD-P56 já registradas pelo Architect em `plan.md` §Adendas; nenhuma ação adicional necessária nesta iteração).
Bloqueios: nenhum
