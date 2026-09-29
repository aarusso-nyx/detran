# Decisão do Owner — A1-3 de R-0020

**Data:** 2026-09-29. **Papel decisor:** Owner. **Escopo:** destino do CTG-0004 enquanto a correção DEVAI de `sense record` → `audit scorecard` não estiver em uma versão publicada e pinada.

Após a apresentação da proposta Architect `contracts/CTG-0004-A1-proposal.md`, que recomenda a opção **B** em A1-3, o Owner respondeu nesta sessão:

> sim, adoto a sua recomendação

Fica adotada **A1-3 = B**: o critério original de scorecard com pelo menos quatro células `PASS` reais continua gate de merge do CTG-0004. Aguardar um verbo DEVAI corrigido em versão publicada, atualizar o pin por decisão e procedimento governados e medir as quatro células no candidato. CTG-0005/0006 e o fechamento integral de R-0020 permanecem seriais depois do merge do CTG-0004. A opção A, que admitiria mesclar CTG-0004 com o critério não cumprido, não foi adotada.

O commit `268bb83835e52d05f0932fd8f04d64e4b47104d5` no `main` do DEVAI (2026-09-27) altera o scorecard para consultar o depósito de leituras de `.devai/state/sensor-readings`, mas a release mais recente verificada em 2026-09-29 é `v1.6.0` (2026-09-26), anterior à correção. Esta observação é fonte de planejamento, não autorização para consumir código não publicado nem para alterar o pin.

Este aceite resolve somente A1-3. A1-1 (piso e células específicas) e A1-2 (membros de CI e consentimentos de escrita/delegação) foram consultadas separadamente e aguardam resposta expressa. Nenhum `devai --write` de sensores ou mudança no CI decorre deste recibo.
