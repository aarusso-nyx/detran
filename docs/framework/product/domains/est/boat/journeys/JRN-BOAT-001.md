---
id: JRN-BOAT-001
title: Agente chega a sinistro com vítima ferida — a cena viva, socorro primeiro e a vítima levada antes dos dados completos
status: draft
apps: [boat, teat]
sources:
  [
    'REF-CTB-sinistro-cena-renaest',
    'REF-CONTRAN-808-2020',
    'REF-DETRANAM-TALAO-BODYCAM',
    'RN-BOAT-001',
    'RN-BOAT-003',
    'RN-BOAT-004',
    'UC-BOAT-001',
    'UC-BOAT-002',
    'UC-BOAT-003',
    'WF-BOAT-001',
  ]
updated: 2026-08-24
---

## Persona e contexto

Yasmin é field-agent, sozinha na viatura, uma da manhã na BR-174 sentido norte, saída de Manaus.
Chuva forte, pista sem iluminação além dos faróis, calor ainda alto mesmo de madrugada. Uma moto
colidiu com um carro; o motociclista está caído no acostamento, consciente mas com fratura exposta
na perna, gemendo. Atrás da cena, o trânsito já represa — motoristas buzinam, um caminhoneiro grita
para "liberar logo essa pista". A bodycam de Yasmin está gravando desde o início do turno
([REF-DETRANAM-TALAO-BODYCAM] art. 5º — todo o período de serviço operacional, não só a partir da
autuação), então a cena inteira já está sendo registrada antes de qualquer toque na tela. O maior
risco desta jornada não é preencher um campo errado — é a tela do BOAT competir pela atenção de
Yasmin no momento em que ela mais precisa estar olhando para a vítima, não para o celular.

## Narrativa ponta-a-ponta

1. **Chegada — a tela não exige nada antes do socorro.** Yasmin desce da viatura e vai direto à
   vítima; o celular fica no bolso. O app não força abertura de registro para "começar a contar
   tempo" — abrir o `CrashRecord` (`crash-start`, UX-MOB-060, [UC-BOAT-001]) é o primeiro toque
   dela, não o primeiro segundo da chegada. Isso é decisão de produto (não há dever legal do agente
   equivalente ao art. 176, I, que obriga o **condutor envolvido** a socorrer) — mas o desenho da
   tela reflete o mesmo princípio de prioridade: nenhum fluxo do BOAT deveria parecer competir com
   o socorro físico pela atenção do agente nos primeiros minutos.
2. **Verificação do dever do condutor, não substituição dele.** O condutor do carro, ileso, já
   está ajudando a acionar o SAMU — cumprindo o art. 176, I ("prestar ou providenciar socorro,
   podendo fazê-lo"). Quando Yasmin finalmente abre o registro, a tela de dinâmica
   (`crash-dynamics`, UX-MOB-066) tem um campo objetivo, não uma redação livre: **socorro foi
   prestado/providenciado pelo condutor envolvido? por quem?** — isso é o que o app deveria
   capturar do art. 176, I (fato observado), nunca uma conclusão jurídica tipo "condutor cumpriu o
   art. 176" escrita por Yasmin. Ver §c de `_intake/ux-notes.md`.
3. **SAMU chega antes do registro avançar.** A ambulância chega em 6 minutos. Yasmin mal
   classificou o tipo de sinistro (`crash-start`) e registrou local aproximado (`crash-location`,
   UX-MOB-061, com precisão de GPS baixa por causa da chuva — alternativa 4a de [UC-BOAT-001],
   complemento manual da descrição textual). A equipe do SAMU já está estabilizando o motociclista
   para remoção. **A tela não pode bloquear nem pressionar Yasmin a "terminar antes que a vítima
   saia"** — não existe, em nenhuma fonte lida, um requisito de captura completa antes da remoção
   médica da vítima; exigir isso na UI seria inventar uma trava que a norma não impõe e que
   colocaria a vida da vítima em segundo plano diante do formulário.
4. **Captura mínima da vítima, rápida, antes dela partir.** Antes da ambulância sair, Yasmin tem
   uma janela curta. A tela de vítimas (`crash-victims`, UX-MOB-065, [UC-BOAT-003]) prioriza, no
   topo, os únicos três campos realistas de capturar nesse minuto: identificação (se houver
   documento à vista), gravidade observada (`severity`, obrigatório — [RN-BOAT-001]) e para onde a
   vítima está sendo levada (`hospital_destination`). Tudo o mais — `health_notes` detalhado,
   confirmação de atendimento — pode esperar; o registro segue em `in_attendance`/`recorded` com
   uma marca clara de **pendência de complemento**, não como erro nem como bloqueio
   ([WF-BOAT-001] `pending_complement`).
5. **Vítima sai antes dos dados completos.** A ambulância parte com o motociclista ainda sem
   sobrenome completo confirmado (documento ficou com um vizinho que "vai levar depois"). A tela
   não deveria fingir que o registro está completo — ela mostra, de forma explícita e não
   silenciosa, quais campos de vítima ficam pendentes, e para onde a vítima foi (hospital), como
   ponto de referência para complementar depois. Esse é exatamente o gancho para uma eventual
   conciliação futura com um parceiro hospitalar ([JRN-BOAT-003]), hoje ainda não integrada.
6. **Preservação da cena × liberação da via — a tensão real.** Com a vítima a caminho do hospital,
   sobra o problema de trânsito: o caminhoneiro atrás continua buzinando, o engarrafamento cresce.
   O art. 176, III exige que o condutor preserve o local "de forma a facilitar os trabalhos da
   polícia e da perícia"; mas não há vítima presa no local nem indício de tacógrafo (art. 279) que
   justifique manter tudo intocado por muito tempo. **Decisão que a tela apoia, não decide
   sozinha**: Yasmin fotografa e faz o croqui rápido (`crash-sketch`, UX-MOB-067) da posição exata
   dos veículos **antes** de qualquer remoção — essa é a sequência que o app deveria reforçar
   (evidência primeiro, liberação depois), porque uma vez os veículos movidos, a posição original
   não existe mais para nenhuma finalidade (perícia, seguro, BAT). Isso não decide por Yasmin se e
   quando liberar a via — é discricionariedade dela em campo, sem critério normativo de precedência
   encontrado nas fontes lidas — mas a tela não deveria deixá-la mover o veículo sem primeiro
   passar pelo croqui/evidência, sob risco de perder o registro definitivamente.
7. **Fotografar a cena, não o sofrimento.** Enquanto documenta, Yasmin evita enquadrar o rosto da
   vítima em dor ou detalhes que exponham sua integridade física — a bodycam já está captando tudo
   de qualquer forma, mas as fotos que Yasmin escolhe anexar como evidência do sinistro
   (`crash-evidence`, UX-MOB-068) são posição de veículos, marcas de frenagem, sinalização, danos
   materiais. Essa é uma regra de conteúdo defensável a partir de duas normas já capturadas: o
   princípio de minimização de dado sensível ([REF-CONTRAN-808-2020] art. 5º §5º c/c LGPD) e a
   vedação de exposição de "situações constrangedoras" ou que "exponham a integridade física" do
   envolvido ([REF-DETRANAM-TALAO-BODYCAM] art. 14, I, aplicada por analogia de princípio às fotos
   de evidência do BOAT, ainda que a Portaria trate literalmente de bodycam). Ver regra de conteúdo
   em `_intake/ux-notes.md` §c.
8. **Veículo sem responsável no local.** O motociclista foi para o hospital, o carro do outro
   condutor segue dirigível e ele mesmo pode retirá-lo; mas a moto, avariada, fica sem ninguém para
   se responsabilizar por ela. Yasmin registra a hipótese de remoção do veículo sinistrado sem
   responsável no local — base específica no art. 279-A, distinta da remoção por infração já
   coberta pela jornada de medidas administrativas do TEAT — e aciona o mesmo fluxo de reboque
   usado em [JRN-TEAT-004], vinculando-o ao sinistro (`crash-ait-links`, UX-MOB-069, também usado
   para medidas administrativas, não só AITs).
9. **Encerramento com pendência explícita, não com dado inventado.** Yasmin não força um valor em
   nenhum campo que não pôde confirmar (nome completo da vítima, `health_notes`) só para poder
   avançar a tela. O registro fecha localmente ([RN-BOAT-004] — exige ao menos 1 veículo/pessoa,
   satisfeito) com o que foi possível capturar com segurança e honestidade, e a pendência de dado
   de vítima permanece visível para quem for complementar depois (processing-operator ou, se
   aplicável, o coordenador — [JRN-BOAT-004]).
10. **Trânsito segue represado atrás dela o tempo todo.** Do início ao fim, o app não trava Yasmin
    numa tela — ela precisa poder alternar entre acompanhar a cena fisicamente e voltar ao registro
    sem perder o que já digitou, o mesmo princípio de continuidade sob interrupção já estabelecido
    para blitz noturna em [JRN-TEAT-003].

## Pontos de contato (apps/canais)

Aplicativo mobile TEAT/BOAT (`crash-start` → `crash-location` → `crash-conditions` →
`crash-vehicles` → `crash-people` → `crash-victims` → `crash-dynamics` → `crash-sketch` →
`crash-evidence` → `crash-ait-links` → `crash-review`); bodycam (gravação de fundo obrigatória,
[JRN-TEAT-005]); SAMU (equipe externa, não integrada por sistema — ponte futura em
[JRN-BOAT-003]); reboque (mesmo fluxo de [JRN-TEAT-004]).

## Métricas de sucesso

Zero registros graves com dado de vítima inventado/preenchido só para avançar tela; tempo entre
chegada da viatura e primeiro toque no app (proxy de que o socorro veio antes da tela); % de
sinistros com croqui/evidência capturados antes de qualquer remoção de veículo; zero fotos de
evidência anexadas com foco no sofrimento da vítima (auditoria amostral); % de registros com
pendência de vítima explicitamente sinalizada (não silenciosa) quando a vítima sai do local antes
da captura completa.
