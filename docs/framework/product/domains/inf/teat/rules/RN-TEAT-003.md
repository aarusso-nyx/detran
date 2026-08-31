---
id: RN-TEAT-003
title: Lavratura só ocorre em dispositivo e aplicativo homologados, com postura verificada
status: draft
apps: [teat]
sources:
  [
    'teat:docs/framework/product/blueprints/BP-MOBILE-OPERATIONS-001.json',
    'teat:docs/framework/product/workflows/phase-e-mobile.md',
    'teat:law/invariants/INV-OFFLINE-001.json',
    REF-SENATRAN-997,
    REF-CONTRAN-918,
  ]
updated: 2026-08-24
---

> **Nota de revisão (2026-08-24, especialista LEGAL).** Regra **confirmada** e com o
> "(fonte pendente)" **fechado** — mas com uma correção conceitual relevante: existem **dois níveis
> distintos de homologação**, e esta regra modelava apenas o segundo. A homologação **do software
> pela SENATRAN** (laudo técnico independente, renovação quadrienal, nova homologação a cada
> alteração de funcionalidade) passou a ter regra própria em [RN-TEAT-117]; esta regra permanece
> como o **controle interno do órgão** sobre qual dispositivo e qual versão estão autorizados a
> operar. As duas são cumulativas: nenhuma substitui a outra.

**Regra.** Um ato legal (AIT, medida administrativa, procedimento de etilômetro, sinistro) só
pode ser criado a partir de um dispositivo operacional autorizado (`OperationalDevice.status =
'authorized'`, sem `tamper_flag`) executando uma versão de aplicativo vinculada a uma homologação
vigente (`ApplicationVersion.homologation_id` → `Homologation` com `status` ativo e dentro de
`valid_until`). A jornada oficial do runtime móvel verifica a postura do dispositivo **antes** de
permitir a criação de qualquer ato legal, como segunda etapa do fluxo (após o bootstrap de sessão
STYNX, antes da instalação do pacote normativo).

**Base legal.**

- [REF-CONTRAN-918] art. 3º §6º: _"O talão eletrônico previsto no inciso II do § 1º constitui-se de
  sistema informatizado (software) instalado em equipamentos preparados para esse fim ou no próprio
  sistema de registro de infrações do órgão autuador, **na forma disciplinada pelo órgão máximo
  executivo de trânsito da União**."_ — a remissão, antes "fonte pendente", é a Portaria SENATRAN
  997/2022.
- [REF-SENATRAN-997] Anexo II, i): _"O software deverá identificar o equipamento e **impedir sua
  instalação ou uso não autorizado**"_ — base normativa direta da postura de dispositivo e do
  `OperationalDevice.status`/`tamper_flag` verificados antes de qualquer criação de ato legal.
- [REF-SENATRAN-997] Anexo II, j): a trilha de auditoria exige o **número do aparelho utilizado**
  em cada operação — o dispositivo é dado do ato, não apenas do cadastro.
- [REF-SENATRAN-997] art. 5º: homologação do **software** pela SENATRAN, com laudo técnico de
  emissor independente e **renovação quadrienal** (§4º) — **nível distinto** desta regra, tratado
  em [RN-TEAT-117].

**Verificação.** `Homologation` (`ops_homologation`, DD-ENT-018): `homologation_number`, `scope`,
`issued_at`, `valid_until`, `document_uri`, `status`. `ApplicationVersion.status` (default
`'allowed'`) e `homologation_id` (nullable) — versão de app sem homologação vinculada não deveria
autorizar lavratura (fonte pendente: exceção/tolerância operacional não documentada). Verificação
de postura do dispositivo é passo 2 da jornada offline oficial
("teat:docs/framework/product/workflows/phase-e-mobile.md"); base para o atributo "identidade do
dispositivo" exigido por [INV-OFFLINE-001] em todo ato offline.

**Ajuste de modelagem decorrente da revisão.** `Homologation.scope` deve distinguir
`SENATRAN_SOFTWARE` de `ORGAO_DISPOSITIVO_VERSAO`; no primeiro escopo, `valid_until` corresponde
à **validade quadrienal do laudo técnico** ([REF-SENATRAN-997] art. 5º §4º), e não a um prazo
definido pelo órgão. Uma `ApplicationVersion` só deveria autorizar lavratura quando **ambas** as
homologações estiverem vigentes. A "exceção/tolerância operacional para versão sem homologação
vinculada", registrada como gap, **permanece aberta e agora é mais grave**: à luz do art. 5º da
Portaria, operar talão eletrônico com software não homologado não é tolerância operacional — é
inconformidade normativa. Ver [RN-TEAT-117] e [RN-TEAT-143] (parque de dispositivos de corporação
conveniada está sujeito ao mesmo controle).
