# _intake — propostas geradas na mineração TEAT (2026-08-24)

Itens que não couberam nos artefatos por exigirem edição de arquivos compartilhados
(`shared/glossary.md`, `shared/actors.md`) ou decisão de escopo do owner. Não editados
diretamente por regra de fronteira desta sessão (write-only em `inf/teat/**` e `est/boat/**`).

## Glossário (`shared/glossary.md`) — termos a incluir

- **Talão eletrônico** já existe; sugerir nota adicional citando [REF-CONTRAN-918] art. 3º §6º
  (definição textual: "sistema informatizado (software) instalado em equipamentos preparados para
  esse fim ou no próprio sistema de registro do órgão autuador").
- **Faixa de numeração de AIT** — intervalo de números controlado por série/órgão do qual
  subintervalos são reservados a dispositivos para operação offline. Fonte:
  `teat:docs/framework/product/blueprints/BP-OFFLINE-SYNC-001.json`.
- **Reserva de numeração offline** — subintervalo alocado a um agente+dispositivo com validade
  temporal, consumido ao finalizar atos localmente. Mesma fonte.
- **Cadeia de custódia (evidência)** — sequência apensa de eventos que comprova a integridade e o
  histórico de manuseio de uma evidência digital vinculada a um ato legal. Fonte:
  `teat:docs/framework/product/blueprints/BP-EVIDENCE-CUSTODY-001.json`.
- **Pacote probatório** — reunião imutável de evidências, hashes, assinaturas, logs e protocolos
  de um ato legal, usada para instruir defesa/recurso. Mesma fonte.
- **Pacote normativo mobile** — versão distribuível do catálogo normativo ativo, instalada no
  dispositivo e referenciada por todo ato legal criado sob sua vigência. Fonte:
  `teat:docs/framework/product/blueprints/BP-NORMATIVE-CATALOG-001.json`.
- **Homologação (dispositivo/aplicativo)** — registro formal que autoriza um par
  dispositivo+versão de aplicativo a operar lavratura legal. Fonte:
  `teat:docs/framework/product/blueprints/BP-MOBILE-OPERATIONS-001.json`.
- **Constatação sem abordagem** — modalidade de lavratura em que a infração é registrada sem
  contato direto com o condutor, exigindo motivo/justificativa conforme a regra do
  enquadramento. Fonte: `teat:docs/meta/prototypes/docs/GL-1_Glossario_Talonario_Eletronico.md`
  (prototype — status evidência).

## Atores (`shared/actors.md`) — a reconciliar

- `shared/actors.md` hoje lista "Agente de trânsito" e "Autoridade de trânsito" apenas. TEAT
  define **9 papéis de RBAC** (field-agent, field-supervisor, processing-operator,
  traffic-authority, auditor, agency-admin, technical-admin, bi-analyst, integration-operator —
  ver [APP-TEAT] §Atores). Sugere-se ao owner decidir se `shared/actors.md` deve espelhar os 9
  papéis granulares ou manter a visão agregada atual (a tabela shared serve múltiplos apps, então
  granularidade excessiva pode não ser desejável — decisão de escopo, não técnica).
- O corpus de protótipo (`AJ-1_Atores_e_Jornadas_Talonario_Eletronico.md`) lista 12 atores
  humanos internos, incluindo 3 sem papel de RBAC correspondente no MVP (Suporte técnico, Gestor
  de contratos/fiscal técnico, Encarregado de dados/DPO). Backlog: confirmar com owner se esses
  papéis devem ganhar RBAC próprio em ondas futuras ou permanecem fora do MVP.

## Backlog (`_meta/backlog.md`) — pesquisa pendente

- [ ] (fonte pendente) requisitos legais específicos do talão eletrônico além de
      [REF-CONTRAN-918] art. 3º — fé pública do agente, formato mínimo do AIT impresso, exigências de
      homologação de equipamento perante o órgão de trânsito (CONTRAN/DENATRAN). Nenhum excerto
      normativo localizado no corpus TEAT lido.
- [ ] (fonte pendente) base legal para o mecanismo de saneamento de AIT (correção formal
      pós-lavratura) — hoje é doutrina operacional de TEAT, sem excerto de CONTRAN/CTB associado.
- [ ] (fonte pendente) catálogo fechado de valores de `no_approach_reason` (motivos aceitos de
      constatação sem abordagem) — hoje campo de texto livre.
- [ ] (fonte pendente) condições e ator autorizado a cancelar um AIT finalizado antes do envio
      (`CANCELADO` em [WF-TEAT-001]) — não documentado nas fontes lidas.
- [ ] (fonte pendente) mecanismo de devolução de números não utilizados de reserva expirada à
      faixa de numeração ([WF-TEAT-002]).
- [ ] Risco técnico registrado em `teat:docs/framework/product/workflows/offline-sync.md`:
      constraints de exclusão de intervalo de numeração ainda **não implementadas em nível de banco
      de dados** (apenas validação de aplicação) — monitorar até resolução, pode afetar garantia de
      não sobreposição sob concorrência real.
- [ ] (fonte pendente) comportamento do dispositivo quando o pacote normativo expira em campo sem
      conectividade para atualização (bloqueio de nova lavratura vs. continuidade com aviso).
- [ ] Confirmar se assinatura de testemunha (mencionada no corpus de protótipo, UC-1.122) terá
      entidade própria no runtime oficial — não modelada nos blueprints lidos.
