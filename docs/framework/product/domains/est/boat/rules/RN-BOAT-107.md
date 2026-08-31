---
id: RN-BOAT-107
title: O RENAEST é complementado por RENAVAM, RENACH e RENAINF — o BOAT não deve recoletar em campo o que a base nacional cruza
status: draft
apps: [boat, teat]
sources:
  [REF-CONTRAN-808-2020, REF-SENATRAN-PORTARIA-139-2025, REF-LEI-13709-2018]
updated: 2026-08-24
---

**Regra.** Por determinação normativa, os dados do RENAEST **são complementados** pelos sistemas
RENAVAM (veículo), RENACH (habilitação) e RENAINF (infrações). O dado de veículo e de condutor
associado a um sinistro, portanto, **não precisa ser transcrito integralmente em campo** para
existir na base nacional: o cruzamento é feito a montante, por chave. Consequência normativa direta:
capturar em campo, e reter localmente, atributos que a base nacional obtém por cruzamento é
**tratamento excessivo** à luz do princípio da necessidade (LGPD art. 6º, III) e do princípio de
minimização reforçada da Portaria SENATRAN 139/2025 — não é apenas trabalho duplicado.

**Base legal.**

- [REF-CONTRAN-808-2020] art. 4º, § 4º: _"Os dados e as informações do RENAEST serão complementados
  por dados e informações dos sistemas de Registro Nacional de Veículos Automotores (RENAVAM),
  Registro Nacional de Carteira de Habilitação (RENACH) e Registro Nacional de Infrações de Trânsito
  (RENAINF)."_
- [REF-LEI-13709-2018] art. 6º, III — _"necessidade: limitação do tratamento ao mínimo necessário
  para a realização de suas finalidades, com abrangência dos dados pertinentes, proporcionais e não
  excessivos em relação às finalidades do tratamento de dados"_.
- [REF-SENATRAN-PORTARIA-139-2025] art. 18, § 1º: _"O requerente deve, sempre que possível, evitar a
  inclusão de dados pessoais sensíveis nos grupos de informação, substituindo-os por outros dados que
  atendam à mesma finalidade."_

**Verificação.** Critério de desenho: para cada atributo de `CrashVehicle`/`CrashPerson`, decidir
explicitamente se ele é (a) **fato observado na cena** — dano aparente, posição, evasão, papel no
sinistro: só o agente pode registrar; ou (b) **atributo cadastral** — marca, modelo, cor,
proprietário, situação da habilitação: obtido por cruzamento, devendo ser **referenciado por chave**
(placa, número de registro do condutor) e não copiado. Essa separação já tem precedente normativo no
TEAT: a vedação de auto-preenchimento sem validação do agente ([RN-TEAT-115]) trata do mesmo eixo
pelo lado oposto — o que a consulta traz precisa ser confirmado pelo agente antes de valer como
declaração dele.

**Controvérsia/risco.** O § 4º diz que a **base nacional** é complementada, **não** que o registro
local do DETRAN-AM tenha acesso a esse cruzamento — o acesso do DETRAN-AM aos sistemas da SENATRAN é
disciplinado por regime próprio, de casos de uso e grupos de informação
([REF-SENATRAN-PORTARIA-139-2025] arts. 2º, 16 e 17 — ver [RN-BOAT-132]). Ou seja: o BOAT pode
**depender** do cruzamento nacional para a completude estatística, mas **não pode presumir** que
enxerga o resultado desse cruzamento. Desenhar a tela de campo assumindo consulta RENAVAM/RENACH
disponível é presumir um acesso que depende de autorização formal — e que, em campo, esbarra ainda
na doutrina offline-first herdada do TEAT.
