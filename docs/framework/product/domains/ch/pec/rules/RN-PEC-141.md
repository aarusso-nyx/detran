---
id: RN-PEC-141
title: Retenção do prontuário — piso legal de 20 anos a partir do último registro, com três prazos concorrentes de escopos distintos e nenhum responsável definido
status: draft
apps: [pec]
sources:
  [
    REF-LEI-13787-2018,
    REF-DETRANAM-PORTARIA-005-2021,
    REF-CONTRAN-923-1009-toxicologico,
    REF-LEI-13709-2018,
    REF-CONTRAN-927-2022,
  ]
updated: 2026-08-24
---

**Regra.** Nenhum artefato do corpus PEC trata de **por quanto tempo** o laudo, o adendo e o
prontuário são conservados, nem do que acontece depois. A lei trata: **decorrido o prazo mínimo de
20 (vinte) anos a partir do último registro**, os prontuários podem ser eliminados — e a regra
alcança expressamente os prontuários _"constituídos por documentos gerados e mantidos originalmente
de forma eletrônica"_, isto é, exatamente o modelo do PEC.

**Três prazos concorrentes, três escopos distintos — não se substituem:**

| Prazo                                     | Objeto                                                              | Quem guarda                                                           | Base                                      |
| ----------------------------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------- | ----------------------------------------- |
| **20 anos** do último registro (**piso**) | o **prontuário** do paciente                                        | o detentor do prontuário — **indefinido** entre PEC/clínica/DETRAN-AM | Lei 13.787/2018 art. 6º                   |
| **5 anos** após o **descredenciamento**   | **Laudos Médicos e Psicológicos**                                   | a **entidade credenciada** que se descredencia                        | Portaria DETRAN-AM 005/2021 art. 21, p.ú. |
| **5 anos** da realização                  | **resultado eletrônico e material biológico** do exame toxicológico | o **laboratório credenciado**                                         | Res. CONTRAN 923/2022 art. 9º, §§ 1º-2º   |

O prazo de 5 anos do DETRAN-AM **não reduz** o piso de 20 anos: é obrigação adicional de custódia
imposta a quem sai do sistema, não um regime geral de retenção. O prazo do laboratório recai sobre
terceiro e sobre objeto que o PEC não deve sequer possuir ([RN-PEC-122]).

**Modelo de retenção adotado (leitura de trabalho) — duas camadas, invertidas em relação ao BOAT.**
No registro de sinistro ([RN-BOAT-125]) a **eliminação é a regra** e a conservação exige
enquadramento. Aqui a lógica é **oposta**: a **conservação por 20 anos é obrigação legal** — o que
significa que a hipótese do art. 16, I da LGPD (_"cumprimento de obrigação legal ou regulatória pelo
controlador"_) autoriza e **impõe** a guarda identificada durante todo o período. Daí:

1. **Camada obrigatória (0-20 anos):** prontuário **identificado**, íntegro, com laudo assinado,
   adendos e evidências de assinatura. **Não pode ser eliminado, anonimizado nem minimizado** — a
   integridade é o próprio objeto da obrigação, e a assinatura PAdES não sobrevive a alteração de
   conteúdo ([RN-PEC-001]).
2. **Após 20 anos:** a lei abre **três destinos**, e a escolha é do órgão, não do produto —
   **eliminação** (art. 6º, _caput_), **devolução ao paciente** (§ 2º) ou **prazo diferenciado
   fixado em regulamento** (§ 1º). Qualquer que seja, o processo _"deverá resguardar a intimidade do
   paciente e o sigilo e a confidencialidade das informações"_ (§ 3º) — é processo auditável, com
   registro do que foi eliminado e quando, nunca um _script_ silencioso (mesmo critério de
   [RN-BOAT-125]).
3. **A validade da assinatura precisa sobreviver ao prazo.** Vinte anos excedem largamente a validade
   de qualquer certificado ICP-Brasil e da maioria dos algoritmos de _hash_ em uso. Sem
   **preservação de longo prazo** (carimbos de tempo sucessivos — PAdES-LTA), ao fim do período o
   documento estará conservado mas **não verificável**, o que esvazia a própria obrigação.

**Base legal.**

- [REF-LEI-13787-2018] art. 6º: _"Decorrido o prazo mínimo de 20 (vinte) anos a partir do último
  registro, os prontuários em suporte de papel e os digitalizados poderão ser eliminados. § 1º Prazos
  diferenciados [...] poderão ser fixados em regulamento [...]. § 2º Alternativamente à eliminação, o
  prontuário poderá ser devolvido ao paciente. § 3º O processo de eliminação deverá resguardar a
  intimidade do paciente e o sigilo e a confidencialidade das informações. [...] § 5º As disposições
  deste artigo aplicam-se a todos os prontuários de paciente, independentemente de sua forma de
  armazenamento [...], inclusive [...] aos constituídos por documentos gerados e mantidos
  originalmente de forma eletrônica."_
- [REF-DETRANAM-PORTARIA-005-2021] art. 21, parágrafo único (novo): _"[...] manter sob sua guarda e
  sigilo, em ordem e à disposição do DETRAN-AM, os Laudos Médicos e Psicológicos, por no mínimo 05
  (cinco) anos."_
- [REF-CONTRAN-923-1009-toxicologico] art. 9º, §§ 1º e 2º (5 anos, laboratório).
- [REF-CONTRAN-927-2022] art. 10, § 1º (arquivamento conforme os Conselhos Federais).
- [REF-LEI-13709-2018] art. 16, I (conservação autorizada para cumprimento de obrigação legal) e
  art. 15, II (término do tratamento pelo fim do período).

**Verificação.**

1. **Nenhuma regra do PEC trata de retenção hoje** — [RN-PEC-001] trata de imutabilidade, que é
   coisa diversa. Esta regra abre o tema.
2. **"Último registro" é o marco, não a assinatura.** Um adendo emitido cinco anos depois
   ([RN-PEC-001]) **reinicia** o prazo de 20 anos para todo o prontuário. O relógio é do prontuário,
   não do documento.
3. **O objeto retido é o prontuário, não apenas o PDF/A** — inclui adendos, evidências de assinatura
   (`sha256`, `tsa_time`, `ocsp_status`), trilha de auditoria e, na trilha psicológica, os protocolos
   dos testes ([REF-CFP-01-2019] § 21).
4. **A retenção convive com o direito de eliminação do titular?** Não o afasta, mas o **limita**: a
   LGPD art. 16, I autoriza a conservação para cumprimento de obrigação legal, e o pedido de
   eliminação (art. 18, VI) não alcança dado cuja guarda é legalmente imposta ([RN-PEC-153]).
5. **`pec.documents`/`pec.reports` precisam de política de ciclo de vida explícita** — hoje não há
   evidência de qualquer política no corpus.

**Controvérsia/risco.** _Severidade: alta — item nº 3 da lista de validação humana._ Quatro questões
abertas: (a) **quem é o responsável** pelos 20 anos — a clínica credenciada (que pode descredenciar-se
e, aí, só deve 5 anos), o DETRAN-AM (que não é prestador de saúde) ou a plataforma PEC (que não é
sujeito de direito)? **Nenhuma norma responde**, e a resposta determina onde o dado mora e quem
responde por perdê-lo; (b) o prazo depende da premissa de que o laudo pericial é **"prontuário de
paciente"** ([RN-PEC-140], controvérsia (b)) — se um parecer afastar essa qualificação, o piso de 20
anos cai e **não há prazo substituto**, restando apenas os 5 anos estaduais; (c) o § 1º admite prazos
diferenciados **em regulamento** — não foi localizado regulamento aplicável, mas ele pode existir e
alterar o número; (d) **preservação criptográfica de longo prazo** é requisito técnico derivado, não
mencionado por norma alguma, e sem ele a conformidade é apenas aparente. Recomenda-se decisão formal
do Owner com apoio do Encarregado do DETRAN-AM **antes** de consolidar o modelo de armazenamento.
Item 6 de `_intake/legal-assessment.md`.
