# R-0022 — piso nacional readonly no bootstrap S

Architect/F1, 2026-10-13. Extensão técnica das interfaces7c9fb449 e seams6ad9ca28,
ambos preservados. Expõe dados **já decididos** CTG0006 A.2.2/A.2.4/OD66;
nenhum valor/fonte alternativa/default ou nova decisão Owner. Root implementa após
F3 behavioral RED, sem esperar provider real para plumbing/source tests.

Adicionar à classe abstrata exportada SignatureTrustBootstrapState:
`getApprovedFloor(documentKind:string):Readonly<ApprovedSignatureFloor>|null`.
Accessor síncrono, readonly, sem DB/HTTP/caller callback; não expõe setter.
Snapshot retornado é detached/frozen, inclusive arrays/Date representacional,
não um objeto mutável que o caller possa alterar para a próxima operação.
SignatureTrustRuntime usa esse accessor em resolveProfile/resolveRecordedProfile;
não usa tenant policy como piso nem withSystemContext no request.

ApprovedSignatureFloor tem exatamente estes campos:
`documentKind,minimumSignatureLevel,padesLevel,tsaRequired,requireLta,revocation,
atTime,acceptedPolicies,trustAnchorsPem,sourceRef,approvedBy,approvedAt`.
Tipos: documentKind/sourceRef/approvedBy strings originais não vazias;
minimumSignatureLevel public SignatureLevel; padesLevel consumer PadesLevel;
tsaRequired/requireLta booleans; revocation/atTime enums públicos correspondentes;
acceptedPolicies readonly string[]|null; trustAnchorsPem readonly string[] não vazia;
approvedAt Date válida observada na row. Nenhum boolean accepted ou profile
fabricado. Campo obrigatório NULL/valor inválido ou source/approval ausente não
produz um ApprovedFloor: accessor retorna null e operação recusa como capacidade
indisponível. acceptedPolicies null conserva a semântica decidida de não definir
subset por esse campo, nunca substitui qualifiedPolicies.

Locator único: **inf.signature_policy_floor_ref**, tabela nacional sem tenant_id,
owner-managed/grant app SELECT only, DDL31inf-signature-policy-guards já decidido.
Bootstrap administrativo real READ ONLY seleciona explicitamente:
document_kind,minimum_signature_level,pades_level,tsa_required,require_lta,
revocation,at_time,accepted_policies,trust_anchors_pem,source_ref,approved_by,
approved_at. Apenas rows com source_ref/approved_by/approved_at válidos; PK
document_kind, sem namespace inventado, env profile row, JSON extra ou wildcard
fallback. Missing table/source row mantém unavailable, não cria/semeia valores.
Holder privado publica uma vez após essa leitura owner aprovada, com reason/log
administrativo separado de actor/tenant requests. Nenhuma reconsulta owner por
operação ou mutação de políticas aprovadas pelo request.

Runtime compara todos os campos/ordens/subsets de A.2.4: nível, PAdES igualdade,
TSA/LTA exigidas, revocation e atTime, acceptedPolicies quando definidos e anchors
por SHA256 DER, além de source/approval. Genuine verifier global anchors não
substituem esse floor comparison. Raw source row/provenance permanece retida;
Date retornado é cópia por leitura (Object.freeze(Date) sozinho não impede setTime).
Floor nunca se transforma em SignatureTrustProfile nem resolve tenant/agency.

F3 acrescenta antes de root implementation: missing/NULL/unapproved floor refusals;
mais fraco em cada dimensão; subset/anchor DER distinto; same-DER encoding caso;
floor não usado como perfil; ausência de owner-request query; mutation de returned
snapshot/Date não altera leitura seguinte. Fixtures positivas explicitamente
TEST_ONLY, sem aprovação normativa real. Preservar source10RED e outros drafts;
nenhum SDB lease/provider acceptance decorre deste complemento.
