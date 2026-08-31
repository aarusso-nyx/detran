---
id: UC-TEAT-007
title: Agente conduz procedimento de etilômetro (teste, recusa, sinais, encaminhamento)
status: reviewed
apps: [teat]
sources:
  [REF-CTB-165-277-medidas-alcoolemia, REF-CONTRAN-432, REF-INMETRO-369-2021]
updated: 2026-08-26
---

## Ator e objetivo

Agente de trânsito (field-agent), durante abordagem ou atendimento de sinistro, conduz o
procedimento de verificação de influência de álcool/substância psicoativa do condutor, registrando
um resultado que produz efeito jurídico determinado — autuação administrativa, encaminhamento
criminal, ou nenhuma autuação — sem jamais confundir recusa com impossibilidade técnica do
aparelho.

## Pré-condições

- Condutor abordado em fiscalização de rotina ou envolvido em sinistro de trânsito (CTB art. 277
  _caput_).
- Se o etilômetro for o meio escolhido: aparelho vinculado ao dispositivo tem modelo aprovado pelo
  INMETRO e certificado de verificação metrológica vigente ([REF-CONTRAN-432] art. 4º;
  [REF-INMETRO-369-2021] art. 1º §1º) — ver [WF-TEAT-005] §Guard.

## Fluxo principal

1. Agente inicia o procedimento (tela `alcohol-start`, grupo `alcoolemia`).
2. Agente verifica sinais de alteração da capacidade psicomotora, se presentes ([REF-CONTRAN-432]
   art. 5º) — um sinal isolado não basta; exige-se conjunto de sinais (art. 5º §1º).
3. Agente oferece o teste de etilômetro, meio prioritário entre os procedimentos do art. 3º
   ([REF-CONTRAN-432] art. 3º §2º).
4. Condutor se submete ao teste. Sistema registra marca, modelo e nº de série do aparelho, nº do
   teste, medição realizada e valor considerado (após desconto da margem de tolerância da "Tabela
   de Valores Referenciais para Etilômetro", Anexo I).
5. Sistema classifica o valor considerado em uma das três faixas de [WF-TEAT-005]:
   `< 0,05 mg/L` (sem autuação por alcoolemia), `0,05–0,34 mg/L` (infração administrativa, art.
   165), `≥ 0,34 mg/L` (crime, art. 306).
6. Se administrativo ou se sinais bastaram por si: agente lavra AIT por art. 165 (segue
   [UC-TEAT-001]/[UC-TEAT-002]) com as medidas administrativas vinculadas — recolhimento de CNH e
   retenção do veículo, obrigatórias por força do tipo penal, não discricionárias ([WF-TEAT-004]).
7. Se crime: agente registra o encaminhamento do condutor (e testemunhas, se houver) à Polícia
   Judiciária como evento — instrução do crime em si é **fora do escopo TEAT**
   ([REF-CONTRAN-432] art. 7º §2º).

## Fluxos alternativos / exceções

- **3a. Recusa.** Condutor recusa-se a se submeter a **qualquer** procedimento do art. 3º (não só
  o etilômetro) → gera automaticamente a infração do art. 165 (Res. 432 art. 6º, parágrafo único)
  e é tipificada à parte como **art. 165-A** ([RN-TEAT-005]) — agente lavra AIT por art. 165-A com
  as mesmas medidas administrativas do art. 165, distinto do fluxo de resultado positivo do
  passo 6.
- **3b. Impossibilidade técnica.** Aparelho indisponível, sem bateria, sem certificado vigente ou
  outra falha técnica → **não gera** art. 165-A; agente encaminha para outro meio de prova (exame
  de sangue, exame clínico, laboratorial, ou constatação de sinais — art. 3º, I/II/IV, §1º).
- **2a. Sinais confirmados sem etilômetro.** Conjunto de sinais é suficiente, por si, para
  caracterizar a infração (Res. 432 art. 6º, III) — agente registra em termo específico anexo ao
  AIT, com o conteúdo mínimo do Anexo II ([REF-CONTRAN-432] art. 5º §2º).
- **4a. Encaminhamento a exame de sangue/clínico.** Autuação administrativa **não aguarda** o
  resultado do exame (Res. 432 art. 3º §3º) — o exame apenas reforça a prova, sem bloquear a
  finalização do AIT.

## Pós-condições

Um dos quatro desfechos está registrado: AIT por art. 165-A (recusa), AIT por art. 165 (resultado
administrativo ou sinais), encaminhamento à Polícia Judiciária (crime, evento apenas), ou nenhuma
autuação por alcoolemia (resultado abaixo do limiar). Conteúdo mínimo do AIT de alcoolemia
([REF-CONTRAN-432] art. 8º) preenchido conforme o meio de prova utilizado.

## Critérios de aceitação

**AC-TEAT-007-1 — etilômetro sem verificação vigente não produz prova**

- **Dado** um etilômetro sem modelo aprovado pelo INMETRO ou com certificado de verificação vencido
- **Quando** o agente tenta iniciar o teste
- **Então** o sistema bloqueia a via de medição ([RN-TEAT-135]) e oferece os demais meios de prova
  do art. 3º — a medição por aparelho irregular jamais é registrada como resultado

**AC-TEAT-007-2 — medição realizada e valor considerado são dois campos**

- **Dado** um teste concluído
- **Quando** o resultado é registrado
- **Então** o sistema persiste e exibe a medição realizada **e** o valor considerado após a margem
  do Anexo I, sempre juntos ([RN-TEAT-133]) — nunca um valor único

**AC-TEAT-007-3 — as três faixas produzem desfechos distintos**

- **Dado** um valor considerado
- **Quando** é classificado
- **Então** `< 0,05 mg/L` não gera autuação por alcoolemia; `0,05–0,34` gera AIT do art. 165;
  `≥ 0,34` gera o encaminhamento criminal do art. 306 além da autuação administrativa
  ([RN-TEAT-133])

**AC-TEAT-007-4 — recusa é infração autônoma, não metadado do teste**

- **Dado** um condutor que recusa **qualquer** procedimento do art. 3º
- **Quando** o agente registra a recusa
- **Então** o sistema lavra AIT por art. 165-A como enquadramento próprio ([RN-TEAT-134]) — a
  recusa nunca é gravada como atributo de um teste que não houve

**AC-TEAT-007-5 — impossibilidade técnica não gera 165-A**

- **Dado** aparelho indisponível, sem bateria ou sem certificado vigente
- **Quando** o agente registra a impossibilidade
- **Então** o sistema **não** oferece o enquadramento do art. 165-A e encaminha aos outros meios de
  prova ([RN-TEAT-134], [RN-TEAT-131]) — recusa e impossibilidade ocupam campos distintos

**AC-TEAT-007-6 — sinais exigem conjunto, e produzem termo estruturado**

- **Dado** a verificação de sinais psicomotores
- **Quando** o agente registra
- **Então** o sistema exige o conjunto do Anexo II, recusa um sinal isolado como suficiente, e gera
  termo específico anexo ao AIT com conteúdo estruturado, não texto livre ([RN-TEAT-132])

**AC-TEAT-007-7 — os quatro meios de prova não se excluem**

- **Dado** um procedimento em que o etilômetro falhou
- **Quando** o agente escolhe outro meio
- **Então** exame de sangue, exame clínico, laboratorial e constatação de sinais permanecem todos
  disponíveis, com prioridade normativa do etilômetro apenas como ordem de preferência
  ([RN-TEAT-131])

**AC-TEAT-007-8 — a autuação não espera o laboratório**

- **Dado** encaminhamento a exame de sangue ou clínico
- **Quando** o agente finaliza o AIT
- **Então** a finalização ocorre sem aguardar resultado ([REF-CONTRAN-432] art. 3º §3º), e a tela
  diz isso explicitamente

**AC-TEAT-007-9 — as medidas do art. 165 são vinculadas, não discricionárias**

- **Dado** um AIT por art. 165 ou 165-A
- **Quando** ele é composto
- **Então** recolhimento do documento de habilitação e retenção do veículo são aplicados por força
  do tipo, com custódia do documento por 5 dias e encaminhamento à Polícia Judiciária quando
  couber ([RN-TEAT-137]) — o sistema não oferece ao agente a opção de omiti-las

**AC-TEAT-007-10 — conteúdo mínimo do AIT de alcoolemia**

- **Dado** um AIT por alcoolemia
- **Quando** o agente tenta finalizar
- **Então** o sistema exige os nove elementos adicionais ao art. 280 ([RN-TEAT-136]): aparelho
  (marca, modelo, série), nº do teste, medição, valor considerado, limite aplicável, testemunha,
  mídia e o registro de recusa quando houver

## Regras aplicáveis

- [RN-TEAT-005] (assinatura/recusa/impossibilidade como resultados distintos — estendida aqui ao
  procedimento de etilômetro)
- [RN-TEAT-134] (recusa ao procedimento de verificação é infração autônoma do art. 165-A — nunca
  mero metadado do teste; impossibilidade técnica não gera 165-A)
