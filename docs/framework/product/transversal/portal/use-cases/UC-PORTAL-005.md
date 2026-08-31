---
id: UC-PORTAL-005
title: Cidadão acompanha o andamento de um processo em curso
status: approved
apps: [portal, rait]
sources: [REF-CONTRAN-900, REF-CONTRAN-918, REF-BENCH-ESTADOS]
updated: 2026-08-26
---

## Ator e objetivo

Cidadão com defesa ou recurso em tramitação quer saber, a qualquer momento, em que fase está o
processo, o que (se algo) depende dele, e quando esperar uma decisão.

## Pré-condições

- Ao menos um requerimento protocolado (defesa, recurso à JARI, ou recurso ao CETRAN — [UC-PORTAL-
  001]/[002]/[003]).

## Fluxo principal

1. Cidadão acessa "Meus processos" no PORTAL.
2. Sistema lista cada processo com status em linguagem cidadã (mapa de estados — ver ux-notes do
   PORTAL) e uma linha do tempo simplificada (protocolado → em análise → decidido).
3. Cidadão abre um processo específico e vê: data de protocolo, fase atual, documentos enviados,
   e — quando aplicável — de quem é a próxima ação (dele ou do órgão).
4. Se houver diligência aberta, sistema destaca o prazo próprio para resposta, distinto do prazo
   geral de julgamento do órgão.
5. Cidadão pode baixar/consultar qualquer documento já enviado ou recebido no processo a qualquer
   momento (paridade com o modelo de completude MG — [REF-BENCH-ESTADOS]).

## Fluxos alternativos / exceções

- **2a.** Múltiplos processos simultâneos (ex.: frota): lista é filtrável/ordenável por urgência de
  prazo, não só por data de protocolo.
- **3a.** Processo sem nenhuma movimentação recente: sistema não deixa o status "parado" sem
  explicação — mostra explicitamente a última ação e, quando disponível, a expectativa de prazo.
- **4a.** Diligência com prazo vencido sem resposta do cidadão: sistema informa que o processo será
  julgado no estado em que se encontra ([RN-RAIT-004]), sem suspender a possibilidade de acompanhar.

## Pós-condições

Cidadão informado do estado real do processo sem necessidade de contato humano; histórico completo
disponível para consulta a qualquer momento, mesmo após o encerramento do processo.

## Critérios de aceitação

**AC-PORTAL-005-1 — vista do próprio processo é direito, disponível sempre**

- **Dado** qualquer processo do cidadão
- **Quando** ele o abre
- **Então** vê a tramitação, os documentos enviados e os recebidos, e pode baixá-los a qualquer
  momento ([RN-PORTAL-112]) — sem pedido formal, sem prazo de espera

**AC-PORTAL-005-2 — de quem é a próxima ação fica explícito**

- **Dado** um processo em curso
- **Quando** é exibido
- **Então** diz se a bola está com o cidadão ou com o órgão — a distinção "prazo seu × prazo do
  órgão" é a espinha dorsal da tela

**AC-PORTAL-005-3 — o estado é traduzido, nunca o nome interno**

- **Dado** um caso em `TRIAGEM_ADMISSIBILIDADE` no [WF-RAIT-001]
- **Quando** o cidadão o vê
- **Então** lê linguagem cidadã — o vocabulário interno do RAIT nunca vaza para o PORTAL

**AC-PORTAL-005-4 — diligência aberta tem prazo próprio destacado**

- **Dado** uma diligência pendente
- **Quando** o processo é aberto
- **Então** o prazo da diligência aparece destacado e separado do prazo geral do órgão
  ([RN-RAIT-004])

**AC-PORTAL-005-5 — o serviço é gratuito e o protocolo é sempre emitido**

- **Dado** qualquer solicitação
- **Quando** é registrada
- **Então** há protocolo e não há cobrança pelo ato de peticionar ([RN-PORTAL-111])

## Regras aplicáveis

- [RN-RAIT-004] (diligência com prazo; julgamento no estado se não atendida)
- [RN-RAIT-005] (contagem de prazos)
