---
id: LEGAL-ASSESSMENT-TEAT
title: Parecer técnico-legal — riscos, conflitos normativos e questões abertas do corpus do TEAT
status: draft
apps: [teat]
sources:
  [
    REF-CTB-280-290,
    REF-CTB-165-277-medidas-alcoolemia,
    REF-CONTRAN-918,
    REF-CONTRAN-985-1003-MBFT,
    REF-CONTRAN-1025-2026,
    REF-CONTRAN-432,
    REF-CONTRAN-798-804-equipamentos,
    REF-SENATRAN-997,
    REF-INMETRO-369-2021,
    REF-DETRANAM-TALAO-BODYCAM,
    REF-DETRANPR-CONV-224-2022,
  ]
updated: 2026-08-24
---

# Escopo e método

Produzido pelo especialista **LEGAL** sobre o dossiê do CRAWLER (`_intake/research-dossier.md`) e o
corpus de `refs/`. Método: cada dispositivo que ancora regra foi **reconferido contra a fonte
primária local** — `pdftotext -layout` dos PDF oficiais do DOU para as resoluções CONTRAN e a
Portaria SENATRAN, `planalto_plain.txt` para o CTB, `.txt` do PDF assinado digitalmente para a
Portaria DETRAN-AM, `.txt` do RTAC para o INMETRO. Onde a fonte é secundária, isso está marcado no
próprio REF e repetido aqui.

**Regra de disciplina adotada** (a mesma de `inf/rait/_intake/legal-assessment.md`): onde o texto
é ambíguo, silente ou conflitante, este documento **registra a lacuna** e propõe uma leitura de
trabalho **explicitamente rotulada como interpretação**. Nenhuma lacuna foi preenchida com norma
inventada, jurisprudência não verificada ou "prática de mercado".

**Produtos desta rodada:** a série `inf/teat/rules/RN-TEAT-101` a `RN-TEAT-143` (43 regras legais);
revisões cirúrgicas, com nota em arquivo, de `RN-TEAT-001` a `RN-TEAT-006`; e refinamento de seis
REF (`REF-CONTRAN-798-804-equipamentos`, `REF-CONTRAN-432`, `REF-CONTRAN-985-1003-MBFT`,
`REF-CONTRAN-1025-2026`, `REF-INMETRO-369-2021`, `REF-DETRANAM-TALAO-BODYCAM`, `REF-SENATRAN-997`)
e da anotação do art. 282 §6º-A em `REF-CTB-280-290`.

---

# 1. Auditoria de RN-TEAT-001 a 006

Nenhuma das seis regras foi **contradita** pelas novas fontes. Duas sofreram **correção material**;
quatro foram **confirmadas com upgrade de fonte**.

| Regra                                               | Resultado                                                              | O que mudou                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| --------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **RN-TEAT-001** (idempotência offline)              | **Confirmada, com upgrade de fonte e delimitação acrescentada**        | Três dos sete atributos exigidos ganharam âncora expressa ([REF-SENATRAN-997] art. 2º §3º, art. 3º I e V). A afirmação "não há regulação explícita" foi restringida à **idempotência de reenvio**. Acrescentada delimitação frente a [RN-TEAT-111], que trata do problema inverso (sessão concorrente) e cujo efeito é **bloqueio**, não convergência                                                                                                                                            |
| **RN-TEAT-002** (evidência/custódia)                | **Confirmada; gap parcialmente fechado; limite do modelo explicitado** | Continua **sem** norma federal de cadeia de custódia digital de trânsito. Ancoradas parcialmente integridade/criptografia/auditoria (997 Anexo II b, e, j — incluindo o **número do aparelho**, antes ausente), imagem com placa como conteúdo do AIT (Res. 804/2020) e o regime de bodycam. Registrado que a bodycam é fonte **contínua**, que não cabe no modelo de anexo pontual                                                                                                              |
| **RN-TEAT-003** (homologação de dispositivo)        | **Confirmada; "(fonte pendente)" fechado; correção conceitual**        | Existem **dois níveis** de homologação; a regra modelava só o interno. O nível SENATRAN saiu para [RN-TEAT-117], com validade **quadrienal** do laudo. O gap "tolerância operacional para versão sem homologação" **permanece aberto e ficou mais grave**: à luz do art. 5º, operar sem homologação é inconformidade, não tolerância                                                                                                                                                             |
| **RN-TEAT-004** (imutabilidade)                     | **Confirmada, com upgrade de fonte e precisão acrescentada**           | Base específica ([REF-SENATRAN-997] art. 3º, V: elementos que _"impeçam sua alteração após o término da lavratura"_). Acrescentado o **piso legal de retenção local** (Anexo III, b — mínimo o dia da lavratura), que limita expurgo e remote wipe. Precisada a natureza de `AitCorrection`: **registro apenso**, não exceção à imutabilidade                                                                                                                                                    |
| **RN-TEAT-005** (assinatura/recusa/impossibilidade) | **CORRIGIDA — erro de qualificação jurídica**                          | A versão anterior tratava a **recusa ao teste de alcoolemia** como um dos três resultados de um ato de ciência, isto é, **metadado**. É erro: a recusa é **fato gerador de infração autônoma** (CTB art. 165-A) e **produz um novo AIT**. Separados dois eixos independentes: ciência do ato × submissão ao procedimento. Fechado o gap para alcoolemia e para recusa de assinatura em remoção ([REF-CONTRAN-1025-2026] art. 14 §2º); permanece aberto para recusa de assinatura do AIT em geral |
| **RN-TEAT-006** (saneamento)                        | **CORRIGIDA na qualificação do gap; base parcialmente ancorada**       | Fechado: validação automatizada tem fundamento expresso ([REF-CONTRAN-918] art. 4º §3º) e o arquivamento tem hipóteses fechadas (CTB art. 281 §1º). **Requalificado**: o saneamento não é gap de pesquisa, é **lacuna normativa** — nenhuma norma federal o disciplina, e a Portaria 997 ainda **proíbe alteração** pós-lavratura. Advertência acrescentada: "rejeitado"/"cancelado" de [WF-TEAT-001] não correspondem a categorias do CTB                                                       |

---

# 2. Quatro questões estruturais

## 2.1 Força normativa do MBFT e de seus anexos

**Severidade: média-alta. Afeta a citabilidade de ~10 regras da série.**

O Manual Brasileiro de Fiscalização de Trânsito é **Anexo da Resolução CONTRAN nº 985/2022** —
aprovado por ato normativo do órgão máximo normativo do SNT, no exercício da competência do art.
12, I do CTB. Não é cartilha nem orientação: é **norma**. Três qualificações, porém, são
necessárias:

1. **É norma infralegal e não pode contrariar o CTB.** Onde o Manual restringe hipótese que a lei
   prevê — e há pelo menos um caso claro, o "somente" da Seção 8.3 (item 32 abaixo) — a lei
   prevalece.
2. **O Anexo tem duas naturezas internas.** A **Parte Geral** (Seções 1 a 11) é doutrina de
   procedimento, redigida em termos vinculantes ("deverá", "é vedado", "somente"). O **catálogo de
   fichas por infração** é, materialmente, **dado normativo estruturado** — é dele que saem a
   classificação Caso 1/2/3 ([RN-TEAT-108]), a obrigatoriedade do campo Observações
   ([RN-TEAT-109]) e as relações entre enquadramentos ([RN-TEAT-103]). Consequência de arquitetura:
   **as fichas precisam ser importadas para o `NormativeCatalog` como dado versionado**, não
   reimplementadas como lógica. Hoje não são.
3. **Risco de versão.** O PDF do Anexo baixado (`mbvt20222.pdf`) tem nome sugerindo publicação de
   2022; a **Res. CONTRAN 1.003/2023 alterou o Anexo**, com vigência desde 02/01/2024, e não há
   confirmação de que o arquivo capturado reflita essa alteração. O risco foi avaliado como
   **baixo para a Parte Geral** (alvo improvável da alteração) e é **alto para as fichas** — que
   são justamente o que precisa ser importado. **Reconferência obrigatória antes de importar
   fichas.**

Vários trechos da Parte Geral citados nas RN **não têm contrapartida verbatim no CTB** — a remoção
por "boa ordem administrativa" ([RN-TEAT-125]), a definição de "início da operação de remoção", a
classificação de infrações concorrentes/concomitantes/continuadas/sucessivas ([RN-TEAT-103]).
São **criações do Manual**. Elas orientam a atuação do agente e são invocáveis, mas um AIT
sustentado exclusivamente em construção do Manual, sem base legal correspondente, é mais frágil na
defesa do que um sustentado em dispositivo do CTB. **Parecer humano recomendado** sobre o grau de
vinculação da Parte Geral e sobre a importação das fichas como dado normativo.

## 2.2 O cancelamento do AIT sem norma — e o saneamento sem norma

**Severidade: alta. É a lacuna mais estrutural do corpus TEAT.**

O CTB conhece **um único par** de desfechos na fase de processamento: auto **consistente** →
penalidade; auto **inconsistente ou irregular** → **arquivado e registro julgado insubsistente**
(art. 281 §1º, I). Não existe, em nenhuma das fontes desta rodada — CTB, Res. CONTRAN 918/2022,
Portaria SENATRAN 997/2022, MBFT, Res. 1.025/2026 —:

- norma que discipline **saneamento/correção formal** do AIT após a lavratura; ao contrário, a
  Portaria 997 art. 3º, V manda **impedir** alteração após o término da lavratura;
- norma que discipline **cancelamento de AIT finalizado** antes do julgamento da defesa. A única
  hipótese federal de "cancelamento" do AIT é o **acolhimento da defesa** ([REF-CONTRAN-918] art.
  9º §1º) — fase e ator distintos. A Portaria 997 Anexo II, k) cobre **apenas o rascunho em
  preenchimento** ([RN-TEAT-120]).

A prática do DETRAN-AM resolve operacionalmente o segundo caso (submissão à **Diretoria de
Fiscalização**), mas essa prática está documentada em **notícia institucional**, não em portaria
numerada, e o instrumento que institui a competência da Diretoria **não foi localizado**
([REF-DETRANAM-TALAO-BODYCAM] §Gaps).

**Consequência prática, e é séria:** o TEAT hoje modela dois desfechos negativos ("rejeitado",
"cancelado") que **não correspondem a categorias jurídicas existentes**, e um mecanismo de
correção que opera na zona cinzenta entre os dois únicos polos legais. Cada correção é atacável na
defesa como saneamento de auto que deveria ter sido arquivado.

**Leitura de trabalho adotada nas RN** ([RN-TEAT-119], [RN-TEAT-121], revisão de [RN-TEAT-006]):
todo desfecho negativo carrega `fundamento_legal` e é mapeável a **arquivamento por insubsistência
(art. 281 §1º, I)**; `AitCorrection` é **registro apenso** de erro material em elemento não
essencial, decidido pela autoridade, com o conteúdo original íntegro sob `content_hash`. **A lista
de campos corrigíveis precisa ser decidida e formalizada pela autoridade de trânsito** — não pode
ser inferida pelo produto.

## 2.3 Bodycam e proteção de dados — a Portaria 003/2026 não menciona a LGPD

**Severidade: alta em exposição institucional; média em risco de produto (depende de escopo).**

A Portaria Normativa 003/2026-DP/DETRAN/AM institui **gravação obrigatória, contínua e automática**
de todo o período de serviço operacional do agente (art. 5º), com **gravação de pré-evento** (art.
3º, IV) e acionamento por geolocalização (art. 7º, I, b), abrangendo **toda interação entre agente
de trânsito e condutor ou usuário da via** (art. 4º, VIII). É tratamento de dados pessoais —
imagem e voz de terceiros identificáveis — **contínuo, sistemático e em larga escala**, em via
pública.

A Portaria invoca a **Lei 12.527/2011 (LAI)** no art. 12, declara "respeito à privacidade" entre
seus valores (art. 1º, III) e protege o direito de imagem na divulgação (art. 14). **Não menciona
a Lei 13.709/2018 (LGPD) uma única vez.** Não estabelece base legal de tratamento, papel de
controlador/operador, encarregado, prazo de retenção, política de eliminação, nem canal de
exercício de direitos do titular. Três consequências:

1. **Ausência de prazo de retenção.** É a lacuna operacionalmente mais imediata: descarte precoce
   destrói prova de defesa e de acusação; guarda indefinida contraria a necessidade e a limitação
   temporal do tratamento. Sem prazo, **não há política de armazenamento defensável**.
2. **O interessado no processo administrativo não está no rol de acesso** (art. 13: Magistrados,
   MP, Defensoria, autoridades policiais/administrativas em investigação formal). O autuado que
   precise da gravação para instruir defesa ou recurso ([WF-INF-001]) não é legitimado pela
   Portaria; o art. 12 remete à LAI, mas vídeo com terceiros identificáveis é justamente hipótese
   de acesso restrito nela. **Tensão direta com o contraditório e a ampla defesa**, não resolvida
   no texto.
3. **Proporcionalidade da gravação integral do turno**, e não apenas das interações, é questão de
   minimização que a Portaria não endereça.

**Delimitação importante, em favor da precisão:** a Portaria **não altera o regime de validade do
AIT**. Ausência de gravação é **falha funcional** (art. 6º, parágrafo único) e enseja **PAD** (art. 17) — sanção disciplinar do agente. **Nenhum dispositivo declara inválido o auto lavrado sem
bodycam.** Tratar a gravação como condição de validade seria criar requisito inexistente; tratá-la
como irrelevante ignora seu peso probatório concreto na defesa.

A matéria cabe expressamente nos "casos omissos" do art. 16, a serem disciplinados por **Portaria
complementar não localizada**. Enquanto ela não existir, **a recomendação é não integrar o acervo
de bodycam ao TEAT como fonte de evidência consultável** — apenas correlacionar por janela temporal
e registrar a existência da gravação ([RN-TEAT-141], [RN-TEAT-142]). Consulta ao encarregado de
dados do órgão e ao jurídico é pré-requisito de escopo, não detalhe de implementação.

## 2.4 Guarda monitorada — em vigor, mas operacionalmente inaplicável

**Severidade: média. Bloqueia decisão de escopo, não a operação atual.**

O art. 17 da Res. CONTRAN 1.025/2026 cria a **guarda monitorada** — terceira via entre liberar e
remover fisicamente. Três pré-requisitos operacionais **ainda não existem**:

1. **A solução tecnológica precisa ser previamente homologada pelo órgão máximo executivo da
   União** (§4º), que _"estabelecerá os requisitos técnicos, os critérios de interoperabilidade, os
   mecanismos de rastreabilidade, monitoramento e segurança da informação, bem como os
   procedimentos operacionais aplicáveis"_ — tempo verbal futuro, ato não publicado. **Sem ele, a
   figura está em vigor e é inaplicável.**
2. **Cinco dos nove requisitos de elegibilidade (IV, V, VI, VII, VIII) exigem consulta a bases
   nacionais** — furto/roubo, restrições judiciais, alienação fiduciária em execução,
   licenciamento nos três últimos exercícios, restrição administrativa por descumprimento do art.
   271 §9º-A. A avaliação é, portanto, **estruturalmente incompatível com decisão puramente
   offline** — o que colide com a doutrina offline-first do TEAT.
3. **O requisito IX é cláusula aberta** (_"inexistem circunstâncias que comprometam o
   acompanhamento, a fiscalização ou a efetividade da guarda monitorada"_): juízo motivado da
   autoridade, não automatizável.

Dois efeitos jurídicos merecem destaque por serem contraintuitivos: o **§6º manda aplicar o art.
25** — ou seja, o veículo sob guarda monitorada **continua correndo o prazo de 60 dias para
leilão** se as pendências não forem regularizadas; e o **§3º** faz da violação do monitoramento
uma **infração autônoma do art. 239 do CTB**, autuada pelo próprio órgão de remoção — caso raro de
medida administrativa que **gera** um novo AIT ([RN-TEAT-127]).

Some-se a isso que a **Res. 1.025/2026 foi publicada em 30/06/2026**, há menos de dois meses, sem
qualquer fonte secundária de conferência disponível. **Validação jurídica humana é pré-requisito
para tratá-la como base normativa definitiva de produto** — recomendação já feita pelo CRAWLER e
aqui confirmada e ampliada.

---

# 3. Riscos, conflitos e questões abertas (itens referenciados pelas RN)

## Lavratura e conteúdo do AIT

**1 — "Fé pública do agente" não é categoria normativa.** _Severidade: média (higiene conceitual,
alto efeito de citação)._ O termo não aparece em nenhuma das normas pesquisadas e vinha sendo usado
no corpus TEAT como se fosse. O que existe é o **rol taxativo** de competência ([REF-CONTRAN-985-1003-MBFT]
Seção 4, _"não bastando mera designação mediante portaria"_) e a presunção de veracidade dos atos
administrativos, cuja consequência processual está no art. 281 do CTB. Nenhuma norma atribui ao
agente de trânsito fé pública no sentido técnico. Corrigido em [RN-TEAT-104]; recomenda-se retirar o
termo de [APP-TEAT] e do glossário. **Parecer confirmatório recomendado.**

**2 — Cláusula aberta do art. 280, III.** _Severidade: baixa._ _"[…] e outros elementos julgados
necessários à sua identificação"_ é juízo do agente, sem norma que o feche. Não deve ser
transformado em campo obrigatório por catálogo ([RN-TEAT-101]).

**3 — Uniformização e caracterização do veículo são pressupostos que o sistema não verifica.**
_Severidade: baixa-média._ São condições de legitimidade (MBFT Seção 4), mas não são verificáveis
por software. Modelar como validação automática seria falso; modelar como declaração do agente
sujeita a auditoria é o máximo defensável ([RN-TEAT-104]).

**4 — Assinatura do agente: Res. 918 art. 3º §2º × Portaria 997 art. 4º p.ú.** _Severidade: média._
A Resolução dispensa a assinatura como consequência da impressão; a Portaria a exige exatamente na
impressão feita **no ato**. Lidos isoladamente, apontam em direções opostas. **Leitura harmônica
adotada** ([RN-TEAT-105]): a Resolução alcança a impressão diferida da retaguarda; a Portaria, norma
específica e posterior, alcança a via entregue em campo. **A validar.**

**5 — Comunicação de irregularidade de sinalização sem forma, prazo ou destinatário.**
_Severidade: baixa-média._ O MBFT impõe ao agente comunicar a irregularidade em vez de autuar
(Seção 7), sem definir como. Não modelar o canal deixa o agente sem meio de cumprir dever expresso
([RN-TEAT-102]).

**6 — Consolidação de enquadramentos: as listas do MBFT são expressamente não exaustivas.**
_Severidade: média._ Uma tabela de relações entre enquadramentos derivada dos exemplos é
necessariamente incompleta; aplicada como bloqueio duro, impede autuações legítimas. Por isso
[RN-TEAT-103] é assimétrica: bloqueio só onde o critério é textual e objetivo (mesma raiz de
código), alerta consultivo no resto. **Critério a validar.**

**7 — Referendo no talão eletrônico acoplado a equipamento de detecção.** _Severidade: média._ O
art. 3º §3º da Res. 918 impõe referendo apenas ao **inciso III**; o inciso II admite talão
**acoplado a equipamento**, híbrido que o texto não endereça. Leitura adotada: **não incide o
referendo**, porque o §3º remete expressamente ao inciso III e o agente presente já constata
([RN-TEAT-106]). **Interpretação sobre silêncio — a validar.**

**8 — O campo Observações está sobrecarregado por cinco exigências distintas.** _Severidade: baixa
juridicamente, alta em qualidade de dado._ Caracterização da conduta, agente constatador em
operação, condutas consolidadas, sinais psicomotores e ciência do recolhimento do CRLV-e disputam o
mesmo texto livre. Recomendação: campos estruturados por finalidade, compondo o texto na impressão
([RN-TEAT-109]).

## Talão eletrônico (Portaria SENATRAN 997/2022)

**9 — O rol de três meios de autenticação é fechado.** _Severidade: média (conformidade de
homologação)._ Senha, biometria ou assinatura digital (Anexo II, a). Nenhuma norma autoriza um
quarto meio ([RN-TEAT-110]).

**10 — "Mesmo intervalo de tempo" na detecção de sessão concorrente é indefinido.** _Severidade:
ALTA — item prioritário._ A norma manda **não processar** registros do mesmo agente em aparelhos
diferentes "dentro de um mesmo intervalo de tempo" e apurar o fato, mas **não define o intervalo**.
Qualquer janela adotada é parâmetro inventado com consequência jurídica direta: curta demais deixa
passar a fraude que a norma quer apanhar; longa demais **anula atos legítimos** de agente que
trocou de aparelho por defeito — cenário que a norma sequer contempla. Precisa de **decisão da
autoridade de trânsito**, formalizada e versionada como dado do órgão, jamais constante de código
([RN-TEAT-111]).

**11 — "Os dados dos AIT somente poderão ser enviados e armazenados no banco de dados do órgão
autuador" (Anexo V, e).** _Severidade: média-alta (decisão de arquitetura)._ Literalmente, não
ressalva processadores, nuvem contratada, réplicas ou backup fora do domínio do órgão. Como a norma
é de 2022 e não trata de computação em nuvem, a leitura de trabalho é que a vedação alcança
**destino/titularidade do dado**, não infraestrutura contratada pelo próprio órgão
([RN-TEAT-112]). **Interpretação com efeito direto sobre hospedagem — a validar antes de decidir
arquitetura.**

**12 — Devolução de numeração reservada e não utilizada não é tratada por norma alguma.**
_Severidade: baixa-média._ Confirmado como **lacuna normativa**, não omissão de pesquisa. Se o
órgão exigir sequência contínua sem saltos na prestação de contas do talonário, o desenho atual
(perda do intervalo) pode não ser aceitável — decisão do órgão ([RN-TEAT-113], [WF-TEAT-002]).

**13 — A vedação de rascunhos simultâneos colide com a operação real.** _Severidade: média._ O
Anexo II, g) condiciona o novo preenchimento à finalização do anterior, o que literalmente proíbe
dois rascunhos abertos — incompatível com abordagem interrompida por ocorrência prioritária. A
saída conforme é cancelar com justificativa ([RN-TEAT-120]); suspensão temporária de rascunho seria
matéria a submeter à SENATRAN ([RN-TEAT-114]).

**14 — Alcance da vedação de auto-preenchimento.** _Severidade: baixa-média._ A norma veda o
preenchimento automático dos "campos destinados à identificação do veículo" sem validação **do
campo** pelo agente, sem dizer se alcança campos derivados da mesma consulta (município, endereço,
proprietário). Adotamos **interpretação extensiva deliberada**, em favor da defensabilidade
([RN-TEAT-115]).

**15 — Legibilidade do papel por 2 anos é requisito de suprimento, verificado na homologação.**
_Severidade: baixa._ Troca de insumo sem comprovação do fabricante derruba a conformidade do
conjunto, com o software intacto. Governança de contrato ([RN-TEAT-116]).

**16 — "Alteração de funcionalidade" não é definida.** _Severidade: média-alta (roadmap)._ A cada
alteração de código que gere alteração de funcionalidade, exige-se **nova homologação** (Anexo VII,
a), com prazo de até 60 dias para a SENATRAN se manifestar (art. 5º §1º); e auditoria que comprove
alteração no sistema instalado **cancela automaticamente** a certificação (Anexo VII, b). A
fronteira entre correção de defeito, ajuste de UI e mudança funcional é decisão do órgão — e errar
para menos cancela a homologação ([RN-TEAT-117]).

**17 — O Anexo VII, c) fala em cancelamento quando "as empresas" descumprirem.** _Severidade:
baixa._ A redação não alcança literalmente o órgão que desenvolve o próprio software — caso
PRODAM/DETRAN-AM. A lacuna favorece o órgão, mas é lacuna ([RN-TEAT-117]).

**18 — Entrega de código-fonte e scripts de banco à SENATRAN.** _Severidade: média (contratual, não
operacional)._ Anexo VI, i) e j); o parágrafo único dispensa apenas documentação societária
(alíneas c a g) para software do próprio órgão. Efeito sobre propriedade intelectual e sobre o
contrato de desenvolvimento ([RN-TEAT-117]).

**19 — Nem toda medida administrativa nasce de um AIT.** _Severidade: média (modelagem)._ Remoção
de veículo abandonado ou acidentado ocorre _"independentemente da existência de infração"_ (MBFT
Seção 8.2), e o Termo de Recolhimento admite fundamento em **ordem judicial ou ato administrativo**
([REF-CONTRAN-1025-2026] art. 14, III). O modelo precisa admitir `AdministrativeTerm` **sem** AIT
de origem ([RN-TEAT-118]).

## Saneamento, cancelamento e arquivamento

**20 — Não existe norma federal sobre saneamento do AIT.** _Severidade: ALTA — item prioritário._
Ver §2.2 acima. ([RN-TEAT-119], [RN-TEAT-006], [RN-TEAT-004])

**21 — Cancelamento de rascunho pressupõe conectividade que a mesma Portaria não exige.**
_Severidade: média._ O Anexo II, k) exige decisão da autoridade **no próprio software**, enquanto o
Anexo I, e) impõe preenchimento offline. Um rascunho com cancelamento pedido em campo, sem rede,
fica pendente por tempo indeterminado, ocupando número reservado e — por força do Anexo II, g) —
**impedindo novo AIT do mesmo agente naquele aparelho**. Dois requisitos da mesma Portaria
produzindo bloqueio operacional que o texto não previu ([RN-TEAT-120]).

**22 — Cancelamento de AIT finalizado apoia-se em prática documentada em notícia institucional.**
_Severidade: ALTA — item prioritário._ Ver §2.2. Nem a prática nem a competência da Diretoria de
Fiscalização estão em ato normativo localizado ([RN-TEAT-121]).

## Medidas administrativas

**23 — A ACC não tem inciso próprio no art. 269.** _Severidade: baixa._ O §3º (Lei 14.599/2023)
inclui a Autorização para Conduzir Ciclomotor entre os documentos de habilitação, mas os incisos
III e IV nomeiam só CNH e PPD. Interpretação sistemática: o recolhimento alcança a ACC
([RN-TEAT-122]).

**24 — "Não prejudicará, necessariamente" é deliberadamente aberto.** _Severidade: média._ Há
medidas que não sobrevivem à queda do auto (retenção fundada exclusivamente na infração arquivada)
e outras que sobrevivem (remoção por condições de segurança). A norma não separa as hipóteses —
logo o produto **não pode decidir por regra**, deve escalar ([RN-TEAT-123]).

**25 — "Prazo razoável, não superior a 30 dias" é teto, não prazo.** _Severidade: média._ A lei
delega ao agente a fixação concreta (art. 270 §2º). Parametrizar 30 dias fixos é escolha do órgão e
deve ser explícita, não default silencioso. O mesmo vale para os 15 dias do art. 271 §9º-A. O §5º
do art. 270 (transporte coletivo/perigoso/perecível) é **discricionariedade expressa do agente** —
o sistema oferece, nunca aplica sozinho ([RN-TEAT-124]).

**26 — O MBFT acrescenta requisito que a lei não traz.** _Severidade: baixa-média._ A Seção 8.1
condiciona a liberação a veículo _"devidamente licenciado"_, requisito ausente do art. 270 §2º do
CTB — restrição de hipótese legal por norma infralegal ([RN-TEAT-124]).

**27 — Dois prazos de regularização convivem e são confundidos: 30 dias (art. 270 §2º) e 15 dias
(art. 271 §9º-A).** _Severidade: média._ São dispositivos diferentes para situações diferentes; o
MBFT reproduz a dualidade (Seções 8.1 e 8.2). Usar um pelo outro produz **notificação com prazo
errado** ([RN-TEAT-125]).

**28 — O registro eletrônico do Termo de Recolhimento remete a forma ainda não publicada.**
_Severidade: média._ O art. 14 manda registrar _"na forma por ele estabelecida"_ pelo órgão máximo
executivo da União (procedimento do Sivec) — a obrigação existe, a forma de cumpri-la não
([RN-TEAT-126]).

**29 — Prazo de retirada impresso no termo: 60 dias, não 30.** _Severidade: média-alta (efeito
direto sobre o cidadão)._ O art. 14 §1º manda registrar no termo _"o prazo para a retirada do
veículo, sob pena de ser levado a leilão"_; esse prazo é o do **art. 25 (60 dias do
recolhimento)**. Os 30 dias dos arts. 26 e 27 são o marco do **edital** e da **preparação do
leilão**, não do vencimento do direito do proprietário. Imprimir 30 dias em campo é vício de
notificação com efeito sobre a alienação ([RN-TEAT-126], [RN-TEAT-128]).

**30 — Guarda monitorada: em vigor, inaplicável.** _Severidade: média — item prioritário para
decisão de escopo._ Ver §2.4. ([RN-TEAT-127])

**31 — Prazos de custódia com finalidades distintas (60 dias × 6 meses).** _Severidade: baixa._
Não é conflito, é convivência — mas é fonte previsível de erro de cálculo na retaguarda
([RN-TEAT-128]).

**32 — CONFLITO: quem recolhe o documento de habilitação, e quando.** _Severidade: ALTA — item
prioritário._ Três normas incompatíveis, duas do mesmo CONTRAN:

- **CTB arts. 165 e 165-A** — o recolhimento do documento é **medida administrativa da própria
  infração**, aplicada no ato;
- **Res. CONTRAN 432/2013 art. 10** — _"O documento de habilitação será recolhido **pelo agente**,
  mediante recibo"_, no procedimento de alcoolemia;
- **MBFT (Res. CONTRAN 985/2022) Seção 8.3** — _"O agente da autoridade de trânsito **somente**
  aplicará a medida administrativa de recolhimento de documento de habilitação quando ele flagrar o
  cometimento das infrações previstas nos art. 162, II"_.

**Leitura de trabalho adotada** ([RN-TEAT-129], [RN-TEAT-137]): o "somente" do MBFT alcança a medida
do art. 269, III **como decorrência de penalidade já imposta**, sem revogar as hipóteses em que a
própria lei prevê o recolhimento no ato — porque resolução não derroga lei e porque a Res. 432/2013
é norma especial expressa para alcoolemia. **É interpretação sobre conflito real, não sobre
silêncio, e precisa de parecer.**

**33 — Recolhimento do CLA e restrição no Renavam são dois momentos distintos.** _Severidade:
média._ O recolhimento ocorre **no ato** (início do prazo); a restrição administrativa, **no
vencimento** sem regularização (art. 270 §6º / art. 271 §9º-C). Fundi-los produz restrição indevida
no dia da abordagem ([RN-TEAT-130]).

## Alcoolemia

**34 — "Conjunto de sinais" não tem número mínimo; e o termo específico é alternativa, não
cumulação.** _Severidade: baixa-média._ Exigir um número específico de sinais é regra inventada — o
sistema deve alertar, não bloquear por contagem. Descrever os sinais no campo Observações é
juridicamente suficiente (art. 5º §2º: "no auto de infração **ou** em termo específico"), mas
destrói a estruturação do dado; recomendação de produto é sempre o termo ([RN-TEAT-132]).

**35 — Tensão entre "qualquer concentração" (CTB art. 276) e o piso de 0,05 mg/L (Res. 432 art. 6º,
II).** _Severidade: média._ A resolução, ao disciplinar a margem de tolerância, cria na prática um
**piso de autuação** para o etilômetro que a lei não previu — enquanto mantém "qualquer
concentração" para o exame de sangue. A delegação do art. 276, parágrafo único sustenta a solução,
mas a assimetria entre meios de prova é real e é argumento de defesa recorrente ([RN-TEAT-133]).

**36 — Remissão desatualizada na Res. 432/2013: recusa é art. 165-A, não art. 165.** _Severidade:
ALTA — item prioritário, com efeito direto sobre o enquadramento impresso no auto._ O art. 6º,
parágrafo único da Res. 432/2013 (janeiro/2013) manda aplicar à recusa _"as penalidades e medidas
administrativas previstas no art. 165"_. A **Lei 13.281/2016** criou o **art. 165-A** e deu ao art.
277 §3º a redação que determina expressamente a aplicação do **165-A**. Prevalece a lei posterior.
Nenhuma resolução CONTRAN posterior harmonizando o texto da 432/2013 foi localizada. Corrigido em
[REF-CONTRAN-432] e em [RN-TEAT-134]; **é o erro de enquadramento mais provável do procedimento de
alcoolemia**.

**37 — Nomenclatura de verificação metrológica divergente entre Res. 432 e RTM do INMETRO.**
_Severidade: baixa._ A Resolução fala em verificação _"inicial, eventual, em serviço e anual"_; o
RTM estrutura como inicial / subsequente (12 meses) / inspeção. Controle operacional adotado: a
**data de validade do Certificado de Verificação** que acompanha o exemplar ([RN-TEAT-135]).

**38 — Extensão do conteúdo mínimo do art. 8º da Res. 432 ao AIT do art. 165-A.** _Severidade:
baixa-média._ O _caput_ alcança literalmente só o AIT do art. 165. Nenhuma norma fixa o conteúdo do
auto de recusa — justamente aquele em que registrar contexto mais importa. Extensão por identidade
de razão, rotulada como interpretação ([RN-TEAT-136]).

## Equipamentos de detecção

**39 — Duas citações de redação revogada da Res. 798/2020 (corrigidas nesta rodada).**
_Severidade: baixa juridicamente, alta em contaminação de citações._ (a) A imagem com a placa está
no **art. 9º**, não no art. 13, e a Res. 804/2020 **substituiu integralmente** o art. 9º, reduzindo
de **nove** informações obrigatórias a **uma** — os demais dados continuam exigíveis, mas por outra
fonte (art. 8º e CTB art. 280). (b) A Res. 804/2020 **suprimiu do art. 4º, I, "c" a periodicidade
mínima de doze meses**, remetendo-a à regulamentação metrológica. Citar "doze meses" como exigência
da Res. 798/2020 é citar redação revogada. Corrigido em [REF-CONTRAN-798-804-equipamentos];
[RN-TEAT-138], [RN-TEAT-139].

**40 — Sinalização R-19 é exigida apenas para medidores do tipo fixo.** _Severidade: média._ Para
portáteis, móveis e estáticos — os efetivamente acopláveis ao talão eletrônico — a Resolução não
impõe sinalização prévia equivalente. Aplicar por analogia restringiria a fiscalização sem base;
não aplicar é a leitura textual correta, mas é ponto historicamente litigioso. **Não resolvido por
inferência** ([RN-TEAT-140]).

## Bodycam

**41 — Bodycam não é condição de validade do AIT.** _Severidade: baixa, mas evita erro de desenho
grave._ Ausência de gravação é falha funcional (art. 6º p.ú.) e enseja PAD (art. 17); nenhum
dispositivo invalida o auto ([RN-TEAT-141]).

**42 — Ausência de prazo de retenção e de política de expurgo.** _Severidade: alta._ Ver §2.3
([RN-TEAT-142]).

**43 — Rol de acesso não inclui o interessado no processo administrativo; LGPD não mencionada.**
_Severidade: alta._ Ver §2.3 ([RN-TEAT-142]).

## Competência e convênio

**44 — O instrumento formal do convênio DETRAN-AM/BPTRAN não foi localizado.** _Severidade: alta._
Número, data, vigência e cláusulas são desconhecidos; a existência está confirmada apenas por
notícias institucionais. Como a competência do policial militar para lavrar **deriva do convênio**
(MBFT Seção 4, III; CTB art. 23, III), a lacuna alcança a **legitimidade** de uma fatia da
autuação — e a expiração do convênio retiraria a competência sobre autos posteriores. Obtenção por
canal não público (ofício/SIC ao DETRAN-AM) é prioridade ([RN-TEAT-143], [RN-TEAT-104]).

---

# 4. O que foi verificado e está firme (para não re-litigar)

Reconferido contra fonte primária local, **sem divergência material**:

- **Portaria SENATRAN 997/2022** — extraída do PDF oficial do DOU; é, confirmadamente, a
  "regulamentação definida pelo órgão máximo executivo de trânsito da União" a que remetem o art.
  3º §1º, II e o §6º da Res. CONTRAN 918/2022. Fecha o gap mais citado do corpus TEAT. Vigente
  desde 01/09/2022, sem revogação localizada.
- **CTB arts. 165, 165-A, 269, 270, 271, 276, 277** — conferidos contra `planalto_plain.txt`; os
  extratos do CRAWLER estavam materialmente corretos.
- **CTB arts. 280, 281, 281-A** — já conferidos na rodada RAIT; reutilizados sem alteração de
  conteúdo, com atualização da anotação de risco do art. 282 §6º-A (gap **reduzido** pelo critério
  de "em flagrante" do MBFT Seção 7, que remete nominalmente àquele parágrafo).
- **Res. CONTRAN 432/2013** — extraída do PDF oficial; vigente, sem revogação localizada (a
  hipótese de "Res. 966/968" do briefing **não se confirmou**). Uma remissão desatualizada anotada
  (item 36).
- **Res. CONTRAN 798/2020 e 804/2020** — ambas conferidas artigo a artigo nesta rodada; cadeia
  396/2011 (revogada) → 798/2020 → 804/2020 confirmada; duas imprecisões da captura original
  corrigidas (item 39).
- **Portaria INMETRO 369/2021** — vigente desde 01/12/2021, consolidação que revoga expressamente
  as Portarias 6/2002 e 202/2010. Itens 4.1 e 6.3 do Anexo transcritos nesta revisão.
- **Portaria Normativa DETRAN-AM 003/2026** — PDF oficial assinado digitalmente, verificável em
  `edoc.amazonas.am.gov.br`; conteúdo íntegro. Dispositivos de acesso e divulgação (arts. 12-14,
  16, 17) acrescentados nesta revisão.

**Confiança reduzida, explicitamente sinalizada:**

- **Res. CONTRAN 1.025/2026** — publicada em 30/06/2026; sem fonte secundária de conferência.
- **Anexo do MBFT** — possível desatualização face à Res. 1.003/2023; risco baixo para a Parte
  Geral, **alto para as fichas** (§2.1).
- **Talão eletrônico do DETRAN-AM e convênio BPTRAN** — fonte secundária (notícias institucionais).
- **Convênio DETRAN-PR 224/2022** — modelo de processo, não norma vigente citável.

---

# 5. Lista priorizada — o que um advogado humano precisa validar

Ordenada por **risco × custo de errar**. Os cinco primeiros bloqueiam decisões de arquitetura ou
produzem erro com efeito direto sobre o cidadão.

| #     | Questão                                                                                                                                                                                                                     | Por que bloqueia                                                                                                                                                                                           | Refs                                                             |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| **1** | **Recolhimento do documento de habilitação em campo**: o "somente" da Seção 8.3 do MBFT revoga, na prática, as hipóteses de recolhimento no ato previstas nos arts. 165/165-A do CTB e no art. 10 da Res. 432/2013?         | Define se o agente aplica ou não a medida em toda autuação de alcoolemia — a mais frequente das medidas de campo. Errar significa aplicar medida sem competência **ou** deixar de aplicar medida vinculada | Item 32, §2.1, [RN-TEAT-129], [RN-TEAT-137]                      |
| **2** | **Enquadramento da recusa**: confirmar que o AIT de recusa é lavrado por **art. 165-A** e não por art. 165, apesar da remissão literal da Res. 432/2013 art. 6º, p.ú.                                                       | Erro de enquadramento no auto, replicado em todo o volume de alcoolemia, com efeito sobre penalidade e defesa                                                                                              | Item 36, [RN-TEAT-134], [RN-TEAT-005]                            |
| **3** | **Saneamento e cancelamento sem norma**: qual é o fundamento legal de `AitCorrection` e do cancelamento pós-finalização, e **qual lista de campos** pode ser corrigida sem que o auto deva ser arquivado (art. 281 §1º, I)? | Define se existe fila de saneamento no produto e com que limites; hoje o TEAT tem dois desfechos negativos sem correspondência jurídica                                                                    | §2.2, itens 20 e 22, [RN-TEAT-119], [RN-TEAT-121], [RN-TEAT-006] |
| **4** | **Janela de detecção de sessão concorrente** (Anexo II, h): qual intervalo de tempo a autoridade de trânsito fixa, e qual o tratamento do agente que troca de aparelho por defeito?                                         | A norma manda **não processar** os registros; o parâmetro decide entre deixar passar fraude e anular atos legítimos. Não pode ser constante de código                                                      | Item 10, [RN-TEAT-111]                                           |
| **5** | **Restrição de destino do dado** (Anexo V, e — "somente no banco de dados do órgão autuador"): alcança infraestrutura contratada pelo próprio órgão (nuvem, backup, réplica)?                                               | Decisão de arquitetura e de contrato de hospedagem, difícil de reverter depois                                                                                                                             | Item 11, [RN-TEAT-112]                                           |
| 6     | **Bodycam**: prazo de retenção, base legal de tratamento sob a LGPD, e acesso do interessado no processo administrativo — matéria dos "casos omissos" do art. 16, sem Portaria complementar                                 | Define se a bodycam pode entrar no escopo do TEAT como evidência e sob que regime; envolve o encarregado de dados do órgão                                                                                 | §2.3, itens 42 e 43, [RN-TEAT-142]                               |
| 7     | **Validação da Res. CONTRAN 1.025/2026** (publicada há ~2 meses, sem fonte secundária), em especial o **prazo de 60 dias** a imprimir no Termo de Recolhimento e a **guarda monitorada**                                    | Prazo errado no termo entregue em campo é vício de notificação com efeito sobre alienação; guarda monitorada é decisão de escopo                                                                           | §2.4, itens 28, 29 e 30, [RN-TEAT-126], [RN-TEAT-127]            |
| 8     | **Força normativa da Parte Geral do MBFT** e das construções sem contrapartida no CTB (boa ordem administrativa; início da operação de remoção; classificação de infrações simultâneas)                                     | Define quanto peso as RN podem dar a essas regras na defesa do auto                                                                                                                                        | §2.1, itens 6 e 26                                               |
| 9     | **Ciclo de homologação SENATRAN**: o que conta como "alteração de funcionalidade"? E o Anexo VII, c) alcança órgão que desenvolve o próprio software?                                                                       | Gargalo regulatório de até 60 dias no ciclo de release; errar para menos **cancela** a homologação por auditoria                                                                                           | Itens 16 e 17, [RN-TEAT-117]                                     |
| 10    | **Obtenção do instrumento formal do convênio DETRAN-AM/BPTRAN** (ofício/SIC)                                                                                                                                                | A competência do agente conveniado deriva dele; a lacuna alcança a legitimidade de parte da autuação                                                                                                       | Item 44, [RN-TEAT-143]                                           |
| 11    | **Assinatura do agente**: confirmar a leitura harmônica entre Res. 918 art. 3º §2º e Portaria 997 art. 4º p.ú.                                                                                                              | Define o modelo de documento impresso em campo                                                                                                                                                             | Item 4, [RN-TEAT-105]                                            |
| 12    | **Referendo no talão acoplado a equipamento de detecção** (art. 3º §1º, II × §3º)                                                                                                                                           | Define se o TEAT precisa ou não modelar fluxo de referendo                                                                                                                                                 | Item 7, [RN-TEAT-106]                                            |
| 13    | **Piso de 0,05 mg/L × "qualquer concentração"** do art. 276 do CTB                                                                                                                                                          | Argumento de defesa recorrente; afeta o limiar impresso no auto                                                                                                                                            | Item 35, [RN-TEAT-133]                                           |
| 14    | **R-19 e medidores portáteis**: a exigência de sinalização alcança os não fixos?                                                                                                                                            | Ponto litigioso histórico; afeta a fiscalização de velocidade em campo                                                                                                                                     | Item 40, [RN-TEAT-140]                                           |
| 15    | **Confirmar a versão vigente do Anexo do MBFT** (pós-Res. 1.003/2023) antes de importar as fichas de fiscalização como dado do `NormativeCatalog`                                                                           | As fichas são a fonte da classificação Caso 1/2/3, da obrigatoriedade do campo Observações e das relações entre enquadramentos                                                                             | §2.1, [RN-TEAT-103], [RN-TEAT-108], [RN-TEAT-109]                |

**Ações de conformidade que não dependem de validação jurídica** (podem ser encaminhadas desde já):

1. **Retirar "fé pública do agente" de [APP-TEAT], do glossário e de qualquer artefato** — não é
   categoria normativa; substituir pela referência ao rol taxativo do MBFT Seção 4 (item 1).
2. **Corrigir o prazo impresso no Termo de Recolhimento para 60 dias** contados do recolhimento
   (art. 25 da Res. 1.025/2026), não os 30 dias do edital (item 29).
3. **Deixar de citar a redação revogada do art. 9º da Res. 798/2020** e a periodicidade de doze
   meses do art. 4º, I, "c" — já corrigido nos REF (item 39).
4. **Derivar `no_approach_reason` do enquadramento** (Casos 1/2/3), deixando de exigir justificativa
   onde a norma expressamente a dispensa — cria passivo argumentativo gratuito na defesa
   ([RN-TEAT-108]).
