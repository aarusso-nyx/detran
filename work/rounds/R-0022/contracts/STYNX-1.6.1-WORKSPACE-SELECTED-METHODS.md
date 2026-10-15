# R-0022 — métodos públicos selecionados no realm instalado

Architect/F1, 2026-10-13. Refinamento de8aabcf5a/6ad9ca28/7c9fb449,
com interfaces pisoa0fa460b/recusasf7b40421. Não move esses freezes. Separa
permissão de métodos de admissão dos bytes/loaders e de lease de I/O.
O grafo real pós-pin workspace está em captura: **admissão HELD** até retenção
completa/hash e revisão independente. Grafo npm isolado/prior não substitui o
pnpm realm atual, nem tar27 prova todos os imports de terceiros. Este texto
não executa SDK/DB e não concede SDB lease ou acesso cloud/provider.

## Operações e fases

| Fase                   | Métodos/objetos públicos selecionados                                                                                                                                                         | I/O e prova exigidos                                                                                                                                                                                                                                                                                    |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| G — projeção           | `renderOutboxStorage`, `renderOfflineStorage`, `renderOfflineStorageMigrations` pelos public roots                                                                                            | Binding fixo postgres/role_app_backend/reader null/auth.tenants.id; zero rede/DB. Outputs públicos preservados e confrontados com944f0041; fresh objects não são replay declarativo; upgrade somente bound0009.                                                                                         |
| S — composição         | `StynxSignatureModule.forRoot` uma vez, `createCmsTrustVerifier`, tokens `SignatureService`, `SignatureManifestService`, `SignatureWithdrawalVerifier`; S3Service do StorageModule já montado | Constructores/inert import evaluation permitidos após admissão; nenhum bootstrap de aplicação/worker/listen implícito. Genuine verifier único com holder privado one-shot. Floor owner READ ONLY startup somente sob lease S e source definido, separado de requests.                                   |
| S — crypto unit        | `SignatureService.verify` regulado, `checkReadiness(profile)`, genuine verifier `verifySignedArtifact`/`capabilities(profile)`                                                                | Perfil e mínimo explícitos; Node crypto/X509/WebCrypto admitidos pelo toolchain. Nenhuma verificação sem perfil/sem mínimo para cair no backend. TEST_ONLY artifacts/resolvers/challenges retidos; não provider/floor aprovado.                                                                         |
| S — manifesto/retirada | Public `prepareSession`, `prepareBatch`, `appendVerifiedSigner`, `verifyManifest`, `verifyWithdrawalEvidence`                                                                                 | Bytes reais da fixture/original e binding completo; parcial não vira complete. Fonte/resolver ausente recusa. Digital somente; physical OD69 permanece checkpoint. Public serviço calcula cadeia/JCS; consumidor não copia parser/algoritmo.                                                            |
| S — unit Store/Runtime | Métodos exatos7c9+a0fa por ports TEST_ONLY                                                                                                                                                    | DB/S3 mocks são prova unit de tradução/ordem/recusa, não SQL, AWS ou cryptographic PASS. Não passam proof caller para produção.                                                                                                                                                                         |
| S — S3 público         | Constructor, `bucket`, `presignUpload`, `presignDownloadForTenant`, `headObject`, `onApplicationShutdown`                                                                                     | Lista selecionada, não autorização de rede. Unidade usa ports TEST_ONLY; chamada genuína de presign pode resolver credenciais e headObject faz client.send. Live exige endpoint local realmente capturado/lease futura e credenciais TEST_ONLY explícitas; sem ambient AWS profile/metadata/production. |

Sem chamar `createMockSignatureBackend`, backend GovBr sandbox, provider `/mock`,
consumerOwnedVerifier ou sign/provider HTTP desconhecido. Definições exportadas
dessas classes podem ser avaliadas no barrel admitido; isso não autoriza método.
Nenhum segundo StorageModule.forRoot. Não executar DocumentsService delete/soft/
hard/restore, S3 delete/lifecycle/ObjectLock ou compensação destrutiva após erro SQL.

CMS genuíno usa callbacks opcionais explícitos fetchTsa/fetchOcsp/fetchCrl;
não autoriza busca AIA/OCSP/CRL arbitrária na internet. Unit fixtures retornam
bytes retidos via callbacks TEST_ONLY sem rede; challenge precisa artifact
completo, nunca boolean de readiness. Mínimo QUALIFIED/LTA sem fonte aprovada
não ganha qualifiesCertificate/default archive anchors para passar teste.

## Admissão do realm e separação de rede

Fechar o grafo de seis seeds públicos workspace signature/storage/outbox/offline/
data/core, seus package contexts reais, links internos, arquivos/tar SRI e edges
estáticos/dinâmicos/optional antes de avaliar o SDK. Nest/pg/crypto/S3 alcançados
devem ser os da resolução real; nenhum fallback active↔prior ou deep import SDK.
Cada missing/dynamic/native site recebe disposição hash-bound ao caller real.
Export desconhecido/edge novo não é aceito por recomputar um manifesto.

Loader fixa Node24.20.0 e ambiente sem NODE_OPTIONS/NODE_PATH/preload/
NODE_PG_FORCE_NATIVE; before-eval file/context hashes, resolução fechada e
escape irreversível preservados. Tratamento de format undefined é somente o
predicado já independente52, não allowlist genérica unknown/null. AWS CRT,
pg-native/redis optional native ou dynamic package discovery não são chamados
por conveniência. O grafo novo decidirá cada site real; esta nota não inventa
uma lista de misses reutilizando outro runtime.

G/crypto-unit têm rede negada. Harness prior separado permite apenas PostgreSQL
127.0.0.1:65461/subjects de4e225 sob lease. S live exige normal full schema
owned subject e lease própria; auth-minimal refs não bastam. Nenhum processo
unit pode herdar a conexão da lease de outro agente. S3 local tem fase separada,
endpoint/porta/cliente/credenciais concretos revisados antes da chamada genuína.
Provider real e produção permanecem externos, sem bloquear fonte/unit/DI que
recusa corretamente quando ausentes.

## Próximo fechamento

Root retém o atual grafo+metadata/SRI/loaders; Architect/F3 conferem source e
disposição por site e registram hashes reais. Só então chamadas selecionadas da
fase correspondente podem executar sob seus gates RED/lease já definidos. Linux
Node proofa7064fa5 é control-plane; execução SDK/sensores Linux/CI continua
separada e não é inferida de hash igual dos três embedded loaders.
