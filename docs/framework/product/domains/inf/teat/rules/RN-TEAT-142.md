---
id: RN-TEAT-142
title: Registros de bodycam — acesso restrito por requisição, limites de divulgação e ausência de prazo de retenção
status: draft
apps: [teat]
sources: [REF-DETRANAM-TALAO-BODYCAM, REF-DETRANAM-PORTARIA-NORMATIVA-015-2026]
updated: 2026-09-13
---

**Regra (DETRAN-AM).** O acesso aos registros audiovisuais **observará a Lei nº 12.527/2011 (Lei de
Acesso à Informação)** e ocorrerá **mediante requisição de Magistrados, membros do Ministério
Público, da Defensoria Pública, ou autoridades policiais/administrativas responsáveis por
investigações formais**. O uso deve observar **a finalidade da requisição**, sob pena de
responsabilização civil, penal e administrativa, e o acesso é realizado **por entrega de mídia
específica**. A **divulgação ou compartilhamento não pode comprometer** o **direito de imagem** dos
envolvidos — especialmente em situações constrangedoras ou que exponham sua integridade física — nem
a **proteção de crianças e adolescentes**. A Portaria estabelece, entre seus objetivos, **qualificar
a produção de provas materiais, assegurando a cadeia de custódia**, e **assegurar disponibilidade,
integridade, confidencialidade e autenticidade** das informações coletadas.

**Base legal.** [REF-DETRANAM-TALAO-BODYCAM] §2 — Portaria Normativa nº 003/2026-DP/DETRAN/AM:

> "Art. 12. O acesso observará a Lei nº 12.527/2011 (Lei de Acesso à Informação)."
>
> "Art. 13. O acesso ocorrerá mediante requisição de Magistrados, membros do Ministério Público, da
> Defensoria Pública, ou autoridades policiais/administrativas responsáveis por investigações
> formais. § 1º O uso dos registros deverá observar a finalidade da requisição, sob pena de
> responsabilização civil, penal e administrativa. § 2º O acesso será realizado por meio de entrega
> de mídia específica."
>
> "Art. 14. A divulgação ou compartilhamento de registros não poderá comprometer: I – O direito de
> imagem dos envolvidos, especialmente em situações constrangedoras ou que exponham sua integridade
> física; II – A proteção de crianças e adolescentes."
>
> "Art. 2º São objetivos desta Portaria: […] V. Qualificar a produção de provas materiais,
> assegurando a cadeia de custódia; […] VIII. Assegurar a disponibilidade, integridade,
> confidencialidade e autenticidade das informações coletadas […]"
>
> "Art. 16. Os casos omissos serão disciplinados por Portaria complementar."

**Verificação.** Se a bodycam entrar no escopo do TEAT como fonte de evidência ([RN-TEAT-141]), o
acesso **não** pode ser modelado como consulta livre de nenhum papel de RBAC: é **fluxo de
requisição formal** com requerente qualificado, finalidade declarada e entrega controlada — um
`CustodyEvent` de acesso, com registro de quem requisitou, sob que fundamento e o que foi entregue
([RN-TEAT-002]). Nem `field-agent`, nem `processing-operator`, nem `auditor` têm, pela Portaria,
acesso ordinário ao acervo. O papel `auditor` do TEAT ("consulta trilha de auditoria, cadeia de
custódia") precisa ser expressamente **limitado a metadados** quanto a bodycam, salvo requisição.

**Controvérsia/risco — três lacunas materiais.**

1. **Não há prazo de retenção nem política de expurgo.** A Portaria não fixa por quanto tempo os
   registros são guardados. Sem prazo, o órgão fica exposto nos dois sentidos: descartar cedo
   destrói prova de defesa e de acusação; guardar indefinidamente contraria a necessidade e a
   limitação temporal do tratamento de dados pessoais.
2. **O cidadão gravado e o autuado não constam do rol de acesso do art. 13.** O interessado no
   processo administrativo de trânsito — que pode precisar da gravação para instruir sua defesa —
   não é legitimado pela Portaria; o art. 12 remete à LAI, mas dado pessoal de terceiros em vídeo
   é justamente a hipótese de acesso restrito da LAI. A tensão com o contraditório e a ampla defesa
   é real e não está resolvida no texto.
3. **A LGPD (Lei 13.709/2018) não é mencionada uma única vez.** A Portaria invoca a LAI, cita
   "respeito à privacidade" entre seus valores e trata de direito de imagem, mas não estabelece
   base legal de tratamento, papel de controlador, prazo, nem canal de exercício de direitos do
   titular — para um tratamento **contínuo, sistemático e em larga escala** de imagem e voz de
   terceiros em via pública. É a lacuna mais relevante do instrumento.
   Itens 41 a 43 de `_intake/legal-assessment.md`; a matéria cabe expressamente nos "casos omissos"
   do art. 16, a serem disciplinados por Portaria complementar ainda não editada.

**Atualização (2026-09-13, steering.md H.45).** O prazo de retenção da bodycam **permanece sem
valor** — único conjunto documental excluído da decisão de prazos do Owner — e foi pedido à
Comissão Setorial de Avaliação de Documentos ([REF-DETRANAM-PORTARIA-NORMATIVA-015-2026]) no
ofício 03; o parâmetro `teat.bodycam.retention_days` fica pendente de fonte.
