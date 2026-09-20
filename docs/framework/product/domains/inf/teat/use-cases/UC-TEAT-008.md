---
id: UC-TEAT-008
title: Agente aplica medida administrativa de retenção e recolhimento de documento
status: reviewed
apps: [teat]
sources: [REF-CTB-165-277-medidas-alcoolemia, REF-CONTRAN-985-1003-MBFT]
updated: 2026-08-26
---

## Ator e objetivo

Agente de trânsito aplica uma medida administrativa do catálogo fechado do CTB art. 269 —
tipicamente retenção do veículo e/ou recolhimento de documento de habilitação/registro/
licenciamento — vinculada ou não a uma autuação, registrando o fundamento e o desfecho (liberação
local, liberação com prazo, ou conversão em remoção).

## Pré-condições

- Situação que enseja medida administrativa constatada em campo (infração, sinistro, alcoolemia —
  ver [UC-TEAT-007] — ou "boa ordem administrativa", [REF-CONTRAN-985-1003-MBFT] Seção 8.1).
- Agente identifica o tipo de medida aplicável a partir do catálogo fechado do CTB art. 269 (não
  campo de texto livre).

## Fluxo principal

1. Agente seleciona o tipo de medida administrativa (`ait-measures`/tela dedicada, grupo
   `medidas-administrativas`) — enum fechado: retenção, remoção (ver [UC-TEAT-009]),
   recolhimento de CNH/PPD/CRV/CLA, transbordo, teste de alcoolemia (ver [UC-TEAT-007]),
   recolhimento de animais, exames de aptidão (fora do escopo de campo — ver [APP-PEC]).
2. Se retenção: agente verifica se a irregularidade é sanável no local (CTB art. 270 §1º).
   2a. **Sanável no local** → agente libera o veículo imediatamente (`LIBERADO_LOCAL`,
   [WF-TEAT-004]).
   2b. **Não sanável, mas condições de segurança OK** → agente recolhe o Certificado de Licenciamento
   Anual (CLA), emite recibo, assinala prazo ≤30 dias para regularização (`LIBERADO_COM_PRAZO`,
   CTB art. 270 §2º).
3. Se recolhimento de documento de habilitação/registro: agente verifica se o documento é físico
   ou digital.
   3a. **Físico**: agente recolhe o documento, mediante recibo, mantém custódia local.
   3b. **Digital** (CNH-e, CRLV-e): agente **não apreende nada fisicamente** — executa registro
   eletrônico via integração RENACH/RENAVAM, conforme CTB art. 269 §5º.
4. Sistema grava o `AdministrativeTerm` com tipo, fundamento legal, recibo (quando aplicável) e
   prazo de regularização, quando houver.
5. Condutor/proprietário assina ciência do termo, recusa, ou está impossibilitado — mesmo padrão
   de três resultados distintos de [RN-TEAT-005] ([UC-TEAT-004]).

## Fluxos alternativos / exceções

- **2c. Condutor habilitado não se apresenta no local** → medida converte-se diretamente em
  remoção (CTB art. 270 §4º) — segue [UC-TEAT-009].
- **2b-1. Prazo de regularização expira sem resposta** → conversão automática em remoção (CTB
  art. 270 §7º) + registro de restrição administrativa no RENAVAM (art. 270 §6º) — evento de
  retaguarda, fora do ato de campo em si, mas TEAT deve registrar o marco inicial do prazo.
- **"Boa ordem administrativa"**: hipótese de remoção discricionária motivada, distinta das
  hipóteses automáticas por descumprimento de prazo — lista fechada de artigos do CTB
  ([REF-CONTRAN-985-1003-MBFT] Seção 8.1); agente deve registrar o **fundamento** (prazo
  descumprido vs. condições de segurança vs. boa ordem administrativa) como campo estruturado, não
  apenas o fato da medida.
- **Independência do AIT**: ausência de registro da medida ou impossibilidade de sua
  aplicação/conclusão não invalida a autuação por infração; invalidação do AIT não prejudica
  necessariamente a medida já aplicada ([RN-TEAT-004]; [REF-CONTRAN-985-1003-MBFT] Seção 8).

## Pós-condições

`AdministrativeTerm` registrado com tipo (enum fechado), fundamento, recibo/registro digital, e
desfecho (liberado local, liberado com prazo, ou convertido em remoção). Prazo de regularização,
quando aplicável, ativo e monitorável.

## Critérios de aceitação

**AC-TEAT-008-1 — o catálogo é fechado**

- **Dado** a seleção de medida administrativa
- **Quando** o agente escolhe
- **Então** só os tipos do rol taxativo do CTB art. 269 estão disponíveis ([RN-TEAT-122]) — não
  existe campo de texto livre para inventar medida

**AC-TEAT-008-2 — retenção: sanável no local libera de imediato**

- **Dado** irregularidade sanável no próprio local
- **Quando** o agente a registra como sanada
- **Então** o veículo vai a `LIBERADO_LOCAL` sem prazo nem recolhimento de documento
  ([RN-TEAT-124], CTB art. 270 §1º)

**AC-TEAT-008-3 — retenção com prazo exige recibo e teto de 30 dias**

- **Dado** irregularidade não sanável no local, com condições de segurança presentes
- **Quando** o agente libera com prazo
- **Então** o sistema exige decisão explícita sobre condições de segurança, recolhe o CLA, emite
  recibo e fixa prazo **≤ 30 dias** ([RN-TEAT-124]) — e apresenta os 30 dias como **teto**, não
  como default silencioso

**AC-TEAT-008-4 — documento digital não se apreende**

- **Dado** um recolhimento de CNH-e ou CRLV-e
- **Quando** o agente executa a medida
- **Então** o sistema realiza lançamento eletrônico no cadastro (RENACH/RENAVAM) com ciência por
  recibo ou por campo do próprio AIT, e **nenhuma tela** oferece apreensão física
  ([RN-TEAT-130], CTB art. 269 §5º)

**AC-TEAT-008-5 — o conflito sobre recolhimento da habilitação é exposto, não resolvido em silêncio**

- **Dado** uma hipótese de recolhimento do documento de habilitação em campo
- **Quando** o agente a executa
- **Então** o sistema aplica a posição registrada em [RN-TEAT-129] e mantém visível que há
  divergência entre o CTB e o MBFT sobre a competência do agente — pendência de decisão do Owner,
  não uma escolha embutida no código sem rastro

**AC-TEAT-008-6 — a medida vincula-se ao AIT depois da finalização**

- **Dado** uma medida aplicada junto a uma autuação
- **Quando** o AIT é finalizado
- **Então** o vínculo medida↔AIT é estabelecido nesse momento ([RN-TEAT-118]), e o dado do AIT
  segue apenas para o órgão autuador

**AC-TEAT-008-7 — destinos independentes, nos dois sentidos**

- **Dado** um AIT cancelado e uma medida já concluída, ou o inverso
- **Quando** um dos dois muda de estado
- **Então** o outro não é alterado automaticamente ([RN-TEAT-123]) — a independência recíproca é
  aplicada nas duas direções, e a reavaliação é decisão humana registrada

## Regras aplicáveis

- [RN-TEAT-004] (independência AIT × medida administrativa)
- [RN-TEAT-005] (assinatura/recusa/impossibilidade no termo de medida)
- [RN-TEAT-122] (medidas administrativas são rol taxativo de caráter complementar — sobre
  documento digital executam-se por registro em sistema)
- [RN-TEAT-123] (AIT e medida administrativa têm destinos independentes, nos dois sentidos)
