# R-0021 — autorização do Owner

status: active

GRANTED — representação para o runtime DEVAI 1.5.6 da autorização expressa do Owner já documentada abaixo. Estes marcadores não ampliam o escopo nem alteram a Adenda A1.

Papel: Architect. Fonte: instrução do Owner nesta conversa, seguida de aprovação expressa do plano de implementação em 2026-09-27 (America/Sao_Paulo).

O Owner autorizou executar R-0021 até concluir o escopo revisto, incluindo preparação Astra, workers, revisão independente, evidência, PRs e merges com checks verdes. Preparação e materialização: GPT-6 Astra. Orquestração após prompt-review PASS: `gpt-6-sol`, esforço `high`, sessão limpa. Reviewer: `claude-opus-5-5`, ponte existente.

## Adenda A1 — decisões vinculantes

- OD-R21-01: aguardar suporte upstream; transferir toda a migração de assinatura para R-0022. Não mover contornos nem montar o módulo nesta rodada.
- OD-R21-02: transferir toda a migração de outbox para R-0022, incluindo despacho RENACH.
- OD-R21-03: notificações serão adotadas com o produtor de OD-P40; não montar módulo sem produtor.
- Offline-sync: exigir suporte upstream que preserve o protocolo; transferir toda a migração para R-0022. Nesta rodada, caracterização e requisitos verificáveis.
- R-0021 entrega inventário, caracterização antes/depois, pin 1.4.0, verificador e adenda upstream. Atualizar planos consumidores sem iniciar R-0022 nem escrever no STYNX.
- Fechar formalmente com `round close`. Critérios originais transferidos permanecem como não cumpridos (`fail`), com esta decisão como fonte. O Owner aprovou **fechar sem selo**: DEVAI 1.5.6 rejeita `round seal` com critérios `fail`. Nunca convertê-los para PASS/N/A para obter selo.
- Revisões: até quatro ciclos por item, incluindo o primeiro. Primeiro exaustivo; seguintes somente correções. Nenhuma dispensa de FAIL constitucional, fail-open ou vazamento entre tenants.
- Orçamento por janela: entrada até 2.250.000 tokens, checkpoint preventivo em 1.800.000, janela de 5 horas. Registrar estimativas de entrada/saída de Astra, Sol, workers e reviewer.
- Ambiente: bancos descartáveis exclusivos da rodada e operações de preparação/reset desses bancos são autorizados; nunca bancos de outra frente. Nenhuma integração externa real.

Preparação física: worktree gerenciada `/Users/aarusso/.codex/worktrees/stynx-canonical/detran`; branch `orchestra/stynx-canonical`; base `e47a68014ffdd24e1f9da03c4fc9e1b78ecf381b` (R-0017 mesclada). Raiz e repositórios irmãos preservados.

## Autorização adicional do Owner — issues upstream (2026-09-27)

Durante a execução da rodada, o Owner instruiu expressamente: “registre todos os requisitos para o stynx upstream em GitHub issues”. Esta instrução posterior autoriza o registro e a atualização das issues de requisitos da campanha C-0002 no repositório GitHub `stynx-nyx/stynx`, incluindo o índice e os critérios verificáveis da adenda A1.

A restrição anterior de não escrever no STYNX continua aplicável ao código, aos arquivos e às branches do repositório irmão; o registro dessas issues é a exceção explicitamente autorizada. A autorização não inicia uma rodada upstream, não autoriza implementação ou release STYNX e não altera as transferências para R-0022.

Astra, no papel Architect, executou a publicação dos 76 requisitos em 18 issues e no índice [STYNX #289](https://github.com/stynx-nyx/stynx/issues/289). O arquivo `work/rounds/R-0021/reports/UPSTREAM-ISSUES.md` integra as entregas documentais autorizadas de TASK-0001/CTG-0001 por esta adenda, além da lista de caminhos da preparação original. A revisão deve considerar esta instrução posterior na análise de escopo; o trabalho não foi redisparado a um worker.
