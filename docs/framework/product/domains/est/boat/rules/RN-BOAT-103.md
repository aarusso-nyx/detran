---
id: RN-BOAT-103
title: O BAT é o documento-fonte normativo do registro de sinistro — quatro categorias de dados e dever de atestar consistência
status: draft
apps: [boat]
sources: [REF-CONTRAN-808-2020]
updated: 2026-08-24
---

**Regra.** O registro de dados de sinistro tem **forma normativa própria**: o **BAT — Boletim de
Ocorrência de Acidente de Trânsito**. A norma fixa (a) que o registro se dá _por meio do BAT_,
(b) as **quatro categorias** de dados que o compõem — pessoa/vítima/condutor; veículo; via; o
sinistro propriamente dito —, (c) que os campos mínimos serão definidos pelo órgão máximo executivo
da União em **normativo específico**, e (d) que o órgão que registra **atesta a consistência dos
dados coletados**. O `CrashRecord` do BOAT é, juridicamente, a implementação do BAT no DETRAN-AM;
não é artefato de produto livre.

**Base legal.** [REF-CONTRAN-808-2020] art. 4º:

> "Art. 4º Os dados sobre acidentes de trânsito serão registrados por meio de Boletim de Ocorrência
> de Acidente de Trânsito (BAT) e relacionados: I - à pessoa, vítima e/ou condutor; II - ao veículo;
> III - à via; e IV - ao acidente propriamente dito.
>
> § 1º O órgão máximo executivo de trânsito da União estabelecerá, em normativo específico, os
> campos mínimos com os dados que deverão compor o BAT.
>
> § 2º Os órgãos que realizam o registro do BAT em todo o território nacional observarão os
> requisitos estabelecidos nesta Resolução.
>
> § 3º Os órgãos que realizam o registro do BAT **atestarão a consistência dos dados coletados**.
>
> § 4º Os dados e as informações do RENAEST serão complementados por dados e informações dos
> sistemas de Registro Nacional de Veículos Automotores (RENAVAM), Registro Nacional de Carteira de
> Habilitação (RENACH) e Registro Nacional de Infrações de Trânsito (RENAINF)."

Complementa: [REF-CONTRAN-808-2020] art. 3º, parágrafo único — a metodologia padronizada _"constará
no Manual do Sistema RENAEST e no Manual de Gestão de Estatísticas de Acidente de Trânsito, a serem
instituídos"_; art. 5º, § 4º — _"O envio de dados e informações [...] deverá seguir as regras do
Manual do Sistema RENAEST e as orientações do Manual de Gestão [...]"_.

**Verificação.** Mapeamento das quatro categorias ao modelo de [APP-BOAT]: I → `CrashPerson` +
`CrashVictim`; II → `CrashVehicle`; III → dados de via em `CrashRecord`; IV → dinâmica/tipo/condições
em `CrashRecord`. A estrutura está **confirmada**; o conteúdo campo-a-campo, não ([RN-BOAT-107]).
O § 3º é a **âncora normativa da regra de completude local** hoje sem fonte em [RN-BOAT-004]: o
dever de "atestar a consistência" é do órgão que registra, o que dá fundamento a um gate de
encerramento local — e implica que a atestação deve ser um **ato identificado** (quem atestou,
quando), não um efeito colateral silencioso da transição de estado.

**Controvérsia/risco.** O "normativo específico" do § 1º — que seria, para o BAT, o equivalente ao
que a Portaria SENATRAN 997/2022 é para o AIT do talão eletrônico — **não foi localizado**, assim
como os dois Manuais do art. 3º e o "manual técnico" do art. 21 da
[REF-SENATRAN-PORTARIA-139-2025]. São **três normas de anos diferentes (2020, 2022, 2025) apontando
para documentação que não é pública**. Consequência prática: o DETRAN-AM está normativamente
obrigado a registrar "em conformidade com os Manuais" que não pode ler publicamente. Enquanto isso,
qualquer mapeamento campo-a-campo do BOAT para o payload nacional é **inferência sobre contrato de
mock**, não conformidade verificada. A via de solução não é pesquisa pública: é **solicitação
institucional DETRAN-AM↔SENATRAN**. Item 11 de `_intake/legal-assessment.md`; handoff BPO nº 3 do
`_intake/research-dossier.md`.
