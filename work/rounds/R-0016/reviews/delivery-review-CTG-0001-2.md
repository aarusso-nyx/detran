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

**Segundo ciclo — restrito** (método §5; rubrica §Ciclos): avalie **somente** as correções dos quatro
achados de `work/rounds/R-0016/reviews/delivery-review-CTG-0001.json`. Achado novo sobre texto
inalterado só se for FAIL por definição, explicando por que não foi levantado antes.

1. Achado 1 (D-09, item 5): §6 e §10 reescritos — `prove` exige **ao menos uma** evidência
   (protocolo, captura ou hash), três casos válidos isolados + ausência total →
   `DASH.DUTY_EVIDENCE_REQUIRED`; a divergência `dashboard-frontends.md` §7 / contrato §3 ×
   [UC-DASH-003] é registrada como OD-D16-011 (`contracts/CTG-0001.md` §5) e resolvida pela regra
   "vale o artefato de produto" (cabeçalho de `dashboard-frontends.md`).
2. Achado 2 (D-02, item 13): linha `GET alerts/{id}/incident` com `agency-admin` (policy.ts,
   adenda A1); §10 ganha a matriz por comando (positivos literais + negativas para os demais
   códigos canônicos; dono dinâmico depois da política).
3. Achado 3 (contrato, item 13): novo critério **C-01-11** — matriz por comando `dashboard:*:*` ×
   36 códigos, positivos literais de `DASHBOARD_RULES` (+ passe global §E), negativas exaustivas;
   checagens dinâmicas provadas à parte.
4. Achado 4 (contrato, item 4): C-01-04 passa a **307** com as 5 `dashboard.severity.shape.*`
   como exclusão temporária condicionada a OD-D16-009 (adenda A4).

Correções aplicadas pelo maestro como Architect (dono de `docs/` e dos contratos), registradas em
`plan.md` §Triagem; gates `docs:kb:check` (756/446) e `format:check` verdes após a correção.

### Diff das correções nas fichas (`git diff -- IU-DASH-D-02.md IU-DASH-D-09.md`)

```diff
diff --git a/docs/framework/product/transversal/dashboard/screens/IU-DASH-D-02.md b/docs/framework/product/transversal/dashboard/screens/IU-DASH-D-02.md
new file mode 100644
index 00000000..33117aef
--- /dev/null
+++ b/docs/framework/product/transversal/dashboard/screens/IU-DASH-D-02.md
@@ -0,0 +1,151 @@
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
+| Rota (contrato §2)         | Ação  | Papel                                                                                      | Pré-estado             | Payload                                           | Pós-estado       | Erro esperado                                                                 |
+| -------------------------- | ----- | ------------------------------------------------------------------------------------------ | ---------------------- | ------------------------------------------------- | ---------------- | ----------------------------------------------------------------------------- |
+| `POST alerts/{id}/ack`     | ack   | dono, `dash-operator` em nome do dono                                                      | `NOTIFICADO`           | `{ channel: origin\|manual, note?, onBehalfOf? }` | `RECONHECIDO`    | `DASH.ALERT_ACK_NOT_OWNER`, `DASH.ALERT_ACK_MANUAL_NOTE_REQUIRED`             |
+| `POST alerts/{id}/close`   | close | `dash-operator` (trilha de irregularidade)                                                 | `VERIFICADO`           | `{ note? }`                                       | `ENCERRADO`      | `DASH.ALERT_CLOSE_WITHOUT_VERIFICATION`, `DASH.ALERT_EXTINCTION_NOT_CLOSABLE` |
+| `GET alerts/{id}/incident` | read  | AREA-MANAGERS, `agency-admin`, AUDITOR (`dashboard:incident:read`, `policy.ts`; adenda A1) | `INCIDENTE_REGISTRADO` | —                                                 | apuração herdada | `DASH.ALERT_INCIDENT_NOT_FOUND`                                               |
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
+- matriz por comando (C-01-11): `ack` positivo para `dash-operator` e os donos
+  (AREA-MANAGERS, `agency-admin`, `technical-admin`, `integration-operator`), `close` só
+  `dash-operator`, `incident:read` para AREA-MANAGERS, `agency-admin`, AUDITOR — e negativa para
+  todos os demais códigos canônicos; a checagem dinâmica de dono (`DASH.ALERT_ACK_NOT_OWNER`)
+  vem depois da política, nunca a substitui.
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
diff --git a/docs/framework/product/transversal/dashboard/screens/IU-DASH-D-09.md b/docs/framework/product/transversal/dashboard/screens/IU-DASH-D-09.md
new file mode 100644
index 00000000..632d8bbb
--- /dev/null
+++ b/docs/framework/product/transversal/dashboard/screens/IU-DASH-D-09.md
@@ -0,0 +1,113 @@
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
+  deveres do DASHBOARD ([RN-DASH-101]). `prove` exige **ao menos uma** evidência — protocolo,
+  captura **ou** hash do arquivo publicado ([UC-DASH-003] critério [AC-DASH-003-1]); ausência
+  total → `DASH.DUTY_EVIDENCE_REQUIRED` com `missing[]`; hash presente mas malformado ou que não
+  confere com a captura → `DASH.DUTY_EVIDENCE_HASH_INVALID`. Onde `dashboard-frontends.md` §7
+  ("evidência completa") e o contrato §3 (`hash` sem `?`) divergem do caso de uso, vale o artefato
+  de produto (cabeçalho de `dashboard-frontends.md`); divergência registrada como OD-D16-011.
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
+- transições respeitam pré-estado ([WF-DASH-002]); `prove` com só protocolo, só captura ou só
+  hash avança a `COMPROVADO` (três casos válidos, isolados); `prove` sem nenhuma evidência falha
+  com `DASH.DUTY_EVIDENCE_REQUIRED` ([AC-DASH-003-1]); ligados a [AC-DASH-003-2] (relógio do FUNSET) e [AC-DASH-003-3] (sanção
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
```

### Diff das correções no contrato (`git diff HEAD -- contracts/CTG-0001.md`)

```diff
diff --git a/work/rounds/R-0016/contracts/CTG-0001.md b/work/rounds/R-0016/contracts/CTG-0001.md
index 70a12070..0d2acbe2 100644
--- a/work/rounds/R-0016/contracts/CTG-0001.md
+++ b/work/rounds/R-0016/contracts/CTG-0001.md
@@ -270,7 +270,9 @@ Transcrição independente: o Inspector copia `route-manifest.md` §A, §D, §E
   42 chaves `dashboard.indicators.ind_dash_nnn` com texto igual à coluna Nome de [APP-DASHBOARD]
   §Catálogo; 52 `dashboard.errors.*` iguais aos códigos do catálogo de erros em minúsculas; 10
   `alert_states`, 8 `duty_states`, 4 `freshness`, 4 `layers`, 4 `blocks`, 3 `classification`;
-  `dashboard.clocks` só com `b` e `c` (até OD-D16-007); total 312.
+  `dashboard.clocks` só com `b` e `c` (até OD-D16-007); as 5 `dashboard.severity.shape.*` de
+  §1.2 **ausentes** até OD-D16-009 (exclusão temporária, adenda A4 do plano) — total **307**
+  (312 − 5); quando a OD fechar, o total volta a 312 sem outra mudança de contrato.
 - **C-01-05** dada cada rota com ficha × cada um dos 36 códigos de `DETRAN_ROLES` (sessão com só
   esse papel), quando se navega ao `path`, então o resultado é **ativa** se o papel ∈ `roles` do
   manifesto §A (∩ camada ≥ `access`, §D) **ou** ∈ `GLOBAL_ADMIN_ROLES` com camada ≥ `access` (§E),
@@ -289,20 +291,31 @@ Transcrição independente: o Inspector copia `route-manifest.md` §A, §D, §E
 - **C-01-10** dada a lista de rotas do app (`DASHBOARD_ROUTES`), quando comparada ao manifesto,
   então os `path` são exatamente os 20 de §A mais os 2 de §B e a coringa `**`; a ordem do menu
   segue §I e cada item só aparece quando os guardas da rota passam.
+- **C-01-11** dado cada comando com grant próprio nas fichas (`dashboard:alert:ack|treat|close|annotate`,
+  `dashboard:incident:read`, `dashboard:duty-cycle:start|prepare|submit|prove|archive`,
+  `dashboard:indicator-config:update|publish`, `dashboard:generated-report:request`,
+  `dashboard:export:create|approve`, `dashboard:transparency-audit:audit`) × cada um dos 36 códigos
+  de `DETRAN_ROLES`, quando a UI decide exibir/habilitar o controle, então o resultado é positivo
+  exatamente para os papéis literais de `DASHBOARD_RULES` (mais `GLOBAL_ADMIN_ROLES` pelo passe
+  global, §E) e negativo para **todos** os demais códigos canônicos — sem amostragem, sem
+  analogia; as checagens dinâmicas (dono do alerta/dever, domínio do gestor, `X-Purpose`) são
+  provadas separadamente e nunca substituem a matriz.

 ## 5. `OD-D16-nnn` propostas (numeradas em sequência; nunca decididas aqui)

-| OD         | Questão                                                                                                                                                                                                                                                                                   | Provisório adotado                                                                                                              | Decisor                            |
-| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
-| OD-D16-001 | D-17 sem `GET exports` no contrato §4 e sem `dashboard:export:read` em `policy.ts`                                                                                                                                                                                                        | `dashboard:audit-trail:read`, N1 (`route-manifest.md` §F)                                                                       | Architect / R-0011                 |
-| OD-D16-002 | radares D-03/D-04/D-05 e P-09 (D-13) sem rota `GET` das projeções (contrato §6) nem chave de leitura própria                                                                                                                                                                              | `dashboard:alert:read` (radares), `dashboard:comparison:read` (D-13)                                                            | Architect / R-0011                 |
-| OD-D16-003 | `dashboard-frontends.md` §3 × `policy.ts` (agency-admin sem `source:read`; bi-analyst sem `transparency-audit:read`; technical-admin com `alert:read`)                                                                                                                                    | `policy.ts` (executado)                                                                                                         | Architect (adenda §3)              |
-| OD-D16-004 | contrato §2–§4 × `policy.ts` (`GET sources`, `GET kpis`, `GET transparency/checklist`, `GET alerts/{id}/incident`, `POST exports` — `route-manifest.md` §F)                                                                                                                               | `policy.ts`                                                                                                                     | Architect (adenda §2–§4)           |
-| OD-D16-005 | passe global de `GLOBAL_ADMIN_ROLES` alcança `dashboard:*` contra [RN-DASH-170] verificação 3 (technical-admin abre D-10/D-13/D-17/D-18; ADMIN/SUPORTE abrem as N0)                                                                                                                       | o app espelha o executado; matriz C-01-05 inclui o passe                                                                        | Owner / Engineer-backend           |
-| OD-D16-006 | de onde o app obtém a camada do usuário: `@detran/shared` exporta só `.` (arrasta `@nestjs/*`, `@stynx-nyx/backend`); proposta A: subpath export `@detran/shared/policy` (`policy.ts` + `roles.ts` são puros); proposta B: `GET /v1/dashboard/me { layer, roles, permissions }` em R-0011 | transcrição literal de `DASHBOARD_LAYER_BY_ROLE` em `core/layer-table.ts` com prova do Inspector (`CTG-0002.md` §Decisões 4)    | Architect / Engineer-backend       |
-| OD-D16-007 | rótulos dos relógios `a` e `d` não nomeados nas fontes da lista fechada (só `b`/`c` em [JRN-DASH-002] linha 44); [RN-DASH-131] (fora da lista) nomeia os quatro no título                                                                                                                 | chaves `a`/`d` ausentes; badge mostra só a letra                                                                                | Architect (adenda; lê RN-DASH-131) |
-| OD-D16-008 | forma canônica dos tokens das 6 finalidades N2 (`dashboard.purposes_n2`, OD-D08/H.54) — o catálogo dá nomes, não tokens                                                                                                                                                                   | `supervisao`, `auditoria`, `apuracao`, `resposta_ao_titular`, `estatistica`, `suporte` (composição M5 sobre os nomes de OD-D08) | Architect / R-0011 (seed)          |
-| OD-D16-009 | vocabulário de formas do `SeverityChip` (nome da forma por nível, `dashboard.severity.shape.*`) — nenhuma fonte fixa a forma                                                                                                                                                              | `CTG-0002.md` §Decisões 2 (cinco formas distintas, ordenadas)                                                                   | Owner (UX)                         |
+| OD         | Questão                                                                                                                                                                                                                                                                                                                      | Provisório adotado                                                                                                              | Decisor                                                    |
+| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
+| OD-D16-001 | D-17 sem `GET exports` no contrato §4 e sem `dashboard:export:read` em `policy.ts`                                                                                                                                                                                                                                           | `dashboard:audit-trail:read`, N1 (`route-manifest.md` §F)                                                                       | Architect / R-0011                                         |
+| OD-D16-002 | radares D-03/D-04/D-05 e P-09 (D-13) sem rota `GET` das projeções (contrato §6) nem chave de leitura própria                                                                                                                                                                                                                 | `dashboard:alert:read` (radares), `dashboard:comparison:read` (D-13)                                                            | Architect / R-0011                                         |
+| OD-D16-003 | `dashboard-frontends.md` §3 × `policy.ts` (agency-admin sem `source:read`; bi-analyst sem `transparency-audit:read`; technical-admin com `alert:read`)                                                                                                                                                                       | `policy.ts` (executado)                                                                                                         | Architect (adenda §3)                                      |
+| OD-D16-004 | contrato §2–§4 × `policy.ts` (`GET sources`, `GET kpis`, `GET transparency/checklist`, `GET alerts/{id}/incident`, `POST exports` — `route-manifest.md` §F)                                                                                                                                                                  | `policy.ts`                                                                                                                     | Architect (adenda §2–§4)                                   |
+| OD-D16-005 | passe global de `GLOBAL_ADMIN_ROLES` alcança `dashboard:*` contra [RN-DASH-170] verificação 3 (technical-admin abre D-10/D-13/D-17/D-18; ADMIN/SUPORTE abrem as N0)                                                                                                                                                          | o app espelha o executado; matriz C-01-05 inclui o passe                                                                        | Owner / Engineer-backend                                   |
+| OD-D16-006 | de onde o app obtém a camada do usuário: `@detran/shared` exporta só `.` (arrasta `@nestjs/*`, `@stynx-nyx/backend`); proposta A: subpath export `@detran/shared/policy` (`policy.ts` + `roles.ts` são puros); proposta B: `GET /v1/dashboard/me { layer, roles, permissions }` em R-0011                                    | transcrição literal de `DASHBOARD_LAYER_BY_ROLE` em `core/layer-table.ts` com prova do Inspector (`CTG-0002.md` §Decisões 4)    | Architect / Engineer-backend                               |
+| OD-D16-007 | rótulos dos relógios `a` e `d` não nomeados nas fontes da lista fechada (só `b`/`c` em [JRN-DASH-002] linha 44); [RN-DASH-131] (fora da lista) nomeia os quatro no título                                                                                                                                                    | chaves `a`/`d` ausentes; badge mostra só a letra                                                                                | Architect (adenda; lê RN-DASH-131)                         |
+| OD-D16-008 | forma canônica dos tokens das 6 finalidades N2 (`dashboard.purposes_n2`, OD-D08/H.54) — o catálogo dá nomes, não tokens                                                                                                                                                                                                      | `supervisao`, `auditoria`, `apuracao`, `resposta_ao_titular`, `estatistica`, `suporte` (composição M5 sobre os nomes de OD-D08) | Architect / R-0011 (seed)                                  |
+| OD-D16-009 | vocabulário de formas do `SeverityChip` (nome da forma por nível, `dashboard.severity.shape.*`) — nenhuma fonte fixa a forma                                                                                                                                                                                                 | `CTG-0002.md` §Decisões 2 (cinco formas distintas, ordenadas)                                                                   | Owner (UX)                                                 |
+| OD-D16-010 | D-16 lista e acompanha `generated-reports`, mas o contrato de rotas §4 só documenta `POST generated-reports` e `POST …/complete\|fail` — faltam `GET generated-reports` e `GET generated-reports/{id}` (TASK-0002)                                                                                                           | ficha descreve a leitura; R-0011 publica as rotas `GET`                                                                         | Architect / R-0011                                         |
+| OD-D16-011 | evidência de `prove` (D-09): [UC-DASH-003] [AC-DASH-003-1] aceita protocolo, captura **ou** hash; `dashboard-frontends.md` §7 diz "evidência completa" e o contrato §3 põe `hash` sem `?` — vale o artefato de produto (cabeçalho de `dashboard-frontends.md`); alinhar §7 e o contrato (delivery-review CTG-0001, achado 1) | ao menos uma evidência; três casos válidos isolados + ausência total (`DASH.DUTY_EVIDENCE_REQUIRED`)                            | Architect (TASK-0007 corrige §7; R-0011 alinha o contrato) |

 Biblioteca de gráficos: nenhuma proposta — `detran-ui-guide.md` §2 e `packages/ui` não admitem
 biblioteca de gráficos, e M8 fixa SVG inline em `shared/` (`CTG-0002.md` §Decisões 2); nenhuma
```
