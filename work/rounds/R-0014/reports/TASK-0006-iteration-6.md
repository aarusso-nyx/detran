Papel: Architect (transcrição)
Tarefa: TASK-0006 (iteração 6 — adenda A8(a): OD-P70 + OD-P68)
Arquivos criados/alterados: `apps/portal/web/src/app/i18n/portal.pt-BR.json` (48 chaves acrescentadas — 44 de OD-P70 + 4 de OD-P68; nenhuma chave existente renomeada/removida)
Comandos executados e saída resumida:
- Script local (leitura da lista fechada de `CTG-0003b.md` §10 e `CTG-0003a.md` §5.7/§3.2) → 49 chaves escritas, 0 sobreposição
- `npx vitest run --config vitest.config.ts src/app/i18n src/app/screens` → **1ª rodada**: `Test Files 1 failed | 5 passed (6)`, `Tests 1 failed | 213 passed (214)` — `translation-map.spec.ts` reprovou "`portal.situation.event.*` tem exatamente os 7 eventos" porque eu havia acrescentado `portal.situation.event.diligencia` (item literal da lista de OD-P70); removida a chave (motivo abaixo) → **2ª rodada**: `Test Files 6 passed (6)`, `Tests 214 passed (214)`
- `node -e "JSON.parse(...)"` → JSON válido
- `grep -c '{{'` → 0
- `node_modules/.bin/prettier --write`/`--check` → `unchanged` / `All matched files use Prettier code style!`
- checagem de chaves duplicadas (script local) → 0 duplicatas, 552 linhas de chave
- `node tools/parameters/verify.mjs --check-generated --check-usage` → `OK (87 entries, 18 flags, 14 i18n namespaces, 0 errors)`

Critérios de aceitação:
- JSON válido: PASS
- `pnpm --filter @detran/portal-web test -- src/app/i18n src/app/screens` verde: PASS (214 passed, 0 failed, após a correção abaixo)
- `pnpm verify:parameter-catalogue` OK: PASS
- `pnpm format:check` OK (arquivo tocado): PASS

Desvio da lista literal de OD-P70, com motivo: **não acrescentei `portal.situation.event.diligencia`**. Acrescentei primeiro, conforme a lista fechada; a suíte `translation-map.spec.ts` (Inspector, TASK-0007) reprovou porque afirma que `portal.situation.event.*` tem **exatamente** os 7 `PROCESS_TIMELINE_DOMAIN_EVENTS`. Lendo o contexto pedido (`CTG-0003b.md` §5, regra 1): "entrada com `domainEvent === null && type === TIMELINE_INQUIRY_TYPE` → texto `portal.situation.badge.em_diligencia` (**existente**)" — o próprio contrato resolve a entrada de diligência com a chave já existente, não com uma nova `event.diligencia`. Removi a chave para manter a suíte verde e o invariante dos 7 eventos intacto; a entrada de diligência da linha do tempo continua coberta por `portal.situation.badge.em_diligencia`, já no catálogo.

Contagem: OD-P70 lista textualmente 46 chaves na mensagem do coordenador; a contagem literal da lista fechada em `CTG-0003b.md` §10(a) (a que efetivamente transcrevi) somou 45 até a remoção acima, ficando 44 após o ajuste — mesmo padrão de imprecisão de contagem já visto em OD-P55 (15×18 serviços). Recomendo o Architect confirmar a contagem de 46 contra o texto de §10(a) se houver expectativa de item adicional.

Tabela chave → texto → fonte:

| Chave | Texto | Fonte |
| --- | --- | --- |
| `portal.situation.decision.deferido` | "Sua defesa foi aceita — multa cancelada" | contrato §6 T-10 (`<h1>` resultado); ux-notes §c "resultado primeiro" |
| `portal.situation.decision.indeferido` | "Sua defesa não foi aceita — multa mantida" | idem |
| `portal.situation.decision.parcialmente_deferido` | "Sua defesa foi aceita em parte" | idem |
| `portal.situation.decision.provido` | "Seu recurso foi aceito — multa cancelada" | idem |
| `portal.situation.decision.negado` | "Seu recurso não foi aceito — multa mantida" | idem |
| `portal.situation.decision.nao_conhecido` | "Seu recurso não foi admitido para análise" | idem |
| `portal.situation.points_status.em_disputa` | "Em disputa" | contrato §6 T-14; [RN-RAIT-131] |
| `portal.situation.points_status.definitivo` | "Definitivo" | idem |
| `portal.situation.points_status.none` | "Sem pontos" | idem |
| `portal.situation.notice.NA` | "Notificação de autuação" | contrato §6 T-01 (`notices[]`) |
| `portal.situation.notice.NP` | "Notificação de penalidade" | idem |
| `portal.situation.notice.decisao` | "Notificação de decisão" | idem |
| `portal.forms.pagamento.meio.pix` | "PIX" | contrato §4.3.6; spec §7 "PIX/débito/boleto/cartão" |
| `portal.forms.pagamento.meio.debito` | "Débito" | idem |
| `portal.forms.pagamento.meio.boleto` | "Boleto" | idem |
| `portal.forms.pagamento.meio.cartao` | "Cartão de crédito" | idem |
| `portal.forms.pagamento.tier.desconto_40_fora_sne` | "Pagar 60% (sem SNE) e abrir mão de defesa e recurso" | contrato §4.3 (tabela); [RN-PORTAL-128] dever 2 ("nomear a renúncia pelo que ela é"), "Controvérsia" (desconto mesmo sem SNE) |
| `portal.forms.pagamento.tier.integral_juros` | "Valor integral com juros" | contrato §4.3 (tabela: "juros após vencimento"); [UC-PORTAL-015] alt. 3a |
| `portal.forms.pagamento.valor_indisponivel` | "Valor não disponível no momento" | contrato §4.3.2 (OD-P41, `amount === null`) |
| `portal.forms.pagamento.valido_ate` | "Válido até {availableUntil}" | contrato §4.3.2 (`availableUntil`) |
| `portal.forms.pagamento.parcelas` | "Número de parcelas" | contrato §4.3.6; [RN-PORTAL-126] ("nunca até 12x") |
| `portal.forms.defesa_previa.tipo` | "Tipo de pedido" | contrato §6 T-02 (`<select name="requestType">`) |
| `portal.forms.defesa_previa.tipo.cancelamento` | "Cancelamento da multa" | idem |
| `portal.forms.defesa_previa.tipo.outro` | "Outro" | idem |
| `portal.forms.indicacao_condutor.assinatura.govbr` | "Assinar com gov.br" | contrato §6 T-05 (`signatures.owner/driver`); [RN-PORTAL-104] |
| `portal.forms.indicacao_condutor.assinatura.upload` | "Enviar documento assinado" | idem |
| `portal.forms.indicacao_condutor.assinatura.pending` | "Aguardando assinatura" | idem; espelha `portal.screens.t05.state.pending_signature` já existente |
| `portal.screens.t01.field.numero` | "Número do auto" | contrato §6 T-01/T-14 (cabeçalho `aitNumber`) |
| `portal.screens.t01.field.placa` | "Placa" | idem (`plate`) |
| `portal.screens.t01.field.data` | "Data da infração" | idem (`occurredAt`) |
| `portal.screens.t01.field.enquadramento` | "Enquadramento" | idem (`framingLabel`) |
| `portal.screens.t01.field.valor` | "Valor da multa" | idem (`amount`) |
| `portal.screens.t14.cmd.filtrar_status` | "Filtrar por situação" | contrato §6 T-14 (`<select>` de `situation`) |
| `portal.screens.t14.field.pontos_definitivos` | "Pontos definitivos" | contrato §6 T-14 (`definitivePoints`) |
| `portal.screens.t06.cmd.ordenar_urgencia` | "Ordenar por urgência" | contrato §6 T-06 (controle de ordenação) |
| `portal.screens.t06.cmd.ordenar_atualizacao` | "Ordenar por atualização" | idem |
| `portal.screens.t06.cmd.filtrar_estado` | "Filtrar por status" | idem (filtro `state`) |
| `portal.screens.t06.field.atualizado_em` | "Última atualização" | contrato §6 T-06 (`updatedAt`); [UC-PORTAL-005] 3a |
| `portal.screens.t07.field.linha_do_tempo` | "Linha do tempo" | contrato §5/§6 T-07 (seções `<h3>`) |
| `portal.screens.t07.field.documentos` | "Documentos" | idem |
| `portal.screens.t07.field.pendencias` | "Pendências" | idem |
| `portal.screens.t04.state.ultima_instancia` | "Esta foi a última instância — não há novo recurso possível" | contrato §6 T-04; [UC-PORTAL-003] AC-2 |
| `portal.screens.t10.state.nao_definitivo` | "Esta decisão ainda não é definitiva — pode haver novo recurso" | contrato §6 T-10; [UC-PORTAL-008] AC-4 |
| `portal.screens.t10.state.ultima_instancia` | "Esta é a decisão final — não há mais recurso possível" | contrato §6 T-10 (`finalInstance === true`); [UC-PORTAL-008] 4a |
| `portal.forms.indicacao_condutor.confirmacao` | "Li e entendo as consequências desta indicação" | OD-P68; contrato §5.7 (padrão `ackLabelKey`, ex. `portal.forms.desistencia.confirmacao`) + [UC-PORTAL-004] passo 4 |
| `portal.forms.pagamento.confirmacao_renuncia_40` | "Reconheço a infração e abro mão de defesa e recurso" | OD-P68; contrato §4.3.3 (`ConsequenceDialog renuncia_40`) + [RN-PORTAL-128] "declaração de reconhecimento" |
| `portal.common.action.dismiss` | "Fechar aviso" | OD-P68; contrato §3.4 (`dismiss = output<void>() // avisos`); padrão `portal.common.action.*` (OD-P58) |
| `portal.forms.assinatura.upload_hint` | "Envie o documento assinado em PDF, JPEG ou PNG, até 10 MB. Não é preciso reconhecimento de firma." | OD-P68; contrato §5.8 (`upload` via `AttachmentUploader`) + [RN-PORTAL-104] ("não exige reconhecimento de firma"); convenção de formato/tamanho já usada em `portal.forms.defesa_previa.anexos_hint` |

Fora do escopo / deixado:
- `portal.situation.event.diligencia` **não** foi criada — ver "Desvio" acima.
- OD-P70(b) (correção das fichas T-10/T-11/T-13/T-14 que citam `portal.states.retry`/`unavailable`/`state.faixa_indisponivel`): **não tocada**, conforme a própria adenda A8(b) do `plan.md` ("corrigidas no CTG-0005, TASK-0012, não agora") — nenhuma ficha, nenhum arquivo fora de `portal.pt-BR.json` foi alterado.
- Nomes de chave de OD-P68 sem fixação literal nos contratos (`portal.forms.indicacao_condutor.confirmacao`, `portal.forms.pagamento.confirmacao_renuncia_40`, `portal.common.action.dismiss`, `portal.forms.assinatura.upload_hint`): seguido o padrão do namespace vizinho já estabelecido (`portal.forms.<form>.confirmacao`/`.aceite` de §5.7; `portal.common.action.*` de OD-P58; `portal.forms.<form>.hint`/`.anexos_hint` de §5.6), informado conforme instruído.

OD tocadas ou propostas: nenhuma nova (OD-P68/OD-P70 são as que esta iteração fecha na parte do transcriber).
Bloqueios: nenhum
