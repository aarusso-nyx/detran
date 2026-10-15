# R-0022 — reserva original no handoff de destino

Architect/F1, 2026-10-13. Extensão aditiva de095bd61d/69845f26, preservados.
Campo já público CTG9SyncBatchItemInput.reservationId participa da seleção native;
handoff não pode descartá-lo e depois declarar ambiguidades equivalentes.
Nenhum API futuro/valor normativo/decisão Owner novo, nenhum SDK/SQL por F1.

SyncEntityApplierItem acrescenta `reservationId?:string`, original opcional
fornecido ao public CTG9 item, somente no trusted storageMode stynx-ctg9.
StynxOfflineItemApplier copia detached esse campo quando realmente presente,
sem gerar/inferir UUID, usar receipt key ou preencher default/null. É fato de
seleção, não snapshot de reserva confiável vindo do body. Scope/claim nativos
e a leitura autoritativa posterior continuam obrigatórios.

SqlStynxAitNumberingRulePort acrescenta apenas predicado fixo de identidade à
SELECT atual na mesma trx: quando fornecido, r.id deve ser a reservationId
original (comparação UUID PostgreSQL), além de tenant/device/org/entity/number/
shift/estado/claimed consumption. Original lexical permanece no handoff; o row
UUID vem SQL. Sem campo, cobertura única obrigatória continua. Resultado alheio,
ambíguo ou diferente recusa código atual FOREIGN_SHIFT, sem escolher primeira
linha. Native guard que já recusa seleção mantém tradução própria inalterada.
Não chamar outra tx, criar lock, escrever consumo ou duplicar escolha/claim SDK.

F3 antes da edição F2 nos mesmos core/ports paths: campo original present/absent
preservado; explícito ID desambigua duas coberturas na query/mapeamento e confere
row selecionada; ID diferente/foreignscope recusa; ausência continua ambiguidade
recusada; nenhum generatedID/key substitution ou SQL-write. Unit mocked rows
não são native overlap proof. Live future AIT integration deve produzir seleção
via public native ports e real received trx antes de declarar esse caso parity.
Assertions e source candidatos anteriores ficam retidos; nenhuma ativação de
produto ou receipt histórico decorre desta extensão.
