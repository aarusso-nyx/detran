---
id: JRN-TEAT-004
title: Medida administrativa com remoção — espera do reboque, guarda monitorada e comunicação ao cidadão
status: draft
apps: [teat]
sources:
  [
    REF-CONTRAN-1025-2026,
    'REF-CTB-165-277-medidas-alcoolemia',
    'teat:docs/framework/product/blueprints/BP-AIT-LIFECYCLE-001.json',
  ]
updated: 2026-08-24
---

## Persona e contexto

Denise é field-agent, sozinha num trecho de via arterial ao meio-dia, calor extremo, sem sombra.
Um veículo é flagrado em situação que enseja remoção (art. 271 do CTB). O momento mais difícil da
jornada de Denise não é o preenchimento do termo — é o tempo de espera pelo reboque, com o
proprietário do carro ao lado, muitas vezes hostil, questionando por que o veículo "vai ser
levado" quando ele está ali. O desenho desta jornada existe para dar a Denise, primeiro, uma
alternativa que evita a remoção física quando cabível (guarda monitorada — novidade da Res.
CONTRAN 1.025/2026), e segundo, uma forma de documentar tudo sem depender de o proprietário
concordar ou assinar.

## Narrativa ponta-a-ponta

1. **Constatação da hipótese de remoção.** Denise identifica a irregularidade que autoriza
   remoção (vinculada a um AIT já lavrado ou em lavratura). Bodycam obrigatória
   ([JRN-TEAT-005]) já está ativa desde o início da abordagem.
2. **Checagem de elegibilidade para guarda monitorada (`measure-start` → novo passo, ver
   `_intake/ux-notes.md` §b para o delta de tela).** Antes de acionar o reboque, a tela apresenta
   um checklist objetivo — não um texto de lei para Denise interpretar — com os 9 requisitos do
   art. 17 §1º da Res. 1.025/2026 (veículo em condições de circular, sem indício de adulteração,
   condutor habilitado presente para retirar, sem registro de furto/roubo, sem restrição judicial,
   licenciado em ao menos um dos últimos três exercícios, entre outros). Se todos os itens
   marcam "sim" e há solução de monitoramento homologada disponível na operação, Denise pode
   oferecer guarda monitorada como alternativa: o veículo fica com o proprietário, sob
   monitoramento eletrônico, sem reboque — **de-escalada real da tensão do momento**, porque o
   carro não sai do lugar.
3. **Guarda monitorada — ativação (se elegível).** Denise registra a autorização, vincula o
   dispositivo de monitoramento homologado ([REF-CONTRAN-1025-2026] art. 17 §4º) e explica ao
   proprietário, com um texto pronto, a única consequência que importa nesse momento: violar o
   monitoramento vira **nova infração autônoma** (art. 239 do CTB), autuada pelo próprio órgão, e
   não dá direito a nova guarda monitorada para o mesmo fato (art. 17 §3º). Fluxo encerra aqui,
   sem espera de reboque.
4. **Remoção física — sem elegibilidade ou sem solução de monitoramento disponível.** Denise
   aciona o reboque e entra no modo "aguardando reboque": tela permanece acessível, mas o
   trabalho de campo dela não pode ficar bloqueado esperando — ela precisa poder abrir um novo
   caso (outra abordagem) enquanto esse aguarda, sem perder o estado do termo em preenchimento.
   Esse é o ponto de maior desconforto físico do turno: sol a pino, sem cobertura, tempo de espera
   variável.
5. **Termo de Recolhimento do Veículo — conteúdo mínimo (`removal`/`inventory`/`measure-term`,
   conteúdo ampliado).** Quando o reboque chega, Denise preenche o termo com os 7 campos mínimos
   do _caput_ do art. 14: órgão responsável, identificação do veículo, número do AIT/ato que
   determinou a remoção, local/data/hora, fundamento legal, local de guarda designado,
   identificação de proprietário/condutor (quando possível) — mais os 4 do §1º: objetos deixados
   no veículo por conveniência do condutor, equipamentos obrigatórios ausentes, estado geral de
   lataria/pintura/pneus, e prazo para retirada sob pena de leilão. Isso é inventário fotografado
   item a item, não um campo de texto único — protege tanto o cidadão (registro do estado do
   carro) quanto Denise (nenhuma alegação posterior de item "sumido" sem registro contemporâneo).
6. **Assinatura/recusa não bloqueia a validade.** O proprietário se recusa a assinar o termo,
   irritado. A tela não trava nem pede a Denise para "convencer" — a norma já resolve isso:
   proprietário/condutor presente no momento do recolhimento é considerado notificado **mesmo que
   se recuse a assinar** ([REF-CONTRAN-1025-2026] art. 14 §2º) — mesmo padrão de três resultados
   de [RN-TEAT-005]. Denise só registra a recusa, sem precisar negociar.
7. **Proprietário ausente.** Em outro caso do turno, o carro está irregular mas ninguém está
   presente. Termo é emitido do mesmo jeito; a tela informa a Denise que o órgão tem até 10 dias
   para notificar o proprietário (preferencialmente via SNE, com marco de exclusividade do SNE a
   partir de 1º/1/2027 — [REF-CONTRAN-1025-2026] art. 15) — prazo que corre **fora** do TEAT, mas
   que a tela deveria mencionar para Denise não prometer "não vai saber de nada por enquanto".
8. **Registro eletrônico junto ao Sivec.** O termo, quando integrado, alimenta o Sistema
   Integrado de Veículos Custodiados — candidato a nova integração nacional (hoje não modelada em
   [APP-TEAT], ver `_intake/proposals.md`); do ponto de vista de Denise, é só mais um envio
   automático no lote de sincronização, sem passo manual extra.
9. **Comunicação ao cidadão no local.** Antes de encerrar, Denise entrega ao proprietário/condutor
   (ou, se ausente, isso fica registrado como pendente) uma explicação curta e concreta: onde o
   veículo será guardado, o que fazer para retirá-lo, e que ele pode contestar a medida pelos
   canais do órgão depois — sem prometer prazo que não é dela para prometer.

## Pontos de contato (apps/canais)

Aplicativo mobile TEAT (`measure-start` → checklist de guarda monitorada (novo) → `retention`/
`removal`/`inventory`/`transshipment`/`measure-term`/`measure-done`); bodycam ([JRN-TEAT-005]);
Sivec (integração futura, fora do MVP); PORTAL (destino da comunicação formal de notificação,
fora do escopo direto do TEAT).

## Métricas de sucesso

% de remoções evitadas via guarda monitorada quando elegível (proxy de de-escalada); zero termos
de remoção finalizados sem os 7+4 campos mínimos; zero bloqueio do app durante espera de reboque
(agente consegue abrir novo caso); tempo entre recolhimento e notificação do proprietário ausente
dentro do prazo de 10 dias.
