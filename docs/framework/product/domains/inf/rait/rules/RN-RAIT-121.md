---
id: RN-RAIT-121
title: Representação por procurador — procuração pública ou particular com firma reconhecida por autenticidade
status: approved
apps: [rait, portal]
sources:
  [
    REF-CONTRAN-900,
    REF-DETRANAM-PORTARIA-5046,
    REF-DETRANAM-SERVICOS,
    REF-DETRANAM-PORTARIA-281-2022,
  ]
updated: 2026-08-26
---

**Regra.** O legitimado ([RN-RAIT-120]) pode ser representado por **procurador legalmente habilitado
ou por instrumento de procuração, na forma da lei**, sob pena de **não conhecimento** da defesa ou do
recurso. No âmbito do DETRAN-AM, para processos administrativos em geral — categoria que abrange a
defesa e o recurso de infração, por não serem atos de caráter personalíssimo — a representação pode
se dar por procuração **pública OU particular**, exigindo-se, no caso da particular, o
**reconhecimento da firma do outorgante por autenticidade**.

**"Por autenticidade" não exige cartório.** Pela Portaria 5046/2018, o **próprio servidor do
DETRAN-AM** lavra a autenticidade no documento, confrontando a assinatura com a do documento de
identidade original do signatário, ou estando este presente e assinando diante do servidor.

**Requisitos de conteúdo da procuração.** Deve conter **prazo de validade** e **delegação de poderes
específicos** de representação pertinentes ao serviço. Cumprida a exigência de reconhecimento, os
**demais atos** praticados pelo outorgado dispensam novo reconhecimento de firma em cartório.

**Base legal.**

- [REF-CONTRAN-900] art. 2º §2º: _"A parte legítima de que trata o caput poderá ser representada por
  procurador legalmente habilitado ou por instrumento de procuração, na forma da lei, sob pena do não
  conhecimento da defesa prévia ou do recurso."_
- [REF-CONTRAN-900] art. 5º, IV e V: documentos exigíveis — comprovação de representação (pessoa
  jurídica) e procuração, quando for o caso.
- [REF-DETRANAM-PORTARIA-5046] art. 2º, I (dispensa de reconhecimento de firma, com autenticação pelo
  servidor); art. 2º §2º (procuração pública **ou particular** com firma reconhecida por
  autenticidade, salvo atos personalíssimos); §5º (prazo de validade e poderes específicos); §7º
  (dispensa de novo reconhecimento para os atos subsequentes).
- [REF-DETRANAM-PORTARIA-5046] art. 1º: base na Lei 13.726/2018 — supressão de formalidades cujo
  custo supere o risco de fraude.

**Verificação.** O PORTAL apresenta **duas** vias equivalentes de representação (procuração pública;
procuração particular + reconhecimento por autenticidade), com a segunda descrita como realizável no
atendimento do próprio DETRAN-AM. A triagem valida presença de procuração, prazo de validade vigente
e poderes específicos; ausência dessas condições gera **não conhecimento** ([RN-RAIT-001]).

**Oportunidade de conformidade — contradição a corrigir.** A carta de serviço "Recurso à JARI"
([REF-DETRANAM-SERVICOS]) sinaliza a exigência de **endosso em cartório do AM** para documentos
autenticados em cartório de outro estado. Essa exigência **não decorre** da Portaria 5046/2018 — que,
ao contrário, dispensa o reconhecimento cartorial e autoriza a autenticação em balcão. O atrito
onera principalmente requerentes de fora do estado e é **redutível sem qualquer alteração
normativa**, apenas revendo a linguagem da carta de serviço e o checklist do PORTAL. Encaminhado ao
UX e registrado em `_intake/legal-assessment.md`, item 15.

**Decisões.** Owner, em steering (`_meta/steering.md`, 2026-08-24):

- **D.28** — autoriza a correção imediata da carta de serviço "Recurso à JARI" (exigência de
  endosso cartorial), sem esperar validação jurídica formal. Ver detalhamento em
  [REF-DETRANAM-SERVICOS].
- **C.27** — quanto à Portaria DETRAN-AM 5046/2018 (base normativa desta regra), o Owner optou
  por **citá-la como está**, aceitando o risco da ambiguidade de OCR no nome do signatário, sem
  confirmação adicional por ora.

**Ressalvas que NÃO se aplicam ao RAIT.** O art. 2º §1º (firma obrigatória no verso do CRV/ATPV), o
§3º (cancelamento de comunicação de venda) e o art. 3º, parágrafo único (2ª via de CRV, baixa de
restrição, liberação de veículo removido) da Portaria 5046/2018 tratam de **outros serviços** —
nenhum deles é defesa ou recurso de infração. Não importar essas exigências para o fluxo do RAIT.

**Due diligence (2026-08-27).** A Portaria 281/2022/DP/DETRAN-AM altera a 5046/2018, mas **apenas o
art. 3º** (regime de despachante documentalista e requisitos de 2ª via de CNH) — o art. 2º, base
integral desta regra, está intocado. Confirmado por leitura do texto nativo do PDF, artigo por
artigo. Ver [REF-DETRANAM-PORTARIA-281-2022]. Esta regra continua válida sem correção.
