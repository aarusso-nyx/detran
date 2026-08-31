---
id: RN-TEAT-122
title: Medidas administrativas são rol taxativo de caráter complementar — e sobre documento digital executam-se por registro em sistema
status: draft
apps: [teat]
sources: [REF-CTB-165-277-medidas-alcoolemia, REF-CONTRAN-985-1003-MBFT]
updated: 2026-08-24
---

**Regra.** A autoridade de trânsito ou seus agentes, **na esfera das competências do CTB e dentro
de sua circunscrição**, deverão adotar as medidas administrativas do rol do art. 269 — e apenas
elas, salvo as medidas **inominadas** que o próprio CTB prevê para infrações específicas. O rol:
retenção do veículo; remoção do veículo; recolhimento da CNH; recolhimento da Permissão para
Dirigir; recolhimento do Certificado de Registro; recolhimento do Certificado de Licenciamento
Anual; transbordo do excesso de carga; realização de teste de dosagem de alcoolemia ou perícia;
recolhimento de animais soltos; realização de exames de aptidão. As medidas **não elidem** as
penalidades — têm **caráter complementar** — e têm por objetivo prioritário a **proteção à vida e
à incolumidade física da pessoa**. **No caso de documentos em meio digital**, os recolhimentos
(incisos III a VI) _"serão realizadas por meio de registro no Renach ou Renavam"_ — não por
apreensão física.

**Base legal.** [REF-CTB-165-277-medidas-alcoolemia] art. 269:

> "Art. 269. A autoridade de trânsito ou seus agentes, na esfera das competências estabelecidas
> neste Código e dentro de sua circunscrição, deverá adotar as seguintes medidas administrativas:
> I - retenção do veículo; II - remoção do veículo; III - recolhimento da Carteira Nacional de
> Habilitação; IV - recolhimento da Permissão para Dirigir; V - recolhimento do Certificado de
> Registro; VI - recolhimento do Certificado de Licenciamento Anual; VII - (VETADO); VIII -
> transbordo do excesso de carga; IX - realização de teste de dosagem de alcoolemia ou perícia de
> substância entorpecente […]; X - recolhimento de animais […]; XI - realização de exames de
> aptidão física, mental, de legislação, de prática de primeiros socorros e de direção veicular."
>
> "§ 1º A ordem, o consentimento, a fiscalização, as medidas administrativas e coercitivas
> adotadas pelas autoridades de trânsito e seus agentes terão por objetivo prioritário a proteção
> à vida e à incolumidade física da pessoa."
>
> "§ 2º As medidas administrativas previstas neste artigo não elidem a aplicação das penalidades
> impostas por infrações estabelecidas neste Código, possuindo caráter complementar a estas."
>
> "§ 3º São documentos de habilitação: I - a Carteira Nacional de Habilitação; II - a Permissão
> para Dirigir; e III - a Autorização para Conduzir Ciclomotor."
>
> "§ 5º No caso de documentos em meio digital, as medidas administrativas previstas nos incisos
> III, IV, V e VI do caput deste artigo serão realizadas por meio de registro no Renach ou
> Renavam, conforme o caso, na forma estabelecida pelo Contran."

[REF-CONTRAN-985-1003-MBFT] Seção 8.7: _"Além das medidas administrativas relacionadas no artigo
269, o CTB prevê medidas administrativas específicas para as infrações dos artigos 221 (apreensão
das placas irregulares), 243 (recolhimento de placas e documentos), 245 (remoção de mercadoria e
material), 255 (remoção de bicicleta) e 278 (retorno ao ponto de evasão)."_

**Verificação.** `AdministrativeTerm.type` é **enumerado fechado** derivado do art. 269 ∪ medidas
inominadas do MBFT Seção 8.7 — nunca texto livre. Cada tipo carrega seu próprio conjunto de campos
e prazos ([RN-TEAT-124] a [RN-TEAT-130]). Para os incisos III a VI, o termo carrega
`suporte` ∈ {FISICO, DIGITAL}: no suporte digital **não há apreensão** e a execução da medida é um
**envio a Renach/Renavam** — integração auditada, com o mesmo regime probatório do ato legal
([RN-TEAT-001]). Um termo digital sem confirmação de registro na base nacional é medida
**pendente**, não concluída.

**Controvérsia/risco.** O §3º do art. 269 (Lei 14.599/2023) inclui a **Autorização para Conduzir
Ciclomotor** entre os documentos de habilitação, mas o inciso III do _caput_ segue nomeando apenas
a CNH e o inciso IV a PPD — a ACC não tem inciso próprio. Interpretação sistemática: o
recolhimento alcança a ACC por força do §3º. É leitura, não texto — item 23 de
`_intake/legal-assessment.md`.
