# Reviewer R-0015 — delivery-review CTG-0002 ciclo 1 exaustivo

Você é `claude opus`, Auditor soft gate da família oposta ao maestro GPT-5.6 Sol. Trabalhe somente
em leitura na worktree `/Volumes/Thiamat II/stech/detran-worktrees/boat-mobile`. Papel
constitucional: Auditor. Não edite arquivo algum. Faça o primeiro ciclo exaustivo da entrega
CTG-0002 de R-0015; não reavalie CTG-0001 salvo quando necessário para verificar que sua entrega
permaneceu intacta.

## Escopo e fontes

1. Leia `AGENTS.md`, `.devai/pin/constitution.md`, `docs/meta/agents/orchestra/README.md` §§4–8,
   `work/rounds/R-0015/AUTHORIZATION.md`, `plan.md`, `contracts/CTG-0002.md` e
   `route-manifest.md`.
2. Leia `tasks/TASK-0008.json`…`TASK-0012.json`, os prompts e relatórios correspondentes, bem como
   `compositions.json` e os pareceres `prompt-review-5`…`prompt-review-8`.
3. Examine integralmente `git diff origin/main...HEAD` e todos os arquivos nele alterados. Use
   somente fontes canônicas já citadas pelo contrato/plano para conferir valores; qualquer lacuna
   continua `OD-*`/`source_pending` e não autoriza invenção.
4. O maestro executou `pnpm check` no HEAD e obteve exit 0. Recompute verificações leves se forem
   úteis; não altere testes nem produção.

## Verificação obrigatória

- Confirme a tríade Architect → Inspector → Engineer, ownership de testes somente pelo Inspector,
  fronteiras das tarefas e hashes `PC-*`.
- Confirme biblioteca `@detran/boat-mobile`, 12 telas/rotas S-01…S-10, S-12 e S-11, componentes
  standalone OnPush, extensão estrutural, guardas fail-closed, 14 schemas/15 gates e seis portas
  nativas com doubles; hardware real e chamadas diretas ao SENATRAN ficam ausentes.
- Confirme integração TEAT mobile com shell único e contrato 71 rotas/12 boundaries/59 páginas.
- Confirme W-01…W-04 nos mounts literais, W-03/W-04 com papéis/ações restritos, W-04 sem fallback
  HTTP e SSE negado por `source_pending`; confirme W-05 fail-closed antes do wildcard, somente
  processing-operator/AUDITOR, purpose e auditoria.
- Confirme contrato web de 61 rotas, matriz TEAT preservada, catálogo BOAT de 114 chaves mesclado
  byte a byte e nenhum dos 13 marcadores OD-R15-004 renderizado.
- Confirme presença e ausência contra os nove papéis canônicos sem asserção por conjunto de
  status; nenhuma ampliação de autoridade por analogia.
- Confirme a11y das 12 telas mobile e cinco web, orientação literal sobre fotografar a cena,
  vocabulário `sinistro`, persona/papéis e zero HTTP no caso de homologação BOAT.
- Confirme ausência de skip/todo novo, relaxamento, escape condicional, edição manual de gerado,
  token/segredo, artefato temporário ou mudança fora de CTG-0002.
- Confirme que documentação, histórico da troca Fable → Sol e relatórios descrevem a entrega sem
  antecipar PR/merge ainda inexistentes.

Classifique contradição de segurança, autorização, dados, contrato ou teste ausente como `high`;
inconsistência documental ou de higiene sem risco imediato como `low`. `PASS` exige zero finding;
`REVIEW` admite apenas low; `FAIL` contém ao menos um high. Não invente requisito fora das fontes.

Responda apenas com o último objeto JSON estrito, sem cercas, prosa ou preâmbulo:

```json
{
  "mode": "delivery-review",
  "round": "R-0015",
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [
    {
      "severity": "high | low",
      "item": 1,
      "file": "path",
      "line": 1,
      "claim_b64": "base64 UTF-8",
      "fix_b64": "base64 UTF-8"
    }
  ],
  "notes_b64": ["base64 UTF-8"]
}
```

Todo claim, fix e note deve usar somente o campo `_b64` em base64 RFC 4648.
