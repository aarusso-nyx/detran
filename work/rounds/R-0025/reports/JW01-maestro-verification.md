# R-0025 — A-C3-01, primeiro PR de admissibilidade

Engineer, Art.7. Base main d871c1d4; checkpoint original 9e69d867 preservado;
merge de reconciliação 5809388b. A autorização e o recorte escolhido pelo Owner
estão em AUTHORIZATION.md. Este relatório reúne verificação, não encerra a rodada.

## Entrega observada

PROTOCOLADO → triagem → três critérios humanos e tempestividade calculada no
servidor → admissão/não conhecimento existentes. Contratos CASE/OpenAPI gerados
pelas fontes, sem mutação manual de gerados. Escrita contextual mantém versão,
Idempotency-Key, ator/tenant, transação, auditoria e outbox. Guard usa GET/RLS;
main ativa os interceptors DI existentes; preview mantém escrita indisponível.

Browser real revelou token de cache ETag diferente do contador de comando,
classificação de erro SDK e atualização após decisão sem SSE. Sensores RED
precederam cada correção. Re-save A→B→A e decisões finais foram observados no
browser e banco; recibo detalhado em JW01-browser-smoke.md.

## Gates executados

- Geração, blueprints:check: PASS; 258 operações/72 clientes em sincronia.
- Kernel backend oficial completo: PASS antes da correção de review1; recibo
  JW01-backend-kernel-initial-pass.log. Após correção, todos os tiers afetados
  repetidos: CASE unit175, APP unit138, CASE integration36, HTTP50 PASS.
  Blueprint/decorators/policy/RLS completos estão nos recibos individuais.
- Frontend final: 5085 PASS, 133 TODO preexistentes, zero falhas; typecheck/lint,
  build produção, build preview e smoke estático PASS (TASK-0027.md).
- Dois baseline failures de i18n investigados: chave canônica faltante incorporada
  ao catálogo, inventário integral preservado. Fixtures legadas ETag/bodyversion
  alinhadas à resposta válida; nenhum gate removido.
- Doctor final: PASS, DEVAI2.2.0, pin Constituição1.0.2 e cadeia válida.
- Root pnpm check: PASS exit0 em 2026-10-18T19:06Z, log JW01-check-complete.log. Inclui todas as suítes/builds do script; 5085 PASS/133 TODO na RAIT.
- Review cruzada: prompt REVIEW→PASS; delivery original REVIEW→PASS. Review1
  teve wrapper inválido, recuperação exata com hashes e falha da ponte preservadas.
  Browser delta: PASS sem achados, bridge JSON/hashes verificados; resultado separado do PASS original.

## Preservação e limites

Checkout primário limpo; três fingerprints de configuração de máquina idênticos
à linha de base. Snapshots/console próprios movidos com SHA256 verificado para
recovery local; manifesto JW01-local-preservation.json. Checkpoint original intacto.
record/, law/ e .devai/ sem alterações contra main; nenhuma evidência histórica
reescrita, prova pós-merge, fechamento, selo ou merge autorizado por este PR.

Sessão browser sintética em perfil local, guards/interceptors/HTTP/DB reais:
não é prova criptográfica IdP. OD-R25-017 mantém acesso individual intratenant
sem fonte; OD-R25-016 mantém a divergência claim/instrução. Claim, instrução,
minuta, demais comandos/jornadas e aceitação integral continuam pendentes.
Review e testes deste recorte não promovem JW-01/R-0025 a completas.
