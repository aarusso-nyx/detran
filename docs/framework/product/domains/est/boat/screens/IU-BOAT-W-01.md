---
id: IU-BOAT-W-01
title: Lista de sinistros
status: draft
apps: [boat]
updated: 2026-09-22
---

# Lista de sinistros

Papel: Architect (transcrição).

## Papel

- Architect (transcrição); esta ficha não decide requisitos.

## Fonte, identidade e fronteira

- Fontes fechadas: [IU-BOAT-001], boat-frontends.md §5.
- Identidade: screenId crashes-list, ficha IU-BOAT-W-01, grupo crashes; rota canônica conforme web-matrix.json e IU-TEAT-crashes-list.md.
- Fronteira: transcrição BOAT; sem componente, código, teste ou regra nova.

## Rota, entrada e saída

- Rota: /fiscalizacao/sinistros; entrada e saída conforme o manifesto R-0015.
- Slug/i18n: crash_list; chave boat.screens.crash_list.title.

## Papéis, finalidade e auditoria

- Papéis: OD-R15-002 (papéis não fechados).
- Abertura e ações sensíveis exigem trilha de auditoria; não há elevação implícita.

## Dados e campos

- Lista agregada com os estados `PENDENTE_COMPLEMENTO`, `REGISTRADO` e `INTEGRADO`.
- Vocabulário obrigatório: sinistro, nunca acidente; não inventar campo.

## Ações, comandos e efeitos

- Abrir o detalhe do sinistro selecionado.

- Ações/efeitos: transcrição do contrato; nenhuma chamada direta a SENATRAN.
- Armazenamento e sincronização preservam idempotência, tenant e auditoria.

## Validação e gate

- Gate: JRN-BOAT-004.
- Erros são somente boat.errors.BOAT.* do catálogo; sem regra nova.

## Estados e erros

- Na lista, o estado é apresentado como agregado; JRN-BOAT-004 conduz a W-02.

- Estados, regimes 176/177/178 e gravidade↔vítima são tokens fechados no CTG-0001 e catálogo.
- Estado mobile permanece conforme jornada; offline não bloqueia captura.

## Navegação

- Alvos, ordem e duplicatas: rota de entrada, W-02.
- A ficha não filtra nem reordena a matriz.

## Readiness, offline e ergonomia

- A lista de retaguarda depende da sessão web; não há requisito offline especificado.

- Não bloquear por falta de rede; sincronização recupera a fila conforme as fontes.
- Operação de cena adversa: uma mão, sol/chuva/noite e interrupção; kit sem redefinir regras.

## Acessibilidade e conteúdo fixo

- Título de interface: Lista de sinistros.

- Linguagem simples, foco visível, labels traduzidos por chaves fechadas; nenhum texto fora do catálogo.

## Critérios de transcrição e propostas

- Correspondência exigida: manifesto → ficha → rota → gate → navegação → chaves i18n.
- Fontes reais: [IU-BOAT-001], boat-frontends.md §5.
- Proposta: OD-R15-002 (papéis não fechados), sem decisão; screenId/rota não são proposta.
- Lacunas não resolvidas permanecem como OD-R15 propostas, sem valor inventado.
