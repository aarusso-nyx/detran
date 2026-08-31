---
id: JRN-TEAT-006
title: Troca de dispositivo em campo — recuperar o turno sem violar a exclusividade de sessão
status: draft
apps: [teat]
sources:
  [
    REF-SENATRAN-997,
    'teat:law/invariants/INV-OFFLINE-001.json',
    'teat:docs/framework/product/workflows/offline-sync.md',
  ]
updated: 2026-08-24
---

## Persona e contexto

Régis é field-agent no meio de um turno de seis horas. Seu dispositivo cai da mão numa abordagem,
a tela racha e o aparelho não liga mais. Ele tem um AIT em rascunho (não finalizado) e três AITs
já finalizados localmente, ainda não sincronizados — a última janela de conectividade foi há 40
minutos. Régis tem um dispositivo reserva na viatura. O impulso óbvio é logar no reserva e
continuar como se nada tivesse acontecido. **É exatamente esse impulso que esta jornada existe
para corrigir**: a Portaria SENATRAN 997/2022 proíbe o mesmo agente logado simultaneamente em
mais de um equipamento, e determina que registros do mesmo agente em aparelhos diferentes, no
mesmo intervalo de tempo, **não sejam processados** — sejam apurados pela autoridade de trânsito
como possível anomalia ([REF-SENATRAN-997] Anexo II, h). Se Régis simplesmente troca de aparelho
sem declarar o incidente, o próprio ato de continuar trabalhando pode fazer seus AITs legítimos
caírem em apuração como se fossem fraude.

**Nota de modelagem.** A norma federal estabelece a **proibição** e a **consequência** (bloqueio
de processamento + apuração), mas não descreve o procedimento operacional de troca de aparelho em
campo — isso é decisão de produto que esta jornada propõe, sinalizada abaixo onde não há citação
de artigo específico.

## Narrativa ponta-a-ponta

1. **Falha do dispositivo.** Tela quebra, aparelho não liga. Régis tem: 1 rascunho não finalizado
   (perdido se o dispositivo não for recuperável — só existia localmente, nunca foi finalizado
   nem hasheado) e 3 AITs finalizados localmente, com `content_hash` e chave de idempotência, mas
   ainda não sincronizados (dados fisicamente presos no aparelho até ele ligar de novo ou ser
   recuperado).
2. **Não fazer — logar direto no reserva.** Se Régis autentica no dispositivo reserva e continua
   lavrando, e o dispositivo quebrado eventualmente voltar a ligar (equipe técnica recupera,
   bateria reconecta sozinha, etc.) e tentar sincronizar seus 3 AITs pendentes, o backend verá
   registros do mesmo agente em dois dispositivos com janelas de tempo sobrepostas — exatamente a
   condição que a norma manda **não processar** e **apurar** ([REF-SENATRAN-997] Anexo II, h).
   Isso não é um erro técnico a ser corrigido depois: é uma regra de segurança contra
   personificação/fraude, e trata sessão concorrente não declarada como suspeita por padrão.
3. **Fazer — declarar o incidente antes de continuar.** Régis contata o field-supervisor
   (rádio/telefone, fora do TEAT) e relata a falha do dispositivo **antes** de logar no reserva.
   O supervisor registra o incidente — proposta de produto: uma tela/ação "declarar falha de
   dispositivo" acessível a field-supervisor (e, idealmente, também ao próprio agente ao logar em
   um dispositivo diferente do último usado), que cria um evento explícito de handoff. Este evento
   é o que permite à retaguarda, mais tarde, diferenciar "troca de aparelho autorizada e
   documentada" de "sessão concorrente anômala" quando os registros dos dois dispositivos
   chegarem — sem essa declaração, o sistema não tem como saber a diferença e trata como o pior
   caso por padrão.
4. **Novo dispositivo, nova reserva de numeração.** No dispositivo reserva (já homologado e
   autorizado — [RN-TEAT-003]), Régis autentica; o app pede uma nova reserva de faixa de
   numeração ([WF-TEAT-002]), porque a reserva antiga estava vinculada ao par agente+dispositivo
   quebrado, não é transferível automaticamente entre aparelhos. Régis não "continua de onde
   parou" com os mesmos números — começa uma nova faixa consumida a partir do dispositivo novo.
5. **O rascunho perdido não é recuperável no calor do momento.** O AIT que estava em preenchimento
   no aparelho quebrado precisa ser refeito do zero se a infração ainda for constatável (o
   condutor pode já ter saído do local). Esse é o custo operacional real da falha — motivo pelo
   qual a orientação de produto (não normativa) devia ser: finalizar e deixar cada AIT tentar
   sincronizar a cada janela de conectividade, em vez de acumular vários rascunhos abertos ao
   mesmo tempo antes de finalizar qualquer um.
6. **Os 3 AITs finalizados não se perdem — só ficam presos.** Diferente do rascunho, os três atos
   já finalizados têm `content_hash` e estão na fila local cifrada do aparelho quebrado
   ([RN-TEAT-001]). Se o aparelho for recuperado (conserto, nova bateria, resgate pela equipe
   técnica) depois do turno, ele ainda pode sincronizar — mas só depois que o incidente já
   declarado no passo 3 permitir à retaguarda tratar essa sincronização tardia como legítima, não
   como concorrência suspeita.
7. **Retomada do turno no dispositivo novo.** Régis continua o turno normalmente no reserva —
   abordagens seguintes, novo AIT, etc. — como [JRN-TEAT-001], mas agora com o incidente de troca
   já no histórico do turno.
8. **Bodycam, se aplicável.** Se a câmera corporal estiver acoplada ou controlada pelo mesmo
   aparelho, a troca de dispositivo também pode gerar uma lacuna de gravação — que precisa ser
   comunicada pelo mesmo mecanismo de falha de [JRN-TEAT-005] passo 5, não silenciosamente
   ignorada só porque a atenção do momento está no aparelho principal.
9. **Fim de turno — conciliação.** No resumo do turno ([JRN-TEAT-001] passo 10), Régis (ou o
   supervisor) vê os atos dos dois dispositivos consolidados, com o incidente de troca visível,
   não escondido dentro de uma lista genérica de sincronização.

## Pontos de contato (apps/canais)

Aplicativo mobile TEAT (proposta: nova tela/ação "declarar falha de dispositivo", hoje não
presente no inventário de 68 telas — ver `_intake/ux-notes.md` §b); backoffice web TEAT
(field-supervisor registra/confirma o incidente); rádio/telefone da operação (canal externo ao
TEAT para o contato inicial); fila de sincronização (`sync`, `sync-item`, `sync-conflict`).

## Métricas de sucesso

Zero AITs legítimos bloqueados/apurados por sessão concorrente não declarada; tempo entre falha de
dispositivo e declaração do incidente ao supervisor; 100% dos dispositivos recuperados
pós-incidente sincronizando sem conflito não resolvido; zero rascunhos perdidos por acúmulo de
múltiplos AITs abertos simultaneamente sem finalizar.
