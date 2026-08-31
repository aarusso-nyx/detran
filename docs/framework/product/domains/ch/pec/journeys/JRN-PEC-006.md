---
id: JRN-PEC-006
title: Motorista profissional C/D/E e o exame toxicológico periódico — o relógio de 2 anos e meio, o que acontece se ele vencer, e o cuidado com um resultado sensível
status: draft
apps: [pec]
sources:
  - REF-CONTRAN-923-1009-toxicologico
  - RN-PEC-007
  - WF-PEC-001
updated: 2026-08-24
---

## Persona e contexto

Jorge dirige um caminhão categoria E há 12 anos — é sua profissão, não um exame que ele faz
uma vez e esquece. Diferente do exame toxicológico de pré-etapa já modelado em [RN-PEC-007]
(uma vez, antes da habilitação/renovação, com validade de 90 dias), a Resolução CONTRAN
923/2022 — na redação dada pela Resolução 1.009/2024, art. 10-A — cria um **exame toxicológico
periódico**: condutores C/D/E com menos de 70 anos são submetidos a novo exame **a cada dois
anos e seis meses**, contados da emissão/renovação da CNH, **independentemente da validade dos
demais exames** do art. 147 do CTB. Esse fluxo é um achado desta rodada de pesquisa
**inteiramente ausente de qualquer artefato PEC** — nenhum `RN-PEC`, nenhum `WF-PEC` o modela,
e a pergunta de escopo (o PEC participa desse ciclo ou ele é 100% externo, tratado direto entre
SENATRAN e o condutor?) está registrada como item aberto para BPO/LEGAL no dossiê de pesquisa
desta rodada. Esta jornada é escrita assumindo o cenário em que o PEC participa — porque é o
cenário que exige desenho de UX; se a decisão de produto for "100% externo", esta jornada vira
diretamente a justificativa de por que nenhuma tela é necessária.

O outro fio condutor desta jornada é o cuidado com um dado especialmente sensível: um exame
toxicológico não é "mais um exame médico" do ponto de vista de dignidade — um resultado
positivo revela uso de substância, com estigma social real, e a consequência prática (suspensão
do direito de dirigir) atinge diretamente o sustento de Jorge, que é motorista profissional.

## Narrativa ponta-a-ponta

1. **O calendário de Jorge é dele — e o sistema (se participar) precisa mostrá-lo com
   antecedência, não só na véspera.** [REF-CONTRAN-923-1009-toxicologico] art. 10-B §1º-§2º:
   o órgão máximo executivo de trânsito da União (SENATRAN) já é responsável por disponibilizar
   ao condutor a última data de coleta, orientações, e a data de vencimento do próximo exame,
   com **alerta de vencimento emitido 30 dias antes**. Se esse alerta chega a Jorge por um
   canal que passa pelo PEC, ele precisa preservar a mesma antecedência de 30 dias — nunca
   comunicar o vencimento como uma surpresa de última hora.
2. **Jorge faz o novo exame — o calendário não é afetado por segunda via da CNH.** Art. 10-A
   §2º: emitir uma segunda via da CNH não reinicia o relógio de 2 anos e 6 meses — o cálculo é
   sempre a partir da data de emissão/renovação registrada no RENACH (art. 10-A §1º). Uma tela
   que mostrasse "próximo exame" recalculado a cada segunda via estaria errada; o dado de
   referência é fixo.
3. **Isenção para CNH com validade curta.** Art. 10-A §3º: o exame periódico não é exigido para
   condutores cuja CNH tenha validade inferior a três anos — uma condição de elegibilidade que
   qualquer tela de "seu próximo exame" precisa verificar antes de gerar um alerta desnecessário
   a Jorge.
4. **O resultado, se positivo, é tratado com o mesmo cuidado de um resultado clínico sensível —
   nunca exposto fora do necessário.** Este não é apenas um princípio de boas práticas — é a
   mesma doutrina de mascaramento por padrão já adotada para dado de saúde em `est/boat`
   (`_intake/ux-notes.md` §d), estendida aqui a um dado ainda mais estigmatizante: uso de
   substância. Nenhuma tela de fila, painel de clínica ou lista de pendências deveria mostrar
   "Jorge — TOXICOLÓGICO POSITIVO" a qualquer papel que não seja estritamente responsável pelo
   gate; o resumo validado ("exame realizado: sim/não; resultado dentro do prazo: sim/não") é o
   que aparece por padrão, com o detalhe bruto atrás de um segundo passo auditado.
5. **Consequência de um resultado positivo — suspensão de três meses, não bloqueio
   silencioso.** Art. 16 (redação 1.009/2024): resultado positivo no exame do art. 10-A gera
   suspensão do direito de dirigir por três meses, condicionado o levantamento da suspensão a
   um resultado negativo em novo exame ou ao cumprimento da penalidade. Para Jorge, motorista
   profissional, essa é uma informação que afeta diretamente sua renda — a comunicação dessa
   consequência precisa ser clara sobre **o que ele pode fazer a seguir** (novo exame, quando),
   não apenas "suspenso", da mesma forma que [JRN-PEC-004] evita deixar "apto com restrições"
   como uma frase sem próximo passo.
6. **Lapso do prazo sem exame — consequência não documentada no corpus lido.** Nenhuma fonte
   capturada nesta rodada descreve explicitamente o que acontece se Jorge simplesmente deixa o
   prazo de 2 anos e 6 meses vencer sem fazer o novo exame (silêncio, não recusa) — diferente do
   caso de resultado positivo (art. 16, consequência explícita). Esta jornada não inventa uma
   penalidade para esse cenário; qualquer tela que tratar desse caso deveria, até validação
   LEGAL, comunicar apenas o fato ("exame vencido — pendência a resolver"), nunca uma
   consequência jurídica específica não confirmada.
7. **Fim da jornada no PEC (se o PEC participar).** Como em [JRN-PEC-001], o resultado final e
   os efeitos sobre a habilitação de Jorge são geridos no RENACH — o papel do PEC, se houver,
   é o de processar o resultado transmitido pelo laboratório credenciado (ator externo, não o
   PEC nem a clínica) com o mesmo cuidado de mascaramento do passo 4.

## Pontos de contato (apps/canais)

- SENATRAN/RENACH — origem do calendário e do alerta de 30 dias (art. 10-B).
- Laboratório toxicológico credenciado (externo) — produz o resultado.
- PEC (se o escopo de produto confirmar participação) — processamento e exibição do resultado
  a papéis internos, sempre mascarado por padrão.
- Eventual canal direto SENATRAN→condutor — cenário alternativo se o PEC for 100% externo a
  este fluxo.

## Métricas de sucesso

- Alerta de vencimento entregue com, no mínimo, os 30 dias de antecedência do art. 10-B §2º —
  nunca comunicado como surpresa de última hora.
- Zero exibição de detalhe de resultado toxicológico positivo em tela compartilhada/fila — só
  no resumo validado, com revelação do dado bruto como segundo passo auditado.
- Zero consequência jurídica inventada para o cenário de "prazo vencido sem exame realizado"
  além do que o art. 16 confirma para resultado positivo.
- Decisão de escopo de produto (PEC participa deste fluxo ou é 100% externo) registrada e
  visível — item aberto herdado do dossiê de pesquisa, não resolvido por esta jornada.
