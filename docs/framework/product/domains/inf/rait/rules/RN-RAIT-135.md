---
id: RN-RAIT-135
title: O procurador é titular de dados próprio, distinto do requerente — RN-RAIT-121 regula a validade formal da procuração, não o regime LGPD do dado do procurador
status: draft
apps: [rait, portal]
sources: [REF-LEI-13709-2018, REF-DETRANAM-PORTARIA-5046, REF-CONTRAN-900]
updated: 2026-08-26
---

**Regra.** Quando a defesa ou o recurso é apresentado por procurador ([RN-RAIT-121]), o nome, o
documento e a assinatura do procurador constituem dado pessoal de um **segundo titular**, distinto
do requerente — não um atributo do processo do requerente. [RN-RAIT-121] trata a procuração
inteiramente como questão de **validade formal** (forma pública ou particular, reconhecimento de
firma por autenticidade, prazo de validade, poderes específicos): nunca pergunta de quem é o dado
de identificação do procurador, sob que base é tratado, nem por quanto tempo é retido.
Adicionalmente, [RN-RAIT-121] já registra que, cumprida a exigência de reconhecimento uma vez, _"os
demais atos praticados pelo outorgado dispensam novo reconhecimento de firma"_ — o que implica
guarda do dado do procurador **além de um único caso**, ao contrário do dado do requerente, cujo
ciclo de vida acompanha o processo.

**Base legal.**

- [REF-LEI-13709-2018] art. 5º, V: _"titular: pessoa natural a quem se referem os dados pessoais
  que são objeto de tratamento"_ — o procurador enquadra-se nessa definição tanto quanto o
  requerente; a lei não subordina a titularidade de um sujeito à titularidade de outro.
- [REF-LEI-13709-2018] art. 7º, II: mesma base do requerente ([RN-RAIT-133]) — [REF-DETRANAM-
  PORTARIA-5046] art. 2º é o regulamento que impõe a coleta e a verificação do dado do procurador
  como condição de admissibilidade da representação ([RN-RAIT-121]).
- [REF-LEI-13709-2018] art. 18: os direitos do titular (confirmação, acesso, correção) aplicam-se
  ao procurador quanto ao **seu próprio** dado de identificação, independentemente de o processo em
  si pertencer ao requerente.

**Verificação.** (a) Nenhuma regra RAIT ou PORTAL hoje oferece canal para o procurador exercer
direitos sobre o próprio dado de identificação (confirmar que consta corretamente, corrigir grafia
de nome, saber por quanto tempo fica retido) — o bloco [RN-PORTAL-118]-[RN-PORTAL-122] é desenhado
em torno do requerente autenticado, não do procurador. (b) A retenção do dado do procurador deve
ser justificada de forma própria: se o efeito prático de "dispensa de novo reconhecimento" implica
guardar a procuração e os dados do procurador para uso em atos futuros e não relacionados ao caso
original, essa é uma finalidade distinta da do processo — precisa de sua própria âncora de
retenção ([RN-RAIT-136] trata da retenção do processo em si, não deste caso). (c) Nenhum artefato
distingue, na modelagem de dados, `requerente` de `procurador` como dois papéis de titular — hoje
ambos aparecem como campos do mesmo requerimento.

**Controvérsia/risco.** _Severidade: MÉDIA._ É um titular nunca antes nomeado como tal neste
corpus. Pergunta em aberto para validação: o procurador precisa de canal de acesso próprio (ex.
autosserviço distinto do requerente), ou basta que ele exerça seus direitos por requerimento
avulso ao Encarregado, como qualquer titular não cadastrado no PORTAL? A resposta prática mais
simples — procurador não tem conta própria no PORTAL, mas pode peticionar como qualquer titular —
provavelmente resolve a maior parte da exigência sem exigir novo desenho de produto; isso é
proposta, não posição adotada. Ver `_meta/lgpd-assessment.md` §RAIT, item (d).
