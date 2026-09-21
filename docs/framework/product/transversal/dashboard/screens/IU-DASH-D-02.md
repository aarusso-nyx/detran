---
id: IU-DASH-D-02
title: Detalhe do alerta — especificação de tela
status: draft
apps: [dashboard]
sources: [REF-LEI-13709-2018, REF-LEI-9873-1999, REF-CTB-280-290]
updated: 2026-09-21
---

Ficha da rota `/monitoramento/alertas/:id` (`dashboard-frontends.md` §4, tela D-02; painel P-01
de [IU-DASH-001] em drill-down — sem código de painel próprio).
Fontes: [UC-DASH-002], [JRN-DASH-001], [RN-DASH-101], [RN-DASH-135].

## 1. Identidade

- `id`: `IU-DASH-D-02`; `path`: `/monitoramento/alertas/:id` (`route-manifest.md` #2).
- `screen`: tela de apoio (drill-down de P-01; sem `P-nn` próprio).
- camada de produto: Ação (`route-manifest.md` §I mostra as rotas de detalhe fora do menu, mas a
  camada da rota é Ação, `dashboard-frontends.md` §4).
- módulo: `triage`.
- `slug`: `alertas-id`; segmento i18n: `alertas_id`.
- página: `AlertDetailPage`; componente inteligente principal: `AlertCard` +
  `AlertLifecycle` (anatomia mínima e ciclo de [WF-DASH-001] com timestamps e destinatários).

## 2. Acesso

- `policy`: `dashboard:alert:read` (leitura); comandos com chaves próprias (§6).
- `access`: N1 para a anatomia mínima e o ciclo; o **objeto** do alerta (nº do processo, placa,
  equipamento) é N2 e só se identifica sob `LayerGate` com finalidade declarada
  (`route-manifest.md` §C linha D-02; contrato §2 `GET alerts/{id}` audita `DASH_ALERT_READ (N2)`).
- `roles` (presença): os mesmos 9 de D-01 (`dash-operator`, AREA-MANAGERS, `agency-admin`,
  `technical-admin`, AUDITOR). Ausência → `/monitoramento/sem-permissao`.
- passe global: GESTOR_DETRAN via §E (não na matriz); ADMIN/SUPORTE bloqueados pela camada
  (`OD-D16-005`).
- guardas: `authGuard` → `permissionGuard('dashboard:alert:read')` → `layerGuard('N1')`;
  `LayerGate` (finalidade, `X-Purpose`) antes de exibir o objeto em N2 ([RN-DASH-171]).
- gestor de área só consulta o próprio domínio (`DASH.DOMAIN_SCOPE_MISMATCH`, dinâmico no
  backend, `route-manifest.md` §C).
- pré-condição de estado: nenhuma — a tela abre em qualquer estado do ciclo de
  [WF-DASH-001].

## 3. Entrada

- de onde se chega: clique num item de D-01, ou deep-link direto ([JRN-DASH-001] passo 2).
- parâmetros de rota: `:id` (identificador do alerta).
- sem filtros de URL adicionais.

## 4. Dados

- lê `GET alerts/{id}` (contrato §2): anatomia mínima ([RN-DASH-135]: `regra_origem`, `objeto`,
  `degrau`, `emitido_em`, `destinatário`, `entregue_em`, `reconhecido_por`/`reconhecido_em`,
  `encerrado_por_estado`), ciclo completo de [WF-DASH-001], trilha imutável.
- quando `track = extinção` e o alerta chega a `CRITICO_EXTINCAO`/`INCIDENTE_REGISTRADO`, lê
  também `GET alerts/{id}/incident` (contrato §2).
- todo campo temporal carrega selo de frescor + `asOf`; nenhum prazo recalculado no cliente
  ([RN-DASH-101] verificação 4 em [AC-DASH-001-4]).
- SSE `alert.changed` atualiza o ciclo sem reload.
- blocos exibidos conforme o indicador do alerta: A, B, C, D.

## 5. Estados

- **vazio**: não se aplica (a tela sempre resolve um `:id`); alerta inexistente é
  `dashboard.errors.<code>` (404, `DASH.TENANT_MISMATCH`/genérico §6 do catálogo), tratado como
  erro de navegação, não como vazio.
- **carregando**: `dashboard.states.loading`, skeleton do `AlertCard`.
- **erro**: `dashboard.states.error` + `dashboard.errors.<code>`.
- **indisponível**: selo `INDISPONIVEL` marca o campo cuja fonte caiu (bloco B/C/D do alerta,
  quando aplicável); bloco A oculta por padrão ([WF-DASH-003] §Duas estratégias).
- **desatualizado**: `DESATUALIZADO_MARCADO` com "desde `{as_of}`".
- **bloqueado por decisão**: não se aplica.
- **sem permissão** (403, N2 sem finalidade): `DASH.PURPOSE_REQUIRED`/`DASH.LAYER_FORBIDDEN`,
  diálogo `LayerGate`.
- **conflito** (409/412): comando fora do estado (`DASH.ALERT_STATE_INVALID`), `If-Match`
  ausente/divergente nos comandos do §6.

## 6. Comandos

| Rota (contrato §2)         | Ação  | Papel                                                                                      | Pré-estado             | Payload                                           | Pós-estado       | Erro esperado                                                                 |
| -------------------------- | ----- | ------------------------------------------------------------------------------------------ | ---------------------- | ------------------------------------------------- | ---------------- | ----------------------------------------------------------------------------- |
| `POST alerts/{id}/ack`     | ack   | dono, `dash-operator` em nome do dono                                                      | `NOTIFICADO`           | `{ channel: origin\|manual, note?, onBehalfOf? }` | `RECONHECIDO`    | `DASH.ALERT_ACK_NOT_OWNER`, `DASH.ALERT_ACK_MANUAL_NOTE_REQUIRED`             |
| `POST alerts/{id}/close`   | close | `dash-operator` (trilha de irregularidade)                                                 | `VERIFICADO`           | `{ note? }`                                       | `ENCERRADO`      | `DASH.ALERT_CLOSE_WITHOUT_VERIFICATION`, `DASH.ALERT_EXTINCTION_NOT_CLOSABLE` |
| `GET alerts/{id}/incident` | read  | AREA-MANAGERS, `agency-admin`, AUDITOR (`dashboard:incident:read`, `policy.ts`; adenda A1) | `INCIDENTE_REGISTRADO` | —                                                 | apuração herdada | `DASH.ALERT_INCIDENT_NOT_FOUND`                                               |

- `If-Match` obrigatório em `ack`/`close` (contrato, `AGENTS.md` regra 4/[CODESTYLE.md]).
- Nenhum comando altera objeto de domínio ([RN-DASH-101]); a ação de mérito é `DeepLinkButton`
  ao app de origem.
- Em `CRITICO_EXTINCAO`/`INCIDENTE_REGISTRADO` o botão é "ver apuração de incidente"
  (`dashboard:incident:read`), nunca "encerrar" (`DASH.ALERT_EXTINCTION_NOT_CLOSABLE`).
- ACK `manual` é rotulado "registro manual de ciência" enquanto o app de origem não expõe evento
  de ciência ([AC-DASH-002-5]).
- botões só habilitados com `*stynxHasPermission` da mesma chave do comando; encerrar exige
  `VERIFICADO` (evidência da origem, nunca autodeclaração, [AC-DASH-002-4]).

## 7. Saída

- `DeepLinkButton` leva ao objeto na origem (RAIT/PEC/BOAT/TEAT), preservando ali autenticação e
  trilha próprias.
- após `ack`, a tela permanece em D-02 com o ciclo atualizado; após `close`, o card reflete
  `ENCERRADO`; a fila de D-01 atualiza via SSE sem reload.
- "ver apuração de incidente" leva à apuração herdada do protocolo WF-RAIT-002 §4.1.

## 8. Segurança e LGPD

- camada N1 na anatomia mínima; N2 no objeto, sob `LayerGate` com finalidade e consulta
  registrada ([RN-DASH-171]); N3 nunca (dado de saúde de vítima, biometria, bodycam —
  [RN-DASH-170]).
- gestor de área só no próprio domínio (`DASH.DOMAIN_SCOPE_MISMATCH`).
- trilha do alerta é prova de diligência e não se apaga ([AC-DASH-002-3]); reconhecer não
  resolve — o alerta só encerra quando o estado subjacente muda no app de origem
  ([RN-DASH-135] princípio 1).
- classificação P1/P2/P3 antes de exibir; nada sensível em URL/log.

## 9. Acessibilidade

- severidade por forma + rótulo, nunca só cor; cor e ícone próprios em
  CRITICO_EXTINCAO/INCIDENTE_REGISTRADO ([WF-DASH-001] §Distinção).
- `aria-live` no ciclo e no selo de frescor, que mudam via SSE.
- botão "encerrar" desabilitado com motivo visível quando faltar verificação
  (`dashboard-error-catalog.md` §7).

## 10. Testes

- roteamento: 9 papéis ativos (presença) e os demais (ausência) → sem-permissão; N3 bloqueado.
- os seis estados aplicáveis (vazio não se aplica; ver §5) como critérios.
- N2 sem finalidade nunca revela o objeto ([C-01-09]); `LayerGate` registra finalidade.
- comando `ack`/`close` respeita pré-estado e `If-Match`; ligados a [AC-DASH-002-1],
  [AC-DASH-002-4], [AC-DASH-002-5].
- matriz por comando (C-01-11): `ack` positivo para `dash-operator` e os donos
  (AREA-MANAGERS, `agency-admin`, `technical-admin`, `integration-operator`), `close` só
  `dash-operator`, `incident:read` para AREA-MANAGERS, `agency-admin`, AUDITOR — e negativa para
  todos os demais códigos canônicos; a checagem dinâmica de dono (`DASH.ALERT_ACK_NOT_OWNER`)
  vem depois da política, nunca a substitui.
- "ver apuração de incidente" nunca oferece "encerrar" em trilha de extinção.

## Componentes compartilhados

`FreshnessSeal`, `SeverityChip`, `AlertCard`, `AlertLifecycle`, `ClockGovernorBadge`,
`LegalBasisTag`, `LayerGate`, `DeepLinkButton`, `ClassificationBadge`.

## Chaves i18n

- `dashboard.screens.alertas_id.title` — "Detalhe do alerta"
- `dashboard.screens.alertas_id.intro` — "Anatomia mínima, ciclo do alerta, ACK e deep-link ao
  objeto na origem."
- `dashboard.screens.alertas_id.empty` — "Alerta não encontrado."

Referências (sem criar): `dashboard.states.*`, `dashboard.freshness.*`, `dashboard.severity.*`,
`dashboard.alert_states.*`, `dashboard.errors.*`, `dashboard.common.fixed.see_incident_inquiry`,
`dashboard.common.fixed.manual_acknowledgement`, `dashboard.common.manual`,
`dashboard.forms.ack_alerta.*`, `dashboard.forms.encerrar_alerta.*`,
`dashboard.forms.finalidade_n2.*`, `dashboard.a11y.*`.
