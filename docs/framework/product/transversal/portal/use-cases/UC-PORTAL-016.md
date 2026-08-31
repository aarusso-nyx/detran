---
id: UC-PORTAL-016
title: Cidadão registra manifestação na ouvidoria (reclamação, denúncia, sugestão, elogio ou solicitação)
status: reviewed
apps: [portal]
sources: [REF-LEI-13460-2017]
updated: 2026-08-26
---

## Ator e objetivo

Usuário de qualquer serviço do DETRAN-AM registra manifestação junto à ouvidoria, recebe
comprovante imediato e acompanha o andamento até a decisão final, com os prazos legais de resposta
visíveis (Lei 13.460/2017 arts.10-17).

## Pré-condições

- Nenhuma identificação mínima além do necessário para não inviabilizar a manifestação (Lei 13.460
  art.10 §1º) — cidadão anônimo pode manifestar-se, mas identificação facilita o acompanhamento e é
  exigida para denúncia com efeito de resposta individual.
- Nenhuma outra pré-condição — o sistema **nunca** recusa o recebimento (art.11).

## Fluxo principal

1. Cidadão acessa "Ouvidoria" e escolhe o tipo de manifestação: reclamação, denúncia, sugestão,
   elogio, ou solicitação (taxonomia operacional — ver [WF-PORTAL-004] nota sobre art.2º V).
2. Sistema NÃO exige motivo determinante como condição de envio (art.10 §2º) — campo de descrição é
   livre, sem obrigar categorização fechada de causa.
3. Sistema emite comprovante de recebimento imediato, com número de protocolo ([WF-PORTAL-004]
   `MANIFESTACAO_REGISTRADA→COMPROVANTE_EMITIDO`).
4. Cidadão acompanha o andamento pela mesma "Meus processos" já usada para defesa/recurso — status
   em linguagem cidadã, com o prazo de resposta (30 dias, prorrogável 1x) sempre visível e já
   calculado.
5. Ao receber a decisão final, cidadão tem ciência confirmada no sistema (art.12 §ú, V) e é
   convidado a avaliar o atendimento recebido ([UC-PORTAL-017]).

## Fluxos alternativos / exceções

- **1a.** Denúncia com pedido de sigilo do denunciante: sistema preserva a identidade nas telas de
  acompanhamento interno voltadas a outros usuários, mantendo apenas trilha de auditoria restrita.
- **3a.** Manifestação recebida por canal presencial/postal: mesmo comprovante e mesmo prazo de
  resposta, registrados no PORTAL como fonte única de acompanhamento — nunca um "protocolo paralelo"
  que o cidadão não consegue consultar digitalmente.
- **4a.** Prazo de 30 dias prorrogado: sistema exibe a prorrogação com a justificativa registrada,
  nunca apenas empurra a data silenciosamente.

## Pós-condições

Manifestação registrada, com protocolo e prazo de resposta visíveis; decisão final comunicada;
cidadão convidado a avaliar.

## Critérios de aceitação

**AC-PORTAL-016-1 — o recebimento é irrecusável**

- **Dado** qualquer manifestação
- **Quando** é enviada
- **Então** o sistema a recebe — não há triagem que recuse entrada ([RN-PORTAL-109], Lei 13.460
  art.10 §2º)

**AC-PORTAL-016-2 — não se exige motivo determinante**

- **Dado** o formulário de manifestação
- **Quando** é preenchido
- **Então** nenhuma categorização fechada de causa é obrigatória para enviar

**AC-PORTAL-016-3 — comprovante imediato, com protocolo**

- **Dado** uma manifestação registrada
- **Quando** o envio conclui
- **Então** o comprovante é emitido na hora ([RN-PORTAL-109])

**AC-PORTAL-016-4 — os dois relógios legais são distintos e visíveis**

- **Dado** uma manifestação em curso
- **Quando** o cidadão a acompanha
- **Então** vê o prazo de resposta (30 dias, prorrogável uma vez) como prazo **do órgão**
  ([RN-PORTAL-109]) — nunca confundido com prazo dele

**AC-PORTAL-016-5 — ouvidoria não exige nível de assinatura elevado**

- **Dado** uma manifestação
- **Quando** o nível exigido é determinado
- **Então** o Decreto 10.543/2020 **exclui** a ouvidoria de sua matriz ([RN-PORTAL-101],
  [RN-PORTAL-102]) — LEGAL conclui que nenhum nível é exigível, e a divergência com a leitura
  "Simples" do BPO/UX é pendência registrada (DT-051)

**AC-PORTAL-016-6 — a ciência da decisão é confirmada**

- **Dado** a resposta final
- **Quando** é entregue
- **Então** a ciência do cidadão é registrada, e ele é convidado a avaliar ([UC-PORTAL-017])

## Regras aplicáveis

- [REF-LEI-13460-2017] art.11 (proibição de recusa de recebimento)
- [REF-LEI-13460-2017] art.12 §ú (ciclo completo: recepção, comprovante, análise, decisão, ciência)
- [REF-LEI-13460-2017] art.16 (prazo de resposta 30+30 dias)
