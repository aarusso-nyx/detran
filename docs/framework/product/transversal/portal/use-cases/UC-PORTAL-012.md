---
id: UC-PORTAL-012
title: Proprietário consulta e emite o CRLV-e do veículo
status: reviewed
apps: [portal]
sources: [REF-CONTRAN-809-2020]
updated: 2026-08-26
---

## Ator e objetivo

Proprietário do veículo consulta a situação de débitos e emite o Certificado de Registro e
Licenciamento de Veículo em meio digital (CRLV-e), documento suficiente para os fins do CTB art.133
e que dispensa a via impressa (Res. CONTRAN 809/2020 arts.2º, 6º).

## Pré-condições

- Proprietário identificado, nível simples para consulta ([WF-PORTAL-002]).
- Veículo vinculado ao CPF/CNPJ do proprietário (consulta RENAVAM).

## Fluxo principal

1. Proprietário acessa "Meu veículo" e seleciona "CRLV-e".
2. Sistema exibe, de forma explícita e ANTES de qualquer tentativa de emissão, o estado de
   quitação: tributos, encargos, multas de trânsito e ambientais vinculados ao veículo, e o Seguro
   DPVAT (Res. 809/2020 art.4º) — tratado como **estado do processo**, não como erro genérico se
   houver pendência ([REF-LEI-14129-2021] handoff UX já registrado no dossiê).
3. Se tudo quitado e sem restrição administrativa/judicial: sistema emite o CRLV-e digital,
   validável por QR Code (art.7º), disponível para exibição em app oficial ou impressão em papel A4
   comum (art.6º §1º), embora a via impressa não seja obrigatória (art.6º §2º).
4. Se houver pendência: tela mostra exatamente o que falta pagar, com atalho direto para o módulo
   de pagamento ([UC-PORTAL-015]) — nunca apenas "CRLV-e indisponível".

## Fluxos alternativos / exceções

- **2a.** Restrição administrativa ou judicial sobre o veículo (Res. 809/2020 art.4º §ú): emissão
  bloqueada mesmo com débitos quitados; sistema explica que a restrição não é financeira e orienta
  o canal correto (não é resolvível dentro do PORTAL).
- **3a.** Pagamento realizado dentro do próprio fluxo (via [UC-PORTAL-015]): sistema reconsulta a
  quitação automaticamente e libera a emissão na mesma sessão, sem exigir que o proprietário volte à
  tela de consulta manualmente.

## Pós-condições

CRLV-e emitido e disponível para download/exibição; nenhuma alteração no registro RENAVAM além do
efeito colateral já produzido pela própria quitação (que é responsabilidade do módulo de pagamento,
não deste UC).

## Critérios de aceitação

**AC-PORTAL-012-1 — o estado de quitação aparece antes da tentativa**

- **Dado** um veículo com pendências
- **Quando** o proprietário acessa o CRLV-e
- **Então** vê exatamente o que falta, com atalho para o pagamento — nunca "CRLV-e indisponível"
  como erro genérico ([RN-PORTAL-116])

**AC-PORTAL-012-2 — multa sob recurso com efeito suspensivo não é débito exigível**

- **Dado** uma multa cuja exigibilidade está suspensa por recurso tempestivo
- **Quando** a quitação é avaliada para emitir o CRLV-e
- **Então** ela **não** bloqueia a emissão ([RN-PORTAL-116], [RN-RAIT-108]) — tratá-la como débito
  transforma o CRLV-e em coação indireta ao pagamento e esvazia o efeito suspensivo (DT-027)

**AC-PORTAL-012-3 — a via impressa nunca é exigida**

- **Dado** o CRLV-e emitido
- **Quando** é usado
- **Então** vale digitalmente; a impressão em A4 comum é opção do proprietário, não requisito
  (Res. 809/2020 art.6º §§1º-2º)

**AC-PORTAL-012-4 — o documento é validável por QR Code**

- **Dado** o CRLV-e
- **Quando** verificado em fiscalização
- **Então** o QR Code o valida (art.7º) ([RN-PORTAL-117])

## Regras aplicáveis

- Res. CONTRAN 809/2020 art.4º (pré-condição de quitação)
- Res. CONTRAN 809/2020 art.6º, §§1º-2º (suficiência e dispensa de via impressa)
- Res. CONTRAN 809/2020 art.7º (validação por QR Code)
