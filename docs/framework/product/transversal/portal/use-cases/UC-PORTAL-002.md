---
id: UC-PORTAL-002
title: Cidadão interpõe recurso à JARI (2º circuito, 1ª instância recursal)
status: approved
apps: [portal, rait]
sources: [REF-CONTRAN-900, REF-CONTRAN-918, REF-CTB-extracts-raw]
updated: 2026-08-26
---

## Ator e objetivo

Responsável pela infração, notificado da penalidade (NP), recorre à JARI contra a multa aplicada,
buscando o cancelamento da penalidade, com efeito suspensivo automático sobre restrições enquanto o
recurso tramita.

## Pré-condições

- NP visível no PORTAL, com prazo de recurso em aberto (data-limite = data-limite de pagamento —
  [REF-CONTRAN-918] art.12).
- Defesa da autuação (se houve) já julgada e indeferida, ou defesa não apresentada no prazo.

## Fluxo principal

1. Cidadão abre a NP e escolhe "Recorrer".
2. Sistema exibe requerimento pré-preenchido (mesmos campos mínimos do [REF-CONTRAN-900] art.3º),
   já vinculado ao AIT/NP de origem — um recurso por AIT.
3. Cidadão descreve fundamentos do recurso e anexa provas adicionais, se houver; checklist de anexos
   novamente exclui documentos que o próprio órgão já possui ([RN-RAIT-003]).
4. Cidadão assina e protocola eletronicamente.
5. Sistema exibe confirmação com destaque explícito: "Enquanto seu recurso tramita, nenhuma
   restrição de licenciamento ou transferência incide sobre o veículo" ([REF-CONTRAN-918] art.13;
   [REF-CTB-extracts-raw] art.285 _caput_ — efeito suspensivo automático).
6. Caso transiciona no [WF-RAIT-001] para o 2º circuito (`PAUTADO` → `JULGADO_SESSAO`); cidadão é
   direcionado ao acompanhamento ([UC-PORTAL-005]).

## Fluxos alternativos / exceções

- **1a.** Recurso fora do prazo: sistema informa que o recurso intempestivo não tem efeito
  suspensivo e será arquivado ([REF-CTB-extracts-raw] art.285 §§1º,5º) — ainda assim permite o
  protocolo para registro formal, com aviso claro da consequência.
- **1b.** Cidadão já pagou a multa antecipadamente: sistema informa que o pagamento não impede o
  recurso ([REF-CONTRAN-918] art.33) e que, se provido, haverá restituição corrigida
  ([REF-CTB-extracts-raw] art.286 §2º).
- **4a.** Procurador sem habilitação válida: sistema bloqueia o protocolo e orienta a anexar
  instrumento de mandato válido ([REF-CONTRAN-900] art.2º §2º).

## Pós-condições

Caso em tramitação de 1ª instância recursal ([WF-RAIT-001]); efeito suspensivo ativo e visível em
qualquer tela de consulta de multas do PORTAL; cidadão habilitado a desistir ([UC-PORTAL-006]) até
o julgamento.

## Critérios de aceitação

**AC-PORTAL-002-1 — o efeito suspensivo é dito ao cidadão, na hora**

- **Dado** um recurso tempestivo protocolado
- **Quando** a confirmação é exibida
- **Então** o sistema afirma explicitamente que nenhuma restrição de licenciamento ou
  transferência incide enquanto o recurso tramita ([RN-RAIT-108], CONTRAN-918 art.13)

**AC-PORTAL-002-2 — um recurso por AIT**

- **Dado** um AIT que já tem recurso em curso
- **Quando** o cidadão tenta abrir outro
- **Então** o sistema recusa e o direciona ao processo existente ([RN-RAIT-002])

**AC-PORTAL-002-3 — o prazo mostrado é o do cidadão, calculado**

- **Dado** a tela de interposição
- **Quando** o prazo é exibido
- **Então** aparece a **data-limite** já calculada, não "30 dias" em abstrato ([RN-RAIT-005])

**AC-PORTAL-002-4 — recorrer não exige recolher**

- **Dado** um cidadão que quer recorrer sem pagar
- **Quando** inicia o recurso
- **Então** nenhum pagamento é exigido como condição ([RN-PORTAL-127]) — e a tela não sugere que
  seja

## Regras aplicáveis

- [RN-RAIT-001] (admissibilidade)
- [RN-RAIT-002] (um AIT por requerimento)
- [RN-RAIT-003] (vedado exigir documento do próprio órgão)
- [RN-RAIT-005] (contagem de prazos)
