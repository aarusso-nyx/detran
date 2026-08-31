---
id: JRN-DASH-007
title: Responsável pela junta médica/psicológica — dois relógios com consequências diferentes, nunca confundidos
status: draft
apps: [dashboard, pec]
sources: [WF-PEC-002, RN-PEC-110, RN-PEC-111, RN-PEC-112, RN-PEC-106]
updated: 2026-08-24
---

## Persona e contexto

Juliana responde, no DASHBOARD, pela escada de prazos da revisão por junta médica/psicológica do
PEC — a cadeia de três instâncias formalizada em [RN-PEC-112]: candidato requer (30 dias),
órgão designa a junta (15 dias úteis), junta decide (30 dias), candidato recorre ao CETRAN
(30 dias), órgão remete os documentos (20 dias úteis). O que torna essa jornada estruturalmente
diferente de [JRN-DASH-002] (RAIT) é que aqui **dois tipos de prazo convivem na mesma escada, com
naturezas jurídicas opostas**: os prazos do candidato são preclusivos (vencido, extingue-se o
direito); os prazos do órgão não têm sanção expressa — mas o bloqueio de cadastro nacional
([RN-PEC-106]) permanece ativo enquanto o candidato espera, então o atraso do órgão recai
inteiramente sobre um cidadão impedido de dirigir. Confundir os dois tipos de prazo na tela é o
erro mais grave que essa jornada pode cometer — já identificado como tal em
`ch/pec/_intake/ux-notes.md` §g, item 12.

## Narrativa ponta-a-ponta

1. **O card mostra de que tipo de prazo se trata, sempre.** Um caso a 27 dos 30 dias para o
   candidato recorrer ao CETRAN aparece com o rótulo "prazo do candidato — preclusivo": se vencer,
   o direito de recorrer se extingue, e o card muda para um desfecho terminal claro. Um caso a 13
   dos 15 dias úteis para o órgão designar a junta aparece com rótulo distinto: "prazo do órgão —
   sem sanção expressa, mas bloqueio de cadastro permanece ativo para o candidato".
2. **Ela não pode "resolver" o prazo do candidato — só o do órgão.** Juliana não tem nenhuma ação
   sobre o relógio de 30 dias do candidato recorrer; sua ação é inteiramente sobre os prazos do
   órgão (designar, decidir, remeter) — o DASHBOARD reflete essa assimetria não mostrando nenhum
   botão de ação nos cards de prazo do candidato, apenas informação.
3. **90% de um prazo do órgão consumido, sem sanção, ainda é prioridade real.** O caso do passo 1
   (designação a 13/15 dias úteis) está no marco `90%` proposto por [RN-PEC-112] item 4 — Juliana
   age não porque exista multa prevista, mas porque sabe, pela mesma tela, que o candidato segue
   bloqueado enquanto ela não designa a junta. O DASHBOARD conecta essas duas informações no
   mesmo card, para que a ausência de sanção nunca seja lida como ausência de urgência.
4. **`UNDER_REVIEW` aparece com o significado normativo que agora tem.** Entre a designação e o
   resultado da junta (o intervalo de 30 dias do art. 14 §3º), o card mostra a contagem correta —
   não um estado sem sentido, mas o prazo T-JM-DECIDE em curso.
5. **O card nunca atribui a decisão de recurso ao "CETRAN".** Quando um caso está na fase de
   recurso, o DASHBOARD identifica o colegiado tecnicamente correto — a Junta Especial de Saúde
   designada pelo CETRAN, não o CETRAN como decisor direto — porque atribuir a decisão ao órgão
   errado é o anti-padrão de maior risco de comunicação já identificado para este fluxo (mesma
   nota de `ch/pec/_intake/ux-notes.md` §g item 13).
6. **A terceira instância aparece com sua lacuna, não com um prazo inventado.** Não existe prazo
   numérico localizado para a designação ou decisão da Junta Especial de Saúde (art. 15) — o card,
   quando um caso chega a essa fase, mostra "sem prazo legal localizado" como estado de primeira
   classe, nunca um contador silenciosamente ausente nem um prazo herdado por analogia apresentado
   como se fosse confirmado.
7. **Fim do ciclo — o candidato nunca aparece como "atrasado" por um prazo que era do órgão.**
   Quando Juliana revisa o histórico de um caso concluído, a distinção entre os dois tipos de
   prazo permanece visível — essencial se um auditor (ver [JRN-DASH-005]) mais tarde precisar
   entender de quem foi a demora.

## Pontos de contato (apps/canais)

DASHBOARD (escada de prazos consolidada); PEC (dossiê do caso, designação e registro de decisão da
junta — ação real acontece lá, não no DASHBOARD).

## Métricas de sucesso

Zero card que mistura prazo do candidato com prazo do órgão no mesmo rótulo; 100% dos casos com
prazo do órgão a 90%+ com ação registrada antes do vencimento; zero atribuição de decisão de
recurso ao "CETRAN" em vez da Junta Especial de Saúde; tempo médio de bloqueio de cadastro
atribuível a atraso do órgão (métrica que existe precisamente para tornar visível o custo que o
candidato paga por um prazo sem sanção formal).
