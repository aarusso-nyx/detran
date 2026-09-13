---
id: RN-PORTAL-101
title: Matriz "ato → nível mínimo de assinatura eletrônica" do PORTAL
status: draft
apps: [portal, rait]
sources:
  [
    REF-DECRETO-10543-2020,
    REF-LEI-14063-2020,
    REF-MP-2200-2-2001,
    REF-CONTRAN-900,
    REF-CONTRAN-918,
    REF-CTB-280-290,
    REF-DETRANAM-PORTARIA-NORMATIVA-001-2025,
  ]
updated: 2026-09-13
---

**Regra.** Todo ato que o cidadão pratica no PORTAL declara, no seu caso de uso, um **nível mínimo de
assinatura eletrônica** — simples, avançada ou qualificada, na classificação de [REF-LEI-14063-2020]
art. 4º. O nível é atributo **do ato**, não do usuário nem da sessão: um mesmo usuário logado pratica
consultas em nível simples e protocola defesa em nível avançado, sem novo cadastro, apenas com o
reforço de garantia de autoria exigido pelo ato. A matriz vinculante do produto é:

| #   | Ato do PORTAL                                                                                            | Nível mínimo              | Fundamento                                                                                                                                    | Confiança  |
| --- | -------------------------------------------------------------------------------------------------------- | ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| 1   | Consultar multas, pontuação, situação da CNH e do veículo; acompanhar processo; baixar documento próprio | **Simples**               | [REF-DECRETO-10543-2020] art. 4º, I, "b" — **nomeado**                                                                                        | Alta       |
| 2   | Agendar atendimento; solicitar serviço; enviar documento e receber número de protocolo                   | **Simples**               | art. 4º, I, "a" e "c" — **nomeados**                                                                                                          | Alta       |
| 3   | Apresentar manifestação à ouvidoria (reclamação, denúncia, elogio, sugestão, solicitação)                | **Nenhum nível exigível** | art. 2º, parágrafo único, III — ouvidoria **excluída** do Decreto; c/c [REF-LEI-13460-2017] arts. 10, § 1º e 11 — ver [RN-PORTAL-109]         | Alta       |
| 4   | Autocadastro e gestão do perfil no PORTAL                                                                | **Avançada**              | art. 4º, II, "d" — **nomeado**                                                                                                                | Alta       |
| 5   | Indicar o condutor infrator                                                                              | **Avançada**              | art. 4º, II, "f" — por **subsunção** (declaração prestada em virtude de lei que constitui reconhecimento de fato e assunção de obrigação)     | Média-alta |
| 6   | Apresentar defesa da autuação; interpor recurso à JARI; interpor recurso ao CETRAN                       | **Avançada**              | art. 4º, II, "h" — **nomeado, literalmente**: _"a apresentação de defesa e interposição de recursos administrativos"_                         | Alta       |
| 7   | Responder a diligência com documento adicional                                                           | **Avançada**              | art. 4º, II, "g" — **nomeado**                                                                                                                | Alta       |
| 8   | Desistir de defesa ou recurso já protocolado                                                             | **Avançada**              | Paralelismo de forma com a linha 6 — **inferência**                                                                                           | Média      |
| 9   | Aderir ao SNE / cancelar a adesão                                                                        | **Avançada**              | art. 4º, II, "d" e "f" — por **subsunção**                                                                                                    | Média      |
| 10  | Solicitar emissão de documento de arrecadação (guia de multa/taxa)                                       | **Simples**               | art. 4º, I, "a" e "c"                                                                                                                         | Alta       |
| 11  | Autorizar a transação de pagamento em si                                                                 | **Fora do Decreto**       | Regido pelo arranjo de pagamento e pelas regras do SPB/BACEN — ver [RN-PORTAL-125]                                                            | Alta       |
| 12  | Assinar a ATPV-e (transferência de propriedade — serviço futuro)                                         | **Avançada**              | [REF-CONTRAN-809-2020] art. 16, que remete à [REF-LEI-14063-2020]; **não** cai no art. 4º, III, "a" do Decreto, que trata de bens **imóveis** | Média-alta |

Duas travas transversais, ambas com texto expresso:

- **Elevação é possível, rebaixamento não.** _"A autoridade máxima do órgão ou da entidade poderá
  estabelecer o uso de assinatura eletrônica em nível superior ao mínimo exigido"_ (art. 4º, § 1º) —
  a matriz é **piso**, e qualquer elevação exige ato motivado da autoridade máxima, não decisão de
  produto.
- **O nível eletrônico nunca fecha a porta presencial** — ver [RN-PORTAL-105].

**Base legal.**

- [REF-DECRETO-10543-2020] art. 4º, II: _"assinatura eletrônica avançada - admitida para as
  hipóteses previstas no inciso I e nas hipóteses de interação com o ente público que, considerada a
  natureza da relação jurídica, exijam maior garantia quanto à autoria, incluídos: [...] f) as
  declarações prestadas em virtude de lei que constituam reconhecimento de fatos e assunção de
  obrigações; g) o envio de documentos digitais ou digitalizados em atendimento a procedimentos
  administrativos ou medidas de fiscalização; e **h) a apresentação de defesa e interposição de
  recursos administrativos**"_.
- [REF-DECRETO-10543-2020] art. 4º, I, "b": assinatura simples admitida para _"a realização de
  autenticação ou solicitação de acesso a sítio eletrônico oficial que contenha informações de
  interesse particular, coletivo ou geral, mesmo que tais informações não sejam disponibilizadas
  publicamente"_.
- [REF-DECRETO-10543-2020] art. 4º, § 1º e art. 2º, parágrafo único, III.
- [REF-LEI-14063-2020] art. 4º, II: a assinatura avançada _"está associada ao signatário de maneira
  unívoca"_, usa dados _"cujo signatário pode, com elevado nível de confiança, operar sob o seu
  controle exclusivo"_ e permite detectar _"qualquer modificação posterior"_; art. 5º, § 5º: _"No
  caso de conflito entre normas vigentes [...] prevalecerá o uso de assinaturas eletrônicas
  qualificadas."_
- Subsunção da linha 5: [REF-CTB-280-290] art. 257, § 7º (_"o principal condutor ou o proprietário
  do veículo terá o prazo de 30 (trinta) dias, contado da notificação da autuação, para
  apresentá-lo"_) c/c [REF-CONTRAN-918] art. 5º, que exige no formulário as **assinaturas do
  proprietário e do condutor indicado** — o ato constitui, simultaneamente, reconhecimento de fato
  (quem dirigia) e assunção de obrigação por terceiro identificado. É exatamente a descrição da
  alínea "f".
- Requisito de assinatura no próprio requerimento: [REF-CONTRAN-900] art. 3º, VI (_"assinatura do
  requerente ou de seu representante legal"_) e art. 4º, III (não conhecimento quando _"não houver a
  assinatura do recorrente ou de seu representante legal"_). O CONTRAN exige **que haja** assinatura;
  **não** define o nível eletrônico dela — a lacuna é precisamente o que esta matriz preenche.

**Verificação.** Cada UC do PORTAL carrega o campo `nivel_assinatura_minimo ∈ {nenhum, simples,
avancada, qualificada}`; o gateway de assinatura recusa a submissão do ato quando a credencial
apresentada é de nível inferior ao declarado, e a recusa é uma mensagem de **elevação de nível**
("para protocolar sua defesa, confirme sua identidade"), nunca um erro genérico de permissão. Três
verificações negativas, igualmente obrigatórias: (a) nenhum ato da linha 1-2 pode exigir nível
superior a simples; (b) nenhum ato da linha 3 pode exigir qualquer nível; (c) nenhum ato da matriz
exige nível **qualificado** (ICP-Brasil) — se algum fluxo do produto passar a exigi-lo, isso é
elevação sob o art. 4º, § 1º e depende de ato da autoridade máxima do DETRAN-AM.

**Controvérsia/risco (ALTO — de fundamento, não de conteúdo).**

1. **O Decreto 10.543/2020 é federal e não vincula o DETRAN-AM.** Seu art. 1º trata do uso de
   assinaturas _"na administração pública federal"_, o art. 2º, I delimita a _"administração pública
   federal direta, autárquica e fundacional"_, e o _caput_ do próprio art. 4º repete a delimitação.
   O DETRAN-AM é autarquia **estadual**. A matriz acima é, juridicamente, **parâmetro técnico
   adotado por decisão de arquitetura**, e não norma diretamente aplicável — mesmo tratamento dado
   ao eMAG em [RN-PORTAL-113] e ao gov.br Design System.
2. **Sem ato local, exigir nível é exigir o que a lei não exige.** [REF-LEI-13460-2017] art. 5º, IV
   veda _"a imposição de exigências, obrigações, restrições e sanções não previstas na legislação"_.
   Enquanto o DETRAN-AM (ou o Estado do Amazonas) não editar ato próprio fixando os níveis por
   serviço — o equivalente estadual do art. 13, II do Decreto —, cada exigência de nível avançado
   imposta pelo PORTAL é atacável como exigência sem base normativa local. **A mitigação é barata e
   deve ser recomendada ao Owner: uma portaria do DETRAN-AM que adote esta matriz fecha o problema
   inteiro**, e é o mesmo tipo de ação de baixo risco/alto impacto já autorizada em
   `_meta/steering.md` D.28.
3. **Linhas 5, 8 e 9 são subsunção, não nomeação.** As alíneas do art. 4º são precedidas de
   "incluídos" — róis exemplificativos. Nada impede o enquadramento por subsunção ao _caput_ do
   inciso, mas o grau de certeza é menor que o das linhas nomeadas, e um parecer futuro pode
   rebaixar a indicação de condutor ou a adesão ao SNE para nível simples. O risco de errar **para
   cima** (exigir avançada onde bastaria simples) é atrito de usabilidade; o de errar **para baixo**
   é a fragilidade probatória de um ato que atribui infração a terceiro. Adota-se aqui o lado
   conservador, e a assimetria está registrada para o parecerista.
4. **Não confundir com nível de conta.** Ver [RN-PORTAL-102]: bronze/prata/ouro é outro eixo, e não
   é norma.

Itens 2, 3 e 6 de `_intake/legal-assessment.md`.

**Fonte institucional localizada e decisão do Owner (2026-09-13).** A Portaria Normativa
DETRAN-AM 001/2025 ([REF-DETRANAM-PORTARIA-NORMATIVA-001-2025]) admite, para defesas, recursos,
indicação de condutor, procurações, declarações de residência e requerimentos, as assinaturas
gov.br de nível comprovado (ouro), e-Notariado e qualificada — confirmando as linhas 5 a 8 da
matriz como **avançada** com base em ato do próprio órgão. **Decisão do Owner (steering H.50):**
o PORTAL aceita também o selo gov.br **prata** como assinatura avançada, com fundamento no
Decreto 10.543/2020, embora a portaria só mencione o nível ouro; o órgão foi instado a editar
portaria que o admita (ofício 01) e a questão integra a consulta jurídica única (item 8). O
recurso ao CETRAN-AM segue a mesma regra por adoção administrativa, a confirmar (H.49).
