---
id: RN-BOAT-109
title: Definição legal de "sinistro de trânsito" (CTB, Anexo I) — critério de enquadramento do registro
status: draft
apps: [boat]
sources: [REF-CTB-sinistro-cena-renaest]
updated: 2026-08-24
---

**Regra.** "Sinistro de trânsito" tem **definição legal única e expressa** no Anexo I do CTB, e é
ela — não a prática, não o contrato de integração — que determina se um evento deve ou não gerar
registro. Quatro elementos compõem o tipo: (1) um **evento**; (2) que **resulta** em dano ao veículo
ou à sua carga **e/ou** em lesões a pessoas ou animais; (3) podendo trazer dano material ou prejuízo
ao trânsito, à via ou ao meio ambiente; (4) **em que pelo menos uma das partes está em movimento**,
(5) **nas vias terrestres ou em áreas abertas ao público**. O conectivo **"e/ou"** é decisivo: um
evento com **dano exclusivamente material** já é sinistro para todos os efeitos legais — não existe,
no CTB, categoria "acidente" que exclua o sinistro sem vítima.

**Base legal.** [REF-CTB-sinistro-cena-renaest] Anexo I:

> "SINISTRO DE TRÂNSITO - evento que resulta em dano ao veículo ou à sua carga e/ou em lesões a
> pessoas ou animais e que pode trazer dano material ou prejuízo ao trânsito, à via ou ao meio
> ambiente, em que pelo menos uma das partes está em movimento nas vias terrestres ou em áreas
> abertas ao público." _(Incluído pela Lei nº 14.599, de 2023)_

**Verificação.** Critérios de exclusão que decorrem diretamente do texto e que o produto pode
aplicar sem inventar norma: (a) **nenhuma parte em movimento** — dano a veículo estacionado por
queda de árvore, por exemplo — não é sinistro de trânsito; (b) evento em **área privada não aberta
ao público** não é sinistro de trânsito, ainda que envolva veículos; (c) **lesão a animais** é
resultado suficiente, o que é operacionalmente relevante no Amazonas (rodovias com fauna) e hoje não
tem campo próprio no modelo de dados de [APP-BOAT]. Consequência: o gate de criação de um
`CrashRecord` deve ser este teste, e não a existência de vítima humana.

**Controvérsia/risco.** Três lacunas de definição, todas reais:

1. **O CTB não define "vítima".** Define sinistro, mas não quem, entre as pessoas envolvidas, conta
   como vítima — nem separa "ileso", "ferido leve", "ferido grave". A distinção
   `CrashPerson` × `CrashVictim` do modelo de dados é, portanto, **construção do produto**, não
   recorte legal ([RN-BOAT-111]).
2. **"Pelo menos uma das partes está em movimento"** — a norma não diz se "parte" alcança pedestre,
   ciclista ou animal isoladamente; a leitura literal favorece a interpretação ampla (qualquer parte
   envolvida), mas o ponto não está resolvido em texto.
3. **"Áreas abertas ao público"** — expressão sem definição no Anexo I para esta finalidade; a
   fronteira (estacionamento de shopping, pátio de posto, via de condomínio) é decidida caso a caso
   pelo agente. Não deve ser transformada em regra automática de aceitação/rejeição de registro.
