# Autorização do Owner — preflight de compatibilidade dos sensores

**Data:** 2026-09-29. **Papel decisor:** Owner. **Rodada:** R-0020. **Escopo:** recomendação metodológica apresentada no relatório anterior da rodada.

O Owner respondeu: “proposta aceita. prossiga ate o fechamento d round”. A proposta aceita foi **testar a compatibilidade entre o registry, os presets e o schema DEVAI antes de despachar o Engineer de sensores**. O preflight deve ler as três fontes efetivamente instaladas, conferir a população completa de cada preset e verificar que todo kind selecionado é permitido pelo enum de `SensorReading.sensor.kind`; ele falha com diagnóstico específico se as fontes divergirem. Os 49 membros `read` de `sweep` não podem ser reduzidos para obter verde.

O aceite autoriza contrato, caracterização Inspector, verificador determinístico de leitura e inclusão do preflight na sequência de despacho da TASK-0013. A versão DEVAI 1.5.6 atualmente pinada deve produzir **FAIL real** para os quatro kinds ausentes; esse resultado não é falha do teste. A execução Engineer só retoma depois de fonte DEVAI corrigida, publicada, pinada e preflight verde.

Este aceite não altera A1-3=B: quatro células `PASS` reais continuam gate de merge CTG-0004. Não responde A1-1 nem A1-2, não autoriza `sense run|record --write`, `--publish`, delegação em CI, mudança de pin ou edição do repositório DEVAI. O RGR TASK-0013 e os gates originais permanecem vinculantes.
