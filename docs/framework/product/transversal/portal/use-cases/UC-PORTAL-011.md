---
id: UC-PORTAL-011
title: Cidadão consulta e baixa a CNH digital (CNH-e)
status: approved
apps: [portal]
sources: [REF-CONTRAN-809-2020]
updated: 2026-08-26
---

## Ator e objetivo

Condutor habilitado consulta e baixa a versão digital da própria CNH, com a mesma fé pública e
equivalência a documento de identidade da via física (CTB art.159, I e III, redação da Lei
15.428/2026).

## Pré-condições

- Condutor identificado via login gov.br, nível simples ([WF-PORTAL-002]; Decreto 10.543/2020
  art.4º I, "b").
- CNH ativa e registrada no RENACH, sem processo de habilitação pendente que a invalide.

## Fluxo principal

1. Condutor acessa "Minha CNH digital".
2. Sistema exibe os dados da CNH vigente (categoria, validade, restrições, se houver) e o
   documento digital pronto para exibição/download, com QR Code ou mecanismo equivalente de
   validação por terceiros (mesmo padrão de fiscalização do CRLV-e — Res. 809/2020 art.7º, por
   analogia).
3. Sistema destaca a validade e a data de vencimento já calculada — nunca "10 anos desde a
   emissão" cru, sempre a data final.
4. Condutor pode baixar/exibir offline (uso em fiscalização sem conexão) e compartilhar/imprimir se
   necessário.

## Fluxos alternativos / exceções

- **2a.** CNH vencida ou suspensa: sistema não emite a via digital como válida para condução;
  explica o motivo e o caminho de regularização (renovação, ou processo em curso no PEC).
- **2b.** Processo de habilitação com pendência de quitação de débitos (CTB art.159 §8º): sistema
  explicita a pendência antes de negar a emissão, com link direto para o módulo de pagamento —
  nunca um bloqueio sem explicação (mesmo padrão adotado para o CRLV-e em [UC-PORTAL-012]).

## Pós-condições

Documento digital disponível para uso do condutor; nenhuma alteração de dado no RENACH — consulta
e emissão de via são somente leitura sobre o registro nacional.

## Critérios de aceitação

**AC-PORTAL-011-1 — física ou digital, a critério do condutor**

- **Dado** um condutor com CNH vigente
- **Quando** acessa a CNH digital
- **Então** o PORTAL a oferece com paridade jurídica plena e **sem** sugerir que substitui
  obrigatoriamente a via física ([RN-PORTAL-115]) — a escolha é do condutor

**AC-PORTAL-011-2 — validade é data, não duração**

- **Dado** a exibição da CNH
- **Quando** a validade é mostrada
- **Então** aparece a data final já calculada, nunca "10 anos desde a emissão"

**AC-PORTAL-011-3 — o documento é verificável por terceiro**

- **Dado** a CNH digital exibida
- **Quando** um fiscal a verifica
- **Então** há QR Code ou mecanismo equivalente de validação ([RN-PORTAL-117])

**AC-PORTAL-011-4 — funciona offline**

- **Dado** fiscalização sem conexão
- **Quando** o condutor apresenta a CNH digital
- **Então** ela abre e é verificável sem rede

**AC-PORTAL-011-5 — o que tem valor de documento é declarado como tal**

- **Dado** qualquer peça exibida no PORTAL
- **Quando** é apresentada
- **Então** o sistema distingue documento com valor próprio, cópia informativa e mera consulta
  ([RN-PORTAL-117]) — o cidadão nunca precisa adivinhar o que pode apresentar a terceiros

## Regras aplicáveis

- CTB art.159, I e III (paridade jurídica física/digital, fé pública)
- CTB art.159, §5º (validade somente quando apresentada em original — a versão digital oficial no
  aplicativo é, ela própria, o "original" para os fins do artigo)
