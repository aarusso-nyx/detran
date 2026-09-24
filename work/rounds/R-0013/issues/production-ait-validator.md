## Objetivo

Implementar o validador agregado AIT V01–V11 de produção, local e backend, sem
substituir decisão normativa por fixture de UI. Escopo adiado de CTG-0004a/R-0013;
round produtivo dedicado posterior (R-0017 apenas candidato).

## Escopo e autoridade

ADR-0030 aprova a matriz V01–V11 no recorte expresso; ADR-0032 aprova uma DSL JSON
fechada e suas semânticas residuais. Não promove documentos `draft` inteiros.
Publicar catálogo/fichas versionados exatos, identificadores, paths tipados,
operadores, ausência/null, condições, ordem, severidades e códigos estáveis; bind
ao ID/versão/hash do manifesto assinado. Projetar fatos de local/data/UF,
abordagem/flagrante, pessoa/ciência, veículo/confirmador, evidências/custódia,
competência assinada, enquadramento e relação factual V10. Separar art. 165 de
165-A; nenhum mínimo universal de foto inventado.

## Critérios de aceite

- [ ] Fontes e rows normativas exatas aprovadas, assinadas, versionadas e
      rastreáveis; regra desconhecida, tipo inválido ou hash divergente bloqueia.
- [ ] DSL fechada publicada com schema e test vectors por V01–V11, cada ramo
      positivo/negativo, inclusive ausência/null e validade temporal.
- [ ] Avaliador puro local e verificador backend produzem mesma lista ordenada de
      blockers/warnings no mesmo agregado e pacote; testes diferenciais provam isso.
- [ ] Sem inferir falta de flagrante de `had_approach=false`, mesma ocorrência de
      proximidade, ciência de pessoa ausente ou regra 165-A da 165; competência e
      duplicidade usam provas/identidade verificáveis.
- [ ] `ait-review` só autoriza conclusão produtiva após validação do agregado
      inteiro, com erros rastreáveis; fixtures de homologação não alcançam essa porta.
- [ ] Gates completos, review independente e evidência de versão/digest passam.

## Dependências

Catálogo normativo institucional, E2/trust, dados tipados/backend e lifecycle
transacional em issues irmãs. O R-0013 pode demonstrar UI com dados sintéticos
claramente marcados; isso não fecha esta issue.
Gate de campo dependente: [#112](https://github.com/aarusso-nyx/detran/issues/112).
