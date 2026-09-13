---
id: RN-BOAT-001
title: Toda vítima registrada exige classificação de gravidade
status: draft
apps: [boat]
sources:
  [
    'teat:docs/framework/product/blueprints/BP-CRASH-RECORDS-001.json',
    'teat:docs/meta/prototypes/docs/RN-1_Regras_de_Negocio_Talonario_Eletronico.md',
    REF-CTB-sinistro-cena-renaest,
    REF-CONTRAN-808-2020,
  ]
updated: 2026-09-13
---

**Regra.** Todo registro de vítima (`CrashVictim`) exige o preenchimento do campo `severity`
(gravidade) — campo não-nulo no modelo de dados. Não há vítima sem classificação de gravidade
registrada.

**Base legal.** Não há dispositivo legal que exija, diretamente, a classificação de gravidade de
cada vítima. O que a revisão LEGAL de 2026-08-24 estabeleceu é a **cadeia indireta** que sustenta a
regra:

- **Competência para definir o padrão**: [REF-CTB-sinistro-cena-renaest] art. 19, XI — cabe ao órgão
  máximo executivo da União _"estabelecer modelo padrão de coleta de informações sobre as
  ocorrências de sinistros de trânsito e as estatísticas de trânsito"_; [REF-CONTRAN-808-2020] art.
  8º, II — _"estabelecer os dados mínimos que deverão compor o BAT"_. A classificação é **padrão
  técnico-administrativo editado sob competência legal**, não categoria com assento em lei —
  ver [RN-BOAT-111].
- **Obrigatoriedade da categoria de dado**: [REF-CONTRAN-808-2020] art. 4º, I — os dados do BAT são
  relacionados _"à pessoa, vítima e/ou condutor"_, o que torna o dado de vítima **categoria
  normativa obrigatória** do boletim, ainda que os campos mínimos dependam do "normativo específico"
  não localizado ([RN-BOAT-103]).
- **Dever de consistência**: [REF-CONTRAN-808-2020] art. 4º, § 3º — _"Os órgãos que realizam o
  registro do BAT atestarão a consistência dos dados coletados."_

**Verificação.** `CrashVictim.severity` (`varchar(60)`, obrigatório) —
`teat:docs/framework/product/blueprints/BP-CRASH-RECORDS-001.json`. Corpus de protótipo (evidência,
não autoridade): RN-SIN-004 "Vítima deve possuir classificação de gravidade" (ilesa, ferida,
óbito, conforme catálogo). Ver gate de dados obrigatórios na submissão nacional em [RN-BOAT-002].
Como a classificação é padrão infralegal, o conjunto de valores admitidos deve ser **catálogo
versionado com vigência**, não `enum` de código ([RN-BOAT-111]).

**Nota de revisão — LEGAL, 2026-08-24. CONFIRMADA, com duas precisões acrescentadas.**

1. **"(fonte pendente)" substituído**: a regra não tem base legal direta e **não passará a ter** —
   a pesquisa exaustiva do CTB (Anexo I, arts. 19, 22, 24, 326-A) confirmou o achado negativo. O que
   mudou é que agora existe a cadeia de competência acima, e o **status normativo está qualificado**:
   padrão técnico-administrativo, não norma legal ([RN-BOAT-111]).
2. **Precisão material acrescentada — duas classificações distintas, antes indiferenciadas.**
   `CrashVictim.severity` classifica a **vítima**; `gravidade` do payload nacional classifica o
   **sinistro** ([RN-BOAT-002]). São níveis diferentes, e a regra de derivação entre eles ("sinistro
   é fatal se alguma vítima é óbito") **não tem fonte normativa** — é inferência de produto e deve
   ser tratada como parâmetro explícito. A redação anterior tratava as duas como a mesma coisa.
3. Registrado que o CTB **não define "vítima"** — a distinção `CrashPerson` × `CrashVictim` é
   construção do produto ([RN-BOAT-109] §Controvérsia), assim como o marco temporal do óbito
   posterior que reclassifica o registro ([RN-BOAT-111]).
4. Acrescentado que `severity` é, ele próprio, **dado pessoal sensível de saúde**
   ([RN-BOAT-122]) — hoje não classificado como tal no blueprint, ao contrário de
   `hospital_destination` e `health_notes`.

**Decisão do Owner (2026-09-13, steering.md H.43) — regra de derivação.** A gravidade do
sinistro é **a pior gravidade entre as vítimas registradas** (fatal supera ferida); sem vítima
registrada, `SEM_VITIMA`; a gravidade informada na abertura é provisória e é sobrescrita no
fechamento; gravidade com vítima sem nenhuma vítima registrada **bloqueia o fechamento**. Proposta
da equipe técnica aprovada conforme DT-018.
