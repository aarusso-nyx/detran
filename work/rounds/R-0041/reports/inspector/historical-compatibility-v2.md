# C8 — revisão independente Inspector v2: dois appends exatos

Resultado: **24 testes aprovados**, sem skips/TODO. A mudança do contrato justificou a repetição completa da suíte: fonte, manifesto e fixtures agora contemplam somente duas transições literais. O relatório, o log e os hashes da execução anterior de 19 testes não foram reescritos; os arquivos v2 registram esta nova execução separadamente.

As fontes exatas são R0037, uma para duas linhas, do commit `173ab167ad39e314f5e2d7eaea84bab27a162a52`, e R0025, quatro para seis linhas, do commit canônico de main/PR205 `2e04f29c864cc3cdb3e73d4ec0de995e67214db7`. As duas fontes foram lidas por Git em modo somente leitura e aplicadas apenas às cópias temporárias aceitas. Nenhum proof real foi copiado, reconstruído ou alterado pelo Inspector.

Além dos controles anteriores, os novos testes verificam a aceitação dos seis registros autênticos de R0025, a preservação byte a byte de suas quatro linhas originais, a recusa de fonte/autoridade falsificadas, prefixo alterado, sétima linha desconhecida, retorno à versão antiga de quatro linhas, slots ausentes ou trocados, fonte autêntica aplicada ao slot errado e qualquer stream/terceira exceção desconhecida. A positiva completa mantém todos os 1.073 arquivos de referência, as duas cadeias, R0036 encerrada e todos os findings/gaps explícitos.

O teste da árvore real exige que cada stream tenha exatamente o hash aprovado ou o hash original; uma terceira variante nunca é aceita. Quando algum append ainda não está integrado no checkout, exige a recusa `APPEND_CURRENT_HASH_UNAPPROVED`. Essa negativa verde no teste não transforma o checkout em uma integração aprovada: o CLI de produção deverá passar depois de receber as duas fontes pelo fluxo oficial.

A fronteira continua suplementar: nenhuma leitura nativa emitida, nenhum veredicto nativo substituído, nenhuma mutação histórica ou registro ausente dispensado e nenhuma cauda nova da cadeia validada por este mapa. A cauda não verificada permanece explicitamente dependente de verificação nativa.

Para reprodução limpa são necessários os objetos Git da baseline `92be0db44f9cc111ec9369f2fb81c5f6bd1efa1c` e dos dois commits autênticos acima. O banco comum local contém todos; um checkout raso não é substituto. O job de CI deve carregar o histórico/fontes exigidos e executar também o checker de produção. Não se introduziu fallback ou dispensa de fonte quando um objeto faltar.

O Inspector alterou somente seu arquivo de testes e estes novos relatórios/logs/hashes v2. Nenhum controle de produção, threshold, Git, estado, prova ou arquivo histórico foi modificado pelo Inspector. A versão anterior permanece como observação do contrato anterior, não como aprovação desta versão nova.
