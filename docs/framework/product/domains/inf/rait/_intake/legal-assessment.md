---
id: LEGAL-ASSESSMENT-RAIT
title: Parecer técnico-legal — riscos, conflitos normativos e questões abertas do corpus do RAIT
status: reviewed
apps: [rait, portal, dashboard]
sources:
  [
    REF-CTB-280-290,
    REF-CONTRAN-900,
    REF-CONTRAN-918,
    REF-CONTRAN-931,
    REF-CONTRAN-357,
    REF-LEI-9873-1999,
    REF-LEI-9784-1999,
    REF-DETRANAM-PORTARIA-5046,
    REF-DETRANAM-SERVICOS,
    REF-CETRAN-PROCESSO-INTERNO,
  ]
updated: 2026-08-24
---

# Escopo e método

Produzido pelo especialista **LEGAL** a partir do dossiê do CRAWLER e do corpus completo em `refs/`.
Método: cada dispositivo que ancora regra de negócio foi **reconferido contra a fonte primária local**
(`planalto_plain.txt` para o CTB e as leis; `pdftotext` dos PDF oficiais do DOU para as resoluções
CONTRAN; `.txt` de OCR para a Portaria 5046/2018). Onde a fonte era secundária, isso está sinalizado.

**Regra de disciplina adotada:** onde o texto normativo é ambíguo, silente ou conflitante, este
documento **registra a lacuna** e propõe uma leitura de trabalho explicitamente rotulada como
interpretação. **Nenhuma lacuna foi preenchida com norma inventada, jurisprudência não verificada ou
"prática de mercado".**

Produtos desta rodada: `refs/ctb/REF-CTB-280-290.md` (excerto refinado) e a série
`inf/rait/rules/RN-RAIT-101` a `RN-RAIT-132` (32 regras legais).

---

# 1. A tabela consolidada de prazos e relógios de extinção

## 1.1 Prazos do administrado (o cidadão precisa agir)

| Ato                                      | Prazo                                                                            | Termo inicial                                    | Natureza           | Base                                  | RN            |
| ---------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------ | ------------------ | ------------------------------------- | ------------- |
| Defesa da autuação                       | **≥ 30 dias**, valendo a data impressa na NA                                     | Expedição da NA (ou publicação do edital)        | **Piso legal**     | CTB 281-A; Res. 918 art. 4º §2º       | [RN-RAIT-101] |
| Defesa — NA expedida antes de 12/04/2021 | **≥ 15 dias**                                                                    | idem                                             | Piso (transitório) | Res. 918 art. 4º §6º                  | [RN-RAIT-101] |
| Indicação do condutor infrator           | **30 dias**                                                                      | Notificação da autuação                          | Fixo               | CTB 257 §7º                           | [RN-RAIT-120] |
| Recurso à JARI                           | **≥ 30 dias**, valendo a data impressa na NP; **é também o vencimento da multa** | Notificação da penalidade                        | **Piso legal**     | CTB 282 §§4º-5º; Res. 918 art. 12, IV | [RN-RAIT-102] |
| Recurso ao CETRAN-AM                     | **30 dias**                                                                      | Publicação **ou** notificação da decisão da JARI | **Fixo em lei**    | CTB 288 _caput_                       | [RN-RAIT-103] |
| Desistência                              | Até a **realização do julgamento**                                               | —                                                | Limite de ato      | Res. 900 art. 11                      | [RN-RAIT-123] |
| Atendimento de diligência                | Fixado pelo órgão no ato                                                         | Solicitação                                      | Fixado caso a caso | Res. 900 art. 9º                      | [RN-RAIT-004] |

**Ciência ficta pelo SNE:** notificado **30 dias após** inclusão no sistema + envio da mensagem —
CTB 282-A §2º; Res. 931 art. 4º §6º. O canal eletrônico **retarda** o início do prazo do cidadão em
30 dias; não o antecipa ([RN-RAIT-104], [RN-RAIT-124]).

**Contagem:** dias **consecutivos**, excluído o dia inicial, incluído o do vencimento, prorrogando
para o 1º dia útil (Res. 918 art. 29; Lei 9.784 art. 66, subsidiária) — [RN-RAIT-005]. **Não há
suspensão**, salvo força maior nos termos de regulamento do CONTRAN **não localizado** (CTB 290-A;
Lei 9.784 art. 67) — [RN-RAIT-105].

## 1.2 Prazos do órgão (SLA legal, sem sanção expressa)

| Ato                                  | Prazo                                            | Termo inicial                   | Sanção do descumprimento   | Base                                  | RN            |
| ------------------------------------ | ------------------------------------------------ | ------------------------------- | -------------------------- | ------------------------------------- | ------------- |
| Expedição da NA                      | **30 dias**                                      | Cometimento da infração         | **Arquivamento do AIT**    | CTB 281 §1º, II; Res. 918 art. 4º §1º | [RN-RAIT-115] |
| Remessa do recurso à JARI            | **10 dias**                                      | Interposição                    | **Nenhuma prevista** ⚠     | CTB 285 §2º                           | [RN-RAIT-107] |
| Julgamento pela JARI                 | **24 meses**                                     | Recebimento pelo órgão julgador | **Prescrição** (CTB 289-A) | CTB 285 §6º                           | [RN-RAIT-110] |
| Julgamento pelo CETRAN               | **24 meses**                                     | Recebimento pelo órgão julgador | **Prescrição** (CTB 289-A) | CTB 289 _caput_                       | [RN-RAIT-111] |
| _(SLA operacional local, não legal)_ | 30 dias corridos (defesa) / 30 dias úteis (JARI) | —                               | Meta interna               | Cartas de serviço DETRAN-AM           | —             |

## 1.3 Os quatro relógios de extinção da punibilidade

| #   | Instituto                                         | Prazo                                                   | Termo inicial                                                                    | Reinicia?                                                                                                                                                   | Efeito                                                                                             | Base                                                  | RN            |
| --- | ------------------------------------------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ------------- |
| 1   | **Decadência** do direito de aplicar a penalidade | **180 dias**; **360** se houve defesa prévia tempestiva | Cometimento da infração (ou conclusão do processo que lhe der causa)             | Não                                                                                                                                                         | Extingue o **direito de aplicar** — não há NP válida                                               | CTB 282 §§6º, 6º-A e 7º; Res. 918 art. 9º §§2º-3º     | [RN-RAIT-114] |
| 2   | **Prescrição quinquenal** da ação punitiva        | **5 anos**                                              | Prática do ato (ou cessação, se permanente/continuada)                           | **Sim** — interrompe-se por notificação/citação inclusive por edital, ato inequívoco de apuração, decisão condenatória recorrível, tentativa de conciliação | Extingue a **ação punitiva**                                                                       | Lei 9.873 art. 1º _caput_ e art. 2º; Res. 918 art. 36 | [RN-RAIT-113] |
| 3   | **Prescrição intercorrente** por paralisação      | **3 anos**                                              | Última movimentação; corre com o processo **pendente de julgamento ou despacho** | **Sim**, a cada ato de impulso                                                                                                                              | Prescrição; autos **arquivados de ofício** ou a pedido, sem prejuízo de responsabilidade funcional | Lei 9.873 art. 1º §1º                                 | [RN-RAIT-113] |
| 4   | **Prescrição por não julgamento** do recurso      | **24 meses por instância**                              | Recebimento do recurso **pelo órgão julgador**                                   | Não                                                                                                                                                         | **Prescrição da pretensão punitiva**                                                               | CTB 289-A c/c 285 §6º e 289 _caput_                   | [RN-RAIT-112] |

### Como os quatro interagem — leitura de trabalho

- **Fases diferentes.** (1) opera **antes** da NP; (4) opera **apenas na fase recursal**; (2) e (3)
  atravessam **todo** o processo.
- **Gatilhos diferentes entre (3) e (4).** (3) pune a **inatividade**; (4) pune a **ausência de
  decisão** ainda que haja atividade. Um processo movimentado mas não julgado atinge (4) sem nunca
  atingir (3). Um processo parado atinge (3) primeiro. **Nenhum absorve o outro** — o RAIT precisa
  dos dois relógios rodando em paralelo.
- **O teto que primeiro vence prevalece**, porque cada um extingue a punibilidade por fundamento
  próprio.
- **Colisão estrutural.** Somados os tetos de (4), um processo pode consumir **até 48 meses** em
  julgamento (24 na JARI + 24 no CETRAN) sem violar o CTB — além do tempo de defesa, dos 10 dias de
  remessa e dos intervalos **não computados** entre instâncias. Esse horizonte **excede** os 3 anos
  de (3) e pode aproximar-se dos 5 anos de (2). Ou seja: **um processo formalmente dentro do teto do
  CTB pode já estar prescrito pela lei geral.** Este é o conflito material mais sério do corpus e
  está no item 9 abaixo.

### Tetos de SLA que o RAIT deve adotar

Derivados dos relógios acima, com margem deliberada:

| Alarme      | Gatilho                                             | Ação                                                                   |
| ----------- | --------------------------------------------------- | ---------------------------------------------------------------------- |
| Amarelo     | 50% do teto da instância (12 meses do recebimento)  | Sinalização no acervo do relator                                       |
| Laranja     | 75% (18 meses)                                      | Escalada à presidência/secretaria; priorização compulsória de pauta    |
| Vermelho    | 87,5% (21 meses)                                    | Alerta ao gestor do órgão; topo absoluto da fila                       |
| Crítico     | 24 meses                                            | Bloqueio de movimentação de mérito; tarefa de declaração de prescrição |
| Paralisação | 24 meses sem ato de impulso (Lei 9.873 §1º, 3 anos) | Alerta; **30 meses** → escalada compulsória                            |
| Decadência  | 150 dias / 300 dias (≈83% de 180/360)               | Alerta ao 1º circuito                                                  |

---

# 2. Riscos, conflitos e questões abertas (itens referenciados pelas RN)

## Item 1 — Citação de dispositivo REVOGADO como fonte de prazo (CTB art. 285 §3º)

**Severidade: alta (corrigido nesta rodada).** O [WF-RAIT-001] e `REF-DETRANAM-SERVICOS` atribuíam o
prazo de julgamento da JARI ao **art. 285 §3º do CTB**, revogado pela Lei 14.229/2021. O prazo vigente
é o do **§6º (24 meses)**. `REF-DETRANAM-SERVICOS` foi corrigido nesta rodada; **o [WF-RAIT-001] está
fora das minhas fronteiras de escrita e permanece com a citação incorreta** — correção pendente para
o especialista BPO ou para o owner.

## Item 2 — Conflito vertical: desconto de 40% no SNE (CTB 284 §6º × Res. 918 art. 21 × Res. 931 art. 9º)

**Severidade: alta.** O art. 284 §6º do CTB (Lei 14.599/2023) concede o desconto **ainda que o órgão
não tenha aderido ao SNE**; as Res. 918/2022 art. 21 e 931/2022 art. 9º §1º, I — anteriores —
estruturam o benefício em torno de documento de arrecadação **gerado e disponibilizado pelo SNE**, o
que pressupõe órgão aderente. Não há resolução CONTRAN pós-2023 harmonizando. Lei posterior prevalece
sobre resolução anterior, mas **falta procedimento** para emitir o documento de arrecadação com o
desconto fora do SNE. **Precisa de decisão jurídica antes de implementar o cálculo** ([RN-RAIT-127]).

## Item 3 — "Expedição" × "notificação" como termo inicial da defesa

**Severidade: média.** CTB 281-A e Res. 918 art. 4º §2º contam da **expedição**; Res. 918 art. 29
manda excluir o dia da **notificação**. Res. 918 art. 30 define expedição (entrega à empresa de
remessa postal / envio eletrônico), mas não harmoniza os dois vocábulos. Leitura adotada: termo
inicial = **expedição**, aplicando-se sobre ela a exclusão do dia inicial ([RN-RAIT-101],
[RN-RAIT-104]). **A validar.**

## Item 4 — Prazo de remessa de 10 dias sem sanção, e o intervalo não computado

**Severidade: média-alta (falha estrutural do desenho legal).** O art. 285 §2º dá 10 dias para a
autoridade remeter o recurso à JARI, mas o teto de 24 meses do §6º conta do **recebimento pelo órgão
julgador**. Atraso na remessa, portanto, **empurra para a frente** o início do relógio de prescrição
em vez de agravar a posição do órgão. Não há sanção legal expressa. O mesmo vale, com maior gravidade,
para o intervalo entre a decisão da JARI e o recebimento pelo CETRAN, que **não é computado em
nenhum** dos dois tetos. Mitigação possível apenas por controle interno ([RN-RAIT-107],
[RN-RAIT-111]).

## Item 5 — Recurso da autoridade contra decisão de provimento: lacuna procedimental completa

**Severidade: alta.** O CTB art. 288 §1º atribui à autoridade que impôs a penalidade a legitimidade
para recorrer da decisão de **provimento**. A Res. 918 art. 17, parágrafo único, apenas manda informar
o recorrente **se** a autoridade recorrer. Nada no corpus define:
(a) se o recurso é **discricionário ou vinculado** — o §1º é afirmativo mas não expressamente
exclusivo; (b) **qual autoridade** dentro do DETRAN-AM o exerce e sob que critérios; (c) o **prazo**
aplicável (o _caput_ fixa 30 dias "da publicação ou da notificação da decisão", marco não explicitado
para a autoridade); (d) se há **contraditório/contrarrazões** do cidadão. Socorro subsidiário mais
próximo: Lei 9.784 art. 62 e art. 64, parágrafo único. **Nenhum desses pontos pode ser resolvido por
inferência no desenho do sistema** ([RN-RAIT-130]).

## Item 6 — "Irrecorribilidade" da decisão do CETRAN não está no texto do art. 290

**Severidade: média.** O art. 290 declara o **encerramento da instância administrativa**, não a
irrecorribilidade. Consequências corretas: não há 3ª instância recursal ordinária (coerente com Lei
9.784 arts. 57 e 63, IV), **mas** o encerramento não é imutabilidade absoluta — a Lei 9.784 art. 65
admite **revisão a qualquer tempo** de processos sancionatórios diante de fatos novos, vedado o
agravamento. É aplicação **subsidiária** (art. 69), portanto construção interpretativa. Se o RAIT
oferecer canal de revisão pós-encerramento, isso exige decisão jurídica expressa do DETRAN-AM — cria
fila operacional sem prazo legal definido ([RN-RAIT-119]).

## Item 7 — Regulamento do CONTRAN sobre "força maior" não localizado

**Severidade: média.** CTB art. 290-A e Lei 9.784 art. 67 admitem suspensão de prazo por força maior
"nos termos de regulamento do Contran" — regulamento **não localizado** em duas rodadas de pesquisa.
Enquanto isso, suspensão de prazo no RAIT só pode existir como **ato administrativo motivado e
auditado**, nunca como regra automática ([RN-RAIT-105]).

## Item 8 — Prazo do recurso ao CETRAN quando há publicação **e** notificação

**Severidade: baixa-média.** O art. 288 usa "publicação **ou** notificação" sem definir prevalência
quando ambos ocorrem em datas distintas. Leitura de trabalho, mais protetiva: prevalece o marco **mais
recente** ([RN-RAIT-103]). **A validar.**

## Item 9 — Colisão entre o teto de 48 meses do CTB e a prescrição por paralisação de 3 anos

**Severidade: alta.** Ver §1.3 acima. Um processo pode estar dentro dos tetos do CTB e já prescrito
pela Lei 9.873 art. 1º §1º. Antes de fixar qualquer SLA institucional, é preciso decidir juridicamente
qual relógio governa a operação — e, na dúvida, adotar o **mais curto** ([RN-RAIT-111],
[RN-RAIT-113]).

## Item 10 — Aplicação da Lei 9.873/1999 (âmbito federal) a órgão estadual

**Severidade: alta — é a base declarada de dois dos quatro relógios.** O título e o _caput_ do art. 1º
delimitam a lei à **Administração Pública Federal, direta e indireta**. O DETRAN-AM é **estadual**. A
ponte é o **art. 36 da Res. CONTRAN 918/2022** — uma **resolução** estendendo por remissão uma lei de
âmbito expresso — cujo parágrafo único ainda atribui ao órgão máximo executivo da União a definição de
procedimentos de aplicação uniforme, **ato não localizado**. O corpus **não contém** parecer,
jurisprudência ou norma estadual que resolva a questão, e este documento **não a resolve por
inferência**. Nota adicional: o art. 5º da Lei 9.873 exclui matéria **tributária**, mas a multa de
trânsito é crédito **não tributário** (art. 1º-A), de modo que essa exclusão não é o obstáculo — o
obstáculo é o âmbito federal ([RN-RAIT-113]).

## Item 11 — Termo inicial da decadência nas autuações que não sejam em flagrante

**Severidade: alta em volume.** O art. 282 §6º-A remete a "forma definida pelo Contran" para o termo
inicial nas autuações **não flagranciais** — que são a maioria do volume em fiscalização eletrônica.
Essa regulamentação **não foi localizada**; a Res. 918 art. 9º §2º repete o marco genérico "data do
cometimento". Sem ela, o termo inicial fica juridicamente indefinido justamente na maior fatia do
acervo ([RN-RAIT-114]).

## Item 12 — Vigência da Res. CONTRAN 357/2010 (JARI): confiança apenas MODERADA

**Severidade: média.** Não foi localizada revogação expressa, e a resolução segue referenciada por
outros CETRAN; mas não há confirmação positiva definitiva. Além disso, a Resolução estabelece
**diretrizes para elaboração do regimento interno**, não regras autoaplicáveis — itens redigidos como
faculdade dependem do regimento local para produzir efeito. Confirmar vigência junto ao CONTRAN/SIC
antes de tratar a composição formal como requisito de sistema ([RN-RAIT-116]).

## Item 13 — Regimento interno da JARI-AM e do CETRAN-AM: gap não fechado

**Severidade: alta para o desenho operacional.** Após duas rodadas de pesquisa, nenhum dos dois
regimentos foi localizado publicamente (URLs históricas em 404, sem snapshot no Wayback). Pista **não
confirmada**: Decreto Estadual AM nº 34.398/2014, que teria instituído o CETRAN-AM e aprovado seu
regimento — texto não obtido. Sem eles, faltam: composição efetiva, quorum real, calendário de
sessões, critério de distribuição a relator, prazo interno de relatoria, regime de sustentação oral.
**Recomendação:** obter por canal não público (ofício ao DETRAN-AM / SIC-AM). Enquanto isso, o BPO
deve desenhar a partir do piso nacional (Res. 357/2010) e dos benchmarks de
[REF-CETRAN-PROCESSO-INTERNO], **rotulando** cada elemento importado como suposição de desenho.

## Item 14 — Captura da data de recebimento pelo CETRAN-AM

**Severidade: alta.** O CETRAN-AM não é órgão do DETRAN-AM. Sem integração ou comunicação formal, o
RAIT fica **cego** exatamente na instância onde o relógio de prescrição de [RN-RAIT-112] continua
correndo. É um requisito de integração, não apenas um detalhe de dados.

## Item 15 — Exigência de endosso cartorial sem base na norma local (oportunidade de conformidade)

**Severidade: baixa juridicamente, alta em atrito.** A carta de serviço "Recurso à JARI" sinaliza
exigência de **endosso em cartório do AM** para documentos autenticados em cartório de outro estado. A
[REF-DETRANAM-PORTARIA-5046] art. 2º, I e §2º **dispensa** o reconhecimento cartorial e autoriza o
próprio servidor do DETRAN-AM a lavrar a autenticidade da firma, sendo suficiente **procuração
particular** com firma reconhecida por autenticidade. A exigência adicional onera sobretudo
requerentes de fora do estado e é **eliminável sem qualquer alteração normativa** — basta rever a
linguagem da carta de serviço e o checklist do PORTAL ([RN-RAIT-121]). **É a melhora de conformidade
de menor custo e maior efeito imediato identificada nesta rodada.**

## Item 16 — "Pedido incompatível com a situação fática" como fundamento de não conhecimento

**Severidade: média.** Res. 900 art. 4º, IV é o único fundamento de inadmissibilidade que exige juízo
de **conteúdo**. Aplicado com rigor, converte-se em julgamento antecipado de mérito por via de
triagem, sem colegiado. Recomendação: restringi-lo a **ausência formal de pedido**, remetendo ao
mérito toda dúvida sobre compatibilidade ([RN-RAIT-122]). **Critério a validar.**

## Item 17 — Efeito da desistência da defesa sobre o prazo de 360 dias

**Severidade: baixa-média.** O art. 282 §6º do CTB condiciona o prazo estendido de 360 dias à
_"interposição de defesa prévia"_, não ao seu julgamento — donde a leitura de que a desistência **não
restaura** os 180 dias. O texto não regula o ponto expressamente ([RN-RAIT-123]). **A validar.**

## Item 18 — Refazimento de notificação falha × decadência

**Severidade: média.** Res. 918 art. 31 autoriza refazer a notificação falha "observados os prazos
prescricionais", **sem** mencionar a decadência do art. 282 §§6º-7º do CTB. Como a decadência extingue
o direito de aplicar a penalidade, refazer a NP após vencidos os 180/360 dias é juridicamente inócuo,
ainda que dentro do prazo prescricional. Recomendação: o sistema deve **bloquear**, não apenas
alertar ([RN-RAIT-126]). **Interpretação a validar.**

## Item 19 — Índice de correção da restituição (art. 286 §2º menciona a UFIR)

**Severidade: baixa.** O CTB menciona a **UFIR** — indexador extinto para a generalidade dos fins — "ou
índice legal de correção dos débitos fiscais". Qual índice o DETRAN-AM aplica **não consta do
corpus**: é definição da legislação estadual/fazendária do Amazonas, fora do escopo desta pesquisa
([RN-RAIT-129]).

## Item 20 — _Reformatio in pejus_ em 2ª instância

**Severidade: média.** O CTB **não** disciplina a possibilidade de a decisão de 2ª instância agravar a
situação do recorrente. A vedação de agravamento aparece apenas na Lei 9.784 art. 65, parágrafo único
(revisão), e o art. 64, parágrafo único exige contraditório prévio quando o gravame for possível —
ambos de aplicação **subsidiária**. Recomendação de precaução: prever passo de contraditório prévio
([RN-RAIT-132]). **A validar.**

## Item 21 — Remissões normativas quebradas (registro de higiene)

**Severidade: baixa, mas contamina citações.** Três remissões desatualizadas confirmadas contra as
fontes primárias:

1. **CTB art. 286 §1º** remete ao "parágrafo único do art. 284", inexistente na redação vigente
   (convertido em §§ numerados pela Lei 13.281/2016). Está assim **no compilado oficial** — não é erro
   de captura. Não derivar regra dele; aplicar o art. 284 §4º diretamente.
2. **Res. 918 art. 5º §3º** e **Res. 931 art. 5º** remetem ao "inciso II do parágrafo único do art.
   281 do CTB", renumerado para **§1º, II** pela Lei 14.304/2022.
3. **CTB art. 289, I, alíneas "a" e "b"** foram revogadas pela Lei 14.071/2020 — material de terceiros
   que ainda as cite está desatualizado.

## Item 22 — Divergência de vocabulário de desfecho

**Severidade: baixa, mas gera bug de modelagem.** O CTB usa "julgada **improcedente** a penalidade"
(art. 286 §2º) e "**provimento**/**não provimento**" (art. 288 §1º) para o mesmo par de desfechos; a
Res. 918 art. 17, parágrafo único, usa "**deferimento**". Fixar vocabulário canônico único no glossário
(sugestão: PROVIDO / NÃO PROVIDO / NÃO CONHECIDO / ACOLHIDA / INDEFERIDA para a defesa) e mapear a
terminologia legal a ele — sob pena de criar estados duplicados por acidente de citação.

## Item 23 — Convenção de percentual de desconto (40% × 60%)

**Severidade: baixa, alto risco de UX.** Res. 931 art. 9º §1º fala em **desconto de 40% e de 20%**;
Res. 918 arts. 20-21 e CTB art. 284 falam em **pagar 60% e 80%**. São equivalentes — não há divergência
normativa. Mas alternar as convenções na interface faz o cidadão ler "60%" como desconto. Fixar uma
convenção ([RN-RAIT-127]).

## Item 24 — Dependência de sistema fora do controle do projeto (SNE)

**Severidade: média-alta (arquitetural com efeito jurídico).** O SNE é sistema **da União** (CTB
282-A §4º; Res. 931 art. 1º). Todos os prazos ancorados nele — ciência ficta, marco de expedição,
dispensa de edital — dependem de integração confiável **e de trilha de auditoria própria do lado do
DETRAN-AM**. Sem essa trilha, o órgão não terá como **provar** a data de ciência ficta em caso de
litígio, e a exclusividade do SNE como "único meio tecnológico hábil" (Res. 931 art. 2º, parágrafo
único) impede recorrer a um canal eletrônico alternativo para suprir a falha ([RN-RAIT-124]).

## Item 25 — Fonte secundária remanescente no corpus (CETRAN-RS)

**Severidade: baixa (benchmark, não fonte normativa).** A Res. CETRAN-RS 88/2014 em
[REF-CETRAN-PROCESSO-INTERNO] foi capturada de **agregador jurídico**, não da fonte primária (o site
oficial recusou conexão). Como o material do RS é usado apenas como **benchmark de desenho** e não
vincula o DETRAN-AM, o risco é aceitável — mas nenhuma RN pode citá-lo como base legal. Confirmado:
nenhuma RN desta série o cita.

---

# 3. O que foi verificado e está firme (para não re-litigar)

Reconferido contra fonte primária local, **sem divergência**:

- CTB arts. 257, 280, 281, 281-A, 282, 282-A, 284, 285, 286, 287, 288, 289, 289-A, 290, 290-A —
  conferidos linha a linha contra `planalto_plain.txt`. Os extratos do CRAWLER estavam **materialmente
  corretos**; o refinamento acrescentou completude (art. 257 §§5º-8º) e anotação de risco.
- Res. CONTRAN 900/2022 e 918/2022 — extraídos dos PDF oficiais do DOU; as sínteses anteriores estavam
  corretas, e foram substituídas por verbatim nos artigos que ancoram RN.
- Res. CONTRAN 931/2022 — conferida contra o `.txt` do DOU; o rótulo "texto integral verbatim" da
  versão anterior era impreciso (vários artigos estavam sintetizados) e foi corrigido.
- Res. CONTRAN 357/2010 — conferida contra o `.txt`; corrigida a compressão dos subitens 4.1.a/4.1.b,
  que sugeria erroneamente serem o mesmo integrante.
- Lei 9.873/1999 e Lei 9.784/1999 — conferidas contra os `.txt` do planalto.

---

# 4. Lista priorizada — o que um advogado humano precisa validar

Ordenada por **risco × custo de errar**. Os cinco primeiros bloqueiam decisões de arquitetura.

| #     | Questão                                                                                                                                                                           | Por que bloqueia                                                                                                                                                                    | Refs                                       |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| **1** | **A Lei 9.873/1999 rege mesmo o processo administrativo de trânsito estadual?** A extensão vem de uma **resolução** (Res. 918 art. 36) sobre lei de âmbito expressamente federal. | Dois dos quatro relógios de extinção dependem dessa resposta. Se a resposta for "não", o RAIT tem apenas os prazos do CTB; se for "sim", o teto real é bem mais curto que 48 meses. | Item 10, [RN-RAIT-113]                     |
| **2** | **Qual relógio governa o SLA institucional** quando os tetos do CTB (até 48 meses somados) excedem a prescrição por paralisação de 3 anos?                                        | Define o teto de SLA de todo o produto e o desenho dos alarmes.                                                                                                                     | Item 9, [RN-RAIT-111], [RN-RAIT-113]       |
| **3** | **A prescrição do art. 289-A é automática e declarável de ofício?** E o julgamento proferido **após** os 24 meses é nulo, ineficaz ou válido?                                     | Define se o sistema declara prescrição sozinho ou apenas alerta, e se pode aceitar decisão tardia.                                                                                  | Item 9/§1.3, [RN-RAIT-112]                 |
| **4** | **Regime do recurso da autoridade contra decisão de provimento**: discricionário ou vinculado? qual autoridade? qual prazo? há contrarrazões?                                     | Sem isso não há como modelar o 2º circuito na direção órgão→CETRAN, que é metade do art. 288 §1º.                                                                                   | Item 5, [RN-RAIT-130]                      |
| **5** | **Desconto de 40% sem adesão do órgão ao SNE** (CTB 284 §6º × Res. 918 art. 21 / Res. 931 art. 9º): como operacionalizar o documento de arrecadação?                              | Erro aqui é erro de cálculo de valor devido, com exposição direta ao cidadão.                                                                                                       | Item 2, [RN-RAIT-127]                      |
| 6     | Termo inicial da decadência nas **autuações não flagranciais** (CTB 282 §6º-A) — regulamentação do CONTRAN não localizada.                                                        | Afeta a maior fatia do acervo.                                                                                                                                                      | Item 11, [RN-RAIT-114]                     |
| 7     | Vigência atual da **Res. CONTRAN 357/2010** e obtenção dos **regimentos internos da JARI-AM e do CETRAN-AM** (checar Decreto Estadual AM 34.398/2014).                            | Sem eles, todo o processo interno é suposição de desenho.                                                                                                                           | Itens 12 e 13, [RN-RAIT-116]               |
| 8     | Regulamento do CONTRAN sobre **força maior** para suspensão de prazos (CTB 290-A).                                                                                                | Define se a funcionalidade de suspensão existe como regra ou só como ato motivado.                                                                                                  | Item 7, [RN-RAIT-105]                      |
| 9     | **Expedição × notificação** como termo inicial da defesa (CTB 281-A × Res. 918 art. 29).                                                                                          | Diferença de dias na tempestividade, aplicada a todo o volume.                                                                                                                      | Item 3, [RN-RAIT-101]                      |
| 10    | Cabe **revisão pós-encerramento** da instância com base na Lei 9.784 art. 65? E há vedação de _reformatio in pejus_ em 2ª instância?                                              | Define se existe (e como se governa) uma fila sem prazo legal.                                                                                                                      | Itens 6 e 20, [RN-RAIT-119], [RN-RAIT-132] |
| 11    | Critério de aplicação do art. 4º, IV da Res. 900/2022 ("pedido incompatível").                                                                                                    | Evita julgamento de mérito disfarçado de triagem.                                                                                                                                   | Item 16, [RN-RAIT-122]                     |
| 12    | Prevalência entre **publicação e notificação** da decisão da JARI para o prazo do art. 288.                                                                                       | Afeta tempestividade do recurso ao CETRAN.                                                                                                                                          | Item 8, [RN-RAIT-103]                      |
| 13    | **Índice de correção** da restituição do art. 286 §2º na prática do Amazonas (UFIR extinta).                                                                                      | Valor a devolver ao cidadão.                                                                                                                                                        | Item 19, [RN-RAIT-129]                     |
| 14    | Efeito da **desistência da defesa** sobre o prazo estendido de 360 dias.                                                                                                          | Caso de borda com efeito de decadência.                                                                                                                                             | Item 17, [RN-RAIT-123]                     |
| 15    | Confirmar assinatura e vigência da **Portaria 5046/2018** (OCR ambíguo no nome do signatário) antes de citá-la formalmente.                                                       | A portaria é a base da simplificação de representação do item 15.                                                                                                                   | Dossiê §4, [RN-RAIT-121]                   |

**Ação de conformidade que não depende de validação jurídica** (pode ser encaminhada desde já):
revisar a linguagem das cartas de serviço quanto ao **endosso cartorial** e à **juntada do parecer da
JARI** — ambas exigências sem base normativa, sendo a segunda contrária ao art. 285 §4º do CTB
(item 15, [RN-RAIT-117], [RN-RAIT-121]).

---

# 5. Decisões do Owner (steering, 2026-08-24)

O Owner respondeu à lista priorizada acima em conversa de steering, em formato de múltipla
escolha — registro completo das perguntas e respostas em `_meta/steering.md` §C (itens 13-27).
**Nenhuma resposta abaixo passou por parecer jurídico formal** — são decisões de negócio que
aceitam o risco legal descrito nos itens correspondentes, não uma validação do advogado humano
pedida no título desta seção. Tratar como leitura de trabalho vinculante para o desenho do
produto, sujeita a reversão se um parecer formal divergir. Cada resposta foi propagada à regra
RN-RAIT correspondente (coluna "RN" abaixo) com uma nota "**Decisão**" própria.

| #   | Questão                                                  | Resposta do Owner                                                                                                       | RN                           |
| --- | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| 1   | Lei 9.873/1999 rege o processo estadual?                 | **Sim, aplicar.**                                                                                                       | [RN-RAIT-113]                |
| 2   | Qual relógio governa o SLA (CTB × paralisação 3 anos)?   | **O mais curto** (3 anos, Lei 9.873).                                                                                   | [RN-RAIT-111], [RN-RAIT-113] |
| 3   | Prescrição do art. 289-A é automática e de ofício?       | **Sim, declara de ofício.** Julgamento tardio, suspensão/interrupção e intervalo entre instâncias seguem sem resposta.  | [RN-RAIT-112]                |
| 4   | Recurso da autoridade: discricionário ou vinculado?      | **Vinculado.** Autoridade competente, prazo e contrarrazões seguem sem resposta — bloqueia modelagem completa do fluxo. | [RN-RAIT-130]                |
| 5   | Desconto de 40% sem adesão ao SNE — aplicar?             | **Aplicar mesmo sem SNE.** Procedimento de emissão do documento de arrecadação fora do SNE segue indefinido.            | [RN-RAIT-127]                |
| 6   | Termo inicial da decadência não flagrancial              | **"Data do cometimento"** (Res. 918 art. 9º §2º).                                                                       | [RN-RAIT-114]                |
| 7   | Vigência da Res. 357/2010 e regimentos JARI-AM/CETRAN-AM | **Assumir vigente**; regimentos formalizados como desenho de fato (ver [WF-RAIT-003]).                                  | [RN-RAIT-116]                |
| 8   | Regulamento de força maior (CTB 290-A)                   | Suspensão **só por ato motivado e auditado**, nunca automática, até regulamento localizado.                             | [RN-RAIT-105]                |
| 9   | Expedição × notificação (termo inicial da defesa)        | **Expedição** — confirma a leitura já adotada.                                                                          | [RN-RAIT-101]                |
| 10  | Revisão pós-encerramento / _reformatio in pejus_         | **Não oferecer revisão.** _Reformatio in pejus_ não foi perguntado especificamente — segue em aberto.                   | [RN-RAIT-119], [RN-RAIT-132] |
| 11  | Critério do "pedido incompatível" (Res. 900 art.4º IV)   | **Restringir a ausência formal de pedido**, confirma a recomendação.                                                    | [RN-RAIT-122]                |
| 12  | Publicação × notificação (prazo do art. 288)             | **Sempre a publicação** — substitui a leitura anterior ("marco mais recente").                                          | [RN-RAIT-103]                |
| 13  | Índice de correção da restituição (UFIR extinta)         | **Índice fiscal padrão do AM** — índice específico ainda a identificar.                                                 | [RN-RAIT-129]                |
| 14  | Efeito da desistência sobre os 360 dias                  | **Não restaura** os 180 dias.                                                                                           | [RN-RAIT-123]                |
| 15  | Confirmar Portaria 5046/2018 (OCR ambíguo)               | **Citar como está** — risco aceito.                                                                                     | [RN-RAIT-121]                |

**Ação de conformidade (item D.28 de `_meta/steering.md`):** correção das cartas de serviço
(endosso cartorial + juntada do parecer da JARI) **autorizada de imediato** pelo Owner, sem
esperar parecer formal — ver [RN-RAIT-121] e `refs/detran-am/REF-DETRANAM-SERVICOS.md`.

**Pontos que permanecem sem resposta do Owner**, mesmo após a rodada de steering: julgamento
tardio pós-289-A, suspensão/interrupção da prescrição do art. 289-A, intervalo entre instâncias
não computado (item 3 acima); autoridade competente/prazo/contrarrazões do recurso vinculado
(item 4); procedimento operacional do desconto de 40% fora do SNE (item 5); vedação de
_reformatio in pejus_ (item 10). Necessitam de nova rodada de steering ou parecer jurídico
formal antes de fechar o desenho correspondente.
