---
id: RN-BOAT-002
title: Submissão à RENAEST exige dados de vítima quando a gravidade indica vítima
status: draft
apps: [boat]
sources:
  [
    'senatran:domain/renaest/api/src/renaest.service.ts',
    'senatran:docs/framework/contracts/openapi-transactional.yaml',
    'senatran:database/ddl/23-renaest.sql',
    REF-CONTRAN-808-2020,
  ]
updated: 2026-09-13
---

**Regra.** Na submissão de um sinistro à base nacional RENAEST, quando `gravidade` for
`COM_VITIMA_FERIDA` ou `COM_VITIMA_FATAL`, o array `vitimas` **não pode estar vazio** — a base
nacional rejeita a submissão como incompleta. Quando `gravidade = SEM_VITIMA`, não há exigência de
dados de vítima. Este é o único gate de negócio efetivamente encontrado nas fontes lidas que
condiciona dados de vítima à gravidade — **atua na fronteira de integração com a RENAEST**, não
como restrição de exibição/coleta nas telas de campo do TEAT/BOAT (nestas, o passo de vítimas é
sempre exibido, independentemente da gravidade selecionada).

**Base legal.** Não há norma que enuncie este gate. Há, porém, **fundamento normativo indireto e
convergente**, localizado na revisão de 2026-08-24:

- [REF-CONTRAN-808-2020] art. 4º, I: os dados do BAT são relacionados _"à pessoa, vítima e/ou
  condutor"_ — a vítima é categoria normativa do boletim.
- [REF-CONTRAN-808-2020] art. 4º, § 3º: _"Os órgãos que realizam o registro do BAT atestarão a
  consistência dos dados coletados."_ — um sinistro declarado com vítima e sem qualquer vítima
  registrada é, por definição, inconsistente; a rejeição nacional é a materialização desse dever.
- [REF-CONTRAN-808-2020] art. 5º: os dados _"serão homologados e, então, consolidados"_, com
  validação em três níveis (§ 1º) — ver [RN-BOAT-104]. A rejeição por incompletude é ato da
  homologação federal.

A **formulação concreta** do gate (quais valores de gravidade, qual código de erro, qual HTTP)
continua sendo **contrato técnico de integração**, citado como (fonte: senatran-mock contracts), não
norma.

**Verificação.** `RenaestService.assertCompleto` (regra E003) lança
`RENAEST.CRASH.INCOMPLETE_DATA` (HTTP 402) quando `gravidade ∈ {COM_VITIMA_FERIDA,
COM_VITIMA_FATAL}` e `vitimas` está vazio — "Dados de vítima obrigatórios para sinistro com
vítima." Enum de gravidade (`GravidadeSinistro`): `SEM_VITIMA | COM_VITIMA_FERIDA |
COM_VITIMA_FATAL` (`senatran:docs/framework/contracts/openapi-transactional.yaml`). BOAT/TEAT deve
garantir, antes de transmitir ([WF-BOAT-001] transição registro local → RENAEST), que sinistros
classificados com vítima ferida/fatal tenham ao menos um `CrashVictim` capturado — sob pena de
rejeição na integração.

**Nota de revisão — LEGAL, 2026-08-24. CONFIRMADA, com upgrade parcial de fonte e uma delimitação.**

1. **"(fonte pendente)" requalificado**: não é lacuna de pesquisa, é **regra sem norma própria com
   fundamento indireto**. O dever de atestar consistência (art. 4º, § 3º) e a homologação federal
   (art. 5º) sustentam a existência de _um_ gate de completude; não sustentam _este_ gate em seus
   termos exatos. A instrução "trate como requisito técnico de integração até confirmação normativa"
   **permanece válida** — o normativo específico de campos mínimos do BAT continua não localizado
   ([RN-BOAT-103]).
2. **Delimitação acrescentada**: a rejeição por incompletude é **nacional** e ocorre na homologação;
   o dever local de consistência é do DETRAN-AM e ocorre antes ([RN-BOAT-004], que ganhou nesta
   mesma revisão a âncora do art. 4º, § 3º). São dois momentos, dois responsáveis e dois
   fundamentos — não devem ser modelados como uma única validação.
3. **Advertência sobre estado terminal**: o mock trata `REJEITADO` como terminal sem correção
   (`RENAEST.CRASH.CORRECTION_NOT_ALLOWED`). A Res. 808/2020 **não prevê nem veda** retificação
   pós-rejeição — tratar a rejeição como definitiva é adotar como norma o que é decisão de contrato
   técnico ([RN-BOAT-104] §Controvérsia).
4. Registrada a distinção de níveis entre `severity` (vítima) e `gravidade` (sinistro), e a ausência
   de fonte normativa para a regra de derivação entre elas ([RN-BOAT-001], [RN-BOAT-111]).

**Decisão do Owner (2026-09-13, steering.md H.43) — regra de derivação.** A gravidade do
sinistro é **a pior gravidade entre as vítimas registradas** (fatal supera ferida); sem vítima
registrada, `SEM_VITIMA`; a gravidade informada na abertura é provisória e é sobrescrita no
fechamento; gravidade com vítima sem nenhuma vítima registrada **bloqueia o fechamento**. Proposta
da equipe técnica aprovada conforme DT-018.
