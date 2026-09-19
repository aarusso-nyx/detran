Confirmed: still exactly 7. Final report:

Papel: Architect (transcrição)
Tarefa: TASK-0006 (iteração 7 — OD-P89(a), `CTG-0003c.md` §10, par 3)
Arquivos criados/alterados: `apps/portal/web/src/app/i18n/portal.pt-BR.json` (119 chaves acrescentadas, exatamente a lista fechada de OD-P89(a); nenhuma chave existente renomeada/removida; `portal.situation.event.*` não tocado — segue com os 7 eventos fixos)
Comandos executados e saída resumida:
- Script local (leitura das seções §3/§4/§5/§6 de `CTG-0003c.md` para contexto) → 119 chaves escritas, 0 sobreposição
- `node -e "JSON.parse(...)"` → JSON válido
- `grep -c '{{'` → 0 (todos os placeholders na sintaxe `{x}`)
- `node_modules/.bin/prettier --write`/`--check` → `unchanged` / `All matched files use Prettier code style!`
- checagem de chaves duplicadas (script local) → 0 duplicatas, 671 linhas de chave
- `npx vitest run --config vitest.config.ts src/app/i18n src/app/screens` → `Test Files 6 passed (6)`, `Tests 214 passed (214)`
- `grep -c '"portal.situation.event\.'` → 7 (inalterado)
- `node tools/parameters/verify.mjs --check-generated --check-usage` → `OK (87 entries, 18 flags, 14 i18n namespaces, 0 errors)`

Critérios de aceitação:
- JSON válido: PASS
- `pnpm --filter @detran/portal-web test -- src/app/i18n src/app/screens` verde: PASS (214 passed, 0 failed)
- `pnpm verify:parameter-catalogue` OK: PASS
- `pnpm format:check` OK (arquivo tocado): PASS

Tabela chave → texto → fonte:

| Chave | Texto | Fonte |
| --- | --- | --- |
| `portal.shell.inicio.greeting` | "Olá, {name}" | contrato §3.10 (`InicioFacade`/`account.name`) |
| `portal.shell.inicio.title_pending` | "Suas pendências" | contrato §3.10 (`<ol data-pending>`) |
| `portal.shell.inicio.empty_pending` | "Nada pendente por aqui." | contrato §3.10 ("empty (nenhuma pendência)"); ux-notes §c (tom) |
| `portal.shell.inicio.unread` | "Notificações não lidas" | contrato §3.10/§6 (`/inicio` contadores) |
| `portal.shell.inicio.aits_with_action` | "Multas que precisam de uma ação sua" | idem |
| `portal.shell.inicio.requests_with_you` | "Pedidos com você" | idem; [RN-PORTAL-112] "com você" |
| `portal.shell.inicio.resume` | "Falta 1 passo para continuar" | contrato §3.10 (`resumePoint`); [UC-PORTAL-019] 3a ("Falta 1 passo") |
| `portal.shell.conta.name` | "Nome" | contrato §3.10 (`/conta`) |
| `portal.shell.conta.cpf` | "CPF" | idem |
| `portal.shell.conta.level` | "Nível de identidade" | idem (`assuranceLevel()`) |
| `portal.shell.conta.observed_at` | "Verificado em {observedAt}" | idem (`govbrLevelObservedAt`) |
| `portal.shell.conta.representations` | "Representações" | idem (`representations()`) |
| `portal.shell.conta.no_representations` | "Você não representa ninguém no momento." | idem; OD-P48 (sem seleção) |
| `portal.shell.conta.links` | "Outros acessos" | contrato §3.10 (links a `/privacidade/meus-dados`, `/notificacoes/preferencias`, `/sne`) |
| `portal.shell.acessibilidade.intro` | "Este site segue o padrão de acessibilidade WCAG 2.1 AA e eMAG 3.1." | contrato §3.10; [RN-PORTAL-113] |
| `portal.shell.acessibilidade.standard` | "Buscamos garantir que todo o conteúdo seja perceptível, operável e compreensível para o maior número possível de pessoas." | idem |
| `portal.shell.acessibilidade.contact` | "Encontrou uma barreira de acessibilidade? Avise pela ouvidoria." | idem (link `/ouvidoria/nova`) |
| `portal.common.action.save` | "Salvar" | contrato §3.10 (`/notificacoes/preferencias`) |
| `portal.common.action.logout` | "Sair" | contrato §3.10 (`/conta`) |
| `portal.common.action.share` | "Compartilhar" | contrato §5.3 (`DigitalDocumentCard`) |
| `portal.common.action.print` | "Imprimir" | idem |
| `portal.common.action.skip` | "Pular" | contrato §5.7 (`EvaluationForm`) |
| `portal.situation.availability.available` | "Disponível" | contrato §3.10 (home/T-25, `availability`) |
| `portal.situation.availability.partially_available` | "Parcialmente disponível" | idem |
| `portal.situation.availability.unavailable` | "Indisponível" | idem |
| `portal.situation.assurance.none` | "Nenhum nível exigido" | contrato §5.11/§6 T-25/T-27 (`minimumAssurance 'none'`) |
| `portal.situation.manifestation.MANIFESTACAO_REGISTRADA` | "Registrada" | [WF-PORTAL-004] §Estados; contrato §6 T-22 (mapa M9) |
| `portal.situation.manifestation.COMPROVANTE_EMITIDO` | "Comprovante emitido" | idem |
| `portal.situation.manifestation.EM_ANALISE` | "Em análise" | idem |
| `portal.situation.manifestation.INFORMACAO_SOLICITADA_AO_AGENTE` | "Em análise — aguardando informação do setor responsável" | idem |
| `portal.situation.manifestation.DECISAO_FINAL_ELABORADA` | "Decisão elaborada" | idem |
| `portal.situation.manifestation.CIENCIA_AO_USUARIO` | "Aguardando sua confirmação" | idem |
| `portal.situation.manifestation.ENCERRADA` | "Encerrada" | idem |
| `portal.situation.manifestation.AVALIACAO_OFERECIDA` | "Avaliação disponível" | idem |
| `portal.situation.manifestation.AVALIADA` | "Avaliada" | idem |
| `portal.notifications.preferences.title` | "Preferências de notificação" | contrato §3.10 (`/notificacoes/preferencias`) |
| `portal.notifications.preferences.push_opt_in` | "Ativar notificações push" | idem |
| `portal.notifications.preferences.push_unsupported` | "Seu navegador não é compatível com notificações push." | idem (`PushService.status 'unsupported'`) |
| `portal.notifications.preferences.push_unavailable` | "Notificações push não estão disponíveis no momento." | idem (`'unavailable'`) |
| `portal.notifications.preferences.push_subscribed` | "Notificações push ativadas neste aparelho." | idem (`'subscribed'`) |
| `portal.notifications.preferences.push_denied` | "Você bloqueou as notificações push neste navegador. Para ativar, mude a permissão nas configurações do navegador." | idem (`'denied'`) |
| `portal.notifications.preferences.push_unsubscribe` | "Desativar notificações push" | idem |
| `portal.notifications.category.SNE` | "SNE" | contrato §6 T-12 (filtro `kind`) |
| `portal.notifications.category.PROCESSO` | "Processo" | idem |
| `portal.notifications.category.OUVIDORIA` | "Ouvidoria" | idem |
| `portal.notifications.category.SISTEMA` | "Sistema" | idem |
| `portal.forms.preferencias.canal.push` | "Notificação push" | contrato §5.2/§3.10 |
| `portal.forms.preferencias.canal.email` | "E-mail" | idem |
| `portal.forms.preferencias.canal.sne` | "SNE" | idem |
| `portal.screens.t12.field.nao_lidas` | "{count} não lidas" | contrato §6 T-12 (`unreadCount()`) |
| `portal.screens.t12.field.disponibilizada_em` | "Disponibilizada em {availableOn}" | contrato §5.1 (`availableOn`) |
| `portal.screens.t12.field.lida_em` | "Lida em {readOn}" | idem (`readOn`) |
| `portal.screens.t12.field.ciencia_ficta_em` | "Ciência ficta em {date}" | contrato §5.1 (`fictitiousAcknowledgementOn`) |
| `portal.screens.t12.cmd.filtrar_tipo` | "Filtrar por tipo" | contrato §6 T-12 |
| `portal.screens.t12.cmd.filtrar_lidas` | "Filtrar por leitura" | idem |
| `portal.screens.t12.cmd.todos` | "Todas" | idem |
| `portal.screens.t09.state.aderido` | "Você já aderiu ao SNE" | contrato §6 T-09 |
| `portal.screens.t09.state.nao_aderido` | "Você ainda não aderiu ao SNE" | idem |
| `portal.forms.cancelamento_sne.motivo` | "Motivo do cancelamento (opcional)" | contrato §5.2 (`cancel({ reason? })`) |
| `portal.documents.cnh.status.valida` | "Válida" | contrato §6 T-16 (`license.status`) |
| `portal.documents.cnh.status.vencida` | "Vencida" | idem |
| `portal.documents.cnh.status.suspensa` | "Suspensa" | idem |
| `portal.documents.cnh.status.cassada` | "Cassada" | idem |
| `portal.documents.cnh.categories` | "Categoria" | contrato §6 T-16 |
| `portal.documents.cnh.restrictions` | "Restrições" | idem |
| `portal.documents.cnh.porte_obrigatorio` | "O porte é obrigatório ao dirigir." | contrato §6 T-16; [RN-PORTAL-115] item 3 |
| `portal.documents.cnh.quitacao_antes_renovar` | "Renovação ou segunda via só depois de quitar débitos do seu prontuário." | idem; [RN-PORTAL-115] §8 |
| `portal.documents.vehicles.title` | "Meus veículos" | contrato §6 `/veiculos` |
| `portal.documents.vehicles.empty` | "Você não tem veículos vinculados." | idem |
| `portal.documents.vehicles.plate` | "Placa" | idem |
| `portal.documents.vehicles.model` | "Modelo" | idem |
| `portal.documents.clearance.kind.tributo` | "Tributo (ex.: IPVA)" | contrato §5.4 (`items[].kind`) |
| `portal.documents.clearance.kind.encargo` | "Encargo (ex.: licenciamento)" | idem |
| `portal.documents.clearance.kind.multa` | "Multa" | idem |
| `portal.documents.clearance.kind.dpvat` | "Seguro DPVAT" | idem |
| `portal.documents.clearance.blocking` | "Impede a emissão" | contrato §5.4 |
| `portal.documents.clearance.not_blocking` | "Não impede a emissão" | idem |
| `portal.documents.clearance.restrictions` | "Restrições" | idem |
| `portal.documents.clearance.suspended` | "Sob recurso" | idem; mesma redação de `portal.screens.t17.state.suspenso` |
| `portal.documents.clearance.can_issue` | "Pode emitir o CRLV-e" | idem |
| `portal.documents.category.documento` | "Documento oficial" | contrato §5.5; [RN-PORTAL-117] categoria A |
| `portal.documents.category.copia` | "Cópia" | idem; categoria B/cópia |
| `portal.screens.t18.field.busca` | "O que você lembra do ocorrido" | contrato §6 T-18 |
| `portal.screens.t20.field.prazo_junta` | "Prazo para pedir junta médica ou psicológica" | contrato §6 T-20 |
| `portal.screens.t20.result.apto` | "Você está apto — sem restrições para dirigir." | contrato §6 T-20; ux-notes §c item 6 |
| `portal.screens.t20.result.apto_com_restricoes` | "Você está apto, mas com alguma restrição (por exemplo, usar óculos) — veja o detalhe no documento oficial." | idem |
| `portal.screens.t20.result.inapto_temporario` | "Você está temporariamente inapto — pode repetir o exame depois do prazo indicado." | idem |
| `portal.screens.t20.result.inapto` | "Você está inapto neste exame." | idem |
| `portal.forms.junta_medica.anexos` | "Anexos que sustentam seu pedido (opcional)" | contrato §6 (`/exames/:examId/junta/nova`) |
| `portal.forms.manifestacao.tipo.reclamacao` | "Reclamação" | contrato §5.6; [WF-PORTAL-004] |
| `portal.forms.manifestacao.tipo.denuncia` | "Denúncia" | idem |
| `portal.forms.manifestacao.tipo.sugestao` | "Sugestão" | idem |
| `portal.forms.manifestacao.tipo.elogio` | "Elogio" | idem |
| `portal.forms.manifestacao.tipo.solicitacao` | "Solicitação" | idem |
| `portal.forms.manifestacao.anonimo` | "Enviar de forma anônima" | contrato §5.6 |
| `portal.forms.manifestacao.anonimo_sem_acompanhamento` | "Manifestações anônimas não podem ser acompanhadas depois — você recebe o comprovante agora, mas não vai poder consultar o andamento." | idem; [DIVERGE-20] |
| `portal.forms.manifestacao.finalidade` | "Usamos esses dados só para analisar e responder sua manifestação." | contrato §5.6; [RN-PORTAL-122] |
| `portal.screens.t22.field.prorrogacao` | "Prazo prorrogado até {on} — {justification}" | contrato §6 T-22 |
| `portal.screens.t22.field.decisao` | "Decisão da ouvidoria" | idem |
| `portal.screens.t22.field.recebida_em` | "Recebida em {receivedAt}" | idem |
| `portal.forms.avaliacao.clareza` | "Clareza da comunicação" | contrato §5.7 (`EVALUATION_DIMENSIONS: clarity`) |
| `portal.forms.avaliacao.canal` | "Canal de atendimento" | idem (`channel`) |
| `portal.forms.avaliacao.pular` | "Pular avaliação" | idem ("pular" como link de volta) |
| `portal.screens.t24.state.tem_dados` | "Temos dados seus em nossos sistemas." | contrato §6 T-24 |
| `portal.forms.meus_dados.campo.cpf` | "CPF" | contrato §5.5 (`OwnDataPanel`) |
| `portal.forms.meus_dados.campo.nome` | "Nome" | idem |
| `portal.forms.meus_dados.campo.finalidade` | "Usamos esses dados para prestar os serviços do DETRAN-AM a você." | idem; [RN-PORTAL-122] |
| `portal.screens.t25.field.resumo` | "Resumo" | contrato §6 T-25 (`summary`) |
| `portal.screens.t25.field.requisitos` | "O que você precisa" | idem (`requirements[]`) |
| `portal.screens.t25.field.canal` | "Canal de prestação" | idem (`deliveryChannel`) |
| `portal.screens.t25.field.custo` | "Custo" | idem (`cost`) |
| `portal.screens.t25.field.acessibilidade` | "Acessibilidade" | idem (`accessibilityNote`) |
| `portal.screens.t25.field.responsavel` | "Responsável" | idem (`responsibleParty`) |
| `portal.screens.t25.field.base_normativa` | "Base normativa" | idem (`normativeReference`) |
| `portal.screens.t25.field.disponibilidade` | "Disponibilidade" | idem (`availability`) |
| `portal.screens.t25.field.versao` | "Versão" | idem (`version`) |
| `portal.screens.t25.field.vigencia` | "Vigente desde {effectiveFrom}" | idem (`effectiveFrom`) |
| `portal.screens.t25.field.filtrar` | "Buscar serviço" | contrato §6 T-25 (filtro local por texto) |
| `portal.screens.t27.resume_hint` | "Você volta exatamente de onde parou depois de confirmar sua identidade." | contrato §6 T-27; [UC-PORTAL-019] AC-4 |

Fora do escopo / deixado:
- OD-P89(b) (fichas T-12/T-15/T-16/T-17/T-18 citando `portal.states.retry`/`unavailable`/`{{source}}`; T-17 `{amount}` sem fonte; T-26/T-24 citando rotas divergentes): **não tocada**, conforme a própria mensagem do coordenador ("fica para o CTG-0005") — nenhuma ficha alterada.
- `portal.shell.conta.links` e `portal.shell.inicio.title_pending`/`empty_pending`: os contratos não fixam a renderização exata desses rótulos (apenas a obrigação de existir); segui a leitura mais direta do contexto de §3.10 e registrei aqui para revisão do Owner (linguagem cidadã), como o próprio OD-P89 prevê.
- `portal.documents.clearance.kind.tributo/encargo`: exemplos entre parênteses ("ex.: IPVA"/"ex.: licenciamento") acrescentados para dar contexto ao termo, sem inventar valor normativo novo.

OD tocadas ou propostas: nenhuma nova (OD-P89(a) é a que esta iteração fecha na parte do transcriber; OD-P89(b) permanece aberta para o CTG-0005, conforme já registrado no `plan.md`).
Bloqueios: nenhum
