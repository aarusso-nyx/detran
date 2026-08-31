---
id: UX-NOTES-DASHBOARD
title: Notas de UX — DASHBOARD (console interno de operação)
status: draft
apps: [dashboard, rait, pec, boat, teat]
sources:
  [
    research-dossier.md,
    RN-RAIT-110,
    RN-RAIT-111,
    RN-RAIT-112,
    RN-RAIT-113,
    RN-RAIT-114,
    WF-RAIT-002,
    WF-PEC-002,
    RN-PEC-112,
    RN-PEC-106,
    RN-PEC-008,
    WF-BOAT-003,
    RN-BOAT-003,
    RN-BOAT-004,
    RN-BOAT-130,
    RN-BOAT-131,
    WF-TEAT-001,
    REF-LEI-13709-2018,
  ]
updated: 2026-08-24
---

Notas de trabalho do especialista UX para o DASHBOARD. Complementa [JRN-DASH-001] a [JRN-DASH-007]
— primeiras jornadas do app (base DASHBOARD ainda não tinha nenhuma). Reaproveita, sem reinventar,
a doutrina já fixada por `inf/rait/_intake/ux-notes.md` (prazo do cidadão vs. prazo do órgão, base
legal sempre visível ao lado do número), `est/boat/_intake/ux-notes.md` (mascaramento por padrão,
revelação auditada por identidade) e `ch/pec/_intake/ux-notes.md` (vocabulário legal nunca
inventado, dois tipos de prazo com naturezas opostas). O DASHBOARD é o único app que agrega os
três — e por isso é também o único onde confundi-los tem o maior custo.

## (a) Inventário de painéis e telas — mapeado a indicador/UC/WF

> **PROMOVIDO (2026-08-31).** Virou [IU-DASH-001](../screens/IU-DASH-001.md), com três correções de
> deriva: o radar do RAIT cobre quatro relógios (§4.1-4.4, não §4.1-4.3), o catálogo tem 14 linhas
> (não 13), e o painel de transparência ativa que [UC-DASH-007] exige foi acrescentado. A tabela
> abaixo fica como registro histórico.

Nenhuma tela do DASHBOARD tem artefato de produto confirmado nas fontes lidas — todo o inventário
abaixo é **proposta de UX**, alimentada pelas 13 linhas da tabela de deveres monitoráveis do
`research-dossier.md` §2 e pelos WF/RN das apps-fonte. Numeração de indicador (`IND-DASH-nnn`) e
UC (`UC-DASH-nnn`) são **forward references** ao catálogo em elaboração paralela pelo BPO
([WF-DASH-001..003]) — marcadores de backlog, não confirmação de artefato existente (convenção
`CONVENTIONS.md` §Artifact types).

| Painel/tela                                               | Jornada(s)     | Indicador/WF de origem                     | Camada (ver §b)                                           |
| --------------------------------------------------------- | -------------- | ------------------------------------------ | --------------------------------------------------------- |
| Triagem do turno (fila de alertas cross-app)              | [JRN-DASH-001] | agregado — todas as escadas abaixo         | Ação                                                      |
| Radar de prescrição RAIT (card + drill-down)              | [JRN-DASH-002] | [WF-RAIT-002] §4.1-4.3, [RN-RAIT-110..114] | Ação                                                      |
| Catálogo de deveres periódicos (13 linhas do dossiê)      | [JRN-DASH-003] | `research-dossier.md` §2                   | Ação/Vigilância                                           |
| Saúde técnica de integrações (outbox, sync, adapters)     | [JRN-DASH-004] | [RN-PEC-008], [WF-BOAT-003], [WF-TEAT-001] | Ação/Técnico                                              |
| Trilha de auditoria consolidada                           | [JRN-DASH-005] | [WF-RAIT-002] §6, [RN-BOAT-003]            | Contexto (sob demanda)                                    |
| Comparativo de unidades/circuitos                         | [JRN-DASH-006] | [WF-RAIT-002] §5, [RN-BOAT-004]            | Vigilância                                                |
| Escada de prazos da junta PEC                             | [JRN-DASH-007] | [WF-PEC-002], [RN-PEC-112]                 | Ação                                                      |
| Estatística agregada de sinistros (proposta, condicional) | —              | [RN-BOAT-130], [RN-BOAT-131]               | Contexto — requer camada de anonimização antes de existir |

Total: **7 painéis/telas núcleo** cobrindo as 7 jornadas + **1 tela proposta condicional**
(estatística agregada) que só deveria ser construída depois que a camada de anonimização exigida
por [RN-BOAT-131] estiver resolvida — nunca antes, mesmo sob pressão de prazo de produto.

## (b) Hierarquia da informação — ação, vigilância e contexto nunca com o mesmo peso visual

Três camadas, com pesos visuais estritamente distintos — a confusão entre elas é o erro estrutural
mais fácil de cometer num painel interno, porque tecnicamente é mais simples mostrar tudo do mesmo
jeito:

1. **Ação** — algo cruzou um limiar e precisa de um dono agora ([JRN-DASH-001] a [JRN-DASH-004],
   [JRN-DASH-007]). Sempre no topo da tela, sempre com verbo (o que fazer), nunca apenas um número.
2. **Vigilância** — nada exige ação imediata, mas merece acompanhamento periódico ([JRN-DASH-006],
   parte de [JRN-DASH-003] antes do marco de preparação). Visível, mas nunca competindo por
   atenção com a camada de ação — segundo nível de tela ou seção claramente separada.
3. **Contexto** — informação que só importa quando alguém já decidiu investigar algo
   ([JRN-DASH-005], estatística agregada). Nunca na tela de abertura; acessível por drill-down
   deliberado, não por rolagem passiva.

Regra de teste: se uma pessoa consegue fechar a tela de abertura do turno sem ver a camada de
Contexto nenhuma vez, o desenho está correto. Se ela precisa rolar por gráficos de Contexto antes
de chegar à fila de Ação, o desenho está invertido.

## (c) Desenho de alerta — severidade tripla, cores/formas acessíveis, prevenção de fadiga

**Três eixos de severidade, nunca fundidos num único "vermelho genérico":**

| Eixo        | O que mede                                                                          | Exemplo                                                                                                                   | Regra de exibição                                                                                                                    |
| ----------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Legal       | extingue direito de terceiro                                                        | RAIT `ALERTA_N3`/`CRITICO` ([RN-RAIT-112]); prazo do candidato PEC vencendo ([RN-PEC-112])                                | forma própria (não só cor) + base legal citada, nunca "vermelho" sozinho                                                             |
| Operacional | descumpre dever do órgão, sem extinguir direito de terceiro na maioria dos casos    | dever periódico do dia 20 ([JRN-DASH-003]); prazo do órgão PEC sem sanção mas com efeito sobre o candidato ([RN-PEC-106]) | forma distinta da legal — mesma urgência visual quando o efeito sobre terceiro existir (caso PEC), urgência menor quando não existir |
| Técnica     | saúde de infraestrutura/integração, sem caso individual associado no primeiro nível | fila `renach_outbox` crescendo ([RN-PEC-008])                                                                             | ícone de sistema, nunca a mesma forma usada para risco legal                                                                         |

**Acessível, nunca só cor.** Cada nível de severidade combina cor + forma geométrica + rótulo
textual explícito — mesmo padrão já fixado em `inf/rait/_intake/ux-notes.md` §d ("informação
crítica não pode depender só de cor") e em `ch/pec/_intake/ux-notes.md` §f ("nunca comunicar
resultado só por cor"), estendido aqui à totalidade do DASHBOARD por ser o ponto onde mais tipos
de alerta convivem na mesma tela.

**Prevenção de fadiga de alerta — regra explícita.** Um alerta que ninguém age é um defeito do
painel, não do operador. Consequências de desenho:

1. Todo alerta tem um dono definido no momento em que é criado — nunca um alerta "solto" esperando
   que alguém o reivindique por iniciativa própria (ver [JRN-DASH-001] passo 7).
2. Limiares que nunca disparam ação real são candidatos a remoção ou recalibração — o DASHBOARD
   registra, por indicador, a taxa histórica de "alerta gerou ação" vs. "alerta ignorado"; um
   indicador com taxa de ignorado persistentemente alta é um sinal de que o limiar está calibrado
   errado, não de que os operadores são negligentes.
3. Vermelho nunca é o estado default de nenhuma tela — se a maioria dos casos aparece vermelha na
   maior parte do tempo, o olho humano se adapta e passa a tratar vermelho como neutro (mesmo
   princípio já registrado em [JRN-RAIT-004] passo 1: "o desenho evita 'vermelho de tudo'").
4. Escadas de alerta (RAIT 4 níveis, PEC 4 marcos) usam os mesmos nomes de nível em toda a
   interface do DASHBOARD onde aparecerem — nunca uma sinonímia visual diferente por tela.

## (d) Honestidade do dado — origem, frescor, e o estado "desatualizado" como cidadão de primeira classe

Todo painel do DASHBOARD declara, de forma sempre visível (não apenas em tooltip): (1) de qual
sistema de origem o dado vem, (2) quando foi a última atualização bem-sucedida. Um número velho
jamais se apresenta como atual — se a última sincronização falhou ou está atrasada além do
esperado, a tela mostra "dado desatualizado desde HH:MM — última sincronização bem-sucedida", não
o número antigo silenciosamente atualizado de aparência.

Este não é um princípio abstrato: é a lição direta de [JRN-DASH-004] (fila de integração parada) —
enquanto uma integração está com problema técnico, qualquer painel que dependa desse dado (o de
Marcos em [JRN-DASH-001], o de Aline em [JRN-DASH-002]) precisa herdar visualmente o estado
"desatualizado", em vez de continuar parecendo saudável. Consequências de desenho:

1. "Desatualizado" é um **estado**, com sua própria forma visual — não uma ausência de dado
   (tela vazia) nem um erro genérico.
2. O estado se propaga: se o indicador X depende do sistema Y, e Y está desatualizado, X herda o
   selo, mesmo que o último valor calculado de X pareça normal.
3. Nenhum painel recalcula silenciosamente um valor "estimado" para disfarçar a lacuna — se o
   dado não está disponível, a tela diz isso, não aproxima.

## (e) Mascaramento e segregação por papel — mínimo necessário, revelação auditada

O DASHBOARD agrega dado de saúde do BOAT e do PEC além de dado processual do RAIT — herda
integralmente a doutrina já fixada por `est/boat/_intake/ux-notes.md` §d e `ch/pec/_intake/ux-
notes.md` §d, com uma extensão própria: por ser transversal, o DASHBOARD é onde o **mesmo dado
sensível pode ser visto por papéis de mais de um domínio ao mesmo tempo** — o ponto de maior risco
de vazamento por agregação.

1. **Mascarado por padrão em qualquer tela agregada, sem exceção de "é só um resumo".** Um card
   de saúde técnica que menciona um caso PEC represado (ver [JRN-DASH-004] passo 1) nunca expande
   automaticamente conteúdo clínico — mostra o fato do represamento, não o conteúdo. Mesmo padrão
   para um card RAIT/BOAT que precise citar um caso com dado de vítima.
2. **Revelação é um segundo passo explícito, por identidade e finalidade declarada — nunca por
   papel fixo de sistema.** Um Auditor investigando um incidente ([JRN-DASH-005]) pode precisar
   ver que um acesso a dado sensível ocorreu; ver o próprio conteúdo do dado é uma ação adicional,
   registrada, com finalidade própria — não decorre automaticamente do papel "Auditor".
3. **Toda revelação de dado bruto sensível no DASHBOARD é auditada.** Se um gestor de área expande
   um card mascarado para ver o dado subjacente, esse próprio ato de expansão é um evento
   registrado na trilha (consistente com [RN-BOAT-003] e o princípio equivalente do PEC).
4. **Interno não é sinônimo de irrestrito.** O DASHBOARD é uso interno-only, mas isso não elimina
   RBAC dentro dele — Marcos (operador de monitoramento) não vê o mesmo nível de detalhe que
   Beatriz (auditora) vê durante uma investigação formal, mesmo estando ambos "dentro" do mesmo
   painel.
5. **Nenhuma base legal de tratamento (art. 11 LGPD) exibida com falsa certeza** — mesmo achado já
   registrado por BOAT e PEC: se uma tela do DASHBOARD precisar citar fundamento para o
   tratamento de dado de saúde agregado, usar linguagem genérica até parecer jurídico dedicado
   ([REF-LEI-13709-2018] art. 13 como piso, não como solução pronta).

## (f) Ética do indicador — produtividade × qualidade, o que não deve ser exibido

Ver [JRN-DASH-006] para a narrativa completa. Princípios de desenho, extraídos dessa jornada:

1. **Produtividade nunca aparece sem qualidade pareada.** Volume de casos julgados/registrados só
   é exibido ao lado de um indicador de qualidade correspondente (taxa de decisão revertida em
   instância superior, taxa de diligência reaberta, taxa de rejeição RENAEST por dado incompleto —
   já usado como padrão em [JRN-BOAT-004]).
2. **Nenhum ranking nomeado de indivíduos em tela de acesso amplo.** Desempenho de pessoa física
   (um relator, um agente de campo, um perito) vive num nível de acesso mais restrito que
   desempenho agregado de pool/unidade — mesma lógica de mínimo necessário do item (e), aplicada a
   dado de desempenho, não só a dado clínico.
3. **Nenhuma tela abre em ordem "melhor→pior".** A primeira leitura de qualquer comparativo é
   distribuição (dentro/fora da faixa esperada), nunca um pódio.
4. **O incentivo perverso mais citado no corpus — "correr para julgar sem instruir" — precisa ter
   um contraponto visível no painel**, não apenas ser evitado por omissão: se uma unidade decide
   rápido mas com alta taxa de reversão/diligência reaberta, esse padrão é ele mesmo um alerta de
   processo, não um destaque de velocidade.
5. **Nenhuma ação disciplinar automática vinculada a um número do painel.** O DASHBOARD pode expor
   que um relator está `ADVERTIDO` no mecanismo de accountability do RAIT ([WF-RAIT-002] §5), mas
   a decisão de mover ao próximo estágio (`AFASTADO_TEMP`) é humana, tomada fora do painel — o
   painel informa, não decide.

## (g) Acessibilidade (WCAG 2.1 AA, ambiente de trabalho, uso prolongado)

- **Piso WCAG 2.1 AA em todas as telas**, alinhado ao já adotado por `transversal/portal` e por
  RAIT/BOAT/PEC — sem exceção por o DASHBOARD ser "só interno".
- **Uso prolongado e turnos longos** (Marcos, [JRN-DASH-001]; Beatriz reconstruindo trilhas longas,
  [JRN-DASH-005]): eficiência de teclado, atalhos de navegação sem mouse e foco visível são
  prioridade equivalente à já dada aos consoles RAIT/BOAT/PEC — o DASHBOARD, sendo o ponto de
  entrada do turno inteiro, é onde a fadiga visual começa primeiro.
- **Daltonismo — nunca só cor**, ver §c; testar toda paleta de severidade sob simulação de
  daltonismo antes de aprovar.
- **Telas grandes e projetores de sala de situação.** Diferente dos consoles de app individual, o
  DASHBOARD é candidato natural a exibição em tela grande/projeção (sala de situação, reunião de
  gestão). Isso implica: contraste testado também a distância (não só a 40cm de um monitor),
  densidade de informação reduzida na visão de "sala" (a tela de projeção mostra menos por card do
  que a tela de trabalho individual de Marcos), e nenhuma informação crítica dependente de
  interação de mouse/hover que não exista numa tela apenas exibida, sem operador presente.
- **Fontes grandes por padrão em telas de alerta crítico** — consistente com o princípio geral de
  "contraste alto e fontes grandes não são only-acessibilidade" já fixado por
  `est/boat/_intake/ux-notes.md` §f para cena de campo; aqui a justificativa é sala de situação e
  fadiga de turno longo, não chuva e luva, mas a conclusão de desenho é a mesma.

## (h) Anti-padrões a evitar

1. **Vanity metrics.** Nenhum número aparece no DASHBOARD só porque é fácil de calcular — todo
   indicador do inventário (§a) precisa responder a uma das três perguntas da missão do painel:
   o que está em risco, quem age, até quando. Um gráfico bonito sem ação associada não entra.
2. **Gráfico sem ação associada.** Se uma visualização não muda o que alguém faz a seguir, ela
   pertence à camada de Contexto (§b), nunca à tela de abertura do turno.
3. **Drill-down que vaza PII.** Nenhum caminho de navegação — nem mesmo em nome de "dar contexto
   ao gestor" — deveria expor dado clínico bruto, conteúdo de anamnese, resultado toxicológico ou
   detalhe de vítima fora do fluxo de revelação auditada do §e. Isso vale inclusive para telas de
   incidente técnico ([JRN-DASH-004]), onde a tentação de "mostrar o registro travado por
   completo" para diagnosticar é real e deve ser resistida.
4. **Alerta sem dono.** Ver §c — todo alerta nasce com responsável definido; um alerta "para quem
   quiser pegar" é o desenho que garante que ninguém pega.
5. **Vermelho de tudo.** Ver §c — satura o sinal, o olho humano se adapta, o vermelho vira ruído.
6. **Contador de prazo falso.** Herdado diretamente de `est/boat/_intake/ux-notes.md` §g e
   `ch/pec/_intake/ux-notes.md` §g: nenhuma tela do DASHBOARD exibe prazo com aparência de teto
   legal quando a fonte não confirma um (ex.: a linha 5 da tabela de deveres do
   `research-dossier.md` — prazo estatístico anual hoje extinto sem substituto — aparece como
   "sem prazo definido", nunca como contador ausente silenciosamente).
7. **Confundir prazo do administrado com prazo do órgão.** O erro mais grave possível em
   [JRN-DASH-007] — mesmo peso dado pelo PEC ao mesmo risco (`ch/pec/_intake/ux-notes.md` §g item
   12), reafirmado aqui porque o DASHBOARD é onde esse tipo de prazo mais aparece lado a lado com
   outros tipos.
8. **Atribuir decisão de recurso ao "CETRAN" quando quem decide é a Junta Especial de Saúde.** Ver
   [JRN-DASH-007] passo 5 — item específico, mas com potencial de repetição em qualquer tela nova
   que resuma o fluxo da junta sem checar a fonte.
9. **Ranking punitivo de pessoas.** Ver §f — o antídoto de desenho já está descrito ali; este item
   é o lembrete de que a tentação existe e precisa ser verificada a cada nova tela comparativa.
10. **Dado desatualizado exibido como atual.** Ver §d — o antídoto (selo de frescor, propagação de
    estado "desatualizado") precisa existir desde o primeiro release, não ser adicionado depois de
    um incidente real ter exposto a lacuna.
11. **Painel de estatística agregada de sinistro publicado antes de resolver anonimização.** Ver
    §a, última linha — [RN-BOAT-131] classifica isso como problema de engenharia real, não como
    marcação de campo; nenhuma pressão de prazo de produto justifica pular essa etapa.
12. **Vocabulário de estado interno vazando sem tradução.** Mesmo que o DASHBOARD seja
    interno-only (diferente do PORTAL), nomes de estado técnico crus (`PENDING`, `ERROR`,
    `RENAEST.CRASH.INCOMPLETE_DATA`) não deveriam ser a primeira coisa que um gestor não-técnico
    lê — uma tradução em linguagem direta vem primeiro, o código técnico fica disponível como
    detalhe expansível (mesmo padrão já usado em [JRN-BOAT-004] passo 3).
