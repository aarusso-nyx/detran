---
id: RESEARCH-DOSSIER-RAIT
title: Dossiê de pesquisa — corpus legal do RAIT (rodada 2026-08-24)
status: draft
apps: [rait, portal]
sources:
  [
    REF-CTB-extracts-raw,
    REF-CONTRAN-900,
    REF-CONTRAN-918,
    REF-CONTRAN-931,
    REF-CONTRAN-357,
    REF-LEI-9873-1999,
    REF-LEI-9784-1999,
    REF-DETRANAM-SERVICOS,
    REF-DETRANAM-PORTARIA-5046,
    REF-BENCH-ESTADOS,
    REF-CETRAN-PROCESSO-INTERNO,
  ]
updated: 2026-08-24
---

# Dossiê de pesquisa — RAIT (Recursos Administrativos de Infrações de Trânsito)

Produzido pelo especialista CRAWLER/RESEARCHER. Consolida os seis alvos da missão. Cada
seção segue: (a) o que foi encontrado + caminhos locais; (b) passagens-chave verbatim; (c)
confiança/vigência; (d) gaps explícitos. Fecha com o mapa de handoff para LEGAL, BPO e UX.

Todos os arquivos citados estão sob `repo://detran-refs@aa276b8e71866bfa9e012b23ee4a14b6fc6720a3/refs/`.
O catálogo central atualizado está em `refs/INDEX.md`.

---

## 1. CTB (Lei 9.503/1997) — texto atual + artigos do processo administrativo

**(a) Encontrado:**

- Texto **compilado e consolidado** (todas as alterações até a data de captura) baixado do
  site oficial da Presidência: `refs/ctb/REF-CTB-L9503-planalto.html` (787KB, HTML original,
  curl funcionou sem bloqueio — ao contrário do que se antecipava). Também salvo em texto
  plano parseado, `refs/ctb/planalto_plain.txt` (310KB, toda a lei, 7960 linhas), reutilizável
  para excertos futuros de qualquer artigo sem novo download.
- Câmara dos Deputados (`camara.leg.br` — norma atualizada) retornou **504 Gateway Timeout**
  em toda tentativa; não foi usado. O planalto.gov.br supriu integralmente a necessidade.
- Excertos verbatim de TODOS os artigos pedidos + 2 extras contíguos e relevantes (289-A,
  290-A): `refs/ctb/REF-CTB-extracts-raw.md`. Cobre arts. 257, 280, 281, 281-A, 282, 282-A,
  283 (VETADO), 284, 285, 286, 287, 288, 289, 289-A, 290, 290-A — cada um com o texto integral
  de caput + parágrafos + incisos + notas de "(Redação dada por…)"/"(Incluído por…)" que
  comprovam a vigência de cada dispositivo.

**(b) Passagens-chave (achado mais importante desta captura):**

> Art. 289-A. O não julgamento dos recursos nos prazos previstos no § 6º do art. 285 e no
> _caput_ do art. 289 deste Código ensejará a **prescrição da pretensão punitiva**. _(Incluído
> pela Lei nº 14.229, de 2021)_

Isso significa: se a JARI (24 meses, art. 285 §6º) ou o CETRAN (24 meses, art. 289 _caput_)
não julgarem dentro do prazo, **o processo prescreve por culpa do próprio órgão julgador** —
não é um mero atraso, é extinção da punibilidade. Nenhum REF capturado nas rodadas anteriores
(900/918) cobria este dispositivo.

Segunda passagem crítica — art. 282 §7º: **decadência** (não prescrição) do direito de aplicar
a penalidade se a NP não sai em 180 (ou 360 com defesa prévia) dias do cometimento.

**(c) Confiança:** ALTA — fonte primária oficial (Presidência), texto consolidado com histórico
de emendas explícito em cada dispositivo.

**(d) Gaps:**

- Art. 257 §5º ficou truncado na captura de tela do relatório (texto completo disponível em
  `planalto_plain.txt` linha ~5360 em diante, não copiado ao REF por já estar fora do núcleo
  pedido).
- Não foi feita a varredura de TODA a lei além dos artigos pedidos — se algum outro artigo for
  necessário no futuro, `planalto_plain.txt` já está local e pesquisável via grep, sem novo
  download.

---

## 2. Resolução CONTRAN das JARI (organização/funcionamento)

**(a) Encontrado:** confirmado que a **Res. 357/2010** segue sendo a resolução vigente —
busca extensiva não encontrou nenhuma resolução do "pacote 2022" (900, 918, 931 e outras)
que trate de composição/organização/mandato das JARI; todas as três tratam de procedimento,
não de estrutura do órgão colegiado. Evidência indireta de vigência: CETRAN-SP referenciava a
357/2010 como base normativa ainda em 2023 (fonte secundária, não é prova definitiva).
PDF oficial baixado: `refs/contran/REF-CONTRAN-357-2010.pdf` (4 páginas, íntegro, resolução +
anexo de diretrizes). Excertos: `refs/contran/REF-CONTRAN-357.md`.

**(b) Passagens-chave:**

> 4.1. A JARI, órgão colegiado, terá, no mínimo, três integrantes... 4.1.c. é vedado ao
> integrante das JARI compor o Conselho Estadual de Trânsito – CETRAN...
> 7.1. O mandato será, no mínimo, de um ano e, no máximo, de dois anos.
> 8.2. A JARI poderá abrir a sessão e deliberar com a maioria simples de seus integrantes,
> respeitada, obrigatoriamente, a presença do presidente ou seu suplente.

**(c) Confiança:** MODERADA quanto à vigência (não há revogação expressa localizada, mas
também não há confirmação positiva definitiva de que segue em vigor sem alterações — a
"revogação" que o texto da própria resolução menciona é da Res. 233/2007, não de si mesma).
**Recomenda-se ao LEGAL confirmar via consulta direta ao CONTRAN/SIC antes de tratar como
fonte definitiva para composição formal.**

**(d) Gaps:** o Regimento Interno LOCAL da JARI-AM (que deveria ser elaborado seguindo estas
diretrizes e registrado no CETRAN-AM, conforme item 9.1.b da própria resolução) não foi
localizado publicamente — ver seção 4.

---

## 3. Resolução do SNE (Sistema de Notificação Eletrônica)

**(a) Encontrado:** identificada com certeza — **Res. CONTRAN nº 931/2022**, que revoga
expressamente as Res. 622/2016 e 636/2016 (as resoluções históricas mencionadas na missão).
PDF oficial baixado E íntegro texto extraído do Diário Oficial da União/Imprensa Nacional
(15 artigos completos, nenhum corte): `refs/contran/REF-CONTRAN-931-2022.pdf` +
`refs/contran/REF-CONTRAN-931-2022.txt`. Excertos anotados: `refs/contran/REF-CONTRAN-931.md`.

**(b) Passagens-chave:**

> Parágrafo único (art. 2º). **O SNE é o único meio tecnológico hábil**, de que trata o
> _caput_ do art. 282 do CTB, admitido para assegurar a ciência das notificações...
> § 6º (art. 4º). O proprietário/condutor autuado será considerado **notificado 30 dias após
> a inclusão da informação no sistema e do envio da respectiva mensagem**.
> Art. 9º §1º. Documentos de arrecadação com **I - desconto de 40%** (adesão SNE + não
> defesa/recurso); **II - desconto de 20%** (padrão, facultada defesa/recurso); **III -
> acrescido de juros** (pós-encerramento).
> Art. 14. Ficam revogadas as Resoluções CONTRAN nº 622/2016 e nº 636/2016.

**(c) Confiança:** ALTA — texto oficial completo do DOU, sem cortes, todos os 15 artigos.

**(d) Gaps:** nenhum quanto ao texto em si. Gap de coerência normativa identificado: a Lei
14.599/2023 (que alterou o CTB art. 284) parece ter tornado o desconto de 60% aplicável **mesmo
sem** adesão ao SNE pelo órgão, o que pode não estar refletido em nenhuma resolução CONTRAN
pós-2023 — sinalizado ao LEGAL.

---

## 4. DETRAN-AM local

**(a) Encontrado:**

- **Portaria nº 5046/2018/DP/DETRAN/AM**: PDF original obtido (`refs/detran-am/REF-DETRANAM-PORTARIA-5046-2018.pdf`, 4 páginas). É um documento **escaneado sem camada de texto**
  ("Scanned by CamScanner") — texto extraído via **OCR local** (tesseract, modelo inglês, pt-BR
  não disponível no ambiente; pequenos erros de diacríticos possíveis). Excertos anotados:
  `refs/detran-am/REF-DETRANAM-PORTARIA-5046.md`.
- **Regimento interno / composição da(s) JARI-AM e do CETRAN-AM**: **NÃO localizado
  publicamente**. As duas URLs históricas encontradas via busca
  (`.../2014/08/Regimento-Interno-Cetran.pdf` e `.../2017/07/Regimento-interno-DETRAN.pdf`)
  retornam HTTP 404 no site atual do DETRAN-AM, e não há snapshot arquivado no Wayback Machine
  para a primeira (a checagem via `archive.org/wayback/available` voltou vazia). Pista não
  confirmada, não verificada: **Decreto Estadual nº 34.398, de 15/01/2014**, que aparentemente
  instituiu o CETRAN-AM e aprovou seu regimento — texto integral não obtido.
- Diário oficial do AM (`legisla.imprensaoficial.am.gov.br`) foi consultado pontualmente mas
  não indexou nada específico sobre CETRAN-AM nas buscas realizadas.

**(b) Passagem-chave (Portaria 5046/2018, art. 2º §2º — a mais relevante para o RAIT):**

> Os processos de regularização de veículos e processos administrativos EM GERAL, salvo os de
> caráter personalíssimo, poderão ser formalizados e tramitados perante o Detran/AM mediante
> instrumento de mandato de procuração pública OU PARTICULAR, exigível neste caso o
> **reconhecimento, por autenticidade**, da firma do outorgante.

Achado de UX relevante: "reconhecimento por autenticidade" pode ser feito **no próprio balcão
do DETRAN-AM** (servidor confronta assinatura com documento original), não exige cartório —
isso contradiz a impressão de "endosso cartorial obrigatório" que a página de serviço "Recurso
à JARI" passa para documentos de fora do estado (já sinalizado como atrito em
`refs/detran-am/REF-DETRANAM-SERVICOS.md`).

**(c) Confiança:** Portaria 5046/2018 — ALTA quanto ao conteúdo (original, mesmo que via OCR);
MODERADA quanto a ser exatamente "a" portaria de representação para recursos especificamente
(é uma portaria geral de simplificação administrativa que se aplica a processos em geral, não
uma portaria dedicada a recursos de infração — mas é a mesma referenciada pelas páginas
oficiais de serviço, então é a fonte correta). Regimento JARI/CETRAN-AM — gap confirmado, sem
fonte.

**(d) Gaps:** regimento local (ver acima); calendário de sessões da JARI-AM/CETRAN-AM;
confirmação formal do nome do signatário da Portaria (OCR ambíguo, "Vinícius Dis[?]z Santos").

---

## 5. Leis de apoio

**(a) Encontrado:** ambas baixadas com sucesso via curl direto do **planalto.gov.br** (ao
contrário da expectativa de bloqueio nas instruções da missão — não houve bloqueio para estas
duas leis específicas). `refs/leis/REF-LEI-9873-1999.html` + `.md`;
`refs/leis/REF-LEI-9784-1999.html` + `.md`.

**(b) Passagens-chave:**

- Lei 9.873/1999, art. 1º §1º: **prescrição por paralisação do processo por mais de 3 anos**
  aguardando julgamento/despacho — independente do prazo total de 5 anos. Este é um TERCEIRO
  relógio de extinção de punibilidade (além da decadência do CTB art. 282 §7º e da prescrição
  por inércia recursal do CTB art. 289-A), não capturado em nenhum REF anterior.
- Lei 9.784/1999, art. 69: **confirma que ela é subsidiária** ao CTB (que é "lei própria") —
  só socorre lacunas, não substitui os prazos específicos do CTB/CONTRAN.
- Lei 9.784/1999, art. 66: regra de contagem de prazo (exclui início, inclui vencimento,
  prorroga para dia útil seguinte) — idêntica em essência à regra de [REF-CONTRAN-918] art. 29.

**(c) Confiança:** ALTA — fontes primárias oficiais, download direto sem obstáculos.

**(d) Gaps:** nenhum relevante identificado.

---

## 6. Modelos de outros estados (processo INTERNO das JARI/CETRAN)

**(a) Encontrado:** 4 fontes, 2 baixadas como PDF original, 2 capturadas por extração (sites
bloquearam download direto). Consolidado em
`refs/other-states/REF-CETRAN-PROCESSO-INTERNO.md`:

- **CETRAN-RS** Res. 88/2014 (alt. 110/2016): `cetran.rs.gov.br` recusou conexão via curl E
  via WebFetch direto ao PDF (timeout/connection refused em ambos, testado 2x) — texto vem de
  agregador (legisweb.com.br), **NÃO é fonte primária capturada**, sinalizado explicitamente
  no REF.
- **CETRAN-ES** Regimento Interno: capturado via WebFetch da página HTML oficial (não há PDF
  linkado na página) — conteúdo mais rico de todos: sorteio de relator, prazo interno de 20
  dias, mecanismo de accountability (advertência → afastamento por reincidência), quorum
  mínimo de 8 conselheiros, sustentação oral **vedada**.
- **CETRAN-PR** Res. 090/2024: PDF original baixado (`REF-CETRANPR-090-2024.pdf`, 5 páginas) —
  não é sobre processo interno, é sobre indicação de condutor infrator (relevante para o
  PORTAL, mantido por associação temática).
- **CETRAN-SP** Deliberação 02/2025 "CETRAN-SP Digital": PDF original baixado
  (`REF-CETRANSP-deliberacao-02-2025.pdf`, 10 páginas) — institui tramitação 100% digital via
  sistema próprio (SIM), com a obrigação de digitalizar recaindo sobre o ÓRGÃO, não sobre o
  cidadão, mesmo quando o recurso chega em papel.

**(b) Passagens-chave:**

> (ES) Art. 25: "A distribuição será registrada, obedecido ao critério de **sorteio** entre os
> Conselheiros."
> (ES) Art. 29 §4º: "Não será admitida a **sustentação oral**, por parte do recorrente, nas
> sessões de julgamento."
> (SP) Art. 3º: órgãos "deverão cadastrar e encaminhar os recursos... **independentemente da
> forma de recebimento do recurso**" — digitalização é dever do órgão, não do cidadão.

**(c) Confiança:** PR e SP — ALTA (originais baixados). ES — MODERADA-ALTA (extração fiel de
página oficial, mas não é PDF baixado). RS — BAIXA quanto à primariedade (fonte secundária).

**(d) Gaps:** MG não foi capturado com detalhe de processo interno (só o benchmark de canal
digital já existente em `REF-BENCH-ESTADOS`); recomenda-se ao LEGAL tentar novamente o PDF do
RS de rede diferente, ou via SIC-RS.

---

# Mapa de handoff

## Para o especialista LEGAL (normas, prazos, competências)

1. **CTB art. 289-A** (prescrição por inércia do órgão julgador em 24 meses) e **Lei 9.873/1999
   art. 1º §1º** (prescrição por paralisação >3 anos) — dois mecanismos de extinção de
   punibilidade por omissão do próprio órgão, além da decadência do art. 282 §7º. O RAIT
   precisa de alertas internos MUITO antes desses tetos.
2. Confirmar vigência definitiva da **Res. CONTRAN 357/2010** (JARI) — não há revogação
   expressa localizada, mas confiança é moderada, não alta.
3. Investigar se há resolução CONTRAN pós-2023 ajustando **[REF-CONTRAN-918] arts. 20-21**
   face à Lei 14.599/2023 (CTB art. 284 §§1º/6º) sobre desconto de 60% sem exigir adesão prévia
   do ÓRGÃO ao SNE.
4. Identificar a regulamentação CONTRAN de "força maior" (CTB art. 290-A) para suspensão de
   prazos processuais.
5. Investigar o **Decreto Estadual nº 34.398/2014** (AM) como possível base do CETRAN-AM —
   não confirmado, texto não obtido.

## Para o especialista BPO (processo interno, distribuição, pauta)

1. **[REF-CONTRAN-357]**: composição mínima (3 membros), mandato (1-2 anos), quorum (maioria
   simples + presidente/suplente obrigatório), impedimentos, vedação de acumular JARI+CETRAN.
2. **[REF-CETRAN-PROCESSO-INTERNO]** — combo de referência recomendado: modelo ES
   (sorteio de relator + prazo interno de 20 dias + accountability por atraso + quorum mínimo
   de 8) + modelo SP (obrigação de digitalização recai sobre o órgão, não sobre o cidadão).
3. Regimento local da JARI-AM/CETRAN-AM não existe publicamente — o BPO terá que desenhar a
   partir das diretrizes nacionais (357/2010) na ausência de um modelo local a seguir, ou o
   time deve buscar o regimento diretamente com o DETRAN-AM por canal não-público.
4. SLA local anunciado pelo DETRAN-AM ("30 dias úteis" para JARI) é uma meta operacional, não
   um teto legal — o teto legal real é 24 meses (CTB art. 285 §6º); ambos podem coexistir no
   desenho (meta interna generosamente abaixo do teto legal).

## Para o especialista UX (canais, formulários, linguagem das cartas de serviço)

1. **[REF-DETRANAM-PORTARIA-5046]** art. 2º §2º: procuração particular com firma reconhecida
   **por autenticidade no próprio balcão do DETRAN-AM** já é suficiente para representação em
   recursos — a carta de serviço atual pode estar exigindo cartório além do necessário; revisar
   linguagem para reduzir atrito de documentos de fora do estado.
2. **[REF-CONTRAN-931]** art. 7º: adesão dos cidadãos ao SNE pode ser feita junto ao
   DETRAN-AM ou "outros mecanismos disponibilizados" — base legal para oferecer adesão
   diretamente pelo canal digital do PORTAL, sem depender de balcão físico.
3. **[REF-CETRAN-PROCESSO-INTERNO]** (PR): identificação de condutor via app/Carteira Digital
   de Trânsito já é reconhecida como equivalente legal ao protocolo em papel — modelo de
   referência para a UX do fluxo de indicação de condutor no PORTAL.
4. Linguagem de prazos: sempre distinguir "prazo para você agir" (30 dias, curto) de "prazo
   para o órgão decidir" (até 24 meses, teto legal) — evitar confundir o cidadão com o número
   de 24 meses como se fosse o tempo esperado normal (o SLA operacional real do DETRAN-AM é
   30 dias úteis).

---

# Os 5 achados mais consequentes desta rodada

1. **CTB art. 289-A** — prescrição da pretensão punitiva se JARI/CETRAN não julgarem em 24
   meses. Não estava em nenhum REF anterior; é o achado de maior risco jurídico/reputacional
   para o RAIT (processo pode prescrever por inércia do próprio sistema).
2. **Res. CONTRAN 931/2022** identificada e capturada na íntegra como a resolução vigente do
   SNE (resolve o backlog aberto desde a rodada anterior), com o detalhe operacional de que o
   SNE é o **único** meio tecnológico hábil para notificação eletrônica de infrações.
3. **Lei 9.873/1999 art. 1º §1º** — prescrição por paralisação do processo por mais de 3 anos,
   um segundo mecanismo de extinção por inércia, independente do art. 289-A do CTB.
4. **Portaria 5046/2018** (DETRAN-AM) mostra que representação por procuração particular com
   firma reconhecida no próprio balcão (sem cartório) já é legalmente suficiente — oportunidade
   de simplificação de UX que contradiz a prática hoje anunciada nas cartas de serviço.
5. **Regimento interno da JARI-AM/CETRAN-AM continua sem fonte pública** após duas rodadas de
   pesquisa — é o gap mais crítico remanescente do corpus local; o BPO terá que desenhar o
   processo interno a partir das diretrizes nacionais (357/2010) e dos benchmarks de outros
   estados, na ausência de um modelo local.
