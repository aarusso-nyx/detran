---
id: RN-PORTAL-121
title: Correção é direito exigível e ação de primeira classe; portabilidade é direito enunciado sem procedimento no setor público
status: draft
apps: [portal, rait, pec, boat]
sources:
  [REF-LEI-13709-2018, REF-CTB-280-290, REF-CONTRAN-918, REF-LEI-13460-2017]
updated: 2026-08-24
---

**Regra — correção.** O direito de correção de dado incompleto, inexato ou desatualizado é
plenamente exigível contra o DETRAN-AM e deve ser **ação de primeira classe** no PORTAL: visível ao
lado do dado, não escondida em formulário genérico. Quatro exigências:

1. **Correção pede-se onde o dado aparece.** Cada superfície que exibe dado do titular oferece o
   caminho de correção do dado exibido.
2. **Correção propaga.** Corrigido, bloqueado, anonimizado ou eliminado o dado, o órgão **informa de
   imediato** os agentes com quem compartilhou, para que repitam o procedimento (art. 18, § 6º). No
   contexto do DETRAN-AM isso alcança RENACH, RENAVAM, RENAINF e RENAEST — a propagação não é opcional
   nem assíncrona-sem-garantia: precisa ser rastreável.
3. **Correção de dado do órgão ≠ correção de ato administrativo.** Corrigir endereço, telefone ou
   grafia de nome é providência de dado. Alterar o **conteúdo de um ato** — o enquadramento de uma
   infração, a gravidade registrada num sinistro, o resultado de um exame — não se faz por
   requerimento de titular: faz-se pela via processual própria (defesa, recurso, junta médica). O
   PORTAL tem de rotear corretamente, e **explicar** ao cidadão por que a via é outra, em vez de
   indeferir sem alternativa.
4. **Há um caso em que a correção é a via correta mesmo tocando processo**: dado **factual e
   objetivamente errado** registrado no processo — destino hospitalar equivocado, gravidade de vítima
   registrada incorretamente ([RN-BOAT-126]), placa digitada com erro. Aqui não se discute mérito, e
   sim exatidão (art. 6º, V).

**Regra — portabilidade.** O PORTAL **não oferece** portabilidade como funcionalidade, e diz por quê.
O direito existe no art. 18, V, mas depende de _"regulamentação da autoridade nacional"_ que **não foi
localizada** para o setor público, e não há, no ecossistema de trânsito, "outro fornecedor de serviço
ou produto" para quem portar um prontuário de condutor — o registro é nacional, único e legalmente
atribuído aos órgãos do SNT. Em lugar de portabilidade, o PORTAL oferece o que atende ao interesse
prático subjacente e tem base sólida: **exportação do próprio dado em formato legível por máquina**,
gratuitamente, a critério do titular quanto ao meio (art. 19, § 2º).

**Base legal.**

- [REF-LEI-13709-2018] art. 18, III: _"correção de dados incompletos, inexatos ou desatualizados"_;
  V: _"portabilidade dos dados a outro fornecedor de serviço ou produto, mediante requisição expressa,
  **de acordo com a regulamentação da autoridade nacional**, observados os segredos comercial e
  industrial"_ _(Redação dada pela Lei nº 13.853, de 2019)_.
- [REF-LEI-13709-2018] art. 18, § 6º: _"O responsável deverá informar, de maneira imediata, aos
  agentes de tratamento com os quais tenha realizado uso compartilhado de dados a correção, a
  eliminação, a anonimização ou o bloqueio dos dados, para que repitam idêntico procedimento [...]"_
- [REF-LEI-13709-2018] art. 6º, V: princípio da _"qualidade dos dados: garantia, aos titulares, de
  exatidão, clareza, relevância e atualização dos dados, de acordo com a necessidade e para o
  cumprimento da finalidade de seu tratamento"_.
- [REF-LEI-13709-2018] art. 19, § 2º: _"As informações e os dados poderão ser fornecidos, a critério
  do titular: I - por meio eletrônico, seguro e idôneo para esse fim; ou II - sob forma impressa."_
- [REF-CTB-280-290] art. 282, § 1º e [REF-CONTRAN-918] art. 32, § 5º: o **dever de manter endereço
  atualizado** é do proprietário, e a notificação devolvida por endereço desatualizado após venda é
  válida para todos os efeitos — o que faz da correção de endereço no PORTAL um instrumento de
  proteção do próprio cidadão, e não uma conveniência.
- [REF-LEI-13460-2017] art. 5º, XIV: linguagem simples — aplicável à explicação de por que uma
  correção foi roteada para a via processual.

**Verificação.** (a) Toda tela com dado do titular tem ação de correção contextual. (b) O requerimento
de correção distingue no modelo `tipo ∈ {dado_cadastral, dado_factual_de_processo, mérito_de_ato}` e o
terceiro tipo é **roteado**, com explicação e link para a via correta — nunca simplesmente indeferido.
(c) Correção efetivada dispara e registra a propagação aos registros nacionais, com evidência por
destino. (d) A exportação do próprio dado está disponível em formato aberto e legível por máquina, sem
custo. (e) Nenhuma tela do PORTAL usa a palavra "portabilidade" para descrever a exportação — são
coisas juridicamente distintas.

**Controvérsia/risco.** (a) A ausência de regulamentação da ANPD sobre portabilidade no setor público
é **lacuna normativa**, não de pesquisa: mesmo que fosse regulamentada, faltaria o destinatário. Se um
parecerista entender que o direito é autoaplicável, a consequência prática permanece próxima da
exportação aqui proposta. (b) O item 3 é a fronteira mais delicada de todo o bloco LGPD: pedidos de
"corrigir" a infração serão frequentes, e tratá-los como correção de dado abriria uma via paralela de
revisão de mérito **sem** as garantias, os prazos e a competência do processo administrativo de
trânsito — inclusive contornando a decisão de steering C.22, que fechou o canal de revisão
pós-encerramento. O roteamento correto, com explicação, é o que impede esse desvio. (c) A propagação
do § 6º depende de sistemas nacionais fora do controle do projeto (mesma dependência já registrada em
[RN-RAIT-124] quanto ao SNE): o dever é do órgão, mas a garantia de execução não é integralmente
sua — o que exige trilha de auditoria própria do lado do DETRAN-AM. Ver `_intake/legal-assessment.md`.
