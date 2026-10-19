# C1 — dependências de execução de BL-0013

Execução autorizada pelo Owner em 2026-10-19, somente C1. Rodada nova R-0037, ativa; branch `codex/c1-runtime-dependencies-r0037`. Sem integração ou release. Candidato de implementação: `3272521de5c11dadb6071f769078c922cb58d78e`, baseado em `2df548e0ac5227abb64b66994f675dea7ba36a5a`.

## Resultado

As dependências vulneráveis dos caminhos de execução de C1 foram substituídas por versões corrigidas, sem alterar código de aplicação, testes, DDL, permissões ou contratos públicos. STYNX continua 1.5.3 e DEVAI 2.6.3.

| Ocorrências reportadas | Antes | Depois |
| --- | ---: | ---: |
| Críticas | 5 | 2 |
| Altas | 15 | 12 |
| Moderadas | 13 | 10 |
| Baixas | 4 | 3 |
| Total | 37 | 27 |

Foram removidas dez entradas de advisory e não surgiram entradas novas nesta comparação: 36 → 26 entradas distintas; o total de ocorrências inclui duas versões de piscina para um mesmo advisory. Os dois números não são a mesma unidade. A auditoria de referência é a captura integral do diagnóstico em main `2df548e0`; a auditoria posterior foi executada novamente no candidato de implementação.

O `security_scan` nativo continua **FAIL**, com `pass_max_high=0` e `review_max_high=5` preservados. A leitura foi persistida pelo verbo oficial `sense record`; sucesso de persistência não transforma FAIL em PASS. BL-0013 permanece aberto. Não há alegação de segurança integral do monorepo, exploração confirmada ou readiness promovida.

## Resolução delimitada

| Pai e versão | Dependência anterior → atual | Justificativa |
| --- | --- | --- |
| `@stynx-nyx/pdf@1.5.3` | handlebars 4.7.9 → 4.7.10 | Manifest publicado fixa a versão vulnerável; patch preserva a família 4.7 e os contratos testados. |
| `@nestjs/platform-express@11.2.1` | multer 2.2.0 → 2.4.0 | Manifest publicado fixa a versão; correção mínima que cobre todos os advisories encontrados. |
| `express@5.2.1` | proxy-addr 2.0.7 → 2.0.8 | Patch da mesma família, sem modificar trust proxy ou configuração de produto. |
| `express@5.2.1` | qs 6.15.3 → 6.16.0 | Corrige o parser do caminho HTTP. |
| `body-parser@2.3.0` | qs 6.15.3 → 6.16.0 | Corrige o parser indireto do mesmo caminho HTTP. |
| `pino-pretty@13.1.3` | fast-copy 4.0.4 → 4.1.0 | Corrige a dependência do logging publicado, mantendo o pai e seu contrato. |

São seis overrides de aresta pai/versão, sem override global. Apenas `package.json` e `pnpm-lock.yaml` mudam em F2. Os importers são idênticos à base; nenhuma dependência direta ou binding de ferramentas de outro pacote foi atualizado. O relatório `lockfile-scope.json` lista integralmente as cinco versões novas, as antigas removidas e as seis transitivas que o multer deixou de usar. Nenhum snapshot alheio aos cinco pais acima foi modificado.

O gerador tentou selecionar outros contextos de peers do Vitest em dois importers e um snapshot durante a resolução; esses contextos foram restaurados aos bytes da base antes da instalação congelada final. A instalação final validou a resolução preservada. Não houve atualização de Angular, piscina, undici, SDK MCP, fast-uri, js-yaml, brace-expansion ou source-map-js.

As substituições ficam explicitamente limitadas às versões atuais dos pais. Na próxima atualização autorizada desses pais, revisar o advisory e remover ou adaptar a aresta após nova validação; não ampliar automaticamente o seletor.

## Resíduos e fronteira do pacote

Não restaram advisories críticos/altos das cinco famílias tratadas. `qs@6.15.3` continua com dois advisories moderados sob `supertest → superagent`, em ferramentas de teste; Express e body-parser já resolvem 6.16.0. Esse caminho não foi alterado para evitar expansão ao C2.

As demais ocorrências residuais pertencem a ferramentas e ao router Angular: duas críticas de piscina, mais advisories de Angular/router, undici, MCP SDK, js-yaml, fast-uri, brace-expansion e source-map-js. O agrupamento não implica que todo caminho seja impossível em execução; a exposição SSR do router continua não demonstrada. O arquivo `dependency-audit-comparison.json` preserva cada advisory residual, URL e amostras dos caminhos. Os dois relatórios completos estão arquivados em gzip, sem truncamento.

## Validação

- Instalação `--frozen-lockfile`, pin STYNX, build canônico `pnpm build` e typecheck da aplicação: PASS.
- Suíte unitária existente do app, incluindo runtime e documentos BOAT: 144 testes em 25 arquivos, PASS.
- DDL completo e fixtures oficiais em PostGIS descartável, imagem pinada pelo fluxo do repositório; request path com `role_app_backend`. Dois arquivos E2E de runtime/trust profiles: 13 testes, PASS. Contêiner removido ao final.
- Cinco sondas temporárias de compatibilidade: escape handlebars, cadeia de proxy confiável, cópia profunda, formulário URL-encoded e upload multipart limitado: PASS. Código da sonda e saída arquivados apenas neste relatório; nenhum teste de produto foi alterado.
- Doctor, índices de rodadas/estado, guarda de arquivo, âncoras/provas, KB e publicação simulada: PASS nas execuções locais registradas.
- Não foi executado um novo RC local completo nem emitida atestação. CI remota deve avaliar o HEAD final do PR; os resultados locais não a substituem.

Foram preservadas tentativas preliminares: falha HTTP contra banco local sem tabela, reset recusado por nome não autorizado e erro de leitura de metadata na primeira sonda. O ensaio correto usou ambiente descartável e os controles oficiais. Não houve correção incidental de produto para resolver essas falhas de execução.

## Preservação e evidência

`preservation-baseline.json` registra os hashes anteriores; `preservation-result.json` confirma igualdade dos arquivos históricos protegidos. R-0036 continua fechada em PC-0022, sua avaliação congelada não foi recalculada e o backlog BL-0013…BL-0023 não foi alterado. Thresholds, configuração, pin, cadeia legada e todas as linhas antigas de prova permanecem intactos. O índice humano de rodadas recebeu somente a linha R-0037.

A cadeia governada recebe apenas apêndices pelos verbos oficiais, com o prefixo histórico preservado. A nova leitura FAIL foi registrada no candidato de implementação; o relatório e as capturas recebem prova genérica da R-0037, sem alegação de aceitação de produto ou encerramento da rodada.

Os hashes de `package.json` e `pnpm-lock.yaml` no manifesto delimitam a resolução testada. Os testes ocorreram com esses mesmos bytes antes do commit de implementação; as novas auditorias identificam esse commit. O manifesto não é uma atestação assinada nem prova de que a CI final já terminou.

Próxima ação: revisar o PR de C1 e seus checks. Integração, encerramento da R-0037 e execução de C2–C8 não foram autorizados por esta aprovação.
