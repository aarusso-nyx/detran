# Inventário da prévia — Portal web (R-0033 TASK-0009)

Papel: Inspector. Fontes: `frontend-preview-mode.md` §10, `portal-frontends.md` §4/§6,
`app.route-manifest.ts` e `src/testing/http-fixtures*.ts`. Uma linha por entrada real do manifesto.
O manifesto não tem `kind`: aqui todas as 38 entradas são `page` (incluindo auxiliares sem T-nn).

## 1. Fontes e limites

O único cliente de dados é `PortalClient`; os adapters são do Engineer. Fixtures são transcrições
literais dos exports canônicos de `http-fixtures.ts`, `http-fixtures-reads.ts` e
`http-fixtures-pair3.ts` em JSON de produção; produção nunca importa `src/testing`.
Ids abaixo são desses exports, sem novo tenant/persona. Relógio `FIXED_CLOCK_ISO`.
Persona segue `SESSION_FACADE_PRESETS`: anonimo, simples, avancada, qualificada. É nível de
assinatura, nunca concessão inventada de papel RAIT. Padrão de revisão: avancada; elevação: simples.

## 2. Estados e comandos

`loaded`, `empty`, `loading`, `error`, `forbidden` são os cinco cenários. `empty` esvazia listas,
nunca fabrica inexistência da entidade. Leituras de controle `me/services/entitledResource` preservam
as decisões de guarda em todos os cenários; somente leituras de apresentação mudam.
Portal não tem `ReadStatus=forbidden`: 403 passa pelo ErrorBoundary e banner existente.
T-27 tem contexto sem leitura de página: os cinco seletores preservam a explicação; o botão real
prova a elevação indisponível. Nenhuma elevação ou protocolo fictício é produzido.

Delegações defesa/jari/cetran/indicação/pagamento continuam `PORTAL.SERVICE_UNAVAILABLE` 422,
`delegacao_indisponivel_r0007`, com aviso separado “não funcional na prévia”. Demais comandos e
downloads também rejeitam, registram PreviewActionLog e anunciam em role=status; não reproduzem
fixtures de sucesso. Uma ausência normativa fica `source_pending` visível, nunca dado calculado.

## 3. Rotas × fixture × estado

| #   | Rota                                            | kind | Módulo       | serviceKey         | Clientes lidos / fixture                                                                                          | URL concreta de prévia                                                                                         | Estados                                  |
| --- | ----------------------------------------------- | ---- | ------------ | ------------------ | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| 1   | `/`                                             | page | core         | —                  | PortalClient: ME_RESPONSE_FIXTURE; catálogo PORTAL_SERVICE_CATALOG_FIXTURE; brand source_pending                  | `/?pv_papel=avancada&pv_estado=loaded`                                                                         | loaded; empty; loading; error; forbidden |
| 2   | `/carta-servicos`                               | page | catalogo     | —                  | PortalClient: PORTAL_SERVICE_CATALOG_FIXTURE; legalDeadline source_pending (OD-P26)                               | `/carta-servicos?pv_papel=avancada&pv_estado=loaded`                                                           | loaded; empty; loading; error; forbidden |
| 3   | `/carta-servicos/:serviceKey`                   | page | catalogo     | —                  | PortalClient: PORTAL_SERVICE_CATALOG_FIXTURE; legalDeadline source_pending (OD-P26)                               | `/carta-servicos/consulta_multas?pv_papel=avancada&pv_estado=loaded`                                           | loaded; empty; loading; error; forbidden |
| 4   | `/pontuacao/como-funciona`                      | page | catalogo     | —                  | PortalClient: PORTAL_SERVICE_CATALOG_FIXTURE; legalDeadline source_pending (OD-P26)                               | `/pontuacao/como-funciona?pv_papel=avancada&pv_estado=loaded`                                                  | loaded; empty; loading; error; forbidden |
| 5   | `/acessibilidade`                               | page | core         | —                  | PortalClient: ME_RESPONSE_FIXTURE; catálogo PORTAL_SERVICE_CATALOG_FIXTURE; brand source_pending                  | `/acessibilidade?pv_papel=avancada&pv_estado=loaded`                                                           | loaded; empty; loading; error; forbidden |
| 6   | `/auth/callback`                                | page | core         | —                  | PortalClient: ME_RESPONSE_FIXTURE; catálogo PORTAL_SERVICE_CATALOG_FIXTURE; brand source_pending                  | `/auth/callback?pv_papel=avancada&pv_estado=loaded`                                                            | loaded; empty; loading; error; forbidden |
| 7   | `/inicio`                                       | page | core         | —                  | PortalClient: ME_RESPONSE_FIXTURE; catálogo PORTAL_SERVICE_CATALOG_FIXTURE; brand source_pending                  | `/inicio?pv_papel=avancada&pv_estado=loaded`                                                                   | loaded; empty; loading; error; forbidden |
| 8   | `/autos`                                        | page | autos        | consulta_multas    | PortalClient: AIT_LIST_PAGE_FIXTURE; AIT_DETAIL_FIXTURE; POINTS_SUMMARY_FIXTURE; AIT_POINTS_FIXTURE               | `/autos?pv_papel=avancada&pv_estado=loaded`                                                                    | loaded; empty; loading; error; forbidden |
| 9   | `/autos/:aitId`                                 | page | autos        | consulta_multas    | PortalClient: AIT_LIST_PAGE_FIXTURE; AIT_DETAIL_FIXTURE; POINTS_SUMMARY_FIXTURE; AIT_POINTS_FIXTURE               | `/autos/00000000-0000-7000-8000-0000f0000002?pv_papel=avancada&pv_estado=loaded`                               | loaded; empty; loading; error; forbidden |
| 10  | `/autos/:aitId/defesa/nova`                     | page | defesa       | defesa_previa      | PortalClient: AIT_DETAIL_FIXTURE; REQUEST_DETAIL_FIXTURE; delegação SERVICE_UNAVAILABLE                           | `/autos/00000000-0000-7000-8000-0000f0000002/defesa/nova?pv_papel=avancada&pv_estado=loaded`                   | loaded; empty; loading; error; forbidden |
| 11  | `/autos/:aitId/condutor/nova`                   | page | indicacao    | indicacao_condutor | PortalClient: AIT_DETAIL_FIXTURE; delegação SERVICE_UNAVAILABLE                                                   | `/autos/00000000-0000-7000-8000-0000f0000002/condutor/nova?pv_papel=avancada&pv_estado=loaded`                 | loaded; empty; loading; error; forbidden |
| 12  | `/autos/:aitId/pagamento`                       | page | pagamento    | pagamento          | PortalClient: AIT_DETAIL_FIXTURE; pagamento source_pending / SERVICE_UNAVAILABLE                                  | `/autos/00000000-0000-7000-8000-0000f0000002/pagamento?pv_papel=avancada&pv_estado=loaded`                     | loaded; empty; loading; error; forbidden |
| 13  | `/autos/:aitId/pagamento/preservando-recurso`   | page | pagamento    | pagamento          | PortalClient: AIT_DETAIL_FIXTURE; pagamento source_pending / SERVICE_UNAVAILABLE                                  | `/autos/00000000-0000-7000-8000-0000f0000002/pagamento/preservando-recurso?pv_papel=avancada&pv_estado=loaded` | loaded; empty; loading; error; forbidden |
| 14  | `/processos`                                    | page | processos    | —                  | PortalClient: REQUEST_LIST_PAGE_FIXTURE; REQUEST_DETAIL_FIXTURE; DECISION_DEFERIDO_FIXTURE; OD-P72 source_pending | `/processos?pv_papel=avancada&pv_estado=loaded`                                                                | loaded; empty; loading; error; forbidden |
| 15  | `/processos/:requestId`                         | page | processos    | —                  | PortalClient: REQUEST_LIST_PAGE_FIXTURE; REQUEST_DETAIL_FIXTURE; DECISION_DEFERIDO_FIXTURE; OD-P72 source_pending | `/processos/00000000-0000-7000-8000-000070400009?pv_papel=avancada&pv_estado=loaded`                           | loaded; empty; loading; error; forbidden |
| 16  | `/processos/:requestId/diligencia/:diligenceId` | page | processos    | —                  | PortalClient: REQUEST_LIST_PAGE_FIXTURE; REQUEST_DETAIL_FIXTURE; DECISION_DEFERIDO_FIXTURE; OD-P72 source_pending | `/processos/00000000-0000-7000-8000-000070400009/diligencia/did-1?pv_papel=avancada&pv_estado=loaded`          | loaded; empty; loading; error; forbidden |
| 17  | `/processos/:requestId/desistencia`             | page | processos    | —                  | PortalClient: REQUEST_LIST_PAGE_FIXTURE; REQUEST_DETAIL_FIXTURE; DECISION_DEFERIDO_FIXTURE; OD-P72 source_pending | `/processos/00000000-0000-7000-8000-000070400009/desistencia?pv_papel=avancada&pv_estado=loaded`               | loaded; empty; loading; error; forbidden |
| 18  | `/processos/:requestId/decisao`                 | page | processos    | —                  | PortalClient: REQUEST_LIST_PAGE_FIXTURE; REQUEST_DETAIL_FIXTURE; DECISION_DEFERIDO_FIXTURE; OD-P72 source_pending | `/processos/00000000-0000-7000-8000-000070400009/decisao?pv_papel=avancada&pv_estado=loaded`                   | loaded; empty; loading; error; forbidden |
| 19  | `/processos/:requestId/jari/nova`               | page | defesa       | recurso_jari       | PortalClient: AIT_DETAIL_FIXTURE; REQUEST_DETAIL_FIXTURE; delegação SERVICE_UNAVAILABLE                           | `/processos/00000000-0000-7000-8000-000070400009/jari/nova?pv_papel=avancada&pv_estado=loaded`                 | loaded; empty; loading; error; forbidden |
| 20  | `/processos/:requestId/cetran/nova`             | page | defesa       | recurso_cetran     | PortalClient: AIT_DETAIL_FIXTURE; REQUEST_DETAIL_FIXTURE; delegação SERVICE_UNAVAILABLE                           | `/processos/00000000-0000-7000-8000-000070400009/cetran/nova?pv_papel=avancada&pv_estado=loaded`               | loaded; empty; loading; error; forbidden |
| 21  | `/notificacoes`                                 | page | notificacoes | —                  | PortalClient: INBOX_LIST_FIXTURE; SNE_ENROLLMENT_ADERIDO_FIXTURE; preferences source_pending                      | `/notificacoes?pv_papel=avancada&pv_estado=loaded`                                                             | loaded; empty; loading; error; forbidden |
| 22  | `/notificacoes/preferencias`                    | page | notificacoes | —                  | PortalClient: INBOX_LIST_FIXTURE; SNE_ENROLLMENT_ADERIDO_FIXTURE; preferences source_pending                      | `/notificacoes/preferencias?pv_papel=avancada&pv_estado=loaded`                                                | loaded; empty; loading; error; forbidden |
| 23  | `/sne`                                          | page | notificacoes | adesao_sne         | PortalClient: INBOX_LIST_FIXTURE; SNE_ENROLLMENT_ADERIDO_FIXTURE; preferences source_pending                      | `/sne?pv_papel=avancada&pv_estado=loaded`                                                                      | loaded; empty; loading; error; forbidden |
| 24  | `/documentos/cnh-digital`                       | page | documentos   | consulta_cnh       | PortalClient: CNH_READ_FIXTURE; VEHICLE_LIST_FIXTURE; VEHICLE_CLEARANCE_CLEAR_FIXTURE; source_pending OD-P36      | `/documentos/cnh-digital?pv_papel=avancada&pv_estado=loaded`                                                   | loaded; empty; loading; error; forbidden |
| 25  | `/veiculos`                                     | page | documentos   | —                  | PortalClient: CNH_READ_FIXTURE; VEHICLE_LIST_FIXTURE; VEHICLE_CLEARANCE_CLEAR_FIXTURE; source_pending OD-P36      | `/veiculos?pv_papel=avancada&pv_estado=loaded`                                                                 | loaded; empty; loading; error; forbidden |
| 26  | `/veiculos/:vehicleId/crlv-e`                   | page | documentos   | emissao_crlv       | PortalClient: CNH_READ_FIXTURE; VEHICLE_LIST_FIXTURE; VEHICLE_CLEARANCE_CLEAR_FIXTURE; source_pending OD-P36      | `/veiculos/00000000-0000-7000-8000-0000f0000101/crlv-e?pv_papel=avancada&pv_estado=loaded`                     | loaded; empty; loading; error; forbidden |
| 27  | `/sinistros`                                    | page | sinistros    | consulta_bat       | PortalClient: CRASH_ID; source_pending OD-P19/P74                                                                 | `/sinistros?pv_papel=avancada&pv_estado=loaded`                                                                | loaded; empty; loading; error; forbidden |
| 28  | `/sinistros/:crashId`                           | page | sinistros    | consulta_bat       | PortalClient: CRASH_ID; source_pending OD-P19/P74                                                                 | `/sinistros/00000000-0000-7000-8000-00007ff00003?pv_papel=avancada&pv_estado=loaded`                           | loaded; empty; loading; error; forbidden |
| 29  | `/exames`                                       | page | exames       | consulta_exame     | PortalClient: EXAM_ID; source_pending OD-P19; junta_medica fora do catálogo                                       | `/exames?pv_papel=avancada&pv_estado=loaded`                                                                   | loaded; empty; loading; error; forbidden |
| 30  | `/exames/:examId/junta/nova`                    | page | exames       | junta_medica       | PortalClient: EXAM_ID; source_pending OD-P19; junta_medica fora do catálogo                                       | `/exames/00000000-0000-7000-8000-00007ff00002/junta/nova?pv_papel=avancada&pv_estado=loaded`                   | loaded; empty; loading; error; forbidden |
| 31  | `/ouvidoria/nova`                               | page | atendimento  | manifestar         | PortalClient: MANIFESTATION_EM_ANALISE_FIXTURE; source_pending OD-P91/P65                                         | `/ouvidoria/nova?pv_papel=avancada&pv_estado=loaded`                                                           | loaded; empty; loading; error; forbidden |
| 32  | `/ouvidoria/:manifestationId`                   | page | atendimento  | —                  | PortalClient: MANIFESTATION_EM_ANALISE_FIXTURE; source_pending OD-P91/P65                                         | `/ouvidoria/00000000-0000-7000-8000-000070700003?pv_papel=avancada&pv_estado=loaded`                           | loaded; empty; loading; error; forbidden |
| 33  | `/avaliacao/:requestId`                         | page | atendimento  | avaliar            | PortalClient: MANIFESTATION_EM_ANALISE_FIXTURE; source_pending OD-P91/P65                                         | `/avaliacao/00000000-0000-7000-8000-000070400009?pv_papel=avancada&pv_estado=loaded`                           | loaded; empty; loading; error; forbidden |
| 34  | `/privacidade/meus-dados`                       | page | privacidade  | lgpd_declaracao    | PortalClient: ME_RESPONSE_FIXTURE; heldDataSummary source_pending                                                 | `/privacidade/meus-dados?pv_papel=avancada&pv_estado=loaded`                                                   | loaded; empty; loading; error; forbidden |
| 35  | `/assinatura/elevacao`                          | page | assinatura   | —                  | PortalClient: ME_RESPONSE_FIXTURE; elevação SERVICE_UNAVAILABLE (OD-P15)                                          | `/assinatura/elevacao?pv_papel=simples&pv_estado=loaded`                                                       | loaded; empty; loading; error; forbidden |
| 36  | `/conta`                                        | page | core         | —                  | PortalClient: ME_RESPONSE_FIXTURE; catálogo PORTAL_SERVICE_CATALOG_FIXTURE; brand source_pending                  | `/conta?pv_papel=avancada&pv_estado=loaded`                                                                    | loaded; empty; loading; error; forbidden |
| 37  | `/vinculo/por-que-nao-vejo`                     | page | core         | —                  | PortalClient: ME_RESPONSE_FIXTURE; catálogo PORTAL_SERVICE_CATALOG_FIXTURE; brand source_pending                  | `/vinculo/por-que-nao-vejo?pv_papel=avancada&pv_estado=loaded`                                                 | loaded; empty; loading; error; forbidden |
| 38  | `/servico-indisponivel/:serviceKey`             | page | core         | —                  | PortalClient: ME_RESPONSE_FIXTURE; catálogo PORTAL_SERVICE_CATALOG_FIXTURE; brand source_pending                  | `/servico-indisponivel/consulta_multas?pv_papel=avancada&pv_estado=loaded`                                     | loaded; empty; loading; error; forbidden |

## 4. Jornada e observações para implementação

JRN-PORTAL-001: `/autos` → `/autos/:aitId` → `/assinatura/elevacao` (simples) →
`/autos/:aitId/defesa/nova` → `/processos/:requestId` → `/processos/:requestId/decisao` →
`/processos/:requestId/jari/nova` → `/processos/:requestId/cetran/nova`. São oito telas reais,
cobertas nos cinco estados e por invariantes a11y + axe sem serious/critical.
Fixtures de recursos não autorizam inventar elegibilidade de recurso: `REQUEST_DETAIL_FIXTURE`
tem externalId null e canAppeal false; JARI/CETRAN podem mostrar inelegibilidade honesta.

Exceção material do catálogo canônico: `junta_medica` não figura nos 15 serviços de
`PORTAL_SERVICE_CATALOG_FIXTURE`. A guarda real redireciona a URL da linha 30 a
`/servico-indisponivel/junta_medica`; não se inventa serviço disponível para satisfazer cobertura.
`auth/callback` não deve concluir login real/sintético com sucesso: permanece com erro honesto,
sem navegar para `/inicio`. T-27 exige simples para não retomar imediatamente `/inicio`.

`source_pending`: marca/branding sem fixture; prazo da Carta (OD-P26); veículos e clearance
(OD-P36); crash/exam sem corpo normativo completo (OD-P19/P74); diligência/documentos (OD-P72);
retorno gov.br (OD-P15); escala de avaliação (OD-P65); preferências (OD-P87); corpo livre de
manifestação (OD-P91). Os ids CRASH_ID/EXAM_ID são @example já transcritos; não autorizam dados
pessoais nem regras legais adicionais. Nenhum dado do ME_PAIR3_FIXTURE é necessário para me():
usa-se ME_RESPONSE_FIXTURE sem CPF em claro.
