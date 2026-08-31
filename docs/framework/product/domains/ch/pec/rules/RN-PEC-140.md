---
id: RN-PEC-140
title: O laudo nascido eletrônico tem valor probatório pleno — regime da Lei 13.787/2018 e o NGS2 do CFM, que só dispensa o papel com assinatura ICP-Brasil
status: draft
apps: [pec]
sources:
  [
    REF-LEI-13787-2018,
    REF-CFM-1821-2007,
    REF-MP-2200-2-2001,
    REF-CONTRAN-927-2022,
    REF-CFP-01-2019,
  ]
updated: 2026-08-24
---

**Regra.** O prontuário e os laudos do PEC operam sob um regime jurídico próprio, que sustenta a
arquitetura 100% eletrônica do sistema:

1. **A guarda e o manuseio de prontuário por sistema informatizado são regidos pela Lei 13.787/2018
   e pela LGPD** — as duas, conjuntamente, por remissão expressa do art. 1º.
2. **O documento em conformidade tem o mesmo valor probatório do original** para todos os fins de
   direito.
3. **A eliminação da obrigatoriedade do papel exige "Nível de Garantia de Segurança 2" (NGS2)** do
   Manual de Certificação do CFM — e o NGS2 **exige assinatura digital**, autorizado o **certificado
   padrão ICP-Brasil**. O nível inferior (NGS1) **não** autoriza eliminar o papel, _"por falta de
   amparo legal"_.
4. **O arquivamento dos documentos do exame segue determinação dos Conselhos Federais** de Medicina
   e Psicologia (Res. CONTRAN 927/2022 art. 10, § 1º) — e, para a trilha psicológica, alcança **os
   protocolos dos testes**, não só o laudo ([RN-PEC-104]).

**Base legal.**

- [REF-LEI-13787-2018] art. 1º: _"A digitalização e a utilização de sistemas informatizados para a
  guarda, o armazenamento e o manuseio de prontuário de paciente são regidas por esta Lei e pela Lei
  nº 13.709, de 14 de agosto de 2018"_.
- [REF-LEI-13787-2018] art. 5º: _"O documento digitalizado em conformidade com as normas
  estabelecidas nesta Lei [...] terá o mesmo valor probatório do documento original para todos os
  fins de direito."_
- [REF-LEI-13787-2018] art. 2º, § 2º: uso de _"certificado digital emitido no âmbito da [ICP-Brasil]
  ou outro padrão legalmente aceito"_.
- [REF-CFM-1821-2007] art. 3º: autoriza sistemas informatizados _"eliminando a obrigatoriedade do
  registro em papel, desde que esses sistemas atendam integralmente aos requisitos do 'Nível de
  garantia de segurança 2 (NGS2)'"_; art. 4º: não autoriza a eliminação do papel com NGS1, _"por
  falta de amparo legal"_; art. 5º: _"Como o 'NGS2' exige o uso de assinatura digital [...] está
  autorizada a utilização de certificado digital padrão ICP-Brasil [...]."_
- [REF-MP-2200-2-2001] art. 10, § 1º: presunção de veracidade em relação aos signatários.
- [REF-CONTRAN-927-2022] art. 10, § 1º: _"Todos os documentos utilizados [...] deverão ser arquivados
  conforme determinação dos Conselhos Federais de Medicina e Psicologia."_

**Verificação.** Fecha o "(fonte pendente)" de [RN-PEC-001] quanto ao fundamento do modelo
documental. Consequências verificáveis:

1. **A escolha de PAdES+ICP-Brasil de [RN-PEC-002] é o que torna o modelo sem papel legítimo.** Não é
   excesso de zelo: com assinatura de nível inferior, o CFM **não autoriza** dispensar o papel.
2. **NGS2 é um regime de certificação de sistema, não apenas de assinatura.** O art. 1º aprova um
   **Manual de Certificação** com requisitos de GED, controle de acesso, trilha e integridade — o PEC
   os satisfaz de fato, mas **não há evidência no corpus de certificação formal** do sistema no
   programa do CFM/SBIS. É a diferença entre estar conforme e poder demonstrá-lo.
3. **A Lei 13.787 aplica-se a documentos nascidos eletrônicos** (art. 6º, § 5º — ver [RN-PEC-141]),
   e não apenas a papel digitalizado: o PEC está integralmente dentro do seu âmbito.
4. **A remissão do art. 10, § 1º da Res. 927/2022 aos Conselhos** significa que o regime de guarda
   **não** é fixado pela norma de trânsito — é do CFM/CFP e da Lei 13.787. Não há prazo de
   arquivamento na Res. 927/2022, e procurá-lo ali é erro comum.
5. **Trilha psicológica tem acervo maior que o laudo** (protocolos de teste, [REF-CFP-01-2019] § 21)
   — se algum desses instrumentos for físico, existe acervo em papel fora do PEC, e a premissa
   "paperless" é parcialmente falsa.

**Controvérsia/risco.** _Severidade: baixa-média._ (a) A [REF-CFM-1821-2007] foi **modificada pela
Resolução CFM nº 2.218/2018**, **não capturada** — o texto do NGS2 pode ter mudado; não promover esta
regra a `reviewed` antes dessa captura. (b) A qualificação do laudo de aptidão como **"prontuário de
paciente"** para fins da Lei 13.787 é uma inferência: o exame é **pericial**, não assistencial, e a
lei fala em "prontuário de paciente". A inferência é sustentável — o próprio PEC se define como
prontuário eletrônico, o ato é praticado por profissional de saúde e gera registro clínico — e é
**favorável à proteção** (atrai regime mais rigoroso). Mas é inferência, e ela é **a premissa da qual
depende o prazo de 20 anos de [RN-PEC-141]**. Item 6 de `_intake/legal-assessment.md`.
