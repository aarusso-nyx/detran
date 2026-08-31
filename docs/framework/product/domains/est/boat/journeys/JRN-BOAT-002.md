---
id: JRN-BOAT-002
title: Sinistro sem vítima entre particulares — autocomposição, registro rápido e croqui antes de liberar a via
status: draft
apps: [boat, teat]
sources:
  [
    'REF-CTB-sinistro-cena-renaest',
    'REF-CONTRAN-808-2020',
    'RN-BOAT-002',
    'RN-BOAT-004',
    'UC-BOAT-001',
    'UC-BOAT-002',
    'UC-BOAT-004',
    'WF-BOAT-001',
  ]
updated: 2026-08-24
---

## Persona e contexto

Igor é field-agent, meio da tarde, calor de 34°C, numa avenida de tráfego intenso na zona Centro-
Sul de Manaus. Uma batida traseira simples entre dois carros de passeio — sem vítima, os dois
condutores já desceram, trocaram dados entre si e um deles até sugeriu "resolver por fora"
(autocomposição, comum e lícita quando não há vítima). O que falta é o registro formal do
sinistro. O maior risco desta jornada não é complexidade — é o oposto: o app tratar um caso simples
com o mesmo peso operacional de um sinistro grave, fazendo Igor perder tempo em telas que não se
aplicam enquanto o trânsito trava atrás dos dois carros parados na faixa.

## Narrativa ponta-a-ponta

1. **Classificação já aponta o caminho mais curto.** Igor abre o registro (`crash-start`,
   UX-MOB-060, [UC-BOAT-001]) e classifica o tipo de sinistro; não há indício de vítima — nenhum
   dos dois condutores está ferido, sem passageiros machucados. A definição legal de sinistro
   ([REF-CTB-sinistro-cena-renaest] Anexo I) já cobre esse caso: dano só material também é
   sinistro, não é preciso vítima para o evento "contar".
2. **Local e condições, rápido.** Igor registra local (`crash-location`, UX-MOB-061) e condições de
   via/clima/iluminação (`crash-conditions`, UX-MOB-062) — sol forte, pista seca, sem chuva, sem
   problema de visibilidade; poucos campos, sem ambiguidade.
3. **Veículos e pessoas, sem passo de vítima no meio do caminho.** Igor registra os dois veículos
   (`crash-vehicles`, UX-MOB-063) e os dois condutores (`crash-people`, UX-MOB-064,
   [UC-BOAT-002]). Como a gravidade observada é `SEM_VITIMA`, a tela de vítimas
   (`crash-victims`, UX-MOB-065) não precisa ser um passo obrigatório no caminho principal do
   fluxo — proposta de UX (ver `_intake/ux-notes.md` §f), já que a exigência normativa de dados de
   vítima na submissão nacional só existe quando `gravidade ∈ {COM_VITIMA_FERIDA,
COM_VITIMA_FATAL}` ([RN-BOAT-002]); forçar Igor a passar por uma tela vazia em todo sinistro sem
   vítima é atrito sem propósito normativo.
4. **Croqui antes de liberar a faixa.** Antes de deixar os condutores moverem os carros para a
   calçada — o que eles já querem fazer, com o trânsito buzinando —, Igor faz o croqui rápido
   (`crash-sketch`, UX-MOB-067) e duas fotos de posição (`crash-evidence`, UX-MOB-068). Essa
   sequência protege os dois condutores da "palavra contra palavra" depois, caso a autocomposição
   amigável de hoje vire disputa de seguro amanhã — o registro estruturado do BOAT é o único
   documento contemporâneo da posição real dos veículos.
5. **Autocomposição não dispensa o registro, mas não cria trabalho extra para Igor.** Os condutores
   "resolverem por fora" (acordo particular sobre reparo) não é fato que o BOAT precise mediar ou
   registrar como cláusula — é fora do escopo declarado de [APP-BOAT] (apuração de responsabilidade
   civil). O papel de Igor é só documentar o sinistro em si; ele não é chamado a testemunhar nem a
   registrar o conteúdo do acordo entre as partes.
6. **Dever de remoção — art. 178, não art. 176.** Diferente de um sinistro com vítima (onde a
   preservação do local para perícia é dever do art. 176, III), aqui o regime é mais leve: o
   condutor envolvido em sinistro **sem vítima** tem o dever de adotar providências para remover o
   veículo quando necessário à fluidez do trânsito (art. 178). Como a via já está congestionando, a
   tela reforça essa distinção de forma simples, para Igor confirmar objetivamente — não é ele que
   decide se o condutor "tem" ou "não tem" esse dever (isso está na lei), é ele que registra se a
   remoção foi feita e se houve resistência de algum dos envolvidos.
7. **Encerramento sem gate de vítima.** Igor encerra o registro (`crash-review`, UX-MOB-070) — o
   mínimo de veículo/pessoa está satisfeito ([RN-BOAT-004]), e como a gravidade é `SEM_VITIMA`, o
   gate de dados de vítima na transmissão nacional simplesmente não se aplica ([RN-BOAT-002]); a
   tela de revisão não deveria mostrar nenhum aviso de pendência de vítima nesse caminho — mostrar
   um aviso de "faltam dados de vítima" num sinistro sem vítima seria ruído que ensina o agente a
   ignorar avisos.
8. **Trânsito volta a fluir.** Assim que o croqui e as fotos estão salvos, Igor libera os condutores
   para mover os carros — o registro já não depende mais da posição física deles na via.

## Pontos de contato (apps/canais)

Aplicativo mobile TEAT/BOAT (`crash-start` → `crash-location` → `crash-conditions` →
`crash-vehicles` → `crash-people` → `crash-sketch` → `crash-evidence` → `crash-review`, caminho
curto sem `crash-victims` obrigatório); croqui embarcado (mesmo editor de [JRN-BOAT-001]).

## Métricas de sucesso

Tempo médio de registro de sinistro sem vítima (proxy de fricção evitada) sensivelmente menor que
sinistro com vítima; % de sinistros sem vítima com croqui/evidência capturados antes da liberação
da via; zero avisos de "dados de vítima pendentes" exibidos em registros classificados
`SEM_VITIMA`; zero registro tratando conteúdo de acordo particular entre condutores como campo do
BOAT.
