---
id: RN-PEC-115
title: Credenciamento de entidades e profissionais — vigência de um ano, comprovação bienal, titulação de especialista e obrigações estatísticas periódicas
status: draft
apps: [pec, dashboard]
sources:
  [
    REF-CONTRAN-927-2022,
    REF-CTB-147-148-habilitacao,
    REF-DETRANAM-PORTARIA-005-2021,
    REF-DETRANAM-PORTARIA-008-2021,
  ]
updated: 2026-08-27
---

**Regra.** A capacidade de produzir laudo válido depende de **dois atos habilitantes com ciclo de
vida próprio**, hoje inexistentes no corpus PEC:

**1. Credenciamento da entidade** (pelo órgão executivo de trânsito do Estado):

- **vigência de 1 (um) ano**, renovável sucessivamente;
- **comprovação bienal** do cumprimento dos requisitos dos arts. 17 a 24;
- obrigação de remeter ao órgão, **até o 20º dia do mês subsequente**, a estatística do mês
  anterior;
- **retenção de 5 anos dos laudos após o descredenciamento** ([REF-DETRANAM-PORTARIA-005-2021] art.
  21, parágrafo único) — ver [RN-PEC-141].

**2. Habilitação do profissional:**

- **médico** com Título de Especialista em Medicina de Tráfego reconhecido pelo CFM, ou Residência
  concluída em Medicina de Tráfego;
- **psicólogo** com Título de Especialista em Psicologia do Trânsito reconhecido pelo CFP;
- a **carência** que permitia exercer sem titulação **expirou em 12/04/2024** — não há mais regime
  de transição;
- desde a Lei 15.428/2026, a exigência de titulação tem **assento legal** (CTB art. 148, § 6º), que
  acrescenta ainda a **autorização pelo órgão máximo executivo de trânsito da União**.

**3. Preço.** A partir da Lei 15.428/2026, os valores dos exames observam **preço público fixado
pelo órgão máximo executivo de trânsito da União**, atualizado anualmente pelo **IPCA** — o preço
do exame **não é parâmetro da clínica nem do Estado**.

**Base legal.**

- [REF-CONTRAN-927-2022] art. 16, § 2º: _"O prazo de vigência do credenciamento será de um ano,
  podendo ser renovado sucessivamente [...]"_; § 3º: _"A cada dois anos, as entidades credenciadas
  [...] deverão comprovar o cumprimento do disposto nos arts. 17 a 24 [...]"_.
- [REF-CONTRAN-927-2022] art. 19, II e III (titulação de especialista) e § 1º (carência até
  **12 de abril de 2024**).
- [REF-CONTRAN-927-2022] art. 23 (estatística mensal, até o vigésimo dia do mês subsequente) e art.
  24 (estatística anual do Estado à União, até o último dia de fevereiro).
- [REF-CTB-147-148-habilitacao] art. 148, § 6º e § 7º _(Incluídos pela Lei nº 15.428, de 2026)_.
- [REF-DETRANAM-PORTARIA-005-2021] art. 28-A (estatística mensal, dia 20 — espelho estadual), art.
  34, § 10 (mesma carência de 12/04/2024) e art. 21, parágrafo único (retenção de 5 anos).

**Verificação.**

1. **Credenciamento com vencimento é um invariante de emissão de laudo.** Um laudo assinado por
   profissional ou em entidade com credenciamento vencido é ato praticado por quem não podia
   praticá-lo. O PEC precisa de `valid_from`/`valid_to` na clínica **e** no vínculo do profissional,
   verificados **no momento da assinatura** — mesma classe de verificação que [RN-PEC-002] já faz
   para o certificado ICP-Brasil (OCSP/CRL). Hoje não há evidência dessa verificação no corpus.
2. **Ciclo administrativo completo ausente.** Credenciar, renovar (anual), comprovar (bienal),
   suspender, descredenciar — nenhum UC-PEC cobre. [APP-PEC] §Escopo/Dentro lista _"credenciamento
   de clínicas e profissionais"_, mas nenhum artefato o modela. É um módulo, não uma regra.
3. **Estatística mensal (dia 20) e anual (fevereiro)** são obrigações periódicas com destinatário e
   prazo — candidatas naturais a [APP-DASHBOARD], não ao PEC clínico. O modelo do relatório é o dos
   Anexos da Res. 927/2022 (**não capturados**, ver [RN-PEC-105] item 3).
4. **O preço público federal (art. 148, § 7º) invalida qualquer tabela de preço local** no módulo de
   faturamento previsto em [APP-PEC] §Escopo. É achado de 2026 que nenhum artefato reflete.
5. **A carência expirada** implica que a base de peritos ativos deve ser auditada: qualquer perito
   sem título de especialista está irregular desde 12/04/2024.

**Controvérsia/risco.** _Severidade: média._ (a) A **articulação entre o credenciamento estadual**
(Res. 927/2022 art. 16) **e a autorização federal do perito** (CTB art. 148, § 6º, 2026) não é
explicada por nenhuma norma capturada — se a autorização federal for constitutiva, há um segundo
atributo habilitante que nenhum cadastro do PEC possui (ver [RN-PEC-101]). (b) O regime de
credenciamento do DETRAN-AM também aparece na [REF-DETRANAM-PORTARIA-008-2021], recuperada e lida
na íntegra. Ela disciplina o programa CNH Social e **não contém** os dispositivos que se temia
conflitarem com a Portaria 001/2019 emendada pela 005/2021; a leitura textual aponta regimes
paralelos, não substituição. Mantém-se risco médio até confirmação institucional da coexistência e
captura de atos supervenientes, mas o antigo risco baseado em documento ausente está encerrado.
Ver também [RN-PEC-155], [RN-PEC-156] e [RN-PEC-157].
