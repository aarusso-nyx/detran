# ADR-0025: Composição explícita do Clock de operação do RAIT

## Status

Aceita pelo Owner em 2026-09-16 (OD-R7-CLOCK-001), para preparação e
implementação pelo ciclo governado. O registro não libera gates nem declara
o provider implementado.

## Contexto e autoridade

O recorte C4 de CTG-0001 em R-0007 necessita de um ponto explícito de composição
do Clock de produção. A fronteira anterior de cinco providers não acomodava
essa dependência. O Owner aprovou a recomendação do sexto provider na sessão
de 2026-09-16, junto com a política de prioridade registrada em ADR-0024, e
solicitou o registro e a preparação do ciclo corretivo delimitado.

## Decisão

- Autorizar um sexto provider explícito de Clock de produção, registrado no
  blueprint e materializado pela geração oficial, conforme ADR-0007. Não editar
  manualmente o módulo gerado.
- Injetar o Clock na factory; capturar um único instante por operação.
- Derivar desse instante o dia civil no fuso IANA do tenant.
- Usar o mesmo snapshot temporal no motor e nos comandos da operação.
- Ausência do provider ou fuso inválido deve falhar antes de qualquer escrita.

## Consequências e fronteira

O ciclo corretivo deve reconciliar a allowlist e a matriz de bindings/DI negativa
com seis providers, substituindo explicitamente o piso anterior de cinco, com a
injeção na factory e a origem do fuso do tenant. O contrato
e os testes devem tornar verificáveis o instante único, a derivação do dia civil,
a reutilização do snapshot e a falha anterior à escrita.

Esta decisão autoriza a fronteira arquitetural adicional. Não cria dependência
de outro pacote de Clock, não escolhe fallback de fuso e não altera os requisitos
de tenant/RLS. A implementação e a geração permanecem sujeitas aos gates e à
separação de papéis do ciclo corretivo; esta preparação é documental.

## Referências

- [ADR-0007](ADR-0007-regenerable-blueprints.md).
- [ADR-0002](ADR-0002-unified-backend-modular-monolith.md).
- [BP-INF-RAIT-CASE-001](../../framework/blueprints/BP-INF-RAIT-CASE-001.json).
- Campanha R-0007, CTG-0001 C4, ciclo corretivo de TASK-0023.
