---
id: IU-RAIT-055
title: Cobrança e dívida ativa — especificação de tela
status: draft
apps: [rait]
sources: [REF-CTB-280-290, REF-CONTRAN-918, REF-LEI-9873-1999]
updated: 2026-09-21
---

Ficha da rota `financeiro/cobranca` (`rait-web-frontend.md` §4).
Fontes: [UC-RAIT-034].

## 1. Identidade

- id `IU-RAIT-055`; `path`: `financeiro/cobranca` (route-manifest.md #59); `screen`: `—`.
- módulo `financeiro`; página `DebtCollectionPage`, componente inteligente `HandoffChecklist` (§5.3).
- nível `L0`; slug i18n `financeiro-cobranca`.

## 2. Acesso

- papel: `rait-finance` (route-manifest.md linha 59).
- guardas: `raitAuthGuard`; `roleGuard(['rait-finance'])`.
- chave de política: `inf:rait-debt:handoff` (comando citado em `JW-10-rh-financeiro.md` #7).

## 3. Entrada

- chega-se pelo redirect de `/financeiro` ou pela navegação.

## 4. Dados

- resolver da rota: "cobrança e dívida ativa — §11 linha 5" (route-manifest.md).
- dependência: `rait-web-frontend.md` §11 linha 5 — mesma do [IU-RAIT-053] — pendente.
- desenho pretendido ([UC-RAIT-034] fluxo 1-4): juros e restrições após `INSTANCIA_ENCERRADA`
  (`PENDENTE_PAGAMENTO`); cobrança administrativa (lembretes, parcelamento por cartão —
  [RN-PORTAL-126]); transferência do crédito à dívida ativa com dossiê fiscal completo, quando
  decorrido o prazo de cobrança administrativa — **prazo fonte pendente**
  ([UC-RAIT-034] fluxo 3, "parâmetro do órgão, fonte pendente").

## 5. Estados

- **indisponível nesta versão** citando §11 linha 5.
- **parâmetro sem fonte**: prazo de cobrança administrativa não configurado — proposto
  **OD-R12-016**: fonte/valor do prazo de cobrança administrativa antes do handoff à dívida ativa.

## 6. Comandos

| Ação (`recurso:ação`) | Papel          | Pré-estado → pós-estado                                               | Comando                          | Confirmação                                                | Erros esperados               |
| --------------------- | -------------- | --------------------------------------------------------------------- | -------------------------------- | ---------------------------------------------------------- | ----------------------------- |
| `rait-debt:handoff`   | `rait-finance` | `INSTANCIA_ENCERRADA`/`PENDENTE_PAGAMENTO` → sub-estado `EM_COBRANCA` | não sourceado em §7 (`JW-10` #7) | "o RAIT deixa de ser dono do caso" ([UC-RAIT-034] fluxo 3) | `RAIT.DEBT_HANDOFF_NOT_FINAL` |

- `endpoint de comando: R-0007 CTG-0004`, **além** da dependência de §11 linha 5.

## 7. Saída

- crédito transferido leva o dossiê fiscal (AIT, NP, decisão, marcos) sem novo pedido à dívida
  ativa ([UC-RAIT-034] AC-RAIT-034-2).
- pagamento durante a cobrança: sub-estado `QUITADA`, restrições liberadas, nada vai à dívida
  ativa ([UC-RAIT-034] 2a).

## 8. Segurança e LGPD

- nenhuma restrição de licenciamento/transferência antes do encerramento ([RN-RAIT-108];
  [UC-RAIT-034] AC-RAIT-034-1).

## 9. Acessibilidade e atalhos

- `HandoffChecklist` navegável por teclado; contraste AA.

## 10. Testes

- AC-RAIT-034-1 — nenhuma restrição antes do encerramento.
- AC-RAIT-034-2 — dossiê acompanha o crédito transferido.
- roteamento: `rait-finance` ativa; demais papéis → `/sem-permissao`.

## Componentes compartilhados

`HandoffChecklist` (§5.3, financeiro); nenhum de §5.2 aplica diretamente.

## Chaves i18n

- `rait.screens.financeiro-cobranca.title` — "Cobrança e dívida ativa"
- `rait.screens.financeiro-cobranca.cmd.handoff` — "Encaminhar à dívida ativa"
