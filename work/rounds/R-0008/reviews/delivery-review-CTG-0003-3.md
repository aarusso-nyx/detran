# Prompt do reviewer — modo `delivery-review` (`prompt-review` | `delivery-review`)

> Você é o **reviewer** da orquestra `teat-backend` (rodada `R-0008`), modelo da família
> **oposta** à do maestro. Você não escreve código nem prompts: você julga. Papel constitucional:
> Auditor (soft gate, Constituição DEVAI Art. 18). Trabalhe somente em leitura na worktree
> `/Volumes/Thiamat II/stech/detran-worktrees/teat-backend`. Responda **apenas** com o JSON do §Saída, sem prosa antes ou depois.

## Contexto mínimo (leia nesta ordem)

1. `docs/meta/agents/orchestra/README.md` §4 (correção formal) e §5 (parcimônia)
2. `docs/meta/agents/README.md` §Regras comuns
3. `docs/framework/arch/teat-build-pack.md` — apenas a seção do WP `WP-T2` e o "mapa entregável → definições"
4. `work/rounds/R-0008/plan.md`
5. Modo `prompt-review`: todos os arquivos em `work/rounds/R-0008/prompts/`.
   Modo `delivery-review`: `work/rounds/R-0008/reports/*.md`, o diff anexado abaixo e os
   arquivos por ele tocados.

## Rubrica (cada item é verificável; cite arquivo e linha)

| #   | Item                                                                                                                       | Aplica a |
| --- | -------------------------------------------------------------------------------------------------------------------------- | -------- |
| 1   | Papel constitucional declarado e compatível com o que a tarefa toca (Art. 6, 10)                                           | ambos    |
| 2   | Leitura obrigatória fechada e suficiente: o worker consegue executar sem procurar nada fora da lista                       | prompt   |
| 3   | Fronteira de escrita disjunta entre tarefas simultâneas; `target_modules` corretos; nada de `git` para workers             | prompt   |
| 4   | Critérios de aceitação são comandos existentes (`package.json`) ou arquivos verificáveis, com resultado esperado explícito | ambos    |
| 5   | Nenhum valor inventado: prazos, papéis, estados, erros, rótulos vêm de documento canônico ou viram `source_pending`/`OD-*` | ambos    |
| 6   | Tríade respeitada (Architect → Inspector → Engineer) e testes escritos antes da implementação                              | ambos    |
| 7   | Gates não enfraquecidos (nenhum teste relaxado, nenhum `skip`, nenhum arquivo gerado editado à mão)                        | delivery |
| 8   | Vocabulário canônico (tokens de estado, timer, papel, erro) e i18n só na camada de rótulo                                  | ambos    |
| 9   | Fronteira nacional: nada fala com SENATRAN fora de `packages/senatran-adapter` (ADR-0003)                                  | delivery |
| 10  | ADR e OD citados onde a decisão foi tomada; decisões do steering §H respeitadas, não reabertas                             | ambos    |
| 11  | Entrega completa em relação ao critério: nada "deixado para depois" sem registro em §Fora de escopo                        | delivery |
| 12  | Parcimônia: o prompt não manda ler o repositório inteiro; esforço e modelo condizem com `model-ladder.md`                  | prompt   |
| 13  | Matrizes de autorização testam grants positivos e negativas exaustivas para papéis canônicos omitidos; nada por analogia   | ambos    |

## Veredito

- **PASS**: nenhum achado de severidade `high`; achados `low` viram notas.
- **REVIEW**: pelo menos um achado `high` corrigível pelo maestro ou pelo worker sem mudar o plano.
- **FAIL**: o plano ou a entrega contradiz uma definição canônica, uma decisão do Owner, uma ADR ou
  a Constituição; ou a fronteira de escrita foi violada.

Ciclos: o **primeiro** ciclo de cada item é **exaustivo** — liste todos os achados de uma vez. Nos ciclos
seguintes do mesmo item, avalie **somente** as correções dos achados anteriores; um achado novo sobre
texto que não mudou só é admitido se for `FAIL` por definição (contradição canônica, decisão do Owner,
ADR, Constituição ou fronteira de escrita) e deve dizer explicitamente por que não foi levantado antes
(ajuste R-0006).

## Saída (JSON, e nada mais)

```json
{
  "mode": "delivery-review",
  "round": "R-0008",
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [
    {
      "severity": "high | low",
      "item": 4,
      "file": "work/rounds/R-0008/prompts/TASK-0002.md",
      "line": 31,
      "claim": "critério cita `pnpm --filter @detran/rait-web test`, pacote inexistente",
      "fix": "usar `pnpm --filter @detran/ui test` até o app existir"
    }
  ],
  "notes": ["observações não bloqueantes"]
}
```

## Material anexado pelo maestro

## Nota do maestro — delivery-review CTG-0003, ciclo 3 (restrito ao achado único do ciclo 2)

Veredito anterior: `REVIEW` (`reviews/delivery-review-CTG-0003-2.json`): faltava o resultado dos gates completos sobre o candidato pós-iteração 3. Os gates foram executados pelo maestro sobre esse candidato (nenhuma alteração de código depois): `pnpm check` exit 0 e `pnpm backend:test:ci` exit 0, com os totais registrados em `reports/TASK-0007.md` §"Gates finais sobre o candidato pós-iteração 3" (anexo). Avalie **somente** esse registro.

## Anexo — `reports/TASK-0007.md`

```markdown
Papel: Engineer (Art. 6)
Tarefa: TASK-0007 (iteração 1)
Arquivos criados/alterados: ops/evidence/src/handwritten/* (runtime, manifest, events, bodycam-projection, local-evidence-storage, 10 comandos, service, provider, evidence-access.controller; evidence-custody.controller reescrito; service/provider antigos removidos); ops/snapshots/src/handwritten/* (runtime, external-query command/provider, events; frozen-snapshot.controller reescrito); inf/normative/src/handwritten/* (runtime, manifest, package-signer, events, 5 comandos, 2 queries, service, provider) + normative-commands.controller/lifecycle reescritos; ops/core/src/storage.ts; policy.ts (§7); app teat-evidence/teat-snapshots providers + app.module; package.json (inf-normative integration); blueprints (bloco module) + gerados.
Comandos executados e saída resumida: ops-evidence unit 36/36, integration 5/5; ops-snapshots unit 7/7, integration 2/2; inf-normative unit 17/17, integration 3/3; inf-ait integration 24/24; app e2e 72/72; app integration 11/11; shared 164/165 (contradição WP-T0 × CTG-0003 §7); backend:test:integration/e2e verdes; typecheck ok; blueprints/contracts/decorators(858)/boundary/format/parameter-catalogue ok.
Critérios de aceitação: todos PASS exceto shared test (1 caso WP-T0 contraditório) e backend:test:unit (pelo mesmo elo).
Fora do escopo / deixado: zod não introduzido (sem link); snapshots sem dependência real do adapter (tipagem estrutural); versões dos blueprints mantidas; projeção de bodycam só nas leituras manuscritas; EVIDENCE_TYPE_NOT_IN_CATALOG desligado (OD-T31); quarantined/archived/superseded sem comando (OD-T30).
OD tocadas ou propostas: OD-T51…OD-T59 (ver contrato CTG-0003 §13 — decisões do maestro).
Bloqueios: shared test (OD-T51); `git status` executado uma vez (leitura); outro processo rodou blueprints:generate na mesma worktree concorrentemente (árvore convergiu).
Tokens do subagente: 89.973 reportados (3 chamadas registradas; 69 min) — contagem do harness aparentemente parcial.

## Iteração 2

OD-T52 (guarda sempre), OD-T53 (regex 64 hex), eventos zod nos três pacotes (vocabulários movidos a evidence-runtime.ts para quebrar ciclo ESM). unit 36/7/17; integration 5/2/3; inf-ait 24; app e2e 73/73; shared 165/165; decorators 858; blueprints/contracts/format ok. Tokens: 682.265 brutos (148 chamadas, 20 min) no agente aninhado.

## Gates finais (maestro, após iteração 2)

`pnpm check` → exit 0; `pnpm backend:test:ci` → exit 0 (shared 165/165; ops-evidence 36/5; ops-snapshots 7/2; inf-normative 17/3; inf-ait 24; app e2e 73/73). Delivery-review CTG-0003 ciclo 1: REVIEW (4 achados → adenda §14; iteração 3 do Inspector e do Engineer).

## Iteração 3

§14.1 DTO completo em `complete-upload` (+ `entity_*` em `metadata_json` da intenção); §14.2 ETag/304 em `content`; §14.3 `resolveAgency` (corpo → perfil do principal → catálogo → 422). unit 41/10/21; integration 5/2/3; inf-ait 24; app e2e 74/74; shared 165. Tokens: 750.103 brutos (93 chamadas, 18 min).

## Gates finais sobre o candidato pós-iteração 3 (maestro, 2026-09-16)

- `source work/rounds/R-0008/env-detran-r8.sh && pnpm check` → **exit 0** (format, orchestra-bridge, kb 521/446, publish-check, blueprints:check, contracts:check, parameters 17, parameter-catalogue 87/18, typecheck de todos os pacotes, ui test/build, decorators 858, rls-ddl, role-catalog, lifecycle-vocabulary, senatran boundary/contracts, pec parity/superset).
- `source … && pnpm backend:test:ci` → **exit 0**: 49 execuções de vitest, 1231 testes passados, 0 falhas (shared 165; ops-evidence 41 unit / 5 integration; ops-snapshots 10 / 2; inf-normative 21 / 3; ops-offline-sync 27 / 44; ops-field 19 / 13; inf-ait 310 unit / 24 integration / 1 e2e; app e2e 74).
- Log: `gates-ctg3b.log` do maestro (após as iterações 3 do Inspector e do Engineer; nenhuma alteração de código depois dele).
```
