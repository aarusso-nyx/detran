# Prompt corretivo — CTG-0004a, mobile de homologação

Papel constitucional: **Architect → Inspector → Engineer → Reviewer**, em passagens
separadas. Este prompt sucede TASK-0010–0013 somente para o trabalho ainda aberto; seus
relatórios, revisões e hashes originais são evidência histórica, não autorização para
reescrever o passado. Ler `AGENTS.md`, `CODESTYLE.md`, `plan.md` desta rodada,
ADR-0028–0033, `docs/framework/arch/teat-mobile-contract.md`, matriz mobile,
`journeys.json` e os testes pertinentes antes da alteração. Siblings e `record/**` são
somente leitura para workers; o maestro controla Git, evidências e integração.

## Meta e fronteira

Entregar `apps/teat/mobile` como build de homologação de **UI e workflows** Android.
Preservar 70 fichas/rotas, 576 transições, formulários, papéis, acessibilidade, estados,
erros e fluxos de abertura de turno, AIT, offline e sincronização **demonstrados**. A
trilha de homologação precisa ser explicitamente selecionada e visivelmente marcada,
com identidades e dados sintéticos segregados. Não alegar que a build é de campo nem
que GMS820, embora homologado como equipamento, já tenha sido integrado a ela.

O contrato define portas separadas e tipadas para homologação e produção. Fixture de
homologação pode simular localização, assinatura, catálogo, número e recibo apenas para
percorrer UI; deve ser identificada como sintética e incapaz de escrever ou sincronizar
atos reais. No caminho produtivo, ausência de prova E2, localização real, regras AIT
executáveis e serviços oficiais continua bloqueante. Não introduzir fallback implícito
de fixture. O perfil de ADR-0032, incluindo 15 min/1 h e advertência de pacote vencido,
permanece requisito do futuro round, não um positivo produtivo fictício nesta rodada.

## Execução por papel

1. **Architect:** adendar contrato mobile com modo, limites, portas, mapa de jornadas,
   nomenclatura de conclusão demonstrativa e matriz positivo-homologação/negativo-produção.
   Não alterar política do Owner nem converter documento `draft` inteiro em fonte.
2. **Inspector:** primeiro criar/ajustar REDs correspondentes, justificando cada oráculo
   antigo afetado. Provar seleção explícita, marca visual, dados sintéticos, ausência de
   emissão/sync/impressão oficial, falha fechada no modo produtivo e os seis casos AIT
   atualmente RED. Manter oráculos de rotas/transições/roles; zero skip/todo novo.
3. **Engineer:** implementar apenas as portas e UI contratadas até os testes congelados
   passarem. Não editar specs, não codificar segredos e não substituir guard produtivo
   por fixture. Exibir ao usuário que uma conclusão é somente demonstração.
4. **Reviewer independente:** verificar contratos, diff, testes e gates no SHA exato;
   PASS estreito anterior não substitui esse veredito.

## Critérios de aceitação

- `pnpm --filter @detran/teat-mobile lint`, `typecheck`, `test`, `build` e `pnpm check`
  terminam com código 0, sem skips/todos novos; seis REDs AIT resolvidos por oráculos
  honestos da homologação e preservação de negativos produtivos.
- 70/70 rotas/fichas, 576/576 transições, matriz cartesiana de papéis e a11y permanecem
  verificáveis. Jornada AIT demonstrativa chega à tela final sem emitir AIT real; falhas
  dos ports mostram erro/recuperação; produção sem provas permanece bloqueada.
- Inventário do build e testes provam que fixtures/identidades sintéticas não são
  selecionadas silenciosamente no modo produtivo e nenhum segredo está no repo/bundle.
- Relatório separa `PASS homologação`, `RED produção postergado` e evidência, com links
  para as issues de produção. Nenhum PASS de homologação é rebatizado como PASS E2/AIT real.
