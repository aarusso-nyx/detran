---
id: UC-PORTAL-014
title: Candidato/condutor consulta o resultado de exame de aptidão física, mental ou psicológica
status: approved
apps: [portal, pec]
sources: [REF-CONTRAN-927-2022, REF-CTB-147-148-habilitacao]
updated: 2026-08-26
---

## Ator e objetivo

Candidato/condutor consulta o resultado do exame médico de aptidão física e mental e/ou da
avaliação psicológica realizados no PEC, entende o que o resultado significa em linguagem simples,
e localiza o próximo passo cabível (nada a fazer, renovar, ou requerer junta de revisão).

## Pré-condições

- Candidato/condutor identificado, nível simples ([WF-PORTAL-002]).
- Encounter clínico no PEC em estado `SIGNED` ou `CLOSED` — resultado só é exibido depois de
  assinado ([WF-PEC-001]); nunca antes, mesmo que o exame já tenha ocorrido presencialmente.

## Fluxo principal

1. Candidato acessa "Meus exames" (dentro do módulo de habilitação/CNH do PORTAL).
2. Sistema exibe o resultado em linguagem simples primeiro (apto / apto com restrições / inapto
   temporário / inapto — nomenclatura corrigida por [RN-PEC-105]/[RN-PEC-106], nunca o rótulo
   técnico interno `medical_result='CONDICIONADO'` exposto cru), com a validade já calculada
   (10/5/3 anos conforme faixa etária — CTB art.147 §§2º/4º) quando aplicável.
3. Se resultado psicológico: sistema respeita o prazo de disponibilização de até 2 dias úteis da
   conclusão da avaliação (Res. 927/2022 art.9º §3º) — enquanto não disponível, mostra "em
   processamento", nunca um vazio sem explicação.
4. Se o resultado mantém inaptidão (temporária ou permanente): tela mostra, como próximo passo
   único e acionável, a opção de requerer junta médica/psicológica de revisão, com o prazo de 30
   dias do conhecimento já contando visivelmente ([WF-PEC-002] `REQUERIMENTO_APRESENTADO`).

## Fluxos alternativos / exceções

- **2a.** Restrição aplicada (`apto com restrições`, só na trilha médica — [RN-PEC-105]): sistema
  explica objetivamente qual restrição consta da CNH, não apenas o código técnico.
- **4a.** Prazo de 30 dias para requerer junta já expirado: opção de requerimento não aparece mais
  como ação disponível; sistema explica o motivo, sem sugerir que ainda é possível.
- **4b.** Cidadão aciona "requerer junta": este UC entrega o pedido a [WF-PEC-002] pelo canal de
  entrada existente — o desenho de correção do legitimado ([RN-PEC-110]) é fora da fronteira de
  escrita deste UC, reuso por referência.

## Pós-condições

Cidadão com entendimento claro do resultado e, quando cabível, requerimento de junta protocolado;
nenhuma alteração de dado clínico — este UC é somente leitura sobre o PEC, exceto pelo próprio
requerimento de junta quando acionado.

## Critérios de aceitação

**AC-PORTAL-014-1 — o rótulo exibido é o legal**

- **Dado** um resultado de exame
- **Quando** é exibido ao candidato
- **Então** usa apto / apto com restrições / inapto temporário / inapto ([RN-PEC-105]) —
  `CONDICIONADO` e `PENDENTE` nunca aparecem (DT-102)

**AC-PORTAL-014-2 — a validade é calculada por faixa etária**

- **Dado** um resultado apto
- **Quando** a validade é exibida
- **Então** aplica 10/5/3 anos conforme a faixa etária (CTB art.147 §2º — [RN-PEC-102]), não os
  5/3 superados da Res. 789/2020 (DT-101)

**AC-PORTAL-014-3 — resultado psicológico em processamento é dito, não é vazio**

- **Dado** uma avaliação concluída há menos de 2 dias úteis
- **Quando** o candidato consulta
- **Então** vê "em processamento" com o prazo, nunca uma tela vazia sem explicação

**AC-PORTAL-014-4 — inaptidão mostra a revisão como próximo passo, com prazo**

- **Dado** um resultado de inaptidão
- **Quando** é exibido
- **Então** requerer junta é a ação única e destacada, com os 30 dias já contando
  ([RN-PEC-112])

**AC-PORTAL-014-5 — o candidato vê o próprio dossiê**

- **Dado** um pedido de acesso ao dossiê do exame
- **Quando** é feito pelo titular
- **Então** o acesso é integral e sem máscara ([RN-PORTAL-118], [RN-PEC-153]), incluindo o direito
  à entrevista devolutiva

## Regras aplicáveis

- [RN-PEC-102] (validade do exame médico por faixa etária)
- [RN-PEC-105]/[RN-PEC-105] (vocabulário legal do resultado — `CONDICIONADO` não existe em norma)
- Res. CONTRAN 927/2022 art.9º §3º (prazo de disponibilização do resultado psicológico)
