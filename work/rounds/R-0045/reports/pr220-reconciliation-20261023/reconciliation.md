# PR #220 — reconciliação oficial

A cadeia canônica conserva o prefixo completo da main após #219. As cadeias originais da main, do PR e da base foram preservadas byte a byte, sem rehash. Os commits 6da7ef28 e 0ecb6943 foram integrados em ordem, recuperando cada âncora pela operação oficial recover-newest-line enquanto sua linha era a última da época. Os commits originais continuam ancestrais; nenhuma linha foi truncada ou reescrita.

O resultado corrente original é 1.368 → 2 erros e 1 → 0 avisos; não é zero lint. As duas declarações não usadas ficam na suíte Portal congelada, cujo SHA-256 original permanece 6378dbcf29b3723f13ae478ff874e23ef184fdd65cc5be731e76d50716b2fa34. Os relatos anteriores de zero e as recusas subsequentes continuam históricos, com suas limitações; a custódia não é nova medição.

As correções de CI já pertencentes ao PR, a literalidade do gerador, assertions e contratos foram preservados. Nenhuma correção incidental foi adicionada. Thresholds, histórico legado, decisões da main, rodadas encerradas e bindings nativos permanecem intactos. C6 continua bloqueado.
