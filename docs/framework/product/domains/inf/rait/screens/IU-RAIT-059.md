---
id: IU-RAIT-059
title: Fila de retenção e anonimização — especificação de tela
status: draft
apps: [rait]
sources: [REF-CONTRAN-900, REF-CONTRAN-931, REF-LEI-13709-2018]
updated: 2026-09-21
---

Ficha da rota `arquivo/retencao` (`rait-web-frontend.md` §4).
Fontes: [UC-RAIT-024], [JRN-RAIT-003].

## 1. Identidade

- id `IU-RAIT-059`; `path`: `arquivo/retencao` (route-manifest.md #64); `screen`: `—`.
- módulo `arquivo`; página `RetentionQueuePage` (§5.3).
- nível `L2`; slug i18n `arquivo-retencao`.

## 2. Acesso

- papel: `rait-secretary` (route-manifest.md linha 64).
- guardas: `raitAuthGuard`; `roleGuard(['rait-secretary'])`.

## 3. Entrada

- chega-se pela navegação do módulo `arquivo`.

## 4. Dados

- resolver: "fila de retenção e anonimização" (route-manifest.md).
- leitura via `ArchiveFacade`: casos que se aproximam do prazo de retenção — proposta de 5 anos
  após o encerramento ([RN-RAIT-136]; piso de 5 anos para dados de notificação eletrônica, 931
  art. 12); parâmetro **vigente** por decisão do Owner (OD-018, `open-decisions-rait.md` §A/§E;
  steering item 54/H.45: "5 anos vigente").

## 5. Estados

- **carregando / vazio / erro recuperável / sem permissão**: padrão.
- **retenção prorrogada**: processo com cobrança em curso ou ação judicial mantém retenção
  enquanto durar a exigibilidade, com registro ([UC-RAIT-024] 4a).

## 6. Comandos

O job de retenção/anonimização roda automaticamente ao fim do prazo
([UC-RAIT-024] AC-RAIT-024-2) — não é um comando disparado por esta tela. A tela lista a fila e o
histórico; uma eventual ação manual de "prorrogar retenção com registro" para casos com cobrança
ou ação judicial em curso não tem nome de comando/endpoint sourceado — proposto **OD-R12-017**:
nomear o comando de prorrogação manual de retenção, se existir.

## 7. Saída

- ao fim do prazo, o caso é anonimizado mantendo a camada estatística; o evento fica na trilha
  ([UC-RAIT-024] AC-RAIT-024-2).

## 8. Segurança e LGPD

- anonimização preserva camada estatística, remove dado pessoal identificável
  ([RN-RAIT-136]; [RN-RAIT-137]).
- tentativa de anonimizar antes do prazo → `RAIT.RETENTION_NOT_DUE` (422).

## 9. Acessibilidade e atalhos

- lista navegável por teclado; contraste AA.

## 10. Testes

- AC-RAIT-024-2 — retenção é política, não decisão caso a caso; job de anonimização registra
  evento na trilha.
- roteamento: `rait-secretary` ativa; demais papéis → `/sem-permissao`.

## Componentes compartilhados

Nenhum de §5.2 aplica diretamente nesta rodada.

## Chaves i18n

- `rait.screens.arquivo-retencao.title` — "Fila de retenção e anonimização"
- `rait.screens.arquivo-retencao.empty` — "Nenhum caso próximo do prazo de retenção"
