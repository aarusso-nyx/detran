---
id: UC-PORTAL-017
title: Cidadão avalia o serviço recebido
status: reviewed
apps: [portal, dashboard]
sources: [REF-LEI-13460-2017, REF-LEI-14129-2021]
updated: 2026-08-26
---

## Ator e objetivo

Cidadão que concluiu um serviço (processo de recurso, atendimento de ouvidoria, emissão de
documento) avalia a experiência, alimentando a pesquisa de satisfação anual e o painel de
monitoramento de desempenho por serviço (Lei 13.460/2017 art.23; Lei 14.129/2021 art.22).

## Pré-condições

- Serviço em estado `RESULTADO_DISPONIVEL`/`ENCERRADA` no workflow de origem
  ([WF-PORTAL-001]/[WF-PORTAL-004]) — a avaliação nunca é oferecida antes de o cidadão ter algo
  concreto para avaliar.

## Fluxo principal

1. Ao concluir um serviço, sistema convida o cidadão a avaliar — no mesmo momento/tela do
   resultado, nunca como notificação separada e genérica dias depois.
2. Cidadão responde: satisfação com o resultado, qualidade do atendimento, se o prazo prometido foi
   cumprido, e comentário livre opcional (dimensões do art.23, I-III).
3. Sistema confirma o recebimento e explica, em uma frase, que a resposta alimenta um indicador
   público (transparência do art.23 §2º) — sem exigir que o cidadão leia o texto legal para
   entender isso.
4. Avaliação é agregada ao indicador do serviço específico, visível no painel do DASHBOARD (art.22).

## Fluxos alternativos / exceções

- **1a.** Cidadão não responde dentro da janela do convite: sistema não insiste além de um lembrete
  único; ausência de resposta não é tratada como avaliação negativa nem positiva — simplesmente não
  compõe a amostra.
- **2a.** Comentário livre contém reclamação específica e acionável (não apenas nota): sistema
  oferece, na mesma tela, o caminho direto para abrir uma manifestação formal de ouvidoria
  ([UC-PORTAL-016]) — a avaliação não substitui o canal de ouvidoria quando o cidadão quer resposta
  individual, e o sistema não deve deixar essa distinção implícita.

## Pós-condições

Avaliação registrada e agregada ao indicador do serviço; nenhuma alteração no processo já
concluído.

## Critérios de aceitação

**AC-PORTAL-017-1 — o convite vem no momento do resultado**

- **Dado** um serviço concluído
- **Quando** o resultado é exibido
- **Então** o convite à avaliação está na mesma tela — não como notificação genérica dias depois

**AC-PORTAL-017-2 — as dimensões são as da lei**

- **Dado** o formulário de avaliação
- **Quando** é apresentado
- **Então** cobre satisfação com o serviço, qualidade do atendimento e cumprimento do prazo
  ([RN-PORTAL-110], Lei 13.460 art.23 I-III)

**AC-PORTAL-017-3 — o cidadão sabe que o resultado é público**

- **Dado** o envio da avaliação
- **Quando** é confirmado
- **Então** uma frase explica que alimenta indicador público — sem exigir leitura de texto legal

**AC-PORTAL-017-4 — a publicação é integral, não seletiva**

- **Dado** o resultado agregado
- **Quando** é publicado
- **Então** é publicado integralmente ([RN-PORTAL-110]) — publicar só o que é favorável descumpre
  a obrigação

**AC-PORTAL-017-5 — o indicador chega ao painel**

- **Dado** avaliações agregadas
- **Quando** o painel é atualizado
- **Então** o indicador do serviço aparece no DASHBOARD (Lei 13.460 art.22)

## Regras aplicáveis

- [REF-LEI-13460-2017] art.23 (dimensões de avaliação, periodicidade mínima anual, publicação)
- [REF-LEI-14129-2021] art.21, V (avaliação continuada como funcionalidade obrigatória da
  plataforma); art.22 (painel de monitoramento por serviço)
