---
id: RN-PORTAL-112
title: Vista do próprio processo é direito, não funcionalidade — ciência da tramitação, acesso às peças e cópias, com a única ressalva do dado de terceiro
status: draft
apps: [portal, rait, boat, pec]
sources:
  [REF-LEI-9784-1999, REF-LEI-14129-2021, REF-LEI-13460-2017, REF-CONTRAN-900]
updated: 2026-08-24
---

**Regra.** A tela "Meus processos" e a linha do tempo do caso **implementam um direito**, não uma
conveniência de produto. O interessado tem direito a (a) **ciência da tramitação**, (b) **vista dos
autos**, (c) **cópias dos documentos** que os integram e (d) **conhecer as decisões proferidas**. Em
consequência:

1. **Nada de "resumo em vez do documento".** A linha do tempo pode traduzir o estado para linguagem
   cidadã (`_intake/ux-notes.md` §c), mas o **documento original** — peça, parecer, ata, decisão —
   permanece acessível e baixável a qualquer momento. Traduzir é acréscimo, nunca substituição.
2. **Cópia é gratuita e imediata no canal digital.** O art. 18, § 5º da LGPD veda custo para o
   exercício do direito de acesso a dado pessoal, e o art. 27, I da Lei 14.129/2021 garante
   gratuidade de acesso à plataforma; cobrar por reprografia digital é reintroduzir custo abolido.
3. **A única supressão legítima é dado de terceiro.** O art. 46 ressalva _"os dados e documentos de
   terceiros protegidos por sigilo ou pelo direito à privacidade, à honra e à imagem"_ — e apenas
   isso. Suprime-se **o campo do terceiro**, nunca a peça inteira, e nunca o dado do próprio titular
   ([RN-PORTAL-118]).
4. **O acesso não depende de requerimento.** Vista do processo pelo interessado é acesso corrente, não
   pedido de acesso à informação: não abre relógio de LAI nem de LGPD, e não pode ser roteado para
   uma fila de atendimento.
5. **Escopo além da trilha de multas.** O direito é do "interessado" em qualquer processo
   administrativo — alcança igualmente o registro de sinistro que lhe diz respeito ([RN-BOAT-126],
   [UC-PORTAL-013]) e o processo de exame de aptidão ([UC-PORTAL-014]).

**Base legal.**

- [REF-LEI-9784-1999] art. 3º, II: o administrado tem direito a _"ter ciência da tramitação dos
  processos administrativos em que tenha a condição de interessado, ter vista dos autos, obter cópias
  de documentos neles contidos e conhecer as decisões proferidas"_.
- [REF-LEI-9784-1999] art. 46: _"Os interessados têm direito à vista do processo e a obter certidões
  ou cópias reprográficas dos dados e documentos que o integram, ressalvados os dados e documentos de
  terceiros protegidos por sigilo ou pelo direito à privacidade, à honra e à imagem."_
- [REF-LEI-14129-2021] art. 21, IV: _"acompanhamento das solicitações por etapas"_; art. 27, I:
  gratuidade no acesso às Plataformas de Governo Digital.
- [REF-LEI-13460-2017] art. 7º, § 3º, V: a Carta deve detalhar _"mecanismos de consulta, por parte
  dos usuários, acerca do andamento do serviço solicitado e de eventual manifestação"_ — o que
  pressupõe que tais mecanismos existam.
- [REF-CONTRAN-900] art. 5º, parágrafo único, e [REF-CTB-280-290] art. 285, § 4º: como o órgão não
  pode exigir do cidadão o documento que ele próprio emitiu ([RN-PORTAL-106]), esses documentos têm
  necessariamente de estar disponíveis **do lado do órgão** — e o corolário natural é exibi-los ao
  interessado, e não guardá-los.

**Verificação.** (a) Todo evento do processo visível na linha do tempo com peça associada expõe link
de download da peça original. (b) Nenhuma peça pode ser retirada da vista por decisão de produto: a
supressão de conteúdo é sempre **campo a campo**, com registro do fundamento (`supressao_motivo =
dado_de_terceiro`), auditável. (c) O acesso do interessado ao próprio processo **não** gera ticket,
não entra em fila e não tem prazo de resposta — se o produto o transformar em requerimento, é regressão
funcional com consequência jurídica. (d) Teste negativo: usuário sem vínculo com o processo não o
enxerga — o direito é do **interessado**, e a mesma regra que garante o acesso delimita quem o tem.

**Controvérsia/risco.** (a) A Lei 9.784/1999 é federal e se aplica **subsidiariamente** (art. 69),
socorrendo lacunas do CTB e das resoluções CONTRAN; o CTB não disciplina vista de autos no processo de
infração, então a lacuna existe e a subsidiariedade opera — mas a extensão de lei federal de processo
administrativo a órgão estadual é a **mesma questão jurídica aberta** já registrada para a Lei
9.873/1999 ([RN-RAIT-113]; `_meta/steering.md` C.13, respondido pelo Owner sem parecer formal). A
mitigação é que o núcleo do direito à vista tem também assento constitucional (CF/88 art. 5º, LV,
contraditório e ampla defesa), o que o torna pouco vulnerável independentemente da via de aplicação.
(b) O caso difícil é o processo que contém dado sensível de terceiro — tipicamente o registro de
sinistro com dado de saúde de vítima, necessário ao contraditório de quem foi autuado. A solução de
trabalho já adotada em [RN-BOAT-126] é fornecer o registro **com supressão dos campos de saúde de
terceiros**, jamais negar o acesso ao registro inteiro; esta regra a confirma e generaliza.
