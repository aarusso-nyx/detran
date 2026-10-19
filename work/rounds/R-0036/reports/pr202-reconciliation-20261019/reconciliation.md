# PR #202 — reconciliação de governança e evidências

## Escopo

Integração das decisões já presentes na main `a006b039ed2bc31757847e1c7230131fdeba24d3` e da avaliação `d3a0b7e48eefb68c33309c0282845a502da7bd3d`. A main avançou de `0e6589d8` para `a006b039` durante a preparação; ambas as fotografias foram retidas. Nenhuma correção de produto foi introduzida.

## ADRs e índices

- ADR-0045 da main (contrato de claim RAIT) e ADR-0046 da main (escopo e replay RAIT) conservam números e conteúdo.
- A cobertura local passa de `ADR-0045-whole-source-local-coverage.md` para **ADR-0050**.
- A adoção DEVAI passa de `ADR-0046-devai-263-measurement-repairs.md` para **ADR-0051**.
- Os caminhos antigos são redirecionamentos e têm aliases explícitos, conforme ADR-0035. Os corpos aceitos foram copiados byte a byte abaixo da proveniência. Referências no corpo histórico são desambiguadas pela proveniência e pelos aliases, sem reescrever a decisão aceita.
- Catálogos e referências vivas de R-0036 foram atualizados. Relatórios congelados, registros e backlogs históricos não foram reescritos. O estado fechado/selado de R-0033 e a evolução de R-0025 da main foram mantidos; R-0036 foi acrescentada ao índice.

## Duas histórias, sem rehash dos registros originais

As cadeias bifurcaram depois de 135 registros comuns. A main de integração tem 142 registros; a avaliação original tem 323. A união contém **330 registros originais distintos**.

A cadeia canônica continua o prefixo integral da main. A cadeia original completa da avaliação foi preservada em `scorecard-chain.json`, com bytes, hashes, identidades, contextos e predecessores originais. A main também tem fotografias exatas em `main-integration-chain.json` e `main-chain.json`; `base-chain.json` preserva a base comum. Todos os commits originais permanecem ancestrais na integração por merge.

Uma cadeia linear não pode concatenar essas bifurcações mantendo os hashes originais. Por isso, o arquivo de custódia preserva a bifurcação completa; não alega que os 323 registros foram reinseridos como observações novas na cadeia canônica.

As duas linhas originais de prova de R-0036 foram integradas cronologicamente: primeiro o commit `e9e45a4a` com a primeira linha, depois `d3a0b7e4` com a segunda. Em cada etapa o comando registrado `devai evidence record --recover-newest-line` recuperou a âncora da linha que então era a mais nova. Os bytes das linhas não mudaram. Nenhum arquivo de prova foi truncado, nenhum registro original foi editado e nenhuma lacuna histórica artificial foi declarada. Um novo registro de custódia vincula explicitamente os arquivos preservados.

## Validação

- `verify-preservation.py`: igualdade das fotografias com os objetos Git originais, 142 registros da main preservados no prefixo canônico, 323 preservados no arquivo de custódia e união de 330 originais.
- Corpos dos ADRs e decisões do Owner da main intactos; corpos das duas decisões renumeradas intactos; relatórios congelados e cadeia legada intactos.
- Arquivos de produto da main mantidos byte a byte, exceto o delta de instrumentação que já existia no PR #202; sem nova correção de produto.
- 234 testes de governança/coletores e 198 testes da suíte DEVAI aprovados (as suítes têm sobreposição; os números não são somados).
- Compilação recursiva, checagem de tipos, formatação completa, doctor, corpus legal, guardas de arquivos arquivados, ponte de orquestração, KB/publicação, índices, STYNX e âncoras aprovados.
- As 53 lacunas históricas reconhecidas continuam preservadas. Os dois N/A, os limiares e a constituição mantêm seus hashes.

A avaliação dos 43 itens continua vinculada ao commit congelado `e9e45a4a`, com seus resultados e limites originais. Esta reconciliação não declara uma nova medição do código de produto trazido da main nem prontidão de entrega. As decisões atuais do Owner continuam sendo as da main, preservadas na integração.
