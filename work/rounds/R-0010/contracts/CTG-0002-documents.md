# CTG-0002 — contrato de documentos BOAT

**Papel:** Architect  
**Tarefa:** TASK-0015  
**Estado:** política D1 implementada e prova real aprovada; revisão cruzada pendente

## 1. Escopo e decisão de catálogo

UC-1.251 determina o relatório preliminar de sinistro. Ele não é o BAT oficial:
campos mínimos, conteúdo legal, signatário, nível PAdES, TSA e nível gov.br do BAT permanecem
`source_pending` sob DT-061/OD-B08. Nenhum desses valores pode ser copiado para o relatório
preliminar.

Em 2026-09-19, o Owner decidiu que este relatório preliminar pode satisfazer C-2-13 sem alegar ser
o BAT oficial. Assim, as pendências normativas do BAT não bloqueiam C-2-13; continuam isoladas em
DT-061/OD-B08. Esta decisão não escolhe por si só a política de assinatura nem o conteúdo
informativo do relatório preliminar.

Em 2026-09-20, o Owner aprovou o Default D1 completo: versão `1.0.0`, aviso informativo abaixo,
sem PAdES, TSA ou gov.br na política inicial, selo técnico imutável, WeasyPrint 70.0 como backend
real PDF/A-2b e veraPDF como gate obrigatório. A política pode ganhar assinatura em revisão futura
sem alterar a identidade do tipo documental.

| Item                       | Decisão implementável                                                                                                                                                              |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DocumentKind`             | acrescentar `RELATORIO_PRELIMINAR_SINISTRO` ao fim de `DOCUMENT_KINDS`                                                                                                             |
| domínio do fato e template | `est` / `est.crash_record`                                                                                                                                                         |
| catálogo                   | `inf.normative_document_template` generalizado, `domain_scope='est'`                                                                                                               |
| chave                      | `est.crash.report.preliminary`                                                                                                                                                     |
| versão inicial             | `1.0.0`, revisão técnica inicial do template                                                                                                                                       |
| política                   | linha tenant/agência para `relatorio_preliminar_sinistro`: `requiredSigners=[]`, `padesLevel='NONE'`, `tsaRequired=false`, `pdfaRequired=true`, alvo `PDF/A-2b`, `govBrLevel=null` |
| dados mínimos comprovados  | identificador do registro, dados factuais já registrados no agregado, versão do template, identidade do órgão e o aviso aprovado abaixo                                            |

> Relatório preliminar de sinistro. Documento informativo sujeito a complementação e validação.
> Não constitui Boletim de Acidente de Trânsito (BAT) oficial.

O dono do fato escreve o template e solicita a fachada; `inf/normative` continua dono do catálogo
generalizado e da política como dado. A extensão exige migração versionada do blueprint/catálogo,
RLS e seed compatível, mas TASK-0015 não altera estes artefatos.

## 2. Sequência, segurança e leitura

1. O comando BOAT usa `DocumentsFacade.render('est.crash.report.preliminary', data)` com tenant do
   `RequestContext`; a fachada resolve template e política ativos no mesmo escopo de tenant/agência.
2. A política D1 exige `requiredSigners=[]`, `padesLevel='NONE'`, `tsaRequired=false` e
   `govBrLevel=null`; `sign` não é chamado. Qualquer outra combinação exige nova política aprovada.
3. `seal(documentId)` persiste os bytes finais e a evidência de validação conformante. A ausência
   deliberada de assinatura é registrada como `signatureRef=null`, nunca como assinatura sintética.
4. O selo calcula SHA-256 sobre os bytes convertidos e validados, registra `storage_key`,
   `content_hash`, `signature_ref`, política/template usados e resultado veraPDF, e torna o
   registro imutável. Reemissão cria documento novo com `supersedes_document_id`.
5. `GET /v1/est/crash/records/{id}/report` obtém o documento pelo agregado no tenant do contexto;
   RLS impede leitura cruzada. A rota não aceita `tenant_id`, chave de armazenamento, ou identidade
   do autor como entrada do cliente.
6. A permissão funcional `est:crash-record:report` é concedida a `field-agent`,
   `processing-operator` e `traffic-authority`. Ela preserva a regra transversal já vinculante de
   `policy.ts`: `ADMIN`, `GESTOR_DETRAN`, `SUPORTE` e `technical-admin` continuam administradores
   globais. O teste exaustivo nega todos os demais papéis canônicos e cobre tenant divergente.
7. O blueprint `BP-EST-CRASH-001` é a autoridade de
   `est.crash_report_document`. A linha selada registra template e política,
   chave de storage, hash, tamanho, resultado veraPDF integral, conformidade,
   ausência explícita de assinatura e relação de supersessão. Ela nasce já
   selada depois do upload dos bytes validados. O principal da aplicação recebe
   apenas `SELECT` e `INSERT`; `UPDATE` e `DELETE` são revogados pelo passe final
   de privilégios. Bytes usam a coleção `signed-documents` pelo `S3Service` do
   `StynxStorageModule` montado na composition root.

## 3. Ponte PDF/A-2b e estado da fonte

O backend real aprovado é o WeasyPrint 70.0, wheel
`sha256:5043e55e38d2a2af2b2b871e869697b1f65dad5f8b4a3677961d04ceacf9c5fe`, que gera
diretamente PDF/A-2b a partir do HTML controlado. O contrato do veraPDF continua separado:
`VeraPdfDockerValidator.validate(bytes, opts)` apenas valida.

Portanto a montagem deve conter, nesta ordem:

1. renderização/conversão real com WeasyPrint 70.0 e `--pdf-variant pdf/a-2b`;
2. nova `RenderResult` com bytes produzidos, SHA-256 e número de páginas computados e
   `metadata.profile='pdf-a'`;
3. `VeraPdfDockerValidator.validate(convertedBytes, { version: 'A-2', conformance: 'b' })` na
   imagem `verapdf/cli@sha256:20202b4bcc2410a25db1f637c7b461a2e0dda1d97dd8a6df658286b30d56c842`;
4. selo somente após `valid=true`.

Em 2026-09-20 o maestro resolveu o digest no Docker Hub por `docker buildx imagetools inspect` e
`docker pull`, e provou um PDF/A-2b positivo gerado pelo WeasyPrint 70.0: o veraPDF 1.30.1 reportou
144 regras e 1.401 checks aprovados, sem falha. TASK-0016 deve reproduzir a prova no tier `real`;
C-2-13 permanece aberto até o caminho de produção passar. `createFixturePdfBackend`,
`NoopPdfAValidator`, `StrictPdfAValidator` e marcador `%PDF` são inválidos como prova.

## 4. Critérios D-13 para Inspector

- **D-13-01:** o teste de contrato exige o décimo terceiro token
  `RELATORIO_PRELIMINAR_SINISTRO`, a chave e a versão especificadas, sem mudar os doze existentes.
- **D-13-02:** template e política são resolvidos por tenant/agência sob RLS; tenant cruzado e
  política/template ausentes falham fechados.
- **D-13-03:** o tier `real` usa o backend WeasyPrint 70.0 aprovado e veraPDF
  por digest; bytes positivos retornam `valid=true`, `A-2`/`b`, e o hash selado é o hash dos bytes
  validados.
- **D-13-04:** bytes inválidos, falha do conversor, Docker indisponível, imagem ausente ou
  resultado veraPDF inválido impedem `seal`; não há `skip`, double, marcador textual ou fallback.
- **D-13-05:** e2e prova a rota, política, contexto tenant/RLS e falha fechada com runner
  injetável, sem alegar conformidade nem carregar provedor real.
- **D-13-06:** a política D1 não chama `sign`, registra `signatureRef=null` e inclui literalmente o
  aviso aprovado; política divergente falha fechada.
- **D-13-07:** uma segunda emissão preserva o documento anterior e cria sucessor ligado; tentativa
  de alterar bytes, hash, evidência ou `storage_key` de documento selado falha.
- **D-13-08:** reinício da fachada não perde documento selado; metadados vêm de
  `est.crash_report_document`, bytes vêm do storage STYNX e a prova de integração
  confirma RLS forçado e ausência de `UPDATE`/`DELETE` para `role_app_backend`.

## 5. Fronteira do Engineer e pendências

TASK-0017 monta a fachada e os módulos STYNX uma vez em `backend/app`, atualiza o catálogo e a
lista canônica conforme este contrato e cria o job `boat-pdf-a` na CI. O job provisiona
WeasyPrint 70.0 e todas as suas dependências por lock com hashes, além da imagem veraPDF resolvida
por digest; também ajusta o timeout do tier
`real` para renderização, conversão e validação. A aplicação BOAT chama somente a fachada.

As fontes e a política necessárias ao desenvolvimento estão resolvidas. C-2-13 só fecha quando
TASK-0016/0017 reproduzirem o caminho real e seus gates. Os campos mínimos e demais requisitos do
BAT oficial continuam `source_pending` sob DT-061/OD-B08, não impedem C-2-13 e não podem ser
inferidos deste relatório.

As opções e os defaults propostos, ainda sujeitos à decisão do Owner, estão em
`reports/pdfa-signature-options-2026-09-19.md`.
