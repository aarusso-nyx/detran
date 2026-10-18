# R-0022 — interfaces consumidoras S para RED independente

Architect/F1, 2026-10-13. Convenções técnicas da lane S ativa, complementam6ad9ca28
sem mover esse freeze. Não alteram DocumentTrustVerifier/ClinicalArtifactRequest
ou fornecem valores externos. Root implementa após pertinente RED de Inspector.
Todos types mencionados abaixo são imports públicos signature/storage/data/core
ou tipos consumidores definidos neste documento; nenhum private SDK import.

## Exportações/DI

app/detran-signature.ts exporta `DetranSignatureModule` (@Global/@Module), importado
como classe em AppModule; nenhum segundo forRoot wrapper público necessário.
Provider de lifecycle `DetranSignatureBootstrap` lê piso administrativo READ ONLY
uma vez e configura o holder privado antes das operações. Não precisa ser token
usado por domínios. StynxSignatureModule.forRoot ocorre uma vez; public classes
SignatureService/ManifestService/WithdrawalVerifier são os próprios tokens.
Shared documents/index.ts exporta aditivamente SignatureTrustRuntime,
SignatureTrustBootstrapState, SignedDocumentStore e tipos consumidores abaixo.
SignatureTrustBootstrapState é classe abstrata readonly, não verifier/backend:
`isAvailable():boolean`, `resolveSignerCertificate(tenantId,signerId):Promise<string>`,
`resolvePartyCertificate(tenantId,partyId):Promise<string>`. Não expõe setter,
anchors/challenge body ou boolean de aprovação aceito via request.
App fornece implementação privada real do holder por esse class token; estado
ausente ou fonte identity indisponível é fail-closed. Test double é TEST_ONLY.

## SignatureTrustRuntime

Constructor `(database:Database,requestContext:RequestContext,
bootstrap?:SignatureTrustBootstrapState)`, terceiro @Optional/@Inject(classe),
sem dependência Store. Métodos públicos exatos:

- `assertConfigured():void`: portão env/config e bootstrap availability; não
  declara observação positiva de capacidades/trust por si só.
- `resolveProfile(input:SignatureProfileInput):Promise<ResolvedSignatureProfile>`.
- `resolveRecordedProfile(input:RecordedSignatureProfileInput):Promise<ResolvedSignatureProfile>`.
- `resolveSignerCertificate(tenantId:string,signerId:string):Promise<string>`.
- `resolvePartyCertificate(tenantId:string,partyId:string):Promise<string>`.

SignatureProfileInput exatamente `{tenantId,trafficAgencyId,documentKind,at}`,
trafficAgencyId string|null, at Date válida do servidor, demais strings originais.
RecordedSignatureProfileInput exatamente `{tenantId,policyId,documentKind,at}`,
policyId UUID real da evidence e at instante gravado da assinatura. Saída exatamente
`{policyId,profile}` com profile público SignatureTrustProfile. Campos query/
herança/floor/namespace/env/missing source são6ad9/CTG, não reespecificados aqui.
Tenant input confere RequestContext atual; nunca entra withSystemContext nesse
runtime por request. Cert resolvers devolvem64hex fingerprint confiável da pessoa
esperada, não fingerprint da evidence que se pretende verificar. Ausência recusa.
Sem fonte externa não se inventa cadastro; unit positive usa holder TEST_ONLY real
fixture explicitamente identificado. Erros são S08/config existentes, não códigos
novos de produto ou parse de mensagem SDK.

## SignedDocumentStore

Constructor `(database:Database,requestContext:RequestContext,s3:S3Service,
signatures:SignatureService,manifests:SignatureManifestService,
withdrawals:SignatureWithdrawalVerifier,runtime:SignatureTrustRuntime)`.
Métodos abaixo são a única interface pública consumidor; helpers I/O privados.

`readEvidence(input:SignatureEvidenceAddress):Promise<StoredSignatureEvidence>`.
Address exatamente `{tenantId,evidenceId,documentId,documentKind,signerId}`;
evidenceId UUID, demais strings originais e tenant/context obrigatório. Saída
StoredSignatureEvidence é objeto fechado com:
`id,tenantId,documentId,documentKind,signerId,policyId,trustProfileRevision,
originalObjectId,signedObjectId,originalDocument,signedDocument,cmsSignature,
certificate,originalDocumentSha256,signedDocumentSha256,cmsSha256,
signerCertificateSha256,recorded`.
Três bytes são Uint8Array; certificate é public SignatureCertificateRef construído
da fonte PEM real, IDs/hex das colunas; recorded exatamente
`{achievedLevel,padesProfile,revocationSource,signedAt,tsaAt,
certificateValidatedAt,verificationRef}` (public enums e Date válidas, source SQL).
Não reconstruir chainSha256/trustProof ausentes na tabela como se fossem observados;
novo trustProof vem da verificação pública dos bytes. Read valida address/row/S3
hash/tenant bindings, não concede cryptographic valid por SELECT bem-sucedido.

`writeVerifiedEvidence(input:SignatureEvidenceWrite):Promise<WrittenSignatureEvidence>`.
Input exatamente `{tenantId,trafficAgencyId,documentId,documentKind,signerId,
originalDocument,signedDocument,cmsSignature,certificate}`. Tipos acima, agency
string|null. Caller não passa profile/proof/actor/time/SQL/object key. Store resolve
profile real e identity esperada, chama public SignatureService.verify com mínimo/
perfil e verifica proof antes de upload/INSERT. Saída exatamente
`{evidenceId,originalObjectId,signedObjectId,policyId,trustProof}`, todos IDs reais e
trustProof público observado. Não usar essa saída para alegar atomicidade S3/SQL.

`readManifest(input:SignatureManifestAddress):Promise<StoredSignatureManifest>`.
Address é união fechada:
`{kind:'session-minutes',tenantId,sessionId,minutesId,snapshotHash}` ou
`{kind:'batch-minutes',tenantId,batchId,snapshotHash}`.
Saída exatamente `{id,manifest,sourceDocument,snapshot,preparedAt}`: manifest
public SignatureManifest, dois Uint8Array, preparedAt Date da original count0.
Seleção/bindings de6ad9; raw incomplete manifesto não vira valid por read.

`prepareSessionManifest(input:ManifestPreparation & {sessionId:string,
minutesId:string,idempotencyKey:string|null}):Promise<StoredSignatureManifest>` e
`prepareBatchManifest(input:ManifestPreparation & {batchId:string,
idempotencyKey:string|null}):Promise<StoredSignatureManifest>`.
São writer seams internos tipados para **bytes realmente disponíveis**; não
ampliam portas HTTP nem resolvem C02/PDF source ausente. Chamam public prepare,
validam bindings e persistem row0 sem alegar signed/completed verification.

`appendManifestSigner(input:{tenantId:string,manifestId:string,
evidenceId:string}):Promise<StoredSignatureManifest>`: lê original/snapshot/evidence,
perfil gravado/identidade confiável, chama public appendVerifiedSigner, insere
novo signer_count row, nunca UPDATE. Não aceita manifest/proof JSON de caller.
`verifyManifest(input:SignatureManifestAddress):ReturnType<SignatureManifestService['verifyManifest']>`:
carrega signers por evidence IDs e chama public verifyManifest. Adaptação S08 fica
na DocumentTrustHttpAdapter; erro não é convertido em valid.

Public verifyManifest1.6.1 exige todos required signers, portanto partial é
incompleto, não automaticamente adulterado. Se read/append precisa provar prefix
parcial, reconstruir somente por public prepare+append de artifacts originais e
comparar resultado; nenhuma cópia de JCS/hash/chain local, nenhum falso complete.

`readWithdrawalEvidence(input:{tenantId:string,documentId:string,
contentHash:string,eligiblePartyIds:readonly string[]}):Promise<StoredSignatureEvidence>`:
exatamente uma row de espécie/policy elegível, UUID/document/hash/party bindings
reais. Zero/multiple ou espécie sem política recusa. A adapter fornece caseId
do input original ao public withdrawal verifier, digital_verified somente; não
inferir caseId a partir de documento sem source. Physical continua OD69.

## Sensores e alcance

F3 pode agora acrescentar behavioral unit vectors nos três novos spec paths6ad9,
com as interfaces acima, antes de root F2 source. Positive mocks de DB/S3 são ports
unit TEST_ONLY, não prova de crypto/realprovider/realDB. Casos M06P crypto usam
genuine public verifier e artifacts sintéticos identificados. Source10RED já
retido não é substituído; novos RED formam checkpoint próprio. Live RLS/storage/
DDL exige nova lease e normal owned storage; nunca piggyback em referência minimal.

Module/factory/Runtime/Store methods não acrescentam endpoints nem fonte normativa.
checkCapabilities noarg structural/config failure e per-call checkReadiness/profile
continuam separados; profile-free positive não é inventado por esse interface.
8aab/6cda/6ad9 ficam byte-identical; nenhuma SQL/test implementation é feita por F1.
