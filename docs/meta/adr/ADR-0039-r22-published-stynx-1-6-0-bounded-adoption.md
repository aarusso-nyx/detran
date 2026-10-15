# ADR-0039: Adoção delimitada da STYNX 1.6.0 publicada em R-0022

## Status

Accepted — escopo prospectivo autorizado pelo Owner em 2026-10-12, transcrito pelo
Architect em `work/rounds/R-0022/AUTHORIZATION.md` B17. A aceitação desta decisão de
fronteira não declara a migração concluída, readiness de produção ou encerramento da rodada.

## Contexto

R-0022 em `9af7682479fd338b0c81bf56548d21b3021cdf76` mantém pin 1.5.0 e autorização
histórica restrita a 1.5.x. A STYNX publicou a release final 1.6.0 no source
`60e53ad791a4d031ab137a344fd994fe97bcb514`, tree
`9249c9325558da557f3f13170941efa2d148fdf8`, run protegido 38272270054.
A publicação contém storage consumer-owned verificável, aposentadoria outbox e
seams adicionais de offline/signature. Seus contratos ainda declaram gaps concretos
em CTG-0009; publicação não é aceite do DETRAN.

O Owner determinou continuar a adoção DETRAN em paralelo às correções STYNX 1.6.1,
sem k6/mutation e com separação de papéis. As instruções humanas exatas e suas fontes
estão em B17; esta ADR não altera a Constituição ou a authority policy materializada.

## Decisão

1. Adotar somente o grupo fixo **1.6.0 final exato** do registry após identificação dos
   bytes instalados, pela fonte única `tools/stynx-version.json`. Nenhuma dependência
   sibling ou API 1.6.1 não publicada.
2. Instalar aditivamente os artefatos renderizados pelos pacotes instalados, com
   `auth.tenants(id)`, `role_app_backend`, owner explícito e reader ausente por padrão;
   exigir verificação live read-only integralmente PASS antes do uso consumer-owned.
   Preservar `audit.*`, migrações e história; nenhuma cópia artesanal do mecanismo.
3. Preparar adapters finos e sensores reais de role/tenant/ator SQL em worktree isolada.
   Protocolos HTTP/SSE, assertions e limites DETRAN permanecem; corte de protocolo,
   transferência/congelamento de legado e ativação esperam sua paridade integral.
4. Preservar checkpoint OD-R22-02 para V-03/04/07/08/10/13 de #317. Não reparar gaps por
   parsing de mensagens, store customizado ou eventos/histórico fabricados no consumidor.
5. Preservar as decisões OD-R22-07/B5, OD-R22-08/B6 e OD-R22-66/B16. Amostra real do
   provedor e valores normativos/OIDs/âncoras/challenges aprovados são entradas externas
   ainda necessárias. PKI sintética continua somente teste e não prova compatibilidade.
6. Executar o contrato complementar D-160 e os gates retidos com Inspector/Engineer
   separados e revisão independente. k6/mutation ficam não executados, nunca PASS.
   Nenhuma autorização nova de publicação/deploy/fechamento decorre desta ADR.

## Consequências

A instalação e observações não bloqueadas avançam sem fingir uma migração completa.
Cada obrigação conserva seu estado e artefato exato em
[D-160](../../../work/rounds/R-0022/contracts/STYNX-1.6.0-ADOPTION-ADDENDUM.md).
`integration.outbox` e o protocolo offline atual seguem ativos até um corte autorizado
com prova. O checkout primário sujo e PR #179 permanecem preservados.

A linha 1.6.0 substitui prospectivamente apenas a restrição 1.5.x da rodada. A futura
1.6.1 precisa de publicação verificada e decisão de adoção própria; não é implicitamente
permitida por esta ADR. Os bloqueios de fornecedor/norma não se resolvem pela release.
