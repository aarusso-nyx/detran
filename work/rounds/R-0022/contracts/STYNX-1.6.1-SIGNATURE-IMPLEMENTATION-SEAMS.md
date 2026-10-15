# R-0022 — seams concretos de assinatura publicada1.6.1

Architect/F1, 2026-10-13. Refinamento da lane S ativa8aabcf5a, sem mover esse
freeze/6cda durante probe. Root é writer S; Inspector RED antes da implementação.
Herda CTG0006 Adenda C/OD06,07,08,13,40,64–69; não cria valores normativos ou
decisão Owner. Leitura de tar publicado somente; nenhum SDK/test/DB executado aqui.

Fonte: package-admission/extracted/stynx-nyx-signature-1.6.1/package/dist/signature/src.
Bytes lidos: types.d.ts887602e6fc2e6f293f8a1c84ddab909d3670cf487bb7338c2f74242a9fe85a57;
signature.module.js85dad62ef321718d2dbac996ed684dd284fb7f847ac53d1853cb468dc829bb42;
signature.service.jsa7f963c2c4c70834bd3f7819dfde9f84caf29e765edd53695c318b13fbc43bed;
cms-trust-verifier.jsbb46507a1762d7bce4a2953b931319cae49ac7e33b8d4dce8a3f7c970dec5495.
Demais declarations/JS pertencem à retention27 já verificada; imports de produção
somente public @stynx-nyx/signature/storage, nunca paths dist/private ou pkijs/ASN.

## 1. Composição e backend documental

| Public seam                  | Forma real e uso consumidor                                                                                                                                                                                                            |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| StynxSignatureModule.forRoot | options opcionais; exporta classe SignatureService e tokens options/backend/provider. Uma ocorrência em app/detran-signature.ts, importada por app.module.                                                                             |
| SignatureService             | constructor(backend?,{verifier?,trustVerifier?,consumerOwnedVerifier?,trustProfiles?}); o módulo cria a instância. Não construir outra em shared/domínios.                                                                             |
| createCmsTrustVerifier       | options exige trustAnchorsPem; opcionais tsaTrustAnchorsPem,archiveTsaTrustAnchorsPem,acceptedPolicies,qualifiedPolicies,now,fetchTsa/fetchOcsp/fetchCrl,qualifiesCertificate,readinessChallenge. Só a factory genuína montada no app. |
| SignatureManifestService     | constructor({trustVerifier,resolveSignerCertificate?}); resolver(tenantId,signerId) retorna fingerprint string da identidade confiável esperada.                                                                                       |
| SignatureWithdrawalVerifier  | constructor({trustVerifier,resolvePartyCertificate?}); sem attestor/consumerOwnedVerifier na produção. Resolver(tenantId,partyId) retorna fingerprint confiável esperada.                                                              |

OD66: anchors/bootstrap challenge vêm do piso nacional aprovado. Piso vazio não
recebe valores de fixture em produção. `createCmsTrustVerifier({trustAnchorsPem:[]})`
é constructible pelo source real; capabilities/verify falham fechados. Isso permite
DI local completo sem âncora inventada. Usar a genuine branded instância, não wrapper
que se declare verifier equivalente. Nenhum consumerOwnedVerifier ou mock backend.

Adenda A.5 continua sem module trustProfile/trustProfiles globais: política real
por chamada, não set fictício para passar bootstrap. Source1.6.1 prova que
`SignatureService.verify` **com minimumSignatureLevel+trustProfile** chama CMS
verifier diretamente e não backend. Sem minimumSignatureLevel cai no backend;
por isso todos os verifies documentais assinados devem fornecer ambos. Module
default cria provider/backend internos, mas a aplicação não configura/chama seu
protocolo /mock como caminho documental ou fallback. Não substituir verify por
HTTP receipt antigo para obter resultado positivo.

DocumentTrustHttpAdapter constructor opcional por classe/token público de
SignatureService, SignatureManifestService, SignatureWithdrawalVerifier e
SignedDocumentStore; tokens consumidores adicionais só classes exportadas pelo
global module. No-arg construction continua compilando e rejeitando operações
que carecem de bindings. RAIT handwritten constructors mudam só nos sites Adenda C.
Single physical signature/storage package resolution entre app/shared é gate DI.

Seam consumidor concreto para RED: constructor de DocumentTrustHttpAdapter tem
cinco argumentos opcionais, nessa ordem: SignatureService, SignatureManifestService,
SignatureWithdrawalVerifier, SignedDocumentStore, SignatureTrustRuntime. Todos
@Optional/@Inject(classe), sem strings e sem obrigar antigos new().
SignatureTrustRuntime depende apenas Database/RequestContext e configuração
bootstrap privada; não depende do Store, evitando ciclo. Resolvers de certificado
dos serviços públicos chamam esse Runtime; source confiável ausente recusa, não
usa como cadastro a própria entrada de evidence. Store pode depender dos três
serviços públicos/Runtime/S3/Database/RequestContext, sem resolver inverso para Store.

Factory síncrona forRoot não tem forRootAsync publicado. Receita permitida para
OD66: holder privado do módulo cria **uma** genuine factory/verifier com options
anchors inicialmente vazias; imports forRoot recebe essa mesma instância, e
Manifest/Withdrawal também. Bootstrap injetado lê approved floor em owner READ ONLY
administrativo e publica uma vez a configuração real nesse holder antes de aceitar
operações; opções da factory são capturadas por referência pelo source público.
Nenhum reload/caller setter/array vindo do body ou mock é exposto. Leitura/floor
ausente mantém estado unavailable e operações recusam, sem crash silenciosamente
convertido em disponibilidade. Não usar processo local para preencher floor.
Registrar bootstrap SQL/session/user separado do request path. Public
StynxStorageModule.forRoot1.6.1 é global:true e exporta S3Service; o módulo signature
deve resolver o S3 já montado, sem segundo forRoot ou cópia de cliente AWS.
Bootstrap/DI DB só executa após lease específica; source/unit RED independe dela.

## 2. Perfil/query e readiness sem defaults

signature-trust-runtime.ts lê config DETRAN_DOCUMENT_TRUST_{URL,HEALTH_URL,TOKEN}
por chamada como portão existente; HTTPS não-local antes de I/O. Valores não
endereçam mais verificação documental; não logar token/hash/erro criptográfico.

Colunas reais de inf.signature_policy a selecionar explicitamente:
id,tenant_id,traffic_agency_id,document_kind,status,revision,valid_from,valid_to,
minimum_signature_level,pades_level,tsa_required,require_lta,revocation,at_time,
accepted_policies,trust_anchors_pem,source_ref,approved_by,approved_at.
Não selecionar colunas inexistentes trust_profile_id/environment/qualified_policies.
Query sob Database request/app tx + RLS: tenant do RequestContext, espécie da
operação, active+approved_at, valid_from<=at e valid_to null/at<valid_to, revisão
maior órgão→estado. Agency desconhecida com candidata de órgão recusa. Não usar
piso como perfil. Reverificação usa exact signature_policy_id imutável da evidência,
não política atual mais recente. Missing/null/NONE/semfloor aprovado recusa S08.

Mapeamento literal de Adenda A.2.4: id=row.id,revision=String(row.revision),
environment local/test→test e staging-like/production→production;
requiredPadesProfile=row.pades_level (somente PAdES-B-LT no enum DETRAN),
minimumSignatureLevel,requireTsa,requireLta,revocation,atTime,trustAnchorsPem e
acceptedPolicies das colunas decididas. Piso compara toda ordem/subset definida
no contrato, inclusive SHA256 DER das âncoras; nenhuma ordem nova. Public CMS
intersection é por PEM string literal: diferença de encoding PEM não deve ser
tratada como prova de trust. Retain raw fonte e, se normalizar representação,
usar somente Node X509/DER→PEM padrão consistentemente nos dois lados, conferindo
mesmo DER digest; nunca reimplementar cadeia/certificado/OCSP/CRL.

qualifiedPolicies é novo campo público opcional e **não** é sinônimo de
acceptedPolicies/minimumSignatureLevel. Sem fonte aprovada, não preenchê-lo,
não inventar qualifiesCertificate=true nem adicionar coluna normativa por conveniência.
ReadinessChallenge de produção deve devolver artifact verdadeiro do perfil
pedido (tenant/original/signed/CMS/cert/profile), não booleans ou certificado puro.
LTA exige archiveTsaTrustAnchorsPem explícita e archive proof real; sem fallback
de signer/TSA anchors. Dados reais continuam externos, sintéticos são TEST_ONLY.

Limitação precisa C.4: capabilities(profile) exige profile; não há overload sem
argumento. `DocumentTrustHttpAdapter.checkCapabilities()` preserva portão e
bindings fail-closed; não chama capabilities(undefined), cria perfil probe nem
usa floor como perfil. Em cada operação, resolver perfil real e chamar
SignatureService.checkReadiness(profile) antes da verificação. Positive profile-free
trust-capability observation de M06P2 não é provada só pela presença de DI/brand;
registrar esse gap de especificação separadamente, sem mudar assertion para PASS.
Unconfigured/missing source negatives e DI/store/query/per-call readiness podem
ser concluídos agora. Não registrar documentary health indicator novo por isso.

## 3. Bytes, writer e projeções das portas

VerifyRequest exato: tenantId do contexto, document original Uint8Array,
documentSha256 SHA256 dos bytes PDF, signedDocument, cmsSignature, certificate
{subject,issuer,serialNumber,pem}, minimumSignatureLevel e trustProfile.
Signed bytes/CMS separados vêm de storage/provider source, nunca extrair CMS por
parser PDF local. Resultado exige status valid/trustProof, IDs/revision/hashes/
signer/time/profile/revocation coerentes. Date zero/invalid, trustProof ausente ou
embedded/none em vez de ocsp/crl recusam. Fingerprint esperado de signer/party
precisa source confiável independente; não usar o próprio certificado de entrada
como cadastro independente. Fixtures owner podem declarar esse vínculo TEST_ONLY.

SignedDocumentStore usa S3Service existente do módulo montado, não DocumentsService.
Public S3 presignUpload({key,contentType,checksumSha256})→PUT/url/headers;
upload pelo processo; headObject e presignDownloadForTenant({key,tenantId}) para
leitura, hash dos bytes conferido contra storage.objects.checksum_sha256.
Collection signed-documents continua application/pdf/confidential/50MiB;
CMS/certificate em colunas de evidence, não novos MIME objects. No delete/
deleteAllVersions/softRemove/restore/hardRemove/ObjectLock.

Writer verifica antes de upload, depois INSERT app-role em storage.objects e
signature_evidence/manifest conforme DDL06. Tenant/created_by do contexto; actor
não vem body. Upload e SQL COMMIT não são atomic distribuídos: SQL failure não
apaga objeto por compensação; retain orphan/quarantine diagnostic e não devolver
receipt/manifest bem-sucedido. Não alegar rollback S3 por rollback Postgres.

Queries por referência usam tenant+UUID evidence.id, document_id/kind/signer_id,
original_object_id/signed_object_id, CMS bytes/hash, signer_certificate_pem/hash,
signature_policy_id/revision, achieved_level/pades_profile/revocation_source,
signed_at/tsa_at/certificate_validated_at/verification_ref. Foreign tenant,
hash/source mismatch ou ausência → S08 sem resultado positivo. `storage.objects`
deve estar FORCE RLS antes do uso; app só SELECT/INSERT nas novas tabelas,
immutable guards reais e repeat final revokes conforme CTG. Floor não recebe seed.

ManifestPreparation exige document/snapshot Uint8Array+SHA, tenant/aggregate/
document/kind, requiredSignerIds,preparedAt real. prepareSession adiciona
sessionId/minutesId; prepareBatch batchId. appendVerifiedSigner recebe signed PDF,
CMS/cert/profile e bindings original/snapshot; verifyManifest valid|tampered|
untrusted|unavailable. Persistir novo row por signer_count; não UPDATE manifesto.
get retorna maior signer_count, preparedAt da row count0, native manifestVersion1
traduzida somente na porta para session-minutes-v1/draw-v1. JCS/hashes/chain vêm
exclusivamente do public SignatureManifestService, não canonical local.

Withdrawal digital exige original document/contentHash, eligiblePartyIds,
evidenceBytes/evidenceRef, signerPartyId, signedDocument/CMS/cert/profile e
trusted resolver. Exatamente uma evidence row compatível, mais de uma/zero→S08;
physical_verified continua checkpoint OD69. verifiedAt público Date vira ISO.
prepare* cuja snapshot existe só numa transação do chamador ainda não confirmada
não ganha uma query fake que o enxergue: C02/source PDF pendente permanece
fail-closed até canal decidido/implementável, conforme Adenda C. Reuse/get/verify
e writer structure independentes continuam concluíveis com fixtures owner.

## 4. Clínico/provider e sensores concretos

HttpSignatureProviderClient(options) tem baseUrl,pathPrefix,headers,timeoutMs,
retryPolicy,telemetry,fetch. Default pathPrefix=/mock; não usar default como
produção. Public wire de signPades usa /tsa/sign, validateCertificate
/tsa/ocsp/validate, verifyPades /pades/verify; não supor que provider real desconhecido
implementa isso. ProviderBackedSignatureBackend(provider,{verificationPolicy,crlUrl,now})
é público, mas não resolve rendering/storage/certificate provenance do clínico.
Clinical SignatureRequest exige actor/tenant, original PDF/hash,tsa.endpoint,
cert,credential opcional. JSON contentSha256 não é PDF documentSha256.
Sem real protocol/sample/approved profile, preservar clinical HTTP/LTA checkpoint
Adenda A.3 e portas existentes; published LTA types sozinhos não são acceptance.
Não montar mock produção nem aumentar PadesLevel enum por esses types.

F3 pode author/rodar RED/positives não dependentes em paths adicionais da lane S:
backend/app/src/detran-signature.spec.ts;
shared/src/documents/signature-trust-runtime.spec.ts e signed-document-store.spec.ts
(shared = backend/domains/shared);
backend/app/tests/integration/r22-stynx-161-signature-storage.integration.spec.ts;
backend/app/tests/e2e/r22-stynx-161-signature-di.e2e.spec.ts.
Reusar existing C06/M06P2–P5/C06A e existing synthetic fixtures. Só fixture setup
antigo pode mudar conforme autorização CTG, nunca assertions retiradas por Engineer.

Sensores: actual local AppModule DI com dependencies opcionais/unconfigured
fail-closed; single module/class-token identity; HTTPS/config por chamada e secrets;
real query columns/RLS A/B/floor/herança/imutabilidade; policy revision reverification;
zero uploads/INSERT antes de verified valid; upload/SQL failure sem receipt positivo;
manifest tamper/binding/required signer/order/recovery; withdrawal digital mismatch/
foreigntenant/physical refusal; trustProof/time/level/hash negatives. Synthetic
real CMS/certificate chain provas são TEST_ONLY, não provider/approved values.
Actual DB lane espera lease depois do probe; source/unit RED pode avançar agora.

Root pode implementar DI/store/runtime/query paths já ativos após pertinente RED.
Este note não autoriza mudar ClinicalArtifactRequest/FAÇADE PadesLevel ou preencher
floor/anchors/challenge. Falhas dependentes desses inputs ficam explicitamente
blocked; nenhuma delas impede terminar a implementação que não os exige.
