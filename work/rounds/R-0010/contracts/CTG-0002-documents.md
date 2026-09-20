# CTG-0002 — contrato de documentos BOAT

**Papel:** Architect  
**Tarefa:** TASK-0015  
**Estado:** especificação de implementação; C-2-13 permanece aberto

## 1. Escopo e decisão de catálogo

UC-1.251 determina o relatório preliminar de sinistro. Ele não é o BAT oficial:
campos mínimos, conteúdo legal, signatário, nível PAdES, TSA e nível gov.br do BAT permanecem
`source_pending` sob DT-061/OD-B08. Nenhum desses valores pode ser copiado para o relatório
preliminar.

Em 2026-09-19, o Owner decidiu que este relatório preliminar pode satisfazer C-2-13 sem alegar ser
o BAT oficial. Assim, as pendências normativas do BAT não bloqueiam C-2-13; continuam isoladas em
DT-061/OD-B08. Esta decisão não escolhe por si só a política de assinatura nem o conteúdo
informativo do relatório preliminar.

| Item                       | Decisão implementável                                                                                                                                                             |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DocumentKind`             | acrescentar `RELATORIO_PRELIMINAR_SINISTRO` ao fim de `DOCUMENT_KINDS`                                                                                                            |
| domínio do fato e template | `est` / `est.crash_record`                                                                                                                                                        |
| catálogo                   | `inf.normative_document_template` generalizado, `domain_scope='est'`                                                                                                              |
| chave                      | `est.crash.report.preliminary`                                                                                                                                                    |
| versão inicial             | `1.0.0`, revisão técnica inicial do template                                                                                                                                      |
| política                   | linha tenant/agência para `relatorio_preliminar_sinistro`, `pdfaRequired=true`, alvo `PDF/A-2b`                                                                                   |
| dados mínimos comprovados  | identificador do registro, dados factuais já registrados no agregado, versão do template e identidade do órgão resolvida do catálogo; conteúdo legal adicional é `source_pending` |

O dono do fato escreve o template e solicita a fachada; `inf/normative` continua dono do catálogo
generalizado e da política como dado. A extensão exige migração versionada do blueprint/catálogo,
RLS e seed compatível, mas TASK-0015 não altera estes artefatos.

## 2. Sequência, segurança e leitura

1. O comando BOAT usa `DocumentsFacade.render('est.crash.report.preliminary', data)` com tenant do
   `RequestContext`; a fachada resolve template e política ativos no mesmo escopo de tenant/agência.
2. Se a política ainda não tiver signatário, PAdES, TSA e conteúdo legal resolvidos, a emissão falha
   fechada. Não há valor padrão de assinatura.
3. Com política resolvida, `sign(documentId, signer)` aplica a assinatura autorizada e
   `seal(documentId)` só persiste os bytes finais e a evidência de validação conformante.
4. O selo calcula SHA-256 sobre os bytes convertidos e validados, registra `storage_key`,
   `content_hash`, `signature_ref`, política/template usados e resultado veraPDF, e torna o
   registro imutável. Reemissão cria documento novo com `supersedes_document_id`.
5. `GET /v1/est/crash/records/{id}/report` obtém o documento pelo agregado no tenant do contexto;
   RLS impede leitura cruzada. A rota não aceita `tenant_id`, chave de armazenamento, ou identidade
   do autor como entrada do cliente.

## 3. Ponte PDF/A-2b e estado da fonte

`LocalPdfRenderBackend` gera bytes com Chromium. Quando recebe `profile: 'pdf-a'`, ele chama
`PdfAConformanceAdapter.convert(input, request)` e usa o `RenderResult` devolvido. O contrato
disponível do veraPDF é diferente: `VeraPdfDockerValidator.validate(bytes, opts)` apenas valida.

Portanto a montagem deve conter, nesta ordem:

1. renderização real com Chromium;
2. conversor PDF/A-2b real e reproduzível, identificado por fonte e dependência;
3. nova `RenderResult` com bytes convertidos, SHA-256 e número de páginas recomputados e
   `metadata.profile='pdf-a'`;
4. `VeraPdfDockerValidator.validate(convertedBytes, { version: 'A-2', conformance: 'b' })` em
   contêiner com imagem por digest imutável;
5. assinatura e selo somente após `valid=true`.

Não há, nas fontes fornecidas, conversor PDF/A-2b que implemente `convert`, prova de bytes
positivos de produção, ou resolução verificável do digest veraPDF. A ilustração de README não
resolve digest de produção. Estes itens são `source_pending`; enquanto persistirem, C-2-13 fica
aberto e a implementação não emite relatório selado como PDF/A. `createFixturePdfBackend`,
`NoopPdfAValidator`, `StrictPdfAValidator`, marcador `%PDF` e wrapper de repasse são inválidos
como prova.

## 4. Critérios D-13 para Inspector

- **D-13-01:** o teste de contrato exige o décimo terceiro token
  `RELATORIO_PRELIMINAR_SINISTRO`, a chave e a versão especificadas, sem mudar os doze existentes.
- **D-13-02:** template e política são resolvidos por tenant/agência sob RLS; tenant cruzado e
  política/template ausentes falham fechados.
- **D-13-03:** o tier `real` usa `LocalPdfRenderBackend`, conversor PDF/A-2b aprovado e veraPDF
  por digest; bytes positivos retornam `valid=true`, `A-2`/`b`, e o hash selado é o hash dos bytes
  validados.
- **D-13-04:** bytes inválidos, falha do conversor, Docker indisponível, imagem ausente ou
  resultado veraPDF inválido impedem `seal`; não há `skip`, double, marcador textual ou fallback.
- **D-13-05:** e2e prova a rota, política, contexto tenant/RLS e falha fechada com runner
  injetável, sem alegar conformidade nem carregar provedor real.
- **D-13-06:** `sign` só é chamado depois da resolução explícita da política; campos legais ou de
  assinatura `source_pending` impedem emissão.
- **D-13-07:** uma segunda emissão preserva o documento anterior e cria sucessor ligado; tentativa
  de alterar bytes, hash, evidência ou `storage_key` de documento selado falha.

## 5. Fronteira do Engineer e pendências

TASK-0017 monta a fachada e os módulos STYNX uma vez em `backend/app`, atualiza o catálogo e a
lista canônica conforme este contrato e cria o job `boat-pdf-a` na CI. O job provisiona Chromium,
o conversor aprovado e a imagem veraPDF resolvida por digest; também ajusta o timeout do tier
`real` para renderização, conversão e validação. A aplicação BOAT chama somente a fachada.

`source_pending` que impede C-2-13: (a) fonte, dependência e reprodução do conversor PDF/A-2b;
(b) bytes positivos de produção; (c) digest veraPDF com registry, data e método de resolução; e
(d) política de assinatura e conteúdo informativo do relatório preliminar. Os campos mínimos e
demais requisitos do BAT oficial continuam `source_pending` sob DT-061/OD-B08, mas, por decisão
expressa do Owner, não impedem C-2-13 e não podem ser inferidos deste relatório.

As opções e os defaults propostos, ainda sujeitos à decisão do Owner, estão em
`reports/pdfa-signature-options-2026-09-19.md`.
