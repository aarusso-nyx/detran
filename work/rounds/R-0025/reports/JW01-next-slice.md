# JW-01 — próximo recorte recomendado após PR #193

Architect, Art.7; recomendação, não autorização de implementação ou decisão de produto.

## Recomendação: fila de defesa → claim-next → dossiê de instrução

Primeiro entregar o claim de um caso **já DISTRIBUIDO e elegível**, com pool real
resolvido a partir de fonte canônica e principal autenticado. O comando existente
faz DISTRIBUIDO→EM_INSTRUCAO; o frontend deve abrir o dossiê/instrução do caso
retornado e atualizar a fila por leitura real, sem exigir SSE. Admissibilidade
fica antes dessa etapa, conforme o recorte já integrado; não executar triagem
novamente no caso em instrução. A navegação para dossiê é proposta a ratificar
na reconciliação da jornada/ficha, não alteração aprovada neste recibo.

É a menor continuação que desbloqueia trabalho real do analista sobre o backend
existente. Não incluir simultaneamente anexos de ofício, diligências, minuta,
assinatura ou SSE estrutural. Esses itens dependem do caso corretamente atribuído.

## Fontes e bloqueios a resolver antes de escrever código

- `apps/rait/web/src/app/data/api/worklist.client.ts`: claimNext ainda unavailable,
  body genérico/retorno RaitAssignment e comentário aponta WORKLIST. A operação
  real está no contrato CASE; conferir corpo/resposta/status/header atuais do
  OpenAPI gerado antes de ligar. Não reutilizar o tipo por semelhança.
- `features/fila/pages/defense-pool-queue.page.ts`: pool é string vazia
  DEFENSE_POOL_ID_PENDING e navegação vai para triagem. OD-R12-054 e OD-R25-016
  continuam relevantes: resolver pool e sequência com fonte, sem UUID fixo,
  primeiro pool arbitrário ou mudança de transição por conveniência.
- `rait-case-command.service.ts`: candidato precisa ser DISTRIBUIDO, mesmo tenant,
  instância/unidade compatíveis, sem assignment ativo/impedimento. Membro deve ter
  escala publicada, disponibilidade diária e limite WIP fonteado. Preservar ordem
  de prioridade legal e protocolo, lock skip locked e exclusão de prioridade não
  apurada; conferir a implementação e suas provas atuais, sem importar números
  normativos de documentação histórica.
- Um caso apenas ADMITIDO não é candidato ao claim atual. `receive` tem arco
  existente para DISTRIBUIDO, mas isso não autoriza expô-lo ao analista nem criar
  transição automática. Para a primeira prova, fixture backend fonteada pode
  começar DISTRIBUIDO; o handoff ADMITIDO→DISTRIBUIDO precisa de mapeamento
  canônico de comando/papel e de contrato separado se não estiver coberto.
- OD-R25-017 continua aberta: tenant RLS não demonstra acesso individual. Se
  o recorte exigir um novo predicado, obter a fonte/decisão antes da concessão;
  não fazer o guard ignorar esse limite nem relatar prova inexistente.

## Aceitação proposta do pacote

1. Architect reconcilia JW-01/ficha/OD016, origem do pool, tipo HTTP e handoff de
   distribuição; permanece fail-closed onde faltar fonte. O contrato é revisado
   antes dos sensores. Não marcar OD016 resolvida por esta recomendação.
2. Inspector escreve RED para transporte real e routed page: seleção do pool,
   navegação pós-claim, fila vazia, WIP, indisponível/impedido, tenant errado,
   grants negativos, retry idempotente e dois claims concorrentes sem duplicação.
3. Engineer liga somente esse comando e leitura/navegação necessárias, usando
   kit/interceptors/policy atuais. Validar a semântica real de If-Match do pool;
   não copiar o token CASE/version do recorte anterior automaticamente.
4. HTTP+DB reais, frontend completo, lint/types/build, preview sem escrita/rede,
   browser com fixtures elegíveis e erros visíveis, root check e review cruzada.
   IdP real continua prova separada; nenhum PASS para a jornada integral.

Alternativa se pool/handoff permanecer sem fonte: trabalhar primeiro somente o
contrato de distribuição/pool, preservando o comando indisponível. Não saltar
para minuta nem inventar permissão para evitar a dependência. Retomar código
requer autorização do Owner sobre o pacote reconciliado.
