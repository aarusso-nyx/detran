# R-0022 — espécies e binding documental S

Architect/F1, 2026-10-13. Clarificação source-bound de D07-4 e interfaces7c9;
preserva CTG0006/C03/OD69, catálogo/fachada e todos os freezes anteriores.

Validator local de chave do SignedDocumentStore admite tokens exatos de
DOCUMENT_KINDS mais `SESSION_MINUTES` e `BATCH_DISTRIBUTION_MINUTES`, espécies
já aprovadas em CTG0006 UPS-SIG03/§A.3 e tipos DocumentTrust existentes. Não
renomear ATA/ATA_SORTEIO nem acrescentar tokens à fachada DocumentKind/catálogo
para isso. Toda escrita/verificação assinada ainda requer policy/floor/profile
real da espécie; permitir um segmento de chave não declara assinatura exigida
ou aprovação normativa de qualquer espécie. Remaining key syntax D07-4 intacta.

Retirada: candidate lookup pode ler rows por tenant/document/hash/eligible party
e inspecionar seu `document_kind` real. Porém policy aprovada desse kind e row
única não provam que o documento é a espécie do termo de retirada. A operação
exige independent source binding C03 para sua espécie fixa. Não aceitar qualquer
kind da evidence, DECISAO_DEFESA/ATA/minutes ou token inventado como substituto.
Sem fonte C03 estabelecida, readWithdrawalEvidence/adapter recusam S08
RAIT.SIGNATURE_FAILED; physical continua OD69. Implementar lookup/plumbing e
negativos não depende de resolver fonte externa nem autoriza fake success.

F3 conserva negativos existentes e acrescenta antes de implementação pertinente:
Store aceita keys das duas espécies already-approved com real fixture policy;
catálogo/fachada unchanged; arbitrary kind/path injection recusados; evidence
única com policy de espécie alheia não satisfaz withdrawal. Fixture normativa
positiva permanece TEST_ONLY e não estabelece C03 em produção. Nenhum SDK/DB
executado aqui, nenhuma nova decisão Owner solicitada ou presumida.
