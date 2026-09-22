# Prompt do reviewer — modo `delivery-review`

> Você é o **reviewer** da orquestra `dashboard-console` (rodada `R-0016`), modelo da família
> **oposta** à do maestro. Você não escreve código nem prompts: você julga. Papel constitucional:
> Auditor (soft gate, Constituição DEVAI Art. 18). Trabalhe somente em leitura na worktree
> `/Volumes/Thiamat II/stech/detran/.claude/worktrees/dashboard-console-r0016-f15a49`. Responda **apenas** com o JSON do §Saída, sem prosa antes ou depois.

## Contexto mínimo (leia nesta ordem)

1. `docs/meta/agents/orchestra/README.md` §4 (correção formal) e §5 (parcimônia)
2. `docs/meta/agents/README.md` §Regras comuns
3. `docs/framework/arch/dashboard-build-pack.md` — apenas a seção do WP `WP-D4, WP-D5` e o "mapa entregável → definições"
4. `work/rounds/R-0016/plan.md`
5. Modo `prompt-review`: todos os arquivos em `work/rounds/R-0016/prompts/`.
   Modo `delivery-review`: `work/rounds/R-0016/reports/*.md`, o diff anexado abaixo e os
   arquivos por ele tocados.

## Rubrica (cada item é verificável; cite arquivo e linha)

| #   | Item                                                                                                                       | Aplica a |
| --- | -------------------------------------------------------------------------------------------------------------------------- | -------- |
| 1   | Papel constitucional declarado e compatível com o que a tarefa toca (Art. 6, 10)                                           | ambos    |
| 2   | Leitura obrigatória fechada e suficiente: o worker consegue executar sem procurar nada fora da lista                       | prompt   |
| 3   | Fronteira de escrita disjunta entre tarefas simultâneas; `target_modules` corretos; nada de `git` para workers             | prompt   |
| 4   | Critérios de aceitação são comandos existentes (`package.json`) ou arquivos verificáveis, com resultado esperado explícito | ambos    |
| 5   | Nenhum valor inventado: prazos, papéis, estados, erros, rótulos vêm de documento canônico ou viram `source_pending`/`OD-*` | ambos    |
| 6   | Tríade respeitada (Architect → Inspector → Engineer) e testes escritos antes da implementação                              | ambos    |
| 7   | Gates não enfraquecidos (nenhum teste relaxado, nenhum `skip`, nenhum arquivo gerado editado à mão)                        | delivery |
| 8   | Vocabulário canônico (tokens de estado, timer, papel, erro) e i18n só na camada de rótulo                                  | ambos    |
| 9   | Fronteira nacional: nada fala com SENATRAN fora de `packages/senatran-adapter` (ADR-0003)                                  | delivery |
| 10  | ADR e OD citados onde a decisão foi tomada; decisões do steering §H respeitadas, não reabertas                             | ambos    |
| 11  | Entrega completa em relação ao critério: nada "deixado para depois" sem registro em §Fora de escopo                        | delivery |
| 12  | Parcimônia: o prompt não manda ler o repositório inteiro; esforço e modelo condizem com `model-ladder.md`                  | prompt   |
| 13  | Matrizes de autorização testam grants positivos e negativas exaustivas para papéis canônicos omitidos; nada por analogia   | ambos    |

## Veredito

- **PASS**: nenhum achado de severidade `high`; achados `low` viram notas.
- **REVIEW**: pelo menos um achado `high` corrigível pelo maestro ou pelo worker sem mudar o plano.
- **FAIL**: o plano ou a entrega contradiz uma definição canônica, uma decisão do Owner, uma ADR ou
  a Constituição; ou a fronteira de escrita foi violada.

Ciclos: o **primeiro** ciclo de cada item é **exaustivo** — liste todos os achados de uma vez. Nos ciclos
seguintes do mesmo item, avalie **somente** as correções dos achados anteriores; um achado novo sobre
texto que não mudou só é admitido se for `FAIL` por definição (contradição canônica, decisão do Owner,
ADR, Constituição ou fronteira de escrita) e deve dizer explicitamente por que não foi levantado antes
(ajuste R-0006).

## Saída (JSON, e nada mais)

```json
{
  "mode": "delivery-review",
  "round": "R-0016",
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [
    {
      "severity": "high | low",
      "item": 4,
      "file": "work/rounds/R-0016/prompts/TASK-0002.md",
      "line": 31,
      "claim": "critério cita `pnpm --filter @detran/rait-web test`, pacote inexistente",
      "fix": "usar `pnpm --filter @detran/ui test` até o app existir"
    }
  ],
  "notes": ["observações não bloqueantes"]
}
```

## Material anexado pelo maestro

**Terceiro ciclo — restrito** ao único achado de
`work/rounds/R-0016/reviews/delivery-review-CTG-0003-2.json` (item 11). O ciclo anterior corrigiu o
estado de R-0011 e tirou a palavra "ativa", mas manteve "critérios de supressão … provados em teste
de componente", o que de fato excedia o provado — o achado é aceito.

O maestro leu os dois specs antes de instruir a correção:
`apps/dashboard/web/src/app/shared/suppressed-cell.component.spec.ts` prova, dada uma célula **já
marcada como suprimida** no dado de entrada, o texto `dashboard.errors.cell_suppressed` com o
limiar, `data-suppressed="true"`, a ausência de `0` e `—` isolados,
`dashboard.errors.cell_threshold_undefined` quando o limiar é nulo e a nota de rodapé por
`aria-describedby`; `features/crashes/pages/sinistros.page.spec.ts` prova a presença de
`dash-suppressed-cell` quando o dado traz barra suprimida e `unavailable_in_version` sem entrada,
sem HTTP. Nada disso decide **quais** células suprimir.

A frase do §WP-D5 foi reescrita nesses termos exatos: D-13 é rota real, com `SuppressedCell` e a
**apresentação acessível da célula já marcada como suprimida** provadas em teste de componente; a
supressão primária **e** secundária propriamente dita — quais células, sobre dado real — e o teste
ponta a ponta pertencem à subida a **L2**, já registrada no backlog; OD-D02/DT-029 segue citada
como a decisão que destravou a tela. `grep "critérios de supressão"` no arquivo é vazio.

Gates reverificados pelo maestro: `node tools/docs/kb/check.mjs` → `OK (756 artifacts, 446 canonical
tokens)`; `pnpm docs:kb:publish-check` → OK; `pnpm format:check` → OK.

### Diff deste ciclo (`git diff d42428aa -- docs`)

```diff
diff --git a/docs/framework/arch/dashboard-build-pack.md b/docs/framework/arch/dashboard-build-pack.md
index 74c8f8cd..ae65448a 100644
--- a/docs/framework/arch/dashboard-build-pack.md
+++ b/docs/framework/arch/dashboard-build-pack.md
@@ -117,10 +117,12 @@ Executado com estas diferenças em relação ao texto abaixo: as 18 telas sobem
 CTG-0002; nenhum `<feature>.client.ts`, nenhum `HttpClient` em `features/`; páginas renderizam
 `dashboard.states.unavailable_in_version`); **P-09 (D-13) não é placeholder** (ao contrário do texto
 original deste WP): é rota real (`/monitoramento/sinistros`) com o componente de célula suprimida
-(`SuppressedCell`) e os critérios de supressão transcritos na ficha `IU-DASH-D-13`, **preparados e
-provados em teste de componente**; a supressão primária **e** secundária sobre dado real, com o
-teste ponta a ponta, pertence à subida a **L2** (facades e `<feature>.client.ts` sobre os clientes
-gerados de `BP-DASH-MONITOR-001`, dados reais nas 18 telas), já registrada como frente em
+(`SuppressedCell`) e a apresentação acessível da célula já marcada como suprimida na ficha
+`IU-DASH-D-13` — texto com o limiar, `data-suppressed`, nunca `0` nem `—` isolados, nota de rodapé
+por `aria-describedby` — **provados em teste de componente**; a supressão primária **e**
+secundária propriamente dita — quais células são suprimidas, sobre dado real — e seu teste ponta a
+ponta pertencem à subida a **L2** (facades e `<feature>.client.ts` sobre os clientes gerados de
+`BP-DASH-MONITOR-001`, dados reais nas 18 telas), já registrada como frente em
 `docs/meta/knowledge-base/backlog.md`. A decisão OD-D02/DT-029 (`dashboard.cell_threshold=10`) é o
 que destravou a tela. Gráficos: nenhuma biblioteca — SVG inline nos componentes
 de `shared/` (`DistributionChart`; M8 do plano da rodada), não uma decisão em aberto. Gates reais
```
