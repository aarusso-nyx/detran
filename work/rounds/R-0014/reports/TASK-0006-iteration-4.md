All checks green. Final report for this iteration:

Papel: Architect (transcrição)
Tarefa: TASK-0006 (iteração 4 — adenda A6(d) / OD-P58)
Arquivos criados/alterados: `apps/portal/web/src/app/i18n/portal.pt-BR.json` (acréscimo de 26 chaves, exatamente a lista fechada de OD-P58; nenhuma chave existente renomeada/removida)
Comandos executados e saída resumida:
- `node -e "JSON.parse(...)"` → JSON válido
- checagem de chaves duplicadas (script local, comparando texto bruto) → 0 duplicatas, 504 linhas de chave
- `node_modules/.bin/prettier --write` / `--check apps/portal/web/src/app/i18n/portal.pt-BR.json` → `unchanged` / `All matched files use Prettier code style!`
- `npx vitest run --config vitest.config.ts` (suíte completa, em `apps/portal/web`) → `Test Files 17 passed (17)`, `Tests 472 passed (472)`
- `node tools/parameters/verify.mjs --check-generated --check-usage` → `OK (87 entries, 18 flags, 14 i18n namespaces, 0 errors)`

Critérios de aceitação:
- JSON válido: PASS
- `pnpm --filter @detran/portal-web test` → 0 failed, 472 esperados: PASS (472 passed, 0 failed)
- `pnpm verify:parameter-catalogue` OK: PASS
- `pnpm format:check` OK (arquivo tocado): PASS

Chaves acrescentadas e fonte de cada uma:

| Chave | Texto | Fonte |
| --- | --- | --- |
| `portal.common.action.cancel` | "Cancelar" | contrato §5.7 (`cancelLabelKey` genérica) |
| `portal.common.action.correct` | "Corrigir" | contrato §5.5 (`PrefilledField.correctLabelKey`); [RN-PORTAL-106] |
| `portal.common.action.remove` | "Remover" | contrato §5.6 (`AttachmentUploader`, "botão remover por entrada") |
| `portal.common.action.download` | "Baixar" | contrato §5.9 (rótulos genéricos de download) |
| `portal.common.action.continue` | "Continuar" | contrato §5.4 (`ServiceWizard`, navegação entre passos) |
| `portal.common.link.suporte` | "Suporte" | contrato §3.2 `NextStep 'support'` → `brand.supportUrl` |
| `portal.common.link.conta` | "Conta" | contrato §3.2 `NextStep 'representation'` → `/conta`; reaproveita o texto de `portal.shell.title.conta` já existente |
| `portal.common.step.elegibilidade` | "Elegibilidade" | contrato §5.4 `WizardStep`; [WF-PORTAL-001] |
| `portal.common.step.composicao` | "Preenchimento" | idem |
| `portal.common.step.assinatura` | "Assinatura" | idem |
| `portal.common.step.protocolo` | "Protocolo" | idem |
| `portal.a11y.wizard_steps` | "Etapas do seu pedido" | contrato §5.4 ("aria-label da navegação de passos") |
| `portal.common.toast.draft_saved` | "Rascunho salvo" | contrato §5.4 ("rascunho salvo") |
| `portal.common.receipt.number` | "Número do protocolo" | contrato §5.9 |
| `portal.common.receipt.issued_at` | "Recebido em" | contrato §5.9 |
| `portal.common.receipt.channel` | "Canal" | contrato §5.9 |
| `portal.common.receipt.download` | "Baixar recibo" | contrato §5.9 |
| `portal.common.deadline.days_left` | "Faltam {{daysLeft}} dias" | contrato §5.2 (`DeadlineCard.daysLeft`); número sempre com contexto (ux-notes §c) |
| `portal.situation.assurance.simples` | "Nível simples" | `portal-frontends.md` §3; contrato §5.11 |
| `portal.situation.assurance.avancada` | "Nível avançado" | idem |
| `portal.situation.assurance.qualificada` | "Nível qualificado" | contrato §5.8 (`required === 'qualificada'`); [RN-PORTAL-101] c |
| `portal.forms.elevacao.caminho.biographic` | "Validação biográfica ou documental" | [UC-PORTAL-019] fluxo 3 |
| `portal.forms.elevacao.caminho.biometric` | "Validação biométrica" | idem |
| `portal.forms.elevacao.caminho.icp` | "Certificado ICP-Brasil" | idem |
| `portal.forms.assinatura.method.govbr` | "Assinar remotamente com gov.br" | contrato §5.8; [RN-PORTAL-104]; [UC-PORTAL-004] passo 3 |
| `portal.forms.assinatura.method.upload` | "Enviar documento já assinado" | contrato §5.8; [RN-PORTAL-104]; [UC-PORTAL-004] passo 3 |

Fora do escopo / deixado: nenhuma chave além das 26 listadas em OD-P58 foi tocada; nenhum outro arquivo alterado; nenhum token cru introduzido; `daysLeft` sempre acompanhado do rótulo "Faltam … dias" (nunca número isolado).
OD tocadas ou propostas: nenhuma (OD-P58 é a que esta iteração fecha na parte do transcriber; a revisão de linguagem cidadã do Owner, citada na adenda A6(d), permanece como gate do WP-P4, fora desta tarefa).
Bloqueios: nenhum
