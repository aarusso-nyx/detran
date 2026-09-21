# Prompt do reviewer — modo `delivery-review` (`prompt-review` | `delivery-review`)

> Você é o **reviewer** da orquestra `dashboard-console` (rodada `R-0016`), modelo da família
> **oposta** à do maestro. Você não escreve código nem prompts: você julga. Papel constitucional:
> Auditor (soft gate, Constituição DEVAI Art. 18). Trabalhe somente em leitura na worktree
> `/Volumes/Thiamat II/stech/detran/.claude/worktrees/dashboard-console-r0016-f15a49`. Responda **apenas** com o JSON do §Saída, sem prosa antes ou depois.

## Contexto mínimo (leia nesta ordem)

1. `docs/meta/agents/orchestra/README.md` §4 (correção formal) e §5 (parcimônia)
2. `docs/meta/agents/README.md` §Regras comuns
3. `docs/framework/arch/dashboard-build-pack.md` — apenas a seção do WP `WP-D4, WP-D5` e o "mapa entregável → definições"
4. `work/rounds/R-0016/plan.md`
5. Modo `prompt-review`: todos os arquivos em `work/rounds/R-0016/prompts/`.
   Modo `delivery-review`: `work/rounds/R-0016/reports/*.md`, o diff anexado abaixo e os
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
  "round": "R-0016",
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [
    {
      "severity": "high | low",
      "item": 4,
      "file": "work/rounds/R-0016/prompts/TASK-0002.md",
      "line": 31,
      "claim": "critério cita `pnpm --filter @detran/rait-web test`, pacote inexistente",
      "fix": "usar `pnpm --filter @detran/ui test` até o app existir"
    }
  ],
  "notes": ["observações não bloqueantes"]
}
```

## Material anexado pelo maestro

**Primeiro ciclo — exaustivo.** Entrega do **CTG-0001** de R-0016 (`dashboard-console`, WP-D4): 18 fichas
`IU-DASH-D-01`…`IU-DASH-D-18` (TASK-0002, Architect/transcrição, Sonnet), semente i18n
`docs/framework/arch/i18n/dashboard.pt-BR.json` (TASK-0003, Architect/transcrição, Sonnet), sobre o
manifesto `work/rounds/R-0016/route-manifest.md`, os contratos `work/rounds/R-0016/contracts/CTG-0001.md`
e `CTG-0002.md` §Decisões e as 16 linhas da allowlist `dashboard.*` (TASK-0001, Architect, Opus;
`pnpm parameters:generate` pelo maestro — só o SHA do cabeçalho dos gerados muda). Baseline do KB
738 → 756. Relatórios em `work/rounds/R-0016/reports/TASK-000{1,2,3}.md`; plano em
`work/rounds/R-0016/plan.md` (M1…M9, adendas A1–A4, §Bloqueios).

O que **não** é achado (já registrado no plano): (a) o app não existe — o teste tela ↔ ficha ↔
rota ↔ i18n é do Inspector do CTG-0002 (M3); nesta entrega o maestro conferiu mecanicamente que
toda chave `dashboard.screens.*` citada nas fichas existe na semente e que o `title` coincide;
(b) semente com **307** chaves, não 312: as 5 `dashboard.severity.shape.*` ficam ausentes até
OD-D16-009 (adenda A4) — omissão, nunca rótulo inventado; (c) `policy.ts` prevalece sobre
`dashboard-frontends.md` §3 e o contrato de rotas onde divergem (adenda A1; OD-D16-003/004/005),
sem decidir nada; (d) `contracts/CTG-0002.md` contém só §Decisões — o contrato detalhado do app
vem no CTG-0002, empilhado em R-0011; (e) OD-D16-001…010 são propostas (numeradas em
`contracts/CTG-0001.md` §5 e nos relatórios), levadas ao build pack por TASK-0007.

Gates executados pelo maestro sobre a árvore desta entrega: `node tools/docs/kb/check.mjs` →
`OK (756 artifacts, 446 canonical tokens)`; `pnpm docs:kb:publish-check` → OK (201 files);
`pnpm format:check` → OK; `pnpm verify:parameter-catalogue` → `OK (89 entries, 18 flags, 43 i18n
namespaces, 0 errors)`; `node -e` sobre a semente → `307 true 42 18 false false`; `pnpm check` de
linha de base verde em 4cd43fa5 (o CTG só toca `docs/` e os três gerados de parâmetros).

Fontes para conferir valores: `docs/framework/arch/dashboard-frontends.md` §1–§9;
`docs/framework/arch/dashboard-route-contract.md` §2–§5; `docs/framework/arch/dashboard-error-catalog.md`;
`docs/framework/product/transversal/dashboard/APP.md` §Catálogo (42 nomes); `IU-DASH-001.md`;
`WF-DASH-001/002/003` §Estados; `backend/domains/shared/src/policy.ts` (`DASHBOARD_RULES`,
`DASHBOARD_LAYER_BY_ROLE`); `parameter-catalogue.md` §DASHBOARD e §Namespaces i18n;
`docs/meta/knowledge-base/steering.md` §H (38, 54).

### `git diff origin/main --stat -- docs backend`

```text
 backend/app/src/generated/parameter-flags.ts       |   4 +-
 backend/database/seed/05-parameters.sql            |   2 +-
 .../parameter/src/generated/parameter-catalogue.ts |   4 +-
 docs/framework/arch/i18n/dashboard.pt-BR.json      | 309 +++++++++++++++++++++
 docs/framework/arch/parameter-catalogue.md         |  74 +++--
 .../transversal/dashboard/screens/IU-DASH-D-01.md  | 142 ++++++++++
 .../transversal/dashboard/screens/IU-DASH-D-02.md  | 146 ++++++++++
 .../transversal/dashboard/screens/IU-DASH-D-03.md  | 125 +++++++++
 .../transversal/dashboard/screens/IU-DASH-D-04.md  | 108 +++++++
 .../transversal/dashboard/screens/IU-DASH-D-05.md  | 102 +++++++
 .../transversal/dashboard/screens/IU-DASH-D-06.md  |  98 +++++++
 .../transversal/dashboard/screens/IU-DASH-D-07.md  | 100 +++++++
 .../transversal/dashboard/screens/IU-DASH-D-08.md  | 110 ++++++++
 .../transversal/dashboard/screens/IU-DASH-D-09.md  | 108 +++++++
 .../transversal/dashboard/screens/IU-DASH-D-10.md  | 120 ++++++++
 .../transversal/dashboard/screens/IU-DASH-D-11.md  | 112 ++++++++
 .../transversal/dashboard/screens/IU-DASH-D-12.md  | 116 ++++++++
 .../transversal/dashboard/screens/IU-DASH-D-13.md  | 121 ++++++++
 .../transversal/dashboard/screens/IU-DASH-D-14.md  | 109 ++++++++
 .../transversal/dashboard/screens/IU-DASH-D-15.md  |  98 +++++++
 .../transversal/dashboard/screens/IU-DASH-D-16.md  | 110 ++++++++
 .../transversal/dashboard/screens/IU-DASH-D-17.md  | 102 +++++++
 .../transversal/dashboard/screens/IU-DASH-D-18.md  |  94 +++++++
 docs/meta/knowledge-base/import-manifest.json      |   2 +-
 24 files changed, 2381 insertions(+), 35 deletions(-)
```

### Diff completo (`git diff origin/main -- docs backend`; os arquivos de `work/rounds/R-0016/` são lidos na worktree)

```diff
diff --git a/backend/app/src/generated/parameter-flags.ts b/backend/app/src/generated/parameter-flags.ts
index cc87b114..6a9ca5c9 100644
--- a/backend/app/src/generated/parameter-flags.ts
+++ b/backend/app/src/generated/parameter-flags.ts
@@ -1,6 +1,6 @@
-// Generated from parameter-catalogue.md sha256:5ffb3fdcef239e39928146f58f19d3545c7fa5e189ca7b75f227d5ea265031fc
+// Generated from parameter-catalogue.md sha256:0e724dc870b7a41b3b1fcf0d8cd8da457aa7d2fa0f4e0717c733fa0d1224dde2
 export const PARAMETER_FLAGS_SOURCE_SHA256 =
-  '5ffb3fdcef239e39928146f58f19d3545c7fa5e189ca7b75f227d5ea265031fc';
+  '0e724dc870b7a41b3b1fcf0d8cd8da457aa7d2fa0f4e0717c733fa0d1224dde2';
 export const PARAMETER_FLAGS = {
   'rait.warning.same_machine': true,
   'session.oral_argument_enabled': false,
diff --git a/backend/database/seed/05-parameters.sql b/backend/database/seed/05-parameters.sql
index f6627319..399e6168 100644
--- a/backend/database/seed/05-parameters.sql
+++ b/backend/database/seed/05-parameters.sql
@@ -1,4 +1,4 @@
--- Generated from parameter-catalogue.md sha256:5ffb3fdcef239e39928146f58f19d3545c7fa5e189ca7b75f227d5ea265031fc
+-- Generated from parameter-catalogue.md sha256:0e724dc870b7a41b3b1fcf0d8cd8da457aa7d2fa0f4e0717c733fa0d1224dde2
 -- Applied by backend/database/seed.sh after apply.sh: the tenant context below satisfies auth.enforce_tenant_id().
 select set_config('app.role', 'owner', false);
 select set_config('app.tenant_id', '00000000-0000-7000-8000-00000000a001', false);
diff --git a/backend/domains/ops/parameter/src/generated/parameter-catalogue.ts b/backend/domains/ops/parameter/src/generated/parameter-catalogue.ts
index fdb88bba..086a78d0 100644
--- a/backend/domains/ops/parameter/src/generated/parameter-catalogue.ts
+++ b/backend/domains/ops/parameter/src/generated/parameter-catalogue.ts
@@ -1,6 +1,6 @@
-// Generated from parameter-catalogue.md sha256:5ffb3fdcef239e39928146f58f19d3545c7fa5e189ca7b75f227d5ea265031fc
+// Generated from parameter-catalogue.md sha256:0e724dc870b7a41b3b1fcf0d8cd8da457aa7d2fa0f4e0717c733fa0d1224dde2
 export const PARAMETER_CATALOGUE_SOURCE_SHA256 =
-  '5ffb3fdcef239e39928146f58f19d3545c7fa5e189ca7b75f227d5ea265031fc';
+  '0e724dc870b7a41b3b1fcf0d8cd8da457aa7d2fa0f4e0717c733fa0d1224dde2';
 export const PARAMETER_CATALOGUE = [
   {
     key: 'rait.wip.limit',
diff --git a/docs/framework/arch/i18n/dashboard.pt-BR.json b/docs/framework/arch/i18n/dashboard.pt-BR.json
new file mode 100644
index 00000000..fd47d573
--- /dev/null
+++ b/docs/framework/arch/i18n/dashboard.pt-BR.json
@@ -0,0 +1,309 @@
+{
+  "dashboard.a11y.live_region": "Atualização automática de contagens",
+  "dashboard.a11y.nav_main": "Navegação principal",
+  "dashboard.a11y.severity.critico": "Severidade crítica, teto atingido",
+  "dashboard.a11y.severity.critico_extincao": "Severidade crítica de extinção — apuração de incidente",
+  "dashboard.a11y.severity.n1": "Severidade nível 1, aproximadamente 50% do prazo",
+  "dashboard.a11y.severity.n2": "Severidade nível 2, aproximadamente 75% do prazo",
+  "dashboard.a11y.severity.n3": "Severidade nível 3, aproximadamente 90% do prazo",
+  "dashboard.a11y.skip_to_content": "Ir para o conteúdo",
+  "dashboard.alert_states.classificado": "Classificado",
+  "dashboard.alert_states.critico_extincao": "Crítico — extinção",
+  "dashboard.alert_states.detectado": "Detectado",
+  "dashboard.alert_states.em_tratamento": "Em tratamento",
+  "dashboard.alert_states.encerrado": "Encerrado",
+  "dashboard.alert_states.escalonado": "Escalonado",
+  "dashboard.alert_states.incidente_registrado": "Incidente registrado",
+  "dashboard.alert_states.notificado": "Notificado",
+  "dashboard.alert_states.reconhecido": "Reconhecido",
+  "dashboard.alert_states.verificado": "Verificado",
+  "dashboard.blocks.a": "Legal-ceiling",
+  "dashboard.blocks.b": "Dever periódico",
+  "dashboard.blocks.c": "SLA operacional",
+  "dashboard.blocks.d": "Saúde técnica",
+  "dashboard.classification.p1": "Público por dever",
+  "dashboard.classification.p2": "Publicável por decisão do órgão",
+  "dashboard.classification.p3": "Interno por natureza",
+  "dashboard.clocks.b": "24 meses",
+  "dashboard.clocks.c": "paralisação",
+  "dashboard.common.action.back": "Voltar",
+  "dashboard.common.action.cancel": "Cancelar",
+  "dashboard.common.action.export": "Exportar",
+  "dashboard.common.action.filter": "Filtrar",
+  "dashboard.common.action.login": "Entrar",
+  "dashboard.common.action.logout": "Sair",
+  "dashboard.common.action.notify": "Notificar",
+  "dashboard.common.action.retry": "Tentar novamente",
+  "dashboard.common.action.view": "Ver",
+  "dashboard.common.as_of": "Lido às {as_of}",
+  "dashboard.common.deep_link": "Abrir no {app}",
+  "dashboard.common.fixed.candidate_deadline_preclusive": "prazo do candidato, preclusivo",
+  "dashboard.common.fixed.manual_acknowledgement": "registro manual de ciência",
+  "dashboard.common.fixed.no_deadline_defined": "sem prazo definido",
+  "dashboard.common.fixed.see_incident_inquiry": "ver apuração de incidente",
+  "dashboard.common.manual": "manual",
+  "dashboard.duty_states.arquivado": "Arquivado",
+  "dashboard.duty_states.atrasado": "Atrasado",
+  "dashboard.duty_states.comprovado": "Comprovado",
+  "dashboard.duty_states.em_apuracao": "Em apuração",
+  "dashboard.duty_states.janela_aberta": "Janela aberta",
+  "dashboard.duty_states.nao_cumprido": "Não cumprido",
+  "dashboard.duty_states.preparado": "Preparado",
+  "dashboard.duty_states.submetido_publicado": "Submetido/Publicado",
+  "dashboard.errors.alert_ack_manual_note_required": "Reconhecimento manual exige uma nota.",
+  "dashboard.errors.alert_ack_not_owner": "Reconhecimento (ACK) só pelo dono do indicador ou operador em seu nome.",
+  "dashboard.errors.alert_business_act_forbidden": "O painel não pratica ato de negócio.",
+  "dashboard.errors.alert_close_without_verification": "Encerramento exige verificação por evidência da origem.",
+  "dashboard.errors.alert_extinction_not_closable": "Alerta da trilha de extinção não pode ser encerrado — apenas apurado.",
+  "dashboard.errors.alert_incident_not_found": "Apuração de incidente não encontrada para este alerta.",
+  "dashboard.errors.alert_source_stale": "A fonte do alerta está indisponível ou desatualizada.",
+  "dashboard.errors.alert_state_invalid": "Comando fora do estado atual do alerta.",
+  "dashboard.errors.auth_required": "É necessário autenticar-se para continuar.",
+  "dashboard.errors.cell_suppressed": "Célula suprimida (limiar de {threshold}).",
+  "dashboard.errors.cell_threshold_undefined": "Limiar de supressão de célula ainda não definido.",
+  "dashboard.errors.classification_missing": "Indicador sem classificação P1/P2/P3 não pode ser exibido nem exportado.",
+  "dashboard.errors.dataset_requirements_unmet": "Dataset aberto sem um dos requisitos obrigatórios.",
+  "dashboard.errors.domain_scope_mismatch": "Este conteúdo é de outro domínio.",
+  "dashboard.errors.duty_already_archived": "Ciclo já arquivado ou não cumprido.",
+  "dashboard.errors.duty_evidence_hash_invalid": "Hash da evidência malformado ou não confere.",
+  "dashboard.errors.duty_evidence_required": "Comprovação exige protocolo, captura ou hash.",
+  "dashboard.errors.duty_no_legal_deadline": "Este dever não tem prazo legal definido.",
+  "dashboard.errors.duty_not_owner": "Avançar o ciclo só pelo dono do dever.",
+  "dashboard.errors.duty_period_invalid": "Período fora da periodicidade do dever.",
+  "dashboard.errors.duty_state_invalid": "Transição fora do ciclo do dever periódico.",
+  "dashboard.errors.enum_invalid": "O valor informado não pertence ao catálogo permitido.",
+  "dashboard.errors.export_format_not_open": "Formato fora do catálogo de formatos abertos.",
+  "dashboard.errors.export_layer_exceeded": "Exportação além da camada do seu papel.",
+  "dashboard.errors.export_n3_forbidden": "Dado sensível não é exportado, em nenhum formato.",
+  "dashboard.errors.export_purpose_required": "Exportação de camada N2 exige finalidade.",
+  "dashboard.errors.export_volume_approval_required": "Volume acima do limite aguarda aprovação nominal.",
+  "dashboard.errors.forbidden_action": "Você não tem permissão para executar esta ação.",
+  "dashboard.errors.idempotency_replay": "A requisição repetida tem conteúdo diferente da original.",
+  "dashboard.errors.if_match_required": "Informe a versão atual do recurso antes de continuar.",
+  "dashboard.errors.indicator_clock_code_invalid": "Letra de relógio fora de A, B, C ou D.",
+  "dashboard.errors.indicator_latency_invalid": "Latência aceitável fora da faixa do bloco.",
+  "dashboard.errors.indicator_not_in_catalog": "Código fora dos 42 indicadores do catálogo.",
+  "dashboard.errors.indicator_target_and_ceiling_mixed": "Meta operacional e teto legal não podem estar no mesmo componente.",
+  "dashboard.errors.indicator_threshold_not_calibrated": "Limiar deste indicador técnico ainda não foi calibrado.",
+  "dashboard.errors.internal": "Ocorreu uma falha interna; informe o identificador ao suporte.",
+  "dashboard.errors.layer_forbidden": "Seu papel não tem a camada exigida para este conteúdo.",
+  "dashboard.errors.layer_n3_never": "Dado sensível não é servido pelo painel.",
+  "dashboard.errors.open_data_parameterized_forbidden": "A API pública não aceita filtro livre — apenas pré-agregados.",
+  "dashboard.errors.panel_blocked_by_decision": "Painel bloqueado até a decisão pendente.",
+  "dashboard.errors.purpose_invalid": "Finalidade fora do catálogo.",
+  "dashboard.errors.purpose_required": "Consulta de camada N2 exige finalidade declarada.",
+  "dashboard.errors.ranking_of_persons_forbidden": "Ordenação nominal de pessoas fora da camada N2 com finalidade.",
+  "dashboard.errors.report_file_hash_mismatch": "Hash do arquivo do relatório não confere.",
+  "dashboard.errors.report_state_invalid": "Conclusão ou falha fora do estado de processamento.",
+  "dashboard.errors.report_type_invalid": "Tipo de relatório fora do catálogo.",
+  "dashboard.errors.root_cause_category_invalid": "Categoria da causa raiz fora de transporte, aceite ou conteúdo.",
+  "dashboard.errors.source_heartbeat_undefined": "Fonte sem contrato de heartbeat não pode ser marcada como fresca.",
+  "dashboard.errors.source_unavailable": "A fonte não respondeu à leitura.",
+  "dashboard.errors.tenant_mismatch": "O recurso não pertence ao tenant atual.",
+  "dashboard.errors.validation_failed": "Os dados informados não passaram na validação.",
+  "dashboard.errors.version_conflict": "O recurso foi alterado desde a última leitura; recarregue os dados.",
+  "dashboard.forms.ack_alerta.channel": "Canal do reconhecimento",
+  "dashboard.forms.ack_alerta.channel_manual": "Manual",
+  "dashboard.forms.ack_alerta.channel_origin": "Evento do app de origem",
+  "dashboard.forms.ack_alerta.gate": "NOTIFICADO → RECONHECIDO",
+  "dashboard.forms.ack_alerta.note": "Nota",
+  "dashboard.forms.ack_alerta.on_behalf_of": "Em nome de",
+  "dashboard.forms.ack_alerta.submit": "Confirmar reconhecimento",
+  "dashboard.forms.auditoria_transparencia.checklist": "Checklist",
+  "dashboard.forms.auditoria_transparencia.evidences": "Evidências",
+  "dashboard.forms.auditoria_transparencia.gate": "Ciclo mensal do IND-DASH-209",
+  "dashboard.forms.auditoria_transparencia.submit": "Registrar auditoria",
+  "dashboard.forms.avancar_ciclo.capture_uri": "Captura",
+  "dashboard.forms.avancar_ciclo.draft_ref": "Referência da minuta",
+  "dashboard.forms.avancar_ciclo.gate": "Transições de [WF-DASH-002]",
+  "dashboard.forms.avancar_ciclo.hash": "Hash",
+  "dashboard.forms.avancar_ciclo.protocol": "Protocolo",
+  "dashboard.forms.avancar_ciclo.submit": "Avançar ciclo",
+  "dashboard.forms.avancar_ciclo.submitted_at": "Data de envio",
+  "dashboard.forms.avancar_ciclo.target_state": "Estado alvo",
+  "dashboard.forms.causa_raiz.category": "Categoria",
+  "dashboard.forms.causa_raiz.category_acceptance": "Aceite",
+  "dashboard.forms.causa_raiz.category_payload": "Conteúdo",
+  "dashboard.forms.causa_raiz.category_transport": "Transporte",
+  "dashboard.forms.causa_raiz.description": "Descrição",
+  "dashboard.forms.causa_raiz.gate": "Anexa ao alerta",
+  "dashboard.forms.causa_raiz.submit": "Registrar causa raiz",
+  "dashboard.forms.configurar_indicador.acceptable_latency": "Latência aceitável",
+  "dashboard.forms.configurar_indicador.classification": "Classificação",
+  "dashboard.forms.configurar_indicador.gate": "indicator-config:publish (bi-analyst, agency-admin, technical-admin)",
+  "dashboard.forms.configurar_indicador.owner": "Dono",
+  "dashboard.forms.configurar_indicador.stale_strategy": "Estratégia de desatualização",
+  "dashboard.forms.configurar_indicador.stale_strategy_hide": "Ocultar",
+  "dashboard.forms.configurar_indicador.stale_strategy_mark": "Marcar",
+  "dashboard.forms.configurar_indicador.submit": "Publicar configuração",
+  "dashboard.forms.configurar_indicador.threshold": "Limiar",
+  "dashboard.forms.encerrar_alerta.confirmation": "Confirmação",
+  "dashboard.forms.encerrar_alerta.gate": "VERIFICADO → ENCERRADO (trilha irregularidade); extinção fecha sozinha",
+  "dashboard.forms.encerrar_alerta.note": "Nota",
+  "dashboard.forms.encerrar_alerta.submit": "Encerrar alerta",
+  "dashboard.forms.exportar.filters": "Filtros",
+  "dashboard.forms.exportar.format": "Formato",
+  "dashboard.forms.exportar.gate": "Evento auditável reforçado; marca d'água",
+  "dashboard.forms.exportar.purpose": "Finalidade",
+  "dashboard.forms.exportar.rows": "Linhas",
+  "dashboard.forms.exportar.scope": "Escopo",
+  "dashboard.forms.exportar.submit": "Exportar",
+  "dashboard.forms.exportar.volume_justification": "Justificativa de volume",
+  "dashboard.forms.finalidade_n2.gate": "Registra consulta ([RN-DASH-171])",
+  "dashboard.forms.finalidade_n2.purpose": "Finalidade",
+  "dashboard.forms.finalidade_n2.purpose_apuracao": "Apuração",
+  "dashboard.forms.finalidade_n2.purpose_auditoria": "Auditoria",
+  "dashboard.forms.finalidade_n2.purpose_estatistica": "Estatística",
+  "dashboard.forms.finalidade_n2.purpose_resposta_ao_titular": "Resposta ao titular",
+  "dashboard.forms.finalidade_n2.purpose_supervisao": "Supervisão",
+  "dashboard.forms.finalidade_n2.purpose_suporte": "Suporte",
+  "dashboard.forms.finalidade_n2.reference": "Referência",
+  "dashboard.forms.finalidade_n2.submit": "Declarar finalidade",
+  "dashboard.forms.solicitar_relatorio.filters": "Filtros",
+  "dashboard.forms.solicitar_relatorio.gate": "generated-report:request",
+  "dashboard.forms.solicitar_relatorio.report_type": "Tipo de relatório",
+  "dashboard.forms.solicitar_relatorio.submit": "Solicitar relatório",
+  "dashboard.freshness.atrasado": "Atrasado",
+  "dashboard.freshness.desatualizado_marcado": "Desatualizado (marcado)",
+  "dashboard.freshness.fresco": "Fresco",
+  "dashboard.freshness.indisponivel": "Indisponível",
+  "dashboard.indicators.ind_dash_101": "Decadência de aplicação da penalidade (RAIT)",
+  "dashboard.indicators.ind_dash_102": "Prescrição por inércia do julgador — JARI (RAIT)",
+  "dashboard.indicators.ind_dash_103": "Prescrição por inércia do julgador — CETRAN (RAIT)",
+  "dashboard.indicators.ind_dash_104": "Prescrição por paralisação (RAIT, Lei 9.873/1999)",
+  "dashboard.indicators.ind_dash_105": "Prescrição quinquenal (RAIT, Lei 9.873/1999 caput)",
+  "dashboard.indicators.ind_dash_106": "Preclusão do requerimento de junta (PEC)",
+  "dashboard.indicators.ind_dash_107": "Preclusão do recurso ao CETRAN/CONTRANDIFE (PEC)",
+  "dashboard.indicators.ind_dash_108": "Conversão retenção→remoção + restrição RENAVAM, via T-REG30 (TEAT)",
+  "dashboard.indicators.ind_dash_109": "Idem via T-REG15 (retenção convertida direto, art. 271 §9º-A)",
+  "dashboard.indicators.ind_dash_110": "Homologação do software TEAT perante SENATRAN",
+  "dashboard.indicators.ind_dash_111": "Marco fixo T-SNE2027 (TEAT)",
+  "dashboard.indicators.ind_dash_201": "Arrecadação/FUNSET informada à União",
+  "dashboard.indicators.ind_dash_202": "Relatório mensal de cartão débito/crédito (FUNSET)",
+  "dashboard.indicators.ind_dash_203": "Publicação estatística mensal RENAEST (benchmark federal)",
+  "dashboard.indicators.ind_dash_204": "Repasse estatístico anual ao sistema nacional",
+  "dashboard.indicators.ind_dash_205": "Reuniões periódicas de coordenadores RENAEST",
+  "dashboard.indicators.ind_dash_206": "Relatório anual de gestão da ouvidoria",
+  "dashboard.indicators.ind_dash_207": "Pesquisa de satisfação anual + ranking público",
+  "dashboard.indicators.ind_dash_208": "Notificação de vencimento da CNH",
+  "dashboard.indicators.ind_dash_209": "Transparência ativa / dados abertos",
+  "dashboard.indicators.ind_dash_301": "Resposta da ouvidoria ao usuário",
+  "dashboard.indicators.ind_dash_302": "Resposta de agente público à ouvidoria",
+  "dashboard.indicators.ind_dash_303": "Resposta a pedido de acesso à informação (LAI)",
+  "dashboard.indicators.ind_dash_304": "Meta interna de defesa prévia (RAIT)",
+  "dashboard.indicators.ind_dash_305": "Meta interna de julgamento pela JARI (RAIT)",
+  "dashboard.indicators.ind_dash_306": "Designação da junta pelo órgão (PEC)",
+  "dashboard.indicators.ind_dash_307": "Decisão da junta (PEC)",
+  "dashboard.indicators.ind_dash_308": "Remessa de documentos ao CETRAN (PEC)",
+  "dashboard.indicators.ind_dash_309": "Junta Especial de Saúde — designação e decisão (PEC)",
+  "dashboard.indicators.ind_dash_310": "Transmissão à RENAEST por sinistro (BOAT)",
+  "dashboard.indicators.ind_dash_311": "Comparecimento pós-recolhimento de CNH por alcoolemia (TEAT)",
+  "dashboard.indicators.ind_dash_312": "Notificação de remoção de veículo (TEAT)",
+  "dashboard.indicators.ind_dash_313": "Teto de cobrança de despesas de depósito (TEAT)",
+  "dashboard.indicators.ind_dash_314": "Apuração de suspeita de concorrência de sessão (TEAT)",
+  "dashboard.indicators.ind_dash_401": "Lag do outbox / fila de eventos entre domínios",
+  "dashboard.indicators.ind_dash_402": "Fila de sincronização offline (TEAT)",
+  "dashboard.indicators.ind_dash_403": "Latência/erro do adapter SENATRAN por sistema nacional",
+  "dashboard.indicators.ind_dash_404": "Integridade da cadeia de custódia de evidências",
+  "dashboard.indicators.ind_dash_405": "Pacotes normativos mobile expirados em campo (TEAT)",
+  "dashboard.indicators.ind_dash_406": "Ocupação de faixas de numeração de AIT (TEAT)",
+  "dashboard.indicators.ind_dash_407": "Dispositivos fora do par homologado (TEAT)",
+  "dashboard.indicators.ind_dash_408": "Disponibilidade e latência das fontes de dado por painel",
+  "dashboard.layers.n0": "Indicadores agregados institucionais",
+  "dashboard.layers.n1": "Operacional por fila",
+  "dashboard.layers.n2": "Identificação de objeto de processo",
+  "dashboard.layers.n3": "Dado pessoal sensível",
+  "dashboard.screens.alertas_id.empty": "Alerta não encontrado.",
+  "dashboard.screens.alertas_id.intro": "Anatomia do alerta, seu ciclo de vida e o link para o objeto no app de origem.",
+  "dashboard.screens.alertas_id.title": "Detalhe do alerta",
+  "dashboard.screens.auditoria.empty": "Nenhum evento de auditoria para este filtro.",
+  "dashboard.screens.auditoria.intro": "Trilha de auditoria agregada por caso, indicador, período ou app.",
+  "dashboard.screens.auditoria.title": "Trilha de auditoria",
+  "dashboard.screens.comparativo.empty": "Nenhum dado comparável para o recorte selecionado.",
+  "dashboard.screens.comparativo.intro": "Comparativo de desempenho entre unidades e circuitos, sempre em distribuição, nunca em ranking.",
+  "dashboard.screens.comparativo.title": "Comparativo",
+  "dashboard.screens.deveres.empty": "Nenhum dever periódico cadastrado.",
+  "dashboard.screens.deveres.intro": "As 14 linhas da tabela-mestra de deveres periódicos, com o estado do ciclo corrente de cada uma.",
+  "dashboard.screens.deveres.title": "Deveres periódicos",
+  "dashboard.screens.deveres_id_ciclos_period.empty": "Nenhum ciclo encontrado para este período.",
+  "dashboard.screens.deveres_id_ciclos_period.intro": "Ciclo de um dever periódico, da janela de apuração ao arquivamento da evidência.",
+  "dashboard.screens.deveres_id_ciclos_period.title": "Ciclo do dever",
+  "dashboard.screens.exportacoes.empty": "Nenhuma exportação registrada.",
+  "dashboard.screens.exportacoes.intro": "Registro de exportações do painel, com aprovações nominais pendentes.",
+  "dashboard.screens.exportacoes.title": "Exportações",
+  "dashboard.screens.frescor.empty": "Nenhuma fonte cadastrada para acompanhamento de frescor.",
+  "dashboard.screens.frescor.intro": "Status de frescor de cada fonte: última leitura, latência aceitável e heartbeat.",
+  "dashboard.screens.frescor.title": "Frescor das fontes",
+  "dashboard.screens.indicadores.empty": "Nenhum indicador encontrado para este filtro.",
+  "dashboard.screens.indicadores.intro": "Catálogo dos 42 indicadores do painel, com bloco, limiar, dono e classificação.",
+  "dashboard.screens.indicadores.title": "Catálogo de indicadores",
+  "dashboard.screens.integracoes.empty": "Nenhuma fonte técnica com pendência no momento.",
+  "dashboard.screens.integracoes.intro": "Saúde técnica da malha de integrações: outbox, sincronização offline e adapters nacionais.",
+  "dashboard.screens.integracoes.title": "Saúde técnica",
+  "dashboard.screens.integracoes_system.empty": "Nenhum item pendente para esta integração.",
+  "dashboard.screens.integracoes_system.intro": "Detalhe de uma integração: triagem por transporte, aceite e conteúdo, com a causa raiz registrada.",
+  "dashboard.screens.integracoes_system.title": "Detalhe da integração",
+  "dashboard.screens.kpis.empty": "Nenhum KPI disponível para este período.",
+  "dashboard.screens.kpis.intro": "Indicadores do próprio painel: cobertura, MTTA, MTTR e frescor médio.",
+  "dashboard.screens.kpis.title": "KPIs do painel",
+  "dashboard.screens.radar_pec.empty": "Nenhum prazo do PEC em acompanhamento.",
+  "dashboard.screens.radar_pec.intro": "Os cinco prazos da escada do PEC, com o prazo do candidato separado do prazo do órgão.",
+  "dashboard.screens.radar_pec.title": "Escada de prazos PEC",
+  "dashboard.screens.radar_rait.empty": "Nenhum caso em risco de prescrição no momento.",
+  "dashboard.screens.radar_rait.intro": "Casos do RAIT por faixa de risco, com o relógio governante e o tempo restante até o teto legal.",
+  "dashboard.screens.radar_rait.title": "Radar de prescrição RAIT",
+  "dashboard.screens.radar_teat.empty": "Nenhum prazo do TEAT em acompanhamento.",
+  "dashboard.screens.radar_teat.intro": "Prazos e marcos administrativos do TEAT, da retenção de veículo à homologação do software.",
+  "dashboard.screens.radar_teat.title": "Radar TEAT",
+  "dashboard.screens.relatorios.empty": "Nenhum relatório gerado até o momento.",
+  "dashboard.screens.relatorios.intro": "Relatórios gerados pelo painel, do pedido ao download com marca d'água.",
+  "dashboard.screens.relatorios.title": "Relatórios",
+  "dashboard.screens.sinistros.empty": "Nenhum dado agregado disponível para este recorte.",
+  "dashboard.screens.sinistros.intro": "Estatística agregada de sinistros, com supressão de célula abaixo do limiar.",
+  "dashboard.screens.sinistros.title": "Estatística de sinistros",
+  "dashboard.screens.transparencia.empty": "Nenhum item de checklist cadastrado para este ciclo.",
+  "dashboard.screens.transparencia.intro": "Checklist de transparência ativa, ciclo mensal de auditoria e datasets abertos.",
+  "dashboard.screens.transparencia.title": "Transparência ativa",
+  "dashboard.screens.triagem.empty": "Nenhum alerta pendente nesta triagem.",
+  "dashboard.screens.triagem.intro": "Fila de alertas de todos os apps, ordenada por severidade combinada, com o dono de cada item.",
+  "dashboard.screens.triagem.title": "Triagem do turno",
+  "dashboard.severity.critico": "CRÍTICO (teto atingido)",
+  "dashboard.severity.critico_extincao": "Crítico — extinção de direito",
+  "dashboard.severity.n1": "N1 (≈50% do prazo)",
+  "dashboard.severity.n2": "N2 (≈75%)",
+  "dashboard.severity.n3": "N3 (≈90%)",
+  "dashboard.shell.brand": "Monitoramento",
+  "dashboard.shell.nav.acao": "Ação",
+  "dashboard.shell.nav.contexto": "Contexto",
+  "dashboard.shell.nav.tecnico": "Técnico",
+  "dashboard.shell.nav.vigilancia": "Vigilância",
+  "dashboard.shell.title.alertas_id": "Detalhe do alerta",
+  "dashboard.shell.title.auditoria": "Trilha de auditoria",
+  "dashboard.shell.title.auth_callback": "Retorno de autenticação",
+  "dashboard.shell.title.comparativo": "Comparativo",
+  "dashboard.shell.title.deveres": "Deveres periódicos",
+  "dashboard.shell.title.deveres_id_ciclos_period": "Ciclo do dever",
+  "dashboard.shell.title.exportacoes": "Exportações",
+  "dashboard.shell.title.frescor": "Frescor das fontes",
+  "dashboard.shell.title.indicadores": "Catálogo de indicadores",
+  "dashboard.shell.title.integracoes": "Saúde técnica",
+  "dashboard.shell.title.integracoes_system": "Detalhe da integração",
+  "dashboard.shell.title.kpis": "KPIs do painel",
+  "dashboard.shell.title.radar_pec": "Escada de prazos PEC",
+  "dashboard.shell.title.radar_rait": "Radar de prescrição RAIT",
+  "dashboard.shell.title.radar_teat": "Radar TEAT",
+  "dashboard.shell.title.relatorios": "Relatórios",
+  "dashboard.shell.title.sem_permissao": "Sem permissão",
+  "dashboard.shell.title.sinistros": "Estatística de sinistros",
+  "dashboard.shell.title.transparencia": "Transparência ativa",
+  "dashboard.shell.title.triagem": "Triagem do turno",
+  "dashboard.states.blocked_by_decision": "Bloqueado pela decisão {decision} — aguardando registro",
+  "dashboard.states.conflict": "Este registro mudou. Recarregue e tente de novo.",
+  "dashboard.states.empty": "Nenhum registro encontrado.",
+  "dashboard.states.error": "Não foi possível concluir. Tente novamente.",
+  "dashboard.states.forbidden": "Sem permissão para este conteúdo",
+  "dashboard.states.loading": "Carregando…",
+  "dashboard.states.stale": "Dado desatualizado desde {as_of}",
+  "dashboard.states.unavailable": "Sem leitura — fonte indisponível",
+  "dashboard.states.unavailable_in_version": "Indisponível nesta versão"
+}
diff --git a/docs/framework/arch/parameter-catalogue.md b/docs/framework/arch/parameter-catalogue.md
index 88deaedb..aeb4a474 100644
--- a/docs/framework/arch/parameter-catalogue.md
+++ b/docs/framework/arch/parameter-catalogue.md
@@ -140,35 +140,51 @@ desconhecido — nunca por exclusão de diretório. Para i18n, a origem é `OD-P
 (`docs/meta/agents/orchestra/README.md`); para template documental, a decisão e o catálogo
 autoridade aparecem na própria linha.

-| Namespace              | App                                | Catálogo                                   | Decisão |
-| ---------------------- | ---------------------------------- | ------------------------------------------ | ------- |
-| `portal.shell`         | `apps/portal/web`                  | `src/app/i18n/portal.pt-BR.json`           | OD-P46  |
-| `portal.common`        | `apps/portal/web`                  | `src/app/i18n/portal.pt-BR.json`           | OD-P46  |
-| `portal.states`        | `apps/portal/web`                  | `src/app/i18n/portal.pt-BR.json`           | OD-P46  |
-| `portal.errors`        | `apps/portal/web`                  | `src/app/i18n/portal.pt-BR.json`           | OD-P46  |
-| `portal.situation`     | `apps/portal/web`                  | `src/app/i18n/portal.pt-BR.json`           | OD-P46  |
-| `portal.screens`       | `apps/portal/web`                  | `src/app/i18n/portal.pt-BR.json`           | OD-P46  |
-| `portal.forms`         | `apps/portal/web`                  | `src/app/i18n/portal.pt-BR.json`           | OD-P46  |
-| `portal.legal`         | `apps/portal/web`                  | `src/app/i18n/portal.pt-BR.json`           | OD-P46  |
-| `portal.requests`      | `apps/portal/web`                  | `src/app/i18n/portal.pt-BR.json`           | OD-P46  |
-| `portal.evaluations`   | `apps/portal/web`                  | `src/app/i18n/portal.pt-BR.json`           | OD-P46  |
-| `portal.notifications` | `apps/portal/web`                  | `src/app/i18n/portal.pt-BR.json`           | OD-P46  |
-| `portal.documents`     | `apps/portal/web`                  | `src/app/i18n/portal.pt-BR.json`           | OD-P46  |
-| `portal.services`      | `apps/portal/web`                  | `src/app/i18n/portal.pt-BR.json`           | OD-P46  |
-| `portal.a11y`          | `apps/portal/web`                  | `src/app/i18n/portal.pt-BR.json`           | OD-P46  |
-| `est.crash`            | `backend/app`                      | `inf.normative_document_template`          | OD-B08  |
-| `teat.shell`           | `apps/teat/mobile + apps/teat/web` | `docs/framework/arch/i18n/teat.pt-BR.json` | OD-P46  |
-| `teat.common`          | `apps/teat/mobile + apps/teat/web` | `docs/framework/arch/i18n/teat.pt-BR.json` | OD-P46  |
-| `teat.states`          | `apps/teat/mobile + apps/teat/web` | `docs/framework/arch/i18n/teat.pt-BR.json` | OD-P46  |
-| `teat.errors`          | `apps/teat/mobile + apps/teat/web` | `docs/framework/arch/i18n/teat.pt-BR.json` | OD-P46  |
-| `teat.screens`         | `apps/teat/mobile + apps/teat/web` | `docs/framework/arch/i18n/teat.pt-BR.json` | OD-P46  |
-| `teat.forms`           | `apps/teat/mobile + apps/teat/web` | `docs/framework/arch/i18n/teat.pt-BR.json` | OD-P46  |
-| `teat.legal`           | `apps/teat/mobile + apps/teat/web` | `docs/framework/arch/i18n/teat.pt-BR.json` | OD-P46  |
-| `teat.sync`            | `apps/teat/mobile + apps/teat/web` | `docs/framework/arch/i18n/teat.pt-BR.json` | OD-P46  |
-| `teat.readiness`       | `apps/teat/mobile + apps/teat/web` | `docs/framework/arch/i18n/teat.pt-BR.json` | OD-P46  |
-| `teat.navigation`      | `apps/teat/mobile + apps/teat/web` | `docs/framework/arch/i18n/teat.pt-BR.json` | OD-P46  |
-| `teat.a11y`            | `apps/teat/mobile + apps/teat/web` | `docs/framework/arch/i18n/teat.pt-BR.json` | OD-P46  |
-| `teat.provisioning`    | `apps/teat/mobile + apps/teat/web` | `docs/framework/arch/i18n/teat.pt-BR.json` | OD-P46  |
+| Namespace                  | App                                | Catálogo                                        | Decisão |
+| -------------------------- | ---------------------------------- | ----------------------------------------------- | ------- |
+| `portal.shell`             | `apps/portal/web`                  | `src/app/i18n/portal.pt-BR.json`                | OD-P46  |
+| `portal.common`            | `apps/portal/web`                  | `src/app/i18n/portal.pt-BR.json`                | OD-P46  |
+| `portal.states`            | `apps/portal/web`                  | `src/app/i18n/portal.pt-BR.json`                | OD-P46  |
+| `portal.errors`            | `apps/portal/web`                  | `src/app/i18n/portal.pt-BR.json`                | OD-P46  |
+| `portal.situation`         | `apps/portal/web`                  | `src/app/i18n/portal.pt-BR.json`                | OD-P46  |
+| `portal.screens`           | `apps/portal/web`                  | `src/app/i18n/portal.pt-BR.json`                | OD-P46  |
+| `portal.forms`             | `apps/portal/web`                  | `src/app/i18n/portal.pt-BR.json`                | OD-P46  |
+| `portal.legal`             | `apps/portal/web`                  | `src/app/i18n/portal.pt-BR.json`                | OD-P46  |
+| `portal.requests`          | `apps/portal/web`                  | `src/app/i18n/portal.pt-BR.json`                | OD-P46  |
+| `portal.evaluations`       | `apps/portal/web`                  | `src/app/i18n/portal.pt-BR.json`                | OD-P46  |
+| `portal.notifications`     | `apps/portal/web`                  | `src/app/i18n/portal.pt-BR.json`                | OD-P46  |
+| `portal.documents`         | `apps/portal/web`                  | `src/app/i18n/portal.pt-BR.json`                | OD-P46  |
+| `portal.services`          | `apps/portal/web`                  | `src/app/i18n/portal.pt-BR.json`                | OD-P46  |
+| `portal.a11y`              | `apps/portal/web`                  | `src/app/i18n/portal.pt-BR.json`                | OD-P46  |
+| `est.crash`                | `backend/app`                      | `inf.normative_document_template`               | OD-B08  |
+| `teat.shell`               | `apps/teat/mobile + apps/teat/web` | `docs/framework/arch/i18n/teat.pt-BR.json`      | OD-P46  |
+| `teat.common`              | `apps/teat/mobile + apps/teat/web` | `docs/framework/arch/i18n/teat.pt-BR.json`      | OD-P46  |
+| `teat.states`              | `apps/teat/mobile + apps/teat/web` | `docs/framework/arch/i18n/teat.pt-BR.json`      | OD-P46  |
+| `teat.errors`              | `apps/teat/mobile + apps/teat/web` | `docs/framework/arch/i18n/teat.pt-BR.json`      | OD-P46  |
+| `teat.screens`             | `apps/teat/mobile + apps/teat/web` | `docs/framework/arch/i18n/teat.pt-BR.json`      | OD-P46  |
+| `teat.forms`               | `apps/teat/mobile + apps/teat/web` | `docs/framework/arch/i18n/teat.pt-BR.json`      | OD-P46  |
+| `teat.legal`               | `apps/teat/mobile + apps/teat/web` | `docs/framework/arch/i18n/teat.pt-BR.json`      | OD-P46  |
+| `teat.sync`                | `apps/teat/mobile + apps/teat/web` | `docs/framework/arch/i18n/teat.pt-BR.json`      | OD-P46  |
+| `teat.readiness`           | `apps/teat/mobile + apps/teat/web` | `docs/framework/arch/i18n/teat.pt-BR.json`      | OD-P46  |
+| `teat.navigation`          | `apps/teat/mobile + apps/teat/web` | `docs/framework/arch/i18n/teat.pt-BR.json`      | OD-P46  |
+| `teat.a11y`                | `apps/teat/mobile + apps/teat/web` | `docs/framework/arch/i18n/teat.pt-BR.json`      | OD-P46  |
+| `teat.provisioning`        | `apps/teat/mobile + apps/teat/web` | `docs/framework/arch/i18n/teat.pt-BR.json`      | OD-P46  |
+| `dashboard.a11y`           | `apps/dashboard/web`               | `docs/framework/arch/i18n/dashboard.pt-BR.json` | OD-P46  |
+| `dashboard.alert_states`   | `apps/dashboard/web`               | `docs/framework/arch/i18n/dashboard.pt-BR.json` | OD-P46  |
+| `dashboard.blocks`         | `apps/dashboard/web`               | `docs/framework/arch/i18n/dashboard.pt-BR.json` | OD-P46  |
+| `dashboard.classification` | `apps/dashboard/web`               | `docs/framework/arch/i18n/dashboard.pt-BR.json` | OD-P46  |
+| `dashboard.clocks`         | `apps/dashboard/web`               | `docs/framework/arch/i18n/dashboard.pt-BR.json` | OD-P46  |
+| `dashboard.common`         | `apps/dashboard/web`               | `docs/framework/arch/i18n/dashboard.pt-BR.json` | OD-P46  |
+| `dashboard.duty_states`    | `apps/dashboard/web`               | `docs/framework/arch/i18n/dashboard.pt-BR.json` | OD-P46  |
+| `dashboard.errors`         | `apps/dashboard/web`               | `docs/framework/arch/i18n/dashboard.pt-BR.json` | OD-P46  |
+| `dashboard.forms`          | `apps/dashboard/web`               | `docs/framework/arch/i18n/dashboard.pt-BR.json` | OD-P46  |
+| `dashboard.freshness`      | `apps/dashboard/web`               | `docs/framework/arch/i18n/dashboard.pt-BR.json` | OD-P46  |
+| `dashboard.indicators`     | `apps/dashboard/web`               | `docs/framework/arch/i18n/dashboard.pt-BR.json` | OD-P46  |
+| `dashboard.layers`         | `apps/dashboard/web`               | `docs/framework/arch/i18n/dashboard.pt-BR.json` | OD-P46  |
+| `dashboard.screens`        | `apps/dashboard/web`               | `docs/framework/arch/i18n/dashboard.pt-BR.json` | OD-P46  |
+| `dashboard.severity`       | `apps/dashboard/web`               | `docs/framework/arch/i18n/dashboard.pt-BR.json` | OD-P46  |
+| `dashboard.shell`          | `apps/dashboard/web`               | `docs/framework/arch/i18n/dashboard.pt-BR.json` | OD-P46  |
+| `dashboard.states`         | `apps/dashboard/web`               | `docs/framework/arch/i18n/dashboard.pt-BR.json` | OD-P46  |

 ## Regras do catálogo

diff --git a/docs/framework/product/transversal/dashboard/screens/IU-DASH-D-01.md b/docs/framework/product/transversal/dashboard/screens/IU-DASH-D-01.md
new file mode 100644
index 00000000..4b10946e
--- /dev/null
+++ b/docs/framework/product/transversal/dashboard/screens/IU-DASH-D-01.md
@@ -0,0 +1,142 @@
+---
+id: IU-DASH-D-01
+title: Triagem do turno — especificação de tela
+status: draft
+apps: [dashboard]
+sources: [REF-LEI-13709-2018, REF-LEI-9873-1999, REF-CTB-280-290]
+updated: 2026-09-21
+---
+
+Ficha da rota `/monitoramento` (`dashboard-frontends.md` §4, tela D-01; painel P-01 de [IU-DASH-001]).
+Fontes: [UC-DASH-002], [JRN-DASH-001], [RN-DASH-101], [RN-DASH-135], [RN-DASH-142].
+
+## 1. Identidade
+
+- `id`: `IU-DASH-D-01`; `path`: `/monitoramento` (`route-manifest.md` #1).
+- `screen`: P-01 ("Triagem do turno — fila de alertas cross-app" de [IU-DASH-001] §A).
+- camada de produto: Ação (primeira do menu, `route-manifest.md` §I; ordem fixa [IU-DASH-001] §B).
+- módulo: `triage` (`dashboard-frontends.md` §9).
+- `slug`: `triagem`; segmento i18n: `triagem`.
+- página: `ShiftTriagePage`; componente inteligente principal: `AlertQueue` (lista ordenada por
+  severidade combinada — legal × operacional × técnica, `dashboard-frontends.md` §4).
+
+## 2. Acesso
+
+- `policy`: `dashboard:alert:read` (`policy.ts`, `route-manifest.md` §D/§G nota 1).
+- `access`: N1 — a fila cruza "alertas por família" e "contagens por pool", conteúdo N1 de
+  [RN-DASH-170]; derivação em `route-manifest.md` §C linha D-01.
+- `roles` (presença): `dash-operator`, `rait-manager`, `rait-coordinator`, `rait-chair`,
+  `traffic-authority`, GESTOR, `agency-admin`, `technical-admin`, AUDITOR (9,
+  `route-manifest.md` §D). Todos os demais códigos de DETRAN_ROLES (36 - 9 = 27) →
+  `/monitoramento/sem-permissao?de=/monitoramento`.
+- passe global (`route-manifest.md` §E): GESTOR_DETRAN alcança esta rota só pelo passe global
+  (não está na matriz de `dashboard:alert:read`), porque sua camada (N2) ≥ N1; ADMIN e SUPORTE
+  ficam bloqueados pela camada (N0 < N1). Divergência com [RN-DASH-170] verificação 3 registrada
+  como `OD-D16-005` — não decidida aqui.
+- guardas na ordem: `authGuard` → `permissionGuard('dashboard:alert:read')` →
+  `layerGuard('N1')`. N3 nunca é servido (`dashboardLayerAllows(_, 'N3') === false`).
+- não há conteúdo N2 nesta tela (a fila mostra apenas dono, severidade e tempo restante; o
+  objeto do alerta só se identifica em D-02).
+
+## 3. Entrada
+
+- de onde se chega: primeira rota do menu Ação (`route-manifest.md` §I); é a rota raiz de
+  `/monitoramento` e o destino do login para os papéis com acesso.
+- parâmetros de rota: nenhum.
+- filtros de URL: `state`, `severity`, `block`, `indicator`, `app`, `owner`, `unit`, `pool`
+  (contrato §2, rota `GET alerts`).
+- sem rota filha de detalhe nesta linha (o detalhe é a rota irmã D-02).
+
+## 4. Dados
+
+- lê `GET alerts` (contrato §2) com os filtros acima; lista ordenada por severidade combinada
+  (legal × operacional × técnica), camada servida por papel.
+- projeções de origem por bloco: `dashboard.prescription_risk` (RAIT, bloco A),
+  `dashboard.pec_deadlines` (PEC, bloco A/C), `dashboard.integration_health` (bloco D) —
+  `dashboard-route-contract.md` §6; `dashboard-frontends.md` §8.
+- cada item carrega dono, severidade (N1/N2/N3/CRÍTICO), selo de frescor + `asOf`
+  (`meta.freshness { state, asOf, acceptableLatency, source }`, contrato §1 regra 3); nenhum
+  cálculo de prazo, severidade ou ordem de fila no cliente — tudo vem calculado do backend.
+- indicador em `INDISPONIVEL` ou `DESATUALIZADO_MARCADO` não gera `DETECTADO`
+  (`dashboard-route-contract.md` §2, nota).
+- classificação P1/P2/P3 é atributo visível de cada indicador antes de exibição
+  ([RN-DASH-142]).
+- SSE `GET /v1/dashboard/stream` eventos `alert.changed`, `alert.escalated` atualizam a fila sem
+  reload; fallback de polling 30 s (contrato §5).
+- blocos exibidos: A, B, C, D — [IU-DASH-001] §A P-01 "agregado de todas as escadas"
+  (`route-manifest.md` §G nota 2).
+
+## 5. Estados
+
+- **vazio**: `dashboard.screens.triagem.empty` — nenhum alerta pendente no turno.
+- **carregando**: `dashboard.states.loading`, skeleton do kit sobre a lista.
+- **erro**: `dashboard.states.error` + `dashboard.errors.<code>` (`DASH.INTERNAL` ou rede);
+  botão de repetir.
+- **indisponível**: selo `INDISPONIVEL` oculta o valor do item afetado (bloco A);
+  `dashboard.states.unavailable`.
+- **desatualizado**: `DESATUALIZADO_MARCADO`, `dashboard.states.stale` com "dado desatualizado
+  desde `{as_of}`".
+- **bloqueado por decisão**: não se aplica a esta tela (nenhum indicador de P-01 depende de
+  decisão pendente).
+- sem permissão (403, guarda de rota) e conflito (409/412) não se aplicam — a tela não tem
+  comando de mutação própria; os comandos de item (ACK, encerrar) vivem em D-02.
+
+## 6. Comandos
+
+- Nenhum comando de mutação nesta tela — é lista de leitura agregada. As ações disponíveis
+  navegam para D-02 (`/monitoramento/alertas/:id`), para D-06 quando o item é de integração, ou
+  fazem `DeepLinkButton` direto ao objeto na origem quando a camada permite ([RN-DASH-101]:
+  nenhum botão pratica ato de negócio).
+- "Fechar turno" ([JRN-DASH-001] passo 7) é critério de completude do próprio agregado que a
+  tela já lê (todo item com dono ou confirmação registrada) — não é um comando com rota própria
+  no contrato; nenhum prazo é recalculado para produzi-lo.
+
+## 7. Saída
+
+- clique num item navega a D-02 (`/monitoramento/alertas/:id`); item de integração navega a D-06
+  (`/monitoramento/integracoes`); `DeepLinkButton` leva ao app de origem preservando ali
+  autenticação e trilha próprias ([RN-DASH-101]).
+- a fila reflete o efeito das ações tomadas em D-02/app de origem via SSE, sem exigir reload
+  ([JRN-DASH-002] passo 6).
+
+## 8. Segurança e LGPD
+
+- camada N1: fila por família e pool, sem identificação de objeto de processo (N2, só em D-02
+  sob `LayerGate`); N3 nunca ([RN-DASH-170]).
+- segregação horizontal por domínio: gestor de área só vê a fatia do seu domínio
+  ([RN-DASH-170] verificação 2).
+- classificação P1/P2/P3 antes de exibir ([RN-DASH-142] verificação 1: "todo indicador nasce
+  P3").
+- nada sensível em URL/log; filtros da query não carregam identificador de pessoa.
+
+## 9. Acessibilidade
+
+- severidade por forma + rótulo (`SeverityChip`, `dashboard.a11y.severity.*`), nunca só cor
+  ([IU-DASH-001] §C.4); CRITICO_EXTINCAO/INCIDENTE_REGISTRADO com cor e ícone próprios
+  ([WF-DASH-001] §Distinção).
+- `aria-live` na contagem da fila, que muda via SSE/polling.
+- selo de frescor legível por leitor de tela em cada item.
+
+## 10. Testes
+
+- roteamento: os 9 papéis ativos (presença, `route-manifest.md` §D) e todos os demais 27 códigos
+  de DETRAN_ROLES (ausência) → `/monitoramento/sem-permissao`; `N3` sempre bloqueado.
+- os seis estados de M4 como critérios (vazio, carregando, erro, indisponível, desatualizado —
+  bloqueado por decisão não se aplica aqui e não deve aparecer).
+- selo de frescor em todo item da fila; severidade nunca só por cor.
+- ligados a [AC-DASH-002-2] (anatomia mínima do item) e [AC-DASH-001-6] (selo de frescor).
+
+## Componentes compartilhados
+
+`FreshnessSeal`, `SeverityChip`, `AlertCard`, `DeepLinkButton`, `ClassificationBadge`.
+
+## Chaves i18n
+
+- `dashboard.screens.triagem.title` — "Triagem do turno"
+- `dashboard.screens.triagem.intro` — "Fila de alertas cross-app ordenada por severidade
+  combinada; cada item com dono."
+- `dashboard.screens.triagem.empty` — "Nenhum alerta pendente no turno."
+
+Referências (sem criar): `dashboard.states.*`, `dashboard.freshness.*`, `dashboard.severity.*`,
+`dashboard.alert_states.*`, `dashboard.blocks.*`, `dashboard.errors.*`, `dashboard.common.*`,
+`dashboard.a11y.*`.
diff --git a/docs/framework/product/transversal/dashboard/screens/IU-DASH-D-02.md b/docs/framework/product/transversal/dashboard/screens/IU-DASH-D-02.md
new file mode 100644
index 00000000..01c4c2df
--- /dev/null
+++ b/docs/framework/product/transversal/dashboard/screens/IU-DASH-D-02.md
@@ -0,0 +1,146 @@
+---
+id: IU-DASH-D-02
+title: Detalhe do alerta — especificação de tela
+status: draft
+apps: [dashboard]
+sources: [REF-LEI-13709-2018, REF-LEI-9873-1999, REF-CTB-280-290]
+updated: 2026-09-21
+---
+
+Ficha da rota `/monitoramento/alertas/:id` (`dashboard-frontends.md` §4, tela D-02; painel P-01
+de [IU-DASH-001] em drill-down — sem código de painel próprio).
+Fontes: [UC-DASH-002], [JRN-DASH-001], [RN-DASH-101], [RN-DASH-135].
+
+## 1. Identidade
+
+- `id`: `IU-DASH-D-02`; `path`: `/monitoramento/alertas/:id` (`route-manifest.md` #2).
+- `screen`: tela de apoio (drill-down de P-01; sem `P-nn` próprio).
+- camada de produto: Ação (`route-manifest.md` §I mostra as rotas de detalhe fora do menu, mas a
+  camada da rota é Ação, `dashboard-frontends.md` §4).
+- módulo: `triage`.
+- `slug`: `alertas-id`; segmento i18n: `alertas_id`.
+- página: `AlertDetailPage`; componente inteligente principal: `AlertCard` +
+  `AlertLifecycle` (anatomia mínima e ciclo de [WF-DASH-001] com timestamps e destinatários).
+
+## 2. Acesso
+
+- `policy`: `dashboard:alert:read` (leitura); comandos com chaves próprias (§6).
+- `access`: N1 para a anatomia mínima e o ciclo; o **objeto** do alerta (nº do processo, placa,
+  equipamento) é N2 e só se identifica sob `LayerGate` com finalidade declarada
+  (`route-manifest.md` §C linha D-02; contrato §2 `GET alerts/{id}` audita `DASH_ALERT_READ (N2)`).
+- `roles` (presença): os mesmos 9 de D-01 (`dash-operator`, AREA-MANAGERS, `agency-admin`,
+  `technical-admin`, AUDITOR). Ausência → `/monitoramento/sem-permissao`.
+- passe global: GESTOR_DETRAN via §E (não na matriz); ADMIN/SUPORTE bloqueados pela camada
+  (`OD-D16-005`).
+- guardas: `authGuard` → `permissionGuard('dashboard:alert:read')` → `layerGuard('N1')`;
+  `LayerGate` (finalidade, `X-Purpose`) antes de exibir o objeto em N2 ([RN-DASH-171]).
+- gestor de área só consulta o próprio domínio (`DASH.DOMAIN_SCOPE_MISMATCH`, dinâmico no
+  backend, `route-manifest.md` §C).
+- pré-condição de estado: nenhuma — a tela abre em qualquer estado do ciclo de
+  [WF-DASH-001].
+
+## 3. Entrada
+
+- de onde se chega: clique num item de D-01, ou deep-link direto ([JRN-DASH-001] passo 2).
+- parâmetros de rota: `:id` (identificador do alerta).
+- sem filtros de URL adicionais.
+
+## 4. Dados
+
+- lê `GET alerts/{id}` (contrato §2): anatomia mínima ([RN-DASH-135]: `regra_origem`, `objeto`,
+  `degrau`, `emitido_em`, `destinatário`, `entregue_em`, `reconhecido_por`/`reconhecido_em`,
+  `encerrado_por_estado`), ciclo completo de [WF-DASH-001], trilha imutável.
+- quando `track = extinção` e o alerta chega a `CRITICO_EXTINCAO`/`INCIDENTE_REGISTRADO`, lê
+  também `GET alerts/{id}/incident` (contrato §2).
+- todo campo temporal carrega selo de frescor + `asOf`; nenhum prazo recalculado no cliente
+  ([RN-DASH-101] verificação 4 em [AC-DASH-001-4]).
+- SSE `alert.changed` atualiza o ciclo sem reload.
+- blocos exibidos conforme o indicador do alerta: A, B, C, D.
+
+## 5. Estados
+
+- **vazio**: não se aplica (a tela sempre resolve um `:id`); alerta inexistente é
+  `dashboard.errors.<code>` (404, `DASH.TENANT_MISMATCH`/genérico §6 do catálogo), tratado como
+  erro de navegação, não como vazio.
+- **carregando**: `dashboard.states.loading`, skeleton do `AlertCard`.
+- **erro**: `dashboard.states.error` + `dashboard.errors.<code>`.
+- **indisponível**: selo `INDISPONIVEL` marca o campo cuja fonte caiu (bloco B/C/D do alerta,
+  quando aplicável); bloco A oculta por padrão ([WF-DASH-003] §Duas estratégias).
+- **desatualizado**: `DESATUALIZADO_MARCADO` com "desde `{as_of}`".
+- **bloqueado por decisão**: não se aplica.
+- **sem permissão** (403, N2 sem finalidade): `DASH.PURPOSE_REQUIRED`/`DASH.LAYER_FORBIDDEN`,
+  diálogo `LayerGate`.
+- **conflito** (409/412): comando fora do estado (`DASH.ALERT_STATE_INVALID`), `If-Match`
+  ausente/divergente nos comandos do §6.
+
+## 6. Comandos
+
+| Rota (contrato §2)         | Ação  | Papel                                      | Pré-estado             | Payload                                           | Pós-estado       | Erro esperado                                                                 |
+| -------------------------- | ----- | ------------------------------------------ | ---------------------- | ------------------------------------------------- | ---------------- | ----------------------------------------------------------------------------- |
+| `POST alerts/{id}/ack`     | ack   | dono, `dash-operator` em nome do dono      | `NOTIFICADO`           | `{ channel: origin\|manual, note?, onBehalfOf? }` | `RECONHECIDO`    | `DASH.ALERT_ACK_NOT_OWNER`, `DASH.ALERT_ACK_MANUAL_NOTE_REQUIRED`             |
+| `POST alerts/{id}/close`   | close | `dash-operator` (trilha de irregularidade) | `VERIFICADO`           | `{ note? }`                                       | `ENCERRADO`      | `DASH.ALERT_CLOSE_WITHOUT_VERIFICATION`, `DASH.ALERT_EXTINCTION_NOT_CLOSABLE` |
+| `GET alerts/{id}/incident` | read  | gestores, AUDITOR                          | `INCIDENTE_REGISTRADO` | —                                                 | apuração herdada | `DASH.ALERT_INCIDENT_NOT_FOUND`                                               |
+
+- `If-Match` obrigatório em `ack`/`close` (contrato, `AGENTS.md` regra 4/[CODESTYLE.md]).
+- Nenhum comando altera objeto de domínio ([RN-DASH-101]); a ação de mérito é `DeepLinkButton`
+  ao app de origem.
+- Em `CRITICO_EXTINCAO`/`INCIDENTE_REGISTRADO` o botão é "ver apuração de incidente"
+  (`dashboard:incident:read`), nunca "encerrar" (`DASH.ALERT_EXTINCTION_NOT_CLOSABLE`).
+- ACK `manual` é rotulado "registro manual de ciência" enquanto o app de origem não expõe evento
+  de ciência ([AC-DASH-002-5]).
+- botões só habilitados com `*stynxHasPermission` da mesma chave do comando; encerrar exige
+  `VERIFICADO` (evidência da origem, nunca autodeclaração, [AC-DASH-002-4]).
+
+## 7. Saída
+
+- `DeepLinkButton` leva ao objeto na origem (RAIT/PEC/BOAT/TEAT), preservando ali autenticação e
+  trilha próprias.
+- após `ack`, a tela permanece em D-02 com o ciclo atualizado; após `close`, o card reflete
+  `ENCERRADO`; a fila de D-01 atualiza via SSE sem reload.
+- "ver apuração de incidente" leva à apuração herdada do protocolo WF-RAIT-002 §4.1.
+
+## 8. Segurança e LGPD
+
+- camada N1 na anatomia mínima; N2 no objeto, sob `LayerGate` com finalidade e consulta
+  registrada ([RN-DASH-171]); N3 nunca (dado de saúde de vítima, biometria, bodycam —
+  [RN-DASH-170]).
+- gestor de área só no próprio domínio (`DASH.DOMAIN_SCOPE_MISMATCH`).
+- trilha do alerta é prova de diligência e não se apaga ([AC-DASH-002-3]); reconhecer não
+  resolve — o alerta só encerra quando o estado subjacente muda no app de origem
+  ([RN-DASH-135] princípio 1).
+- classificação P1/P2/P3 antes de exibir; nada sensível em URL/log.
+
+## 9. Acessibilidade
+
+- severidade por forma + rótulo, nunca só cor; cor e ícone próprios em
+  CRITICO_EXTINCAO/INCIDENTE_REGISTRADO ([WF-DASH-001] §Distinção).
+- `aria-live` no ciclo e no selo de frescor, que mudam via SSE.
+- botão "encerrar" desabilitado com motivo visível quando faltar verificação
+  (`dashboard-error-catalog.md` §7).
+
+## 10. Testes
+
+- roteamento: 9 papéis ativos (presença) e os demais (ausência) → sem-permissão; N3 bloqueado.
+- os seis estados aplicáveis (vazio não se aplica; ver §5) como critérios.
+- N2 sem finalidade nunca revela o objeto ([C-01-09]); `LayerGate` registra finalidade.
+- comando `ack`/`close` respeita pré-estado e `If-Match`; ligados a [AC-DASH-002-1],
+  [AC-DASH-002-4], [AC-DASH-002-5].
+- "ver apuração de incidente" nunca oferece "encerrar" em trilha de extinção.
+
+## Componentes compartilhados
+
+`FreshnessSeal`, `SeverityChip`, `AlertCard`, `AlertLifecycle`, `ClockGovernorBadge`,
+`LegalBasisTag`, `LayerGate`, `DeepLinkButton`, `ClassificationBadge`.
+
+## Chaves i18n
+
+- `dashboard.screens.alertas_id.title` — "Detalhe do alerta"
+- `dashboard.screens.alertas_id.intro` — "Anatomia mínima, ciclo do alerta, ACK e deep-link ao
+  objeto na origem."
+- `dashboard.screens.alertas_id.empty` — "Alerta não encontrado."
+
+Referências (sem criar): `dashboard.states.*`, `dashboard.freshness.*`, `dashboard.severity.*`,
+`dashboard.alert_states.*`, `dashboard.errors.*`, `dashboard.common.fixed.see_incident_inquiry`,
+`dashboard.common.fixed.manual_acknowledgement`, `dashboard.common.manual`,
+`dashboard.forms.ack_alerta.*`, `dashboard.forms.encerrar_alerta.*`,
+`dashboard.forms.finalidade_n2.*`, `dashboard.a11y.*`.
diff --git a/docs/framework/product/transversal/dashboard/screens/IU-DASH-D-03.md b/docs/framework/product/transversal/dashboard/screens/IU-DASH-D-03.md
new file mode 100644
index 00000000..cdba9b79
--- /dev/null
+++ b/docs/framework/product/transversal/dashboard/screens/IU-DASH-D-03.md
@@ -0,0 +1,125 @@
+---
+id: IU-DASH-D-03
+title: Radar de prescrição RAIT — especificação de tela
+status: draft
+apps: [dashboard]
+sources: [REF-CTB-280-290, REF-LEI-9873-1999, REF-CONTRAN-918]
+updated: 2026-09-21
+---
+
+Ficha da rota `/monitoramento/radar/rait` (`dashboard-frontends.md` §4, tela D-03; painel P-02
+de [IU-DASH-001]).
+Fontes: [UC-DASH-001], [JRN-DASH-002], [RN-DASH-130], [RN-DASH-131].
+
+## 1. Identidade
+
+- `id`: `IU-DASH-D-03`; `path`: `/monitoramento/radar/rait` (`route-manifest.md` #3).
+- `screen`: P-02 ("Radar de prescrição RAIT" de [IU-DASH-001] §A).
+- camada de produto: Ação.
+- módulo: `radar`.
+- `slug`: `radar-rait`; segmento i18n: `radar_rait`.
+- página: `RaitRadarPage`; componente inteligente principal: lista de casos por faixa com
+  `ClockGovernorBadge` (relógio governante nomeado por processo).
+
+## 2. Acesso
+
+- `policy`: `dashboard:alert:read` (prov., `OD-D16-002` — o radar não tem rota `GET` própria no
+  contrato §4; lê `GET alerts` filtrada por `app`/`block`).
+- `access`: N1 — "casos por faixa", contagens e filtros pool/circuito/unidade
+  (`route-manifest.md` §C linha D-03); o card com número do processo e o drill-down ao RAIT são
+  N2, via `LayerGate` ([RN-DASH-142] verificação 3).
+- `roles` (presença): os 9 de `route-manifest.md` §D (`dash-operator`, AREA-MANAGERS,
+  `agency-admin`, `technical-admin`, AUDITOR).
+- passe global: GESTOR_DETRAN via §E; ADMIN/SUPORTE bloqueados pela camada (`OD-D16-005`).
+- guardas: `authGuard` → `permissionGuard('dashboard:alert:read')` → `layerGuard('N1')`;
+  `LayerGate` no drill-down N2; gestor de área só no próprio domínio
+  (`DASH.DOMAIN_SCOPE_MISMATCH`).
+
+## 3. Entrada
+
+- de onde se chega: menu do grupo Ação (`route-manifest.md` §I); deep-link a partir de D-01
+  quando o item é RAIT.
+- parâmetros de rota: nenhum.
+- filtros de URL: pool, circuito, unidade (`dashboard-frontends.md` §4).
+
+## 4. Dados
+
+- lê `GET alerts` filtrada por `app=rait` (contrato §2, `OD-D16-002`); projeção
+  `dashboard.prescription_risk` (`dashboard-route-contract.md` §6, IND-DASH-101…105).
+- por caso: nível de severidade (N1/N2/N3/CRÍTICO), base legal citada explicitamente
+  ("CTB art. 289-A"), dono, tempo restante, selo de frescor da leitura ([UC-DASH-001] passo 3).
+- os quatro relógios A/B/C/D são monitorados em paralelo por processo, com o menor tempo
+  restante promovido a indicador de urgência ([RN-DASH-131]: "o mais curto governa" —
+  [AC-DASH-001-1]); relógio B distingue 1ª/2ª instância por `instancia`, nunca por letra própria.
+- indicador sem escada calibrada (IND-DASH-105) aparece com o marco absoluto, sinalizado "sem
+  escada calibrada" ([UC-DASH-001] fluxo alternativo).
+- gap de dado do CETRAN (IND-DASH-103, sem `data_recebimento_cetran`) aparece como "sem leitura
+  — integração pendente", nunca como falso `SEM_RISCO`.
+- letras dos relógios são exclusivamente as do RAIT ([IU-DASH-001] §C.1, [AC-DASH-001-2]);
+  rótulos de `b`/`c` vêm de `dashboard.clocks`; `a`/`d` mostram só a letra (`OD-D16-007`).
+
+## 5. Estados
+
+- **vazio**: `dashboard.screens.radar_rait.empty` — nenhum caso acima de risco mínimo no
+  recorte.
+- **carregando**: `dashboard.states.loading`.
+- **erro**: `dashboard.states.error` + `dashboard.errors.<code>`.
+- **indisponível**: `INDISPONIVEL` oculta o número (bloco A, default de [WF-DASH-003]) — "sem
+  leitura desde `{as_of}` — fonte indisponível".
+- **desatualizado**: não se aplica por padrão (bloco A oculta em vez de marcar); só ocorre se o
+  painel for parametrizado fora do default.
+- **bloqueado por decisão**: não se aplica.
+
+## 6. Comandos
+
+- Nenhum comando de mutação. Ações: ver detalhe (drill-down N2 via `LayerGate`, formulário
+  `finalidade-n2`), filtrar por pool/circuito/unidade, deep-link ao dossiê no RAIT
+  ([RN-DASH-101]). Nenhum ato de negócio (declarar prescrição, julgar) nasce aqui.
+
+## 7. Saída
+
+- clique no card com finalidade declarada leva ao dossiê do processo no RAIT
+  ([JRN-DASH-002] passo 3); ao retornar, o card reflete o estado lido, sem exigir atualização
+  manual ([JRN-DASH-002] passo 6).
+
+## 8. Segurança e LGPD
+
+- N1 nos agregados; N2 (nº do processo) só sob `LayerGate` com finalidade registrada
+  ([RN-DASH-171]); N3 nunca.
+- gestor de área só no próprio domínio; divergência entre o relógio do painel e o do RAIT é
+  sempre incidente de dado do painel, nunca do RAIT ([RN-DASH-131] verificação 4).
+- risco processual (contagem de casos por relógio) é P2 no máximo, nunca P1
+  ([RN-DASH-142] verificação 6).
+
+## 9. Acessibilidade
+
+- severidade por forma + rótulo, nunca só cor; relógio governante identificado por letra visível
+  ([AC-DASH-001-1]).
+- base legal sempre ao lado do número, nunca número solto ([AC-DASH-001-5]).
+- `aria-live` na contagem por faixa.
+
+## 10. Testes
+
+- roteamento: 9 papéis (presença) e demais (ausência); N3 bloqueado.
+- os quatro relógios exibidos separadamente, menor tempo restante promovido a urgência
+  ([AC-DASH-001-1]); letras exclusivamente as do RAIT ([AC-DASH-001-2]).
+- estados vazio/carregando/erro/indisponível como critérios; selo de frescor em todo número
+  ([AC-DASH-001-6]).
+- N2 nunca aparece sem `LayerGate` ([C-01-09]).
+
+## Componentes compartilhados
+
+`FreshnessSeal`, `SeverityChip`, `ClockGovernorBadge`, `LegalBasisTag`, `LayerGate`,
+`DeepLinkButton`, `ClassificationBadge`.
+
+## Chaves i18n
+
+- `dashboard.screens.radar_rait.title` — "Radar de prescrição RAIT"
+- `dashboard.screens.radar_rait.intro` — "Casos por faixa de risco, relógio governante A/B/C/D
+  nomeado, base legal e tempo restante."
+- `dashboard.screens.radar_rait.empty` — "Nenhum caso em risco de prescrição no recorte atual."
+
+Referências (sem criar): `dashboard.states.*`, `dashboard.freshness.*`, `dashboard.severity.*`,
+`dashboard.clocks.*`, `dashboard.errors.*`, `dashboard.forms.finalidade_n2.*`, `dashboard.a11y.*`.
+
+OD tocada: `OD-D16-002` (política provisória), `OD-D16-007` (rótulos dos relógios a/d).
diff --git a/docs/framework/product/transversal/dashboard/screens/IU-DASH-D-04.md b/docs/framework/product/transversal/dashboard/screens/IU-DASH-D-04.md
new file mode 100644
index 00000000..c2bca656
--- /dev/null
+++ b/docs/framework/product/transversal/dashboard/screens/IU-DASH-D-04.md
@@ -0,0 +1,108 @@
+---
+id: IU-DASH-D-04
+title: Escada de prazos PEC — especificação de tela
+status: draft
+apps: [dashboard]
+sources: [REF-CONTRAN-927-2022, REF-CTB-147-148-habilitacao, REF-LEI-13709-2018]
+updated: 2026-09-21
+---
+
+Ficha da rota `/monitoramento/radar/pec` (`dashboard-frontends.md` §4, tela D-04; painel P-03
+de [IU-DASH-001]).
+Fontes: [UC-DASH-001], [JRN-DASH-007], [RN-DASH-130], [RN-DASH-132].
+
+## 1. Identidade
+
+- `id`: `IU-DASH-D-04`; `path`: `/monitoramento/radar/pec` (`route-manifest.md` #4).
+- `screen`: P-03 ("Escada de prazos da junta PEC" de [IU-DASH-001] §A).
+- camada de produto: Ação.
+- módulo: `radar`.
+- `slug`: `radar-pec`; segmento i18n: `radar_pec`.
+- página: `PecRadarPage`; componente inteligente principal: lista dos cinco prazos separados
+  ([RN-DASH-132]).
+
+## 2. Acesso
+
+- `policy`: `dashboard:alert:read` (prov., `OD-D16-002`).
+- `access`: N1; drill-down N2 via `LayerGate` (`route-manifest.md` §C linha D-04).
+- `roles` (presença): os 9 de `route-manifest.md` §D.
+- passe global: GESTOR_DETRAN via §E; ADMIN/SUPORTE bloqueados (`OD-D16-005`).
+- guardas: `authGuard` → `permissionGuard('dashboard:alert:read')` → `layerGuard('N1')`;
+  `LayerGate` no drill-down; gestor de área só no próprio domínio.
+
+## 3. Entrada
+
+- de onde se chega: menu Ação; deep-link de D-01 quando o item é PEC.
+- filtros de URL: pool/circuito/unidade; `dimension` quando aplicável.
+
+## 4. Dados
+
+- lê `GET alerts` filtrada por `app=pec` (`OD-D16-002`); projeção `dashboard.pec_deadlines`
+  (contrato §6, IND-DASH-106/107, 306…309).
+- cinco prazos separados, monitorados independentemente ([RN-DASH-132]): dois **preclusivos do
+  candidato** (requerer junta, 30 dias; recorrer ao CETRAN, 30 dias) e três **do órgão sem
+  sanção cominada** (designar junta, 15 dias úteis; junta decidir, 30 dias; remeter documentos,
+  20 dias úteis).
+- prazos do candidato aparecem rotulados "prazo do candidato, preclusivo" — sem botão de ação
+  ([JRN-DASH-007] passo 2, `dashboard-frontends.md` §2 invariante 7); os do órgão aparecem
+  rotulados como SLA legal sem sanção, conectados ao bloqueio de cadastro do candidato que
+  segue ativo ([JRN-DASH-007] passo 3).
+- 3ª instância (Junta Especial de Saúde): sem prazo numérico localizado — estado "sem prazo
+  legal localizado" como valor de primeira classe ([JRN-DASH-007] passo 6; [RN-DASH-132]).
+- selo de frescor + `asOf` em todo número; nenhum cálculo de dia útil no cliente.
+
+## 5. Estados
+
+- **vazio**: `dashboard.screens.radar_pec.empty`.
+- **carregando** / **erro** / **indisponível** / **desatualizado**: idênticos ao padrão de M4
+  (bloco A oculta por default).
+- **bloqueado por decisão**: não se aplica.
+
+## 6. Comandos
+
+- Nenhum comando de mutação; nenhum botão nos cards de prazo do candidato — só informação
+  ([JRN-DASH-007] passo 2). Ações: ver, filtrar, deep-link ao dossiê no PEC.
+
+## 7. Saída
+
+- deep-link ao PEC para os prazos do órgão (designar, decidir, remeter — ação real acontece lá);
+  nenhuma ação a partir daqui sobre o relógio do candidato.
+
+## 8. Segurança e LGPD
+
+- N1 nos agregados; N2 (identificação do caso) só sob `LayerGate`; nenhum dado clínico no painel
+  (`RN-DASH-132` verificação 3 — o DASHBOARD monitora estados e prazos, nunca resultado,
+  diagnóstico ou justificativa clínica; ver [RN-DASH-162]).
+- composição da junta "não instrumentado" até o PEC produzir o dado — nunca conformidade
+  presumida.
+
+## 9. Acessibilidade
+
+- rótulo distinto para prazo do candidato ("preclusivo") e prazo do órgão ("sem sanção
+  expressa"), nunca no mesmo componente sem distinção ([JRN-DASH-007] passo 1).
+- severidade por forma + rótulo; `aria-live` na contagem por instância.
+
+## 10. Testes
+
+- roteamento: 9 papéis (presença) e demais (ausência); N3 bloqueado.
+- os cinco prazos distinguidos, nenhum card confunde tipo de prazo ([AC-DASH-001-7]).
+- 3ª instância exibida como "sem prazo legal localizado", nunca contador ausente.
+- os seis estados aplicáveis como critérios.
+
+## Componentes compartilhados
+
+`FreshnessSeal`, `SeverityChip`, `LegalBasisTag`, `LayerGate`, `DeepLinkButton`,
+`ClassificationBadge`.
+
+## Chaves i18n
+
+- `dashboard.screens.radar_pec.title` — "Escada de prazos PEC"
+- `dashboard.screens.radar_pec.intro` — "Cinco prazos separados; prazo do candidato (preclusivo)
+  distinto do prazo do órgão."
+- `dashboard.screens.radar_pec.empty` — "Nenhum episódio de revisão em risco no recorte atual."
+
+Referências (sem criar): `dashboard.states.*`, `dashboard.freshness.*`, `dashboard.severity.*`,
+`dashboard.errors.*`, `dashboard.common.fixed.candidate_deadline_preclusive`,
+`dashboard.forms.finalidade_n2.*`, `dashboard.a11y.*`.
+
+OD tocada: `OD-D16-002` (política provisória).
diff --git a/docs/framework/product/transversal/dashboard/screens/IU-DASH-D-05.md b/docs/framework/product/transversal/dashboard/screens/IU-DASH-D-05.md
new file mode 100644
index 00000000..6a995ee6
--- /dev/null
+++ b/docs/framework/product/transversal/dashboard/screens/IU-DASH-D-05.md
@@ -0,0 +1,102 @@
+---
+id: IU-DASH-D-05
+title: Radar TEAT — especificação de tela
+status: draft
+apps: [dashboard]
+sources: [REF-SENATRAN-997, REF-CONTRAN-1025-2026, REF-CTB-280-290]
+updated: 2026-09-21
+---
+
+Ficha da rota `/monitoramento/radar/teat` (`dashboard-frontends.md` §4, tela D-05; tela de apoio
+— sem `P-nn` próprio em [IU-DASH-001]).
+Fontes: [RN-DASH-130], [RN-DASH-134].
+
+## 1. Identidade
+
+- `id`: `IU-DASH-D-05`; `path`: `/monitoramento/radar/teat` (`route-manifest.md` #5).
+- `screen`: tela de apoio (sem painel P-nn dedicado; [IU-DASH-001] não tem painel TEAT —
+  `route-manifest.md` §G nota 4).
+- camada de produto: Ação.
+- módulo: `radar`.
+- `slug`: `radar-teat`; segmento i18n: `radar_teat`.
+- página: `TeatRadarPage`; componente inteligente principal: lista por família de vigilância
+  ([RN-DASH-134]).
+
+## 2. Acesso
+
+- `policy`: `dashboard:alert:read` (prov., `OD-D16-002`).
+- `access`: N1; drill-down N2 via `LayerGate`.
+- `roles` (presença): os 9 de `route-manifest.md` §D.
+- passe global: GESTOR_DETRAN via §E; ADMIN/SUPORTE bloqueados (`OD-D16-005`).
+- guardas: `authGuard` → `permissionGuard('dashboard:alert:read')` → `layerGuard('N1')`.
+
+## 3. Entrada
+
+- de onde se chega: menu Ação; deep-link de D-01 quando o item é TEAT.
+- filtros de URL: pool/circuito/unidade.
+
+## 4. Dados
+
+- lê `GET alerts` filtrada por `app=teat` (`OD-D16-002`); projeção `dashboard.teat_measures`
+  (contrato §6, IND-DASH-108…111, 311…314).
+- cinco famílias de vigilância do TEAT ([RN-DASH-134]): homologação SENATRAN do software
+  (renovação a cada 4 anos), verificação metrológica (12 meses), sessão exclusiva do agente
+  (bloqueio, não alerta — o registro concorrente não deve ser processado, apuração obrigatória
+  pela autoridade), integridade e trilha do talão, prazos de custódia (T-REG30/T-REG15, marco
+  fixo T-SNE2027, comparecimento 5 dias, notificação 10 dias, depósito 6 meses).
+- o objeto da vigilância é precondição de validade com data de expiração, não prazo processual
+  ([RN-DASH-134]): o risco é produzir em massa atos inválidos sem perceber.
+- selo de frescor + `asOf` em todo número; percentual de AIT lavrados sob equipamento/versão com
+  validade comprovada é o indicador-síntese do módulo.
+
+## 5. Estados
+
+- **vazio**: `dashboard.screens.radar_teat.empty`.
+- **carregando** / **erro** / **indisponível** / **desatualizado**: padrão M4.
+- **bloqueado por decisão**: não se aplica.
+
+## 6. Comandos
+
+- Nenhum comando de mutação; nenhuma ação corretiva a partir do painel ([RN-DASH-134]
+  verificação 3): interditar aparelho, cancelar AIT, liberar retenção e abrir apuração são atos
+  do TEAT (`agency-admin`, `traffic-authority`), praticados lá. Ações: ver, filtrar, deep-link.
+
+## 7. Saída
+
+- deep-link ao TEAT para a correção (renovar certificado, corrigir homologação); registro
+  concorrente aparece bloqueado, com evidência de apuração aberta ([RN-DASH-134] verificação 3).
+
+## 8. Segurança e LGPD
+
+- N1 nos agregados; N2 (equipamento/AIT específico) só sob `LayerGate`; N3 nunca — bodycam:
+  disponibilidade e integridade monitoradas, jamais conteúdo ([RN-DASH-134] verificação 4,
+  [RN-DASH-170]).
+
+## 9. Acessibilidade
+
+- severidade por forma + rótulo; famílias 1/2 com alerta por antecedência (D-90/D-30/D-7/vencido)
+  legível por leitor de tela, não só cor.
+
+## 10. Testes
+
+- roteamento: 9 papéis (presença) e demais (ausência); N3 bloqueado.
+- as cinco famílias distinguidas; sessão concorrente exibida como bloqueio com apuração aberta,
+  nunca como "resolvido" (ligado a [AC-DASH-006-3]).
+- os seis estados aplicáveis como critérios.
+
+## Componentes compartilhados
+
+`FreshnessSeal`, `SeverityChip`, `LegalBasisTag`, `LayerGate`, `DeepLinkButton`,
+`ClassificationBadge`.
+
+## Chaves i18n
+
+- `dashboard.screens.radar_teat.title` — "Radar TEAT"
+- `dashboard.screens.radar_teat.intro` — "Homologação SENATRAN, verificação metrológica, sessão
+  exclusiva, integridade do talão e prazos de custódia."
+- `dashboard.screens.radar_teat.empty` — "Nenhum item de vigilância do TEAT em alerta."
+
+Referências (sem criar): `dashboard.states.*`, `dashboard.freshness.*`, `dashboard.severity.*`,
+`dashboard.errors.*`, `dashboard.forms.finalidade_n2.*`, `dashboard.a11y.*`.
+
+OD tocada: `OD-D16-002` (política provisória).
diff --git a/docs/framework/product/transversal/dashboard/screens/IU-DASH-D-06.md b/docs/framework/product/transversal/dashboard/screens/IU-DASH-D-06.md
new file mode 100644
index 00000000..1910165b
--- /dev/null
+++ b/docs/framework/product/transversal/dashboard/screens/IU-DASH-D-06.md
@@ -0,0 +1,98 @@
+---
+id: IU-DASH-D-06
+title: Saúde técnica — especificação de tela
+status: draft
+apps: [dashboard]
+sources: [REF-CONTRAN-808-2020, REF-CTB-sinistro-cena-renaest]
+updated: 2026-09-21
+---
+
+Ficha da rota `/monitoramento/integracoes` (`dashboard-frontends.md` §4, tela D-06; painel P-04
+de [IU-DASH-001]).
+Fontes: [UC-DASH-006], [JRN-DASH-001], [JRN-DASH-004], [RN-DASH-130], [RN-DASH-133].
+
+## 1. Identidade
+
+- `id`: `IU-DASH-D-06`; `path`: `/monitoramento/integracoes` (`route-manifest.md` #6).
+- `screen`: P-04 ("Saúde técnica de integrações" de [IU-DASH-001] §A).
+- camada de produto: Ação/Técnico (valor composto da §4).
+- módulo: `integrations`.
+- `slug`: `integracoes`; segmento i18n: `integracoes`.
+- página: `IntegrationHealthPage`; componente inteligente principal: `SourceStatusTable`.
+
+## 2. Acesso
+
+- `policy`: `dashboard:source:read` (`policy.ts`, contrato §4 `GET sources`).
+- `access`: N1 — "idade do lote mais antigo", filas e lag são "idade de fila, backlog"
+  ([RN-DASH-170] linha N1; `route-manifest.md` §C linha D-06); sem conteúdo de domínio.
+- `roles` (presença): `technical-admin`, `integration-operator`, `dash-operator`, AUDITOR (4).
+  Todos os demais → sem-permissão.
+- passe global: nenhuma mudança — `technical-admin` já está na matriz; GESTOR_DETRAN via §E
+  (não na matriz, `route-manifest.md` §E); ADMIN/SUPORTE bloqueados pela camada.
+- guardas: `authGuard` → `permissionGuard('dashboard:source:read')` → `layerGuard('N1')`.
+
+## 3. Entrada
+
+- de onde se chega: menu Ação/Técnico; deep-link de D-01 quando o item de triagem é técnico
+  ([JRN-DASH-001] passo 5); [JRN-DASH-004] passo 1.
+- filtros de URL: por sistema/painel.
+
+## 4. Dados
+
+- lê `GET sources` (contrato §4): frescor por fonte/painel, heartbeat, latência aceitável.
+- projeção `dashboard.integration_health` (contrato §6, IND-DASH-401…403, 408): outbox lag,
+  fila offline (idade do lote mais antigo), adapter por sistema nacional (latência p95, erro),
+  custódia, pacotes normativos, faixas, homologação de dispositivo, disponibilidade por painel.
+- selo de frescor + `asOf` em cada fonte; nenhum cálculo de latência no cliente.
+- SSE `source.freshness`, `integration.health` atualizam a tabela; fallback de polling 30 s.
+
+## 5. Estados
+
+- **vazio**: `dashboard.screens.integracoes.empty`.
+- **carregando** / **erro**: padrão M4.
+- **indisponível**: `INDISPONIVEL` marca a fonte (bloco D marca, nunca oculta —
+  [WF-DASH-003] §Duas estratégias, "marcar" para saúde técnica).
+- **desatualizado**: `DESATUALIZADO_MARCADO`, "desde `{as_of}`".
+- **bloqueado por decisão**: não se aplica.
+
+## 6. Comandos
+
+- Nenhum comando de mutação nesta tela (registrar causa raiz vive em D-07). Ações: ver, filtrar,
+  deep-link a D-07 para detalhe da fonte, encaminhar à administração técnica
+  ([JRN-DASH-004] passo 1).
+
+## 7. Saída
+
+- clique numa fonte navega a D-07 (`/monitoramento/integracoes/:system`); a saúde reflete a
+  normalização via SSE após a correção na infraestrutura real ([JRN-DASH-004] passo 4).
+
+## 8. Segurança e LGPD
+
+- N1, sem conteúdo de domínio ([RN-DASH-170] linha N1 — administração técnica "sem conteúdo de
+  domínio"); nenhum registro individual de caso exibido.
+- nada sensível em URL/log.
+
+## 9. Acessibilidade
+
+- severidade por forma + rótulo; `aria-live` na fila/lag, que muda via SSE.
+
+## 10. Testes
+
+- roteamento: 4 papéis (presença) e demais (ausência); N3 bloqueado (não se aplica dado de
+  domínio).
+- os seis estados aplicáveis (bloqueado por decisão não se aplica) como critérios; ligados a
+  [AC-DASH-006-1] (frescor antes de agir).
+
+## Componentes compartilhados
+
+`FreshnessSeal`, `SourceStatusTable`, `SeverityChip`, `DeepLinkButton`.
+
+## Chaves i18n
+
+- `dashboard.screens.integracoes.title` — "Saúde técnica"
+- `dashboard.screens.integracoes.intro` — "Outbox lag, fila offline, adapter por sistema
+  nacional, custódia e disponibilidade por painel."
+- `dashboard.screens.integracoes.empty` — "Nenhuma fonte em alerta técnico."
+
+Referências (sem criar): `dashboard.states.*`, `dashboard.freshness.*`, `dashboard.severity.*`,
+`dashboard.errors.*`, `dashboard.a11y.*`.
diff --git a/docs/framework/product/transversal/dashboard/screens/IU-DASH-D-07.md b/docs/framework/product/transversal/dashboard/screens/IU-DASH-D-07.md
new file mode 100644
index 00000000..81c89725
--- /dev/null
+++ b/docs/framework/product/transversal/dashboard/screens/IU-DASH-D-07.md
@@ -0,0 +1,100 @@
+---
+id: IU-DASH-D-07
+title: Detalhe da integração — especificação de tela
+status: draft
+apps: [dashboard]
+sources: [REF-SENATRAN-997, REF-CONTRAN-1025-2026]
+updated: 2026-09-21
+---
+
+Ficha da rota `/monitoramento/integracoes/:system` (`dashboard-frontends.md` §4, tela D-07; tela
+de apoio, drill-down de P-04).
+Fontes: [JRN-DASH-004], [RN-DASH-134].
+
+## 1. Identidade
+
+- `id`: `IU-DASH-D-07`; `path`: `/monitoramento/integracoes/:system` (`route-manifest.md` #7).
+- `screen`: tela de apoio (drill-down de P-04; sem `P-nn` próprio).
+- camada de produto: Técnico.
+- módulo: `integrations`.
+- `slug`: `integracoes-system`; segmento i18n: `integracoes_system`.
+- página: `IntegrationDetailPage`; componente inteligente principal: painel de causa provável
+  (transporte × aceite × conteúdo, [JRN-DASH-004] passo 2).
+
+## 2. Acesso
+
+- `policy`: `dashboard:source:read`.
+- `access`: N1 — detalhe da mesma fonte (contrato §4 `GET sources/{id}`); itens isolados são
+  registros de integração, não objetos de processo (`route-manifest.md` §C linha D-07).
+- `roles` (presença): `technical-admin`, `integration-operator`, `dash-operator`, AUDITOR (4).
+- passe global: GESTOR_DETRAN via §E; ADMIN/SUPORTE bloqueados.
+- guardas: `authGuard` → `permissionGuard('dashboard:source:read')` → `layerGuard('N1')`.
+
+## 3. Entrada
+
+- de onde se chega: clique numa fonte em D-06 ([JRN-DASH-004] passo 1).
+- parâmetros de rota: `:system`.
+
+## 4. Dados
+
+- lê `GET sources/{id}` (contrato §4): triagem transporte × aceite × conteúdo, causa raiz, itens
+  isolados, telas dependentes marcadas desatualizadas.
+- distingue três categorias de falha ([JRN-DASH-004] passo 2): falha de transporte (canal fora
+  do ar), falha de aceite no destino, falha de conteúdo (payload malformado de subconjunto).
+- selo de frescor + `asOf`; enquanto a fila estava travada, qualquer tela dependente mostra
+  "dado desatualizado desde `{as_of}`" ([JRN-DASH-004] passo 6).
+- um item PEC isolado por payload malformado reaparece isolado mesmo com a fila zerada, sem
+  fechar junto com o resto ([JRN-DASH-004] passo 5).
+
+## 5. Estados
+
+- **vazio**: `dashboard.screens.integracoes_system.empty`.
+- **carregando** / **erro**: padrão M4.
+- **indisponível** / **desatualizado**: idênticos a D-06, por fonte.
+- **bloqueado por decisão**: não se aplica.
+
+## 6. Comandos
+
+| Rota (contrato §2)            | Ação       | Papel                                     | Pré-estado | Payload                                                     | Pós-estado     | Erro esperado                      |
+| ----------------------------- | ---------- | ----------------------------------------- | ---------- | ----------------------------------------------------------- | -------------- | ---------------------------------- |
+| `POST alerts/{id}/root-cause` | `annotate` | `technical-admin`, `integration-operator` | qualquer   | `{ category: transport\|acceptance\|payload, description }` | nota na trilha | `DASH.ROOT_CAUSE_CATEGORY_INVALID` |
+
+- Registrar causa raiz anexa nota ao alerta ([JRN-DASH-004] passo 7); não altera o app de
+  origem; alimenta o indicador de saúde técnica e a trilha que o auditor pode reconstruir
+  ([UC-DASH-004]).
+
+## 7. Saída
+
+- a correção acontece na infraestrutura real, fora do DASHBOARD ([JRN-DASH-004] passo 4); a
+  fila baixa em tempo real via SSE conforme os `ERROR` reprocessam; item isolado permanece
+  visível até resolução individual.
+
+## 8. Segurança e LGPD
+
+- N1, sem conteúdo clínico ([JRN-DASH-004] passo 1: "sem raio-x de dados clínicos que não são
+  da alçada" do técnico); nenhum registro individual de caso exposto além do necessário ao
+  diagnóstico técnico.
+
+## 9. Acessibilidade
+
+- categorias de falha distinguidas por rótulo, não só cor; `aria-live` na fila que baixa via SSE.
+
+## 10. Testes
+
+- roteamento: 4 papéis (presença) e demais (ausência); N3 bloqueado.
+- `root-cause` exige categoria válida ([DASH.ROOT_CAUSE_CATEGORY_INVALID]); item isolado nunca
+  fecha silenciosamente junto com o agregado ([JRN-DASH-004] métricas de sucesso).
+
+## Componentes compartilhados
+
+`FreshnessSeal`, `SourceStatusTable`, `DeepLinkButton`.
+
+## Chaves i18n
+
+- `dashboard.screens.integracoes_system.title` — "Detalhe da integração"
+- `dashboard.screens.integracoes_system.intro` — "Triagem transporte × aceite × conteúdo, causa
+  raiz e itens isolados da fonte."
+- `dashboard.screens.integracoes_system.empty` — "Nenhum item pendente nesta fonte."
+
+Referências (sem criar): `dashboard.states.*`, `dashboard.freshness.*`, `dashboard.errors.*`,
+`dashboard.forms.causa_raiz.*`, `dashboard.a11y.*`.
diff --git a/docs/framework/product/transversal/dashboard/screens/IU-DASH-D-08.md b/docs/framework/product/transversal/dashboard/screens/IU-DASH-D-08.md
new file mode 100644
index 00000000..8b424c86
--- /dev/null
+++ b/docs/framework/product/transversal/dashboard/screens/IU-DASH-D-08.md
@@ -0,0 +1,110 @@
+---
+id: IU-DASH-D-08
+title: Deveres periódicos — especificação de tela
+status: draft
+apps: [dashboard]
+sources:
+  [
+    REF-CONTRAN-918,
+    REF-CONTRAN-808-2020,
+    REF-LEI-13460-2017,
+    REF-LEI-12527-2011,
+  ]
+updated: 2026-09-21
+---
+
+Ficha da rota `/monitoramento/deveres` (`dashboard-frontends.md` §4, tela D-08; painel P-05 de
+[IU-DASH-001]).
+Fontes: [UC-DASH-003], [UC-DASH-008], [JRN-DASH-003], [RN-DASH-113], [RN-DASH-120].
+
+## 1. Identidade
+
+- `id`: `IU-DASH-D-08`; `path`: `/monitoramento/deveres` (`route-manifest.md` #8).
+- `screen`: P-05 ("Catálogo e calendário de deveres periódicos" de [IU-DASH-001] §A).
+- camada de produto: Ação/Vigilância (valor composto da §4).
+- módulo: `duties`.
+- `slug`: `deveres`; segmento i18n: `deveres`.
+- página: `DutyCalendarPage`; componente inteligente principal: `DutyCalendar`.
+
+## 2. Acesso
+
+- `policy`: `dashboard:duty:read` (contrato §3, "todos autenticados (N0)").
+- `access`: N0 — 14 linhas institucionais ([RN-DASH-120]; `route-manifest.md` §C linha D-08).
+- `roles` (presença): N0-ROLES (34 — DETRAN_ROLES menos CANDIDATO e CIDADAO).
+- passe global: sem efeito adicional — N0-ROLES já inclui GESTOR_DETRAN, ADMIN e SUPORTE.
+- guardas: `authGuard` → `permissionGuard('dashboard:duty:read')` → `layerGuard('N0')`.
+
+## 3. Entrada
+
+- de onde se chega: menu Ação/Vigilância; alcançável por qualquer papel autenticado.
+- filtros de URL: por dever, por estado do ciclo.
+
+## 4. Dados
+
+- lê `GET duties` (contrato §3): as 14 linhas de [RN-DASH-120] com ciclo corrente; distingue as
+  **9 indicadores do bloco B** do catálogo ([APP-DASHBOARD] §Catálogo) das **14 linhas da
+  tabela-mestra** ([RN-DASH-120] — inclui SLA e Pnatrans; `dashboard-build-pack.md` §5
+  inconsistência 4) — os dois conjuntos são nomeados separadamente na tela.
+- projeção `dashboard.duty_evidence` (contrato §6).
+- 10 das 14 linhas têm prazo numérico explícito ([RN-DASH-120] "leitura honesta"); as demais
+  aparecem em seção separada "sem prazo definido", nunca misturadas com as de data certa
+  ([UC-DASH-008] fluxo alternativo).
+- deveres sem relógio vigente (204, 205, 208) exibem "sem prazo definido"
+  ([RN-DASH-113]; `dashboard-frontends.md` M4).
+- dever com sanção automática (202) recebe destaque visual permanente, mesmo antes de
+  `ATRASADO` ([UC-DASH-008] fluxo alternativo).
+- estado atual de cada ciclo: `JANELA_ABERTA`, `EM_APURACAO`, `PREPARADO`,
+  `SUBMETIDO_PUBLICADO`, `COMPROVADO`, `ARQUIVADO`, `ATRASADO`, `NAO_CUMPRIDO` ([WF-DASH-002]).
+- dever próprio × derivado declarado como atributo ([AC-DASH-003-4]); selo de frescor em toda
+  contagem.
+
+## 5. Estados
+
+- **vazio**: `dashboard.screens.deveres.empty`.
+- **carregando** / **erro** / **indisponível** / **desatualizado**: padrão M4 (bloco B marca em
+  vez de ocultar, [WF-DASH-003] §Duas estratégias).
+- **bloqueado por decisão**: não se aplica.
+
+## 6. Comandos
+
+- Nenhum comando de mutação nesta tela — os comandos de avanço de ciclo vivem em D-09. Ações:
+  ver calendário, filtrar, acionar o dono diretamente antecipando o alerta automático
+  ([UC-DASH-008] passo 3).
+
+## 7. Saída
+
+- clique num dever navega a D-09 (`/monitoramento/deveres/:id/ciclos/:period`).
+
+## 8. Segurança e LGPD
+
+- N0 — agregado institucional, sem dado pessoal; qualquer papel autenticado acessa.
+- classificação P1/P2/P3 do dever como atributo visível.
+
+## 9. Acessibilidade
+
+- "sem prazo definido" como valor de primeira classe, nunca ausência silenciosa
+  (`dashboard-frontends.md` §9); os dois conjuntos ("9 indicadores do bloco B" e "14 linhas da
+  tabela-mestra") nomeados com rótulo textual, não só numérico.
+- `aria-live` no estado do ciclo corrente.
+
+## 10. Testes
+
+- roteamento: N0-ROLES (34, presença) e CANDIDATO/CIDADAO (ausência) → sem-permissão; N3
+  bloqueado.
+- as 14 linhas exibidas, distinguindo as 10 com prazo numérico ([AC-DASH-008-1]); dever sem
+  relógio vigente exibido, nunca silenciado ([AC-DASH-008-2]).
+- os seis estados aplicáveis como critérios.
+
+## Componentes compartilhados
+
+`FreshnessSeal`, `DutyCalendar`, `SeverityChip`, `ClassificationBadge`, `DeepLinkButton`.
+
+## Chaves i18n
+
+- `dashboard.screens.deveres.title` — "Deveres periódicos"
+- `dashboard.screens.deveres.intro` — "14 linhas da tabela-mestra em calendário e lista; estado
+  do ciclo corrente."
+- `dashboard.screens.deveres.empty` — "Nenhum dever com ciclo aberto."
+
+Referências (sem criar): `dashboard.states.*`, `dashboard.freshness.*`, `dashboard.duty_states.*`,
+`dashboard.errors.*`, `dashboard.common.fixed.no_deadline_defined`, `dashboard.a11y.*`.
diff --git a/docs/framework/product/transversal/dashboard/screens/IU-DASH-D-09.md b/docs/framework/product/transversal/dashboard/screens/IU-DASH-D-09.md
new file mode 100644
index 00000000..aa34fa89
--- /dev/null
+++ b/docs/framework/product/transversal/dashboard/screens/IU-DASH-D-09.md
@@ -0,0 +1,108 @@
+---
+id: IU-DASH-D-09
+title: Ciclo do dever — especificação de tela
+status: draft
+apps: [dashboard]
+sources: [REF-CONTRAN-918, REF-LEI-13709-2018]
+updated: 2026-09-21
+---
+
+Ficha da rota `/monitoramento/deveres/:id/ciclos/:period` (`dashboard-frontends.md` §4, tela
+D-09; tela de apoio, drill-down de P-05).
+Fontes: [UC-DASH-003], [JRN-DASH-003], [RN-DASH-113], [RN-DASH-120], [RN-DASH-135].
+
+## 1. Identidade
+
+- `id`: `IU-DASH-D-09`; `path`: `/monitoramento/deveres/:id/ciclos/:period`
+  (`route-manifest.md` #9).
+- `screen`: tela de apoio (drill-down de P-05; sem `P-nn` próprio).
+- camada de produto: Ação.
+- módulo: `duties`.
+- `slug`: `deveres-id-ciclos-period`; segmento i18n: `deveres_id_ciclos_period`.
+- página: `DutyCyclePage`; componente inteligente principal: `DutyCycleStepper`.
+
+## 2. Acesso
+
+- `policy`: `dashboard:duty-cycle:read` (contrato §3, N0).
+- `access`: N0 — avançar o ciclo é permissão de comando (`duty-cycle:start…archive`), não
+  camada (`route-manifest.md` §C linha D-09).
+- `roles` (presença): N0-ROLES (34).
+- passe global: sem efeito adicional.
+- guardas: `authGuard` → `permissionGuard('dashboard:duty-cycle:read')` → `layerGuard('N0')`.
+
+## 3. Entrada
+
+- de onde se chega: clique num dever em D-08.
+- parâmetros de rota: `:id` (dever), `:period` (competência).
+
+## 4. Dados
+
+- lê `GET duties/{id}/cycles/{period}` (contrato §3): histórico do ciclo.
+- estado do ciclo: `JANELA_ABERTA → EM_APURACAO → PREPARADO → SUBMETIDO_PUBLICADO → COMPROVADO →
+ARQUIVADO`, com desvios `ATRASADO`/`NAO_CUMPRIDO` ([WF-DASH-002]).
+- evidência anexada (protocolo, captura, hash) exibida por transição ([AC-DASH-003-1]:
+  "cumprido é comprovado, nunca marcado" — `SUBMETIDO_PUBLICADO` não é `COMPROVADO` sem
+  evidência).
+- deveres 204/205/208 exibem "sem prazo definido" ([RN-DASH-113]); dever com sanção automática
+  (202) mantém rótulo de risco de suspensão mesmo antes de `ATRASADO`.
+- histórico de atrasos por ciclo anterior, sem herdar o histórico como desculpa
+  ([JRN-DASH-003] passo 6).
+
+## 5. Estados
+
+- **vazio**: `dashboard.screens.deveres_id_ciclos_period.empty`.
+- **carregando** / **erro** / **indisponível** / **desatualizado**: padrão M4.
+- **bloqueado por decisão**: não se aplica.
+- **conflito** (409/412): `DASH.DUTY_STATE_INVALID`, `DASH.DUTY_ALREADY_ARCHIVED`.
+
+## 6. Comandos
+
+| Rota (contrato §3)                       | Ação      | Papel                             | Pré-estado              | Payload                                          | Pós-estado            | Erro esperado                                                    |
+| ---------------------------------------- | --------- | --------------------------------- | ----------------------- | ------------------------------------------------ | --------------------- | ---------------------------------------------------------------- |
+| `POST duties/{id}/cycles/{period}/start` | `start`   | `dash-duty-owner`, `agency-admin` | `JANELA_ABERTA`         | —                                                | `EM_APURACAO`         | `DASH.DUTY_STATE_INVALID`                                        |
+| `POST …/prepare`                         | `prepare` | idem                              | `EM_APURACAO`           | `{ draftRef? }`                                  | `PREPARADO`           | idem                                                             |
+| `POST …/submit`                          | `submit`  | idem                              | `PREPARADO`, `ATRASADO` | `{ submittedAt, protocol? }`                     | `SUBMETIDO_PUBLICADO` | idem                                                             |
+| `POST …/prove`                           | `prove`   | idem                              | `SUBMETIDO_PUBLICADO`   | `{ evidence: { protocol?, captureUri?, hash } }` | `COMPROVADO`          | `DASH.DUTY_EVIDENCE_REQUIRED`, `DASH.DUTY_EVIDENCE_HASH_INVALID` |
+| `POST …/archive`                         | `archive` | `dash-operator`, `agency-admin`   | `COMPROVADO`            | —                                                | `ARQUIVADO`           | `DASH.DUTY_ALREADY_ARCHIVED`                                     |
+
+- `If-Match` em todas as transições. Nenhum comando altera dado fora do próprio acervo de
+  deveres do DASHBOARD ([RN-DASH-101]). `prove` exige protocolo/captura/hash completos
+  ([AC-DASH-003-1]).
+
+## 7. Saída
+
+- após `archive`, o ciclo permanece visível em D-08 no histórico; o calendário de D-08 reflete
+  o novo período aberto.
+
+## 8. Segurança e LGPD
+
+- N0 — sem dado pessoal; `DASH.DUTY_NOT_OWNER` quando quem avança não é dono do dever
+  ([AC-DASH-002 análogo, UC-DASH-003]).
+
+## 9. Acessibilidade
+
+- estágios do `DutyCycleStepper` com rótulo textual, não só posição visual; "sem prazo definido"
+  como valor de primeira classe (D-08/D-09).
+
+## 10. Testes
+
+- roteamento: N0-ROLES (presença) e CANDIDATO/CIDADAO (ausência); N3 bloqueado.
+- transições respeitam pré-estado ([WF-DASH-002]); `prove` sem evidência completa falha
+  ([AC-DASH-003-1]); ligados a [AC-DASH-003-2] (relógio do FUNSET) e [AC-DASH-003-3] (sanção
+  expressa do IND-DASH-202).
+
+## Componentes compartilhados
+
+`DutyCycleStepper`, `EvidenceAttach`, `FreshnessSeal`, `DeepLinkButton`.
+
+## Chaves i18n
+
+- `dashboard.screens.deveres_id_ciclos_period.title` — "Ciclo do dever"
+- `dashboard.screens.deveres_id_ciclos_period.intro` — "Janela de apuração até arquivamento,
+  com evidência de cumprimento anexada."
+- `dashboard.screens.deveres_id_ciclos_period.empty` — "Nenhum ciclo aberto para este dever e
+  período."
+
+Referências (sem criar): `dashboard.states.*`, `dashboard.freshness.*`, `dashboard.duty_states.*`,
+`dashboard.errors.*`, `dashboard.common.fixed.no_deadline_defined`,
+`dashboard.forms.avancar_ciclo.*`, `dashboard.a11y.*`.
diff --git a/docs/framework/product/transversal/dashboard/screens/IU-DASH-D-10.md b/docs/framework/product/transversal/dashboard/screens/IU-DASH-D-10.md
new file mode 100644
index 00000000..8d013c66
--- /dev/null
+++ b/docs/framework/product/transversal/dashboard/screens/IU-DASH-D-10.md
@@ -0,0 +1,120 @@
+---
+id: IU-DASH-D-10
+title: Comparativo — especificação de tela
+status: draft
+apps: [dashboard]
+sources: [REF-LEI-13709-2018, REF-SENATRAN-PORTARIA-139-2025]
+updated: 2026-09-21
+---
+
+Ficha da rota `/monitoramento/comparativo` (`dashboard-frontends.md` §4, tela D-10; painel P-06
+de [IU-DASH-001]).
+Fontes: [UC-DASH-005], [JRN-DASH-006], [RN-DASH-142], [RN-DASH-160], [RN-DASH-161].
+
+## 1. Identidade
+
+- `id`: `IU-DASH-D-10`; `path`: `/monitoramento/comparativo` (`route-manifest.md` #10).
+- `screen`: P-06 ("Comparativo de unidades e circuitos" de [IU-DASH-001] §A).
+- camada de produto: Vigilância.
+- módulo: `comparison`.
+- `slug`: `comparativo`; segmento i18n: `comparativo`.
+- página: `ComparisonPage`; componente inteligente principal: `DistributionChart` (distribuição
+  antes de qualquer ranking nomeado — [dashboard-frontends.md] §2 invariante 8).
+
+## 2. Acesso
+
+- `policy`: `dashboard:comparison:read` (contrato §4 `GET comparisons`).
+- `access`: N1 — distribuição por pool/circuito/unidade/clínica é agregado por fila
+  (`route-manifest.md` §C linha D-10); indicador individual nomeado só em N2 com finalidade.
+- `roles` (presença): `agency-admin`, AREA-MANAGERS, `bi-analyst`, AUDITOR (8).
+- passe global: `technical-admin` e GESTOR_DETRAN alcançam via §E (não estão na matriz) —
+  divergência com [RN-DASH-170] verificação 3, `OD-D16-005`.
+- guardas: `authGuard` → `permissionGuard('dashboard:comparison:read')` → `layerGuard('N1')`;
+  `LayerGate` para indicador individual nomeado (N2, `X-Purpose`).
+
+## 3. Entrada
+
+- de onde se chega: menu Vigilância; deep-link de investigação a partir de uma unidade
+  destacada.
+- filtros de URL: `dimension: pool|circuit|unit|clinic` (contrato §4).
+
+## 4. Dados
+
+- lê `GET comparisons` (contrato §4): agregados com supressão de célula.
+- projeções `dashboard.production`, `dashboard.prescription_risk` (contrato §6): distribuição do
+  acervo por faixa de risco, % dentro da meta (IND-DASH-304/305), MTTA/MTTR ([WF-DASH-001]), %
+  de deveres cumpridos ([WF-DASH-002]).
+- a tela nunca abre em ranking — distribuição primeiro ([JRN-DASH-006] passo 1); detalhe por
+  unidade vem com contexto (volume, rotatividade), nunca o número isolado ([JRN-DASH-006]
+  passo 2); produtividade nunca aparece sozinha, sempre pareada com qualidade
+  ([JRN-DASH-006] passo 3).
+- meta operacional (bloco C) e teto legal (bloco A) nunca na mesma métrica, em colunas/seções
+  distintas ([UC-DASH-005] fluxo alternativo; `TargetVsCeiling`).
+- grupo com fonte parcialmente conectada: "comparação parcial — indicador X sem fonte
+  conectada", nunca completa com zero implícito ([UC-DASH-005] fluxo alternativo).
+- célula abaixo do limiar (`dashboard.cell_threshold = 10`) suprimida, com supressão secundária,
+  nunca zero ([RN-DASH-161]; [AC-DASH-005-1]).
+- selo de frescor + `asOf` em todo número; classificação P1/P2/P3 antes de exibir.
+
+## 5. Estados
+
+- **vazio**: `dashboard.screens.comparativo.empty`.
+- **carregando** / **erro** / **indisponível** / **desatualizado**: padrão M4.
+- **bloqueado por decisão**: não se aplica.
+
+## 6. Comandos
+
+| Rota (contrato §4) | Ação     | Papel        | Payload                                      | Efeito                            | Erro esperado                                                                                       |
+| ------------------ | -------- | ------------ | -------------------------------------------- | --------------------------------- | --------------------------------------------------------------------------------------------------- |
+| `POST exports`     | `create` | EXPORT-ROLES | `{ scope, filters, format, purpose?, rows }` | registro, marca d'água, supressão | `DASH.EXPORT_LAYER_EXCEEDED`, `DASH.EXPORT_VOLUME_APPROVAL_REQUIRED`, `DASH.EXPORT_FORMAT_NOT_OPEN` |
+
+- Exportação herda a camada, nunca a expande ([RN-DASH-172] regra 1); acima de
+  `dashboard.export.approval_rows` (5.000 linhas, OD-D09) fica `pending-approval`.
+- `LayerGate`/`finalidade-n2` para indicador individual nomeado ([JRN-DASH-006] passo 4).
+
+## 7. Saída
+
+- exportar leva a D-17 (registro de exportações) após concluir; acionar o gestor de área destacado
+  leva ao canal de gestão fora do sistema, nunca a um botão disciplinar automático
+  ([JRN-DASH-006] passo 6).
+
+## 8. Segurança e LGPD
+
+- N1 no agregado; N2 sob `LayerGate` para indicador individual nomeado; N3 nunca.
+- nenhum ranking individual de servidor a partir de indicador de acervo ([AC-DASH-005-4]);
+  reidentificação impedida pela supressão primária e secundária ([AC-DASH-005-1]); teste de
+  reversibilidade, não presença de agregação ([AC-DASH-005-2]).
+- exportação herda a camada e a supressão ([RN-DASH-172]).
+
+## 9. Acessibilidade
+
+- meta operacional e teto legal em componentes distintos, nunca no mesmo ([WF-RAIT-002] §4.5,
+  `TargetVsCeiling`); célula suprimida visível, nunca zero (marca "suprimida (limiar)" e nota de
+  rodapé).
+- `aria-live` na distribuição atualizada.
+
+## 10. Testes
+
+- roteamento: 8 papéis (presença) e demais (ausência); N3 bloqueado; `technical-admin`/
+  GESTOR_DETRAN via passe global (`OD-D16-005`) como caso adicional de C-01-05.
+- célula suprimida visível quando houver agregado; produtividade nunca isolada de qualidade
+  ([JRN-DASH-006] métricas de sucesso).
+- exportação registra filtros, linhas, formato, finalidade ([AC-DASH-005-1] a [AC-DASH-005-5]).
+
+## Componentes compartilhados
+
+`DistributionChart`, `SuppressedCell`, `TargetVsCeiling`, `ExportDialog`, `LayerGate`,
+`ClassificationBadge`, `FreshnessSeal`.
+
+## Chaves i18n
+
+- `dashboard.screens.comparativo.title` — "Comparativo"
+- `dashboard.screens.comparativo.intro` — "Distribuição por pool/circuito/unidade/clínica; faixa
+  de risco, % na meta, MTTA/MTTR e % de deveres no prazo."
+- `dashboard.screens.comparativo.empty` — "Nenhum grupo comparável no recorte atual."
+
+Referências (sem criar): `dashboard.states.*`, `dashboard.freshness.*`, `dashboard.severity.*`,
+`dashboard.errors.*`, `dashboard.forms.finalidade_n2.*`, `dashboard.forms.exportar.*`,
+`dashboard.a11y.*`.
+
+OD tocada: `OD-D16-005` (passe global sobre conteúdo de domínio).
diff --git a/docs/framework/product/transversal/dashboard/screens/IU-DASH-D-11.md b/docs/framework/product/transversal/dashboard/screens/IU-DASH-D-11.md
new file mode 100644
index 00000000..28642f30
--- /dev/null
+++ b/docs/framework/product/transversal/dashboard/screens/IU-DASH-D-11.md
@@ -0,0 +1,112 @@
+---
+id: IU-DASH-D-11
+title: Trilha de auditoria — especificação de tela
+status: draft
+apps: [dashboard]
+sources: [REF-LEI-13709-2018, REF-SENATRAN-997, REF-TCEAM-MANUAL-AUDITORIA-TI]
+updated: 2026-09-21
+---
+
+Ficha da rota `/monitoramento/auditoria` (`dashboard-frontends.md` §4, tela D-11; painel P-07 de
+[IU-DASH-001]).
+Fontes: [UC-DASH-004], [JRN-DASH-005], [RN-DASH-171], [RN-DASH-172].
+
+## 1. Identidade
+
+- `id`: `IU-DASH-D-11`; `path`: `/monitoramento/auditoria` (`route-manifest.md` #11).
+- `screen`: P-07 ("Trilha de auditoria consolidada" de [IU-DASH-001] §A).
+- camada de produto: Contexto.
+- módulo: `audit`.
+- `slug`: `auditoria`; segmento i18n: `auditoria`.
+- página: `AuditTrailPage`; componente inteligente principal: linha do tempo consolidada.
+
+## 2. Acesso
+
+- `policy`: `dashboard:audit-trail:read` (contrato §4 `GET audit-trail`).
+- `access`: N2 — partir de um caso identificado é N2 ([RN-DASH-170] linha N2;
+  `route-manifest.md` §C linha D-11); auditor/DPO N2 transversal, sempre logado
+  ([RN-DASH-170] verificação 1).
+- `roles` (presença): AUDITOR, DPO, `agency-admin`, AREA-MANAGERS (8).
+- passe global: GESTOR_DETRAN via §E (não na matriz); `technical-admin` bloqueado pela camada
+  (N1 < N2).
+- guardas: `authGuard` → `permissionGuard('dashboard:audit-trail:read')` →
+  `layerGuard('N2')`; `LayerGate` na entrada (finalidade, `X-Purpose`).
+
+## 3. Entrada
+
+- de onde se chega: menu Contexto; investigação a partir de um desfecho (ex. caso
+  `PRESCRITO_OPERACIONAL`, [JRN-DASH-005] passo 1).
+- filtros de URL: por caso, indicador, período, app de origem.
+
+## 4. Dados
+
+- lê `GET audit-trail` (contrato §4): linha do tempo por caso/indicador/período/app; fato do
+  acesso sem conteúdo sensível; lacuna exibida como lacuna.
+- transições registradas com timestamp e destinatário, para alertas ([WF-DASH-001]) e ciclos de
+  dever ([WF-DASH-002]); histórico de janelas `FRESCO`/`ATRASADO`/`INDISPONIVEL` por fonte
+  ([WF-DASH-003]) — para avaliar se um número era confiável naquele momento
+  ([AC-DASH-004-4]).
+- falha de alerta (o sistema não avisou) é distinta de falha de ação (avisou e ninguém agiu) —
+  duas perguntas separadas, nunca confundidas ([JRN-DASH-005] passo 4).
+- acesso a dado sensível (ex. saúde de vítima) mostra o fato do acesso e a finalidade declarada,
+  nunca o conteúdo clínico ([JRN-DASH-005] passo 3).
+- evento sem registro (ex. notificação por telefone) aparece como lacuna, nunca preenchido por
+  suposição ([JRN-DASH-005] passo 5).
+- indicador nunca conectado aparece "catalogado, sem histórico — fonte não conectada no período"
+  ([UC-DASH-004] fluxo alternativo).
+- consultar esta tela é, ela mesma, tratamento e é registrado ([AC-DASH-004-1]; [RN-DASH-171]).
+
+## 5. Estados
+
+- **vazio**: `dashboard.screens.auditoria.empty`.
+- **carregando** / **erro** / **indisponível** / **desatualizado**: padrão M4.
+- **bloqueado por decisão**: não se aplica.
+- **sem permissão** (N2 sem finalidade): `DASH.PURPOSE_REQUIRED`, diálogo `LayerGate`.
+
+## 6. Comandos
+
+| Rota (contrato §4) | Ação     | Papel        | Payload                                      | Efeito                            | Erro esperado                                                                            |
+| ------------------ | -------- | ------------ | -------------------------------------------- | --------------------------------- | ---------------------------------------------------------------------------------------- |
+| `POST exports`     | `create` | EXPORT-ROLES | `{ scope, filters, format, purpose?, rows }` | registro, marca d'água, supressão | `DASH.EXPORT_LAYER_EXCEEDED`, `DASH.EXPORT_PURPOSE_REQUIRED`, `DASH.EXPORT_N3_FORBIDDEN` |
+
+- Exportação de recorte da trilha sujeita às mesmas regras de supressão de célula da publicação
+  ([AC-DASH-004-2]; [RN-DASH-172], [RN-DASH-161]).
+
+## 7. Saída
+
+- exportar leva a D-17 (registro de exportações); drill-down pontual a RAIT/BOAT/PEC para
+  confirmar um evento na origem ([JRN-DASH-005] pontos de contato).
+
+## 8. Segurança e LGPD
+
+- N2 transversal, com finalidade registrada ([RN-DASH-171]); N3 nunca — acesso a dado sensível
+  mostra o fato, não o conteúdo ([JRN-DASH-005] passo 3; [RN-DASH-170]).
+- classificação P1/P2/P3 antes de exibir; cada papel vê apenas sua fatia
+  ([AC-DASH-004-5]).
+
+## 9. Acessibilidade
+
+- distinção visual entre falha de alerta e falha de ação; lacuna de registro exibida como texto,
+  não como espaço vazio ambíguo; `aria-live` na linha do tempo.
+
+## 10. Testes
+
+- roteamento: 8 papéis (presença) e demais (ausência); N3 bloqueado; `technical-admin` bloqueado
+  pela camada mesmo com passe global parcial (só GESTOR_DETRAN entra via §E).
+- N2 sem finalidade nunca revela conteúdo ([C-01-09]); consulta à trilha é registrada
+  ([AC-DASH-004-1]).
+- exportação classificada e sujeita à supressão ([AC-DASH-004-2]).
+
+## Componentes compartilhados
+
+`FreshnessSeal`, `LayerGate`, `ExportDialog`, `ClassificationBadge`, `DeepLinkButton`.
+
+## Chaves i18n
+
+- `dashboard.screens.auditoria.title` — "Trilha de auditoria"
+- `dashboard.screens.auditoria.intro` — "Linha do tempo por caso, indicador, período e app, com
+  fato do acesso sem conteúdo sensível."
+- `dashboard.screens.auditoria.empty` — "Nenhum evento no recorte consultado."
+
+Referências (sem criar): `dashboard.states.*`, `dashboard.freshness.*`, `dashboard.errors.*`,
+`dashboard.forms.finalidade_n2.*`, `dashboard.forms.exportar.*`, `dashboard.a11y.*`.
diff --git a/docs/framework/product/transversal/dashboard/screens/IU-DASH-D-12.md b/docs/framework/product/transversal/dashboard/screens/IU-DASH-D-12.md
new file mode 100644
index 00000000..ce50a1de
--- /dev/null
+++ b/docs/framework/product/transversal/dashboard/screens/IU-DASH-D-12.md
@@ -0,0 +1,116 @@
+---
+id: IU-DASH-D-12
+title: Transparência ativa — especificação de tela
+status: draft
+apps: [dashboard]
+sources:
+  [REF-LEI-12527-2011, REF-LEI-14129-2021, REF-LEI-13146-2015-acessibilidade]
+updated: 2026-09-21
+---
+
+Ficha da rota `/monitoramento/transparencia` (`dashboard-frontends.md` §4, tela D-12; painel
+P-08 de [IU-DASH-001]).
+Fontes: [UC-DASH-007], [RN-DASH-140], [RN-DASH-150].
+
+## 1. Identidade
+
+- `id`: `IU-DASH-D-12`; `path`: `/monitoramento/transparencia` (`route-manifest.md` #12).
+- `screen`: P-08 ("Transparência ativa e dados abertos" de [IU-DASH-001] §A — "o módulo é, ele
+  mesmo, superfície do painel").
+- camada de produto: Vigilância.
+- módulo: `transparency`.
+- `slug`: `transparencia`; segmento i18n: `transparencia`.
+- página: `TransparencyAuditPage`; componente inteligente principal: checklist do art. 8º §1º/§3º.
+
+## 2. Acesso
+
+- `policy`: `dashboard:transparency-audit:read` (contrato §4 `GET transparency/checklist`).
+- `access`: N0 — checklist LAI, ciclo mensal, datasets abertos e indicadores de serviço art. 22
+  são conteúdo público/institucional ([RN-DASH-142] P1; `route-manifest.md` §C linha D-12);
+  nenhum objeto de processo.
+- `roles` (presença): `technical-admin`, `agency-admin`, AUDITOR (3).
+- passe global: GESTOR_DETRAN, ADMIN, SUPORTE via §E (não na matriz, todos N0) — divergência
+  registrada `OD-D16-005`.
+- guardas: `authGuard` → `permissionGuard('dashboard:transparency-audit:read')` →
+  `layerGuard('N0')`.
+
+## 3. Entrada
+
+- de onde se chega: menu Vigilância.
+- filtros de URL: por bloco do checklist.
+
+## 4. Dados
+
+- lê `GET transparency/checklist` (contrato §4); comando `POST transparency/audits` fecha o
+  ciclo mensal.
+- checklist art. 8º §1º (6 blocos: estrutura/competências, repasses, despesas, licitações,
+  acompanhamento de programas, perguntas frequentes) e checklist técnico do §3º (8 requisitos:
+  pesquisa, exportação em formato aberto, acesso automatizado legível por máquina, formatos
+  divulgados, autenticidade/integridade, atualização mantida, canal de comunicação,
+  acessibilidade — [RN-DASH-140]).
+- ciclo mensal de auditoria (IND-DASH-209); datasets abertos com os 7 requisitos de
+  [RN-DASH-151]; indicadores de serviço do art. 22 ([REF-LEI-14129-2021], condicionado à adesão
+  estadual — [RN-DASH-150]).
+- itens 14.129 marcados "base estadual" (DT-066/OD-D03, `dashboard-build-pack.md`; steering
+  H.54) — condiciona só esta tela, não D-13.
+- selo de frescor da própria publicação (autoinstrumentação do inciso VI, [RN-DASH-140]
+  verificação 3).
+
+## 5. Estados
+
+- **vazio**: `dashboard.screens.transparencia.empty`.
+- **carregando** / **erro**: padrão M4.
+- **indisponível** / **desatualizado**: publicação desatualizada é descumprimento contínuo e
+  visível ([RN-DASH-140] verificação 3).
+- **bloqueado por decisão**: `DASH.PANEL_BLOCKED_BY_DECISION` — só os itens do checklist 14.129
+  condicionados a DT-066 (adesão estadual, `OD-D03`); placeholder com a decisão pendente e o
+  link para o registro, os demais itens (LAI, art. 8º) permanecem ativos.
+
+## 6. Comandos
+
+| Rota (contrato §4)         | Ação    | Papel                             | Payload               | Efeito                       | Erro esperado |
+| -------------------------- | ------- | --------------------------------- | --------------------- | ---------------------------- | ------------- |
+| `POST transparency/audits` | `audit` | `technical-admin`, `agency-admin` | checklist, evidências | ciclo mensal do IND-DASH-209 | —             |
+
+- Itens ausentes/quebrados viram pendências, não bloqueiam o ciclo ([UC-DASH-007] passo 3).
+
+## 7. Saída
+
+- correções de item ausente/quebrado acontecem fora do painel (no site público); o ciclo é
+  comprovado e arquivado ([WF-DASH-002]).
+
+## 8. Segurança e LGPD
+
+- N0 — conteúdo público/institucional por dever (P1); estatística agregada envolvendo saúde de
+  vítima exige camada de anonimização documentada antes de publicar, bloqueada sem ela
+  ([UC-DASH-007] fluxo alternativo).
+- classificação P1 declarada antes de exibir/publicar.
+
+## 9. Acessibilidade
+
+- checklist item VIII (acessibilidade) é ele mesmo requisito de aceitação da tela, não só do
+  conteúdo publicado ([RN-DASH-140] verificação 4).
+
+## 10. Testes
+
+- roteamento: 3 papéis (presença) e demais (ausência); N3 bloqueado; GESTOR_DETRAN/ADMIN/SUPORTE
+  via passe global como caso adicional de C-01-05.
+- checklist do art. 8º §1º e §3º verificado item a item ([AC-DASH-007-1]); os oito requisitos do
+  §3º como critérios verificáveis, não texto livre.
+- estado "bloqueado por decisão" só nos itens 14.129 (DT-066); os demais nunca bloqueiam.
+
+## Componentes compartilhados
+
+`FreshnessSeal`, `ClassificationBadge`, `EvidenceAttach`, `DeepLinkButton`.
+
+## Chaves i18n
+
+- `dashboard.screens.transparencia.title` — "Transparência ativa"
+- `dashboard.screens.transparencia.intro` — "Checklist art. 8º §1º/§3º, ciclo mensal de
+  auditoria, datasets abertos e indicadores de serviço art. 22."
+- `dashboard.screens.transparencia.empty` — "Nenhum item de checklist pendente neste ciclo."
+
+Referências (sem criar): `dashboard.states.*`, `dashboard.freshness.*`, `dashboard.errors.*`,
+`dashboard.forms.auditoria_transparencia.*`, `dashboard.a11y.*`.
+
+OD tocada: `OD-D16-005` (passe global); DT-066/OD-D03 transcrita (não reaberta).
diff --git a/docs/framework/product/transversal/dashboard/screens/IU-DASH-D-13.md b/docs/framework/product/transversal/dashboard/screens/IU-DASH-D-13.md
new file mode 100644
index 00000000..48ff6769
--- /dev/null
+++ b/docs/framework/product/transversal/dashboard/screens/IU-DASH-D-13.md
@@ -0,0 +1,121 @@
+---
+id: IU-DASH-D-13
+title: Estatística de sinistros — especificação de tela
+status: draft
+apps: [dashboard]
+sources:
+  [REF-LEI-13709-2018, REF-SENATRAN-PORTARIA-139-2025, REF-CONTRAN-808-2020]
+updated: 2026-09-21
+---
+
+Ficha da rota `/monitoramento/sinistros` (`dashboard-frontends.md` §4, tela D-13; painel P-09 de
+[IU-DASH-001]).
+Fontes: [UC-DASH-005], [RN-DASH-160], [RN-DASH-161].
+
+## 1. Identidade
+
+- `id`: `IU-DASH-D-13`; `path`: `/monitoramento/sinistros` (`route-manifest.md` #13).
+- `screen`: P-09 ("Estatística agregada de sinistros" de [IU-DASH-001] §A — destravado com
+  supressão secundária ativa, OD-D02/DT-029, steering H.54).
+- camada de produto: Contexto.
+- módulo: `crashes`.
+- `slug`: `sinistros`; segmento i18n: `sinistros`.
+- página: `CrashStatisticsPage`; componente inteligente principal: `DistributionChart` com
+  `SuppressedCell`.
+
+## 2. Acesso
+
+- `policy`: `dashboard:comparison:read` (prov., `OD-D16-002` — compartilhada com D-10,
+  [UC-DASH-005]).
+- `access`: N0 — estatística **agregada** com supressão primária e secundária (OD-D02,
+  `dashboard.cell_threshold = 10`; [RN-DASH-161]) equivale a "séries anonimizadas"
+  ([RN-DASH-170] linha N0; `route-manifest.md` §C linha D-13); dado de saúde de vítima é N3 e
+  nunca é servido ([RN-DASH-170] linha N3).
+- `roles` (presença): `agency-admin`, AREA-MANAGERS, `bi-analyst`, AUDITOR (8).
+- passe global: `technical-admin`, GESTOR_DETRAN, ADMIN, SUPORTE via §E (não na matriz, todos
+  N0) — divergência `OD-D16-005`.
+- guardas: `authGuard` → `permissionGuard('dashboard:comparison:read')` → `layerGuard('N0')`.
+
+## 3. Entrada
+
+- de onde se chega: menu Contexto.
+- filtros de URL: `dimension` (contrato §4), município/período/gravidade com parcimônia
+  deliberada — a combinação de três dessas dimensões aciona revisão obrigatória
+  ([RN-DASH-161] "dimensões de alto risco").
+
+## 4. Dados
+
+- lê `GET comparisons` com `dimension` voltada a sinistros (`OD-D16-002`); projeção
+  `dashboard.crashes` (contrato §6, IND-DASH-203, 204, 310).
+- limiar mínimo de célula **10**, aplicado antes da renderização e da exportação
+  (`dashboard.cell_threshold`, OD-D02/DT-029 respondido; steering H.54); supressão primária e
+  secundária obrigatórias — suprimir só a célula pequena não basta se o total permite recuperar
+  o valor por subtração ([RN-DASH-161] verificação 2); célula suprimida sempre visível, marcada
+  "suprimida (limiar)", nunca zero.
+- generalização geográfica é o padrão recomendado quando possível (agrupar municípios pequenos
+  em mesorregião, mês em trimestre) ([RN-DASH-161] verificação 3).
+- selo de frescor + `asOf`; classificação P1/P2/P3 antes de exibir — a estatística agregada é
+  P2 no máximo, publicável só por decisão documentada do órgão com apoio do Encarregado
+  ([RN-DASH-142] linha P2).
+
+## 5. Estados
+
+- **vazio**: `dashboard.screens.sinistros.empty`.
+- **carregando** / **erro** / **indisponível** / **desatualizado**: padrão M4.
+- **bloqueado por decisão**: `DASH.PANEL_BLOCKED_BY_DECISION` como o estado **genérico** dos
+  seis obrigatórios (WP-D4) — residual, sem decisão pendente atribuída a ele: a rota é real e
+  serve com supressão secundária ativa (OD-D02/DT-029 já respondido); o estado só ocorreria se
+  uma leitura específica dependesse de outra decisão futura, não a que já destravou a tela.
+- DT-066 (adesão à Lei 14.129/2021) não condiciona esta tela — condiciona apenas D-12
+  (`dashboard-frontends.md` M4).
+
+## 6. Comandos
+
+- Nenhum comando de mutação; nenhum formulário próprio (`route-manifest.md` linha 13, coluna
+  `forms`: "—"). Ações: ver, filtrar por dimensão com parcimônia.
+
+## 7. Saída
+
+- não há deep-link de mérito a partir desta tela — a estatística é institucional, sem objeto de
+  processo individual a acionar.
+
+## 8. Segurança e LGPD
+
+- N0 — série anonimizada com supressão dupla; N3 nunca (dado de saúde de vítima,
+  [RN-DASH-162]); agregar não é anonimizar ([RN-DASH-160] verificação 1) — a proteção do art. 12
+  é condicional e reavaliada periodicamente.
+- teste de cruzamento com o que já é público antes de qualquer nova publicação
+  ([RN-DASH-161] verificação 4); nenhuma consulta parametrizada livre na superfície pública
+  ([RN-DASH-161] verificação 5).
+
+## 9. Acessibilidade
+
+- célula suprimida com marca textual "suprimida (limiar)" e nota de rodapé, nunca só visual;
+  `aria-live` na distribuição.
+
+## 10. Testes
+
+- roteamento: 8 papéis (presença) e demais (ausência); N3 bloqueado; `technical-admin`/
+  GESTOR_DETRAN/ADMIN/SUPORTE via passe global como caso adicional de C-01-05.
+- célula suprimida sempre visível quando houver agregado, nunca zero ([AC-DASH-005-1]); estado
+  "bloqueado por decisão" nunca aparece atribuído a uma decisão pendente nesta tela (D-13 já
+  destravada).
+- os cinco controles de [RN-DASH-161] como critérios do pipeline de exibição.
+
+## Componentes compartilhados
+
+`DistributionChart`, `SuppressedCell`, `ClassificationBadge`, `FreshnessSeal`.
+
+## Chaves i18n
+
+- `dashboard.screens.sinistros.title` — "Estatística de sinistros"
+- `dashboard.screens.sinistros.intro` — "Séries agregadas de sinistros com supressão de célula
+  primária e secundária."
+- `dashboard.screens.sinistros.empty` — "Nenhum recorte com contagem acima do limiar de
+  supressão."
+
+Referências (sem criar): `dashboard.states.*`, `dashboard.freshness.*`, `dashboard.errors.*`,
+`dashboard.a11y.*`.
+
+OD tocada: `OD-D16-002` (política provisória), `OD-D16-005` (passe global); OD-D02/DT-029
+transcrita (não reaberta).
diff --git a/docs/framework/product/transversal/dashboard/screens/IU-DASH-D-14.md b/docs/framework/product/transversal/dashboard/screens/IU-DASH-D-14.md
new file mode 100644
index 00000000..f72eda22
--- /dev/null
+++ b/docs/framework/product/transversal/dashboard/screens/IU-DASH-D-14.md
@@ -0,0 +1,109 @@
+---
+id: IU-DASH-D-14
+title: Catálogo de indicadores — especificação de tela
+status: draft
+apps: [dashboard]
+sources: [REF-LEI-13709-2018, REF-LEI-12527-2011]
+updated: 2026-09-21
+---
+
+Ficha da rota `/monitoramento/indicadores` (`dashboard-frontends.md` §4, tela D-14; tela de
+apoio, origem `indicator-config`, sem `P-nn` próprio).
+Fontes: [RN-DASH-120], [RN-DASH-142].
+
+## 1. Identidade
+
+- `id`: `IU-DASH-D-14`; `path`: `/monitoramento/indicadores` (`route-manifest.md` #14; rota
+  filha de detalhe `/monitoramento/indicadores/:id` em `route-manifest.md` §B, mesma ficha,
+  mesmas guardas).
+- `screen`: tela de apoio (sem painel dedicado; conteúdo transversal aos blocos A–D).
+- camada de produto: Contexto.
+- módulo: `catalogue`.
+- `slug`: `indicadores`; segmento i18n: `indicadores`.
+- página: `IndicatorCataloguePage`; componente inteligente principal: tabela dos 42
+  indicadores.
+
+## 2. Acesso
+
+- `policy`: `dashboard:indicator:read` (contrato §4 `GET indicators`, N0).
+- `access`: N0 — catálogo sem dado de caso (`route-manifest.md` §C linha D-14).
+- `roles` (presença): N0-ROLES (34).
+- passe global: sem efeito adicional.
+- guardas: `authGuard` → `permissionGuard('dashboard:indicator:read')` →
+  `layerGuard('N0')`.
+
+## 3. Entrada
+
+- de onde se chega: menu Contexto.
+- parâmetros de rota: nenhum na lista; `:id` na rota filha de detalhe (`route-manifest.md` §B).
+- filtros de URL: por bloco, por classificação.
+
+## 4. Dados
+
+- lê `GET indicators`, `GET indicators/{code}` (contrato §4): os **42 indicadores** com bloco,
+  fonte, limiar, dono, classificação P1/P2/P3, latência aceitável, `connected` (fonte conectada
+  ou não).
+- distingue os dois conjuntos nomeados junto com D-08: **"9 indicadores do bloco B"**
+  ([APP-DASHBOARD] §Catálogo B) e **"14 linhas da tabela-mestra"** ([RN-DASH-120] — inclui SLA e
+  Pnatrans; `dashboard-build-pack.md` §5 inconsistência 4).
+- classificação P1/P2/P3 como atributo obrigatório antes de exibir ([RN-DASH-142]
+  verificação 1: "todo indicador nasce P3"); indicador sem P1/P2/P3 não é exibido nem exportado
+  (`DASH.CLASSIFICATION_MISSING`).
+- os 42 nomes vêm do seed de R-0011, transcritos sem edição — divergência futura é `plant-bug`
+  de quem divergir (`plan.md` M5).
+
+## 5. Estados
+
+- **vazio**: `dashboard.screens.indicadores.empty`.
+- **carregando** / **erro** / **indisponível** / **desatualizado**: padrão M4.
+- **bloqueado por decisão**: não se aplica ao catálogo em si (a rota é de leitura de metadados,
+  sempre servida).
+
+## 6. Comandos
+
+| Rota (contrato §4)                    | Ação      | Papel                                           | Payload                                           | Efeito                   | Erro esperado                                                                                                       |
+| ------------------------------------- | --------- | ----------------------------------------------- | ------------------------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------- |
+| `PATCH indicator-configs/{id}`        | `update`  | `bi-analyst`, `agency-admin`, `technical-admin` | limiar, dono, latência, classificação, estratégia | rascunho de configuração | `DASH.INDICATOR_LATENCY_INVALID`                                                                                    |
+| `POST indicator-configs/{id}/publish` | `publish` | idem                                            | —                                                 | configuração vigente     | `DASH.INDICATOR_THRESHOLD_NOT_CALIBRATED`, `DASH.INDICATOR_TARGET_AND_CEILING_MIXED`, `DASH.CLASSIFICATION_MISSING` |
+
+- classificação obrigatória antes de publicar; meta operacional e teto legal nunca no mesmo
+  componente de configuração ([WF-RAIT-002] §4.5).
+- os dois recursos da origem (`bi-panel`, `generated-report`) permanecem como telas de apoio
+  D-14/D-16 por decisão OD-D13 (steering H.54).
+
+## 7. Saída
+
+- clique num indicador navega à rota filha de detalhe (`:id`, `route-manifest.md` §B); a
+  publicação de configuração reflete nas telas que exibem aquele indicador.
+
+## 8. Segurança e LGPD
+
+- N0 — metadados de configuração, sem dado de caso; classificação declarada antes de exibir ou
+  exportar.
+
+## 9. Acessibilidade
+
+- os dois conjuntos ("9 indicadores do bloco B", "14 linhas da tabela-mestra") nomeados com
+  rótulo textual explícito, não apenas por contagem numérica.
+
+## 10. Testes
+
+- roteamento: N0-ROLES (presença) e CANDIDATO/CIDADAO (ausência); N3 bloqueado.
+- indicador sem classificação nunca exibido nem exportável (`DASH.CLASSIFICATION_MISSING`);
+  publicação rejeita mistura de meta e teto no mesmo componente.
+- os dois conjuntos nomeados distintamente, ligados à inconsistência 4 do build pack.
+
+## Componentes compartilhados
+
+`FreshnessSeal`, `ClassificationBadge`, `TargetVsCeiling`, `SourceStatusTable`.
+
+## Chaves i18n
+
+- `dashboard.screens.indicadores.title` — "Catálogo de indicadores"
+- `dashboard.screens.indicadores.intro` — "42 indicadores com bloco, fonte, limiar, dono,
+  classificação e latência aceitável."
+- `dashboard.screens.indicadores.empty` — "Nenhum indicador corresponde ao filtro atual."
+
+Referências (sem criar): `dashboard.states.*`, `dashboard.freshness.*`, `dashboard.blocks.*`,
+`dashboard.classification.*`, `dashboard.indicators.*`, `dashboard.errors.*`,
+`dashboard.forms.configurar_indicador.*`, `dashboard.a11y.*`.
diff --git a/docs/framework/product/transversal/dashboard/screens/IU-DASH-D-15.md b/docs/framework/product/transversal/dashboard/screens/IU-DASH-D-15.md
new file mode 100644
index 00000000..d8f28c9b
--- /dev/null
+++ b/docs/framework/product/transversal/dashboard/screens/IU-DASH-D-15.md
@@ -0,0 +1,98 @@
+---
+id: IU-DASH-D-15
+title: Frescor das fontes — especificação de tela
+status: draft
+apps: [dashboard]
+sources: [REF-LEI-13709-2018, REF-LEI-9873-1999, REF-LEI-13460-2017]
+updated: 2026-09-21
+---
+
+Ficha da rota `/monitoramento/frescor` (`dashboard-frontends.md` §4, tela D-15; tela de apoio,
+sem `P-nn` próprio).
+Fontes: [RN-DASH-130].
+
+## 1. Identidade
+
+- `id`: `IU-DASH-D-15`; `path`: `/monitoramento/frescor` (`route-manifest.md` #15).
+- `screen`: tela de apoio ([WF-DASH-003] — página de status por painel/fonte).
+- camada de produto: Técnico.
+- módulo: `catalogue`.
+- `slug`: `frescor`; segmento i18n: `frescor`.
+- página: `FreshnessStatusPage`; componente inteligente principal: `SourceStatusTable`.
+
+## 2. Acesso
+
+- `policy`: `dashboard:source:read` (contrato §4 "página de status por painel/fonte" — mesma
+  chave de D-06/D-07).
+- `access`: N0 — última leitura, latência aceitável, estado e heartbeat por fonte/painel
+  ([WF-DASH-003]) sem conteúdo de domínio; abaixo de qualquer linha N1 de [RN-DASH-170]; a
+  política restringe os papéis independentemente da camada (`route-manifest.md` §C linha D-15).
+- `roles` (presença): `technical-admin`, `integration-operator`, `dash-operator`, AUDITOR (4).
+- passe global: ADMIN, SUPORTE via §E (N0, não na matriz); `technical-admin` já na matriz.
+- guardas: `authGuard` → `permissionGuard('dashboard:source:read')` → `layerGuard('N0')`.
+
+## 3. Entrada
+
+- de onde se chega: menu Técnico; referenciada como página de status a partir de qualquer tela
+  que dependa de frescor (D-06, D-15 é o detalhe consolidado).
+- filtros de URL: por painel/fonte.
+
+## 4. Dados
+
+- lê `GET sources` (contrato §4, IND-DASH-408): última leitura, latência aceitável, estado,
+  heartbeat.
+- os quatro estados de [WF-DASH-003]: `FRESCO`, `ATRASADO`, `INDISPONIVEL`,
+  `DESATUALIZADO_MARCADO`; latência aceitável declarada por painel, não genérica (minutos a
+  poucas horas para bloco A, até 1 dia para bloco B, horas para bloco C, minutos para bloco D).
+- indicador em `INDISPONIVEL`/`DESATUALIZADO_MARCADO` não gera `DETECTADO`
+  ([WF-DASH-003] §Efeito).
+- a indisponibilidade prolongada da própria fonte é, ela mesma, indicador de saúde técnica
+  (IND-DASH-408) e gera seu próprio alerta.
+
+## 5. Estados
+
+- **vazio**: `dashboard.screens.frescor.empty`.
+- **carregando** / **erro**: padrão M4.
+- **indisponível**: `INDISPONIVEL` — esta é a tela onde o próprio estado de indisponibilidade é
+  o conteúdo principal, não uma degradação a esconder.
+- **desatualizado**: `DESATUALIZADO_MARCADO` com "desde `{as_of}`".
+- **bloqueado por decisão**: não se aplica.
+
+## 6. Comandos
+
+- Nenhum comando de mutação; ações: ver, filtrar por painel/fonte, deep-link a D-06/D-07 quando
+  a fonte estiver degradada.
+
+## 7. Saída
+
+- clique numa fonte navega a D-07 quando aplicável (mesma fonte de integração); a tabela
+  reflete a normalização via SSE.
+
+## 8. Segurança e LGPD
+
+- N0 — nenhum conteúdo de domínio; a política de recurso (`source:read`) restringe os papéis
+  independentemente da camada.
+
+## 9. Acessibilidade
+
+- estado de frescor sempre com rótulo textual, nunca só ícone de cor; `aria-live` no heartbeat.
+
+## 10. Testes
+
+- roteamento: 4 papéis (presença) e demais (ausência); N3 bloqueado (não se aplica).
+- os quatro estados de frescor exibidos com honestidade — nunca número velho como atual
+  ([WF-DASH-003] princípio central); selo em toda fonte listada.
+
+## Componentes compartilhados
+
+`FreshnessSeal`, `SourceStatusTable`.
+
+## Chaves i18n
+
+- `dashboard.screens.frescor.title` — "Frescor das fontes"
+- `dashboard.screens.frescor.intro` — "Última leitura, latência aceitável, estado e heartbeat
+  por painel e fonte."
+- `dashboard.screens.frescor.empty` — "Nenhuma fonte cadastrada para monitoramento."
+
+Referências (sem criar): `dashboard.states.*`, `dashboard.freshness.*`, `dashboard.errors.*`,
+`dashboard.a11y.*`.
diff --git a/docs/framework/product/transversal/dashboard/screens/IU-DASH-D-16.md b/docs/framework/product/transversal/dashboard/screens/IU-DASH-D-16.md
new file mode 100644
index 00000000..41257447
--- /dev/null
+++ b/docs/framework/product/transversal/dashboard/screens/IU-DASH-D-16.md
@@ -0,0 +1,110 @@
+---
+id: IU-DASH-D-16
+title: Relatórios — especificação de tela
+status: draft
+apps: [dashboard]
+sources: [REF-LEI-13709-2018, REF-SENATRAN-PORTARIA-139-2025]
+updated: 2026-09-21
+---
+
+Ficha da rota `/monitoramento/relatorios` (`dashboard-frontends.md` §4, tela D-16; tela de
+apoio, origem `generated-report`, sem `P-nn` próprio).
+Fontes: [RN-DASH-172].
+
+## 1. Identidade
+
+- `id`: `IU-DASH-D-16`; `path`: `/monitoramento/relatorios` (`route-manifest.md` #16; rota
+  filha de detalhe `/monitoramento/relatorios/:id` em `route-manifest.md` §B, mesma ficha,
+  mesmas guardas).
+- `screen`: tela de apoio (absorvida de `BP-BI-REPORTING-001`, decisão OD-D13 vigente).
+- camada de produto: Contexto.
+- módulo: `reports`.
+- `slug`: `relatorios`; segmento i18n: `relatorios`.
+- página: `GeneratedReportsPage`; componente inteligente principal: lista de relatórios com
+  status.
+
+## 2. Acesso
+
+- `policy`: `dashboard:generated-report:read` (contrato §4).
+- `access`: N1 — analista de BI N1 "relatórios" (`dashboard-frontends.md` §3);
+  relatório gerado herda a camada do recorte que o gerou ([RN-DASH-172] regra 1), marca d'água
+  com a camada (regra 3); o app não abre relatório acima da camada do usuário
+  (`route-manifest.md` §C linha D-16).
+- `roles` (presença): `bi-analyst`, `agency-admin`, `technical-admin`, AUDITOR (4).
+- passe global: GESTOR_DETRAN via §E (não na matriz); `technical-admin` já na matriz.
+- guardas: `authGuard` → `permissionGuard('dashboard:generated-report:read')` →
+  `layerGuard('N1')`.
+
+## 3. Entrada
+
+- de onde se chega: menu Contexto.
+- parâmetros de rota: `:id` na rota filha de detalhe (acompanhar, baixar por relatório,
+  `route-manifest.md` §B).
+
+## 4. Dados
+
+- relatórios gerados: solicitar, acompanhar, baixar com marca d'água; status
+  `processing → completed`/`failed` (`dashboard-frontends.md` §4).
+- backend: `POST generated-reports` (contrato §4, request), `POST
+generated-reports/{id}/complete|fail` (sistema). **Lacuna**: o contrato §4 não lista rota
+  `GET` de lista nem de detalhe para acompanhar um relatório já solicitado — proposta
+  `OD-D16-010` no relatório desta tarefa.
+- selo de frescor + `asOf` no status; marca d'água e cabeçalho de classificação em todo arquivo
+  gerado ([RN-DASH-172] regra 3).
+
+## 5. Estados
+
+- **vazio**: `dashboard.screens.relatorios.empty`.
+- **carregando** / **erro** / **indisponível** / **desatualizado**: padrão M4.
+- **bloqueado por decisão**: não se aplica.
+- **indisponível nesta versão**: `dashboard.states.unavailable_in_version` enquanto o cliente
+  gerado de R-0011 não publicar a rota de acompanhamento (`OD-D16-010`) — nunca mock silencioso
+  (`contracts/CTG-0002.md` §Decisões 6).
+
+## 6. Comandos
+
+| Rota (contrato §4)       | Ação      | Papel                                           | Payload                                      | Efeito                 | Erro esperado                |
+| ------------------------ | --------- | ----------------------------------------------- | -------------------------------------------- | ---------------------- | ---------------------------- |
+| `POST generated-reports` | `request` | `bi-analyst`, `agency-admin`, `technical-admin` | `report_type`, `filters`                     | `processing`           | `DASH.REPORT_TYPE_INVALID`   |
+| `POST exports`           | `create`  | EXPORT-ROLES                                    | `{ scope, filters, format, purpose?, rows }` | registro, marca d'água | `DASH.EXPORT_LAYER_EXCEEDED` |
+
+- Solicitar relatório exige tipo do catálogo ([dashboard-frontends.md] §7); relatório não é
+  editável após `completed` (`dashboard-route-contract.md` §8 divergência 2).
+
+## 7. Saída
+
+- relatório concluído baixa com marca d'água; exportar a partir daqui leva a D-17.
+
+## 8. Segurança e LGPD
+
+- N1 na leitura; herda a camada do recorte, nunca a expande; marca d'água identifica órgão,
+  camada, usuário, data-hora e recorte ([RN-DASH-172] regra 3).
+
+## 9. Acessibilidade
+
+- status do relatório (`processing`/`completed`/`failed`) com rótulo textual, não só ícone.
+
+## 10. Testes
+
+- roteamento: 4 papéis (presença) e demais (ausência); N3 bloqueado.
+- `request` exige `report_type` do catálogo; relatório concluído não é reeditável.
+- estado "indisponível nesta versão" enquanto a lacuna `OD-D16-010` não for suprida.
+
+## Componentes compartilhados
+
+`ExportDialog`, `ClassificationBadge`, `DeepLinkButton`, `FreshnessSeal`.
+
+## Chaves i18n
+
+- `dashboard.screens.relatorios.title` — "Relatórios"
+- `dashboard.screens.relatorios.intro` — "Relatórios gerados: solicitar, acompanhar e baixar com
+  marca d'água."
+- `dashboard.screens.relatorios.empty` — "Nenhum relatório solicitado."
+
+Referências (sem criar): `dashboard.states.*`, `dashboard.freshness.*`, `dashboard.errors.*`,
+`dashboard.forms.solicitar_relatorio.*`, `dashboard.forms.exportar.*`, `dashboard.a11y.*`.
+
+OD proposta: `OD-D16-010` — D-16 (Relatórios) lista e acompanha `generated-reports`, mas o
+contrato §4 só documenta `POST generated-reports` e `POST …/complete|fail`; falta rota `GET
+generated-reports` (lista) e `GET generated-reports/{id}` (detalhe/acompanhamento) para R-0011
+publicar.
diff --git a/docs/framework/product/transversal/dashboard/screens/IU-DASH-D-17.md b/docs/framework/product/transversal/dashboard/screens/IU-DASH-D-17.md
new file mode 100644
index 00000000..47afa6e3
--- /dev/null
+++ b/docs/framework/product/transversal/dashboard/screens/IU-DASH-D-17.md
@@ -0,0 +1,102 @@
+---
+id: IU-DASH-D-17
+title: Exportações — especificação de tela
+status: draft
+apps: [dashboard]
+sources: [REF-LEI-13709-2018, REF-SENATRAN-PORTARIA-139-2025]
+updated: 2026-09-21
+---
+
+Ficha da rota `/monitoramento/exportacoes` (`dashboard-frontends.md` §4, tela D-17; tela de
+apoio, sem `P-nn` próprio).
+Fontes: [RN-DASH-172].
+
+## 1. Identidade
+
+- `id`: `IU-DASH-D-17`; `path`: `/monitoramento/exportacoes` (`route-manifest.md` #17).
+- `screen`: tela de apoio (registro de exportações — [RN-DASH-172]).
+- camada de produto: Contexto.
+- módulo: `reports`.
+- `slug`: `exportacoes`; segmento i18n: `exportacoes`.
+- página: `ExportRegistryPage`; componente inteligente principal: painel de exportações (quem
+  mais exportou, maiores volumes, exportações fora de horário — [RN-DASH-172] verificação 2).
+
+## 2. Acesso
+
+- `policy`: `dashboard:audit-trail:read` (prov., `OD-D16-001` — D-17 não tem rota de leitura
+  própria no contrato §4 nem chave `dashboard:export:read` em DASHBOARD_RULES; a exportação é
+  evento de trilha, [RN-DASH-171]/[RN-DASH-172] regra 2).
+- `access`: N1 (`route-manifest.md` §C linha D-17, `OD-D16-001`).
+- `roles` (presença): AUDITOR, DPO, `agency-admin`, AREA-MANAGERS (8).
+- passe global: GESTOR_DETRAN, `technical-admin` via §E (não na matriz) — divergência
+  `OD-D16-005`.
+- guardas: `authGuard` → `permissionGuard('dashboard:audit-trail:read')` →
+  `layerGuard('N1')`.
+
+## 3. Entrada
+
+- de onde se chega: menu Contexto; destino após exportar em D-10/D-11/D-16.
+
+## 4. Dados
+
+- registro de exportações: quem, quando, filtros, linhas, formato, finalidade
+  ([RN-DASH-172] regra 2) — nenhum desses campos é objeto de processo; aprovações nominais
+  pendentes ("aguardando aprovação nominal" quando volume excede `dashboard.export.approval_rows`
+  = 5.000 linhas, OD-D09).
+- **lacuna já registrada** (`OD-D16-001`): sem `GET exports` no contrato nem chave de leitura
+  própria; a leitura hoje é modelada sobre `dashboard:audit-trail:read` como evento de trilha.
+- selo de frescor + `asOf` em todo registro.
+
+## 5. Estados
+
+- **vazio**: `dashboard.screens.exportacoes.empty`.
+- **carregando** / **erro** / **indisponível** / **desatualizado**: padrão M4.
+- **bloqueado por decisão**: não se aplica.
+- **conflito**: não se aplica (leitura pura).
+
+## 6. Comandos
+
+| Rota (contrato §4)          | Ação      | Papel          | Payload | Pós-estado                 | Erro esperado                          |
+| --------------------------- | --------- | -------------- | ------- | -------------------------- | -------------------------------------- |
+| `POST exports/{id}/approve` | `approve` | `agency-admin` | —       | libera exportação volumosa | `DASH.EXPORT_VOLUME_APPROVAL_REQUIRED` |
+
+- Aprovação nominal é ação de mérito sobre a própria exportação (não sobre objeto de domínio),
+  permitida no painel por ser tratamento próprio do DASHBOARD ([RN-DASH-101] verificação 3: "a
+  única escrita legítima é em seu próprio acervo").
+
+## 7. Saída
+
+- exportação aprovada libera o download registrado em D-10/D-11/D-16, sem sair desta tela de
+  revisão.
+
+## 8. Segurança e LGPD
+
+- N1 no registro; exportação volumosa é revisão periódica do Encarregado, não relatório sob
+  demanda ([RN-DASH-172] verificação 2); N3 nunca é exportável, em nenhum formato, para nenhum
+  papel ([RN-DASH-172] regra 4).
+
+## 9. Acessibilidade
+
+- estado "aguardando aprovação nominal" com rótulo textual explícito, não só cor.
+
+## 10. Testes
+
+- roteamento: 8 papéis (presença) e demais (ausência); N3 bloqueado; `technical-admin`/
+  GESTOR_DETRAN via passe global como caso adicional de C-01-05.
+- exportação acima do limite fica `pending-approval`; aprovação só por `agency-admin`.
+
+## Componentes compartilhados
+
+`ExportDialog`, `ClassificationBadge`, `FreshnessSeal`.
+
+## Chaves i18n
+
+- `dashboard.screens.exportacoes.title` — "Exportações"
+- `dashboard.screens.exportacoes.intro` — "Registro de exportações: quem, quando, filtros,
+  linhas, formato e finalidade."
+- `dashboard.screens.exportacoes.empty` — "Nenhuma exportação registrada."
+
+Referências (sem criar): `dashboard.states.*`, `dashboard.freshness.*`, `dashboard.errors.*`,
+`dashboard.a11y.*`.
+
+OD tocada: `OD-D16-001` (rota de leitura provisória), `OD-D16-005` (passe global).
diff --git a/docs/framework/product/transversal/dashboard/screens/IU-DASH-D-18.md b/docs/framework/product/transversal/dashboard/screens/IU-DASH-D-18.md
new file mode 100644
index 00000000..333cd72f
--- /dev/null
+++ b/docs/framework/product/transversal/dashboard/screens/IU-DASH-D-18.md
@@ -0,0 +1,94 @@
+---
+id: IU-DASH-D-18
+title: KPIs do painel — especificação de tela
+status: draft
+apps: [dashboard]
+sources: [REF-LEI-12527-2011, REF-LEI-13460-2017]
+updated: 2026-09-21
+---
+
+Ficha da rota `/monitoramento/kpis` (`dashboard-frontends.md` §4, tela D-18; tela de apoio, sem
+`P-nn` próprio).
+Fontes: [APP-DASHBOARD].
+
+## 1. Identidade
+
+- `id`: `IU-DASH-D-18`; `path`: `/monitoramento/kpis` (`route-manifest.md` #18).
+- `screen`: tela de apoio ([APP-DASHBOARD] §KPIs do próprio painel — o DASHBOARD mede a si
+  mesmo).
+- camada de produto: Contexto.
+- módulo: `catalogue`.
+- `slug`: `kpis`; segmento i18n: `kpis`.
+- página: `SelfKpiPage`; componente inteligente principal: cartões de KPI com
+  `TargetVsCeiling` quando aplicável.
+
+## 2. Acesso
+
+- `policy`: `dashboard:kpi:read` (contrato §4 `GET kpis`).
+- `access`: N0 — cobertura, MTTA, MTTR, % deveres no prazo, frescor médio
+  ([APP-DASHBOARD] §KPIs) são agregados institucionais (`route-manifest.md` §C linha D-18).
+- `roles` (presença): `agency-admin`, `dash-operator`, AUDITOR (3).
+- passe global: GESTOR_DETRAN, ADMIN, SUPORTE, `technical-admin` via §E (nenhum na matriz;
+  todos N0/N1 ≥ N0) — divergência `OD-D16-005`.
+- guardas: `authGuard` → `permissionGuard('dashboard:kpi:read')` → `layerGuard('N0')`.
+
+## 3. Entrada
+
+- de onde se chega: menu Contexto.
+
+## 4. Dados
+
+- lê `GET kpis` (contrato §4): cobertura de indicadores (% dos 42 com fonte conectada), MTTA
+  (tempo médio até `RECONHECIDO`), MTTR (tempo médio até `ENCERRADO`), % deveres cumpridos no
+  prazo, frescor médio dos painéis ([APP-DASHBOARD] §KPIs).
+- meta de cobertura MVP: 100% do bloco A (legal-ceiling), demais por onda
+  ([APP-DASHBOARD] §KPIs; `dashboard-build-pack.md` §3).
+- selo de frescor + `asOf` em cada KPI; metas propostas ainda sem calibração fina em alguns
+  itens (`APP-DASHBOARD` §KPIs marca "a calibrar").
+
+## 5. Estados
+
+- **vazio**: `dashboard.screens.kpis.empty`.
+- **carregando** / **erro** / **indisponível** / **desatualizado**: padrão M4.
+- **bloqueado por decisão**: não se aplica.
+
+## 6. Comandos
+
+- Nenhum comando — tela de leitura pura.
+
+## 7. Saída
+
+- não há navegação de mérito a partir daqui; os KPIs são indicadores de resultado do próprio
+  módulo de monitoramento.
+
+## 8. Segurança e LGPD
+
+- N0 — agregados institucionais, sem dado pessoal nem objeto de processo.
+
+## 9. Acessibilidade
+
+- meta e valor atual nunca no mesmo componente sem distinção quando o KPI envolver teto legal
+  (ex. % de processos julgados dentro do teto de 24 meses é, ao mesmo tempo, indicador interno
+  de risco e indicador público — [RN-DASH-117] verificação 3).
+
+## 10. Testes
+
+- roteamento: 3 papéis (presença) e demais (ausência); N3 bloqueado; GESTOR_DETRAN/ADMIN/
+  SUPORTE/`technical-admin` via passe global como caso adicional de C-01-05.
+- os cinco KPIs de [APP-DASHBOARD] §KPIs exibidos com selo de frescor.
+
+## Componentes compartilhados
+
+`FreshnessSeal`, `TargetVsCeiling`, `ClassificationBadge`.
+
+## Chaves i18n
+
+- `dashboard.screens.kpis.title` — "KPIs do painel"
+- `dashboard.screens.kpis.intro` — "Cobertura de indicadores, MTTA, MTTR, % de deveres no prazo
+  e frescor médio."
+- `dashboard.screens.kpis.empty` — "Nenhum KPI disponível para o período."
+
+Referências (sem criar): `dashboard.states.*`, `dashboard.freshness.*`, `dashboard.errors.*`,
+`dashboard.a11y.*`.
+
+OD tocada: `OD-D16-005` (passe global).
diff --git a/docs/meta/knowledge-base/import-manifest.json b/docs/meta/knowledge-base/import-manifest.json
index 852e1e44..6fb961b7 100644
--- a/docs/meta/knowledge-base/import-manifest.json
+++ b/docs/meta/knowledge-base/import-manifest.json
@@ -15,7 +15,7 @@
   },
   "baselines": {
     "sourceFileCount": 746,
-    "artifactIdCount": 738,
+    "artifactIdCount": 756,
     "sourceReportedCanonicalWorkflowTokenCount": 383,
     "canonicalWorkflowTokenCount": 446
   },
```
