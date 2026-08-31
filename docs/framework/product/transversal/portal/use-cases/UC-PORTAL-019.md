---
id: UC-PORTAL-019
title: Cidadão eleva o nível de assinatura/conta ao tentar um ato que exige nível superior
status: reviewed
apps: [portal]
sources: [REF-DECRETO-10543-2020, REF-DECRETO-8936-2016]
updated: 2026-08-26
---

## Ator e objetivo

Cidadão com conta gov.br de nível insuficiente para o ato desejado (ex. defesa prévia, exige
assinatura avançada) completa a elevação de nível dentro do próprio fluxo do PORTAL, sem precisar
descobrir por conta própria que existe um processo de elevação nem sair para outro canal sem
retorno guiado.

## Pré-condições

- Cidadão autenticado com conta gov.br de nível insuficiente para o ato selecionado
  ([WF-PORTAL-002] `NIVEL_INSUFICIENTE`).

## Fluxo principal

1. Cidadão tenta iniciar um ato (ex. "Apresentar defesa") com conta em nível insuficiente.
2. Sistema NUNCA mostra um erro seco — explica exatamente qual nível falta e por que este ato
   específico exige esse nível (citando em linguagem simples: "atos que geram efeito jurídico sobre
   terceiros exigem uma verificação de identidade mais forte"), com botão único de ação "Elevar meu
   nível agora".
3. Cidadão escolhe um dos caminhos de validação oferecidos pela Plataforma gov.br: validação
   biográfica/documental (presencial ou remota, conferida por agente), validação biométrica contra
   base governamental, ou certificado ICP-Brasil (Decreto 10.543/2020 art.5º, I-III).
4. Concluída a validação, sistema retoma automaticamente o ato original exatamente de onde o
   cidadão parou — nunca reinicia o formulário do zero.

## Fluxos alternativos / exceções

- **3a.** Cidadão interrompe a elevação antes de concluir: sistema salva o ato original como
  rascunho e mantém um lembrete visível ("Falta 1 passo: verificar sua identidade") — nunca some o
  progresso do cidadão. Este abandono alimenta o KPI "taxa de elevação de nível abandonada"
  ([APP-PORTAL]).
- **3b.** Validação biométrica falha (ex. reconhecimento facial não confere): sistema oferece
  imediatamente o caminho alternativo (biográfico/documental), nunca deixa o cidadão preso em um
  único método sem saída.
- **4a.** Ato original tinha prazo legal correndo durante a elevação: sistema mostra o prazo
  restante durante todo o processo de elevação, para que o cidadão saiba se ainda há tempo — a
  elevação não pausa nenhum prazo legal.

## Pós-condições

Conta do cidadão com nível de assinatura elevado (permanente, reconsultado a cada ato futuro); ato
original retomado e concluível.

## Critérios de aceitação

**AC-PORTAL-019-1 — nível insuficiente nunca é erro seco**

- **Dado** um ato que exige nível superior
- **Quando** o cidadão o tenta
- **Então** o sistema explica qual nível falta, por que aquele ato o exige, e oferece um botão
  único de elevação

**AC-PORTAL-019-2 — nível de conta gov.br não é nível de assinatura**

- **Dado** uma conta prata ou ouro
- **Quando** o nível exigido é avaliado
- **Então** o sistema decide pelo **nível de assinatura** do ato ([RN-PORTAL-101]), nunca pela cor
  do selo da conta ([RN-PORTAL-102]) — bronze/prata/ouro não é categoria normativa

**AC-PORTAL-019-3 — nenhum ato do PORTAL exige assinatura qualificada**

- **Dado** a matriz ato→nível
- **Quando** é aplicada
- **Então** o teto é a assinatura **avançada** ([RN-PORTAL-101]) — exigir qualificada é criar
  barreira sem base normativa

**AC-PORTAL-019-4 — elevar retoma o ato onde parou**

- **Dado** um formulário preenchido interrompido pela elevação
- **Quando** a validação conclui
- **Então** o cidadão volta exatamente ao ponto anterior — nunca ao início

**AC-PORTAL-019-5 — a exigência de nível tem lastro estadual**

- **Dado** a exigência de assinatura avançada
- **Quando** é oposta ao cidadão
- **Então** ela se apoia em ato **estadual**; o Decreto 10.543/2020 é federal, e sem portaria
  estadual a exigência é atacável (Lei 13.460 art.5º IV) — pendência de alto impacto e baixo custo
  (DT-050)

## Regras aplicáveis

- [REF-DECRETO-10543-2020] art.4º (matriz de nível exigido por ato)
- [REF-DECRETO-10543-2020] art.5º (métodos de obtenção de cada nível)
- Princípio "elevação guiada, nunca beco sem saída" ([WF-PORTAL-002])
