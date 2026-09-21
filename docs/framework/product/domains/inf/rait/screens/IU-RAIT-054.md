---
id: IU-RAIT-054
title: Ordens de restituição — especificação de tela
status: draft
apps: [rait]
sources: [REF-CTB-280-290, REF-CONTRAN-918]
updated: 2026-09-21
---

Ficha da rota `financeiro/restituicoes` (`rait-web-frontend.md` §4).
Fontes: [UC-RAIT-033].

## 1. Identidade

- id `IU-RAIT-054`; `path`: `financeiro/restituicoes` (route-manifest.md #58); `screen`: `—`.
- módulo `financeiro`; página `RefundsPage`, componente inteligente `RefundOrderForm` (§5.3).
- nível `L0`; slug i18n `financeiro-restituicoes`.

## 2. Acesso

- papel: `rait-finance` (route-manifest.md linha 58).
- guardas: `raitAuthGuard`; `roleGuard(['rait-finance'])`.
- chave de política: `inf:rait-refund:order` (comando citado em `JW-10-rh-financeiro.md` #6).

## 3. Entrada

- chega-se pelo redirect de `/financeiro` ou pela navegação; também alcançável a partir do
  encerramento com `RESTITUICAO_DEVIDA` ([UC-RAIT-023] fluxo 3 → [UC-RAIT-033]).

## 4. Dados

- resolver da rota: "ordens de restituição — §11 linha 5" (route-manifest.md).
- dependência: `rait-web-frontend.md` §11 linha 5 — mesma do [IU-RAIT-053] — pendente.
- desenho pretendido ([UC-RAIT-033] fluxo 1-4): evento `RESTITUICAO_DEVIDA` publica valor pago,
  data e faixa; atualização pelo índice IPCA-E (`DT-013`; **OD-015** resolvida,
  `open-decisions-rait.md` §A) do pagamento até a data da ordem; dados bancários do titular.

## 5. Estados

- **indisponível nesta versão** citando §11 linha 5.
- **dados bancários ausentes**: ordem fica pendente com alerta, notificação ao titular pelo canal
  de ciência; a obrigação não expira pelo silêncio ([UC-RAIT-033] 3a).

## 6. Comandos

| Ação (`recurso:ação`) | Papel          | Pré-estado → pós-estado                                         | Comando                          | Confirmação                                                                                              | Erros esperados                                                                     |
| --------------------- | -------------- | --------------------------------------------------------------- | -------------------------------- | -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `rait-refund:order`   | `rait-finance` | infração com `RESTITUICAO_DEVIDA` → ordem emitida (ou pendente) | não sourceado em §7 (`JW-10` #6) | "a restituição não depende de pedido; a ordem já existe no ato da decisão" ([UC-RAIT-033] AC-RAIT-033-1) | `RAIT.REFUND_NOT_DUE`, `RAIT.REFUND_BANK_DATA_MISSING`, `RAIT.REFUND_INDEX_PENDING` |

- `endpoint de comando: R-0007 CTG-0004`, **além** da dependência de §11 linha 5.

## 7. Saída

- restituição paga: evento registrado no caso; Portal exibe "restituído"
  ([UC-RAIT-033] fluxo 4).

## 8. Segurança e LGPD

- dados bancários do titular tratados como dado pessoal próprio, nunca em log/URL.

## 9. Acessibilidade e atalhos

- `RefundOrderForm` navegável por teclado; contraste AA.

## 10. Testes

- AC-RAIT-033-1 — restituição não depende de pedido do cidadão.
- AC-RAIT-033-2 — índice, período e valor atualizado visíveis ao cidadão.
- roteamento: `rait-finance` ativa; demais papéis → `/sem-permissao`.

## Componentes compartilhados

`RefundOrderForm` (§5.3, financeiro); nenhum de §5.2 aplica diretamente.

## Chaves i18n

- `rait.screens.financeiro-restituicoes.title` — "Ordens de restituição"
- `rait.screens.financeiro-restituicoes.cmd.order` — "Emitir ordem de restituição"
