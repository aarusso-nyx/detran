---
id: RN-RAIT-124
title: SNE — único meio tecnológico hábil de notificação eletrônica e ciência ficta em 30 dias
status: draft
apps: [rait, portal]
sources: [REF-CONTRAN-931, REF-CTB-280-290]
updated: 2026-08-24
---

**Regra.** O **Sistema de Notificação Eletrônica (SNE)** é o **único meio tecnológico hábil**, de que
trata o _caput_ do art. 282 do CTB, admitido para assegurar a ciência das notificações de infrações
de trânsito. Opera **mediante adesão prévia** e é certificado digitalmente (ICP-Brasil). Regras
essenciais:

| Aspecto                    | Regra                                                                                                                                                                                                                                |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Ciência ficta              | O proprietário ou condutor autuado é considerado notificado **30 dias após a inclusão da informação no sistema e o envio da respectiva mensagem**                                                                                    |
| Irrelevância da leitura    | **Independentemente do acesso regular ao SNE**, prevalecem os prazos estabelecidos nas notificações nele disponibilizadas                                                                                                            |
| Substituição               | A utilização do SNE **substitui qualquer outra forma de notificação para todos os efeitos legais**                                                                                                                                   |
| Cadastro                   | O aderente deve manter cadastro atualizado, com **e-mail e telefone celular** para alertas                                                                                                                                           |
| Responsabilidade de acesso | O acesso é de **exclusiva responsabilidade do usuário**, que responde por todos os atos praticados no sistema                                                                                                                        |
| Cancelamento               | Por iniciativa do usuário, ou do órgão desde que justificado; após comunicação de venda/transferência, o vínculo do proprietário anterior é cancelado. **As notificações já disponibilizadas até o cancelamento permanecem válidas** |
| Retenção                   | Preservação e integridade dos dados publicados eletronicamente pelo **prazo mínimo de 5 anos**                                                                                                                                       |

**Base legal.**

- [REF-CONTRAN-931] art. 2º, _caput_ e parágrafo único: _"O SNE é o único meio tecnológico hábil, de
  que trata o caput do art. 282 do Código de Trânsito Brasileiro (CTB), admitido para assegurar a
  ciência das notificações de infrações de trânsito…"_
- [REF-CONTRAN-931] art. 4º, §§3º a 8º; art. 8º, _caput_, §§1º e 2º; art. 12.
- [REF-CTB-280-290] art. 282-A, _caput_ e §§1º a 4º.
- [REF-CONTRAN-931] art. 5º: considera-se **expedida** a notificação de autuação, para o prazo de 30
  dias do art. 281 do CTB, _"a efetiva disponibilização da notificação no SNE, devendo essa informação
  ser registrada no sistema"_.

**Verificação.** O RAIT registra separadamente `data_disponibilizacao_sne`, `data_envio_mensagem` e
`data_ciencia_ficta` (= disponibilização + envio + 30 dias) — ver [RN-RAIT-104]. Retenção mínima de
5 anos aplicada como **piso** da política de retenção de eventos e documentos de notificação do
RAIT/PORTAL.

**Controvérsia/risco.** O SNE é sistema **da União** (coordenação do órgão máximo executivo de
trânsito da União — [REF-CTB-280-290] art. 282-A §4º; [REF-CONTRAN-931] art. 1º). O DETRAN-AM é
aderente, não operador: a disponibilidade, a latência e a rastreabilidade dos eventos que iniciam
prazos dependem de um sistema **fora do controle do projeto**. Toda regra de prazo ancorada no SNE
depende de integração confiável e de trilha de auditoria própria do lado do DETRAN-AM — do contrário
o órgão não terá como provar a data de ciência ficta em caso de litígio.
