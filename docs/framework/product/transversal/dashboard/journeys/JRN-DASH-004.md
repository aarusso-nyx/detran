---
id: JRN-DASH-004
title: Administração técnica diante de uma fila de integração parada — do sintoma à causa
status: draft
apps: [dashboard, pec, boat, teat]
sources: [RN-PEC-008, WF-BOAT-003, WF-TEAT-001]
updated: 2026-08-24
---

## Persona e contexto

Diego é administração técnica no DASHBOARD — não opera nenhum caso de nenhum domínio, opera a
**saúde das integrações** que sustentam todos eles: a fila `renach_outbox` do PEC ([RN-PEC-008]),
a cascata de validação municipal→estadual→federal do RENAEST no BOAT ([WF-BOAT-003]), o fluxo de
sincronização offline do TEAT (`sync-batches`, `receipt_protocol`, [WF-TEAT-001]). O que chega até
ele nunca é "o processo X está com problema" — é um sintoma agregado: uma fila crescendo, uma taxa
de erro subindo, um adapter que parou de responder. O trabalho de Diego é ir do sintoma à causa
sem que isso exija abrir cada caso individual represado atrás da fila.

## Narrativa ponta-a-ponta

1. **O alerta que chega a Diego é sobre o cano, não sobre a água.** O DASHBOARD sinaliza: "fila
   `renach_outbox` com 340 registros em `ERROR`, crescendo desde 03h" — não lista os 340
   encontros do PEC represados atrás disso. Listar cada caso individual aqui seria vigilância
   disfarçada de ação; o card de Diego mostra o agregado técnico e um link para a causa provável,
   não um raio-x de dados clínicos que não são da alçada dele.
2. **Primeira leitura — é o canal, é o destino, ou é o dado?** O DASHBOARD distingue três
   categorias de falha técnica visíveis no card: falha de transporte (canal mTLS fora do ar),
   falha de aceite no destino (o RENACH/RENAEST está recusando, não está fora do ar) e falha de
   conteúdo (payload malformado, específico de um subconjunto de registros). Cada categoria pede
   uma ação diferente, e confundi-las faz Diego perder tempo mexendo no lugar errado.
3. **Neste caso, é falha de destino — o certificado do canal expirou à meia-noite.** O sintoma
   (fila crescendo) e a causa (certificado vencido) aparecem juntos assim que Diego abre o
   detalhe — o DASHBOARD não obriga um segundo sistema de monitoramento externo só para achar
   isso, porque a saúde técnica das integrações é parte do escopo declarado do DASHBOARD
   (APP.md).
4. **Ele renova o certificado — fora do DASHBOARD, na infraestrutura real.** O painel não executa
   a correção; ele confirma o diagnóstico e, depois da correção, mostra a fila baixando em tempo
   real conforme os `ERROR` reprocessam automaticamente (retry dedicado, [RN-PEC-008]).
5. **Um caso PEC específico não volta ao normal mesmo com a fila zerada.** Um registro ficou
   preso por payload malformado (categoria 3 do passo 2), não pela falha de certificado — o
   DASHBOARD não fecha esse item junto com o resto; ele reaparece isolado, com detalhe suficiente
   (sem expor conteúdo clínico) para que Diego encaminhe ao time certo, sem inventar que "está
   tudo resolvido" quando não está.
6. **Honestidade sobre o estado durante o incidente.** Enquanto a fila estava travada, qualquer
   tela do DASHBOARD (inclusive as que Marcos e Aline usam) que dependesse desse dado mostrava
   claramente "dado desatualizado desde 03h12 — última sincronização bem-sucedida" em vez de
   silenciosamente continuar exibindo números antigos como se fossem atuais (ver `ux-notes.md`
   §d — este é o caso concreto que justifica a regra).
7. **Encerramento com nota para auditoria, não só para o time técnico.** Diego registra causa raiz
   e duração do incidente; esse registro alimenta tanto o indicador de saúde técnica quanto a
   trilha que um auditor pode precisar reconstruir depois (ver [JRN-DASH-005]) — sem que ele
   precise lembrar disso como tarefa separada.

## Pontos de contato (apps/canais)

DASHBOARD (card de saúde técnica agregada, detalhe de causa provável); infraestrutura real
(renovação de certificado, fora do sistema); console PEC/BOAT/TEAT (apenas para o item isolado do
passo 5, quando a ação exige contexto de caso).

## Métricas de sucesso

Tempo entre início do incidente (primeiro registro `ERROR`) e detecção pelo DASHBOARD; tempo entre
detecção e diagnóstico de causa; nenhuma tela em qualquer domínio exibindo dado potencialmente
desatualizado sem o rótulo de frescor explícito durante o incidente; zero caso individual perdido
silenciosamente dentro da resolução agregada da fila.
