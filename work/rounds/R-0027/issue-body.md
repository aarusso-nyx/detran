# Portal: religar delegações de solicitações e jornadas cidadãs

## Escopo

Completar a frente R-0027 (ação 6 da C-0002): delegações de defesa, recursos, indicação de condutor, pagamento, junta e diligência, desistência, integração de estados/eventos e telas do Portal, conforme a matriz e os contratos de `work/rounds/R-0027/`. A retomada da implementação posterior ao pré-trabalho depende de R-0024 conforme o plano. O status desta issue acompanha a conclusão integral da frente; o pré-trabalho não representa entrega final.

## Oito linhas de delegação

| Ato                    | Delegação e consequência exigida                                                                                                                                                |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Defesa prévia          | `raitCaseProtocol`, `instance=defesa_previa`, `circuit=1`, protocolo e prazo originados em `protocolled_at` do Portal; persistir ID real do caso como `externalId`.             |
| Recurso JARI           | `raitCaseProtocol`, `instance=jari`, `circuit=2`; resolver AIT, origem, decisão anterior e prazo no servidor; persistir caso real.                                              |
| Recurso CETRAN         | `raitCaseProtocol`, `instance=cetran`, `circuit=2`; validar origem JARI e T-R2 no servidor; persistir caso real.                                                                |
| Indicação de condutor  | `infractionIndicateDriver`; validar AIT, vínculo, prazo, confirmação e duas assinaturas; persistir referência real da infração.                                                 |
| Pagamento              | `collectionDocumentIssue`; emitir guia PIX/boleto com valor, tier e validade de fonte servidora e ID real; cartão/parcelamento off. Emissão não significa pagamento confirmado. |
| Junta médica           | Nenhuma chamada a `ch/juntas` em R-0027; responder 422 com OD-R27-002 explícita. Chave reservada para R-0032.                                                                   |
| Resposta de diligência | `raitInquiryAnswer` permanece 422 enquanto OD-P67/OD-R27-004 e o destino tipado do texto/anexos estiverem pendentes; não descartar conteúdo.                                    |
| Desistência            | `raitCaseWithdraw`; só marcar Portal como desistido após aceite real do RAIT e persistir a mesma referência externa.                                                            |

## Decisões e ODs

OD-R27-001 = **(a), decisão do Owner**: ator técnico `portal-delegation`, chaves próprias `…-portal` avaliadas pela política, cidadão requerente e `onBehalfOf` na auditoria. Prazo contado desde `protocolled_at`. É vedada chamada in-process sem avaliação de política.

OD-R27-002 = **(b), decisão do Owner**: junta indisponível em R-0027 e entregue integralmente em R-0032 com contrato, vínculo, marco de ciência e prazo calculados no servidor. A junta será registrada no fechamento como exceção declarada ao critério C-0002 §5, nunca como PASS.

OD-R27-003 permanece `source_pending` (decisor: Architect): não foi localizado produtor do evento de domínio `PAGAMENTO_CONFIRMADO`. Guia pode ser emitida, mas não avançar o pedido por pagamento sem evento real persistido e consumido idempotentemente. OD-R27-004 permanece `source_pending` (decisor: Owner/LEGAL): nível de assinatura da resposta de diligência; manter fail-closed até fonte normativa e contrato que preserve texto e anexos. As classificações de OD-P05/P17/P19/P28/P32/P41/P43/P67/P72/P74/P76 são as transcritas em `docs/framework/arch/portal-build-pack.md` §4. OD-P01/CETRAN-AM e demais lacunas continuam sem decisão ou valor inferido.

## Critérios de aceite

- Aplicar a matriz de `work/rounds/R-0027/delegation-matrix.md` às oito linhas, condicionando alvos às guardas, vínculo, política, estado e fontes; nenhum ID, prazo, valor ou evidência é inventado.
- Executar delegações como `portal-delegation`, com avaliação explícita da chave de política inclusive em chamadas in-process; negar cidadão direto, papel genérico/wildcard, chave ausente, tenant divergente, alvo sem vínculo, replay com corpo divergente e estado inválido.
- Preservar `onBehalfOf`, requerente, tenant, correlation/request/protocol IDs e auditoria consistente; o prazo RAIT parte do `protocolled_at` do Portal, nunca do relógio da delegação ou do navegador.
- Persistir o ID externo real e validar jornadas, eventos/outbox/SSE e idempotência conforme CTG-0003. Erro após protocolo retorna `PORTAL.DELEGATION_FAILED` sem perder o protocolo.
- Junta e diligência bloqueadas mantêm 422 com OD específica; a junta é exceção declarada no fechamento.
- Pagamento só usa PIX/boleto e fonte servidora. Não transicionar para protocolado por pagamento sem produtor comprovado de `PAGAMENTO_CONFIRMADO` (OD-R27-003).
- `lgpd_declaracao` e `emissao_crlv` permanecem 422 (#125); cartão e parcelamento permanecem `false`.
- Validar, ao final da rodada, todos os gates e critérios do plano R-0027, sem registrar exceção da junta como PASS.

## Fora de escopo

- `lgpd_declaracao` (parcial conforme OD-P17) e `emissao_crlv` (#125).
- Cartão, parcelamento e ativação de desconto de 40% sem fonte.
- Entrega da junta em R-0027; contrato, vínculo, ciência, prazo e habilitação ficam para R-0032.
- Resposta de diligência enquanto OD-P67/OD-R27-004 e destino do texto/anexos não forem resolvidos por fonte e contrato.
- Inventar produtor, schema ou correlação para `PAGAMENTO_CONFIRMADO`, valor/tier, prazo, identificador, nível de assinatura ou conteúdo normativo.
- Abrir rotas de comando de staff ao login gov.br ou contornar a política com chamada in-process.
