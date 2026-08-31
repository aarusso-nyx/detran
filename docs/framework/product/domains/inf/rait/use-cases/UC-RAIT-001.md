---
id: UC-RAIT-001
title: Secretaria protocola e valida intake multi-canal
status: approved
apps: [rait, portal]
sources: [REF-CONTRAN-900, REF-DETRANAM-SERVICOS, REF-DETRANAM-PORTARIA-5046]
updated: 2026-08-26
---

## Ator e objetivo

Secretaria/recepção (ou o próprio requerente, no canal digital) registra um pleito (defesa
prévia, recurso JARI ou recurso CETRAN) recebido por qualquer canal — balcão, postal, PORTAL,
Protocolo Virtual do Estado — como um caso RAIT com conteúdo mínimo válido, pronto para
triagem de admissibilidade.

## Pré-condições

- Existe um AIT/NA/NP referenciado pelo pleito.
- Canal de entrada está disponível (balcão, postal, digital).

## Fluxo principal

1. Requerente apresenta o pleito referenciando exatamente um AIT ([RN-RAIT-002]).
2. Secretaria (ou o formulário do PORTAL, no canal digital) confere conteúdo mínimo: órgão;
   identificação completa do requerente; placa + nº do AIT; exposição de fatos/fundamentos;
   data; assinatura ([RN-RAIT-002], CONTRAN-900 art.3º).
3. Se o pleito veio em papel/balcão, secretaria digitaliza o dossiê — a obrigação de
   digitalizar é do órgão, não do cidadão (modelo CETRAN-SP, [REF-CETRAN-PROCESSO-INTERNO]).
4. Sistema registra data/hora de protocolo (data da postagem ECT conta, se via postal —
   CONTRAN-900 art.6º) e classifica `instancia` (`defesa_previa`\|`jari`\|`cetran`) e
   `circuito` (1º\|2º) conforme o tipo de pleito e o AIT/decisão referenciados.
5. Se houver representação por procurador, secretaria confere firma reconhecida por
   autenticidade (aceita no próprio balcão do DETRAN-AM — Portaria 5046/2018 art.2º §2º; não
   exige cartório).
6. Caso entra em `PROTOCOLADO` ([WF-RAIT-001]) e segue automaticamente para
   `TRIAGEM_ADMISSIBILIDADE` ([UC-RAIT-002]).

## Fluxos alternativos / exceções

- **2a.** Conteúdo mínimo ausente em canal não-digital (balcão/postal): sistema não recusa
  tacitamente — abre pendência de complementação, sem consumir o prazo de tempestividade do
  requerente (a validação estrutural do PORTAL já bloqueia isso preventivamente no canal
  digital — [RN-RAIT-002]).
- **1a.** Requerente tenta protocolar um único requerimento cobrindo mais de um AIT: sistema
  rejeita e orienta abertura de um caso por AIT ([RN-RAIT-002] § único).
- **5a.** Procuração de fora do estado com firma reconhecida por autenticidade em cartório de
  outra UF: é aceita sem endosso em cartório do AM ([RN-RAIT-121],
  [REF-DETRANAM-PORTARIA-5046] art. 2º, § 2º); eventual dúvida concreta de autenticidade abre
  diligência motivada, não uma exigência cartorial padronizada.

## Pós-condições

Caso RAIT criado, em `PROTOCOLADO`, com `instancia`/`circuito` classificados, dossiê digital
completo, aguardando triagem.

## Critérios de aceitação

**AC-RAIT-001-1 — um AIT por requerimento**

- **Dado** um requerente que referencia dois ou mais AIT em um único pleito
- **Quando** o protocolo é submetido, em qualquer canal
- **Então** o sistema recusa o registro e orienta a abertura de um caso por AIT ([RN-RAIT-002] § único), sem criar caso algum

**AC-RAIT-001-2 — conteúdo mínimo bloqueia no canal digital, abre pendência no físico**

- **Dado** um pleito sem um dos itens de conteúdo mínimo (órgão; identificação do requerente; placa + nº do AIT; fatos/fundamentos; data; assinatura — [RN-RAIT-002])
- **Quando** a entrada é pelo PORTAL
- **Então** a submissão é bloqueada na validação estrutural, antes de gerar protocolo
- **E quando** a entrada é balcão ou postal
- **Então** o caso é criado em `PROTOCOLADO` com pendência de complementação registrada, **sem** consumir o prazo de tempestividade do requerente

**AC-RAIT-001-3 — a data de protocolo do canal postal é a da postagem**

- **Dado** um pleito recebido por via postal com comprovante de postagem ECT em D e chegada ao órgão em D+7
- **Quando** o caso é registrado
- **Então** `data_protocolo = D` (CONTRAN-900 art.6º), e é D que alimenta o cálculo de tempestividade de [UC-RAIT-002]

**AC-RAIT-001-4 — classificação automática de instância e circuito**

- **Dado** um pleito que referencia uma decisão de JARI já comunicada
- **Quando** o caso é registrado
- **Então** o sistema classifica `instancia=cetran`, `circuito=2º` e vincula `caso_origem_id` ao caso JARI, sem depender de escolha manual do atendente

**AC-RAIT-001-5 — digitalização é dever do órgão**

- **Dado** um pleito entregue em papel no balcão
- **Quando** a secretaria conclui o protocolo
- **Então** o caso resultante tem dossiê estruturado equivalente ao de um caso nativo digital — um PDF anexado, sem os campos estruturados extraídos, não satisfaz a pós-condição

**AC-RAIT-001-6 — procuração com firma reconhecida por autenticidade basta**

- **Dado** um procurador que apresenta procuração particular com firma reconhecida por autenticidade
- **Quando** a secretaria confere a representação
- **Então** a representação é aceita no próprio balcão do DETRAN-AM ([RN-RAIT-121], Portaria 5046/2018 art.2º §2º) e o sistema **não** exige endosso cartorial

## Regras aplicáveis

- [RN-RAIT-002] (conteúdo mínimo, um AIT por requerimento)
- [RN-RAIT-003] (vedado exigir documento emitido pelo próprio órgão)
- [RN-RAIT-005] (contagem de prazos — tempestividade calculada na triagem, não aqui)
