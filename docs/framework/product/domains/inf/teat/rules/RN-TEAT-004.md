---
id: RN-TEAT-004
title: AIT finalizado é imutável — content_hash protege o conteúdo legal congelado
status: draft
apps: [teat]
sources:
  [
    'teat:law/invariants/INV-AIT-001.json',
    'teat:docs/framework/product/blueprints/BP-AIT-LIFECYCLE-001.json',
    'teat:docs/framework/product/workflows/ait-lifecycle.md',
    'teat:docs/meta/prototypes/docs/RN-1_Regras_de_Negocio_Talonario_Eletronico.md',
    'REF-CONTRAN-918',
    REF-SENATRAN-997,
    REF-CONTRAN-985-1003-MBFT,
  ]
updated: 2026-08-24
---

> **Nota de revisão (2026-08-24, especialista LEGAL).** Regra **confirmada**, com **upgrade de
> fonte**: a imutabilidade pós-lavratura deixou de repousar na base genérica do art. 3º da Res.
> 918/2022 e passou a ter comando expresso e específico ([REF-SENATRAN-997] art. 3º, V e Anexo II,
> b). A independência entre o destino do AIT e o da medida administrativa, antes inferida, ganhou
> fonte doutrinária explícita e **simétrica** ([REF-CONTRAN-985-1003-MBFT] Seção 8) e regra própria
> ([RN-TEAT-123]). Acrescentado o piso legal de retenção local do ato no equipamento, que
> condiciona políticas de expurgo e de remote wipe.

**Regra.** Ao finalizar (`POST /v1/ait-lifecycle/aits/:id/finalize`), o backend congela o
conteúdo legal do AIT e computa `content_hash`. A partir daí número, autor, timestamps,
localização, snapshot de veículo, vínculos de condutor/pessoa, enquadramento, versão normativa,
hash, vínculos de custódia e histórico de status tornam-se **imutáveis**: o sistema pode
processar, rejeitar, corrigir por procedimento administrativo autorizado (`AitCorrection`,
saneamento) ou apensar histórico de status — nunca reescrever silenciosamente o ato finalizado.
Um AIT confirmado não pode ser editado diretamente pelo agente no dispositivo móvel. A impressão
do AIT é comprovante, não condição de existência válida do ato digital — falha de impressão gera
evento e reimpressão controlada, sem duplicar o ato.

**Base legal.**

- [REF-SENATRAN-997] art. 3º, V (**fonte específica e direta**): o talão eletrônico deverá _"ser
  dotado de elementos de segurança que garantam a fidelidade e integridade dos dados registrados e
  **impeçam sua alteração após o término da lavratura do AIT**"_; reiterado no Anexo II, b).
- [REF-SENATRAN-997] Anexo III, b): _"O AIT deverá permanecer armazenado no equipamento, no mínimo,
  durante o dia da lavratura do AIT, de modo a viabilizar sua reimpressão por meio do equipamento,
  conforme quantidade de vias necessárias, em momento diverso do da autuação"_ — piso legal de
  retenção local que sustenta a reimpressão controlada e **limita** políticas de expurgo e de
  remote wipe. Ver [RN-TEAT-116].
- [REF-CONTRAN-918] art. 3º — o AIT é o documento que dá início ao processo administrativo de
  imposição de punição (art. 2º, I); sua integridade é pressuposto para que valha como base do
  processo (e, quando aplicável, como NA — art. 3º §5º, ver [RN-TEAT-107]).
- [REF-CONTRAN-985-1003-MBFT] Seção 8 (independência recíproca AIT × medida administrativa):
  _"A ausência de registro no AIT da medida administrativa adotada ou a impossibilidade de sua
  aplicação ou conclusão não invalidam a autuação pela infração de trânsito."_ · _"A eventual
  invalidação, anulação ou arquivamento do AIT não prejudicará, necessariamente, a medida
  administrativa aplicada pelo agente da autoridade de trânsito."_ Detalhado em [RN-TEAT-123].

**Verificação.** [INV-AIT-001] (severidade `constitutional`, aprovação humana obrigatória para
qualquer mudança que quebre o comportamento). Toda correção exige `changed_field`,
`previous_value`, `new_value`, `justification`, `operator_user_ref` e aprovação de
`traffic-authority` (`approved_by_user_ref`) — nunca reabre o auto finalizado no aplicativo de
campo (corpus de protótipo RN-AIT-004/017-020/023/024). Ver fluxo de correção em
[RN-TEAT-006] e [WF-TEAT-001].

**Precisão sobre os limites da correção.** A norma **impede a alteração** do AIT após a lavratura,
sem ressalvar procedimento de correção. O CTB, por sua vez, só oferece o par
"consistente → penalidade" / "inconsistente ou irregular → arquivamento" (art. 281 §1º, I). Logo,
`AitCorrection` **não pode** ser lida como exceção à imutabilidade: ela é um **registro apenso** de
retificação de erro material em elemento não essencial, decidido pela autoridade — o conteúdo
original permanece íntegro e verificável pelo `content_hash`. Alterar elemento essencial é lavrar
auto novo. Ver [RN-TEAT-119], que fixa a fronteira, e [RN-TEAT-121] quanto ao cancelamento
pós-finalização.
