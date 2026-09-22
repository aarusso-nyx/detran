# Reviewer R-0015 — delivery-review CTG-0001 ciclo 2 restrito

Você é `claude opus`, Auditor soft gate de família oposta ao maestro GPT-5.6 Sol. Trabalhe somente
em leitura em `/Volumes/Thiamat II/stech/detran-worktrees/boat-mobile`. Papel: Auditor; não edite.
Este é o segundo e último ciclo. Por `orchestra/README.md` §5 e §10, revise **somente** o fechamento
dos achados já emitidos em `delivery-review-CTG-0001.json`; não introduza achados novos sobre texto
inalterado. Responda somente com o JSON base64 do fim.

## Leitura fechada

1. `work/rounds/R-0015/reviews/delivery-review-CTG-0001.json` e `.bridge.json`;
2. `work/rounds/R-0015/plan.md` adenda A1 e triagem;
3. `work/rounds/R-0015/route-manifest.md`, `contracts/CTG-0001.md`;
4. `work/rounds/R-0015/reports/TASK-0001.md`…`TASK-0005.md` e tasks correspondentes;
5. os arquivos corrigidos abaixo e seu diff atual;
6. somente as fontes citadas no achado original: `web-matrix.json`,
   `IU-TEAT-crashes-list.md`, `IU-BOAT-001.md`, `boat-frontends.md`,
   `boat-error-catalog.md`, `WF-BOAT-001.md` e a matriz mobile.

## Achados anteriores e correções a verificar

1. **i18n vazio:** `boat.pt-BR.json` agora tem 114 valores não vazios. A1 separa 101 textos
   literais de fonte e exatamente 13 lacunas com o marcador rastreável não vazio
   `source_pending:OD-R15-004`. O teste do Inspector prova conjunto/ordem 114, contagens
   17/14/20/61/2, 61 códigos exatos, 13 marcadores exatos e 101 não pendentes.
2. **W-01:** A1 encerra OD-R15-001 pela fonte fechada e fixa `screenId: crashes-list`; OD-R15-002
   continua apenas para papéis e OD-R15-003 apenas para W-05. Manifesto, ficha e teste foram
   alinhados.
3. **caminho do catálogo:** as cinco linhas `boat.*` e CTG-0001 apontam agora para
   `docs/framework/arch/i18n/boat.pt-BR.json`; os três gerados foram regenerados pelo Engineer.
4. **fichas:** as 11 fichas mobile preservam o literal backticked `__previous__`; S-02 preserva a
   ordem da matriz; W-01 não atribui OD-R15-001 à rota; as seções 5/6/8/10/11 foram reescritas por
   tela a partir das fontes, com S-06 enumerando os seis campos de vítima.
5. **gate i18n:** `transitions.test.ts` contém as asserções exatas acima e exige W-01
   `crashes-list`; somente o Inspector alterou testes.
6. **atribuição do fixture:** `reports/TASK-0004.md` e `TASK-0005.md` nomeiam o Inspector TASK-0004
   iteração 2 como autor da correção; o Engineer declara que não editou testes.
7. **temporários da ponte:** não existem arquivos `*.raw.*`/`*.formatted.*` de zero byte em
   `reviews/`; a ponte reteve apenas prompt, JSON normalizado e registro `.bridge.json`.
8. **gate integral:** `pnpm check` do candidato pré-A1 terminou exit 0. Depois da correção, os
   gates focados terminaram: transições 7/7, allowlist 8/8, parâmetros 51/51, verifier
   90/18/62/0, KB 773/446 e publish 201; o maestro repetirá o integral após integrar `main`.

A primeira invocação deste mesmo ciclo formal não criou JSON normalizado nem `.bridge.json`: a
saída codificou indevidamente o objeto inteiro em base64. O maestro decodificou o último objeto
somente para recuperar o único residual anterior, ainda do item 4: em S-02, o segmento final foi
corrigido para `measure-start, crash-start, sync`, como a matriz. Esta repetição conclui o ciclo 2;
não é um terceiro ciclo de findings. Emita o objeto JSON **cru** conforme o schema abaixo. Somente
os valores de `claim_b64`, `fix_b64` e `notes_b64` recebem base64; não codifique o objeto inteiro.

Não reabra OD já decidida nem exija texto inventado para as 13 lacunas que A1 preserva
fail-closed. PASS exige todos os achados anteriores encerrados; REVIEW/FAIL deve citar apenas um
achado anterior ainda aberto.

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
      "claim_b64": "YmFzZTY0",
      "fix_b64": "YmFzZTY0"
    }
  ],
  "notes_b64": []
}
```

Todo claim/fix/note deve ser UTF-8 em base64 RFC 4648 nos campos `_b64`. Não emita campos
textuais, cercas Markdown, aspas internas, barras invertidas ou prosa.
