# PR #218: reconciliação oficial

A cadeia canônica preserva o prefixo integral da main. As cadeias completas da main, do PR original e da base comum foram preservadas byte a byte, sem rehash dos registros históricos. ADR-0058 e ADR-0059 são preservados com números e corpos originais.

O commit original d3560616 contém de uma só vez a linha test 1 e as linhas generic 1 e 2. Este novo checkpoint de reconstrução restaura exclusivamente os bytes da linha test 1 e do prefixo generic 1, extraídos dos blobs originais. Não representa um commit histórico nem uma nova execução de testes. As épocas originais completas estão arquivadas neste pacote. Após a recuperação oficial das primeiras âncoras, o merge do commit original acrescentará a linha generic 2; sua âncora será recuperada pelo mesmo verbo oficial. Nenhuma linha previamente presente neste ramo é truncada. Todos os commits originais serão ancestrais do resultado.

Não foram alterados thresholds, N/A, bindings nativos de C6, decisões da main, relatórios congelados nem rodadas encerradas. C6 permanece bloqueado. O pacote contém apenas resolução de conflitos, restauração fiel e custódia; não declara novas medições ou prontidão de produto.

A primeira união textual dos índices foi recusada por verify:state-index. A resolução foi refeita a partir do conteúdo integral da main, acrescentando somente as linhas ADR-0059 e R-0043 originais. O gate passou sem alterações no verificador ou nos ADRs. O diagnóstico inicial permanece no recibo operacional externo.
