---
id: UC-BOAT-001
title: Agente inicia e classifica o registro de sinistro
status: approved
apps: [boat, teat]
sources:
  [
    'teat:docs/framework/product/blueprints/BP-CRASH-RECORDS-001.json',
    'teat:docs/framework/product/workflows/crash-records.md',
    'teat:docs/framework/product/ux-parity/mobile-matrix.json',
  ]
updated: 2026-08-26
---

## Ator e objetivo

Agente de trânsito (field-agent) chega ao local de um sinistro e inicia o registro estruturado,
classificando tipo, momento, local e condições ambientais/de via.

## Pré-condições

Turno aberto no aplicativo TEAT; agente no local do sinistro.

## Fluxo principal

1. Agente inicia registro — `POST .../:id/start` (de `draft`) → `CrashRecord` move para
   `in_attendance` (tela `crash-start`, UX-MOB-060).
2. Classifica o tipo de sinistro (`crash_type`).
3. Registra data/hora do sinistro (`occurred_at`) e horário de registro (`recorded_at`).
4. Registra local (`location_description`, `location_json`, `municipality_code`, `uf`, `road`,
   `km`, `direction`) — tela `crash-location`, UX-MOB-061.
5. Registra condições de via, clima, iluminação e sinalização (`road_condition`,
   `weather_condition`, `lighting_condition`, `signage_condition`) — tela `crash-conditions`,
   UX-MOB-062.
6. Registra dinâmica preliminar (`dynamics_description`), passível de complemento posterior.

## Fluxos alternativos / exceções

- **1a.** Sem conectividade: registro segue offline como qualquer ato TEAT — mesma doutrina de
  [RN-TEAT-001] aplicada ao domínio de sinistro.
- **4a.** Localização com baixa precisão de GPS: agente pode complementar manualmente a
  descrição textual do local.

## Pós-condições

`CrashRecord` em `in_attendance` com classificação, momento, local e condições registrados;
pronto para captura de veículos e pessoas envolvidas ([UC-BOAT-002]).

## Critérios de aceitação

**AC-BOAT-001-1 — o que conta como sinistro é a definição legal, não o julgamento do agente**

- **Dado** um evento na via
- **Quando** o agente inicia o registro
- **Então** o sistema apresenta o critério de enquadramento do Anexo I do CTB ([RN-BOAT-109]) e o
  tipo escolhido deriva dele — o registro existe por competência legal própria do DETRAN-AM
  (CTB art. 22, IX — [RN-BOAT-101]), não por conveniência operacional

**AC-BOAT-001-2 — "sinistro", nunca "acidente", em toda superfície**

- **Dado** qualquer tela, termo impresso, rótulo ou payload do BOAT
- **Quando** o texto é exibido
- **Então** usa **sinistro** ([RN-BOAT-110], Lei 14.599/2023) — "acidente" só aparece em citação
  literal de norma anterior, sempre marcada como citação

**AC-BOAT-001-3 — momento do sinistro e momento do registro são campos distintos**

- **Dado** um atendimento iniciado horas após o evento
- **Quando** o agente registra
- **Então** `occurred_at` e `recorded_at` são capturados separadamente, e a chave natural do
  registro nacional usa `occurred_at` — confundi-los produz duplicidade ou rejeição

**AC-BOAT-001-4 — as quatro condições ambientais são obrigatórias, não opcionais**

- **Dado** um registro em `EM_ATENDIMENTO`
- **Quando** o agente tenta avançar
- **Então** via, clima, iluminação e sinalização estão preenchidas — são dados do BAT
  ([RN-BOAT-103]), não enriquecimento

**AC-BOAT-001-5 — sem rede o registro nasce igual**

- **Dado** ausência de conectividade na cena
- **Quando** o agente inicia o registro
- **Então** o fluxo é idêntico ao online, sob a mesma doutrina offline do TEAT ([RN-TEAT-001])

## Regras aplicáveis

- (fonte pendente) — nenhuma regra normativa específica de classificação de sinistro localizada.
