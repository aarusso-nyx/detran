---
id: UX-NOTES-BOAT
title: Notas de UX — BOAT (registro de sinistro, cena de campo até console de coordenação)
status: draft
apps: [boat, teat]
sources:
  [
    'REF-CTB-sinistro-cena-renaest',
    'REF-CONTRAN-808-2020',
    'REF-DETRANAM-TALAO-BODYCAM',
    'REF-SENATRAN-PORTARIA-139-2025',
    'RN-BOAT-001',
    'RN-BOAT-002',
    'RN-BOAT-003',
    'RN-BOAT-004',
    'WF-BOAT-001',
  ]
updated: 2026-08-24
---

Notas de trabalho do especialista UX para o BOAT. Complementa [JRN-BOAT-001] a [JRN-BOAT-005] —
primeiras jornadas do app (base BOAT ainda não tinha nenhuma). Ver
`inf/teat/_intake/ux-notes.md`/protótipos TEAT (`teat:docs/meta/prototypes/**`, READ-ONLY) para o
esqueleto de tela já em uso (`CrashScreen.jsx`, `OsmMap.jsx`, editor de croqui embarcado) e
`transversal/portal/_intake/ux-notes.md` para o vocabulário cidadão já estabelecido pelo PORTAL —
reaproveitado, não reinventado, na proposta de [JRN-BOAT-005].

## (a) Inventário de telas — mapeado a UC/WF ids

> **PROMOVIDO (2026-08-26).** Virou artefato próprio em
> [IU-BOAT-001](../screens/IU-BOAT-001.md), com três correções: a tela de veículos não captura mais
> `evaded`, a tela de dinâmica ganhou o UC que a governa ([UC-BOAT-007]), e duas telas novas
> cobrem [UC-BOAT-012] e o dever de resposta ao titular. As tabelas abaixo ficam como registro
> histórico do intake.

**Mobile — grupo `sinistros` (11 telas núcleo, UX-MOB-060 a 070, existentes):**

| Tela                   | screen id          | Jornada(s)                     | UC / estado [WF-BOAT-001]                                                     |
| ---------------------- | ------------------ | ------------------------------ | ----------------------------------------------------------------------------- |
| Novo sinistro          | `crash-start`      | [JRN-BOAT-001], [JRN-BOAT-002] | [UC-BOAT-001] — abre `RASCUNHO`→`EM_ATENDIMENTO`                              |
| Local e horário        | `crash-location`   | [JRN-BOAT-001], [JRN-BOAT-002] | [UC-BOAT-001]                                                                 |
| Condições              | `crash-conditions` | [JRN-BOAT-001], [JRN-BOAT-002] | [UC-BOAT-001]                                                                 |
| Veículos envolvidos    | `crash-vehicles`   | [JRN-BOAT-001], [JRN-BOAT-002] | [UC-BOAT-002] — `evaded`                                                      |
| Pessoas envolvidas     | `crash-people`     | [JRN-BOAT-001], [JRN-BOAT-002] | [UC-BOAT-002]                                                                 |
| Vítimas                | `crash-victims`    | [JRN-BOAT-001]                 | [UC-BOAT-003] — [RN-BOAT-001]/[002]/[003]                                     |
| Dinâmica               | `crash-dynamics`   | [JRN-BOAT-001], [JRN-BOAT-002] | captura fato observado dos arts. 176-178 (ver §c)                             |
| Croqui                 | `crash-sketch`     | [JRN-BOAT-001], [JRN-BOAT-002] | [UC-BOAT-004]                                                                 |
| Evidências do sinistro | `crash-evidence`   | [JRN-BOAT-001], [JRN-BOAT-002] | [UC-BOAT-004] — regra de conteúdo §c                                          |
| AITs vinculados        | `crash-ait-links`  | [JRN-BOAT-001]                 | [UC-BOAT-004] — também usada para medida administrativa (reboque, art. 279-A) |
| Revisão do sinistro    | `crash-review`     | [JRN-BOAT-001], [JRN-BOAT-002] | [UC-BOAT-005] — `EM_ATENDIMENTO`/`REGISTRADO`→`FECHADO`                       |

**Web — grupo `crashes` (4 telas núcleo, UX-WEB-060 a 063, existentes):**

| Tela                       | Jornada        | Estado(s) [WF-BOAT-001] tocados                                        |
| -------------------------- | -------------- | ---------------------------------------------------------------------- |
| Lista de sinistros         | [JRN-BOAT-004] | agregado — `PENDENTE_COMPLEMENTO`, `REGISTRADO`, `INTEGRADO`           |
| Detalhe de sinistro        | [JRN-BOAT-004] | qualquer estado local                                                  |
| Complementação de sinistro | [JRN-BOAT-004] | `PENDENTE_COMPLEMENTO`→`REGISTRADO`/`VALIDADO`                         |
| Integração RENAEST         | [JRN-BOAT-004] | sub-máquina nacional `RECEBIDO`/`EM_ANALISE`/`CONSOLIDADO`/`REJEITADO` |

**Propostas — sem artefato de tela existente confirmado, registradas aqui, não implementadas:**

| Tela proposta                                                                                      | Jornada        | Estágio                                                                                                      |
| -------------------------------------------------------------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------ |
| Console de complemento de parceiro hospitalar (busca por chave natural + campos mínimos de vítima) | [JRN-BOAT-003] | proposta — onda futura, integração facultativa ([REF-CONTRAN-808-2020] art. 6º)                              |
| PORTAL — busca/consulta de BAT pelo cidadão envolvido                                              | [JRN-BOAT-005] | proposta — nenhum artefato escrito em `transversal/portal/**` por esta rodada; ver nota de escopo da jornada |
| PORTAL — download do documento oficial do BAT                                                      | [JRN-BOAT-005] | proposta, mesmo escopo acima                                                                                 |

Total: **11 telas mobile + 4 telas web núcleo já existentes** + 3 telas propostas (não contadas no
total núcleo, por não terem artefato confirmado nas fontes lidas).

## (b) Ergonomia de cena de sinistro (chuva/noite/risco de trânsito, uma mão, interrupção como

comportamento normal)

- **Uma mão, luva ou mão molhada.** O agente de campo frequentemente está segurando uma lanterna,
  um cone, ou simplesmente com a mão suja/molhada de chuva — toques grandes, sem exigência de
  precisão fina (arrastar, desenhar linha fina no croqui sem zoom) são preferíveis a captura de
  assinatura detalhada nesse momento. Ver `crash-sketch`/`SketchCanvas` do protótipo TEAT — já
  usa toque duplo para girar 45°, padrão compatível com uso de uma mão.
- **Interrupção-retomada é comportamento normal da cena, não exceção a tratar.** O agente pode
  precisar largar o celular no meio de qualquer tela — para atender SAMU, falar com um condutor
  alterado, orientar o trânsito — e voltar minutos depois exatamente onde parou, sem re-digitar
  nada. Nenhuma tela do BOAT deveria expirar sessão ou perder rascunho por inatividade curta; o
  princípio já estabelecido em [JRN-TEAT-003] (múltiplos casos em rascunho simultâneo) se aplica
  igualmente ao sinistro — na prática, ainda mais, porque a cena de sinistro tem mais interrupções
  físicas que uma blitz.
- **Chuva e brilho de faróis à noite.** Contraste alto e fontes grandes não são only-acessibilidade
  — são condição de uso real em rodovia à noite sob chuva ([JRN-BOAT-001], BR-174). Testar toda
  tela crítica de captura sob simulação de tela molhada/reflexo antes de aprovar design.
- **GPS de baixa precisão é esperado, não erro.** Sob mata fechada, viaduto, ou chuva forte, a
  localização automática pode vir imprecisa — a tela sempre precisa de um caminho de complemento
  manual da descrição textual do local ([UC-BOAT-001] alternativa 4a), nunca bloquear o avanço
  esperando GPS perfeito.
- **Trânsito represado é pressão psicológica constante, não só do condutor envolvido.** Terceiros
  (motoristas atrás, buzinando) pressionam o agente a "acabar logo" mesmo quando ele não é parte do
  sinistro. O app não deve reforçar essa pressão com prazos/contadores decorativos nas telas de
  captura — velocidade é resultado de um fluxo bem desenhado, não de um cronômetro visível
  pressionando o agente.

## (c) Linguagem simples para as três capturas de dever do art. 176-178

O agente registra **fato observado**, nunca conclusão jurídica. A tela nunca deveria pedir ao
agente para "classificar se houve infração do art. 176" — isso é competência de quem julga (rait),
não de quem registra o sinistro. O BOAT registra os fatos que, depois, podem ou não embasar uma
autuação separada (TEAT).

| Regime                                        | Pergunta objetiva na tela (fato, não conclusão)                                                                                          | Base legal (não exibida como pergunta, só como referência de apoio)         |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Sinistro **com vítima**                       | "O condutor envolvido prestou ou providenciou socorro? Por quem?" / "O local foi preservado até a chegada da perícia, quando aplicável?" | art. 176, I e III                                                           |
| Recusa **mediante solicitação da autoridade** | "A autoridade solicitou socorro e o condutor se recusou?" — campo distinto do anterior, não a mesma pergunta reformulada                 | art. 177 — hipótese autônoma, distinta da omissão espontânea do art. 176, I |
| Sinistro **sem vítima**                       | "Havia necessidade de remoção do veículo para a fluidez do trânsito? Foi feita?"                                                         | art. 178                                                                    |

Nunca comprimir os três regimes num único campo booleano de "evasão"/"colaborou" — são deveres
jurídicos distintos com consequência distinta, e o campo atual `evaded` de `CrashVehicle` não
captura essa distinção (achado do handoff BPO no dossiê de pesquisa; a UX aqui já modela a pergunta
certa nas jornadas, mas o campo de dados em si é decisão de modelagem do BPO/engenharia).

## (d) Regras de UI orientadas por LGPD

1. **Mascarar dado de saúde de vítima por padrão, revelar sob papel e finalidade.** Igual à prática
   já estabelecida em `inf/rait/_intake/ux-notes.md`, aplicada aqui a `hospital_destination` e
   `health_notes` ([RN-BOAT-003]): a visão padrão de qualquer tela interna (processing-operator,
   coordenador) mostra um resumo validado ("atendimento médico: sim/não"; "removida para unidade de
   saúde: sim/não"), não o campo de texto bruto. Acesso ao dado bruto sensível é um segundo passo
   explícito, auditável — mesmo princípio do art. 18 da [REF-SENATRAN-PORTARIA-139-2025]
   ("priorizar a validação de dados, com acesso ao dado bruto sensível somente em caráter
   excepcional").
2. **A regra vale para toda vítima, sempre — nunca condicionada à gravidade.** [RN-BOAT-003] é
   explícita: controle reforçado independe de `severity`. Nenhuma tela deveria relaxar essa
   proteção para um caso "ferida leve" versus "óbito" — o mascaramento por padrão é uniforme.
3. **Minimum-necessary por identidade do titular, não por papel fixo de sistema.** A tela de
   consulta cidadã proposta em [JRN-BOAT-005] mostra exemplo concreto: o que aparece para Fábio
   (condutor) é diferente do que apareceria para a própria vítima consultando seu caso — a máscara
   depende de quem está pedindo e por quê, não de uma lista estática de "campos públicos vs.
   privados".
4. **Superfície de tela reduzida para parceiro externo, não só campo mascarado.** Para o parceiro
   hospitalar proposto em [JRN-BOAT-003], a minimização não é só "esconder um campo" — é limitar a
   própria tela ao subconjunto de dado relevante à finalidade de saúde, sem acesso a dinâmica,
   croqui ou dados de outros envolvidos.
5. **Auditoria de acesso, não só bloqueio.** Toda revelação de dado bruto sensível (passo 2 acima)
   deveria registrar quem acessou e por qual finalidade declarada — consistente com o padrão já
   citado em [RN-BOAT-003] (RN-AUD-005 do corpus de protótipo: "acesso a dados sensíveis deve ser
   auditado com finalidade").
6. **Nenhuma base legal de tratamento exibida com falsa certeza.** O dossiê de pesquisa aponta que
   nenhuma norma lida define a hipótese exata do art. 11 da LGPD aplicável ao dado de saúde de
   vítima (handoff LEGAL, item 2) — nenhuma tela deveria afirmar uma base legal específica
   ("consentimento", "tutela da vida") como se fosse fato assentado; se a interface precisar citar
   fundamento, usar linguagem genérica de proteção de dados até parecer jurídico dedicado resolver
   a questão.

## (e) Conteúdo — "fotografar a cena, não o sofrimento"

Regra de conteúdo para toda captura de evidência fotográfica do sinistro (`crash-evidence`),
proposta como regra de produto com apoio normativo indireto (não é texto expresso do CTB sobre
fotos de sinistro — é extensão, por analogia de princípio, de duas normas já capturadas):

- [REF-DETRANAM-TALAO-BODYCAM] art. 14, I veda que a divulgação de registro de bodycam comprometa
  "o direito de imagem dos envolvidos, especialmente em situações constrangedoras ou que exponham
  sua integridade física" — a Portaria trata literalmente de bodycam, não de fotos de evidência do
  BOAT, mas o princípio de dignidade que a sustenta é diretamente aplicável.
- [REF-CONTRAN-808-2020] art. 5º §5º (LGPD) e o princípio de minimização de dado sensível
  ([REF-SENATRAN-PORTARIA-139-2025] art. 18) reforçam o mesmo racional: capturar o necessário à
  finalidade de perícia/estatística/instrução (posição de veículos, danos, sinalização, marcas de
  frenagem), não o sofrimento da vítima em si.

**Aplicação prática na tela**: nenhum prompt de captura orienta o agente a fotografar a vítima
diretamente; a orientação padrão (texto de apoio na tela `crash-evidence`) é "fotografe posição dos
veículos, danos, sinalização e via — evite enquadrar vítimas feridas". Isso é marcado explicitamente
como **decisão de produto**, não obrigação normativa direta — se o Owner/LEGAL entender que não é
defensível como regra obrigatória, deve ao menos permanecer como orientação/anti-padrão, não
desaparecer silenciosamente.

## (f) Notas de acessibilidade

- Toque grande, alto contraste, funcional sob luva/mão molhada/pouca luz — ver §b; é requisito de
  uso real de campo, tratado com a mesma prioridade de WCAG AA, não como "nice to have" separado.
- Croqui: precisa de alternativa não-visual mínima para revisão posterior (leitor de tela consegue
  navegar pela lista estruturada de elementos do croqui, mesmo que o desenho em si seja
  visualmente gerado) — quem revisa depois (coordenador, JARI eventual) pode não ser quem desenhou.
- Console de coordenação ([JRN-BOAT-004]): mesma prioridade de eficiência de teclado do console
  RAIT (`inf/rait/_intake/ux-notes.md` §d) — Renato revisa muitos casos em sequência, atalhos de
  navegação sem mouse reduzem fadiga em lote longo de revisão.
- Consulta cidadã proposta ([JRN-BOAT-005]): seguir os mesmos padrões WCAG 2.1 AA já adotados pelo
  PORTAL (`transversal/portal/_intake/ux-notes.md` §d) quando/se o artefato for de fato construído.

## (g) Anti-padrões a evitar

1. **Tela de vítima obrigatória em todo sinistro, mesmo sem vítima.** Hoje, segundo o dossiê de
   pesquisa, a tela de vítimas é exibida independentemente da gravidade — [JRN-BOAT-002] propõe
   pular esse passo quando `SEM_VITIMA`; tratado aqui como melhoria de UX pendente de decisão, não
   como fato já corrigido.
2. **Contador de prazo falso.** Nenhuma tela (mobile ou web) deveria exibir prazo de transmissão
   por-registro como se fosse teto legal — não existe um confirmado nas fontes lidas ([WF-BOAT-001]
   §Prazos). Diferente do PORTAL/RAIT, onde o prazo real existe e deve ser mostrado, aqui mostrar
   um número inventado é pior que não mostrar nada — ver [JRN-BOAT-004].
3. **Vocabulário de estado interno vazando para o cidadão.** `RECEBIDO`, `EM_ANALISE`,
   `pending_complement`, códigos de erro crus (`RENAEST.CRASH.INCOMPLETE_DATA`) nunca aparecem sem
   tradução na eventual tela cidadã — mesmo princípio já fixado pelo PORTAL para RAIT.
4. **Bloquear avanço da tela esperando a vítima ser atendida.** Nenhuma tela do BOAT deveria criar
   a sensação de que o app "está esperando" enquanto socorro acontece — captura sempre pode ser
   retomada depois; ver [JRN-BOAT-001].
5. **Fotografar/enquadrar o sofrimento da vítima como evidência padrão.** Ver §e.
6. **Relaxar controle de acesso a dado de vítima por "a gravidade é leve".** [RN-BOAT-003] não
   permite essa exceção — nenhuma tela deveria criar uma.
7. **Hospital com acesso à tela inteira do sinistro em vez de uma superfície mínima.** Ver
   [JRN-BOAT-003] passo 4 — vazamento de escopo de parceiro externo é risco tanto de LGPD quanto de
   confusão de papéis (hospital não é quem decide o que aconteceu no sinistro).
8. **Escrever conclusão jurídica no lugar de fato observado nas telas de dinâmica/pessoas.** Ver
   §c — "condutor descumpriu o art. 176" nunca é o que a tela pergunta; "condutor prestou socorro?
   sim/não/por quem" é.
