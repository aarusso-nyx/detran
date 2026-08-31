---
id: RN-DASH-170
title: Segregação de acesso por papel — um painel que agrega saúde, processo e campo não pode ter perfil único
status: draft
apps: [dashboard, boat, pec, rait, teat]
sources: [REF-LEI-13709-2018, REF-SENATRAN-PORTARIA-139-2025, REF-SENATRAN-997]
updated: 2026-08-24
---

**Regra.** O DASHBOARD tem uma característica que nenhum outro app do ecossistema tem: **ele agrega,
numa única superfície, dados de todos os domínios** — saúde de vítima (BOAT), condição clínica de
candidato (PEC), processo sancionador (RAIT), ato de campo e evidência audiovisual (TEAT). Essa
agregação é a razão de ser do produto **e** é o seu maior risco: um perfil de acesso único a um painel
transversal concede, de uma vez, mais alcance sobre dado pessoal do que qualquer papel individual dos
apps de origem jamais teve.

Por isso: **não existe perfil "gestor do DASHBOARD" com acesso a tudo.** O acesso é segregado por
**domínio × camada de sensibilidade**, e o padrão é a **menor granularidade que atende à função**.

| Camada                                        | Conteúdo                                                                                                               | Quem acessa                                                                        | Fundamento                                    |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------- |
| **N0 — Indicadores agregados institucionais** | volumes, tempos médios, taxas de cumprimento, séries anonimizadas                                                      | qualquer papel autenticado do órgão; subconjunto publicável ([RN-DASH-142])        | dado não pessoal                              |
| **N1 — Operacional por fila**                 | contagens por pool, idade de fila, backlog, alertas por família                                                        | operador de monitoramento, gestor da área correspondente                           | necessidade funcional                         |
| **N2 — Identificação de objeto de processo**  | nº do processo em risco, placa, equipamento, AIT                                                                       | gestor da **área de origem** + auditor                                             | necessidade demonstrável, restrita ao domínio |
| **N3 — Dado pessoal sensível**                | qualquer atributo de saúde (gravidade/óbito de vítima, condição clínica de candidato), biometria, evidência de bodycam | **ninguém, pelo DASHBOARD** — acesso apenas no app de origem, por papel competente | [RN-DASH-162], [RN-TEAT-142]                  |

A linha N3 é a mais importante: ela não é uma restrição de perfil, é uma **regra de escopo do
produto**. O DASHBOARD **não é** um canal de acesso a dado sensível — nem para o diretor, nem para o
auditor, nem em emergência. Quem precisa do dado individual vai ao app de origem, onde existem o papel
competente, a finalidade vinculada e a trilha própria.

**Base legal.**

- [REF-LEI-13709-2018] art. 6º, III (**necessidade**): _"limitação do tratamento ao mínimo necessário
  para a realização de suas finalidades, com abrangência dos dados pertinentes, proporcionais e **não
  excessivos** em relação às finalidades"_. Perfil que vê mais do que precisa é tratamento excessivo,
  independentemente de haver ou não vazamento.
- [REF-LEI-13709-2018] art. 6º, VII e art. 46 (**segurança**): medidas técnicas e administrativas
  aptas a proteger os dados _"de **acessos não autorizados**"_ — e o que define "autorizado" é a
  necessidade funcional, não a hierarquia do cargo.
- [REF-LEI-13709-2018] art. 11 (dado sensível, incluindo **dado referente à saúde**): regime de
  tratamento reforçado, com hipóteses fechadas.
- [REF-SENATRAN-PORTARIA-139-2025] art. 6º, VI-VII e art. 17, § 2º: a distinção **público × restrito**
  depende da conjugação entre parâmetros de entrada e de saída — a mesma lógica que torna um painel
  transversal mais sensível que a soma de suas partes. E o acesso aos sistemas nacionais exige, **por
  caso de uso**, finalidade, hipótese legal e justificativa de necessidade declaradas
  ([RN-BOAT-132]).
- [REF-SENATRAN-997] Anexo II, i): a norma do talão eletrônico já exige **registrar as operações**
  indicando data-hora, agente, veículo, local e número do aparelho _"para permitir auditorias"_ — o
  padrão de rastreabilidade individual do ecossistema ([RN-TEAT-112]).

**Verificação.**

1. **Papéis do DASHBOARD derivam de `shared/actors.md`**, não são inventados: `operador de
monitoramento` (N0-N1), `gestor de área` (N0-N2 **do seu domínio apenas**), `auditor/DPO` (N0-N2
   transversal, **somente leitura, sempre logado**), `administração técnica` (saúde técnica e
   integrações — N0-N1, **sem acesso a conteúdo de domínio**).
2. **Segregação horizontal também é obrigatória.** Gestor do PEC não vê fila do RAIT; gestor do RAIT
   não vê episódios de revisão clínica. A transversalidade do painel é **do órgão**, não de cada
   usuário.
3. **`technical-admin` é o ponto cego clássico.** Quem administra a plataforma tende a receber acesso
   irrestrito ao dado por conveniência operacional. Administrar infraestrutura **não** cria
   necessidade de ver conteúdo de domínio — e é justamente o perfil com maior alcance técnico. Separar
   administração de plataforma de acesso a conteúdo é requisito, não refinamento.
4. **Acesso de emergência ("break-glass"), se existir, é nominado, temporário e escalado**: motivo
   registrado, prazo de expiração, notificação automática ao Encarregado, e revisão obrigatória
   posterior. Sem esses quatro elementos, não é break-glass — é backdoor.
5. **Revisão periódica de concessões**, com remoção automática de acesso por inatividade e por
   mudança de lotação. Acesso concedido e nunca revisto é o modo como um painel interno vira base de
   dados aberta por dentro.
6. **Exportação herda a classificação** ([RN-DASH-172]): não existe perfil que veja N1 na tela e possa
   exportar N2.

**Controvérsia/risco.** _Severidade: alta._ O risco central é sociológico, não técnico: a demanda por
"visão 360º do cidadão" num painel de gestão é recorrente, tem apelo intuitivo, e é **exatamente** o
que a LGPD chama de tratamento excessivo. Consolidar, numa tela, o processo de infração + o exame
clínico + o histórico de sinistros de uma mesma pessoa **cria um perfil** que nenhuma finalidade
declarada do DETRAN-AM sustenta — e nenhum dos apps de origem, isoladamente, permitiria. Esta regra
existe para que essa demanda seja recusada por escrito, com fundamento, e não renegociada a cada
mudança de gestão.
