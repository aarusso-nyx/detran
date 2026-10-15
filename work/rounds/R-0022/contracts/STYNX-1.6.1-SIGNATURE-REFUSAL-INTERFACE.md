# R-0022 — recusas tipadas da lane S

Architect/F1, 2026-10-13. Complemento técnico de7c9fb449/6ad9ca28/a0fa460b,
sem alterar esses freezes ou S08 de CTG0006. Não cria códigos de produto.

`SignatureTrustRuntime.assertConfigured()` recusa configuração/env/bindings ou
bootstrap unavailable com `ServiceUnavailableException` existente (503). Os
outros métodos primeiro aplicam esse mesmo portão. Sem ele, não passam ao banco,
S3, verificador ou consulta de política. Não expõem token/hash/material sensível.

Passado o portão, Runtime recusa política/tenant/identity/floor inválido, ausente
ou incompatível por `DetranError('RAIT.SIGNATURE_FAILED', {status:502,
messageKey:'rait.errors.signature_failed',
message:'A evidência documental não pôde ser validada.'})`. Store usa a mesma
recusa para address/source/hash/evidence/binding inválido ou ausente e falha de
verificação sem resultado válido. Ausência de aprovação real nunca é aceita.
Erros I/O que atingem essas interfaces são traduzidos para a recusa existente,
sem receipt positivo ou cause/context público contendo segredo, hash ou bytes.

Na adaptação das operações DocumentTrust, conservar as escolhas específicas S08:
signatário/certificado não confiável → `RAIT.SIGNATURE_CERT_MISMATCH` (422);
snapshot de lote divergente → `RAIT.BATCH_SEED_TAMPERED` (422); demais falhas de
confiança → `RAIT.SIGNATURE_FAILED` (502), conforme CTG0006. Store/Runtime não
inventam espécie da operação para substituir essa escolha da adapter.

Sensores independentes verificam classe/código/status/messageKey e ausência de
dados sensíveis; um TypeError, SQL error ou rejection arbitrário não satisfaz a
recusa. Assertions de operação já existentes ficam preservadas. Nenhum DB/SDK
executado por esta decisão de interface; fixtures positivas continuam TEST_ONLY.
