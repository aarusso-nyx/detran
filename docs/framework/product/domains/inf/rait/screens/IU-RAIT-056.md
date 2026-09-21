---
id: IU-RAIT-056
title: Conciliação de pagamentos — especificação de tela
status: draft
apps: [rait]
sources: [REF-CTB-280-290, REF-CONTRAN-918]
updated: 2026-09-21
---

Ficha da rota `financeiro/conciliacao` (`rait-web-frontend.md` §4).
Fontes: [UC-RAIT-035].

## 1. Identidade

- id `IU-RAIT-056`; `path`: `financeiro/conciliacao` (route-manifest.md #60); `screen`: `—`.
- módulo `financeiro`; página `ReconciliationPage` (§5.3).
- nível `L0`; slug i18n `financeiro-conciliacao`.

## 2. Acesso

- papel: `rait-finance` (route-manifest.md linha 60).
- guardas: `raitAuthGuard`; `roleGuard(['rait-finance'])`.
- chave de política: `inf:rait-payment:reconcile` (comando citado em `JW-10-rh-financeiro.md` #5).

## 3. Entrada

- chega-se pelo redirect de `/financeiro` ou pela navegação.

## 4. Dados

- resolver da rota: "retornos bancários — §11 linha 5" (route-manifest.md).
- dependência: `rait-web-frontend.md` §11 linha 5 — mesma do [IU-RAIT-053] — pendente.
- desenho pretendido ([UC-RAIT-035] fluxo 1-4): retorno bancário casado com documento (nosso
  número, valor, data); infração recebe `pago=true` e a faixa paga; pagamento com reconhecimento
  encerra a instância ([RN-RAIT-119]).

## 5. Estados

- **indisponível nesta versão** citando §11 linha 5.
- **pendência financeira**: pagamento a menor/maior ou em duplicidade gera pendência ou
  restituição do excedente ([UC-RAIT-035] 1a-1b → [UC-RAIT-033]).

## 6. Comandos

| Ação (`recurso:ação`)    | Papel          | Pré-estado → pós-estado                                                                  | Comando                          | Confirmação                                                   | Erros esperados          |
| ------------------------ | -------------- | ---------------------------------------------------------------------------------------- | -------------------------------- | ------------------------------------------------------------- | ------------------------ |
| `rait-payment:reconcile` | `rait-finance` | retorno bancário não casado → `PAGAMENTO_CONFIRMADO` (não encerra, salvo reconhecimento) | não sourceado em §7 (`JW-10` #5) | "pagar não renuncia ao recurso" ([UC-RAIT-035] AC-RAIT-035-1) | `RAIT.PAYMENT_UNMATCHED` |

- `endpoint de comando: R-0007 CTG-0004`, **além** da dependência de §11 linha 5.

## 7. Saída

- casos casados atualizam o processo sem encerrá-lo (salvo reconhecimento válido); pendências de
  conciliação (`RAIT.PAYMENT_UNMATCHED`) ficam listadas ([UC-RAIT-035] AC-RAIT-035-3).

## 8. Segurança e LGPD

- nenhum dado bancário de terceiro exposto além do necessário à conciliação.

## 9. Acessibilidade e atalhos

- tabela de conciliação navegável por teclado; contraste AA.

## 10. Testes

- AC-RAIT-035-1 — pagar não renuncia (recurso segue aceito).
- AC-RAIT-035-2 — reconhecimento válido encerra a instância.
- AC-RAIT-035-3 — conciliação rastreável (documento, valor, data, faixa).
- roteamento: `rait-finance` ativa; demais papéis → `/sem-permissao`.

## Componentes compartilhados

Nenhum de §5.2 aplica diretamente nesta rodada.

## Chaves i18n

- `rait.screens.financeiro-conciliacao.title` — "Conciliação de pagamentos"
- `rait.screens.financeiro-conciliacao.cmd.reconcile` — "Conciliar retorno bancário"
