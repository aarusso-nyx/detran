---
id: RN-TEAT-143
title: Convênio e delegação — a cadeia de competência e de homologação deve ser auditável ponta a ponta
status: draft
apps: [teat]
sources:
  [
    REF-CONTRAN-985-1003-MBFT,
    REF-DETRANAM-TALAO-BODYCAM,
    REF-DETRANPR-CONV-224-2022,
    REF-SENATRAN-997,
  ]
updated: 2026-08-24
---

**Regra.** Os órgãos e entidades executivos do Sistema Nacional de Trânsito **poderão celebrar
convênio delegando as atividades previstas no CTB**. Quando o `field-agent` é policial militar,
guarda municipal ou agente de órgão policial legislativo, sua competência para lavrar **deriva do
convênio**, não do cadastro no sistema ([RN-TEAT-104]). Em consequência, três vínculos precisam
existir e ser auditáveis por ato legal lavrado sob delegação: (a) o **instrumento de convênio**
vigente que habilita a categoria; (b) a **homologação SENATRAN do software** utilizado
([RN-TEAT-117]); e (c) a **autorização do dispositivo/versão** empregado ([RN-TEAT-003]) — inclusive
quando o parque de equipamentos pertencer à corporação conveniada, e não ao órgão de trânsito. O
modelo de convênio de outro estado confirma que a comprovação de homologação do talonário é
**cláusula contratual** do instrumento de delegação.

**Base legal.**

- [REF-CONTRAN-985-1003-MBFT] Seção 10: _"Os órgãos e entidades executivos do SNT poderão celebrar
  convênio delegando as atividades previstas no CTB, com vistas à maior eficiência e à segurança
  para os usuários da via."_
- [REF-CONTRAN-985-1003-MBFT] Seção 4, incisos III e V (policiais militares e agentes
  Câmara/Senado _"quando firmado convênio"_, com remissão ao art. 23, III e ao art. 25-A do CTB);
  _"não bastando mera designação mediante portaria ou outro ato administrativo"_.
- [REF-DETRANPR-CONV-224-2022] (cláusula padrão do plano de trabalho): _"6. Quando utilizado
  TALONÁRIO ELETRÔNICO aprovado pela SENATRAN, [o Município conveniado deverá comprovar]
  documentação referente a homologação do equipamento e do respectivo software;"_
- [REF-SENATRAN-997] art. 5º (homologação do software) e Anexo II, i) (o software deve identificar
  o equipamento e impedir uso não autorizado).
- [REF-DETRANAM-TALAO-BODYCAM] §3 (**fonte secundária**): convênio DETRAN-AM/Polícia Militar,
  operacionalizado pelo **BPTRAN**, com agentes do batalhão autorizados a operar o mesmo aplicativo
  usado pelos agentes do DETRAN-AM.

**Verificação.** `agency-admin` parametriza órgão/unidade/**convênio**/competência territorial
([APP-TEAT]). Esta regra torna o convênio **dado do ato legal**, não apenas do cadastro: o AIT
lavrado por agente conveniado deve poder demonstrar, anos depois, sob qual instrumento e em qual
vigência foi lavrado — porque a expiração do convênio retira a competência e, com ela, a validade
dos autos posteriores. O parque de dispositivos da corporação conveniada entra no mesmo controle
de `OperationalDevice`/`ApplicationVersion` ([RN-TEAT-003]); dispositivo não autorizado não lavra,
independentemente de quem seja o proprietário do aparelho.

**Controvérsia/risco.** **O instrumento formal do convênio DETRAN-AM/BPTRAN não foi localizado** —
número, data, vigência e cláusulas são desconhecidos, e a existência do convênio está confirmada
apenas por notícias institucionais ([REF-DETRANAM-TALAO-BODYCAM] §3, §Gaps). Como a competência do
agente conveniado **deriva** desse instrumento, a lacuna alcança a legitimidade de uma fatia da
autuação. Obtenção por canal não público (ofício/SIC ao DETRAN-AM) é recomendação de prioridade
alta. Item 44 de `_intake/legal-assessment.md`.
