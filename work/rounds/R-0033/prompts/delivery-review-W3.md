# R-0033 — delivery-review W3, ciclo 1

Papel: **Auditor** (Constituição Art. 7; somente leitura). Você é o reviewer da
família **Claude**, invocado pela ponte `tools/orchestra/bridge.sh claude opus`.
`opus` é o alias da CLI; não infira dele modelo exato ou versão. O maestro atual
é da família **Codex**. A revisão cobre a entrega inteira da R-0033, incluindo o
checkpoint RAIT preservado e a nova prévia Portal, e não apenas o último commit.

Trabalhe somente em leitura na worktree
`/Volumes/Development/.codex/worktrees/r0033-portal-preview/detran`, branch
`codex/r0033-portal-preview`. Não edite arquivos, não crie relatórios, não execute
instalação, builds, testes, servidores ou comandos de evidência que escrevam estado;
não faça checkout, commit, push, merge, close ou seal. Inspecione fontes, diffs e
recibos existentes. A resposta inteira deve ser um único objeto JSON estrito,
sem cercas de código, preâmbulo ou texto posterior. A declaração de papel exigida por
AGENTS.md deve aparecer dentro do JSON, como primeira string de `notes`
(`Papel: Auditor — Artigo 7`), nunca como prefixo em texto: o parser da ponte
rejeita qualquer preâmbulo ou cerca de código.

## Autoridade e limites

Leia `AGENTS.md`, `.devai/pin/constitution.md` Art. 6/7/10/41, `CODESTYLE.md`,
`work/campaigns/C-0003-produto-primeiro.md` §4 e C-0002 A-C2-16. Leia
`work/rounds/R-0033/AUTHORIZATION.md` inteiro, em especial B3, e `plan.md`
(incluindo A4/A5/A6 e continuação W3). B3 autoriza concluir Portal/checks e abrir
PR; **não autoriza merge, round close ou round seal**. Os registros de famílias,
versões e resultados de W1/W2 são históricos, não medições da árvore atual.
OD-C3-007/008 estão decididas; OD-C3-009 permanece aberta e não bloqueia a prévia.
Não amplie papéis nem invente produto, prazo, constante ou autorização.

Inspecione C-01…C-09 conforme o plano, os contratos e os recibos da árvore atual.
C-10 deve ser relatado honestamente: esta revisão fornece seu veredito de
pré-PR; CI remoto e efeitos de integração/close/seal permanecem pendentes conforme
seu estágio. Não exija merge/close/seal como condição para **abrir** o PR. Não
transforme a pendência autorizativa desses efeitos em defeito de implementação,
nem declare rodada fechada ou toda C-10 satisfeita antes de sua realização.

## Material obrigatório e identidade da entrega

1. Leia `git status --short`, `git diff --stat origin/main...HEAD`,
   `git diff --name-status origin/main...HEAD` e **todo o diff**
   `git diff origin/main...HEAD`, em blocos se necessário. Leia também
   `git diff` e `git diff --cached` para alterações locais pendentes e identifique
   arquivos não rastreados relevantes pelo status; leia seus conteúdos finais.
   Nenhum recibo ou nova entrega pode ficar invisível por ainda não estar no HEAD.
2. Registre em `notes` o HEAD observado, a base `origin/main` e a existência de
   alterações pendentes. O checkpoint original é `aca40880`; main `3ec14d3a` foi
   integrado no merge `311412f9`. Confirme a identidade atual por leitura de Git;
   não assuma que esses hashes são o HEAD final.
3. Leia os arquivos finais alterados, não apenas seus relatórios. Fontes centrais:
   `docs/framework/arch/frontend-preview-mode.md`, `frontend-wiring-pattern.md`,
   `rait-web-journeys/JW-01-analista.md`, `rait-fixtures.md`,
   `fixtures/rait-fixtures.json`; `apps/{rait,portal}/web/angular.json`,
   `src/main.ts`, `src/main.preview.ts`, `src/app/preview/**`; manifestos,
   guards/sessão, facades/clientes e fontes de fixtures que essas implementações
   consomem. Leia os specs novos e compare testes existentes com `origin/main`.
4. Leia `work/rounds/R-0033/{inventory-rait-web,inventory-portal-web}.md`, tarefas
   0001…0009, relatórios de tarefas e `closure.draft.json`, distinguindo histórico
   de resultado reexecutado. Consulte `work/rounds/R-0033/reports/W3-final-gates.md`
   quando criado: será o recibo consolidado dos gates atuais. Se ausente, registre
   ausência; não invente resultados. Leia quaisquer outros relatórios W3 presentes
   sob `reports/`, inclusive arquivos pendentes no status, e as saídas a que referem.
5. Leia artefatos finais sob `work/rounds/R-0033/preview/{rait-web,portal-web}/`,
   incluindo smoke, roteiro/scripts, `execucao.md`, manifestos e relatórios axe.
   Capturas e bundles gerados podem ser posteriores ao checkpoint: confira
   correspondência de identidade/contagens/resultado, sem tratar hash antigo como
   prova do novo build. Consulte caminhos gerados apontados no relatório final,
   mesmo se ignorados pelo Git. Ausência de medição é `not run`/`blocked`, nunca PASS.

## Rubrica de entrega

- **C-01, isolamento dos bundles:** ambos apps têm configuração própria de build
  e serve `preview`, entrada isolada e smoke do servidor sem backend. Inspecione
  recibos de builds production, development e preview: marca e dependências da
  prévia não podem vazar para production/development; marca deve existir no preview.
- **C-02, guardas e rede:** RAIT mantém as 74 entradas/64 páginas do manifesto;
  Portal mantém as **38 rotas canônicas**. O interceptor bloqueia toda requisição
  fora de GET de assets permitido; sem `/v1`, SSE real ou outro acesso de backend.
  Guardas reais permanecem em uso; sessão/persona sintética é limitada à prévia,
  derivada das fontes canônicas e sem concessão escondida de permissão em produção.
  Examine cobertura de estados e como leituras unitárias/ausentes são representadas.
- **Exceção Portal obrigatória:** `junta_medica` está ausente do catálogo canônico
  de serviços. `/exames/:examId/junta/nova` deve passar pelo guard real e terminar
  honestamente em `/servico-indisponivel/junta_medica`. Isso conta como resultado
  guardado da rota canônica, não licença para inventar serviço disponível, remover
  a rota da cobertura ou tornar o guard permissivo. Confira a fonte e a documentação.
- **C-03:** faixa visível em todas as páginas/saídas guardadas; ações não executam
  comandos nem fingem sucesso. O log/marca de ação não funcional é observável.
  Delegações Portal permanecem indisponíveis conforme contrato; RAIT mantém M8.
- **C-04/C-05:** JW-01 segue passos 1–8 e prova negativa dos antigos 9–10 conforme
  OD-C3-007; confira recibos atuais de capturas 360/768/1280 e axe (zero
  serious/critical), mantendo moderate/minor e defeitos conhecidos visíveis.
  Não atribua resultados RAIT ao Portal nem exija jornada adicional não autorizada.
- **C-06:** fixtures rastreáveis à JSON canônica, contratos/seed ou fixtures Portal
  existentes; sem dado real, tenant/persona inventado ou valores normativos novos.
  A4/A5: 49 chaves RAIT; 14 leituras passaram a ter fonte, mas Infraction/Notification
  continuam sem coleção e campos sem fonte permanecem `source_pending`. Slots podem
  ficar vazios por filtro/ID mesmo com coleção presente; confira a causa no código.
- **C-07, sensores:** verifique os resultados atuais de typecheck/lint/test/build e
  `pnpm check` no relatório final, separando baseline, falha nova e infraestrutura.
  Todos os testes **preexistentes em origin/main permanecem inalterados**; novos
  testes não podem enfraquecer intenção, ocultar erro ou substituir guarda real.
  Não confunda correção histórica em specs novos desta rodada com edição de teste
  preexistente de main. Confirme também que nenhum gate/threshold foi enfraquecido.
- **C-08:** fronteiras do diff da rodada respeitadas; sem feature em backend,
  senatran-adapter, gerados, pin STYNX, workflows, `.devai/`, `record/`, law/register
  ou policy.ts. Mudanças herdadas do merge de main não são entrega da rodada;
  use o diff contra a base atual para atribuir responsabilidade.
- **C-09:** contratos, padrão v0, inventários e registros de continuação/status
  coerentes com o código e os resultados reais; backlog/follow-ups preservados.
  Orçamento estimado não pode ser apresentado como consumo medido. Limitações e
  tarefas adiadas devem permanecer explícitas, sem declarar dashboard/TEAT entregues.

Não aprove com base só em relatos. Para cada achado cite arquivo relativo e linha
atual e explique a divergência concreta com fonte/critério. Não crie achados por
preferência de estilo sem requisito ou por resultado pendente de integração.

## Veredito e saída

`PASS`: nenhum defeito material pendente para a entrega pré-PR; notas low e etapas
pós-PR pendentes podem permanecer explicitamente. `REVIEW`: evidência insuficiente,
incerteza material ou defeito corrigível que impeça aceitar o candidato atual.
`FAIL`: violação concreta de autoridade, segurança/isolamento, fonte inventada,
falso sucesso, enfraquecimento de sensor ou critério material comprovadamente violado.
Reporte infraestrutura/timeout como falta de observação, sem fabricar veredito de teste.

Responda somente JSON válido com estas chaves:

- `mode`: `delivery-review`
- `round`: `R-0033`
- `cycle`: número `1`
- `verdict`: `PASS`, `REVIEW` ou `FAIL`
- `findings`: array de objetos com `severity` (`high` ou `low`), `file` (caminho
  relativo), `line` (inteiro positivo), `claim` (achado e critério/fonte), `fix`
  (correção necessária sem autorizar mutação). Use array vazio se nenhum achado.
- `notes`: array de strings com identidade observada, alcance/limites da revisão,
  resultados conferidos e pendências reais, incluindo C-10 pós-PR/integração.
