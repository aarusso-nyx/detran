# C7: reconciliação de proveniência do catálogo atual

Authority: Architect; Inspector validates exporter checks and tests.

O primeiro candidato `771d6c0c` passou pelo backend RC completo e pelo
verificador independente em `exact-commit`, mas o PR #215 foi corretamente
bloqueado por `foundation`: o catálogo atual de autorização ainda continha o
hash anterior de `portal-routes.e2e.spec.ts`. O check não foi relaxado.

O gate de geração produziu todos os sete inventários nativos na árvore limpa
`2f1303ab`, preservando seu resultado REVIEW. O exportador existente regenerou
`law/security/authorization.json`. A única diferença é o SHA-256 desse teste;
população, permissões, controles, pendências e todas as demais fontes permanecem
idênticos. O checker completo contra os três corpos nativos passou, assim como
os 68 testes de exportação. Isso não é um novo verdict nativo nem scorecard.

A tentativa de prepare anterior terminou com erro de exportação porque o caminho
da chave atravessava symlink. O receipt real de backend PASS e os controles
imutáveis foram mantidos. O exportador oficial usou os caminhos físicos da mesma
chave autorizada, sem cópia ou exposição de segredo, e o publisher oficial
publicou a prova. O verificador 39674482673 aprovou o candidato exato. Esses
resultados se referem à árvore anterior, não atestam a correção deste catálogo.
A tag protegida e o bundle anterior permanecem intactos.

A nova árvore exige RC oficial, exportação, publicação, verificação independente,
checks obrigatórios verdes e verificação pós-merge da main. Os arquivos aqui
preservam o erro de CI, comandos e resultados reais; não fabricam esses gates.
C6 continua bloqueado, sem ativação de bindings. Thresholds, históricos e rodadas
encerradas ficam preservados. R-0041 permanece ativa.
