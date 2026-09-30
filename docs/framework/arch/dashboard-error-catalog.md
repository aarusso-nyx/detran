---
id: ARCH-DASHBOARD-ERRORS
title: Catálogo de erros do DASHBOARD — ciclo do alerta, deveres periódicos, frescor, camadas de acesso, exportação e catálogo
status: draft
apps: [dashboard]
updated: 2026-09-13
---

# Catálogo de erros do DASHBOARD

Mesmo envelope e famílias de `rait-error-catalog.md` §1–§2, prefixo `DASH.`. Regras próprias:
`context` nunca carrega conteúdo de camada N2/N3 (só ids, códigos de indicador, estados e
contagens); a indisponibilidade de uma fonte **não é erro** para o cliente, é o estado
`INDISPONIVEL` no selo de frescor ([WF-DASH-003]), e só vira erro quando um comando depende do
dado.

## 1. Ciclo do alerta

| Código                                  | Status | Quando                                                                                                                                                                               | `context`                              | Base                     |
| --------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------- | ------------------------ |
| `DASH.ALERT_STATE_INVALID`              | 409    | comando fora do estado de [WF-DASH-001]                                                                                                                                              | `alertId`, `currentState`, `allowed[]` | [WF-DASH-001]            |
| `DASH.ALERT_ACK_NOT_OWNER`              | 403    | ACK por quem não é dono nem operador em nome do dono                                                                                                                                 | `ownerRole`                            | [UC-DASH-002]            |
| `DASH.ALERT_ACK_MANUAL_NOTE_REQUIRED`   | 422    | ACK `manual` sem nota                                                                                                                                                                | —                                      | AC-DASH-002-5            |
| `DASH.ALERT_CLOSE_WITHOUT_VERIFICATION` | 409    | encerrar antes de `VERIFICADO` (evidência da origem)                                                                                                                                 | `currentState`                         | AC-DASH-002-4            |
| `DASH.ALERT_EXTINCTION_NOT_CLOSABLE`    | 409    | tentativa de encerrar alerta de trilha de extinção (`CRITICO_EXTINCAO`, `INCIDENTE_REGISTRADO`)                                                                                      | `track`                                | [WF-DASH-001] §Distinção |
| `DASH.ALERT_BUSINESS_ACT_FORBIDDEN`     | —      | **retirado (OD-D58, R-0026)**: não é emitido; [RN-DASH-101] é garantido pela ausência de rota de ato de negócio (404) e pelo corpo de comando estrito (400 `DASH.VALIDATION_FAILED`) | —                                      | [RN-DASH-101]            |
| `DASH.ALERT_SOURCE_STALE`               | 409    | comando sobre alerta cuja fonte está `INDISPONIVEL`/`DESATUALIZADO_MARCADO`                                                                                                          | `indicator`, `freshness`               | [WF-DASH-003]            |
| `DASH.ALERT_INCIDENT_NOT_FOUND`         | 404    | apuração de incidente inexistente para o alerta                                                                                                                                      | `alertId`                              | WF-RAIT-002 §4.1         |
| `DASH.ROOT_CAUSE_CATEGORY_INVALID`      | 400    | categoria fora de transporte/aceite/conteúdo                                                                                                                                         | `allowed[]`                            | [JRN-DASH-004]           |

## 2. Deveres periódicos

| Código                            | Status | Quando                                                                     | `context`                          | Base          |
| --------------------------------- | ------ | -------------------------------------------------------------------------- | ---------------------------------- | ------------- |
| `DASH.DUTY_STATE_INVALID`         | 409    | transição fora de [WF-DASH-002]                                            | `dutyId`, `period`, `currentState` | [WF-DASH-002] |
| `DASH.DUTY_EVIDENCE_REQUIRED`     | 422    | `COMPROVADO` sem protocolo/captura/hash                                    | `missing[]`                        | AC-DASH-003-1 |
| `DASH.DUTY_EVIDENCE_HASH_INVALID` | 422    | hash malformado ou não confere com a captura                               | —                                  | [RN-DASH-135] |
| `DASH.DUTY_PERIOD_INVALID`        | 400    | período fora da periodicidade do dever                                     | `periodicity`                      | [RN-DASH-120] |
| `DASH.DUTY_NO_LEGAL_DEADLINE`     | 422    | tentativa de fixar data-limite em dever "sem prazo definido" (204/205/208) | `dutyId`                           | [RN-DASH-113] |
| `DASH.DUTY_NOT_OWNER`             | 403    | quem avança o ciclo não é dono do dever                                    | `ownerRole`                        | [UC-DASH-003] |
| `DASH.DUTY_ALREADY_ARCHIVED`      | 409    | comando sobre ciclo `ARQUIVADO`/`NAO_CUMPRIDO`                             | `currentState`                     | [WF-DASH-002] |

## 3. Camadas de acesso e auditoria

| Código                        | Status | Quando                                                    | `context`                | Base                         |
| ----------------------------- | ------ | --------------------------------------------------------- | ------------------------ | ---------------------------- |
| `DASH.LAYER_FORBIDDEN`        | 403    | papel sem a camada exigida pelo recorte                   | `requiredLayer`, `roles` | [RN-DASH-170]                |
| `DASH.LAYER_N3_NEVER`         | 403    | qualquer pedido de dado sensível pelo painel              | —                        | [RN-DASH-170], [RN-DASH-162] |
| `DASH.PURPOSE_REQUIRED`       | 400    | leitura N2 sem `X-Purpose`                                | `allowed[]`              | [RN-DASH-171]                |
| `DASH.PURPOSE_INVALID`        | 400    | finalidade fora do catálogo                               | `allowed[]`              | [RN-DASH-171]                |
| `DASH.DOMAIN_SCOPE_MISMATCH`  | 403    | gestor de área consultando N2 de outro domínio            | `domain`                 | [RN-DASH-170]                |
| `DASH.CLASSIFICATION_MISSING` | 422    | indicador sem P1/P2/P3 não pode ser exibido nem exportado | `indicator`              | [RN-DASH-142]                |

## 4. Exportação, dados abertos e agregação

| Código                                   | Status | Quando                                                                     | `context`                      | Base                  |
| ---------------------------------------- | ------ | -------------------------------------------------------------------------- | ------------------------------ | --------------------- |
| `DASH.EXPORT_LAYER_EXCEEDED`             | 403    | exportação de recorte acima da camada do papel                             | `requiredLayer`                | [RN-DASH-172] regra 1 |
| `DASH.EXPORT_N3_FORBIDDEN`               | 403    | exportação de dado sensível "em nenhum formato, para nenhum papel"         | —                              | [RN-DASH-172] regra 4 |
| `DASH.EXPORT_VOLUME_APPROVAL_REQUIRED`   | 202    | volume acima do limite; fica `pending-approval`                            | `rows`, `limit`, `exportId`    | [RN-DASH-172] regra 5 |
| `DASH.EXPORT_FORMAT_NOT_OPEN`            | 400    | formato proprietário                                                       | `allowed[]`                    | [RN-DASH-151]         |
| `DASH.EXPORT_PURPOSE_REQUIRED`           | 400    | exportação N2 sem finalidade                                               | —                              | [RN-DASH-172] regra 2 |
| `DASH.EXPORT_STATE_INVALID`              | 409    | `approve` de exportação fora de `pending-approval`                         | `exportId`, `currentState`     | OD-D35 (R-0026)       |
| `DASH.CELL_SUPPRESSED`                   | —      | aviso: células abaixo do limiar suprimidas (primária e secundária)         | `suppressedCells`, `threshold` | [RN-DASH-161]         |
| `DASH.CELL_THRESHOLD_UNDEFINED`          | 422    | publicação/exportação agregada enquanto o limiar não é decidido            | `parameterKey`                 | DT-029                |
| `DASH.DATASET_REQUIREMENTS_UNMET`        | 422    | dataset aberto sem um dos sete requisitos                                  | `missing[]`                    | [RN-DASH-151]         |
| `DASH.OPEN_DATA_PARAMETERIZED_FORBIDDEN` | 400    | API pública chamada com filtro livre (só pré-agregados)                    | —                              | [RN-DASH-151]         |
| `DASH.RANKING_OF_PERSONS_FORBIDDEN`      | 403    | comparativo pedindo ordenação nominal de pessoas fora de N2 com finalidade | —                              | AC-DASH-005-4         |

## 5. Catálogo, relatórios e fontes

| Código                                    | Status | Quando                                                                                      | `context`                                        | Base                      |
| ----------------------------------------- | ------ | ------------------------------------------------------------------------------------------- | ------------------------------------------------ | ------------------------- |
| `DASH.INDICATOR_NOT_IN_CATALOG`           | 404    | código fora dos 42 indicadores                                                              | `code`                                           | [APP-DASHBOARD] §Catálogo |
| `DASH.INDICATOR_CLOCK_CODE_INVALID`       | 400    | letra de relógio fora de A/B/C/D                                                            | `allowed[]`                                      | [RN-DASH-131]             |
| `DASH.INDICATOR_THRESHOLD_NOT_CALIBRATED` | 422    | publicar configuração de indicador técnico sem limiar (401/402/403/406)                     | `code`                                           | DT-030 (calibração SRE)   |
| `DASH.INDICATOR_TARGET_AND_CEILING_MIXED` | 422    | configuração que junta meta operacional e teto legal no mesmo componente                    | `code`                                           | [WF-RAIT-002] §4.5        |
| `DASH.INDICATOR_LATENCY_INVALID`          | 400    | latência aceitável fora da faixa do bloco                                                   | `block`, `range`                                 | [WF-DASH-003]             |
| `DASH.INDICATOR_CONFIG_STATE_INVALID`     | 409    | `update`/`publish` de configuração de indicador cujo `status` corrente não admite o comando | `indicatorConfigId`, `currentState`, `allowed[]` | OD-D35 (R-0026)           |
| `DASH.PANEL_STATE_INVALID`                | 409    | `update`/`publish` de painel cujo `status` corrente não admite o comando                    | `panelId`, `currentState`, `allowed[]`           | OD-D35 (R-0026)           |
| `DASH.REPORT_STATE_INVALID`               | 409    | `complete`/`fail` fora de `processing`                                                      | `currentState`                                   | origem `generated-report` |
| `DASH.REPORT_TYPE_INVALID`                | 400    | `report_type` fora do catálogo                                                              | `allowed[]`                                      | origem                    |
| `DASH.REPORT_FILE_HASH_MISMATCH`          | 422    | hash do arquivo não confere                                                                 | —                                                | origem `file_hash`        |
| `DASH.SOURCE_UNAVAILABLE`                 | 503    | leitura direta (fallback) da origem falhou; selo passa a `INDISPONIVEL`                     | `source`, `lastSeenAt`                           | [WF-DASH-003]             |
| `DASH.SOURCE_HEARTBEAT_UNDEFINED`         | 422    | fonte sem contrato de heartbeat não pode ser marcada `FRESCO`                               | `source`                                         | [WF-DASH-003]             |
| `DASH.PANEL_BLOCKED_BY_DECISION`          | 423    | painel P-09 (ou parte de P-08) requisitado antes da decisão que o libera                    | `panel`, `decision`                              | DT-029, DT-066            |

## 6. Genéricos

`DASH.AUTH_REQUIRED` 401, `DASH.FORBIDDEN_ACTION` 403, `DASH.TENANT_MISMATCH` 404,
`DASH.VALIDATION_FAILED` 400, `DASH.ENUM_INVALID` 400, `DASH.IF_MATCH_REQUIRED` 428,
`DASH.VERSION_CONFLICT` 412, `DASH.IDEMPOTENCY_REPLAY` 409, `DASH.INTERNAL` 500.

## 7. Mapeamento para a interface

| Situação                     | Tratamento                                                                                         |
| ---------------------------- | -------------------------------------------------------------------------------------------------- |
| fonte indisponível           | não é erro: selo `INDISPONIVEL`, valor oculto (bloco A) ou marcado (B/C/D); página de frescor D-15 |
| encerrar sem verificação     | botão desabilitado com motivo; D-02 mostra o que falta                                             |
| trilha de extinção           | botão "ver apuração de incidente"; nenhum "encerrar"                                               |
| N2 sem finalidade            | diálogo `LayerGate` antes da consulta                                                              |
| exportação volumosa          | estado "aguardando aprovação nominal" em D-17                                                      |
| célula suprimida             | célula com marca "suprimida (limiar)" e nota de rodapé, nunca zero                                 |
| painel bloqueado por decisão | placeholder com a decisão pendente e o link para o registro                                        |

Chaves i18n: `dashboard.errors.<code>` em `i18n/dashboard.pt-BR.json`.
