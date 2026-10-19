# Autorização e tratamento de dados — representação C3/C4

Papel: Architect. Rodada R-0039. Esta projeção representa o código e as fontes existentes; não concede permissões, aprova bases legais, altera retenção nem substitui leituras DEVAI. A R-0036 permanece encerrada e suas evidências não são regravadas.

## Contrato da representação

Os registros [authorization.json](../../../law/security/authorization.json) e [pii-registry.json](../../../law/security/pii-registry.json) são snapshots suplementares determinísticos. Cada um contém o hash da população nativa de entrada, referências e hashes das fontes atuais. A reprodução exige corpos nativos autênticos, preservados separadamente da leitura que os produziu. Os exportadores nunca emitem ou persistem uma leitura de sensor.

O produtor nativo de referência foi executado sobre `2df548e0ac5227abb64b66994f675dea7ba36a5a`; a reconciliação inicial usa as fontes de C1 integrado, `92be0db44f9cc111ec9369f2fb81c5f6bd1efa1c`. A declaração de produtor antigo não vira uma execução nova por este documento. As coordenadas de cada handler, as declarações SQL e os hashes das fontes são verificados antes da exportação; a comparação de fontes e os comandos efetivamente executados ficam no relatório da R-0039. A produção nativa da nova árvore congelada é uma etapa distinta, conduzida pelo orquestrador.

DEVAI 2.6.3 não consome estes dois formatos. `native_sensor_compatible: false` é explícito. O unresolved nativo de RBAC e as limitações da heurística de dados permanecem no scorecard até uma integração de provedor específica, testada e autorizada. Não existe conversão automática desses registros em PASS.

## Autorização: população e semântica

| População                     | Quantidade | Disposição                                                           |
| ----------------------------- | ---------: | -------------------------------------------------------------------- |
| Aplicação com Resource/Action |      1.004 | Referência à política condicional existente                          |
| Aplicação pública             |          6 | Revisão individual dos controles abaixo                              |
| SENATRAN mock                 |        121 | População própria; autorização ainda não resolvida por esta projeção |
| Fixtures de teste             |          8 | Mantidas no denominador e identificadas como fixtures                |
| Total nativo                  |      1.139 | Nenhum handler removido                                              |

Os números são resultados da fonte atual, não constantes de aprovação: novos handlers alteram a população; um mapa nativo que omite handler ou apresenta coordenadas antigas faz a exportação falhar. Expressões de rota não literais preservam o endpoint observado, mas ficam unresolved; o caminho de fallback do inventário nativo não demonstra a rota real. A fixture de rota dinâmica existente explicita essa limitação.

`Resource` e `Action` apenas declaram metadados. O vínculo aponta para a avaliação ordenada de `isDetranActionAllowed`, em `backend/domains/shared/src/policy.ts`, sem copiar a matriz como se fosse uma autorização incondicional. Os bloqueios DPO, protocolo, comandos desabilitados e papéis estritos precedem os atalhos por permissões. A política especial de provisioning verifica tenant, papel e claims `agent_id`/`device_id`; a guarda de cidadão verifica identidade e papel além da política global. A classe `ProvisioningPolicyGuard` delega os demais caminhos por `DetranPolicyErrorGuard` e `DetranPolicyGuard`.

O código de `DetranPolicyGuard` permite passagem quando os metadados faltam. Por isso a verificação de decorators e a reconciliação completa são necessárias; a projeção não afirma que esse comportamento equivale a um deny global. `runtime_authorization_proven` permanece `false` em cada endpoint: vínculos estáticos não demonstram todas as condições de tenant, agência, identidade e finalidade na execução.

### As seis rotas públicas

| Rota                                             | Controle existente                                                                                                                                                                               | Referências de testes                                                                                                              |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| POST `/v1/ch/transmissions/callbacks/renach`     | `RenachWebhookGuard`: segredo configurado, tenant UUID, evento, timestamp, corpo bruto exato, HMAC SHA-256 com comparação constante e janela de 300 segundos; principal de integração com tenant | `backend/app/src/renach-webhook.guard.spec.ts`: assinatura válida/inválida e timestamp fora da janela                              |
| POST `/v1/ch/transmissions/callbacks/toxicology` | A mesma guarda HMAC, sem inferir concessão por papel de usuário                                                                                                                                  | Mesmo teste unitário da guarda; não prova E2E específico do callback                                                               |
| GET `/v1/portal/brand`                           | Catálogo anônimo deliberado; tenant no RequestContext, SQL parametrizado, transação `app` readonly                                                                                               | `backend/app/tests/e2e/portal-identity.e2e.spec.ts`, C-0001-44 e 47–50                                                             |
| GET `/v1/portal/services`                        | Leitura anônima parametrizada pelo tenant                                                                                                                                                        | Mesmo arquivo, C-0001-45                                                                                                           |
| GET `/v1/portal/services/:serviceKey`            | Chave literal parametrizada; serviço ausente retorna 404                                                                                                                                         | Mesmo arquivo, C-0001-46                                                                                                           |
| POST `/v1/portal/manifestations`                 | Intake anônimo por decisão existente; identidade oportunista somente com membership do tenant e claims CIDADAO; isolamento do tenant e idempotência no serviço                                   | `portal-opportunistic-auth.spec.ts`, `portal-manifestation-tenant-isolation.e2e.spec.ts`, C-0002-79 em `portal-routes.e2e.spec.ts` |

A resolução de tenant por Host é configurável: o teste C-0001-50 registra o fallback ao tenant local quando desabilitada. Não alegamos rejeição universal de Host desconhecido. A janela temporal de HMAC tampouco demonstra sozinha deduplicação de eventos; o fluxo do serviço é um controle distinto. As referências acima identificam testes existentes, sem afirmar uma execução que o exportador não realizou.

Casos negativos adicionais estão ligados às fontes no registro: papel/principal ausente em `policy.guard.spec.ts`; precedência e papéis estritos em `policy.spec.ts`; assurance e identidade em `citizen.guard.spec.ts`; finalidade incompleta e identidade órfã em `rait-p402-scope.e2e.spec.ts`; circunscrição divergente sem efeitos em `rait-case-behavioral-matrix.spec.ts`. A cobertura de um caso não é extrapolada para todos os handlers.

## Dados pessoais: união conhecida e pendências

| Origem                                            |  Quantidade |
| ------------------------------------------------- | ----------: |
| Tabelas / colunas no corpo SQL nativo             | 363 / 4.122 |
| Candidatos pela heurística nativa de nomes        |          70 |
| Campos com declaração PII em blueprint            |         158 |
| Interseção blueprint e heurística                 |          17 |
| Campos declarados em blueprint fora da heurística |         141 |
| União conhecida, sem duplicação                   |         211 |
| Candidatos `state` / `cnpj`                       |      21 / 8 |

Cada linha identifica `schema.table.column`, declaração SQL, ponteiro JSON do blueprint, classificação declarada, contexto do módulo, finalidade, base legal, retenção e IDs específicos de pendência. Contexto do módulo não é preenchido como finalidade jurídica. Os valores existentes de retenção são transcritos literalmente, inclusive parâmetros e quatro declarações `forever`, que ficam explicitamente em revisão. Valores conflitantes permanecem visíveis e não são escolhidos por conveniência.

Todos os 211 campos têm pendência nominada de finalidade e base legal no conjunto de metadados examinado; 73 não têm retenção, e 53 têm apenas classificação candidata por nome. Isso não afirma que nenhuma outra fonte do corpus contém informação: delimita o mapeamento de campo efetivamente comprovado por SQL e blueprint.

- `state`: a heurística sugere localização, embora defaults e vocabulário de vários domínios descrevam estado de workflow. Cada um dos 21 permanece candidato até revisão de semântica específica; nenhum é removido por nome.
- `cnpj`: os oito identificadores são contextuais. Não presumimos universalmente que sejam pessoais ou não pessoais; a eventual vinculação a pessoa natural depende de finalidade e contexto autênticos.
- Saúde e identificadores: preservamos classificações existentes de blueprints e a referência arquitetural BOAT. Não reduzimos dados de saúde a PII genérica nem transformamos um parâmetro de retenção em prazo legal aprovado.
- Credenciais: candidatos permanecem restritos na recomendação de revisão. O registro contém metadados e referências, nunca valores de segredos, tokens ou dados pessoais de execução.

`docs/meta/security/lgpd-rait.md` declara expressamente que as bases LGPD art. 7º II/VI e a proposta de cinco anos não foram validadas juridicamente. A delegação de decisão do Owner autoriza o tratamento operacional da pendência, mas não transforma propostas em fatos legais. A recomendação conservadora é manter os campos identificados e restringir sua divulgação durante a revisão, sem alterar comportamento executável. A definição de finalidade, base, retenção ou acesso exige fonte canônica autêntica e tarefa própria quando implicar produto.

O registro não pretende descobrir toda PII possível. Texto livre, JSON e possibilidade de reidentificação exigem avaliação adicional; a ausência de um campo na união não significa ausência de dado pessoal. O parser nativo de CREATE TABLE também não equivale a inspeção de banco migrado.

## Reprodução e validação

Depois de produzir os corpos nativos pelo fluxo oficial na árvore limpa:

```sh
pnpm exec tsx tools/security/export-authorization.ts --api-map .devai/state/sensors/inventory_api/api-map.json --output law/security/authorization.json
pnpm exec tsx tools/security/export-pii.ts --data-model .devai/state/sensors/inventory_data_model/data-model.json --pii-model .devai/state/sensors/inventory_data_handling/data-model-pii.json --output law/security/pii-registry.json
```

Use `--check` no lugar de `--output` para comparar bytes deterministicamente sem escrever. Alterações de fontes, população, conflitos e lacunas devem passar pela revisão Architect/Inspector; regenerar não aprova automaticamente controles novos. A serialização segue o formatador já instalado no repositório.

Os exportadores recusam IDs/handlers duplicados, handlers omitidos, coordenadas de rota antigas, divergência entre os modelos SQL e PII, evidências SQL sem declaração qualificada correspondente e colunas sem declaração. Blueprint sem correspondência SQL não desaparece: recebe `PII-SQL-MAPPING`. Conflitos de classificação, finalidade, base e retenção permanecem pendências. Os schemas, a integração ao harness e os testes Inspector são controlados por tarefas distintas da rodada; estes exportadores não modificam configuração, thresholds, guards, DDL, RLS, provas ou backlog.
