# TASK-0022 — iteração 2 (restrita, Codex): fechar §3 (CNH-e/veículos) com as fontes reais do mock; matriz §1 legível

> Worker da orquestra `portal-pwa`, rodada `R-0014`, CLI do Codex, worktree
> `/Volumes/Thiamat II/stech/detran/.claude/worktrees/r-0009-maestro-execution-33aaac`. Uma
> tarefa; sua **última mensagem é o relatório**. Nunca `git`, nunca instalar, nunca código/testes/
> blueprints/gerados, nunca `work/rounds/**` fora do contrato. Ninguém responde durante a execução.

Papel: **Architect** (Art. 6). Você escreveu `work/rounds/R-0014/contracts/CTG-0004.md` na
iteração 1 (`reports/TASK-0022.md`). O maestro ratifica [DIVERGE-1] (fixtures do CPF Prata no
mock, commit separado) e [DIVERGE-2] (cancelamento SNE local; OD-P106), OD-P107/P108 e a decisão
de não tocar blueprints. **Três correções** antes de liberar o Inspector:

## Leitura obrigatória (lista fechada)

- `AGENTS.md`; `docs/meta/agents/architect-blueprint.md`; `work/rounds/R-0014/contracts/CTG-0004.md` (o seu)
- `work/rounds/R-0014/reports/TASK-0022.md`; `work/rounds/R-0014/plan.md` §Adendas A13
- **Fontes reais do mock para CNH e veículos (o §3 da iteração 1 afirmou "85 não possui CNH/veículo"
  e deixou os campos `source_pending`; a fonte é outra):**
  - `senatran-mock/domain/cdt/api/src/cdt.service.ts` — `cnh(cpf)` lê `senatran.condutor.payload`
    (`GET /v1/cdt/cidadaos/{cpf}/cnh` → `{ cpf, cnh: payload }`); `veiculos(cpf)` lê
    `senatran.veiculo.payload where id_proprietario = cpf` (`→ { cpf, veiculos: payload[] }`)
  - `senatran-mock/database/seed/20-read.sql` l. 2 (`senatran.veiculo`: `placa`,
    `descricaoMarcaModelo`, `situacao`, `codigoRenavam`, `idProprietario`…) e l. 124–125
    (`senatran.condutor` do CPF `52998224725`: `situacaoCnh` = `V`, `dataValidadeCnh`,
    `categoriaAtual` = `AD`, `categoriaRebaixada`, `quadroObservacoesCnh`, `situacaoCnhAnterior`…)
  - `senatran-mock/database/seed/10-ref.sql` l. 102–107 — `ref_situacao_cnh`: `A ATIVA`, `S SUSPENSA`,
    `C CASSADA`, `B BLOQUEADA`, `V VENCIDA`
  - `packages/senatran-adapter/src/generated/read.ts` l. ≈1270–1290 (tipo gerado do condutor:
    `categoriaAtual`, `dataValidadeCnh`, `situacaoCnh`, `quadroObservacoesCnh`, `permissionario`…)
    e o tipo gerado do veículo (`placa`, `descricaoMarcaModelo`, `codigoRenavam`, `situacao`)
  - `packages/senatran-adapter/src/client.ts` l. ≈1028–1050 (`listCitizenVehicles` → `collection('vehicles','veiculos',cpf)`; `getCitizenLicense`)
  - `work/rounds/R-0014/contracts/CTG-0003c.md` §2 (`CnhLicense.status: 'valida'|'vencida'|'suspensa'|'cassada'|null`,
    `validUntil`, `categories[]`, `restrictions[]`; `Vehicle { vehicleId, plate, model }`) e
    `apps/portal/web/src/app/data/portal-read.models.ts` l. 395–460 (só leitura)
  - `docs/framework/arch/portal-error-catalog.md` §5 (CRLV) e `portal-route-contract.md` §7 (documentos/veículos)

## Correções

1. **§3 reescrito com mapeamento fechado** (uma linha por campo: fonte → regra → valor quando ausente):
   - `CnhLicense.status` ← `condutor.situacaoCnh` por `ref_situacao_cnh`: `A`→`valida`, `V`→`vencida`,
     `S`→`suspensa`, `C`→`cassada`, `B`→ decida pelo canônico (o app só tem quatro status; `B BLOQUEADA`
     não tem rótulo cidadão — `null` + OD-P103 **redefinida** como "rótulo cidadão de `B`"), ausente→`null`;
   - `validUntil` ← `dataValidadeCnh` (ISO date-time → data ISO `YYYY-MM-DD`, regra explícita);
   - `categories` ← `categoriaAtual` (string como `AD`/`AB` → lista de letras? ou uma entrada única?
     decida pelo canônico/fichas T-16 e registre); `restrictions` ← `quadroObservacoesCnh`
     (vazio → `[]`; formato de separação: decida e registre como `[DIVERGE-3]` se a fonte não fixar);
   - `Vehicle.vehicleId` ← identificador estável do veículo (qual campo: `codigoRenavam`? `chassi`?
     — o app usa `vehicleId` na rota `/veiculos/{id}/crlv-e` e no `OfflineDocumentStore`; decida e
     registre a regra de não expor RENAVAM em texto, RN-PORTAL); `plate` ← `placa`; `model` ←
     `descricaoMarcaModelo`;
   - quitação/`canIssue`/restrições: o que `getPaymentQuote` fundamenta (itens `multa`) e o que segue
     `source_pending` (OD-P104) — mantenha, mas cite o campo do quote usado por item;
   - `POST crlv-e`: mantenha OD-P105, mas fixe o comportamento **hoje** (422/503 canônico, qual) quando
     `canIssue` não pode ser provado;
   - **[DIVERGE-1] atualizado**: as fixtures do CPF Prata `22222222222` entram em `20-read.sql`
     (`senatran.condutor` + `senatran.veiculo` com `id_proprietario`) **e** em `85-cdt.sql`/`80-sne.sql`
     (infrações/adesão) — valores mínimos listados no contrato (placa, modelo, situação `A`, validade
     futura, categoria) para que os critérios sejam determinísticos; nada de valores livres para o Engineer.
2. **Matriz §1 "C-4-01…52" corrigida**: os rótulos de jornada estão deslocados (C-4-05…08 dizem
   JRN-001/002 mas pertencem a JRN-002; C-4-09/10 JRN-003; etc.). Cada critério passa a citar a
   jornada certa e a ser **verificável em uma frase**: rota, status, campo/token afirmado ou negado
   (ex.: "C-4-03 [positivo] JRN-001: `POST /requests` defesa → 422 `PORTAL.SERVICE_UNAVAILABLE`
   `context.unavailableReason = 'delegacao_indisponivel_r0007'`").
3. **§8 C-4-60/61** reescritos conforme o §3 novo (campos e valores da fixture Prata); acrescente
   critérios para `B`→`null`, `validUntil` como data, `restrictions` vazio e `vehicleId` estável
   entre `GET /vehicles` e `GET /vehicles/{id}/clearance` (numeração C-4-71+).

Nada mais muda (§2, §4–§7, §9, §10 só recebem as referências novas). `prettier --write` no contrato;
`pnpm format:check` → OK. Não rode `pnpm typecheck` recursivo (limite do executor); o maestro roda.

## Entrega (última mensagem)

```markdown
Papel: Architect
Tarefa: TASK-0022 (iteração 2)
Arquivos alterados: <caminho>
Comandos executados e saída resumida: <linhas>
Mapeamento §3 (campo → fonte → regra): <tabela>
Critérios novos/reescritos: <ids>
Decisões que pedem ratificação: <lista ou "nenhuma">
OD tocadas ou propostas: <ids>
Bloqueios: <ou "nenhum">
```
