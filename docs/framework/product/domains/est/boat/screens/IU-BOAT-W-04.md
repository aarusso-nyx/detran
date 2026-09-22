---
id: IU-BOAT-W-04
title: Cascata de validação e integração RENAEST
status: draft
apps: [boat]
updated: 2026-09-22
---

# Cascata de validação e integração RENAEST

Papel: Architect (transcrição).

## Papel

- Architect (transcrição); esta ficha não decide requisitos.

## Fonte, identidade e fronteira

- Fontes fechadas: [IU-BOAT-001], boat-frontends.md §5, boat-route-contract.md §§1,3.
- Identidade: screenId renaest-integration, ficha IU-BOAT-W-04, grupo crashes.
- Dados de vítima somente após perfil, finalidade (purpose) e auditoria; esta ficha não concede acesso.
- Fronteira: transcrição BOAT; sem componente, código, teste ou regra nova.

## Rota, entrada e saída

- Rota: /fiscalizacao/sinistros/:id/renaest; entrada e saída conforme o manifesto R-0015.
- Slug/i18n: crash_renaest; chave boat.screens.crash_renaest.title.

## Papéis, finalidade e auditoria

- Papéis: field-supervisor, traffic-authority (close); purpose se abrir vítima.
- Abertura e ações sensíveis exigem trilha de auditoria; não há elevação implícita.

## Dados e campos

- Cascata de validação municipal, estadual e nacional; situação nacional do registro.
- Vocabulário obrigatório: sinistro, nunca acidente; não inventar campo.

## Ações, comandos e efeitos

- Fechar e transmitir; complementar ou corrigir enquanto o registro nacional não estiver terminal.

- Ações/efeitos: transcrição do contrato; nenhuma chamada direta a SENATRAN.
- Armazenamento e sincronização preservam idempotência, tenant e auditoria.

## Validação e gate

- Gate: WF-BOAT-003; terminal sem correção.
- Erros são somente boat.errors.BOAT.* do catálogo; sem regra nova.

## Estados e erros

- Estados nacionais terminais não têm caminho de correção.

- Estados, regimes 176/177/178 e gravidade↔vítima são tokens fechados no CTG-0001 e catálogo.
- Estado mobile permanece conforme jornada; offline não bloqueia captura.

## Navegação

- Alvos, ordem e duplicatas: W-02, W-03, outbox RENAEST.
- A ficha não filtra nem reordena a matriz.

## Readiness, offline e ergonomia

- A especificação descreve integração pela retaguarda e outbox RENAEST; não fixa operação offline.

- Não bloquear por falta de rede; sincronização recupera a fila conforme as fontes.
- Operação de cena adversa: uma mão, sol/chuva/noite e interrupção; kit sem redefinir regras.

## Acessibilidade e conteúdo fixo

- Texto fixo: registro nacional definitivo, sem correção; explicar o estado terminal.

- Linguagem simples, foco visível, labels traduzidos por chaves fechadas; nenhum texto fora do catálogo.
- Texto fixo: registro nacional definitivo, sem correção; estado terminal não ganha correção.

## Critérios de transcrição e propostas

- Correspondência exigida: manifesto → ficha → rota → gate → navegação → chaves i18n.
- Fontes reais: [IU-BOAT-001], boat-frontends.md §5, boat-route-contract.md §§1,3.
- Lacunas não resolvidas permanecem como OD-R15 propostas, sem valor inventado.
