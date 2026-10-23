# R-0041 — avaliação de a97e6def com composição recusada

**Não foi emitido um scorecard nativo atualizado.** O comando oficial recusou a composição com `SCORECARD_READING_AMBIGUOUS:inventory_adherence`. Não há veredito global nem contagem de células PASS/REVIEW/FAIL após a coleta. O snapshot anterior de 43 UNKNOWN é anterior aos registros novos e não substitui o resultado atual.

Baseline: `a97e6def6cc4b80d65c5ab0ee9579241f0b33446`; DEVAI 2.6.3. Foram executadas e registradas oficialmente **61 leituras de 55 tipos**, preservando também as tentativas inválidas. As 43 entradas têm evidência e disposição: {"observed_native_predicate":29,"lineage_blocked":6,"observation_gap":8}. Esses números descrevem disponibilidade de medições, não um scorecard composto ou prontidão. Os dois N/A configurados permanecem F1:T1 e F4:T5.

A ordem de captura/registro desta tentativa criou seis linhagens com duas cabeças no mesmo SHA. O controle recusou a ambiguidade corretamente. O DEVAI 2.6.3 também recusa nova emissão sobre uma linhagem já ambígua; nenhum ID, relação de sucessão, leitura ou registro foi reescrito para contornar isso.

A repetição unitária válida concluiu 13.587 testes aprovados, 54 falhos e 155 TODO; os 54 identificadores falhos coincidem com a tentativa inicial invalidada por mudança dos inputs de auditoria. A integração repetida em árvore limpa aprovou 1.518 testes. O E2E terminou sua etapa principal mas foi interrompido no upgrade pelo orçamento nativo; a suíte de desempenho pulou os três cenários após timeout do beforeAll; a cobertura não produziu relatório válido. Cinco sensores estáticos recusaram o alias rastreado de fixtures. Todos esses limites e resultados permanecem.

## Registro dos 43 itens

Nenhum veredito de célula foi calculado manualmente. Capturas e recibos referem-se à raiz desta cápsula; caminhos canônicos de leituras referem-se à raiz do repositório.

| Item | Disponibilidade | Observações nativas, sem composição |
| --- | --- | --- |
| F1:T2 | observed_native_predicate | spec_depth=pass |
| F1:T3 | observed_native_predicate | trace_resolution=pass |
| F1:T4 | observed_native_predicate | spec_alignment=review |
| F1:T5 | observed_native_predicate | spec_idiomaticity=pass |
| F1:T6 | observed_native_predicate | spec_security_coverage=review |
| F1:T7 | observed_native_predicate | spec_performance_targets=pass |
| F1:T8 | observed_native_predicate | spec_robustness_targets=pass |
| F1:T9 | observed_native_predicate | spec_freshness=pass |
| F2:T1 | lineage_blocked | plant_coverage=fail; plant_coverage=pass |
| F2:T2 | observed_native_predicate | plant_depth=pass |
| F2:T3 | observed_native_predicate | plant_coherence=pass |
| F2:T4 | observed_native_predicate | migration_check=pass |
| F2:T5 | observed_native_predicate | lint=fail |
| F2:T6 | observed_native_predicate | security_scan=fail |
| F2:T7 | observation_gap | perf_test=fail |
| F2:T8 | observed_native_predicate | type_check=pass |
| F2:T9 | observed_native_predicate | build=pass |
| F3:T1 | observation_gap | unit_test=fail; integration_test=pass; e2e_test=error |
| F3:T2 | observation_gap | test_coverage_depth=fail |
| F3:T3 | observation_gap | test_coherence=error |
| F3:T4 | observed_native_predicate | test_invariant_alignment=pass |
| F3:T5 | observation_gap | test_idiomaticity=error |
| F3:T6 | observation_gap | test_security_coverage=error |
| F3:T7 | observation_gap | test_performance_coverage=error |
| F3:T8 | observation_gap | test_robustness_coverage=error |
| F3:T9 | observed_native_predicate | test_weakening_review=pass |
| F4:T1 | lineage_blocked | inventory_api=pass; inventory_routes=pass; inventory_data_model=pass; inventory_rbac=unknown; inventory_rbac=review; inventory_data_handling=review; inventory_data_handling=pass; inventory_dep_graph=pass; inventory_coverage=review; inventory_coverage=review |
| F4:T2 | lineage_blocked | inventory_api=pass; inventory_routes=pass; inventory_data_model=pass; inventory_coverage=review; inventory_coverage=review |
| F4:T3 | observed_native_predicate | inventory_dep_graph=pass |
| F4:T4 | lineage_blocked | inventory_adherence=unknown; inventory_adherence=fail |
| F4:T6 | lineage_blocked | inventory_rbac=unknown; inventory_rbac=review; inventory_data_handling=review; inventory_data_handling=pass |
| F4:T7 | observed_native_predicate | inventory_performance=review |
| F4:T8 | lineage_blocked | inventory_determinism=pass; inventory_determinism=pass |
| F4:T9 | observed_native_predicate | inventory_regeneration=review |
| F5:T1 | observed_native_predicate | harness_coverage=pass |
| F5:T2 | observed_native_predicate | harness_depth=pass |
| F5:T3 | observed_native_predicate | harness_coherence=review; docs_drift=pass |
| F5:T4 | observed_native_predicate | harness_invariant_alignment=fail |
| F5:T5 | observed_native_predicate | harness_idiomaticity=review |
| F5:T6 | observed_native_predicate | harness_security=pass |
| F5:T7 | observed_native_predicate | harness_performance=fail |
| F5:T8 | observed_native_predicate | harness_robustness=pass |
| F5:T9 | observed_native_predicate | harness_green_main=pass |

## Recuperação proposta

O pacote recovery-proposal.json propõe um checkpoint contendo somente F5 e provas, preservando o produto e a configuração de a97 byte a byte. Uma nova avaliação nativa usaria o SHA desse checkpoint e registraria cada emissão antes de repetir um tipo. **Isso depende de decisão do Owner, pois o pedido atual congela a avaliação em a97.** A alternativa é manter a composição bloqueada nesse SHA. Nenhuma nova avaliação em outro SHA foi iniciada.

C6 continua bloqueado, com os nove bindings adicionais vazios; não houve revisão nem execução do protocolo retido. R-0041 continua ativa. Rodadas encerradas, thresholds, registros anteriores, cadeia legada e backlog de produto são preservados. Esta entrega não contém correção de produto nem autorização para alterar controles.
