---
id: UC-PORTAL-008
title: Cidadão recebe e compreende a decisão do processo
status: approved
apps: [portal, rait]
sources: [REF-CONTRAN-918, REF-CTB-extracts-raw]
updated: 2026-08-26
---

## Ator e objetivo

Requerente é informado do resultado do julgamento (defesa, JARI, ou CETRAN) de forma que entenda,
sem apoio humano, o que aconteceu e qual é o próximo passo possível.

## Pré-condições

- Decisão assinada pela autoridade competente (autoridade de trânsito, JARI, ou CETRAN) no RAIT.

## Fluxo principal

1. RAIT assina a decisão e dispara o evento de resultado ([REF-CONTRAN-918] art.17).
2. PORTAL notifica o cidadão no mesmo dia (push/e-mail; SNE se aderido).
3. Cidadão abre a tela de decisão: resultado (provido/acolhida ou negado/indeferida) em destaque,
   seguido de um resumo em linguagem simples do fundamento — nunca apenas o texto jurídico bruto do
   parecer como única explicação.
4. Sistema mostra o próximo passo aplicável, já como ação clicável: se provido e não há mais
   instância, "Nada a fazer — multa cancelada" (com restituição, se já paga —
   [REF-CTB-extracts-raw] art.286 §2º); se negado e ainda cabe recurso, "Recorrer ao CETRAN" já
   pré-vinculado ao caso ([UC-PORTAL-003]); se negado em última instância, valor final e formas de
   pagamento.
5. Documento formal da decisão (parecer/ata, conforme a instância) fica disponível para download a
   qualquer momento a partir desta tela.

## Fluxos alternativos / exceções

- **1a.** Provimento com recurso da própria autoridade (quando a JARI dá provimento e a autoridade
  recorre): cidadão é informado explicitamente dessa possibilidade e do novo prazo em curso
  ([REF-CONTRAN-918] art.17 § único).
- **4a.** Decisão de última instância negada: sistema é transparente sobre não haver mais recurso
  administrativo ([REF-CTB-extracts-raw] art.290), evitando qualquer redação que sugira um próximo
  passo administrativo inexistente.

## Pós-condições

Cidadão ciente do resultado e do próximo passo (se houver) sem necessidade de contato humano;
documento formal da decisão acessível permanentemente no histórico do processo.

## Critérios de aceitação

**AC-PORTAL-008-1 — o resultado vem antes do fundamento, em linguagem simples**

- **Dado** uma decisão publicada
- **Quando** o cidadão a abre
- **Então** vê o resultado em destaque e um resumo compreensível do fundamento — o texto jurídico
  bruto do parecer nunca é a única explicação

**AC-PORTAL-008-2 — o próximo passo é uma ação, não uma informação**

- **Dado** uma decisão negativa que ainda admite recurso
- **Quando** é exibida
- **Então** "Recorrer ao CETRAN" aparece já vinculado ao caso, com a data-limite calculada
  ([UC-PORTAL-003])

**AC-PORTAL-008-3 — provimento com pagamento anterior informa a restituição**

- **Dado** um provimento sobre multa já paga
- **Quando** é comunicado
- **Então** a tela informa o direito à restituição atualizada ([RN-PORTAL-127], [RN-RAIT-129]) —
  não deixa o cidadão descobrir sozinho

**AC-PORTAL-008-4 — provimento em JARI informa que ainda não é definitivo**

- **Dado** um provimento de 1ª instância
- **Quando** é comunicado
- **Então** o cidadão é informado de que a autoridade pode recorrer, e em que prazo
  ([RN-RAIT-130], CONTRAN-918 art.17 §ú)

**AC-PORTAL-008-5 — o documento formal fica disponível**

- **Dado** a decisão
- **Quando** o cidadão quer o documento
- **Então** parecer ou ata estão disponíveis para download, sem pedido adicional
  ([RN-PORTAL-112])

## Regras aplicáveis

- [RN-RAIT-003] (documentos que o órgão já tem são anexados de ofício ao próximo requerimento, se
  houver)
