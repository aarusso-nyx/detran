---
id: RN-RAIT-109
title: Recurso intempestivo ou de parte ilegítima — sem efeito suspensivo; o intempestivo é arquivado
status: draft
apps: [rait, portal]
sources: [REF-CTB-280-290, REF-CONTRAN-900, REF-LEI-9784-1999]
updated: 2026-08-24
---

**Regra.** O recurso **intempestivo** ou interposto por **parte ilegítima** não tem efeito
suspensivo — a proteção de [RN-RAIT-108] não se instaura. Além disso, o recurso **intempestivo é
arquivado**. O não conhecimento por qualquer dos fundamentos de [RN-RAIT-001] **não impede** a
Administração de rever de ofício ato ilegal, desde que não ocorrida preclusão administrativa.

**Base legal.**

- [REF-CTB-280-290] art. 285 §1º: _"O recurso intempestivo ou interposto por parte ilegítima não terá
  efeito suspensivo."_
- [REF-CTB-280-290] art. 285 §5º: _"O recurso intempestivo será arquivado."_
- [REF-CONTRAN-900] art. 4º, I e II: não serão conhecidos os apresentados fora do prazo legal ou sem
  comprovação da legitimidade.
- [REF-LEI-9784-1999] art. 63 §2º (subsidiário): _"O não conhecimento do recurso não impede a
  Administração de rever de ofício o ato ilegal, desde que não ocorrida preclusão administrativa."_
- [REF-LEI-9784-1999] art. 63 §1º (subsidiário): recurso perante órgão incompetente → indica-se ao
  recorrente a autoridade competente, **devolvendo-se o prazo**.

**Verificação.** A triagem de admissibilidade marca `efeito_suspensivo = false` e, no caso de
intempestividade, encerra o caso em `NAO_CONHECIDO` com `motivo_nao_conhecimento='intempestivo'`
e `arquivado=true` ([WF-RAIT-001] §Vocabulário canônico), sem passar por distribuição a relator. A decisão de não conhecimento é comunicada ao recorrente com fundamento explícito
([RN-RAIT-130]). Casos de incompetência do órgão receptor abrem tarefa de **redirecionamento com
devolução de prazo**, não de arquivamento.

**Controvérsia/risco.** O CTB manda arquivar o intempestivo (§5º) mas **não** manda arquivar o de
parte ilegítima — para este, o §1º prevê apenas a perda do efeito suspensivo, e o não conhecimento
vem da Res. 900 art. 4º, II. São desfechos com fundamento normativo de hierarquia diferente
(lei × resolução); o RAIT deve registrá-los como motivos distintos de não conhecimento, e não
uniformizá-los sob "arquivamento". A ressalva do art. 63 §2º da Lei 9.784/1999 é aplicação
**subsidiária** ([REF-LEI-9784-1999] art. 69) — a revisão de ofício deve ser tratada como faculdade
excepcional e motivada, nunca como fluxo padrão.
