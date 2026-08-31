---
id: UC-TEAT-010
title: Agente captura e vincula gravação de bodycam como evidência do ato legal
status: reviewed
apps: [teat]
sources: [REF-DETRANAM-TALAO-BODYCAM]
updated: 2026-08-26
---

## Ator e objetivo

O dispositivo do agente de trânsito mantém a câmera corporal (bodycam) ativa durante todo o
serviço operacional e vincula o(s) trecho(s) de gravação correlato(s) a cada ato legal (AIT,
medida administrativa, procedimento de etilômetro) praticado durante uma interação com o
condutor/usuário da via — regime de evidência de fluxo **contínuo**, distinto do anexo pontual já
modelado em [UC-TEAT-003].

## Pré-condições

- Agente em serviço operacional (uniformizado, escalado ou disponível para fiscalização —
  [REF-DETRANAM-TALAO-BODYCAM] §2, Portaria Normativa DETRAN-AM 003/2026 art. 5º).
- Bodycam ativada no início do turno.

## Fluxo principal

1. Bodycam permanece ativada durante todo o período de serviço — obrigatório em: atendimento a
   sinistro, abordagem veicular de qualquer natureza, operação de trânsito, atividade de
   fiscalização/vistoria, e **toda interação entre agente e condutor/usuário da via** (Portaria
   003/2026 art. 4º, incisos I-IV e VIII).
2. Ao iniciar um ato legal em campo (lavratura de AIT, medida administrativa, procedimento de
   etilômetro), o trecho de gravação correlato é vinculado automaticamente ao ato, análogo ao
   `EvidenceLink` já usado para evidência pontual ([RN-TEAT-002]), mas referenciando um intervalo
   de gravação contínua, não um arquivo capturado sob demanda.
3. Sistema mantém indicador visual persistente do estado de gravação (ativo) durante toda a
   interação — recomendação de UX do dossiê de pesquisa, dado que a norma proíbe interrupção não
   autorizada.
4. Ao final da interação, o vínculo evidência↔ato é fechado; o trecho permanece sob o mesmo regime
   de cadeia de custódia (apensa, não editável) de [RN-TEAT-002].

## Fluxos alternativos / exceções

- **1a. Falha de equipamento.** Mau funcionamento, falha de gravação, de bateria, de memória ou de
  transmissão, ou impossibilidade técnica de uso → agente **comunica imediatamente**, registrado
  em sistema próprio ou relatório diário (Portaria 003/2026 art. 9º) — paralelo direto a "falha de
  transmissão de evidência não apaga o ato legal associado, mas mantém pendência explícita"
  ([RN-TEAT-002]), agora aplicado a uma fonte de evidência contínua.
- **Vedações do agente** (Portaria 003/2026 art. 8º): desligar a câmera durante o serviço (salvo
  exceção regulamentada, ex. uso de banheiro), alterar configurações/metadados/hora/data/
  geolocalização/modo de gravação, interromper/ocultar/pausar/obstruir a captação, manipular/
  editar/copiar/excluir/transferir arquivos — mesmo princípio de integridade/vedação de edição já
  aplicado à cadeia de custódia de evidência pontual, estendido aqui ao fluxo contínuo.
- **Câmeras veiculares** (art. 15): mesmo regime pode se aplicar, quando tecnicamente viável, a
  câmeras instaladas na viatura — ampliação facultativa da superfície de evidência, fora do MVP
  proposto salvo decisão do Owner.

## Pós-condições

Ato legal com trecho de gravação de bodycam vinculado sob cadeia de custódia íntegra e apensa, ou
com pendência explícita de falha registrada (nunca ausência silenciosa de evidência esperada).

## Critérios de aceitação

**AC-TEAT-010-1 — gravação contínua durante todo o serviço**

- **Dado** um agente em serviço operacional
- **Quando** o turno está aberto
- **Então** a bodycam está ativa continuamente ([RN-TEAT-141]) — não por ato, não sob demanda, e
  sem possibilidade de o agente interromper fora da exceção regulamentada

**AC-TEAT-010-2 — o indicador de gravação é chrome global**

- **Dado** qualquer tela do aplicativo durante o serviço
- **Quando** o agente navega
- **Então** o estado de gravação (ativo, pausado por exceção, falha) está visível — nunca escondido
  em menu

**AC-TEAT-010-3 — o vínculo é a um intervalo, não a um arquivo**

- **Dado** um ato legal praticado em campo
- **Quando** o vínculo é criado
- **Então** referencia o **intervalo** correlato da gravação contínua sob o mesmo regime de custódia
  de [RN-TEAT-002], distinto do anexo pontual de [UC-TEAT-003]

**AC-TEAT-010-4 — falha de bodycam é comunicada, e o ato sobrevive**

- **Dado** falha de gravação, bateria, memória ou transmissão
- **Quando** ocorre
- **Então** o agente registra a comunicação imediata exigida pela Portaria 003/2026 art. 9º, e o
  ato legal permanece válido com pendência explícita — nunca ausência silenciosa de evidência
  esperada

**AC-TEAT-010-5 — as vedações do art. 8º são impedidas pelo sistema, não só proibidas**

- **Dado** o aplicativo em serviço
- **Quando** se tenta alterar configuração, metadados, hora, data, geolocalização ou modo de
  gravação, ou manipular, editar, copiar, excluir ou transferir arquivos
- **Então** a operação é tecnicamente impossível pelo app ([RN-TEAT-141]) — a norma proíbe e o
  sistema não oferece o caminho

**AC-TEAT-010-6 — acesso à gravação é por requisição, com limites de divulgação**

- **Dado** um pedido de acesso a trecho de bodycam
- **Quando** é atendido
- **Então** passa por requisição registrada, com limites de divulgação aplicados
  ([RN-TEAT-142]) — e o sistema **não** apaga automaticamente por decurso de prazo, já que nenhuma
  norma fixa retenção; a definição do prazo é pendência do Owner

## Regras aplicáveis

- [RN-TEAT-002] (hash + custódia + imutabilidade — princípio estendido ao fluxo contínuo)
- [RN-TEAT-141] (bodycam obrigatória em toda interação agente↔condutor — gravação contínua,
  íntegra e não interrompível), sob o mesmo regime de custódia de [RN-TEAT-002]
- [RN-TEAT-142] (acesso restrito por requisição, limites de divulgação, ausência de prazo de
  retenção fixado em norma)

## Nota de escopo (decisão do Owner)

Esta adoção formal de bodycam como evidência de runtime **não está confirmada como escopo do
MVP** — é achado local (DETRAN-AM), sem paralelo em norma federal capturada nesta rodada. Impacto
potencial amplo no modelo de evidências/custódia (fluxo contínuo vs. anexo pontual) — avaliação de
escopo registrada em `_intake/bpo-notes.md` §2.
