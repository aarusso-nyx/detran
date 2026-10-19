# Verificação de autor dos contratos e do checker C3/C4

Papel Inspector na execução dos contraexemplos, mas este mesmo worker escreveu os schemas e o checker. Portanto, os resultados abaixo são **verificação de autor**, não revisão independente. A aceitação independente cabe ao maestro/revisor de outra instância.

Foram executados 16 testes do CLI real, todos aprovados, sem skips/TODO: snapshots canônicos, modo explícito snapshots-only, ausência/combinação inválida de entradas, reprodução dos dois exportadores com três corpos de fixture, tipos inválidos, propriedades adicionais, falso runtime proof, conclusão legal inventada, endpoint omitido/duplicado/com coordenada antiga, divergência entre modelos SQL/PII, metadados nativos ausentes, digest adulterado, predicado adulterado, bytes de fonte alterados e população inconsistente.

As fixtures são sintéticas e temporárias, com fontes de controle copiadas para diretórios descartáveis. Nenhuma delas é leitura nativa ou evidência de produto. Os arquivos reais de snapshot, fonte, história e governança permaneceram somente para leitura. O log completo e os hashes dos arquivos examinados acompanham este relatório.

Separadamente, os 15 testes preexistentes dos exportadores passaram. A reprodução completa contra os três corpos históricos declarados pelo worker de C3/C4 também passou; isso não declara nova produção nativa da árvore atual. `verify:law-corpus` e a formatação dos quatro arquivos de integração passaram. Nove sondas exploratórias adicionais rejeitaram mutações de schema, sem contá-las como testes persistentes.

O modo sem entradas recusa executar; snapshots-only informa literalmente que a regeneração nativa não foi executada. O checker completo precisa receber os três caminhos explícitos de um produtor autêntico. Não foi ligado automaticamente a um produtor ausente ou a um caminho privado ancestral.

O script de teste precisa incluir também `*.test.mjs` na integração do maestro; o worker Inspector não alterou `package.json`.
