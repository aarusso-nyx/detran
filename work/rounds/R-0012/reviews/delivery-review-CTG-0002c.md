# Prompt do reviewer — modo `delivery-review` (`prompt-review` | `delivery-review`)

> Você é o **reviewer** da orquestra `rait-web` (rodada `R-0012`), modelo da família
> **oposta** à do maestro. Você não escreve código nem prompts: você julga. Papel constitucional:
> Auditor (soft gate, Constituição DEVAI Art. 18). Trabalhe somente em leitura na worktree
> `/Volumes/Thiamat II/stech/detran-worktrees/rait-web`. Responda **apenas** com o JSON do §Saída, sem prosa antes ou depois.

## Contexto mínimo (leia nesta ordem)

1. `docs/meta/agents/orchestra/README.md` §4 (correção formal) e §5 (parcimônia)
2. `docs/meta/agents/README.md` §Regras comuns
3. `docs/framework/arch/rait-build-pack.md` — apenas a seção do WP `WP-E` e o "mapa entregável → definições"
4. `work/rounds/R-0012/plan.md`
5. Modo `prompt-review`: todos os arquivos em `work/rounds/R-0012/prompts/`.
   Modo `delivery-review`: `work/rounds/R-0012/reports/*.md`, o diff anexado abaixo e os
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
  "round": "R-0012",
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [
    {
      "severity": "high | low",
      "item": 4,
      "file": "work/rounds/R-0012/prompts/TASK-0002.md",
      "line": 31,
      "claim": "critério cita `pnpm --filter @detran/rait-web test`, pacote inexistente",
      "fix": "usar `pnpm --filter @detran/ui test` até o app existir"
    }
  ],
  "notes": ["observações não bloqueantes"]
}
```

## Material anexado pelo maestro

**Primeiro ciclo — exaustivo. Grupo acoplado CTG-0002c (WP-E: 16 formulários, gates e regras ESLint
locais).** Tríade: Architect TASK-0010 (`contracts/CTG-0002c.md`, 100 critérios `C-2C`, mapa comando
M8 → chave de política, 152 chaves `rait.forms.*`, seletores AST das duas regras; + o consolidado
`docs/framework/arch/rait-web-forms.md`) → Architect (transcrição) TASK-0017 (as 152 chaves no
catálogo do app; A12) → Inspector TASK-0011 (`gates.fixture.ts` + 19 specs de `forms/` + 2 de
`lint/`; matriz 25 gates × 13 papéis = 325 `it`) → Engineer TASK-0012 (**verde na primeira
iteração**: `form-gate.ts` + 16 `<nome>.schema.ts` zod com `<NOME>_GATE` e cabeçalho-tabela,
`eslint/local-rules.{js,d.ts}` com `rait/no-client-deadline-math` e `rait/no-static-token-i18n-key`,
ligação em `eslint.config.js`). Relatórios: `work/rounds/R-0012/reports/TASK-00{10,11,12,17}.md`.

Gates rodados pelo maestro sobre a árvore final: `pnpm --filter @detran/rait-web typecheck|lint|test|build`
→ verdes (Test Files 154 passed | 1 skipped; **Tests 4434 passed | 139 todo (4573)**; build sem
warnings; lint com as duas regras ligadas no app inteiro); `pnpm verify:parameter-catalogue` → OK
(90 entries, 57 i18n namespaces); `pnpm format:check` → OK; `pnpm check` → EXIT 0 (Engineer).

Leia na worktree (não anexado inline): `apps/rait/web/src/app/forms/**` (17 arquivos de produção +
19 specs), `apps/rait/web/src/app/lint/*.spec.ts`, `apps/rait/web/eslint/local-rules.js` e
`local-rules.d.ts`, `apps/rait/web/src/testing/gates.fixture.ts`,
`work/rounds/R-0012/contracts/CTG-0002c.md` §2–§9, `docs/framework/arch/rait-web-forms.md`.
Pontos a julgar: rubrica 5 (nada inventado — campos, códigos de erro e papéis vêm da §9 da spec, do
catálogo §3 e de `RAIT_COMMAND_RULES`; textos (P) sob OD-R12-028; duas interpretações registradas no
relatório de TASK-0012), 7 (nenhum spec editado pelo Engineer; `todo` só os 139 herdados com OD;
regras sem `fix`), 8 (A1: nenhum literal de namespace de token — inclusive nos cabeçalhos dos
schemas), 11 (fronteira §1 do contrato: ligação schema → página e DTO de comando ficam para R-0007
CTG-0004), 13 (matriz 25 × 13 com positivos e negativos, `roles` conferidos contra `policy.ts`).

`git status --short` (sem `work/`):

```text
 M apps/rait/web/eslint.config.js
 M apps/rait/web/src/app/i18n/rait.pt-BR.json
?? apps/rait/web/eslint/
?? apps/rait/web/src/app/forms/
?? apps/rait/web/src/app/lint/
?? apps/rait/web/src/testing/gates.fixture.ts
?? docs/framework/arch/rait-web-forms.md
```

Diff dos arquivos rastreados alterados (`eslint.config.js`, catálogo i18n):

````diff
diff --git a/apps/rait/web/eslint.config.js b/apps/rait/web/eslint.config.js
index 21925b9c..d50200ab 100644
--- a/apps/rait/web/eslint.config.js
+++ b/apps/rait/web/eslint.config.js
@@ -1,9 +1,13 @@
-// Lint do app (R-0014 M5; R-0012 M1/M12 — regras locais `rait/*` entram no CTG-0002c): flat config com angular-eslint (ts + template recommended),
-// typescript-eslint recommended e eslint-config-prettier. Padrão que os demais apps copiam.
+// Lint do app (R-0014 M5; R-0012 M1/M12): flat config com angular-eslint (ts + template recommended),
+// typescript-eslint recommended e eslint-config-prettier, mais as regras locais do plugin `rait`
+// (`eslint/local-rules.js`, contrato CTG-0002c §6.3): `rait/no-client-deadline-math` em
+// `src/**/*.ts` exceto `src/testing/**` (o relógio fixo dos stubs) e `rait/no-static-token-i18n-key`
+// em todo `src/**/*.ts` (o verificador de parâmetros varre `src/**`). Padrão que os demais apps copiam.
 import angular from 'angular-eslint';
 import prettier from 'eslint-config-prettier';
 import { defineConfig } from 'eslint/config';
 import tseslint from 'typescript-eslint';
+import raitRules from './eslint/local-rules.js';

 export default defineConfig(
   { ignores: ['dist/**', '.angular/**'] },
@@ -37,6 +41,17 @@ export default defineConfig(
       ],
     },
   },
+  {
+    files: ['src/**/*.ts'],
+    ignores: ['src/testing/**'],
+    plugins: { rait: raitRules },
+    rules: { 'rait/no-client-deadline-math': 'error' },
+  },
+  {
+    files: ['src/**/*.ts'],
+    plugins: { rait: raitRules },
+    rules: { 'rait/no-static-token-i18n-key': 'error' },
+  },
   {
     files: ['**/*.spec.ts'],
     rules: { '@typescript-eslint/no-explicit-any': 'off' },
diff --git a/apps/rait/web/src/app/i18n/rait.pt-BR.json b/apps/rait/web/src/app/i18n/rait.pt-BR.json
index cddbcb63..de4b6218 100644
--- a/apps/rait/web/src/app/i18n/rait.pt-BR.json
+++ b/apps/rait/web/src/app/i18n/rait.pt-BR.json
@@ -305,6 +305,158 @@
   "rait.errors.vote_member_impeded": "Voto de membro impedido/ausente.",
   "rait.errors.withdrawal_after_decision": "Desistência após decisão/proclamação.",
   "rait.errors.withdrawal_legitimacy": "Signatário do termo não é parte legítima nem procurador válido.",
+  "rait.forms.ato-suspensao.caseIds": "Casos alcançados",
+  "rait.forms.ato-suspensao.endsOn": "Fim da suspensão",
+  "rait.forms.ato-suspensao.evidenceDocumentId": "Prova de força maior",
+  "rait.forms.ato-suspensao.legalBasis": "Base legal",
+  "rait.forms.ato-suspensao.reason": "Fundamento de força maior",
+  "rait.forms.ato-suspensao.startsOn": "Início da suspensão",
+  "rait.forms.ato-suspensao.timerCodes": "Prazos suspensos",
+  "rait.forms.ato-suspensao.timerCodes.legal": "Prazos de decadência e prescrição não podem ser suspensos.",
+  "rait.forms.common.ait_single": "Informe um único número de AIT por requerimento.",
+  "rait.forms.common.date_future": "A data não pode ser posterior a hoje.",
+  "rait.forms.common.date_past": "A data não pode ser anterior a hoje.",
+  "rait.forms.common.document_invalid": "CPF ou CNPJ inválido.",
+  "rait.forms.common.enum_invalid": "Escolha uma das opções disponíveis.",
+  "rait.forms.common.file_type": "Tipo de arquivo não aceito (PDF, JPEG ou PNG).",
+  "rait.forms.common.format_invalid": "Formato inválido.",
+  "rait.forms.common.invalid": "Valor inválido.",
+  "rait.forms.common.period_invalid": "A data final não pode ser anterior à inicial.",
+  "rait.forms.common.plate_invalid": "Placa inválida (use o padrão AAA0A00 ou AAA0000).",
+  "rait.forms.common.required": "Campo obrigatório.",
+  "rait.forms.common.state_invalid": "O estado atual não admite esta ação.",
+  "rait.forms.common.too_long": "Valor acima do tamanho permitido.",
+  "rait.forms.common.unknown_field": "Campo não reconhecido.",
+  "rait.forms.decisao-autoridade.context.draft_author": "Quem redigiu a minuta não pode assinar a decisão.",
+  "rait.forms.decisao-autoridade.context.instance": "Acolher ou indeferir só se aplica à defesa prévia.",
+  "rait.forms.decisao-autoridade.context.jurisdiction": "O AIT pertence a outra circunscrição.",
+  "rait.forms.decisao-autoridade.context.not_on_duty": "Você não está na escala de assinatura de hoje.",
+  "rait.forms.decisao-autoridade.grounds": "Fundamentação",
+  "rait.forms.decisao-autoridade.kind": "Decisão",
+  "rait.forms.decisao-autoridade.returnGuidance": "Orientação ao revisor",
+  "rait.forms.decisao-autoridade.returnGuidance.limit": "A minuta já foi devolvida uma vez; nova devolução exige ato motivado do coordenador.",
+  "rait.forms.decisao-autoridade.signature": "Assinatura digital",
+  "rait.forms.decisao-autoridade.signature.required": "Assine digitalmente para concluir a decisão.",
+  "rait.forms.desistencia.caseId": "Caso",
+  "rait.forms.desistencia.caseId.after_decision": "O caso já foi decidido; a desistência não é mais admissível.",
+  "rait.forms.desistencia.legitimacyConfirmed": "Confirmo a legitimidade do signatário",
+  "rait.forms.desistencia.protocolNumber": "Protocolo do caso",
+  "rait.forms.desistencia.signerPartyId": "Signatário do termo",
+  "rait.forms.desistencia.signerPartyId.illegitimate": "O signatário não é parte legítima nem procurador válido.",
+  "rait.forms.desistencia.termDocumentId": "Termo de desistência",
+  "rait.forms.diligencia.addressee": "Destinatário",
+  "rait.forms.diligencia.addressee.official_document": "Documento do próprio órgão não pode ser exigido do requerente; anexe de ofício.",
+  "rait.forms.diligencia.dueOn": "Prazo (em branco: padrão do sistema)",
+  "rait.forms.diligencia.extension.closed": "A diligência já foi respondida ou expirou.",
+  "rait.forms.diligencia.extension.limit": "A diligência já foi prorrogada uma vez; nova prorrogação exige ato motivado.",
+  "rait.forms.diligencia.extension.reason": "Motivo da prorrogação",
+  "rait.forms.diligencia.officialDocument": "Pede documento emitido pelo próprio órgão",
+  "rait.forms.diligencia.subject": "Assunto",
+  "rait.forms.escala.entries": "Membros escalados",
+  "rait.forms.escala.entries.duplicate": "Membro repetido na escala.",
+  "rait.forms.escala.entries.duty_missing": "Sem plantonista em {date}.",
+  "rait.forms.escala.entries.memberId": "Membro",
+  "rait.forms.escala.entries.wipLimit": "Limite de casos simultâneos (em branco: padrão)",
+  "rait.forms.escala.kind": "Tipo de escala",
+  "rait.forms.escala.periodEnd": "Fim do período",
+  "rait.forms.escala.periodStart": "Início do período",
+  "rait.forms.escala.periodStart.locked": "O período já iniciou e não pode ser alterado.",
+  "rait.forms.escala.poolId": "Pool",
+  "rait.forms.escala.slots.absenceReason": "Motivo da ausência",
+  "rait.forms.escala.slots.absenceReason.required": "Informe o motivo da ausência programada.",
+  "rait.forms.escala.slots.availability": "Disponibilidade",
+  "rait.forms.escala.slots.slotOn": "Dia",
+  "rait.forms.escala.slots.slotOn.outside_period": "Dia fora do período da escala.",
+  "rait.forms.exportacao.dpoApprovalRequested": "Solicitar aprovação do DPO",
+  "rait.forms.exportacao.dpoApprovalRequested.required": "Exportação nominal em massa exige aprovação do DPO.",
+  "rait.forms.exportacao.purpose": "Finalidade da exportação",
+  "rait.forms.exportacao.scope.nominal": "Incluir dados nominais",
+  "rait.forms.exportacao.scope.periodEnd": "Período: fim",
+  "rait.forms.exportacao.scope.periodStart": "Período: início",
+  "rait.forms.intake-fisico.aitNumber": "Número do AIT",
+  "rait.forms.intake-fisico.applicant.address": "Endereço do requerente",
+  "rait.forms.intake-fisico.applicant.document": "CPF ou CNPJ do requerente",
+  "rait.forms.intake-fisico.applicant.legitimacyBasis": "Base de legitimidade",
+  "rait.forms.intake-fisico.applicant.name": "Nome do requerente",
+  "rait.forms.intake-fisico.channel": "Canal de entrada",
+  "rait.forms.intake-fisico.documents": "Documentos digitalizados",
+  "rait.forms.intake-fisico.documents.file": "Arquivo",
+  "rait.forms.intake-fisico.documents.kind": "Tipo da peça",
+  "rait.forms.intake-fisico.markOn": "Data do marco de tempestividade",
+  "rait.forms.intake-fisico.plate": "Placa",
+  "rait.forms.intake-fisico.signaturePresent": "Peça assinada",
+  "rait.forms.lote-sorteio.kind": "Tipo de lote",
+  "rait.forms.lote-sorteio.manualExclusions": "Exclusões manuais motivadas",
+  "rait.forms.lote-sorteio.manualExclusions.duplicate": "Membro já excluído neste lote.",
+  "rait.forms.lote-sorteio.manualExclusions.memberId": "Membro excluído",
+  "rait.forms.lote-sorteio.manualExclusions.reason": "Motivo da exclusão",
+  "rait.forms.lote-sorteio.poolId": "Pool",
+  "rait.forms.lote-sorteio.weekStart": "Semana de referência",
+  "rait.forms.mandato.appointmentActRef": "Ato de nomeação ou posse",
+  "rait.forms.mandato.isSubstitute": "Suplente",
+  "rait.forms.mandato.mandateEndsOn": "Fim do mandato",
+  "rait.forms.mandato.mandateStartsOn": "Início do mandato",
+  "rait.forms.mandato.mandateStartsOn.overlap": "Mandato sobreposto a outro no mesmo órgão.",
+  "rait.forms.mandato.memberRole": "Função",
+  "rait.forms.mandato.personId": "Pessoa",
+  "rait.forms.mandato.personId.dual_body": "A pessoa já é titular no outro colegiado (JARI × CETRAN).",
+  "rait.forms.mandato.poolId": "Órgão / pool",
+  "rait.forms.mandato.representationBlock": "Bloco de representação",
+  "rait.forms.mandato.representationBlock.required": "No CETRAN o bloco de representação é obrigatório.",
+  "rait.forms.minuta.facts": "Fatos",
+  "rait.forms.minuta.grounds": "Fundamentos",
+  "rait.forms.minuta.ruling": "Dispositivo",
+  "rait.forms.minuta.ruling.acolher": "Acolher a defesa",
+  "rait.forms.minuta.ruling.indeferir": "Indeferir a defesa",
+  "rait.forms.parametro.effectiveFrom": "Vigência a partir de",
+  "rait.forms.parametro.key": "Parâmetro",
+  "rait.forms.parametro.key.legal_readonly": "Parâmetro de origem legal: somente leitura.",
+  "rait.forms.parametro.reason": "Motivo",
+  "rait.forms.parametro.value": "Novo valor",
+  "rait.forms.parametro.value.json_invalid": "JSON inválido.",
+  "rait.forms.parametro.value.required": "Informe o novo valor.",
+  "rait.forms.parametro.value.type_invalid": "Valor incompatível com o tipo do parâmetro.",
+  "rait.forms.parecer-voto.analysis": "Análise fundamentada",
+  "rait.forms.parecer-voto.summary": "Resumo descritivo",
+  "rait.forms.parecer-voto.vote": "Voto conclusivo",
+  "rait.forms.parecer-voto.vote.impeded": "Você está impedido neste caso e não pode relatar.",
+  "rait.forms.pauta.items": "Casos na pauta",
+  "rait.forms.pauta.items.critical_missing": "Há casos em risco crítico fora da pauta; inclua-os antes de fechar.",
+  "rait.forms.pauta.items.duplicate": "Caso repetido na pauta.",
+  "rait.forms.pauta.items.without_opinion": "Caso sem parecer registrado não pode entrar na pauta.",
+  "rait.forms.pauta.sessionId": "Sessão",
+  "rait.forms.pauta.shortNoticeAck": "Confirmo a convocação com antecedência inferior à mínima",
+  "rait.forms.pauta.shortNoticeAck.required": "A sessão está a menos dias úteis do que a antecedência mínima; confirme a convocação.",
+  "rait.forms.reatribuicao.memberId": "Novo responsável",
+  "rait.forms.reatribuicao.memberId.impeded": "Membro impedido neste caso não pode recebê-lo.",
+  "rait.forms.reatribuicao.memberId.same": "O novo responsável é o mesmo que o atual.",
+  "rait.forms.reatribuicao.memberId.unavailable": "Membro fora da escala neste período.",
+  "rait.forms.reatribuicao.releaseReason": "Motivo da reatribuição",
+  "rait.forms.sessao-ao-vivo.abertura.chair": "A sessão exige o presidente ou seu suplente.",
+  "rait.forms.sessao-ao-vivo.abertura.parity": "Paridade de representação não observada.",
+  "rait.forms.sessao-ao-vivo.abertura.quorum": "Sem quorum: presenças confirmadas abaixo da maioria simples.",
+  "rait.forms.sessao-ao-vivo.castingVote": "Voto de qualidade",
+  "rait.forms.sessao-ao-vivo.castingVote.not_chair": "Só quem preside a sessão dá o voto de qualidade.",
+  "rait.forms.sessao-ao-vi```

````
