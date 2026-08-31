---
id: UC-BOAT-002
title: Agente registra veículos e pessoas envolvidas
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

Agente registra todos os veículos e pessoas envolvidas no sinistro (condutores, passageiros,
pedestres, ciclistas), com seus papéis e vínculos entre si.

## Pré-condições

`CrashRecord` em `in_attendance`, `recorded` ou `pending_complement` ([UC-BOAT-001]).

## Fluxo principal

1. Agente adiciona cada veículo envolvido (`crash-vehicles`, UX-MOB-063): `vehicle_snapshot_id`,
   `role`, `sequence`, `apparent_damage`. **A conduta de cena não é capturada aqui** — o antigo
   booleano `evaded` foi substituído pela captura estruturada dos três regimes dos arts. 176-178
   em [UC-BOAT-007] ([RN-BOAT-117]).
2. Agente adiciona cada pessoa envolvida (`crash-people`, UX-MOB-064): `person_id`, `role`
   (condutor/passageiro/pedestre/ciclista), vínculo opcional a `crash_vehicle_id`,
   `used_seatbelt_or_helmet`.
3. Captura evidências associadas a veículos/pessoas quando aplicável (ver [UC-TEAT-003] em
   `inf/teat/use-cases/`).
4. Registro avança para `recorded` quando a captura de campo é considerada completa.

## Fluxos alternativos / exceções

- **1a.** Veículo deixa o local sem identificação completa: dados parciais são registrados e o
  complemento posterior segue via `PENDENTE_COMPLEMENTO` ([UC-BOAT-005]); a conduta de cena que
  isso possa configurar é registrada sob o regime aplicável em [UC-BOAT-007], nunca como evasão
  presumida a partir de dado faltante.
- **2a.** Envolvido se recusa a fornecer dados: registro segue com dados disponíveis; ausência de
  dados mínimos pode bloquear o encerramento ([RN-BOAT-004]).

## Pós-condições

`CrashRecord` com veículos e pessoas vinculados; pronto para registro de vítimas
([UC-BOAT-003]), caso existam.

## Critérios de aceitação

**AC-BOAT-002-1 — não se recoleta o que as bases nacionais já têm**

- **Dado** um veículo identificado por placa
- **Quando** o agente o adiciona
- **Então** os dados vêm de consulta a RENAVAM/RENACH/RENAINF e entram como **proposta a validar**,
  não como digitação do agente ([RN-BOAT-107]) — o BOAT complementa essas bases, não as duplica

**AC-BOAT-002-2 — `evaded` não existe mais como campo de captura**

- **Dado** a tela de veículos
- **Quando** o agente registra um veículo
- **Então** **não** há booleano `evaded` a marcar: a conduta de cena é capturada de forma
  estruturada sob o regime aplicável em [UC-BOAT-007] ([RN-BOAT-117]) — manter o booleano
  reintroduz exatamente a confusão entre os três regimes que a rodada eliminou

**AC-BOAT-002-3 — papel da pessoa é enum, e o vínculo ao veículo é opcional**

- **Dado** uma pessoa envolvida
- **Quando** é registrada
- **Então** seu papel vem de catálogo fechado (condutor, passageiro, pedestre, ciclista) e o
  vínculo a um veículo é opcional — pedestre e ciclista não têm veículo, e forçá-lo corrompe o dado

**AC-BOAT-002-4 — recusa de informar não bloqueia o registro, mas fica registrada**

- **Dado** um envolvido que se recusa a fornecer dados
- **Quando** o agente prossegue
- **Então** o registro segue com os dados disponíveis e a recusa fica explícita — o encerramento
  pode ser bloqueado depois por dados mínimos ([RN-BOAT-004]), o que é decisão distinta

**AC-BOAT-002-5 — uso de cinto ou capacete é dado do BAT**

- **Dado** cada pessoa envolvida
- **Quando** é registrada
- **Então** `used_seatbelt_or_helmet` é capturado — é campo do BAT e alimenta o indicador nacional

## Regras aplicáveis

- [RN-BOAT-004] (encerramento exige ao menos um veículo ou pessoa envolvida)
