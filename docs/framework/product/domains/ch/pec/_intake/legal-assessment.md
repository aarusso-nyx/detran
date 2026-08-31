---
id: LEGAL-ASSESSMENT-PEC
title: Parecer técnico-legal — riscos, conflitos normativos e questões abertas do corpus do PEC
status: draft
apps: [pec, portal, dashboard]
sources:
  [
    REF-CTB-147-148-habilitacao,
    REF-CONTRAN-927-2022,
    REF-CONTRAN-789-2020,
    REF-CONTRAN-923-1009-toxicologico,
    REF-CFP-01-2019,
    REF-CFM-1636-2002,
    REF-CFM-1821-2007,
    REF-SENATRAN-PORTARIA-968-2022,
    REF-LEI-13787-2018,
    REF-MP-2200-2-2001,
    REF-LEI-14063-2020,
    REF-LEI-13709-2018,
    REF-DETRANAM-PORTARIA-005-2021,
  ]
updated: 2026-08-24
---

# Escopo e método

Produzido pelo especialista **LEGAL** a partir do dossiê do CRAWLER
(`_intake/research-dossier.md`) e do corpus completo em `refs/`. Modo **confirm-extend**: a base
preexistente ([APP-PEC], [WF-PEC-001..003], [JRN-PEC-001..003], [UC-PEC-001..009],
[RN-PEC-001..008]) foi confrontada com o corpus legal, e as quatro CONTRADIÇÕES apontadas pelo
dossiê foram corrigidas — mais uma quinta, que o dossiê não detectou.

**Método.** Cada dispositivo que ancora regra de negócio foi **reconferido contra a fonte primária
local**: `refs/ctb/planalto_plain.txt` para o CTB; `.txt` de `pdftotext` dos PDF oficiais do DOU
para as resoluções CONTRAN e as portarias SENATRAN/DETRAN-AM; `.txt` do planalto para as leis
federais; PDF oficial dos conselhos para CFM e CFP. Onde a fonte é secundária ou a vigência é
duvidosa, isso está sinalizado na própria regra.

**Regra de disciplina adotada.** Onde o texto normativo é ambíguo, silente ou conflitante, este
documento **registra a lacuna** e propõe uma leitura de trabalho **explicitamente rotulada como
interpretação**. **Nenhuma lacuna foi preenchida com norma inventada, jurisprudência não verificada
ou "prática de mercado".**

**Reuso, não reescrita.** O regime LGPD de dado de saúde já foi construído neste repositório na
rodada BOAT ([RN-BOAT-122] a [RN-BOAT-129]). Ele é adotado **por remissão** em [RN-PEC-150], e as
regras [RN-PEC-151] a [RN-PEC-154] registram **apenas os deltas** do caso PEC. Do mesmo modo, a
convenção de contagem de prazos ([RN-RAIT-005]) e as decisões já fechadas em `_meta/steering.md`
são reaproveitadas e **não reabertas**.

**Produtos desta rodada:**

- `refs/ctb/REF-CTB-147-148-habilitacao.md` — instrumento **novo** (a lei que faltava);
- `ch/pec/rules/RN-PEC-101` a `RN-PEC-154` — **28 regras legais**;
- auditoria e correção in loco de `RN-PEC-001` a `RN-PEC-008`;
- refinamentos em `REF-CONTRAN-789-2020`, `REF-CONTRAN-923-1009-toxicologico`,
  `REF-CFM-1636-2002` e `refs/INDEX.md`.

---

# 1. Tabelas consolidadas

## 1.1 Validades e periodicidades

| Objeto                                                    | Prazo                                        | Termo inicial             | Base                                                      | RN           |
| --------------------------------------------------------- | -------------------------------------------- | ------------------------- | --------------------------------------------------------- | ------------ |
| Exame de aptidão física e mental — condutor **< 50 anos** | **10 anos**                                  | realização do exame       | CTB art. 147, § 2º, I                                     | [RN-PEC-102] |
| Exame de aptidão — **≥ 50 e < 70 anos**                   | **5 anos**                                   | idem                      | CTB art. 147, § 2º, II                                    | [RN-PEC-102] |
| Exame de aptidão — **≥ 70 anos**                          | **3 anos**                                   | idem                      | CTB art. 147, § 2º, III                                   | [RN-PEC-102] |
| Redução do prazo por indício clínico                      | a critério do perito                         | ato motivado do perito    | CTB art. 147, § 4º; Res. 789/2020 art. 4º, § 2º           | [RN-PEC-102] |
| Avaliação psicológica — apto com validade diminuída       | reduzido, na planilha RENACH                 | resultado                 | Res. 927/2022 art. 9º, § 2º                               | [RN-PEC-103] |
| Inaptidão temporária — prazo de inaptidão                 | consignado no resultado                      | resultado                 | Res. 927/2022 art. 9º, § 1º                               | [RN-PEC-106] |
| Exame toxicológico (pré-etapa e periódico)                | **90 dias**                                  | **data da coleta**        | CTB art. 148-A, § 1º; Res. 923/2022 arts. 10, § 1º e 10-B | [RN-PEC-120] |
| Exame toxicológico **periódico** pós-CNH                  | **a cada 2 anos e 6 meses**                  | emissão/renovação da CNH  | CTB art. 148-A, § 2º; Res. 923/2022 art. 10-A             | [RN-PEC-121] |
| Processo de habilitação ativo                             | **12 meses**                                 | requerimento do candidato | Res. 789/2020 art. 2º, § 3º                               | [RN-PEC-108] |
| Dados biométricos capturados                              | **mesma validade da CNH**                    | captura                   | Portaria 968/2022 art. 3º (red. 495/2025)                 | [RN-PEC-130] |
| Credenciamento de entidade                                | **1 ano**, renovável; comprovação **bienal** | ato de credenciamento     | Res. 927/2022 art. 16, §§ 2º-3º                           | [RN-PEC-115] |

⚠ **A Res. 789/2020 art. 4º ("5 anos / 3 para >65") está superada** — ver item 2.

## 1.2 Prazos de ato (quem age, e em quanto tempo)

| Ato                                               | Prazo                             | Termo inicial                        | Natureza                      | Base                                                      | RN           |
| ------------------------------------------------- | --------------------------------- | ------------------------------------ | ----------------------------- | --------------------------------------------------------- | ------------ |
| Disponibilizar resultado da avaliação psicológica | **2 dias úteis**                  | realização                           | SLA do profissional           | Res. 927/2022 art. 9º, § 3º                               | [RN-PEC-103] |
| Comunicar inaptidão para bloqueio do cadastro     | **imediato**                      | resultado                            | dever do **perito**           | Res. 927/2022 art. 10, § 2º                               | [RN-PEC-106] |
| Requerer instauração de Junta                     | **30 dias**                       | **conhecimento do resultado**        | **preclusivo** (administrado) | Res. 927/2022 art. 12                                     | [RN-PEC-112] |
| Designar a Junta                                  | **15 dias úteis**                 | recebimento do requerimento          | SLA do órgão, sem sanção      | Res. 927/2022 art. 14, § 1º                               | [RN-PEC-112] |
| Junta proferir resultado                          | **30 dias**                       | **designação**                       | SLA do colegiado              | Res. 927/2022 art. 14, § 3º                               | [RN-PEC-112] |
| Recorrer ao CETRAN/CONTRANDIFE                    | **30 dias**                       | conhecimento do resultado da revisão | **preclusivo** (administrado) | Res. 927/2022 art. 13                                     | [RN-PEC-112] |
| Remeter documentos ao CETRAN                      | **20 dias úteis**                 | recebimento do recurso               | SLA do órgão, sem sanção      | Res. 927/2022 art. 14, § 2º                               | [RN-PEC-112] |
| **Junta Especial de Saúde julgar o recurso**      | **— sem prazo em norma —**        | —                                    | **lacuna**                    | —                                                         | [RN-PEC-112] |
| Laboratório entregar laudo toxicológico           | **30 dias**                       | coleta                               | SLA de terceiro               | Res. 923/2022 art. 9º (red. 1.009/2024)                   | [RN-PEC-120] |
| Alerta de vencimento do toxicológico periódico    | **30 dias de antecedência**       | vencimento                           | dever da SENATRAN             | Res. 923/2022 art. 10-B, § 2º                             | [RN-PEC-121] |
| Estatística mensal da entidade ao órgão           | **até o dia 20** do mês seguinte  | fim do mês                           | dever da entidade             | Res. 927/2022 art. 23; Port. DETRAN-AM 005/2021 art. 28-A | [RN-PEC-115] |
| Estatística anual do Estado à União               | **até o último dia de fevereiro** | fim do ano                           | dever do órgão                | Res. 927/2022 art. 24                                     | [RN-PEC-115] |

**Contagem:** prazos em **dias** são corridos; em **dias úteis**, seguem a convenção já adotada no
corpus — calendário nacional + estadual do AM, exclusão do dia inicial ([RN-RAIT-005],
`_meta/steering.md` A.6).

## 1.3 Prazos de retenção — três objetos, três detentores

| Prazo                                     | Objeto                                                        | Detentor                                  | Base                                   | RN           |
| ----------------------------------------- | ------------------------------------------------------------- | ----------------------------------------- | -------------------------------------- | ------------ |
| **20 anos** (piso) do **último registro** | o **prontuário**                                              | **indefinido** — PEC? clínica? DETRAN-AM? | Lei 13.787/2018 art. 6º                | [RN-PEC-141] |
| **5 anos** após o **descredenciamento**   | Laudos Médicos e Psicológicos                                 | a **entidade credenciada**                | Port. DETRAN-AM 005/2021 art. 21, p.ú. | [RN-PEC-141] |
| **5 anos**                                | resultado eletrônico **e material biológico** do toxicológico | o **laboratório credenciado**             | Res. 923/2022 art. 9º, §§ 1º-2º        | [RN-PEC-122] |

Os três **não se substituem**: escopos, objetos e detentores distintos. Ver [RN-PEC-141].

## 1.4 A cadeia de revisão do resultado — três instâncias

| #   | Instância                                | Composição                         | Designado por               | Provocada por                                                       |
| --- | ---------------------------------------- | ---------------------------------- | --------------------------- | ------------------------------------------------------------------- |
| 1ª  | Perito examinador                        | 1 profissional titulado            | credenciamento estadual     | ato do exame                                                        |
| 2ª  | **Junta Médica** / **Junta Psicológica** | **3** profissionais                | órgão executivo de trânsito | **requerimento do candidato** (30 d)                                |
| 3ª  | **Junta Especial de Saúde**              | **≥ 3**, sendo **2 especialistas** | **CETRAN/CONTRANDIFE**      | recurso do candidato (30 d), **só se mantida inaptidão permanente** |

Ver [RN-PEC-110], [RN-PEC-111] e [RN-PEC-112]. Base: Res. 927/2022 arts. 12-15.

---

# 2. Riscos, conflitos e questões abertas

## Item 1 — Vocabulário de resultado: `CONDICIONADO` não existe em norma alguma

_Severidade: ALTA._ Três taxonomias circulam no mesmo processo, nenhuma idêntica às outras:
**federal médica** (apto / apto com restrições / inapto temporário / inapto — Res. 927/2022 art.
8º); **federal psicológica** (apto / inapto temporário / inapto — art. 9º, **sem** "apto com
restrições"); **estadual** (APTO, APTO COM RESTRIÇÕES, **PENDENTE**, INAPTO, INAPTO
TEMPORARIAMENTE — Port. DETRAN-AM 005/2021 art. 34, § 9º); e **o enum do PEC**, que usa
`CONDICIONADO`, ausente de todas. Correção adotada: `CONDICIONADO` ≡ **"apto com restrições"**,
**só na trilha médica**; enum separado para a psicológica; "PENDENTE" é **estado de processo**, não
resultado. Quatro pontos abertos: qual vocabulário o RENACH **de fato** aceita (não confirmado
contra especificação técnica); a norma estadual **contraria** a federal ao estender "apto com
restrições" ao psicólogo e criar "PENDENTE"; os prazos _"30, 60, 90 e 365 dias"_ são **quatro
números para cinco rótulos**, com correspondência **indeterminada no texto**; e a vigência da
própria Portaria 005/2021 é duvidosa (item 5). → [RN-PEC-105], correção em [RN-PEC-006].

## Item 2 — Conflito vertical: periodicidade do exame de aptidão (CTB × Res. 789/2020)

_Severidade: ALTA. Achado próprio desta rodada — não estava no dossiê._ O art. 4º da Res. 789/2020
diz _"cinco anos, ou três anos para condutores com mais de sessenta e cinco anos"_; o **CTB art.
147, § 2º**, na redação da **Lei 14.071/2020** (vigência em 12/04/2021), diz **10 / 5 / 3 anos** por
faixa etária, com corte em **50 e 70** anos. A resolução é de 24/06/2020 e reproduz o texto legal
**revogado**; nunca foi atualizada. **Prevalece a lei.** O dossiê recomendava propagar o prazo
**errado** para [WF-PEC-001] — recomendação **rejeitada**. Implementar 5 anos onde a lei dá 10 força
renovação indevidamente antecipada da maioria dos condutores. Recomenda-se **comunicação formal ao
DETRAN-AM**, na mesma classe da correção autorizada em `_meta/steering.md` D.28. →
[RN-PEC-102], [REF-CTB-147-148-habilitacao].

## Item 3 — A junta tem três instâncias, e o sistema modela zero e meia

_Severidade: ALTA._ [WF-PEC-002] trata o CETRAN como **flag booleana** na mesma linha de decisão
(`escalated_to_cetran`), que apenas troca a string do signatário. A norma descreve **três
instâncias**, com composição fixada (3 profissionais; ≥3 com 2 especialistas), **bifurcação
médica/psicológica**, e uma **Junta Especial de Saúde** designada pelo CETRAN que **não existe** no
sistema. Além disso, o workflow atribui a legitimidade para requerer a junta a _Auditor / Gestor /
Gestor DETRAN_ e registra que **não** é o candidato — **a norma diz exatamente o contrário** (art.
12: _"o candidato poderá requerer"_). Três silêncios permanecem: **como delibera** a junta (maioria?
unanimidade? voto divergente?), **impedimento e suspeição** (nada impede, no texto, que o revisor
seja o próprio perito revisado), e o **regimento interno do CETRAN-AM**, não localizado — mesmo gap
já registrado na rodada RAIT. → [RN-PEC-110], [RN-PEC-111].

## Item 4 — Prazos da revisão: a 3ª instância não tem prazo, e o bloqueio corre contra o cidadão

_Severidade: MÉDIA._ A escada 30 d / 15 du / 30 d / 30 d / 20 du está completa até a **remessa** ao
CETRAN — e para ali. **Nenhuma norma fixa prazo para a Junta Especial de Saúde julgar.** Não há
regra de suspensão por diligência. E os prazos do órgão **não têm sanção**, enquanto o **bloqueio do
cadastro nacional** ([RN-PEC-106]) permanece durante toda a revisão sob a leitura conservadora
adotada — de modo que a demora do órgão recai integralmente sobre o cidadão impedido de dirigir.
Risco de exposição real, não apenas de modelagem. → [RN-PEC-112].

## Item 5 — Vigência da Portaria DETRAN-AM 005/2021 não confirmada

_Severidade: MÉDIA-ALTA (transversal)._ A 005/2021 é **emenda** à Portaria 001/2019, que **não foi
localizada isoladamente**; e a listagem oficial registra uma **Portaria Normativa
008/2021-DP-DETRAN-AM** (16/11/2021), cujo título — _"regras para credenciamento de Clínica(s)
Médica(s) e Psicológica(s) de Trânsito e do(s) CFCs"_ — sugere **consolidação integral** do regime,
com download retornando **404** em duas variantes de URL. **Tudo o que o corpus PEC afirma sobre
regime local depende desse documento**: janela de 08h-13h, retenção de 5 anos, supervisão de
estagiário, vocabulário de cinco rótulos, vedação de assinatura cruzada. Recuperar a Portaria
008/2021 (e a 009/2021, que a altera) é **o item de pesquisa nº 1** da próxima rodada. →
[RN-PEC-116], [RN-PEC-115], [RN-PEC-107], [RN-PEC-105].

## Item 6 — Retenção de 20 anos: prazo claro, responsável indefinido, e uma premissa frágil

_Severidade: ALTA._ Nenhum `RN-PEC` tratava de retenção. A Lei 13.787/2018 art. 6º fixa piso de
**20 anos a partir do último registro**, expressamente aplicável a documentos **nascidos
eletrônicos** (§ 5º). Quatro questões: (a) **quem** é o responsável — a clínica (que pode
descredenciar-se e aí só deve 5 anos), o DETRAN-AM (que não é prestador de saúde) ou a plataforma
(que não é sujeito de direito)? Nenhuma norma responde; (b) o prazo depende da premissa de que o
**laudo pericial é "prontuário de paciente"** — inferência sustentável e favorável à proteção, mas
inferência: se um parecer a afastar, **não há prazo substituto**; (c) o § 1º admite prazos
diferenciados em regulamento, não localizado; (d) **preservação criptográfica de longo prazo**: 20
anos excedem a validade de qualquer certificado ICP-Brasil — sem PAdES-LTA, o documento ao fim do
prazo estará conservado mas **não verificável**. Some-se que a [REF-CFM-1821-2007] foi **modificada
pela Res. CFM 2.218/2018, não capturada**. → [RN-PEC-140], [RN-PEC-141], [RN-PEC-142].

## Item 7 — Exame toxicológico periódico: obrigação legal inteira fora do corpus

_Severidade: MÉDIA (escopo de produto)._ O CTB art. 148-A, § 2º impõe novo exame **a cada 2 anos e
6 meses** aos condutores C/D/E com menos de 70 anos, com alerta emitido pela **SENATRAN diretamente
ao condutor** e resultado inserido pelo laboratório no **RENACH**. Nada nesse circuito passa
necessariamente pelo PEC — mas o **efeito** (suspensão do direito de dirigir por 3 meses) incide
sobre o mesmo cadastro nacional que o PEC bloqueia por inaptidão, e a suspensão é **penalidade de
trânsito**, objeto do domínio `inf`. É a fronteira entre domínios mais concreta desta rodada, e
nenhum dos dois corpora a registra. Pergunta de escopo ao Owner: **o PEC participa desse fluxo ou é
100% externo?** → [RN-PEC-121].

## Item 8 — Sigilo do resultado toxicológico é mais estrito que a LGPD

_Severidade: MÉDIA-ALTA._ CTB art. 148-A, § 6º: _"O resultado do exame **somente será divulgado
para o interessado** e não poderá ser utilizado para fins estranhos"_. É _lex specialis_ mais
restritiva: destinatário único e vinculação de finalidade **por lei**. Consequência de arquitetura:
o PEC precisa do **fato** ("existe resultado negativo válido") e da **data da coleta** — **não** do
laudo detalhado nem das substâncias. **O corpus não descreve o que a integração RENACH devolve
sobre o toxicológico**; se devolver o laudo, a mera recepção já é tratamento vedado. Verificar o
contrato de integração **antes** de implementar. → [RN-PEC-122].

## Item 9 — Dois atos habilitantes do perito, sem articulação normativa

_Severidade: MÉDIA._ A Res. 927/2022 art. 16 prevê **credenciamento estadual** da entidade e do
profissional; o CTB art. 148, § 6º (**incluído pela Lei 15.428/2026**) exige peritos _"autorizados
pelo órgão máximo executivo de trânsito da União"_. São **dois atos de entes distintos**, e nenhuma
norma capturada explica sua articulação. Se a autorização federal for constitutiva, o cadastro de
peritos precisa de um segundo atributo habilitante, hoje inexistente. → [RN-PEC-101], [RN-PEC-115].

## Item 10 — "Preliminar e complementar": ambiguidade não resolvida

_Severidade: BAIXA-MÉDIA._ CTB art. 147, § 3º manda que a avaliação psicológica do condutor
remunerado seja _"preliminar e complementar"_; a Res. 789/2020 art. 4º, § 1º repete a expressão sem
esclarecê-la. Se houver **diferença de conteúdo** entre as duas, o PEC precisa de **dois subtipos**
de avaliação psicológica; hoje tem um só. Nenhuma norma capturada define. → [RN-PEC-103].

## Item 11 — Força normativa das resoluções de conselho profissional (CFP e CFM)

_Severidade: MÉDIA (transversal)._ CFP 01/2019 e CFM 1.636/2002 vinculam **profissionais**, sob
regime ético-disciplinar, e não são normas de trânsito. A CFP 01/2019 é **incorporada** ao regime
CONTRAN pelo art. 6º, parágrafo único da Res. 927/2022; a CFM 1.636/2002 **não tem** incorporação
equivalente, mas seu art. 5º responsabiliza expressamente o **diretor médico do DETRAN**. Leitura de
trabalho adotada: o PEC deve **suportar o cumprimento** dessas exigências, não impedi-lo — posição
de conformidade, não obrigação legal direta ao órgão. → [RN-PEC-104], [RN-PEC-113].

## Item 12 — A comunicação de inaptidão é dever pessoal do perito, executado pelo sistema

_Severidade: MÉDIA._ Res. 927/2022 art. 10, § 2º atribui ao **perito**, pessoa física, o dever de
comunicar a inaptidão para _"imediato bloqueio do cadastro nacional"_. Se o PEC automatiza esse ato,
executa dever alheio: em caso de falha de transmissão, quem responde é o perito, e ele precisa poder
demonstrar que comunicou — logo o comprovante deve ser **acessível ao próprio perito**, não apenas
ao acervo de auditoria. Além disso, a norma tem qualificador de **urgência** e **destinatário
próprio** (setores médico e psicológico do órgão), incompatível com o tratamento como mais uma linha
da fila genérica de 15 minutos de [RN-PEC-008]. → [RN-PEC-106], [RN-PEC-008].

## Item 13 — Ordem legal das etapas: sequência ou bloqueio?

_Severidade: BAIXA-MÉDIA._ O CTB art. 147 diz _"na ordem descrita a seguir"_ e lista os exames
**sem** a avaliação psicológica como inciso; a Res. 789/2020 art. 2º, § 1º lista a avaliação
psicológica **em primeiro lugar**. Nenhum dos dois comina nulidade a exame realizado fora de ordem.
Leitura adotada: **sequência administrativa, não bloqueio técnico** — o modelo do PEC (dois exames
paralelos no mesmo `encounter`) fica **confirmado**. Rotulado como interpretação. → [RN-PEC-108].

## Item 14 — Janela de 08h-13h × vedação de cota-limite por período

_Severidade: MÉDIA._ CFM 1.636/2002 art. 4º: _"É vedado o estabelecimento de cota-limite por período
de tempo para a realização dos exames"_. Portaria DETRAN-AM 005/2021 art. 40: funcionamento
**obrigatório** das 08h às 13h. Leitura conciliatória possível: o art. 40 fixa **horário de
funcionamento** (organização do serviço), não **quantidade de exames** (racionamento). Mas o efeito
prático de uma janela de cinco horas sobre a capacidade diária é indistinguível de uma cota, e o
dimensionamento de agenda de [WF-PEC-003] tornará esse efeito explícito. Handoff simultâneo a LEGAL
e BPO. → [RN-PEC-114], [RN-PEC-116].

## Item 15 — Quem verifica a validade de 90 dias do toxicológico?

_Severidade: BAIXA._ Nenhuma norma atribui a verificação. O PEC assume o papel por consequência do
gate, sem atribuição expressa. Registrado para que a assunção seja consciente. → [RN-PEC-120].

## Item 16 — Detalhes técnicos da biometria: parágrafos revogados sem substituto localizado

_Severidade: MÉDIA._ Os §§ 1º/3º/4º do art. 4º da Portaria 968/2022 (LFD; registro de ausência
**por dedo**; **fallback facial obrigatório**) são o desenho legal mais próximo de [RN-PEC-003] —
mas a Portaria 495/2025 os **substituiu por reticências com cláusula "(NR)"**, e o normativo que
hoje os detalha **não foi localizado** (possivelmente Anexo, não capturado). Não é possível afirmar
se o desenho atual do PEC está **acima ou abaixo** do piso vigente. Recuperar o Anexo é item de
pesquisa prioritário. Registra-se ainda que **duas** das quatro portarias antes citadas por
[RN-PEC-003] estão **revogadas** (DENATRAN 1.515/2018 e 2.145/2020) e foram removidas da
fundamentação. → [RN-PEC-130], [RN-PEC-131], [RN-PEC-003].

## Item 17 — Distribuição aleatória e impessoal dos exames (CFM 1.636/2002 art. 3º)

_Severidade: ALTA — o item mais dependente de advogado humano de toda a rodada._ Norma vigente
determina que a distribuição dos exames seja feita **pelo DETRAN**, de forma _"equitativa
obrigatória, aleatória e impessoal"_, e _**"nunca por escolha do periciado"**_. O modelo de
agendamento do PEC pressupõe o oposto. O conflito é **real, não aparente**:

- a resolução **não foi revogada** (a Res. 927/2022 art. 31 revogou resoluções do CONTRAN, não do
  CFM) nem **contrariada** (os arts. 16-24 da 927/2022 silenciam sobre distribuição de demanda);
- a exposição é **pessoal** e alcança o **diretor médico do DETRAN** (art. 5º);
- o CTB, quando quis assegurar livre escolha, disse-o expressamente — e o fez para o **laboratório
  toxicológico** (art. 148-A, § 7º), **não** para o exame clínico. A assimetria é textual.

**Quatro posições de conformidade** estão descritas e comparadas em [RN-PEC-113] (P1 conformidade
plena; P2 candidato escolhe **região e data**, sistema sorteia **clínica e perito**; P3 status quo
com risco documentado; P4 tese da superação tácita). **Recomendação técnica: P2** — concilia
conformidade, usabilidade e logística amazônica e, decisivamente, **converge com a própria tese
antifraude do PEC**: a livre escolha de clínica é o vetor do _shopping_ por laudo favorável que toda
a arquitetura do sistema existe para combater. Quatro incertezas remanescentes: qual é a **prática
atual do DETRAN-AM**; se o **CRM-AM fiscaliza**; se a norma alcança a **avaliação psicológica** (a
CFP 01/2019 não tem dispositivo equivalente); e se a escolha pode ser **saneada por consentimento**
(não pode — a vedação é objetiva). → [RN-PEC-113].

## Item 18 — LGPD: base legal do dado sensível, e a armadilha da alínea "f"

_Severidade: MÉDIA-ALTA._ O PEC trata dado sensível em **duas categorias simultâneas** (saúde **e**
biometria) no **núcleo** do domínio. O regime do bloco [RN-BOAT-122]..[RN-BOAT-129] é adotado por
remissão. Base adotada: **art. 11, II, "a"** (cumprimento de obrigação legal) — mais forte aqui do
que no BOAT, porque há **lei** impondo o exame (CTB art. 147, I) e **lei** impondo o registro do
resultado (art. 147, § 1º). Três posições negativas importam tanto quanto a positiva: a **alínea
"f" (tutela da saúde) NÃO se aplica** — há profissionais de saúde, mas a finalidade é **pericial**,
não assistencial, e invocá-la legitimaria um tratamento sob finalidade que ele não tem; o
**consentimento é inadequado** (o exame é condição legal para dirigir — não há alternativa, e a
revogação não poderia ser atendida); e a alínea "e" não sustenta a guarda registral. Obrigações
nascidas: **publicidade da dispensa de consentimento** (art. 11, § 2º c/c art. 23, I), registro da
hipótese por caso de uso, vinculação estrita à finalidade. Recomenda-se **RIPD** (art. 38), cobrindo
explicitamente o componente biométrico. → [RN-PEC-150], [RN-PEC-151], [RN-PEC-154].

## Item 19 — LGPD: fronteira do compartilhamento com o RENACH e direitos do titular

_Severidade: MÉDIA-ALTA._ Ao RENACH vai o **resultado**, sua qualificação (Anexo XV, prazo de
inaptidão, validade), a **identificação do examinador** e os metadados de integridade — **não** o
prontuário, a anamnese, os protocolos de teste nem o conteúdo toxicológico. Fundamento: LGPD art.
6º, I e III, mais o § 20 da CFP 01/2019 (minimização anterior à LGPD, específica desta perícia).
**O corpus não descreve o payload real** — verificá-lo é pré-requisito, não refinamento. Duas
lacunas estruturais: a **repartição controlador/operador** entre DETRAN-AM, **clínica credenciada
privada** e plataforma **não existe** em norma nem em instrumento contratual conhecido (mesmo
problema de [RN-BOAT-127], aqui com uma camada a mais); e o **prazo de resposta** ao titular perante
o Poder Público remete a **três regimes distintos** (Habeas Data, Lei 9.784, LAI), nenhum deles o
prazo genérico da LGPD. Registra-se ainda a tensão entre o **acesso do titular** ao dossiê e a
**restrição de divulgação do instrumento psicológico** (SATEPSI) — leitura de trabalho: acesso ao
**resultado e aos dados**, não ao instrumento. → [RN-PEC-152], [RN-PEC-153].

## Item 20 — Preço público federal do exame (Lei 15.428/2026) — achado sem artefato

_Severidade: MÉDIA._ O CTB art. 148, § 7º, **incluído em 2026**, determina que os valores dos exames
observem **preço público fixado pelo órgão máximo executivo de trânsito da União**, atualizado
anualmente pelo **IPCA**. [APP-PEC] §Escopo inclui _"faturamento do atendimento"_ — um módulo que
trate o valor do exame como parâmetro da clínica ou do Estado está **estruturalmente errado**.
Nenhum artefato do corpus reflete essa norma. → [RN-PEC-115], [REF-CTB-147-148-habilitacao].

## Item 21 — Anexos da Res. 927/2022 não capturados (com destaque para o Anexo XV)

_Severidade: MÉDIA._ O art. 30 publica os Anexos I-XXII _"no sítio eletrônico do órgão máximo
executivo de trânsito da União"_, fora do PDF do DOU. O **Anexo XV** contém as **observações
codificadas** que constam da CNH no resultado "apto com restrições" — sem ele, o campo de restrição
do PEC **não tem domínio de valores validável**, e o item (5) do gate de [RN-PEC-006] não pode ser
verificado além da mera presença de um texto. Item de pesquisa prioritário. → [RN-PEC-105],
[RN-PEC-006].

## Item 22 — Telessaúde × presencialidade obrigatória: contradição de escopo

_Severidade: MÉDIA._ [APP-PEC] §Escopo/Dentro lista **telessaúde**. A Portaria 968/2022, na redação
de 2025, determina que _"os dados biométricos **somente serão coletados presencialmente**"_ (art.
2º, § 2º) e que a validação de presença é obrigatória **em todos os exames** (art. 4º). As duas
afirmações não convivem para o ato do exame. Ou a telessaúde do PEC cobre atos acessórios (triagem,
orientação, devolutiva), ou o escopo está incorreto. Nenhum artefato esclarece. → [RN-PEC-130].

## Item 23 — Acessibilidade (CTB art. 147-A) ausente de todo o corpus

_Severidade: MÉDIA._ A lei assegura ao candidato com deficiência auditiva **acessibilidade de
comunicação em todas as etapas** do processo, inclusive **intérprete de Libras requerido no ato da
inscrição**. As etapas do PEC são de comunicação intensiva (anamnese; entrevista individual
**obrigatória** da CFP 01/2019 § 9º; entrevista devolutiva do § 22). Nenhuma jornada, UC ou RN
menciona acessibilidade, e [WF-PEC-003] não coleta a necessidade no agendamento — sem o que não há
como provê-la no atendimento. É obrigação legal, não boa prática. → [RN-PEC-104], handoff UX.

---

# 3. O que foi verificado e está firme (para não re-litigar)

1. **O PEC tem base legal expressa para existir.** O exame de aptidão é imposto por lei (CTB art.
   147, I) e é o **procedimento irredutível** da renovação: mesmo o condutor do RNPC, dispensado de
   tudo o mais pela Lei 15.428/2026, continua obrigado a ele (art. 340-A, § 7º). → [RN-PEC-101].
2. **A transmissão ao RENACH é obrigação legal** (CTB art. 147, § 1º), incluindo a **identificação
   do examinador** — o que valida `signer_name`/`signer_council` como dado obrigatório, não
   opcional. Apenas o **SLA de 15 minutos** permanece sem base normativa. → [RN-PEC-008].
3. **A arquitetura de assinatura está no patamar correto e não pode ser rebaixada.** PAdES +
   ICP-Brasil qualificada é sustentada por quatro fundamentos independentes, e a assinatura avançada
   **não** satisfaria o NGS2 do CFM, que é o que autoriza o modelo sem papel. → [RN-PEC-142],
   [RN-PEC-140].
4. **A imutabilidade do laudo e o adendo são a única via disponível** — não preferência de
   arquitetura: a norma **proíbe** que outro profissional assine laudo alheio (CFM 1.636 art. 1º,
   p.ú.; Port. DETRAN-AM 005/2021 art. 34, § 8º). → [RN-PEC-001], [RN-PEC-107].
5. **O gate toxicológico estava correto** — a norma o descreve quase literalmente; o que estava
   errado era a citação e a ausência do prazo. → [RN-PEC-007], [RN-PEC-120].
6. **A modelagem dos dois exames como paralelos está correta** e agora tem fundamentação: a ordem do
   art. 2º, § 1º da Res. 789/2020 é sequência administrativa sem cominação de nulidade. →
   [RN-PEC-108].
7. **A exigência de supervisão de estagiário tem âncora estadual explícita** (Port. DETRAN-AM
   005/2021 art. 48) — o que **não** tem base normativa é a dupla biometria, agora rotulada como
   decisão de produto. → [RN-PEC-004].
8. **A biometria de presença é obrigação federal**, não controle interno (Portaria 968/2022 art.
   4º) — com a delimitação de que ela cobre o **candidato**; a do perito tem outro fundamento. →
   [RN-PEC-130], [RN-PEC-005].
9. **CETRAN-PEC e CETRAN-`inf` são o mesmo órgão** (CETRAN-AM) em competências distintas: recurso
   de infração no domínio `inf`, designação da Junta Especial de Saúde no `ch`. Desambiguação
   sinalizada para `shared/actors.md`. → [RN-PEC-111].

---

# 4. Lista priorizada — o que um advogado humano precisa validar

| #      | Item                                                                                                                                                        | Por que precisa de advogado                                                                                                                                                                               | Bloqueia                                          |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| **1**  | **Distribuição imparcial dos exames** (item 17) — escolher entre P1/P2/P3/P4                                                                                | Conflito entre resolução de conselho profissional vigente e desenho de produto, com exposição **pessoal** do diretor médico do DETRAN e dos diretores das clínicas. Nenhuma leitura documental o resolve. | [WF-PEC-003], [UC-PEC-001]                        |
| **2**  | **Mapeamento do vocabulário de resultado** (item 1) — qual taxonomia o RENACH exige, e o que fazer com "PENDENTE" e com a tabela prazo↔rótulo indeterminada | O dado consta da CNH e produz efeito jurídico direto sobre o cidadão; a norma estadual contraria a federal.                                                                                               | schema, [RN-PEC-006], UI de laudo                 |
| **3**  | **Responsável pela retenção de 20 anos** (item 6) — e a premissa "laudo pericial = prontuário de paciente"                                                  | Define onde o dado mora, quem responde por perdê-lo, e se o prazo é 20 ou 5 anos. Sem parecer, a política de armazenamento não é defensável.                                                              | modelo de armazenamento, [RN-PEC-141]             |
| **4**  | **Classificação do laudo sob a Lei 14.063/2020** (art. 13 × art. 14)                                                                                        | Não muda a prática atual (o PEC já usa o patamar mais alto), mas muda a **natureza** da obrigação e, portanto, a análise de risco de qualquer proposta de afrouxamento.                                   | nada hoje; decisivo se houver proposta de mudança |
| **5**  | **Vigência da Portaria DETRAN-AM 005/2021** frente à 008/2021 (item 5)                                                                                      | Todo o regime local depende dela. É antes pesquisa que parecer — mas a conclusão precisa de chancela.                                                                                                     | janela 08h-13h, retenção local, vocabulário local |
| **6**  | **A Junta Especial de Saúde como terceira instância** (item 3) — e o efeito suspensivo do bloqueio durante a revisão                                        | Decide se [WF-PEC-002] precisa de novo estado/entidade e se o cidadão fica impedido de dirigir durante toda a revisão.                                                                                    | [WF-PEC-002], [UC-PEC-004], [UC-PEC-005]          |
| **7**  | **Deliberação, impedimento e suspeição nas juntas** (item 3)                                                                                                | O texto não diz como se delibera nem impede que o revisor seja o revisado. Sem regra, a decisão de 2ª instância é atacável.                                                                               | [WF-PEC-002], RBAC                                |
| **8**  | **Base legal LGPD e a alínea "f"** (item 18) — confirmar art. 11, II, "a"/"b" e afastar a "f"                                                               | O erro mais provável do domínio, justamente porque a "f" parece correta. Requer também a repartição controlador/operador (item 19).                                                                       | RIPD, contratos, publicidade                      |
| **9**  | **Fronteira do payload RENACH** (item 19) e **do conteúdo toxicológico** (item 8)                                                                           | O art. 148-A, § 6º é _lex specialis_: receber o laudo já é tratamento vedado. Precisa ser verificado contra a especificação de integração.                                                                | [RN-PEC-008], integração                          |
| **10** | **Escopo do exame toxicológico periódico** (item 7)                                                                                                         | Pergunta de escopo com resposta jurídica: se o PEC processa esse fluxo, falta um workflow inteiro; e a suspensão é penalidade do domínio `inf`.                                                           | escopo de produto                                 |

## Itens de pesquisa (não de parecer) que bloqueiam decisões

1. **Portaria DETRAN-AM 008/2021 e 009/2021** — 404 na captura (item 5).
2. **Anexos I-XXII da Res. CONTRAN 927/2022**, em especial o **Anexo XV** (item 21).
3. **Anexo/normativo que substituiu os §§ do art. 4º da Portaria SENATRAN 968/2022** (item 16).
4. **Resolução CFM 2.218/2018**, que modifica a CFM 1.821/2007 (item 6).
5. **Regimento interno do CETRAN-AM** — mesmo gap da rodada RAIT (item 3).
6. **Especificação técnica da integração RENACH** — vocabulário aceito e payload (itens 1, 9).

---

# 5. Handoffs

## Para o mantenedor de [APP-PEC] (fora da fronteira de escrita desta rodada)

A seção §Âncoras legais precisa de **três correções** e uma ampliação:

1. **[REF-CONTRAN-1009] está incorreto** como base do exame toxicológico — substituir por
   **CTB art. 148-A + [REF-CONTRAN-923-1009-toxicologico]** (item da CONTRADIÇÃO nº 2).
2. Os _backlog markers_ "(fonte pendente)" de REF-CONTRAN-927, REF-CONTRAN-789 e REF-CONTRAN-1009
   **estão resolvidos** — os REFs existem e devem ser citados pelos ids definitivos.
3. Acrescentar às âncoras: [REF-CTB-147-148-habilitacao], [REF-CFP-01-2019], [REF-CFM-1636-2002],
   [REF-CFM-1821-2007], [REF-MP-2200-2-2001], [REF-LEI-14063-2020], [REF-LEI-13787-2018],
   [REF-SENATRAN-PORTARIA-968-2022], [REF-DETRANAM-PORTARIA-005-2021], [REF-LEI-13709-2018].
4. §Escopo: a menção a **telessaúde** conflita com a presencialidade obrigatória (item 22); a menção
   a **faturamento** precisa refletir o preço público federal (item 20).

## Para o mantenedor de [WF-PEC-001]

- **NÃO** acrescentar a linha "validade do exame médico — 5 anos / 3 para >65" recomendada pelo
  dossiê: o prazo correto é **10/5/3 por faixa etária** (item 2, [RN-PEC-102]).
- Acrescentar: **2 dias úteis** para o resultado psicológico; **90 dias** de validade do
  toxicológico (contados **da coleta**); **12 meses** de vida do processo de habilitação.
- A linha "Pré-condição toxicológica — sem prazo numérico" deve citar **CTB art. 148-A + Res.
  923/2022**, nunca a Res. 1.009/2024 isoladamente.

## Para o mantenedor de [WF-PEC-002]

O esqueleto legal está em [RN-PEC-110] (três instâncias), [RN-PEC-111] (composição) e [RN-PEC-112]
(cinco prazos). Quatro correções estruturais: o **requerente é o candidato**; falta a **3ª
instância** inteira (Junta Especial de Saúde); falta a **bifurcação** Junta Médica × Junta
Psicológica; e a abertura da 3ª instância é **condicionada** à manutenção de inaptidão permanente.
`UNDER_REVIEW` deixa de ser enum morto — passa a ser o estado entre designação e resultado.

## Para BPO

- Escada de alertas dos prazos do órgão (2, 3 e 5 da tabela §1.2) em **50/75/90%**, por paridade com
  a escada já aprovada para o RAIT (`_meta/steering.md` A.1) — **proposta**, não exigência.
- **Janela de 08h-13h**: cinco horas úteis, com dois exames por candidato em muitos casos, é teto
  operacional duro — e é onde a tensão do item 14 se torna mensurável.
- **Ciclo de credenciamento** (1 ano / bienal / estatística mensal dia 20 / anual em fevereiro) é um
  processo administrativo inteiro sem UC — candidato a módulo próprio.

## Para UX

- **Entrevista devolutiva obrigatória** (item 23 e [RN-PEC-153]): o candidato precisa poder
  **solicitar**, e o psicólogo **registrar a realização**.
- **Acessibilidade / Libras** (item 23): coletar a necessidade no **agendamento**.
- **Rótulos legais na UI**, nunca o enum interno; e comunicar que a via de contestação do **juízo**
  é a junta, com prazo **preclusivo** de 30 dias, distinto do direito de correção da LGPD
  ([RN-PEC-153]).
- Se a posição **P2** do item 17 for adotada, a tela de agendamento deixa de oferecer escolha de
  clínica e precisa explicar por quê.
