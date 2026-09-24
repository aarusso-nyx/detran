# Reviewer R-0015 — delivery-review CTG-0002 ciclo 2 restrito

Você é `claude opus`, Auditor soft gate da família oposta ao maestro GPT-5.6 Sol. Trabalhe somente
em leitura em `/Volumes/Thiamat II/stech/detran-worktrees/boat-mobile`. Papel: Auditor; não edite.
Este é o segundo e último ciclo. Revise **somente** o fechamento dos 16 findings já emitidos em
`delivery-review-CTG-0002.json`; não introduza achado novo sobre texto inalterado nem reavalie
CTG-0001. Responda somente com o JSON estrito do fim.

## Leitura fechada

1. `work/rounds/R-0015/reviews/delivery-review-CTG-0002.json` e `.bridge.json`;
2. `work/rounds/R-0015/plan.md` — somente A5 e Triagem;
3. `work/rounds/R-0015/reports/TASK-0012.md`, `TASK-0008.md`, `TASK-0009.md`, `TASK-0010.md` e
   `TASK-0011.md`;
4. somente os arquivos alterados depois do primeiro parecer (`git diff 5c606ea4..HEAD`) e as
   fontes/linhas citadas nos findings originais;
5. `work/rounds/R-0015/tasks/TASK-0008.json`…`TASK-0012.json` e as cinco entradas correspondentes
   de `compositions.json`.

## Achados e correções a verificar

1. **15 gates:** `gates.ts` sempre delega a `schema.safeParse`; o spec usa payload real válido e
   inválido para cada linha, inclusive vítimas, as duas operações RENAEST e retenção.
2. **axe mobile:** os 12 componentes BOAT reais são montados e executam axe; no host TEAT os 12
   boundaries reais também são montados no ramo BOAT de `app.a11y.spec.ts`.
3. **axe/literal web:** as cinco páginas reais executam axe e o DOM renderiza a orientação literal
   e o vocabulário `sinistro`; o mesmo ocorre no conjunto mobile.
4. **victimAccessGuard:** os nove papéis são iterados; somente os dois permitidos passam, com
   negativos de purpose e auditoria.
5. **W-03/W-04:** `actionAllowedRoles` é verificado por presença/ausência para cada um dos nove
   papéis; A5 explicita que o backend permanece autoritativo.
6. **portas:** os seis InjectionTokens recebem doubles no TestBed e cada método é executado.
   OD-R15-006 registra que nenhuma fonte atribui consumidor/chamada por tela; por “nada inventado”,
   não se criou consumidor sem fonte. Hardware real continua fora.
7. **contrato web:** tabela, fixture, runtime e teste agora fixam módulo `sinistros`, client
   `@detran/boat-mobile`, `data.titleKey` TEAT, `h1` BOAT e W-04 por
   `extension`/`sseDeniedReason`, nunca pela string do client.
8. **contagem mobile:** contratos usam 58 habilitadas + D-05 disabled = 59 entradas não-BOAT;
   com 12 boundaries, total 71.
9. **relatório Inspector:** foi reescrito para descrever somente execução real e os REDs que foram
   depois fechados pelos Engineers.
10. **módulo morto:** `apps/teat/web/src/app/features/crashes/**` foi removido após A5 atribuir a
    remoção a TASK-0010.
11. **config órfã:** `apps/boat/mobile/tsconfig.transitions.json` foi removido.
12. **esforço:** `compositions.json`, tasks e tabela do plano refletem TASK-0010 Luna/high e as
    demais escaladas reais; hashes `PC-*` conferem.
13. **histórico:** `waves.md` registra prompt-review 5…8, Emendas 2/3, PASS do quarto ciclo e FAIL
    do primeiro delivery-review, sem antecipar PR/merge.
14. **build pack:** distingue entrega estrutural e binding completo de forms como handoff, mas
    mantém loaders/i18n/orientação/axe como gates desta entrega já executados.
15. **ownership OD-R15-002:** A5 atribui explicitamente a transcrição a TASK-0012.
16. **catálogo/loaders:** teste faz igualdade profunda entre catálogo canônico e
    `BOAT_PT_BR_CATALOG`, exercita loaders mobile/web reais e monta superfícies para provar que os
    13 marcadores não são renderizados.

O maestro reexecutou após todas as correções: BOAT 15/15, TEAT mobile focal 190/190, TEAT web
611/611 e `pnpm check` integral exit 0. PASS exige todos os 16 achados encerrados. REVIEW/FAIL deve
citar somente um dos 16 achados anteriores ainda aberto; não crie finding sobre requisito novo ou
texto não alterado.

## Saída

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

Todo claim/fix/note deve usar somente os campos `_b64` em base64 RFC 4648. Não emita cercas,
prosa, preâmbulo nem repita veredito anterior.
