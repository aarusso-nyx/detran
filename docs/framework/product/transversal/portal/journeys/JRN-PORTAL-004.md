---
id: JRN-PORTAL-004
title: Condutor consulta suas multas e pontuação — o momento mais frequente do PORTAL
status: draft
apps: [portal]
sources:
  [
    REF-LEI-14129-2021,
    REF-LEI-13460-2017,
    REF-DECRETO-10543-2020,
    REF-CTB-extracts-raw,
  ]
updated: 2026-08-24
---

## Persona e contexto

Josué é motorista de aplicativo, depende da CNH para trabalhar. Ele abre o PORTAL algumas vezes por
mês — não por curiosidade, mas por ansiedade: perdeu a conta de quantos pontos tem, e um colega
"zerou a carteira" recentemente sem entender como chegou lá. Este é, de longe, o serviço mais usado
do PORTAL ([REF-LEI-14129-2021] art.21 o trata como funcionalidade mínima de qualquer plataforma de
governo digital) — e o que mais gente abandona no meio, segundo o padrão observado em outros
estados, quando a tela devolve uma lista técnica em vez de uma resposta direta à pergunta real:
"minha CNH está em risco?"

## Narrativa ponta-a-ponta

1. **Entrada sem fricção.** Josué acessa "Minhas multas e pontuação" — login gov.br básico (nível
   bronze) já é suficiente; é ato de consulta, não de assinatura ([REF-DECRETO-10543-2020] art.4º,
   I, "b"). O CPF já identifica Josué sem exigir mais nenhum número de cadastro
   ([REF-LEI-13460-2017] art.10-A; [REF-LEI-14129-2021] art.28).
2. **A resposta à pergunta real vem primeiro, não a lista.** Antes de qualquer tabela de multas, a
   tela abre com uma frase objetiva: "Você tem 14 pontos nos últimos 12 meses. Sua CNH está dentro
   do limite." (ou, se próximo do limite: "Você está a 6 pontos do limite da sua categoria — veja o
   que isso significa"). A lista de infrações vem depois, como detalhe, não como a primeira coisa que
   Josué precisa decifrar sozinho.
3. **Cada multa mostra "o que eu posso fazer agora e até quando", não um status estático.** Uma
   multa em prazo de defesa mostra o botão de ação e a data-limite; uma já em recurso mostra "Em
   acompanhamento — ver processo" e linka direto para [JRN-PORTAL-003]; uma paga e encerrada mostra
   isso claramente, sem ambiguidade sobre se ainda "conta" para pontuação. Nenhuma multa aparece como
   uma linha morta de tabela — toda linha é acionável ou explicitamente diz por que não é mais.
4. **Pontuação explicada, não só contada.** Josué pode abrir "como isso funciona" e entender, em
   linguagem simples, que pontos de infrações ainda em defesa/recurso não deveriam contar como
   definitivos até o fim da instância (mesmo princípio de [RN-RAIT-131]/[REF-CONTRAN-918] art.18 —
   pontuação só é cadastrada no RENACH após esgotados os recursos) — a tela distingue claramente
   "pontos já definitivos" de "pontos em disputa, que podem não se confirmar", em vez de somar tudo
   junto e assustar Josué com um número que ainda pode mudar a seu favor.
5. **Filtro e histórico, não só o mês corrente.** Josué pode ver o histórico completo (últimos 12
   meses relevantes para o cálculo, e histórico total abaixo disso) — a mesma tela nunca esconde uma
   multa antiga que ele preferiria não ver; transparência total sobre o próprio histórico é a régua,
   mesmo quando desconfortável.
6. **Ponte natural para os outros serviços, sem sair do contexto.** Se uma multa está vencendo, o
   botão de pagar ou defender aparece ali mesmo, levando direto ao wizard de [JRN-PORTAL-001]; se
   Josué quer aderir ao SNE para reduzir ansiedade sobre "perder uma notificação", o link para
   [JRN-PORTAL-005] está ali, não enterrado em configurações.
7. **Nenhuma surpresa de CNH suspensa aparecendo aqui pela primeira vez.** Se Josué já está com a
   CNH suspensa ou em processo de cassação, essa informação não pode chegar a ele pela primeira vez
   nesta tela de consulta rotineira — o PORTAL deveria já ter notificado isso proativamente (ver
   doutrina de notificação, não busca ativa, de [JRN-PORTAL-003]); esta tela apenas confirma o que
   ele já sabe, nunca é o canal de primeira notícia de uma medida grave.

## Pontos de contato (apps/canais)

PORTAL (consulta de multas/pontuação, ponto de entrada mais frequente do produto). RAIT (fonte de
status de cada processo). SNE (canal de notificação, quando aderido — [JRN-PORTAL-005]).

## Métricas de sucesso

Tempo até a primeira resposta útil (meta: resposta direta visível sem rolagem); % de sessões que
terminam em uma ação clara (defender, pagar, aderir ao SNE) versus abandono sem ação; zero relato de
"não sabia quantos pontos tinha até ser tarde"; zero caso de CNH suspensa/cassada descoberta pela
primeira vez nesta tela em vez de por notificação proativa.
