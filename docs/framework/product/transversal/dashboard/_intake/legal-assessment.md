---
id: LEGAL-ASSESSMENT-DASHBOARD
title: Avaliação jurídica — DASHBOARD (rodada transversal, greenfield)
status: draft
apps: [dashboard]
sources:
  [
    REF-LEI-12527-2011,
    REF-LEI-14129-2021,
    REF-LEI-13460-2017,
    REF-LEI-13709-2018,
    REF-DECRETO-8777-2016,
    REF-CONTRAN-918,
    REF-CONTRAN-808-2020,
    REF-CTB-sinistro-cena-renaest,
    REF-CONTRAN-809-2020,
    REF-TCEAM-MANUAL-AUDITORIA-TI,
    REF-SENATRAN-PORTARIA-139-2025,
    REF-SENATRAN-997,
  ]
updated: 2026-08-24
---

# Avaliação jurídica — DASHBOARD

## 0. Enquadramento da camada

O DASHBOARD **não tem processo administrativo próprio voltado ao cidadão**. Sua camada jurídica tem
duas naturezas, formalizadas em [RN-DASH-102] e que governam todo este documento:

- **(a) Deveres derivados de vigilância** — cada teto legal, prazo extintivo e requisito de validade
  dos demais apps torna-se algo que **precisa ser observado**. A obrigação de origem é do outro app; o
  DASHBOARD responde por **omissão de diligência**.
- **(b) Deveres próprios** — transparência ativa e passiva, dados abertos, anonimização, trilha de
  auditoria e controle de acesso. Aqui a obrigação recai **diretamente** sobre o painel e sobre o
  órgão.

Duas consequências de método: nas regras da família (a) **não se restata a norma de origem** (cita-se
a regra-teto pelo id); nas da família (b) a ancoragem é **verbatim**.

---

## 1. Inventário produzido

**30 regras** em `transversal/dashboard/rules/`, todas `status: draft`.

| Faixa   | Bloco                           | Regras                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 101-102 | Fronteira e natureza da camada  | [RN-DASH-101] vedação de ato de negócio; [RN-DASH-102] as duas famílias                                                                                                                                                                                                                                                                                                                                                  |
| 110-120 | Deveres periódicos próprios     | [RN-DASH-110] FUNSET dia 20; [RN-DASH-111] relatório mensal de cartão; [RN-DASH-112] repasse de 5%; [RN-DASH-113] RENAEST sem relógio; [RN-DASH-114] Pnatrans/30 de abril; [RN-DASH-115] relatório anual de ouvidoria; [RN-DASH-116] prazos de ouvidoria 30+30/20+20; [RN-DASH-117] satisfação anual e ranking; [RN-DASH-118] LAI 20+10; [RN-DASH-119] aviso de vencimento da CNH D-30; [RN-DASH-120] tabela consolidada |
| 130-135 | Deveres derivados de vigilância | [RN-DASH-130] regra geral; [RN-DASH-131] RAIT; [RN-DASH-132] PEC; [RN-DASH-133] BOAT/RENAEST; [RN-DASH-134] TEAT; [RN-DASH-135] o alerta como prova                                                                                                                                                                                                                                                                      |
| 140-142 | Transparência                   | [RN-DASH-140] ativa; [RN-DASH-141] passiva; [RN-DASH-142] classificação P1/P2/P3                                                                                                                                                                                                                                                                                                                                         |
| 150-151 | Dados abertos                   | [RN-DASH-150] escopo federativo; [RN-DASH-151] requisitos do conjunto                                                                                                                                                                                                                                                                                                                                                    |
| 160-162 | Anonimização e agregação        | [RN-DASH-160] art. 12; [RN-DASH-161] reidentificação em recortes pequenos; [RN-DASH-162] art. 13 e dado de saúde                                                                                                                                                                                                                                                                                                         |
| 170-172 | Auditoria e acesso              | [RN-DASH-170] segregação por papel; [RN-DASH-171] trilha própria; [RN-DASH-172] exportação                                                                                                                                                                                                                                                                                                                               |

---

## 2. Riscos jurídicos — priorizados

### R1 — Reidentificação em publicação agregada de sinistros _(severidade: ALTA)_

O Amazonas tem 62 municípios, muitos com poucos milhares de habitantes. A combinação
**município × período × gravidade** é, na maior parte do território, um identificador prático:
_"1 óbito em maio de 2025"_ num município pequeno é o nome de uma pessoa. Agravantes: (a) a pressão
legítima por transparência de mortalidade empurra por granularidade municipal; (b) o índice do
Pnatrans é apurado **por Estado** e comparativo, o que gera demanda por recortes finos para
"explicar" o número; (c) a reidentificação não exige técnica, apenas conhecimento local — logo é
**indetectável por qualquer controle técnico**. Não há, no corpus, norma que fixe limiar de célula,
k-anonimato ou metodologia obrigatória: o padrão do art. 12 é o aberto _"esforços razoáveis"_.
→ [RN-DASH-160], [RN-DASH-161], [RN-BOAT-130], [RN-BOAT-131].
**Mitigação**: generalização geográfica como padrão; supressão primária **e secundária**; vedação de
consulta parametrizada livre na superfície pública; decisão de limiar documentada com o Encarregado;
**parecer formal antes da primeira publicação**.

### R2 — Aplicabilidade do art. 13 da LGPD à estatística de sinistro _(severidade: ALTA)_

O art. 13 é redigido para _"estudos em saúde pública"_ por _"órgãos de pesquisa"_. O DETRAN-AM
produzindo estatística de sinistro **não é literalmente** isso. A leitura adotada em [RN-DASH-162] é
que o art. 13 vale como **piso de cuidado por analogia** (a atividade material é a mesma), e **não**
como base legal do tratamento — esta continua sendo o art. 11, II c/c art. 23 ([RN-BOAT-123]).
Se um parecer rejeitar a analogia, cai o fundamento expresso de três exigências relevantes: ambiente
controlado, pseudonimização e — a mais consequente — **vedação absoluta de transferência a terceiro**
(§ 2º), que hoje sustenta a proibição de exportar dado de saúde para BI de terceiros e consultorias.
**É o item nº 1 do handoff LEGAL do dossiê e o mais urgente deste documento.**

### R3 — Escopo federativo dos normativos de dados abertos e governo digital _(severidade: ALTA)_

Os quatro instrumentos têm alcances **diferentes** sobre uma autarquia estadual, e tratá-los como um
só é o erro jurídico mais provável do bloco de transparência:

| Instrumento        | Alcance sobre o DETRAN-AM                                                                       |
| ------------------ | ----------------------------------------------------------------------------------------------- |
| LAI (12.527/2011)  | **Vincula** — todos os entes                                                                    |
| Lei 13.460/2017    | **Vincula** — alcance nacional                                                                  |
| Decreto 8.777/2016 | **Não vincula** — decreto do Executivo **federal**; monitoramento pela CGU                      |
| Lei 14.129/2021    | **Condicional** (art. 2º, III) — só com **ato normativo próprio do Estado**, **não localizado** |

O art. 22 da Lei 14.129/2021 é o **único dispositivo do corpus que nomeia um painel de monitoramento
como componente obrigatório** — e é justamente o de vigência condicional. Construir o módulo público
sobre ele e descobrir depois que o Amazonas nunca aderiu esvaziaria a âncora nominal.
→ [RN-DASH-150]. **Mitigação de arquitetura documental**: ancorar **primariamente na LAI** (art. 8º,
§ 3º, II-IV, que impõe formato aberto e acesso legível por máquina sem condicionante) e citar a Lei
14.129 como convergência. Assim a resposta ao parecer é "muda a citação", não "muda o produto".

### R4 — Segregação de acesso num painel que agrega saúde, processo e campo _(severidade: ALTA)_

O DASHBOARD agrega, numa superfície só, dado de todos os domínios. **Um perfil único concede mais
alcance sobre dado pessoal do que qualquer papel dos apps de origem jamais teve.** O risco é
sociológico, não técnico: a demanda por "visão 360º do cidadão" é recorrente, tem apelo intuitivo e é
exatamente o que a LGPD chama de tratamento excessivo (art. 6º, III) — consolidar processo de
infração + exame clínico + histórico de sinistros da mesma pessoa **cria um perfil** que nenhuma
finalidade declarada sustenta. Ponto cego adicional: o papel `technical-admin`, que costuma receber
acesso irrestrito por conveniência operacional embora administrar infraestrutura não crie necessidade
de ver conteúdo.
→ [RN-DASH-170], [RN-DASH-172]. **Mitigação**: camada **N3 fora do escopo do produto** (dado sensível
não é servido ao painel, para ninguém); segregação horizontal por domínio; break-glass nominado,
temporário, notificado e revisado; revisão periódica de concessões.

### R5 — A trilha de alertas prova diligência **e** prova omissão _(severidade: ALTA)_

Um painel que registra alertas cria evidência de que o órgão **sabia**. Se um processo prescrever
após quatro alertas ignorados, a trilha documenta a omissão — e alimenta diretamente a apuração de
responsabilidade funcional que a Lei 9.873/1999 prevê para a paralisação ([RN-RAIT-113]). Isso é
desconfortável e é o ponto: a alternativa (não monitorar para não deixar rastro) é indefensável e
**agrava** a responsabilidade, por violar o dever de demonstração do art. 6º, X da LGPD.
→ [RN-DASH-130], [RN-DASH-135]. **Mitigação**: escalonamento hierárquico obrigatório com destinatário
nomeado por degrau; prazo interno de tratamento do próprio alerta; combate ativo à fadiga de alerta
(alertas insanáveis migram para conformidade estrutural).

### R6 — Fundamento dos relógios do RAIT depende de decisões de steering sem parecer _(severidade: média-alta)_

Três itens `[BLOQUEIA]` sustentam [RN-DASH-131] sem parecer jurídico formal: **C.13** (aplicabilidade
da Lei 9.873/1999 ao processo estadual), **C.14** (prevalência do prazo mais curto) e **C.15**
(declaração de prescrição de ofício). Se C.13 for revertido, **os relógios C1 e C2 desaparecem** e a
calibração de risco do painel muda materialmente. Requisito de arquitetura derivado deste risco: o
painel deve permitir **desativar a família C sem reescrever a família B**.

### R7 — Deveres sem sanção tratados como opcionais _(severidade: média)_

Em **dez das treze** linhas da tabela consolidada ([RN-DASH-120]) a norma impõe e **não comina**
consequência. Apenas três têm consequência expressa: a suspensão da autorização de cartão
([REF-CONTRAN-918] art. 27, § 7º), a responsabilidade do agente pela recusa de manifestação
([REF-LEI-13460-2017] art. 11) e a responsabilidade por retardamento deliberado de acesso
([REF-LEI-12527-2011] art. 32). A ausência de sanção não torna o dever facultativo — mas cria a
tentação de tratá-lo como meta. **Nesses casos a transparência é a sanção efetiva**, o que reforça a
importância do bloco 140-142.

### R8 — Ausência de norma estadual de governança de TI _(severidade: média)_

Não há norma estadual específica e vinculante de governança/auditoria de TI aplicável nominalmente ao
DETRAN-AM ([REF-TCEAM-MANUAL-AUDITORIA-TI]). O que existe é competência **genérica** de auditoria
operacional do TCE-AM (Regimento Interno de 2002, art. 5º, VII — extensão a TI por interpretação,
apoiada em INTOSAI/ISSAI 5300) e a base federal da LGPD (arts. 37, 46, 48). [RN-DASH-171] está
ancorada na LGPD, **não** no Manual do TCE-AM, que é material técnico interno do Tribunal.

### R9 — Publicação de risco processual _(severidade: média)_

Publicar "temos N processos prestes a prescrever" entrega mapa de defesa a quem litiga contra o
órgão. Não há dever de publicar isso; o interesse público é atendido pelo indicador agregado de
cumprimento de prazos do art. 23, III da Lei 13.460/2017, que mede a mesma realidade sem
individualizar o alvo. → [RN-DASH-142], camada P3.

### R10 — Exportação como ponto de fuga _(severidade: alta em probabilidade, média em impacto unitário)_

Anula toda a segregação de acesso e toda a agregação segura. Trivial de executar, intenção quase
sempre legítima, invisível sem instrumentação dedicada. Em painéis de gestão pública o vazamento
típico não vem de invasão — vem de uma planilha correta, exportada por alguém autorizado, para uma
finalidade razoável, e encaminhada uma vez a mais. → [RN-DASH-172].

### R11 — Índice do Pnatrans sem a fórmula normativa _(severidade: média)_

O art. 326-A, § 8º delega ao CONTRAN a definição das **fórmulas** e da metodologia; nenhuma delas foi
localizada. Sem elas o DASHBOARD pode monitorar completude do insumo e a data de 30 de abril, mas
**não pode reproduzir o índice oficial** com fidelidade garantida. Publicar um número como se fosse "o
índice do Pnatrans" é risco de desinformação institucional. → [RN-DASH-114].

### R12 — Instância recursal da LAI para autarquia estadual do AM _(severidade: média, urgência alta)_

A cadeia recursal do art. 16 da LAI é **federal** (CGU). O procedimento aplicável ao DETRAN-AM não foi
localizado. Consequência prática imediata: o dever do art. 11, § 4º — **informar ao requerente a
possibilidade de recurso, prazos e condições** — não pode ser cumprido com conteúdo correto hoje. O
órgão está informando um direito cujo endereço desconhece. → [RN-DASH-118], [RN-DASH-141].

---

## 3. Lista priorizada para advogado humano

| #   | Questão                                                                                                                                                                                                                                       | Bloqueia                                                               | Regras afetadas                                  |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------ |
| 1   | **O art. 13 da LGPD aplica-se, por analogia, ao tratamento estatístico de sinistro pelo DETRAN-AM?** Se não, qual o piso de cuidado e qual o fundamento da vedação de transferência a terceiro?                                               | módulo de estatística de sinistro; arquitetura de BI                   | [RN-DASH-162], [RN-DASH-172], [RN-BOAT-130..132] |
| 2   | **O Estado do Amazonas adotou a Lei 14.129/2021 por ato normativo próprio (art. 2º, III)?**                                                                                                                                                   | base legal do painel público (art. 22); elevação estatutária no PORTAL | [RN-DASH-150], [RN-DASH-117], [RN-DASH-140]      |
| 3   | **Qual granularidade de publicação de estatística de sinistro é juridicamente segura no AM?** Limiar de célula, regra de supressão, tratamento de municípios de baixa população.                                                              | primeira publicação de dados de sinistro                               | [RN-DASH-160], [RN-DASH-161]                     |
| 4   | **Qual a instância e o procedimento recursais da LAI para uma autarquia estadual do AM?** Existe lei/decreto estadual de acesso à informação?                                                                                                 | cumprimento do art. 11, § 4º                                           | [RN-DASH-118], [RN-DASH-141]                     |
| 5   | **Confirmação do item C.13 do steering** (Lei 9.873/1999 aplicável ao processo do DETRAN-AM) — hoje decidido pelo Owner sem parecer.                                                                                                          | calibração dos relógios C1/C2                                          | [RN-DASH-131], [RN-RAIT-113]                     |
| 6   | **A lacuna do art. 326-A, § 9º pode ser suprida por norma interna do DETRAN-AM?** A União delegou ao CONTRAN e este não regulamentou — cabe ao Estado fixar prazo próprio de consolidação/repasse? _(item do handoff LEGAL do dossiê)_        | rótulo dos relógios do RENAEST                                         | [RN-DASH-113], [RN-BOAT-106]                     |
| 7   | **Regulamento estadual da LAI**: existe norma que detalhe os oito requisitos do art. 8º, § 3º para o AM, ou aplica-se o Decreto federal 7.724/2012 por analogia?                                                                              | checklist técnico do módulo público                                    | [RN-DASH-140]                                    |
| 8   | **Publicação nominal de desempenho de servidor** (relator, perito, agente) em painel interno e em transparência ativa: limites. O art. 23, § 2º da Lei 13.460/2017 manda publicar ranking **de entidades** — nominal de pessoa é outra coisa. | indicadores de produtividade                                           | [RN-DASH-135], [RN-DASH-142]                     |
| 9   | **Retenção da trilha de acesso e de alertas**: prazo defensável entre o dever de prova (relógios de até 5 anos) e a minimização do art. 6º, III.                                                                                              | política de retenção                                                   | [RN-DASH-171]                                    |
| 10  | **RIPD para o módulo que agrega dado de saúde** (art. 38): produzir preventivamente?                                                                                                                                                          | entrada em produção do módulo BOAT do painel                           | [RN-DASH-162]                                    |
| 11  | **Suficiência de conteúdo da prestação de informações do art. 26 da Res. 918** — a norma remete a _"forma disciplinada pelo órgão máximo executivo da União"_, não localizada.                                                                | completude do relógio nº 1                                             | [RN-DASH-110]                                    |
| 12  | **Vigência do art. 159, § 12 do CTB** (redação da Lei 15.428/2026, muito recente) e definição de _"meio eletrônico"_ para o aviso de vencimento da CNH.                                                                                       | dever de maior volume operacional                                      | [RN-DASH-119]                                    |

---

## 4. Propostas de REF para o orquestrador

> **Nota de escopo**: esta rodada **não escreve sob `refs/`** — o agente LEGAL do PORTAL detém os refs.
> Os itens abaixo são propostas explícitas para o orquestrador encaminhar.

### 4.1 Novos REFs a criar (prioridade alta)

1. **`REF-AM-LAI-<id>`** — lei/decreto estadual de acesso à informação do Amazonas, com o
   **procedimento recursal** aplicável a autarquia estadual. Resolve a questão 4 e destrava
   [RN-DASH-118]/[RN-DASH-141]. **Maior prioridade de pesquisa deste bloco.**
2. **`REF-AM-GOVDIGITAL-<id>`** — ato normativo estadual de adesão à Lei 14.129/2021 (art. 2º, III),
   **ou registro formal de sua inexistência** após busca exaustiva. Resolve a questão 2. Um "não
   existe" documentado vale tanto quanto um "existe" — hoje o corpus tem apenas silêncio.
3. **`REF-CGEAM-IN-001-2020`** e **`REF-DECRETO-AM-53273-2025`** — controle interno estadual e sistema
   Apoena. Textos não obtidos (portal `cge.am.gov.br` com HTTP 500 e certificado TLS expirado).
   **Recomenda-se solicitação direta à CGE-AM**, não nova tentativa web. Se criarem dever de reporte
   periódico, geram novas linhas em [RN-DASH-120].
4. **`REF-CONTRAN-PNATRANS-FORMULAS`** — resolução que define as fórmulas e a metodologia do índice do
   art. 326-A, § 8º. Resolve R11.

### 4.2 Ampliações de REFs existentes

5. **[REF-CONTRAN-918]** — acrescentar os **arts. 24, 26 e 27** verbatim ao arquivo `.md`. Hoje o REF
   cobre o processo de infração mas **não traz o Capítulo de arrecadação/FUNSET**, que é a base dos
   três primeiros relógios do DASHBOARD. Texto verbatim já extraído nesta rodada e transcrito em
   [RN-DASH-110], [RN-DASH-111] e [RN-DASH-112] — basta transpor. **Prioridade alta**: é a única
   fonte de relógio com dia numérico certo do corpus.
6. **[REF-LEI-13709-2018]** — acrescentar o **art. 5º, X** (definição de tratamento, que inclui
   _acesso_, _extração_ e _transferência_) e o **art. 11** verbatim. São as âncoras de [RN-DASH-171] e
   [RN-DASH-172] e hoje estão citadas por referência indireta.
7. **[REF-LEI-12527-2011]** — acrescentar o **art. 32** (condutas ilícitas: retardar deliberadamente,
   negar injustificadamente), única consequência pessoal do agente no bloco de transparência. Citado
   em [RN-DASH-118] e [RN-DASH-141] sem excerto verbatim no REF.
8. **[REF-CONTRAN-809-2020]** — o **art. 159, § 12** do CTB (aviso de vencimento da CNH) está
   capturado ali por conveniência, mas é dispositivo do CTB, não da Resolução 809. Sugere-se migrá-lo
   para `refs/ctb/` ou criar remissão cruzada explícita — hoje [RN-DASH-119] precisa citar uma
   resolução do CONTRAN para ancorar um artigo de lei federal, o que é confuso na leitura.

### 4.3 Correção proposta

9. **`refs/INDEX.md`** — registrar como gap conhecido a **ausência do regulamento do art. 8º, § 3º da
   LAI aplicável ao Amazonas** (o § 3º diz _"na forma de regulamento"_, e o Decreto federal 7.724/2012
   não vincula autarquia estadual). Hoje o gap não está catalogado.

---

## 5. Achados a propagar a outros apps

1. **PORTAL** — [RN-DASH-141] item 1: o formulário de pedido de acesso à informação **não pode** ter
   campo obrigatório de motivo/finalidade ([REF-LEI-12527-2011] art. 10, § 3º), e o de manifestação de
   ouvidoria tampouco ([REF-LEI-13460-2017] art. 10, § 2º). É teste automatizável e achado de
   conformidade de **baixo risco/alto impacto**, no mesmo espírito da decisão de steering D.28.
2. **PORTAL** — a Carta de Serviços do DETRAN-AM não publica **prazo máximo por serviço**
   ([REF-LEI-13460-2017] art. 7º, § 2º, IV — gap já registrado no próprio REF). Sem prazo publicado, o
   art. 23, III ("cumprimento dos compromissos e **prazos definidos**") não tem referência contra a
   qual medir. → [RN-DASH-117], item 6.
3. **BOAT** — [RN-DASH-161] detalha a **supressão secundária** (suprimir só a célula pequena não basta
   quando o total é publicado: o valor é recuperável por subtração). Vale a pena referenciá-la de
   [RN-BOAT-131], que hoje trata a anonimização em nível de princípio.
4. **TEAT** — [RN-DASH-134] identifica a família de vigilância com **maior razão impacto/esforço** do
   ecossistema: inventário de equipamentos e versões com data de validade. Dado de origem pequeno,
   alerta trivial, e a consequência de não tê-lo é a produção **massiva e invisível** de atos viciados
   ([RN-TEAT-117], [RN-TEAT-135], [RN-TEAT-138]). Sugere-se elevar a prioridade do inventário no TEAT.
5. **PEC** — a composição das juntas não está modelada (`shared/actors.md`: "composição não modelada
   hoje (backlog)"), mas é **requisito de validade da decisão** ([RN-PEC-111]). O DASHBOARD não tem
   dado de origem para monitorá-la e exibirá "não instrumentado" até que o PEC o produza.
6. **RAIT** — o steering registrou como não fechado o **throughput real do colegiado** (casos
   julgados/mês). É o insumo que transforma o painel de prescrição de reativo em preditivo: a inversão
   entre vazão e entrada é previsível com meses de antecedência ([RN-DASH-131], item 3).

---

## 6. Decisões pendentes do Owner

1. **Limiar de célula e regra de supressão** para publicação de estatística agregada de sinistro —
   [RN-DASH-161]. Não há norma; é decisão do órgão com apoio do Encarregado. **Não publicar nada de
   sinistro antes desta decisão.**
2. **Adotar prazo interno de transmissão ao RENAEST?** Se sim, rotulado como _meta interna sem
   fundamento legal vigente_ — [RN-DASH-113], [RN-BOAT-106]. Relaciona-se à questão 6 da lista de
   advogado.
3. **Calibração das escadas de alerta por relógio** — [RN-DASH-120], [RN-DASH-135]. A calibração do
   RAIT já está aprovada (steering A.1); as demais (FUNSET, ouvidoria, LAI, CNH, custódia TEAT) são
   novas e precisam de decisão.
4. **Publicar ou não estatística estadual de sinistro** (camada P2 de [RN-DASH-142]) — não há dever;
   é decisão institucional que **cria responsabilidade de controlador**.
5. **Existe break-glass no DASHBOARD?** Se sim, com os quatro elementos de [RN-DASH-170] item 4. Se
   não, decidir explicitamente que não há.
6. **Prazo de retenção** da trilha de acesso e de alertas — [RN-DASH-171], item 4.
