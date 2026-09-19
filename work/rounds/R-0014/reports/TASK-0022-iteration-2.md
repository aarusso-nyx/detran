Papel: Architect  
Tarefa: TASK-0022 (iteração 2)  
Arquivos alterados: [CTG-0004.md](/Volumes/Thiamat%20II/stech/detran/.claude/worktrees/r-0009-maestro-execution-33aaac/work/rounds/R-0014/contracts/CTG-0004.md)  
Comandos executados e saída resumida: `pnpm exec prettier --write …/CTG-0004.md` → OK; `pnpm format:check` → exit 0 / `Checking formatting...`  
Mapeamento §3 (campo → fonte → regra):

| Campo | Fonte | Regra |
| --- | --- | --- |
| `CnhLicense.status` | `condutor.situacaoCnh` | `A/V/S/C` → `valida/vencida/suspensa/cassada`; `B` ou ausente → `null`. |
| `validUntil` | `dataValidadeCnh` | ISO date-time válido → data ISO UTC `YYYY-MM-DD`; ausente/inválido → `null`. |
| `categories` | `categoriaAtual` | Letras únicas em ordem; `AD` → `['A','D']`; ausente → `[]`. |
| `restrictions` | `quadroObservacoesCnh` | Vazio → `[]`; texto → uma entrada preservada. |
| `vehicleId` | `veiculo.chassi` | UUIDv5 com namespace `detran.portal.vehicle`; nunca RENAVAM. |
| `plate` | `veiculo.placa` | Normalizada em maiúsculas; ausente exclui o item. |
| `model` | `veiculo.descricaoMarcaModelo` | Texto normalizado; ausente → `null`. |
| `ClearanceItem.multa` | `PaymentQuote` | `amount` usa `discountedAmount` ou `originalAmount`; `status` usa `status`; restrições e `canIssue` seguem OD-P104. |

Critérios novos/reescritos: C-4-01–52, C-4-60, C-4-61, C-4-71–74.  
Decisões que pedem ratificação: [DIVERGE-3] — observação CNH não possui delimitador; texto não vazio é uma única restrição cidadã.  
OD tocadas ou propostas: OD-P103, OD-P104, OD-P105.  
Bloqueios: nenhum.