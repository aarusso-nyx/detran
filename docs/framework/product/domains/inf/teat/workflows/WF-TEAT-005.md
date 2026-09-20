---
id: WF-TEAT-005
title: Fiscalização de alcoolemia — abordagem, triagem, teste/recusa, enquadramento, encaminhamento
status: reviewed
apps: [teat]
sources:
  [REF-CTB-165-277-medidas-alcoolemia, REF-CONTRAN-432, REF-INMETRO-369-2021]
updated: 2026-08-26
---

## Fundamento — cadeia normativa de três níveis

CTB arts. 165, 165-A, 276, 277 (tipo penal-administrativo e habilitação da "forma disciplinada
pelo Contran") → [REF-CONTRAN-432] (procedimento: meios de prova, requisitos do etilômetro,
sinais psicomotores, conteúdo mínimo do AIT) → [REF-INMETRO-369-2021] (regime metrológico do
próprio instrumento). O procedimento de etilômetro do TEAT precisa refletir os três níveis: a
lei fixa a infração, o CONTRAN disciplina o procedimento de apuração, o INMETRO garante que o
instrumento usado é confiável o bastante para sustentar o AIT como prova.

## Estados

```mermaid
stateDiagram-v2
    [*] --> ABORDAGEM : fiscalização de rotina ou\ncondutor envolvido em sinistro\nCTB art.277 caput

    ABORDAGEM --> TRIAGEM : agente verifica sinais de alteração\nda capacidade psicomotora e/ou\noferece procedimento de verificação\nRes.432 art.3º

    TRIAGEM --> ETILOMETRO_OFERECIDO : teste com etilômetro —\nPRIORITÁRIO entre os meios de prova\nRes.432 art.3º §2º\n[guard] aparelho com certificado de\nverificação metrológica INMETRO vigente\n(INMETRO-369 art.1º §1º; Res.432 art.4º)

    ETILOMETRO_OFERECIDO --> TESTE_REALIZADO : condutor se submete ao teste
    ETILOMETRO_OFERECIDO --> RECUSA_REGISTRADA : condutor recusa QUALQUER\nprocedimento do art.3º —\ngera infração autônoma (165-A)\nRes.432 art.6º § único; CTB art.165-A\nUC-TEAT-007
    ETILOMETRO_OFERECIDO --> IMPOSSIBILIDADE_TECNICA : falha do aparelho —\nNÃO gera 165-A, força outro meio\nCTB art.277 §2º

    TESTE_REALIZADO --> RESULTADO_ABAIXO_LIMITE : valor considerado < 0,05 mg/L\n(após desconto da margem de tolerância)\nRes.432 art.6º, I
    TESTE_REALIZADO --> RESULTADO_ADMINISTRATIVO : 0,05 ≤ valor considerado < 0,34 mg/L\nRes.432 art.6º, I — infração art.165 CTB
    TESTE_REALIZADO --> RESULTADO_CRIME : valor considerado ≥ 0,34 mg/L\nRes.432 art.7º, II — CRIME art.306 CTB

    IMPOSSIBILIDADE_TECNICA --> OUTRO_MEIO_PROVA : exame de sangue, clínico,\nlaboratorial, ou sinais psicomotores\nRes.432 art.3º, I/II/IV, §1º
    TRIAGEM --> SINAIS_CONSTATADOS : conjunto de sinais confirmado\npelo agente (não isolado) —\ntermo específico anexo ao AIT\nRes.432 art.5º §§1º-2º

    OUTRO_MEIO_PROVA --> RESULTADO_ADMINISTRATIVO : conforme o meio de prova utilizado
    OUTRO_MEIO_PROVA --> RESULTADO_CRIME : conforme o meio de prova utilizado
    OUTRO_MEIO_PROVA --> RESULTADO_ABAIXO_LIMITE : exame não confirma alteração
    SINAIS_CONSTATADOS --> RESULTADO_ADMINISTRATIVO : sinais bastam por si\n(independente do etilômetro)\nRes.432 art.6º, III

    RECUSA_REGISTRADA --> AIT_165A_LAVRADO : AIT por art.165-A +\nmedida administrativa (CNH+retenção)\nentra em WF-TEAT-001 · WF-TEAT-004
    RESULTADO_ADMINISTRATIVO --> AIT_165_LAVRADO : AIT por art.165 +\nmedida administrativa (CNH+retenção)\nentra em WF-TEAT-001 · WF-TEAT-004
    RESULTADO_CRIME --> ENCAMINHADO_POLICIA_JUDICIARIA : condutor + testemunhas +\nelementos probatórios encaminhados\nRes.432 art.7º §2º · FORA DO ESCOPO TEAT
    RESULTADO_ABAIXO_LIMITE --> SEM_AUTUACAO_ALCOOLEMIA : encerra o procedimento\n(outras infrações, se houver, seguem\nseu próprio enquadramento)

    AIT_165A_LAVRADO --> [*]
    AIT_165_LAVRADO --> [*]
    ENCAMINHADO_POLICIA_JUDICIARIA --> [*]
    SEM_AUTUACAO_ALCOOLEMIA --> [*]
```

## Guard central — validade metrológica do etilômetro

O teste só sustenta o AIT como prova se o aparelho, no momento do uso, tiver: (a) modelo aprovado
pelo INMETRO; (b) verificação metrológica inicial/eventual/em serviço/anual em dia — CTB art. 276
§único; [REF-CONTRAN-432] art. 4º, I-II; [REF-INMETRO-369-2021] art. 1º §1º. Requisito adotado:
o TEAT bloqueia o registro de teste de etilômetro vinculado a aparelho sem certificado de
verificação metrológica vigente e oferece os demais meios de prova ([UC-TEAT-007],
[RN-TEAT-135]).

## Recusa × impossibilidade técnica — distinção com efeito jurídico diferente

Ponto de maior risco de UX/produto do procedimento (ver handoff UX do dossiê de pesquisa): a
**recusa** a qualquer procedimento do art. 3º gera, por si só e automaticamente, a infração do
art. 165 (Res. 432 art. 6º, parágrafo único) e é tipificada à parte como art. 165-A; a
**impossibilidade técnica** do aparelho (falha, bateria, aparelho indisponível) **não gera** art.
165-A — apenas força o uso de outro meio de prova (art. 277 §2º CTB). O TEAT nunca deve tratar os
dois como o mesmo campo de "motivo" — são ramos com consequência jurídica distinta desde o
primeiro passo ([RN-TEAT-005] já modela a distinção para assinatura; este workflow estende o
mesmo princípio ao procedimento de etilômetro).

## Conteúdo mínimo do AIT de alcoolemia (Res. 432 art. 8º)

| Campo                                                                                                                  | Quando exigido                  |
| ---------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| Referência ao encaminhamento (exame de sangue/clínico/laboratorial)                                                    | se houve encaminhamento         |
| Sinais de alteração da capacidade psicomotora (Anexo II) ou referência ao termo específico                             | se apurado por sinais (art. 5º) |
| Marca, modelo, nº de série do aparelho; nº do teste; medição realizada; valor considerado; limite regulamentado (mg/L) | se apurado por etilômetro       |
| Identificação de testemunha(s); fotos/vídeos/outro meio complementar; flag de recusa                                   | conforme disponível             |

## Fronteira de escopo — crime (art. 306 CTB)

Quando o valor considerado ultrapassa 0,34 mg/L (dez vezes o limiar administrativo), o
procedimento **bifurca para a Polícia Judiciária** — fora do escopo TEAT. O TEAT precisa apenas
**sinalizar** o encaminhamento como evento registrado (condutor e testemunhas acompanhados dos
elementos probatórios, Res. 432 art. 7º §2º); a instrução do crime em si não é ato de campo TEAT.

## Prazos e timers (base legal por prazo)

| Timer   | Prazo                              | Gatilho                                                                                   | Consequência                                                      | Base                          |
| ------- | ---------------------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------- |
| T-CNH5D | 5 dias                             | recolhimento de CNH em decorrência do art. 165/165-A                                      | não comparecimento → documento encaminhado ao órgão de registro   | [REF-CONTRAN-432] art. 10 §1º |
| —       | não há prazo de espera para autuar | sinais confirmados ou etilômetro comprovado, com encaminhamento a exame de sangue/clínico | autuação administrativa **não aguarda** o resultado desses exames | [REF-CONTRAN-432] art. 3º §3º |

## Limiares regulamentados (não são timers, mas guardam a mesma disciplina de citação)

| Limiar                             | Valor                                                                                          | Efeito                                                               | Base                                                    |
| ---------------------------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------- |
| Infração administrativa (art. 165) | valor considerado ≥ 0,05 mg/L                                                                  | AIT art. 165                                                         | [REF-CONTRAN-432] art. 6º, II                           |
| Crime (art. 306)                   | valor considerado ≥ 0,34 mg/L                                                                  | encaminhamento à Polícia Judiciária                                  | [REF-CONTRAN-432] art. 7º, II                           |
| Margem de tolerância               | erro máximo admissível da "Tabela de Valores Referenciais para Etilômetro" (Anexo I, Res. 432) | descontado da medição realizada antes de comparar aos limiares acima | CTB art. 276 § único; [REF-CONTRAN-432] art. 4º § único |

## Atores por transição

field-agent (abordagem, triagem, oferecimento do teste, registro do resultado/recusa/
impossibilidade, encaminhamento); condutor (submete-se ou recusa o procedimento); Polícia
Judiciária (recebe encaminhamento em caso de crime — ator externo ao TEAT, apenas destino de
evento).

## Ponte com [WF-TEAT-001] e [WF-TEAT-004]

`AIT_165A_LAVRADO`/`AIT_165_LAVRADO` são pontos de entrada em [WF-TEAT-001] (`[*] -->
RASCUNHO_OFFLINE`), carregando o enquadramento correspondente; a medida administrativa vinculada
(recolhimento de CNH + retenção do veículo, ambas obrigatórias por força do próprio tipo penal —
não discricionárias) segue [WF-TEAT-004] sub-máquina A.

## Decisões de modelagem pendentes

- Bloqueio de registro de teste com aparelho sem certificado metrológico vigente — requisito
  adotado: a ausência de certificação válida bloqueia o teste, conforme [UC-TEAT-007] e
  [RN-TEAT-135].
- O blueprint adotado de destino e o blueprint imutável de origem são consistentes: ambos
  representam testemunhas em `witnesses_json` e possuem a entidade `PsychomotorSign` para os sinais psicomotores.
  O corpus CRAWLER também cita `AlcoholTest`/`AlcoholRefusal` (RN-ALC-004/010). A lacuna
  documental `source_pending` limita-se à forma e ao conteúdo do `alcohol-signs-term`, sem negar a
  entidade.
