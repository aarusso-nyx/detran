# Diagnóstico de BL-0013, BL-0020, BL-0019 e triagem de BL-0022

Data: 2026-10-19. Avaliação: Auditor. Propostas: Architect. Estado: diagnóstico concluído; correções propostas, sem autorização de execução.

## Escopo e custódia

Referência examinada: `2df548e0ac5227abb64b66994f675dea7ba36a5a`, árvore `f4eaa7d6fa0da933c5d233380f9165b00aebd3d0`, DEVAI 2.6.3, STYNX 1.5.3, constituição 1.0.2. Execuções no checkout limpo dessa referência em `/Volumes/Development/.codex/worktrees/pr202-reconcile/detran`. Este diretório contém novos relatórios de planejamento, sem modificar a referência examinada.

A R-0036 continua encerrada em PC-0022. Seu candidato congelado `e9e45a4a6cbed5cfd394c716c79a55b1aca386b8` e seu resultado de 43 itens medidos (24 PASS, 10 REVIEW, 9 FAIL) permanecem históricos. Este diagnóstico parcial da árvore posterior não é uma nova avaliação dos 43 itens nem uma atestação da main. Os quatro itens de backlog continuam abertos.

Não foram aplicadas atualizações de dependências, correções de produto, alterações de testes, políticas, thresholds, workflows ou sensores. A regeneração nativa atualizou somente artefatos locais de inventário no checkout de diagnóstico. Não houve `sense record`, emissão de provas ou escrita nas cadeias, nem reaproveitamento de leituras antigas como se fossem atuais. A pasta preexistente `.devai/state/render/` do checkout principal foi preservada.

As capturas em `raw/` são saídas de diagnóstico, não provas assinadas. O manifesto identifica seus hashes; `preservation-baseline.json` permite conferir os bytes dos históricos, backlog, entradas de medição e configuração. O resultado da verificação oficial da cadeia é válido: 98 linhas ancoradas, com 53 lacunas históricas reconhecidas. Essa validade não transforma lacunas em evidência disponível.

## Resultado por item

| Item    | Resultado observado                                                                                                                        | Interpretação e encaminhamento                                                                                                      |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| BL-0013 | `security_scan` FAIL; 37 ocorrências: 5 críticas, 15 altas, 13 moderadas, 4 baixas                                                         | Dependências vulneráveis instaladas. Separar execução de produto e ferramentas. Pacotes C1 e C2.                                    |
| BL-0020 | `inventory_rbac` REVIEW: 45 vínculos e 1.094 endpoints sem vínculo resolvido; `inventory_data_handling` PASS com 70 candidatos sem rótulos | Há lacuna de representação e classificação; não demonstra ausência geral de autorização nem conformidade de dados. Pacotes C3 e C4. |
| BL-0019 | `spec_security_coverage` e `spec_robustness_targets` FAIL                                                                                  | Modelo de ameaças ausente; contratos existentes não reconhecidos por predicados específicos. Pacote C5.                             |
| BL-0022 | Coerência e idiomaticidade REVIEW; alinhamento de invariantes e drift documental FAIL                                                      | Triagem distingue ausência de vínculo verificável, incompatibilidade textual e recomendações opcionais. Pacotes C6–C8.              |

Os thresholds existentes permanecem: segurança `pass_max_high=0`, `review_max_high=5`; coerência `max_review_incoherence=3`. Nenhum resultado foi convertido manualmente em PASS.

## BL-0013 — dependências

A auditoria completa contém 36 entradas de advisory e 37 ocorrências reportadas; um advisory de piscina alcança duas versões instaladas. São unidades diferentes. A contagem 37 coincide com a rodada congelada, sem afirmar identidade de todos os advisories entre datas. Não se deve interpretar `devDependencies: 0` da metadata agregada como prova de que tudo roda em produção.

| Família instalada             | Caminho ou população observada            | Faixa corrigida indicada pelos advisories, ainda não testada neste projeto |
| ----------------------------- | ----------------------------------------- | -------------------------------------------------------------------------- |
| handlebars 4.7.9              | backend → STYNX PDF 1.5.3                 | `>=4.7.10`                                                                 |
| proxy-addr 2.0.7              | backend → Nest platform-express → Express | `>=2.0.8`                                                                  |
| multer 2.2.0                  | backend → Nest platform-express           | `>=2.4.0` para cobrir o conjunto encontrado                                |
| qs 6.15.3                     | Express e ferramentas de teste            | `>=6.16.0`                                                                 |
| fast-copy 4.0.4               | logging STYNX / pino-pretty               | `>=4.1.0`                                                                  |
| piscina 5.2.0 e 5.3.1         | Angular build / ng-packagr                | `>=5.3.2`                                                                  |
| Angular router 22.1.6         | aplicações Angular; advisory de SSR       | `>=22.2.0`                                                                 |
| undici 7.29.0                 | jsdom / Vitest e ferramentas              | `>=7.29.1`                                                                 |
| MCP SDK 1.30.0                | Angular CLI                               | `>=1.31.0`                                                                 |
| js-yaml 4.3.1                 | openapi-typescript / Redocly              | `>=4.3.2`                                                                  |
| fast-uri 3.1.6                | DEVAI / ajv                               | `>=3.1.8`                                                                  |
| brace-expansion 2.1.4 e 5.0.9 | DEVAI, minimatch, ESLint                  | `>=2.1.7` e `>=5.0.12`                                                     |
| source-map-js 1.2.1           | ferramentas de build                      | `>=1.2.2`                                                                  |

Essas faixas são candidatos extraídos do relatório, não uma autorização de upgrade irrestrito. Disponibilidade, compatibilidade entre pares e efeito na plataforma precisam ser verificados no pacote aprovado. O registro compacto mantém URLs dos advisories, versões e amostras dos caminhos; o gzip preserva a auditoria completa.

Presença no grafo não prova explorabilidade. O `renderTemplate` de `backend/app/src/boat-documents.ts:527` é uma substituição própria com escape HTML; não é uma chamada a handlebars. Não foi demonstrado neste diagnóstico um caminho de execução do advisory por esse renderizador. Também não foram demonstradas exposição SSR do router, ativação relevante de trust proxy ou uso vulnerável de upload multipart. Isso não elimina a necessidade de atualização; impede alegar exploração confirmada. Sem testes de exploração ou carga contra serviços externos.

## BL-0020 — autorização

O inventário atual contém 1.139 endpoints. A triagem suplementar por AST produziu uma linha por endpoint:

| População                         | Total | Sem vínculo nativo resolvido |
| --------------------------------- | ----: | ---------------------------: |
| Backend com `Resource` e `Action` | 1.004 |                          961 |
| Backend com declaração `Public`   |     6 |                            4 |
| SENATRAN mock                     |   121 |                          121 |
| Fixtures de testes                |     8 |                            8 |
| Total                             | 1.139 |                        1.094 |

Nenhum dos 1.010 handlers do backend ficou sem `Resource`/`Action` ou `Public` na verificação estrutural. `verify:decorators` passou para 1.010 handlers; `verify:role-catalog` passou para 36 papéis. Os testes existentes de política e guard passaram: 736 testes em dois arquivos. São controles úteis, sem substituir testes de isolamento por tenant, agência, identidade e finalidade para cada rota.

O guard global de `backend/app/src/app.module.ts` delega à política de `backend/domains/shared/src/policy.guard.ts` e `policy.ts`. Essa política contém condições contextuais, exceções explícitas e papéis estritos. Convertê-la em uma lista incondicional de papéis perderia semântica. O guard genérico permite ausência de metadata; a verificação estrutural cobre a população atual, mas continua sendo necessário preservar a verificação e seus contraexemplos.

As seis declarações públicas exigem revisão individual: callbacks RENACH e toxicologia protegidos por `RenachWebhookGuard`, três leituras de marca/catálogo do portal e criação de manifestação. O guard de webhook exige segredo configurado, assinatura HMAC, timestamp, tenant e evento; sua presença não constitui prova de todos os cenários negativos. A manifestação possui outras condições de contexto que devem ser documentadas e testadas. Mock e fixtures precisam de classificação própria, sem desaparecer do denominador observado.

## BL-0020 — dados pessoais

O produtor encontrou 363 tabelas, 4.122 colunas e 70 candidatos por nome, todos sem base legal/retenção no inventário SQL. O PASS nativo mede o predicado instalado, não conformidade jurídica.

- 21 candidatos se chamam `state`: precisam distinguir estado de workflow de localização.
- 8 são `cnpj`: exigem contexto antes de classificar dados pessoais.
- 41 são outros candidatos de identidade, contato, localização ou credencial.
- 17 dos 70 já têm classificação PII em blueprint que não chegou ao inventário SQL.
- Outros 141 campos existentes no modelo SQL têm classificação PII em blueprint e ficaram fora da heurística nominal. Não são 141 novos campos criados nem um censo definitivo de toda PII.

O cruzamento usa schema/tabela/coluna exatos e mantém fontes por linha. `BP-EST-CRASH-001.json` e os contratos BOAT já tratam dados de saúde e retenção parametrizada. Campos com retenção `forever` em outros blueprints exigem revisão da fonte e decisão competente, sem substituir por um prazo inventado. Ausência de rótulo no SQL não significa ausência de especificação em todo o repositório.

## BL-0019 — lacunas reais e reconhecimento

O modelo de ameaças não foi encontrado nas raízes declaradas. `docs/dev/security/README.md` é um placeholder. É uma lacuna real: produzir fronteiras de confiança, ativos, fluxos, ameaças e controles com referências verificáveis.

Os outros sinais exigem normalização semântica:

- Segurança reconhece `law/security/threat-model.json` com fronteiras ou nomes de documento específicos. Para PII, aceita declaração estruturada de que não há dados pessoais, ou a forma literal `INSERT INTO core.pii_map` nas raízes SQL. O projeto trata PII; declarar que não trata ou criar inserts artificiais seria incorreto.
- RBAC exige um invariante com `domain: RBAC`. O `INV-AUTH-001` existente usa domínio AUTH e tipo RBAC. Alterar o domínio apenas para satisfazer o sensor não prova cobertura.
- Robustez reconhece tipos específicos de invariante e nomes de arquivos iniciados por `error`. O catálogo real `docs/framework/arch/rait-error-catalog.md` contém envelope, conflito, refresh e replay de idempotência, mas não corresponde ao padrão de nome. Está referenciado como draft; tampouco se pode ratificá-lo silenciosamente.

O pacote deve distinguir ratificação de conteúdo, vínculo de referências e eventual incompatibilidade do provedor. Mudança do provedor, se necessária, demanda proposta e autorização próprias; os repositórios irmãos continuam somente leitura. Contratos existentes são insumos para avaliação, não aprovação automática de todos os requisitos de segurança e robustez.

## BL-0022 — triagem dos controles

| Controle                                                                     | Diagnóstico                                                                                                                                      | Disposição proposta                                                                                                                         |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Sete invariantes gate sem `measurable_via`                                   | CH-001, DASH-001, EST-001, INF-001, OPS-001, OPS-002 e PORTAL-001 têm trace, mas falta vínculo executável de medição                             | C6: provar correspondência invariante → teste → comando → gate; registrar lacunas reais em vez de preencher nomes fictícios.                |
| `docs_drift` versus constitution binding                                     | Doctor confirma versão e hash corretos; o sensor exige texto integral exato do entrypoint e rejeita parágrafo adicional sobre o histórico legado | C6: compatibilizar a apresentação por fluxo suportado, preservando pin, SHA e conteúdo histórico em sua fonte. Não dispensar a verificação. |
| Checkout e setup-node em versões diferentes                                  | Dois workflows usam revisões distintas; ações continuam pinadas                                                                                  | C7: estudar convergência compatível com o gerador. Divergência não prova vulnerabilidade por si só.                                         |
| Concurrency                                                                  | `ci.yml` já tem grupo por ref e cancelamento true; predicado exige também expressão explícita `github.workflow` para job que publica checks      | C7: tratar separação de workflow e assunto, não alegar ausência de concurrency. Preservar semântica da atestação serializada.               |
| Composite/reusable                                                           | Ausência gera REVIEW; cache existe                                                                                                               | Recomendação opcional: só extrair repetição demonstrada. Não criar abstração vazia para obter PASS.                                         |
| Frontmatter de ADR, citações de schema, registros antigos e arquivos selados | Achados suplementares históricos requerem política de compatibilidade e recuperação de fontes                                                    | C8: errata/migração aditiva ou lacuna explícita; nunca reescrever prova ou inventar encerramento.                                           |

Os três controles suplementares foram executados novamente: decisões FAIL por um ADR sem frontmatter; registros de rodada FAIL com 14 registros ausentes, 19 referências de encerramento não resolvidas e um diagnóstico de arquivo alterado; imutabilidade PASS. São predicados distintos: o PASS não apaga o diagnóstico de mutação emitido pelo outro controle. As leituras completas estão em `raw/`. Os resultados históricos da R-0036 continuam separados dos resultados atuais. Citações de schema não foram reavaliadas integralmente nesta execução: permanecem uma categoria de triagem, sem novo veredito de completude.

O workflow gerado `devai-local-rc-verify.yml` deve continuar sob o fluxo oficial de geração. Nenhum pacote autoriza edição manual do verificador protegido, cancelamento de checks obrigatórios, fallback remoto para execução local ou relaxamento do vínculo com a árvore exata.

## Reprodução, limites e validação

As entradas vêm de `law/policy/scorecard-sensor-inputs.json`, chave `inputs[kind]`. Para sensores de leitura: `pnpm exec devai sense run <kind> --input '<JSON da entrada>' --format json`. Regeneração prévia: `pnpm exec devai sense run inventory_regeneration --as-role engineer --write --format json`. Auditoria: `pnpm audit --json`. Nenhuma dessas leituras foi persistida pelo verbo `sense record`.

Resultados FAIL/REVIEW podem sair em stderr, encapsulados no campo `stdout` do envelope do runtime; os arquivos `*-readings.json.gz` extraem a leitura sem mudar seu conteúdo. Tentativas iniciais com flags de escrita inadequadas foram recusadas, e leitores executados antes da regeneração observaram entradas ausentes. Esses resultados preliminares não foram usados como medições finais; as tentativas originais permanecem no diretório temporário de captura identificado no manifesto.

Limites: análise estática não demonstra explorabilidade nem autorização efetiva de todos os fluxos; nenhum teste de integração completo, banco de produção ou nova avaliação de capacidade foi executado. O diagnóstico não certifica a saúde final da CI remota ou a prontidão de entrega. Validações e preservação estão em `validation.json`. Próxima ação: aprovar pacotes delimitados de [APPROVAL-PACKETS.md](APPROVAL-PACKETS.md), cada um em nova rodada e PR próprios, mantendo a R-0036 encerrada.
