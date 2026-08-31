---
id: UC-TEAT-003
title: Agente anexa evidência com cadeia de custódia
status: approved
apps: [teat]
sources:
  [
    'teat:docs/framework/product/blueprints/BP-EVIDENCE-CUSTODY-001.json',
    'teat:docs/framework/product/workflows/evidence-custody.md',
    'teat:docs/meta/prototypes/docs/RN-1_Regras_de_Negocio_Talonario_Eletronico.md',
  ]
updated: 2026-08-26
---

## Ator e objetivo

Agente de trânsito captura evidência (foto, vídeo, áudio, leitura de equipamento) durante a
lavratura de um AIT, medida administrativa, procedimento de etilômetro ou sinistro, garantindo
hash verificável e vínculo formal ao ato desde a captura.

## Pré-condições

Ato legal em rascunho/aberto ao qual a evidência será vinculada (`entity_type`+`entity_id` de
`EvidenceLink`).

## Fluxo principal

1. Agente captura mídia no dispositivo (tela `ait-evidence`/`crash-evidence`, conforme o ato).
2. Aplicativo computa hash (sha256) da mídia **no momento da captura**, localmente.
3. Registro `Evidence` é criado com `status = captured`, `hash_algorithm`, `hash_value`,
   `captured_by_user_ref`, `agent_id`, `device_id`, `captured_at`, `location_json`.
4. `EvidenceLink` vincula a evidência ao ato legal (`entity_type`, `entity_id`, `role`,
   `mandatory`).
5. Evento de custódia inicial é apensado (`CustodyEvent`, `event_type = captured`).
6. Se offline, a evidência permanece cifrada localmente até a transmissão (RN-EVD-009).
7. No envio (ver [UC-TEAT-005]), evidência é transmitida; estado avança `pending_upload →
uploaded → validated`.
8. Ao vincular a um pacote probatório (`traffic-authority`/`auditor`), sistema gera
   `ProbativePackage` com `manifest_hash` imutável, reunindo evidências, hashes, assinaturas, logs
   e protocolos do ato (RN-EVD-012).

## Fluxos alternativos / exceções

- **6a.** Falha na transmissão da evidência: ato legal associado **não é apagado**; pendência
  explícita é mantida até nova tentativa (RN-EVD-010).
- **7a.** Hash divergente na validação: evidência marcada `invalid`/`quarantined`, nunca
  silenciosamente substituída.
- **Correção/invalidação:** agente não pode apagar fisicamente evidência vinculada; apenas
  invalidar ou substituir por fluxo formal, preservando o registro original (RN-EVD-004/005).

## Pós-condições

Evidência com hash, vínculo e ao menos um evento de custódia registrados; disponível para compor
pacote probatório quando o ato for questionado em defesa/recurso ([WF-INF-001]).

## Critérios de aceitação

**AC-TEAT-003-1 — o hash nasce na captura, no dispositivo**

- **Dado** uma mídia capturada em campo, com ou sem conectividade
- **Quando** a captura conclui
- **Então** o sha256 é computado localmente naquele instante e persistido com a evidência — nunca
  calculado no servidor no momento do upload ([RN-TEAT-002])

**AC-TEAT-003-2 — evidência sem vínculo e sem custódia não existe**

- **Dado** uma evidência criada
- **Quando** ela é persistida
- **Então** existem obrigatoriamente um `EvidenceLink` ao ato e ao menos um `CustodyEvent`
  ([RN-TEAT-002]); uma mídia solta no dispositivo não é evidência do ato

**AC-TEAT-003-3 — hash divergente quarentena, não substitui**

- **Dado** uma evidência cujo hash na validação difere do hash de captura
- **Quando** a divergência é detectada
- **Então** a evidência é marcada `invalid`/`quarantined` com o evento de custódia correspondente,
  e em nenhuma hipótese é substituída silenciosamente

**AC-TEAT-003-4 — falha de transmissão não apaga o ato**

- **Dado** um ato legal cuja evidência falha ao transmitir
- **Quando** a falha ocorre
- **Então** o ato permanece íntegro com pendência explícita de evidência, visível ao agente e à
  retaguarda — nunca ausência silenciosa

**AC-TEAT-003-5 — o agente não apaga evidência vinculada**

- **Dado** uma evidência já vinculada a um ato
- **Quando** o agente tenta removê-la
- **Então** a exclusão física é impossível; só existe invalidar ou substituir por fluxo formal,
  preservando o registro original

**AC-TEAT-003-6 — a fila local é cifrada e auditável**

- **Dado** evidências e atos aguardando transmissão no dispositivo
- **Quando** repousam na fila
- **Então** estão sob armazenamento cifrado, com trilha de operações e identificação de
  equipamento, conforme os requisitos normativos do talão ([RN-TEAT-112])

## Regras aplicáveis

- [RN-TEAT-002] (hash + custódia + imutabilidade do pacote probatório)
