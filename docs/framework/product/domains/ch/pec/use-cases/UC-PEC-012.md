---
id: UC-PEC-012
title: Monitorar exame toxicológico periódico pós-CNH (a cada 2,5 anos, C/D/E)
status: reviewed
apps: [pec]
sources: [REF-CONTRAN-923-1009-toxicologico]
updated: 2026-08-31
---

O art. 10-A da Res. CONTRAN 923/2022, incluído pela 1.009/2024, cria exame toxicológico periódico
pós-habilitação para condutores C/D/E a cada **2 anos e 6 meses** ([RN-PEC-121]). O Owner confirmou
o ramo (b) de DT-024 e aprovou o desenho operacional em 2026-08-31: o PEC recebe do RENACH o evento
autenticado de resultado e mantém o reflexo estadual, sem criar atendimento clínico fictício e
sem integrar diretamente com laboratório.

## O que a norma já estabelece

- Periodicidade de 2 anos e 6 meses para condutores das categorias C, D e E ([RN-PEC-121]).
- O alerta de vencimento é emitido **pela SENATRAN diretamente ao condutor** (art. 10-B §1º) — a
  norma **não** menciona o órgão executivo estadual como intermediário.
- A validade do resultado é de 90 dias contados da coleta, igual à do exame pré-etapa
  ([WF-PEC-005] §Prazos).
- A submáquina completa já está modelada em [WF-PEC-005] §Submáquina 2 — o que falta é saber se
  o PEC participa dela.

## Atores e fronteiras

- **SENATRAN/RENACH:** publica o evento e continua responsável pelo alerta ao condutor.
- **Adaptador SENATRAN:** autentica o callback, preserva identidade/hash e traduz o contrato
  externo; nenhum controller de domínio aceita evento nacional não autenticado.
- **PEC:** registra resultado imutável, correlaciona o condutor e mantém o reflexo estadual da
  suspensão.
- **Operador de integração:** trata apenas exceções de correlação/processamento; não cria nem
  altera resultado laboratorial.

O evento periódico não cria `encounter`, agendamento, cobrança ou laudo PEC. A fonte clínica é o
laboratório credenciado via RENACH.

## Fluxo principal

1. O adaptador recebe evento com identidade única, CPF do condutor, categoria, data de coleta,
   resultado, laboratório e referência de origem.
2. Autentica a origem, valida payload e categoria C/D/E e deduplica pela identidade do evento.
3. Correlaciona o condutor pelo CPF dentro do tenant e registra o resultado imutável.
4. Para `RESULTADO_POSITIVO`, cria suspensão por três meses contados do evento normativo e registra
   a comunicação pendente ao processo nacional.
5. Para `RESULTADO_NEGATIVO` válido posterior, libera suspensão ativa vinculada ao mesmo condutor;
   o resultado positivo original permanece íntegro.
6. Eventos sem correlação, vencidos, conflitantes ou inválidos ficam em exceção auditável e não
   alteram o cadastro.

## Critérios de aceitação

**AC-PEC-012-1 — evento nacional é autenticado e idempotente**

- **Dado** um callback periódico
- **Quando** ele chega ao DETRAN
- **Então** somente o adaptador SENATRAN autenticado o entrega ao processamento, e repetir a mesma
  identidade/payload não duplica efeitos; reutilizar a identidade com outro payload é rejeitado

**AC-PEC-012-2 — exame periódico não fabrica atendimento clínico**

- **Dado** um resultado pós-CNH válido
- **Quando** ele é persistido
- **Então** existe registro toxicológico próprio, sem criar `encounter`, agendamento, cobrança ou
  laudo PEC

**AC-PEC-012-3 — escopo e validade são validados**

- **Dado** o payload recebido
- **Quando** é processado
- **Então** apenas categorias C/D/E são aceitas e a validade do resultado é de 90 dias da coleta

**AC-PEC-012-4 — positivo cria suspensão rastreável de três meses**

- **Dado** resultado periódico positivo válido
- **Quando** é aplicado ao condutor correlacionado
- **Então** registra suspensão de três meses, fonte, evento causador e estado de comunicação,
  sem mutar o resultado de origem

**AC-PEC-012-5 — negativo posterior pode liberar sem apagar história**

- **Dado** suspensão toxicológica ativa
- **Quando** chega resultado negativo válido com coleta posterior
- **Então** a suspensão é liberada com vínculo ao evento liberador e ambos os resultados permanecem
  auditáveis

**AC-PEC-012-6 — alertas e exceções não são inventados**

- **Dado** que a SENATRAN alerta o condutor e que um evento pode não correlacionar
- **Quando** o PEC recebe o evento
- **Então** registra o estado informado sem declarar alerta próprio, e evento inválido/não
  correlacionado entra em exceção sem alterar o cadastro

## Regras aplicáveis

- [RN-PEC-121] (exame toxicológico periódico pós-CNH)
- Referência: [WF-PEC-005] §Submáquina 2 e §Pergunta de escopo de produto
