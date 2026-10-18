# JW-01 — browser smoke local, primeiro recorte

Engineer/Inspector, 2026-10-18. Browser Playwright real sobre a prévia estática
reconstruída após D-23, `http://127.0.0.1:55038`. Não é prova de IdP, backend ou
qualificação jurídica; as 40 provas HTTP/DB e os testes roteados são recibos
separados. Nenhuma configuração de máquina foi alterada para esta sonda.

- Caso canônico `00000000-0000-7000-8000-000010000002`, rota triagem,
  papel analista: título e página corretos, três critérios humanos editáveis,
  tempestividade somente leitura e campo Base legal presentes.
- Três respostas Sim e Registrar triagem: UI mostra Indisponível nesta versão;
  nenhum request `/v1/` observado. A prévia não executa a escrita real.
- Mesmo caso com pv_estado loading, error, forbidden e empty: página permanece
  acessível pelo controle de existência; estados correspondentes observados.
  Error foi observado após aguardar o estado assíncrono final, não no loading
  transitório. Zero recursos `/v1/` em cada navegação.
- ID inexistente `00000000-0000-7000-8000-999999999999`: navegação recusada,
  URL final `/`, sem página de triagem e zero requests `/v1/`.
- Rede não estática observada: somente GET assets/preview/rait-fixtures.json 200.

A prévia mantém dados fictícios e escrita indisponível; não se declara a jornada
JW-01 completa, nem operação autenticada por IdP real ou escopo individual no
mesmo tenant (OD-R25-017). Smoke funcional browser contra banco em andamento; observação inicial abaixo.

## Primeira observação do stack compilado — RED reproduzido

Backend compilado 58485 + app development 58486 por proxy. Sessão sintética
semeada em memória no serviço STYNX real; guards e interceptors reais ativos.
Sem IdP real. GET do caso PROTOCOLADO/version1 respondeu com ETag genérico
`W/"38d-PzpxKQT/j5jeiSMYVjnaHfNLb9s"`; o primeiro F01 enviou esse valor e recebeu
412 RAIT.VERSION_CONFLICT/currentVersion1 (requestId
01a15045-956a-738e-ac6b-f3ecffc867c6). Nenhuma transição foi afirmada como PASS.
A UI exibiu erro unknown porque ErrorInterceptor do kit converte HttpErrorResponse
em SDK error, enquanto o classificador local só reconhecia a primeira classe.
RGR para Architect/Inspector/Engineer aberto para os dois limites de integração;
mock de GET com ETag numérico e testes sem a cadeia DI não haviam observado isso.

## Segunda observação — escrita real e atualização visual pendente

Após token de comando CASE.version e identidade SDK pública, o browser real
executou F01 (version1→2), três saves (→5), assinatura false e três saves (→8),
assinatura true e três saves (→11). Os quatro registros persistidos, incluindo
tempestividade do servidor, acompanharam as respostas sem replay indevido.
Admit confirmou HTTP200 e o banco passou a ADMITIDO/version12. A página, porém,
permaneceu TRIAGEM_ADMISSIBILIDADE/version11: invalidation sem consumidor SSE
não atualiza o snapshot. Este resultado é RED para a atualização visual; não
se relata o smoke funcional como PASS. Inspector/Engineer corrigem os dois
confirmadores admit/reject para recarregar somente após sucesso, com sensores
roteados antes do código. Cancelamento e erro não podem causar escrita extra.

## Reexecução funcional final — PASS delimitado

App development 58486, backend compilado 58485, Postgres descartável 58483.
Mesma sessão sintética no serviço STYNX real; guards/interceptors/HTTP/DB reais.
Sem dispatcher SSE como condição de sucesso.

- Admissão: F01 PROTOCOLADO1→TRIAGEM2; saves→5; assinatura true→false→true,
  saves→8→11, sem sucesso antigo reaproveitado. Confirmação admit HTTP200,
  response ETag `"12"`, requestId `01a15059-ef7c-7473-ae92-0ef36bfd95aa`.
  UI ADMITIDO/version12, command done, botão de salvar triagem ausente.
  Consulta owner somente leitura confirmou ADMITIDO|12.
- Rejeição: reset completo exclusivo da fixture (incluindo ledger) com backend
  parado, restart e leitura real PROTOCOLADO1. F01, três séries de saves com
  fundamentos humanos preenchidos; assinatura false e motivo sem_assinatura.
  Texto legal sintético fornecido pelo operador, não inferido pelo app.
  Confirmação non-admission HTTP200 (request149), UI NAO_CONHECIDO/version12,
  command done, botão de salvar ausente. Banco confirmou
  NAO_CONHECIDO|12|sem_assinatura. Três séries de saves explicam version12.
- Console: quatro erros de configuração OIDC anteriores à sessão sintética;
  restart deliberado do backend entre cenários gerou14 erros de conexão enquanto
  indisponível. Após restart/read bem-sucedida, nenhum novo erro nas ações finais.
  Não se declara console global sem erros, nem autenticação IdP real.
- Validação de forma foi observada: rejeição sem fundamentos dos três critérios
  não abriu confirmação; preenchê-los permitiu a confirmação canônica. Catálogo
  base do kit ainda exibe ui.confirmDialog.cancel, follow-up preexistente do
  backlog; não impede a operação deste recorte.

Snapshots/console da execução preservados no recovery local do checkout primário;
manifesto de preservação acompanha este relatório. Estes resultados provam apenas
admissibilidade local, não claim/instrução/minuta, JW-01 completa, isolamento
individual intratenant ou encerramento da rodada. Gates globais têm recibo separado.
