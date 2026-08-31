---
id: RN-PEC-002
title: Assinatura digital de laudo exige PAdES + TSA (ICP-Brasil) com validação OCSP/CRL
status: draft
apps: [pec]
sources:
  - pec:docs/framework/pec/signatures.md
  - pec:docs/framework/pec/rbac-matrix.md
  - REF-MP-2200-2-2001
  - REF-LEI-14063-2020
  - REF-CFM-1821-2007
  - REF-LEI-13787-2018
  - REF-CTB-147-148-habilitacao
updated: 2026-08-24
---

**Regra.** Todo laudo clínico deve ser assinado com PAdES usando um certificado ICP-Brasil
qualificado do profissional signatário (Médico ou Psicólogo, conforme o tipo do exame), com
um carimbo de tempo (TST) de uma TSA autorizada embutido. O certificado do signatário deve ser
validado via OCSP no momento da assinatura, com CRL como mecanismo de fallback se o OCSP
estiver indisponível. `sha256`, `signer_name`, `signer_identifier`, `signer_council` (CRM ou
CRP), `signed_at`, `tsa_time` e a fonte de validação (`ocsp_status`) são persistidos junto ao
laudo. Reassinatura do mesmo conteúdo (mesmo `sha256`) é evitada — reutilizam-se evidências
existentes.

**Base legal.** _(Resolvida na rodada LEGAL de 2026-08-24 — deixa de ser "(fonte pendente)".)_
Quatro fundamentos independentes sustentam o patamar **qualificado**, detalhados em [RN-PEC-142]:

- [REF-LEI-14063-2020] art. 4º, III: _"assinatura eletrônica qualificada: a que utiliza certificado
  digital, nos termos do § 1º do art. 10 da Medida Provisória nº 2.200-2"_; § 1º: _"nível mais
  elevado de confiabilidade"_.
- [REF-LEI-14063-2020] art. 5º, § 5º: _"No caso de conflito entre normas vigentes [...] prevalecerá
  o uso de assinaturas eletrônicas qualificadas."_
- [REF-MP-2200-2-2001] art. 10, § 1º: presunção legal de veracidade em relação aos signatários,
  privativa do certificado ICP-Brasil.
- [REF-CFM-1821-2007] art. 5º: _"Como o 'Nível de garantia de segurança 2 (NGS2)' exige o uso de
  assinatura digital [...] está autorizada a utilização de certificado digital padrão ICP-Brasil"_;
  art. 4º: o nível inferior (NGS1) **não** autoriza eliminar o papel, _"por falta de amparo legal"_.
- [REF-LEI-13787-2018] art. 2º, § 2º: uso de certificado ICP-Brasil no tratamento do prontuário.
- [REF-CTB-147-148-habilitacao] art. 147, § 1º: _"Os resultados dos exames e **a identificação dos
  respectivos examinadores** serão registrados no RENACH"_ — `signer_name` e `signer_council` não
  são apenas evidência de assinatura: são **cumprimento de obrigação legal**, e por isso não podem
  ser opcionais nem anonimizáveis.

**Nuance de qualificação (ver [RN-PEC-142]).** O piso legal do art. 14 da Lei 14.063/2020, para
documento eletrônico de profissional de saúde, é a assinatura **avançada OU qualificada**; o art. 13,
mais estrito (só qualificada), alcança receituários controlados e **atestados médicos**. Se o laudo
de aptidão for equiparado a atestado médico — tese defensável —, a assinatura qualificada passa de
prudência a **exigência legal direta**. A prática atual do PEC é segura sob qualquer das leituras.

**Verificação.** Verificação recomputa o SHA-256 e compara ao valor persistido; valida a
assinatura PAdES e a cadeia de certificação ICP-Brasil; valida `tsa_time` e o status do
certificado via OCSP/CRL. Falha na verificação de presença do profissional (biometria de
encerramento, [RN-PEC-005]) bloqueia a assinatura antes mesmo de chegar a esta etapa. Ver
[UC-PEC-006].

**Lacunas identificadas na auditoria legal (2026-08-24).**

1. **Habilitação do signatário não é verificada.** A regra valida o **certificado**, não o
   **credenciamento**: um laudo assinado por profissional cujo credenciamento (vigência de 1 ano) ou
   cujo título de especialista esteja irregular é ato de quem não podia praticá-lo. Verificação
   exigida por [RN-PEC-115], no mesmo momento em que já se consulta o OCSP.
2. **Preservação de longo prazo.** O prontuário deve durar **20 anos** ([RN-PEC-141]) — prazo que
   excede a validade de qualquer certificado ICP-Brasil. Sem carimbos de tempo sucessivos
   (PAdES-LTA), ao fim do período o laudo estará conservado mas **não verificável**. TSA/OCSP tornam-se
   indispensáveis por essa razão, não por exigência textual das leis de assinatura.
3. **Certificado institucional não satisfaz** — o art. 13/14 da Lei 14.063/2020 exige assinatura _do
   profissional de saúde_.

**Revisão (2026-08-24, especialista LEGAL).** Base legal preenchida; nenhuma correção de mérito —
a regra é **confirmada**, e opera no patamar mais alto disponível. Acrescentadas a nuance art. 13 ×
art. 14 e as três lacunas acima.
