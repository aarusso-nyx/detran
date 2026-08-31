# _intake — propostas geradas na mineração BOAT/sinistro (2026-08-24)

Itens que não couberam nos artefatos por exigirem edição de arquivos compartilhados ou decisão de
escopo do owner. Não editados diretamente por regra de fronteira desta sessão (write-only em
`inf/teat/**` e `est/boat/**`).

## Glossário (`shared/glossary.md`) — refinamento sugerido

- **RENAEST** já existe na tabela compartilhada com fonte "(fonte pendente)". Sugere-se
  atualizar a fonte para referenciar [WF-BOAT-001] (máquina de estados
  RECEBIDO→EM_ANALISE→{CONSOLIDADO|REJEITADO}, fonte: senatran-mock contracts) e anotar
  explicitamente que **não há confirmação normativa** (CONTRAN/CTB) da base RENAEST no corpus
  lido — apenas evidência de contrato técnico de integração/mock. Decisão de manter/editar cabe
  ao owner do arquivo compartilhado.
- Sugerir novo termo **Gravidade do sinistro** — classificação de vítima/sinistro
  (`SEM_VITIMA`/`COM_VITIMA_FERIDA`/`COM_VITIMA_FATAL` no contrato RENAEST; `severity` livre no
  modelo TEAT/BOAT) que direciona exigência de dados de vítima na submissão nacional — ver
  [RN-BOAT-002].

## Atores (`shared/actors.md`) — a reconciliar

- O escopo original de BOAT (rascunho anterior de `APP.md`) mencionava "parceiro conveniado"
  (saúde, rodovias, seguradoras) como ator de intake de sinistro. **Nenhuma fonte lida em `teat`
  confirma esse papel com RBAC próprio** — `BP-CRASH-RECORDS-001.json` usa os mesmos 5 papéis do
  núcleo TEAT (field-agent, field-supervisor, processing-operator, traffic-authority, auditor).
  Backlog: confirmar com owner se "parceiro conveniado" é visão de produto futura (fora do MVP
  atual do corpus) ou se deve ser removida da narrativa de missão.

## Backlog (`_meta/backlog.md`) — pesquisa pendente

- [ ] (fonte pendente) base normativa (CONTRAN/CTB/portaria SENATRAN) para a existência e as
      regras de submissão da base RENAEST — nenhum excerto normativo localizado; toda a evidência
      encontrada é de contrato técnico (`senatran` mock), não de texto legal. Prioridade 2 no
      backlog já existente cobre este item ("BOAT: RENAEST/registro nacional de sinistros — normas de
      notificação de acidentes").
- [ ] (fonte pendente) mapeamento campo-a-campo confirmado entre entidades TEAT/BOAT
      (`CrashRecord`/`CrashVehicle`/`CrashPerson`/`CrashVictim`) e o payload RENAEST
      (`SinistroRequest`/`veiculos`/`pessoas`/`vitimas`) — hoje inferido por nome, sem adaptador
      implementado observado nas fontes lidas (`teat:docs/adopters/integrations/adapters/renaest.md`
      descreve o contrato em nível de tipo de campo, não um mapeamento verificado).
- [ ] (fonte pendente) condições e ator autorizado para `CANCELADO` no registro local de sinistro
      — não documentado nas fontes lidas.
- [ ] (fonte pendente) mecanismo de correção de um registro nacional RENAEST já
      `CONSOLIDADO`/`REJEITADO` (estado terminal, sem complemento/correção aceitos pelo mock) — não
      há fluxo alternativo descrito nas fontes lidas.
- [ ] UC-1.245 (danos materiais) e UC-1.246 (testemunhas) não receberam UC completo dedicado
      nesta rodada — avaliar se merecem UC próprio ou se cabem como extensão de [UC-BOAT-002].
- [ ] UC-1.251 (relatório preliminar de sinistro) — não modelado como documento/entidade própria
      nas fontes de blueprint lidas (sem `DocumentTemplate` equivalente ao normativo do TEAT
      confirmado para sinistro); avaliar se usa o mesmo `DocumentTemplate` do catálogo normativo TEAT
      ou é artefato próprio.
- [ ] Risco de integridade referencial já registrado: `crash_record_id` em medidas
      administrativas é referência **sem FK rígida** até estabilização da integração (nota explícita
      em `teat:docs/framework/product/workflows/crash-records.md`) — mesmo ponto citado em
      [WF-BOAT-001], reafirmado aqui para visibilidade de backlog.
- [ ] Editor de croqui dedicado ainda não existe — `crash-records.md` nota que
      `drawing_json` estruturado é aceito "until a dedicated sketch editor exists"; acompanhar
      evolução.
