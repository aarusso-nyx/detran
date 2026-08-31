---
id: UC-PEC-012
title: Monitorar exame toxicológico periódico pós-CNH (a cada 2,5 anos, C/D/E)
status: stub
apps: [pec]
sources: [REF-CONTRAN-923-1009-toxicologico]
updated: 2026-08-26
---

**Permanece `stub` deliberadamente.** O art. 10-A da Res. CONTRAN 923/2022, incluído pela
1.009/2024, cria um exame toxicológico periódico pós-habilitação para condutores C/D/E — a cada
**2 anos e 6 meses** ([RN-PEC-121]). É obrigação legal inteiramente ausente de todo artefato do
PEC: nenhum encounter, nenhum papel e nenhuma rota hoje recebe ou processa esse evento.

Escrever o fluxo exigiria presumir a resposta a uma pergunta de escopo que **só o Owner pode
responder** (DT-024), e a rodada de endurecimento de 2026-08-26 optou por afiar a pergunta em vez
de inventar o desenho. O que está estabelecido, e o que muda em cada ramo:

## O que a norma já estabelece

- Periodicidade de 2 anos e 6 meses para condutores das categorias C, D e E ([RN-PEC-121]).
- O alerta de vencimento é emitido **pela SENATRAN diretamente ao condutor** (art. 10-B §1º) — a
  norma **não** menciona o órgão executivo estadual como intermediário.
- A validade do resultado é de 90 dias contados da coleta, igual à do exame pré-etapa
  ([WF-PEC-005] §Prazos).
- A submáquina completa já está modelada em [WF-PEC-005] §Submáquina 2 — o que falta é saber se
  o PEC participa dela.

## Ramo (a) — fora do escopo do PEC

O ciclo é SENATRAN ↔ condutor ↔ laboratório, sem passar por clínica credenciada nem por sistema
estadual. Consequência: este caso de uso é **arquivado como documentação de completude legal**,
[WF-PEC-005] §Submáquina 2 passa a ser marcado como fora de escopo, e nada é construído.

## Ramo (b) — o PEC recebe o resultado

O RENACH publica o resultado a sistemas estaduais e o PEC precisa processá-lo. Consequência: é um
fluxo de negócio inteiro a desenhar, e não pequeno — receptor do evento, ator responsável (nenhum
papel atual o tem), efeito sobre o cadastro do condutor em caso de resultado positivo, e a
articulação com o bloqueio de [RN-PEC-106]. Exigiria caso de uso completo, provavelmente
workflow próprio, e tem impacto de schema.

## O que decide entre os dois

Uma única investigação de integração: **o RENACH publica o evento de resultado toxicológico
periódico a sistemas estaduais?** Se sim, ramo (b); se não, ramo (a). É pergunta ao canal
DETRAN-AM↔SENATRAN, não pesquisa normativa — a norma já foi lida e não responde.

## Regras aplicáveis

- [RN-PEC-121] (exame toxicológico periódico pós-CNH — obrigação legal ausente do PEC)
- Referência: [WF-PEC-005] §Submáquina 2 e §Pergunta de escopo de produto
