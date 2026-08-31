---
id: RESEARCH-DOSSIER-DASHBOARD
title: Dossiê de pesquisa CRAWLER — DASHBOARD (rodada transversal, 2026-08-25)
status: draft
apps: [dashboard]
sources:
  [
    REF-LEI-12527-2011,
    REF-DECRETO-8777-2016,
    REF-LEI-14129-2021,
    REF-CONTRAN-918,
    REF-CONTRAN-808-2020,
    REF-LEI-13614-2018,
    REF-LEI-13709-2018,
    REF-TCEAM-MANUAL-AUDITORIA-TI,
    REF-LEI-13460-2017,
  ]
updated: 2026-08-25
---

# Dossiê de pesquisa — DASHBOARD

Rodada CRAWLER da dupla transversal (DASHBOARD + PORTAL — ver dossiê irmão em
`transversal/portal/_intake/research-dossier.md`, mesmo corpus legal em grande parte
compartilhado). Cobre os 5 alvos do briefing. Base já capturada e reutilizada sem novo download:
[REF-LEI-13709-2018] (LGPD, estendida nesta rodada com o art. 13), [REF-CONTRAN-918] (arrecadação/
repasse), [REF-CONTRAN-808-2020] (RENAEST), [REF-LEI-13614-2018] (Pnatrans/CTB art. 326-A),
`refs/ctb/*`.

## 1. Transparência e estatística

- **LAI (Lei 12.527/2011)** — texto integral obtido; arts. 3º/5º (transparência regra, sigilo
  exceção) e **art. 8º § 3º** (checklist técnico de portal: busca, exportação em formato aberto,
  API legível por máquina, changelog, acessibilidade) são a base normativa direta do módulo de
  transparência do DASHBOARD. **Relógio legal**: art. 11, §§ 1º-2º — resposta a pedido de acesso
  em até **20 dias, prorrogáveis por mais 10**. Ver [REF-LEI-12527-2011].
- **CTB art. 326-A** (já capturado em [REF-CTB-sinistro-cena-renaest] / [REF-LEI-13614-2018]) —
  reconfirmado nesta rodada: o § 9º **original de 2018** fixava prazo de **1º de março** para o
  repasse estadual de dados estatísticos ao sistema nacional; a redação **vigente desde a Lei
  14.599/2023** substituiu esse prazo fixo por "conforme regulamentação do Contran" — **gap já
  registrado em `refs/INDEX.md`**: nenhuma regulamentação CONTRAN pós-2023 restabeleceu prazo
  equivalente. Fica como um relógio **legalmente extinto em sua forma original**, hoje sem
  substituto localizado — item de monitoramento que o DASHBOARD não pode calendarizar com data
  fixa até essa lacuna ser fechada.
- **Res. CONTRAN 808/2020 art. 8º, V** (RENAEST) — **dever de publicação estatística mensal e
  federal**, já identificado na rodada BOAT como "único dever normativo de publicação estatística
  localizado em toda a cadeia" — é federal (órgão máximo executivo da União), não estadual, mas
  estabelece o padrão de periodicidade (mensal) que o DASHBOARD pode espelhar/comparar.
- **Lei 14.129/2021 arts. 29-32** (dados abertos) — sucede e amplia o Decreto 8.777/2016; ver
  achado central no item 3 abaixo.

## 2. Obrigações periódicas de reporte com prazo — a tabela de deveres monitoráveis

**Este é o artefato mais valioso da rodada, conforme instrução do briefing.** Compilação de toda
obrigação legal com prazo numérico ou periodicidade explícita, localizada nesta pesquisa e nas
rodadas anteriores (BOAT, RAIT), relevante ao DETRAN-AM:

| #   | Dever                                                                                                | Fonte (artigo)                                               | Periodicidade / prazo                                                                                                                            | Consequência de descumprimento (se localizada)                                          |
| --- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| 1   | Prestar informações de arrecadação/FUNSET ao órgão máximo executivo de trânsito da União             | [REF-CONTRAN-918] art. 26                                    | **Até o 20º dia do mês subsequente** ao da arrecadação                                                                                           | Não localizada expressamente neste artigo                                               |
| 2   | Enviar relatório mensal de arrecadação por cartão de débito/crédito, para controle do repasse FUNSET | [REF-CONTRAN-918] art. 27, § 6º                              | **Mensal**                                                                                                                                       | **Suspensão da autorização** para admitir pagamento parcelado/à vista por cartão (§ 7º) |
| 3   | Repasse do percentual de 5% ao FUNSET                                                                | [REF-CONTRAN-918] art. 24, § 1º c/c CTB art. 320 § 1º        | Não fixa periodicidade própria (decorre da arrecadação)                                                                                          | Não localizada nesta rodada                                                             |
| 4   | Publicar, atualizar e divulgar estatísticas de acidentes/sinistros no sítio eletrônico do órgão      | [REF-CONTRAN-808-2020] art. 8º, V                            | **Mensal** — mas é dever do **órgão máximo executivo federal**, não do DETRAN-AM diretamente                                                     | Não localizada                                                                          |
| 5   | Repassar dados estatísticos estaduais consolidados ao sistema nacional de registro de sinistros      | CTB art. 326-A, § 9º (redação de 2018, [REF-LEI-13614-2018]) | **Anual, até 1º de março** — **prazo revogado/substituído pela Lei 14.599/2023**, hoje remetido a "regulamentação do Contran" **não localizada** | Não localizada (e hoje sem prazo vigente definido)                                      |
| 6   | Reuniões periódicas entre coordenadores estaduais de RENAEST e o coordenador federal                 | [REF-CONTRAN-808-2020] arts. 8º, VIII e 9º, VII              | Periódicas, sem prazo numérico fixado                                                                                                            | —                                                                                       |
| 7   | Relatório anual de gestão da ouvidoria, com publicação integral na internet                          | [REF-LEI-13460-2017] art. 15                                 | **Anual**                                                                                                                                        | Não localizada sanção específica; dever de publicação é auto-executável                 |
| 8   | Resposta da ouvidoria à manifestação do usuário                                                      | [REF-LEI-13460-2017] art. 16, caput                          | **30 dias, prorrogáveis 1x por igual período** (60 dias no limite)                                                                               | Recusa de recebimento gera responsabilidade do agente público (art. 11)                 |
| 9   | Resposta de agente público a solicitação da própria ouvidoria                                        | [REF-LEI-13460-2017] art. 16, parágrafo único                | **20 dias, prorrogáveis 1x** (40 dias no limite)                                                                                                 | Não localizada sanção específica                                                        |
| 10  | Pesquisa de satisfação do usuário + publicação de resultado e ranking de reclamações                 | [REF-LEI-13460-2017] art. 23, §§ 1º-2º                       | **Mínimo anual**                                                                                                                                 | Não localizada sanção específica; a omissão é passível de fiscalização/controle social  |
| 11  | Resposta a pedido de acesso à informação (LAI)                                                       | [REF-LEI-12527-2011] art. 11, §§ 1º-2º                       | **Imediato, se possível; senão 20 dias + 10 de prorrogação** (30 dias no limite)                                                                 | Recurso em 10 dias; decisão da CGU em 5 dias (regime federal, referência de padrão)     |
| 12  | Integração institucional ao RENAEST                                                                  | [REF-CONTRAN-808-2020] art. 16                               | **Prazo já vencido (04/01/2022)** — marco histórico, não recorrente                                                                              | Não localizada                                                                          |
| 13  | Notificação de vencimento da CNH                                                                     | CTB art. 159, § 12                                           | **30 dias de antecedência**, por meio eletrônico                                                                                                 | Não localizada                                                                          |

**Total: 13 deveres monitoráveis compilados**, dos quais **9 têm prazo numérico explícito** (linhas
1, 2, 5\*, 7, 8, 9, 10, 11, 13 — \*prazo de 5 hoje extinto em sua forma original) e **2 têm
consequência de descumprimento expressamente prevista em norma** (linhas 2 e 8-parcial). Nenhum
dos deveres com origem em resolução CONTRAN (linhas 1, 2, 4, 6, 12) tem sanção pecuniária ou
disciplinar explícita para o órgão estadual — a "consequência" mais forte encontrada em todo o
corpus é administrativa/interna (suspensão de autorização, linha 2).

**Recomendação de produto**: modelar cada linha acima como um "relógio legal" no DASHBOARD (estado
verde/amarelo/vermelho por proximidade do vencimento), análogo ao padrão de escada de alertas já
usado no RAIT ([WF-RAIT-002] § 4). As linhas 1, 2, 7, 8-9, 10 e 11 são as mais robustas para MVP
(prazo numérico + fonte verbatim + aplicável ao órgão estadual diretamente).

## 3. Anonimização e divulgação agregada

**LGPD arts. 12 e 13 — verbatim, capturados/estendidos nesta rodada em [REF-LEI-13709-2018].**

> Art. 12. Os dados anonimizados não serão considerados dados pessoais para os fins desta Lei,
> salvo quando o processo de anonimização ao qual foram submetidos for revertido, utilizando
> exclusivamente meios próprios, ou quando, com esforços razoáveis, puder ser revertido.

> Art. 13. Na realização de estudos em saúde pública, os órgãos de pesquisa poderão ter acesso a
> bases de dados pessoais, que serão tratados exclusivamente dentro do órgão e estritamente para a
> finalidade de realização de estudos e pesquisas e mantidos em ambiente controlado e seguro [...]
> § 1º A divulgação dos resultados [...] em nenhuma hipótese poderá revelar dados pessoais.
> § 2º [...] não permitida, em circunstância alguma, a transferência dos dados a terceiro.
> § 4º [...] a pseudonimização é o tratamento por meio do qual um dado perde a possibilidade de
> associação, direta ou indireta, a um indivíduo, senão pelo uso de informação adicional mantida
> separadamente pelo controlador em ambiente controlado e seguro.

**Conexão direta com [RN-BOAT-130..132]** (regras já existentes sobre divulgação agregada de
sinistros): o art. 13 é o piso legal para qualquer módulo de estatística agregada de sinistros
exposto no DASHBOARD que envolva dado de saúde de vítima — exige ambiente controlado, veda
divulgação que revele dado pessoal (mesmo em agregado, se a granularidade permitir
reidentificação — conecta-se ao "princípio anti-reidentificação" de
[REF-SENATRAN-PORTARIA-139-2025] art. 17 § 2º, já capturado na rodada BOAT), e veda absolutamente
transferência a terceiro. Distinção relevante: art. 12 trata do dado **já** anonimizado (fora do
escopo da LGPD); art. 13 rege o **processo** de tratamento intermediário (pseudonimização, dentro
do órgão, sob responsabilidade exclusiva) — o DASHBOARD deve modelar os dois estágios
separadamente se for expor indicadores derivados de dado de saúde de vítima de sinistro.

## 4. Controle interno e auditoria — achado confirmadamente "thin", conforme antecipado no briefing

- **TCE-AM publica um Manual de Auditoria de TI** (96 páginas, Diretoria de Controle Externo em
  TI/DIATI) — texto obtido e lido integralmente. É material técnico-operacional interno do
  Tribunal, não norma vinculante direta ao DETRAN-AM. Sua base legal é o **Regimento Interno do
  TCE-AM (2002), art. 5º, VII** ("auditorias de natureza [...] operacional"), que estende por
  interpretação (apoiada em referenciais internacionais INTOSAI/ISSAI 5300) a competência genérica
  de auditoria à esfera de TI — não há inciso específico de TI no Regimento de 2002. Ver
  [REF-TCEAM-MANUAL-AUDITORIA-TI].
- **Achado de pesquisa (negativo, documentado)**: a **Instrução Normativa CGE/AM nº 001/2020**
  (diretrizes de auditoria para a Administração estadual direta/indireta/fundacional) e o
  **Decreto Estadual nº 53.273/2025** (Sistema de Controle Interno do Executivo estadual, sistema
  eletrônico "Apoena") são citados por fontes institucionais (Agência Amazonas de Notícias, CONACI)
  como os instrumentos mais próximos de uma norma estadual vinculante — mas **o texto integral não
  foi obtido**: o portal `cge.am.gov.br` retornou erro de banco de dados (HTTP 500) e certificado
  TLS expirado durante toda a tentativa de captura desta rodada. **Gap de infraestrutura de
  pesquisa, não de existência normativa** — recomenda-se nova tentativa quando o site estiver
  operacional, ou solicitação direta à CGE-AM.
- **Conclusão**: confirma-se a expectativa do briefing — este é o alvo **mais fraco em cobertura
  legal direta e vinculante ao DETRAN-AM**. O DASHBOARD não tem hoje uma âncora estadual específica
  e verbatim para um módulo de "trilha de auditoria de TI"; a base disponível é (a) competência
  genérica de auditoria externa do TCE-AM e (b) referência federal/genérica de governança e
  segurança já presente na LGPD (arts. 37/46, já capturados em [REF-LEI-13709-2018]).

## 5. Painéis/observatórios existentes — benchmark

- **SENATRAN — página oficial de Estatísticas** (`gov.br/transportes/.../estatisticas-senatran`,
  WebFetch 2026-08-25): publica quatro blocos por sistema nacional — RENAVAM (frota), RENACH
  (habilitação), RENAINF (infrações/notificações de penalidade) e RENAEST (estatísticas de
  trânsito e acidentes) — mais um Anuário SENATRAN (2021, desatualizado na captura) e link para o
  Plano de Dados Abertos. Não expõe um painel interativo único na página inicial; a navegação é
  por seção/dataset. **Exemplo oficial nº 1.**
- **DETRAN-SP — seção de Transparência** (WebSearch, 2026-08-25): publica estatísticas de
  atendimento, estatísticas de trânsito, planejamento/orçamento e prestação de contas sobre
  receita de multas — modelo de referência de transparência **estadual** (mais próximo do nível de
  governo do DETRAN-AM que o federal). **Exemplo oficial nº 2.**
- **IRIS / Observatório Nacional de Segurança Viária (ONSV)** (WebSearch, 2026-08-25 — página
  oficial bloqueou WebFetch direto com HTTP 403): painel de "Indicadores Integrados de Segurança
  Viária" que compara desempenho de segurança viária **entre Estados**, indo além da contagem de
  óbitos/feridos. **É observatório de sociedade civil/parceria técnica (ONSV), não sistema oficial
  de governo** — útil como referência de UX/indicadores, não como fonte normativa. Citado aqui
  como o exemplo de "observatório" (distinto de "painel oficial") pedido pelo briefing.

## Tabela de deveres monitoráveis — ver seção 2 (13 itens compilados)

## Gaps explícitos desta rodada

1. **Prazo de repasse estatístico anual ao sistema nacional (CTB art. 326-A, § 9º)** — extinto em
   sua forma original (1º de março) pela Lei 14.599/2023, sem substituto CONTRAN localizado. Já
   registrado em `refs/INDEX.md`, reconfirmado nesta rodada sem novidade.
2. **IN CGE/AM nº 001/2020 e Decreto AM nº 53.273/2025** — existência confirmada por fonte
   secundária, texto não obtido (site `cge.am.gov.br` fora do ar / certificado expirado).
3. **Consequência de descumprimento** — ausente ou não localizada para 11 das 13 obrigações
   compiladas na tabela do item 2; apenas a linha 2 (relatório mensal de cartão) tem sanção
   administrativa explícita (suspensão de autorização).
4. **Nenhuma norma estadual específica de governança de TI vinculante ao DETRAN-AM** — confirmado
   como esperado pelo briefing; a base disponível é genérica/federal ou de competência de auditoria
   externa (TCE-AM), não um framework de controle interno com nome próprio.
5. **Observatório ONSV/IRIS** — não foi possível extrair detalhe técnico direto (bloqueio HTTP
   403); a caracterização acima é baseada em resultados de busca, não em leitura da página.

## Handoff — LEGAL

- Avaliar se a linha 5 da tabela de deveres (prazo estatístico anual extinto sem substituto) deve
  ser tratada como lacuna normativa a ser suprida por norma interna do DETRAN-AM (dado que a lei
  federal delegou a matéria ao CONTRAN e este não regulamentou) — mesma lógica já usada para outras
  lacunas do corpus (ex.: "força maior" do CTB art. 290-A, RAIT item C.20 do steering).
- Confirmar se a Instrução Normativa CGE/AM nº 001/2020 e o Decreto 53.273/2025, quando obtidos,
  criam algum dever de reporte periódico do DETRAN-AM ao sistema Apoena — se sim, adicionar à
  tabela de deveres monitoráveis como novas linhas.
- Validar a leitura do art. 13 da LGPD como piso aplicável às estatísticas agregadas de sinistro
  que alimentariam um módulo do DASHBOARD, e sua articulação com [RN-BOAT-130..132].

## Handoff — BPO

- A tabela de 13 deveres monitoráveis (seção 2) é o insumo direto para desenhar o módulo de
  "relógios legais" do DASHBOARD — recomenda-se calibrar limiares de alerta (verde/amarelo/
  vermelho) por linha, no mesmo padrão da escada de SLA já aprovada para o RAIT
  ([WF-RAIT-002] § 4, decisão de steering A.1).
- Priorizar as linhas 1, 2 e 8-11 (prazo numérico + aplicável diretamente ao órgão estadual) para
  o primeiro incremento do produto; tratar as linhas 4, 5, 6 e 12 (deveres federais ou já vencidos)
  como referência/benchmark, não como relógio operacional do DETRAN-AM.
- Reabrir contato com CGE-AM para obter o texto de IN 001/2020 e Decreto 53.273/2025 — tentativa
  de acesso ao site oficial falhou nesta rodada por problema técnico do próprio site, não por
  ausência do documento.

## Handoff — UX

- Modelar o painel de indicadores por serviço do DASHBOARD espelhando o trio já consolidado desde
  2016 (Decreto 8.936/2016 art. 3º, V) e detalhado em 2021 (Lei 14.129/2021 art. 22): volume de
  solicitações, tempo médio de atendimento, grau de satisfação — por serviço, com padronização que
  permita comparação entre entes (parágrafo único do art. 22).
- Para o módulo de estatísticas de sinistro, prever obrigatoriamente uma camada de agregação/
  anonimização antes de qualquer exposição pública, com trilha de decisão documentada (LGPD art.
  13 exige ambiente controlado e veda revelação de dado pessoal mesmo em resultado agregado).
- Tratar o "relógio" da linha 5 (prazo estatístico anual) como **estado "sem prazo definido"**
  explícito na UI, não como ausência silenciosa de dado — é uma lacuna normativa real, e o produto
  deve comunicá-la como tal a quem consome o painel.
