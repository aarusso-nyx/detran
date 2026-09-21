---
id: IU-RAIT-053
title: Arrecadação por fase — especificação de tela
status: draft
apps: [rait]
sources: [REF-CONTRAN-918, REF-CONTRAN-931, REF-CTB-280-290]
updated: 2026-09-21
---

Ficha da rota `financeiro/arrecadacao` (`rait-web-frontend.md` §4).
Fontes: [UC-RAIT-032].

## 1. Identidade

- id `IU-RAIT-053`; `path`: `financeiro/arrecadacao` (route-manifest.md #57); `screen`: `—`.
- módulo `financeiro`; página `CollectionDocsPage`, componente inteligente `ChargeTierCard` (§5.3).
- nível `L0`; slug i18n `financeiro-arrecadacao`.

## 2. Acesso

- papel: `rait-finance` (route-manifest.md linha 57).
- guardas: `raitAuthGuard`; `roleGuard(['rait-finance'])`.
- chave de política: `inf:rait-collection:issue` (comando citado em
  `JW-10-rh-financeiro.md` #4).

## 3. Entrada

- chega-se pelo redirect de `/financeiro` (route-manifest.md §B) ou pela navegação.

## 4. Dados

- resolver da rota: "documentos por fase — §11 linha 5 (módulo financeiro pendente)"
  (route-manifest.md).
- dependência: `rait-web-frontend.md` §11 linha 5 — "Agregado da infração ([WF-INF-003]) e módulo
  financeiro (arrecadação, restituição, cobrança)" — módulo FE `financeiro`/`caso` — situação
  **pendente** (ADR-0014).
- desenho pretendido ([UC-RAIT-032] fluxo 1-4): documento com 80% até a data-limite única, 60%
  com reconhecimento nas condições do art. 284 §1º, valor original + juros após o encerramento da
  instância ([RN-RAIT-127], [RN-RAIT-128]).

## 5. Estados

- **indisponível nesta versão** citando §11 linha 5.
- **elegibilidade bloqueada**: emissão do documento de 60% para órgão não aderente ao SNE é
  caminho **não construído** ([UC-RAIT-032] 2a; `DT-012`; OD-003, `open-decisions-rait.md` §A —
  "desconto de 40% fora do SNE desligado", steering item 53/H.53).

## 6. Comandos

| Ação (`recurso:ação`)   | Papel          | Pré-estado → pós-estado                                                     | Comando                          | Confirmação                                                                   | Erros esperados                                                      |
| ----------------------- | -------------- | --------------------------------------------------------------------------- | -------------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `rait-collection:issue` | `rait-finance` | `NOTIFICADO_PENALIDADE`/`INSTANCIA_ENCERRADA` → documento emitido/reemitido | não sourceado em §7 (`JW-10` #4) | "uma só data-limite de vencimento e de recurso" ([UC-RAIT-032] AC-RAIT-032-1) | `RAIT.COLLECTION_PHASE_INVALID`, `RAIT.COLLECTION_DISCOUNT_SNE_ONLY` |

- `endpoint de comando: R-0007 CTG-0004`, **além** da dependência de §11 linha 5.
- juros só incidem após o encerramento da instância, nunca enquanto o recurso tempestivo pende
  ([UC-RAIT-032] AC-RAIT-032-2); truncamento sem arredondamento, duas casas decimais
  ([UC-RAIT-032] AC-RAIT-032-3; [RN-RAIT-128]).

## 7. Saída

- documento atualizado disponível no Portal e no SNE após o encerramento da instância
  ([UC-RAIT-032] fluxo 4).

## 8. Segurança e LGPD

- nenhum dado de terceiro nesta tela; valores e faixas do sujeito passivo do caso.

## 9. Acessibilidade e atalhos

- `ChargeTierCard` com valores e prazos por texto explícito; contraste AA.

## 10. Testes

- AC-RAIT-032-1 — uma só data-limite.
- AC-RAIT-032-2 — juros só após o encerramento.
- AC-RAIT-032-3 — truncamento sem arredondamento.
- roteamento: `rait-finance` ativa; demais papéis → `/sem-permissao`.

## Componentes compartilhados

`DeadlineChip` (§5.2); `ChargeTierCard` (§5.3, financeiro).

## Chaves i18n

- `rait.screens.financeiro-arrecadacao.title` — "Arrecadação por fase"
- `rait.screens.financeiro-arrecadacao.cmd.issue` — "Emitir documento"
