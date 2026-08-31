---
id: UC-BOAT-010
title: Bodycam no atendimento a sinistro
status: reviewed
apps: [boat, teat]
sources: [REF-DETRANAM-TALAO-BODYCAM, UC-TEAT-010]
updated: 2026-08-26
---

## Ator e objetivo

O agente de trânsito mantém a câmera corporal ativa durante todo o atendimento a um sinistro,
vinculando o trecho de gravação correlato ao `CrashRecord` — mesma doutrina de bodycam já
integralmente modelada em [UC-TEAT-010] (núcleo TEAT), aqui apenas **referenciada e ancorada ao
domínio de sinistro**, sem remodelagem.

## Pré-condições

Agente em serviço operacional, com bodycam ativada ([UC-TEAT-010] pré-condições); `CrashRecord`
em `in_attendance` ([UC-BOAT-001]).

## Fluxo principal

1. "Atendimento a sinistros de trânsito" é listado nominalmente pela Portaria Normativa DETRAN-AM
   003/2026 (art. 4º, I) como situação de uso **obrigatório** de bodycam — a mais explícita das
   oito hipóteses do artigo em relação ao domínio BOAT.
2. Todo o fluxo de captura, vínculo ao ato, indicador de gravação, falha e vedação de edição segue
   **exatamente** [UC-TEAT-010] — não há passo específico de sinistro além do gatilho do art. 4º,
   I. O trecho de gravação é vinculado ao `CrashRecord` (e a cada ato legal associado, ex. AIT por
   omissão de socorro — [UC-BOAT-007]) da mesma forma que a um AIT autônomo.
3. Ao final do atendimento, o vínculo evidência↔sinistro é fechado sob o mesmo regime de cadeia de
   custódia apensa e não editável de [RN-TEAT-002].

## Fluxos alternativos / exceções

Idênticos a [UC-TEAT-010] — falha de equipamento (comunicação obrigatória, sem invalidar o
registro do sinistro, mesma lógica de "pendência explícita, não ausência silenciosa"); vedações do
art. 8º da Portaria 003/2026.

## Pós-condições

`CrashRecord` com trecho(s) de gravação de bodycam vinculado(s) sob cadeia de custódia íntegra, ou
com pendência de falha explicitamente registrada.

## Critérios de aceitação

**AC-BOAT-010-1 — atendimento a sinistro é hipótese nominal de bodycam obrigatória**

- **Dado** um agente atendendo sinistro
- **Quando** o atendimento começa
- **Então** a gravação está ativa por força do art. 4º, I da Portaria 003/2026 ([RN-BOAT-129]) — é a
  mais explícita das oito hipóteses, e não depende de julgamento do agente

**AC-BOAT-010-2 — o regime é exatamente o do TEAT**

- **Dado** a captura, o vínculo, o indicador, a falha e as vedações
- **Quando** aplicados ao sinistro
- **Então** seguem [UC-TEAT-010] sem variação ([RN-TEAT-141], [RN-TEAT-142]) — o BOAT não cria um
  segundo regime de bodycam

**AC-BOAT-010-3 — o trecho vincula-se ao sinistro e a cada ato associado**

- **Dado** um atendimento que gera sinistro e AIT por omissão de socorro
- **Quando** a gravação é vinculada
- **Então** alcança o `CrashRecord` **e** o AIT, sem duplicar a mídia

**AC-BOAT-010-4 — gravação de cena com vítima é dado sensível**

- **Dado** um trecho que capture vítima
- **Quando** é armazenado e acessado
- **Então** recebe a marcação e o controle de acesso do dado de saúde ([RN-BOAT-122],
  [RN-BOAT-126]) — a retenção segue pendente de decisão (DT-014, DT-049), e o sistema não deve
  assumir permanência

## Regras aplicáveis

- [RN-TEAT-002] (hash, custódia, imutabilidade — herdado)
- candidata RN-TEAT-141/RN-TEAT-142 (bodycam obrigatória, acesso/retenção — herdado do domínio
  TEAT, não remodelado para BOAT)

## Nota de escopo (decisão do Owner, herdada de TEAT)

Mesma ressalva de [UC-TEAT-010]: adoção formal de bodycam como evidência de runtime **não está
confirmada como escopo do MVP** — achado local (DETRAN-AM), sem paralelo em norma federal. Este UC
existe para que a lacuna já identificada pela rodada TEAT ("boat-adjacente, não escrito por regra
de fronteira") não fique implícita no domínio de sinistro.
