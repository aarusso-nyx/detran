---
id: RN-PEC-153
title: Direitos do titular no PEC — acesso ao próprio dossiê, correção, entrevista devolutiva como interface concreta, e os limites impostos pela retenção obrigatória
status: draft
apps: [pec, portal]
sources:
  [
    REF-LEI-13709-2018,
    REF-CFP-01-2019,
    REF-DETRANAM-PORTARIA-005-2021,
    REF-LEI-13787-2018,
  ]
updated: 2026-08-24
---

**Regra.** O candidato é titular identificado, presente e capaz — o que torna os direitos do art. 18
da LGPD **exercíveis de forma direta**, ao contrário do cenário do BOAT ([RN-BOAT-126] item 4). O
PEC deve suportar:

1. **Confirmação e acesso** aos próprios dados e ao próprio dossiê clínico (art. 18, I e II) —
   [APP-PEC] já atribui ao ator Candidato _"acesso somente-leitura ao próprio dossiê"_, o que
   satisfaz o núcleo.
2. **Correção de dados incompletos, inexatos ou desatualizados** (art. 18, III) — com uma
   particularidade decisiva: **o laudo assinado é imutável** ([RN-PEC-001]), e o juízo pericial não é
   "dado inexato" corrigível pelo titular. A correção alcança **dado cadastral e factual**; a
   contestação do **juízo** tem via própria e específica — a **Junta Médica/Psicológica**
   ([RN-PEC-110]). Confundir as duas é o erro mais provável nesta matéria.
3. **Entrevista devolutiva** ([REF-CFP-01-2019] § 22; [REF-DETRANAM-PORTARIA-005-2021] art. 47, § 1º)
   — obrigação **anterior e mais específica** que a LGPD, e a interface mais concreta do direito de
   acesso em todo o corpus: o titular solicita e o psicólogo é **obrigado** a apresentar o resultado
   de forma objetiva. Nenhum artefato PEC a modela.
4. **Eliminação (art. 18, VI) é limitada pela retenção obrigatória.** O prontuário deve ser
   conservado por **20 anos** ([RN-PEC-141]); a LGPD art. 16, I autoriza expressamente a conservação
   para cumprimento de obrigação legal. O pedido de eliminação **não alcança** esse acervo — mas a
   resposta ao titular deve **dizer isso**, com a base, e não simplesmente negar.
5. **Devolução ao paciente** ([REF-LEI-13787-2018] art. 6º, § 2º) é alternativa legal à eliminação ao
   fim do prazo — um direito do titular que nenhuma política do PEC prevê.
6. **Encarregado identificado** (art. 41) e **comunicação de incidente** (art. 48) — o PEC já tem
   papel `DPO` binding, o que é vantagem sobre o BOAT; falta o **canal público**.

**Base legal.**

- [REF-LEI-13709-2018] art. 18, I-VII; art. 16, I; art. 23, § 3º (prazos e procedimentos perante o
  Poder Público remetem à Lei do Habeas Data, à Lei 9.784/1999 e à LAI); art. 37 (registro das
  operações); art. 41 (encarregado); art. 46 e 48 (segurança e incidente).
- [REF-CFP-01-2019] art. 2º, § 22: _"Quando solicitado, fica a(o) psicóloga(o) obrigada(o) a realizar
  a entrevista devolutiva à(ao) candidata(o), apresentando de forma objetiva o resultado da perícia
  psicológica [...]."_
- [REF-DETRANAM-PORTARIA-005-2021] art. 47, § 1º (mesma obrigação, âncora estadual).
- [REF-LEI-13787-2018] art. 6º, §§ 2º e 3º (devolução ao paciente; sigilo no processo de eliminação).

**Verificação.**

1. **Acesso a dado sensível do próprio titular também é evento auditável** — com quem, quando e sob
   que autenticação. O padrão já existe no corpus ([RN-BOAT-126] item 1); reaproveitar.
2. **A solicitação de entrevista devolutiva é um fluxo com dois atores** e não existe em nenhuma
   jornada ([JRN-PEC-001]) nem UC. Canal natural: [APP-PORTAL].
3. **A negativa de eliminação precisa ser fundamentada**, com indicação do art. 16, I e do prazo do
   art. 6º da Lei 13.787 — negativa sem fundamento é, ela própria, descumprimento.
4. **Prazo de resposta indefinido.** O art. 23, § 3º remete a **três regimes distintos** (Habeas Data,
   Lei 9.784, LAI) e nenhum deles é o prazo genérico da LGPD para o controlador privado — a mesma
   questão aberta registrada em [RN-BOAT-126]. Precisa de definição formal do DETRAN-AM.
5. **A via de contestação do juízo pericial é a junta, com prazo de 30 dias** ([RN-PEC-112]) — que é
   **preclusivo**, ao contrário do direito de correção da LGPD, que não o é. A UI precisa comunicar
   essa diferença, sob pena de o titular perder o prazo acreditando ter exercido um direito.

**Controvérsia/risco.** _Severidade: média._ (a) **Anotações técnicas do perito** (raciocínio,
hipóteses descartadas, protocolos de teste) integram o dossiê acessível ao titular? A LGPD dá acesso
aos **dados**; a norma do CFP manda arquivar os protocolos junto ao documento; e a divulgação de
protocolo de teste psicológico validado tem restrição própria do SATEPSI (a exposição do instrumento
compromete sua validade em nova aplicação). **Tensão real, não resolvida por nenhuma norma
capturada.** Leitura de trabalho: acesso ao **resultado e aos dados**, não ao instrumento. (b) O
direito de acesso do candidato **inapto** é o cenário de maior atrito prático e é justamente onde a
entrevista devolutiva foi desenhada para atuar — implementá-la mitiga risco jurídico e conflito
operacional ao mesmo tempo. Item 19 de `_intake/legal-assessment.md`.
