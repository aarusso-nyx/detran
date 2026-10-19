# C2 — ferramentas e Angular: entrega do Engineer

Escopo: manifests e lockfile, na R-0038. Base informada pelo maestro: `92be0db44f9cc111ec9369f2fb81c5f6bd1efa1c`. Nenhuma alteração de aplicação, testes, thresholds, configuração DEVAI, provas ou arquivo histórico foi feita pelo worker. Este relatório não encerra rodada nem backlog.

## Resultado observado

A auditoria completa `pnpm audit --json` tinha **26 entradas de advisory / 27 ocorrências** (2 críticas, 12 altas, 10 moderadas, 3 baixas). Depois da resolução mínima: **zero entradas e zero ocorrências**, sem advisory novo. Os JSON completos estão compactados sem truncamento em `audit-before.json.gz` e `audit-after.json.gz`; `audit-comparison.json` enumera os IDs removidos. Os números representam o banco de advisories consultado nesta execução, não prova de ausência universal de vulnerabilidades.

Foram mantidos os seis overrides do C1 e os pins STYNX 1.5.3, DEVAI 2.6.3, TypeScript 6.0.3 e Node 24. Não foi utilizado audit fix, override global, --force, alteração de peer range, nem atualização de provedor/plataforma.

## Resolução e compatibilidade

- Framework Angular: common, core, compiler, compiler-cli, forms, platform-browser, router e service-worker 22.1.6 → 22.2.0, de forma consistente nos sete consumidores. Os peers exatos do framework exigem essa sincronização. O peer STYNX é `>=22.0.0 <23`; ng-packagr 22.1.1 aceita compiler-cli `^22.0.0`. Node 24.22.0 satisfaz o requisito Angular 22.2.0 `^24.15.0`.
- CLI e builder permanecem 22.1.6: seus peers aceitam Angular 22.x; não foi necessário absorver suas dependências de 22.2.0. Essa escolha limita a alteração e será validada nos builds reais.
- Piscina 5.2.0/5.3.1 → 5.3.2, limitado aos pais Angular build22.1.6 e ng-packagr22.1.1.
- Undici7.29.0 → 7.29.1 em jsdom29.1.1; MCP SDK1.30.0 → 1.31.0 em Angular CLI22.1.6.
- js-yaml4.3.1 → 4.3.2 em redocly/openapi-core1.34.19; fast-uri3.1.6 → 3.1.8 em ajv8.20.0.
- brace-expansion2.1.4 → 2.1.7 nos minimatch5.1.9/9.0.9; 5.0.9 → 5.0.12 no minimatch10.2.6.
- source-map-js1.2.1 → 1.2.2 nos cinco pais/versionamentos realmente presentes (css-tree, magicast, postcss e duas versões de sass).
- qs6.15.3 → 6.16.0 em superagent10.3.0, completando o caminho de ferramenta de teste que C1 deixou separado.

As versões corrigidas foram verificadas diretamente no registro público npm. `fixed-registry.json` preserva versões, dependências, peers, engines e integridade publicados. `installed-platform-peers.json` registra os peers dos cinco pacotes STYNX Angular realmente usados, sem depender de nomes hipotéticos de pacotes.

O delta do lock remove 18 versões vulneráveis/antigas e adiciona 16 versões corrigidas; duas versões de piscina convergem e qs6.16.0 já existia pelo C1. Não há pacotes adicionais alheios à árvore vulnerável. Os sete importers alterados são somente os consumidores Angular. Override de pai/versão não força automaticamente futuras versões dos pais.

## Exposição do router

Os cinco `angular.json` de aplicações configuram builder application sem server/ssr/outputMode server, e nenhum manifesto deste sublote declara @angular/ssr. Isso reduz a evidência de exposição ao cenário SSR do advisory; não substitui inventário operacional nem permite afirmar inexistência de implantação SSR externa. A versão vulnerável foi removida mesmo assim.

## Validação e limite da medição nativa

A instalação com lock congelado passou, inclusive uma segunda confirmação sem alterações. Todos os 27 comandos dos sete consumidores passaram: typecheck, lint onde existente, testes e build. As bibliotecas UI e BOAT foram construídas antes dos consumidores. Também passaram DEVAI (198 testes), law (56), pin STYNX (oito testes e verificador), contratos (329 operações e 72 clientes), app backend unit (144 testes) e formato dos nove arquivos de dependência. Os logs completos, sem truncamento, estão compactados e enumerados em `validation-results.json`.

Resultados das suítes: UI2, BOAT15, Portal1551 (+14 TODO preservados), Dashboard2042, TEAT-mobile1172, TEAT-web611, RAIT5115 (+133 TODO preservados) e backend app144. Os sete consumidores somam 10.508 testes aprovados e 147 TODO explícitos; estes não contam como aprovação. Não houve reescrita de teste, nova exclusão ou relaxamento de assertions. Os avisos de canvas do jsdom permaneceram registrados; não provocaram falhas.

A tentativa nativa `sense run security_scan` foi recusada **antes de executar a auditoria**, com `SENSE_INSTANCE_CHAIN_DIGEST_MISMATCH:SR-0633d2afcf0126e7`. Os envelopes e código 3 foram preservados. A auditoria npm independente é positiva; não se declara PASS nativo, não se editou a cadeia de instâncias, não se persistiu leitura e não se tentou contornar a validação. O maestro diagnosticou colisão do store local: o ID legado SR-0633d2afcf0126e7 tem um artefato local antigo e outro referenciado pela cadeia atual, proveniente do worktree do C1. Nenhum deles foi alterado. Uma nova leitura em worktree de validação limpo, após congelar o commit, ficará a cargo do maestro; este worker não assume o resultado dessa execução futura.

Todos os demais pacotes C3–C8 e quaisquer correções incidentais de produto estão fora das alterações deste worker. R-0036 continua fora do escopo de escrita.
