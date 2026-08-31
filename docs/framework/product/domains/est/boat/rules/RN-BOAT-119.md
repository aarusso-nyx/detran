---
id: RN-BOAT-119
title: Registrador instantâneo de velocidade e tempo — em sinistro com vítima, só o perito oficial pode retirar o disco/unidade (CTB art. 279)
status: draft
apps: [boat, teat]
sources: [REF-CTB-sinistro-cena-renaest]
updated: 2026-08-24
---

**Regra.** Em sinistro **com vítima** envolvendo veículo equipado com **registrador instantâneo de
velocidade e tempo** (tacógrafo — típico de transporte de carga e de passageiros), **somente o perito
oficial encarregado do levantamento pericial** pode retirar o disco ou a unidade armazenadora do
registro. A vedação alcança o agente de trânsito, o condutor, o proprietário, a empresa
transportadora e o serviço de remoção. É **vedação de conduta na cena**, com efeito direto sobre o
desenho do atendimento: o BOAT **não pode** oferecer ao agente qualquer fluxo de coleta, leitura,
download ou anexação do conteúdo do registrador como evidência.

**Base legal.** [REF-CTB-sinistro-cena-renaest] art. 279:

> "Art. 279. Em caso de sinistro com vítima envolvendo veículo equipado com registrador instantâneo
> de velocidade e tempo, somente o perito oficial encarregado do levantamento pericial poderá
> retirar o disco ou unidade armazenadora do registro." _(Redação dada pela Lei nº 14.599, de 2023)_

**Verificação.** O que o sistema **pode e deve** registrar, sem violar a vedação:

1. **Que o veículo é equipado** com registrador instantâneo — atributo de `CrashVehicle` hoje
   inexistente, e que é o gatilho de todo o regime.
2. **Que o registrador foi preservado** e **a quem foi entregue** (perito oficial identificado,
   data/hora) — cadeia de custódia documental, sem manipulação do dispositivo.
3. **Que houve impedimento** — registrador destruído no sinistro, veículo removido antes da chegada
   do perito — como fato observado.

O paralelo estrutural com a bodycam é exato e deve ser reaproveitado: em [RN-TEAT-141] a regra é que
o sistema **não oferece ao agente** função de cópia, exclusão ou transferência de arquivo; aqui, o
sistema não oferece função alguma sobre a unidade armazenadora. Em ambos os casos, o que se modela é
a **referência ao acervo custodiado por outrem**, não o acervo.

**Controvérsia/risco.** (a) A norma não define **quem é o "perito oficial"** no âmbito estadual —
mesma lacuna de competência pericial apontada em [RN-BOAT-118]. (b) A vedação é expressa **apenas
para sinistro com vítima**; em sinistro sem vítima o texto silencia, o que não autoriza a leitura
inversa de que qualquer pessoa pode retirar o dispositivo — apenas retira a proteção específica do
art. 279. Não transformar esse silêncio em permissão. (c) Nenhum artefato BOAT existente menciona
registrador instantâneo; a lacuna é do corpus, não da norma.
