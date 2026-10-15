# R-0022 — UUID real da fonte do manifesto

Architect/F1, 2026-10-13. Complemento aditivo da interface7c9fb449, preservada.
Fecha a projeção C3 sem alterar public SignatureManifest ou inventar identidade.

StoredSignatureManifest passa a ter exatamente
`{id,sourceObjectId,manifest,sourceDocument,snapshot,preparedAt}`.
Novo campo readonly `sourceObjectId:string` é UUID real de
storage.signature_manifest.source_object_id. Read valida FK/address/tenant/hash
da storage.objects correspondente antes de devolver. Prepare devolve o ID real
obtido/reutilizado pelo writer; append preserva a fonte original count0.
Nenhum UUID é gerado apenas para preencher a projeção e nenhuma igualdade com
manifest.documentId é presumida. Este último continua o public document binding.

Na projeção C3 de get*MinutesManifest, documentId usa sourceObjectId real, conforme
contrato consumidor; kind/aggregate/manifestHash/source bytes continuam ligados
ao documento público original. Não substituir manifest.documentId internamente
nem reconstruir sourceObjectId do nome de arquivo/hash. Source row ausente ou
binding incompatível recusa S08, não devolve objeto parcialmente validado.

F3 antes da mudança pertinente: public document binding diferente do source UUID
deve preservar ambos e projetar C3 do UUID real; fonte de outro tenant, UUID/hash
divergente e source count0 alterado recusam. Preserve7c9/76RED e novos checkpoints.
Nenhum SDK/SQL por F1, nenhuma mudança de facade/type público ou decisão Owner.
