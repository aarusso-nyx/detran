---
id: JRN-TEAT-001
title: Turno do agente com lavratura offline — do login ao recibo sincronizado
status: draft
apps: [teat]
sources:
  [
    'teat:docs/framework/product/workflows/phase-e-mobile.md',
    'teat:docs/framework/product/ux-parity/journeys.json',
    'teat:docs/framework/product/blueprints/BP-MOBILE-OPERATIONS-001.json',
    'teat:docs/framework/product/blueprints/BP-OFFLINE-SYNC-001.json',
    REF-SENATRAN-997,
    REF-DETRANAM-TALAO-BODYCAM,
  ]
updated: 2026-08-24
---

**Revisão 2026-08-24 (rodada UX/field context — confirmação/extensão):** narrativa confirmada
ponta-a-ponta pela pesquisa legal; três pontos passam a ter base normativa explícita antes
ausente — (1) offline-first deixa de ser só escolha arquitetural e vira requisito do talão
eletrônico ([REF-SENATRAN-997] Anexo I, e); (2) finalização exige toque explícito do agente,
nunca avanço automático ([REF-SENATRAN-997] Anexo II, g) — nota de UX adicionada ao passo 5; (3)
o login abre sessão exclusiva por dispositivo — duas sessões simultâneas do mesmo agente em
aparelhos diferentes **bloqueiam o processamento** dos registros conflitantes
([REF-SENATRAN-997] Anexo II, h). Este último ponto é de alto risco e ganhou jornada própria —
ver [JRN-TEAT-006] para o cenário em que o dispositivo falha em campo. Bodycam obrigatória em
toda interação agente↔condutor ([REF-DETRANAM-TALAO-BODYCAM] art. 4º, VIII) também toca esta
jornada desde o passo 1 (câmera liga antes do primeiro ato) — narrativa completa em
[JRN-TEAT-005].

## Persona e contexto

Agente de trânsito (field-agent) em operação de fiscalização de rua, com conectividade
intermitente. Dispositivo homologado, aplicativo Angular/Ionic-alvo (`apps/mobile`).

## Narrativa ponta-a-ponta

1. **Login e turno.** Agente autentica (STYNX), passa por MFA/reautenticação se exigido,
   seleciona unidade/equipe/viatura e abre turno (`shift-context` → `home`, jornada
   `ait-complete`/`bi-dashboard` de `ux-parity/journeys.json`). `Shift.status = open` é criado.
   O sistema já verifica, neste passo, que não há outra sessão ativa do mesmo agente em outro
   aparelho — a tela não avisa isso ao agente com destaque hoje, mas deveria ([REF-SENATRAN-997]
   Anexo II, h; ver [JRN-TEAT-006]). A bodycam, se o DETRAN-AM a adotar como evidência formal do
   TEAT, precisa estar ativa a partir daqui — todo o período de serviço operacional, não só
   durante a lavratura ([REF-DETRANAM-TALAO-BODYCAM] art. 5º).
2. **Verificação de postura.** Antes de qualquer ato legal, o runtime móvel verifica se o
   dispositivo está autorizado e não adulterado, e instala/atualiza o pacote normativo mobile
   vigente ([WF-TEAT-003]).
3. **Conectividade cai.** Agente perde sinal em via sem cobertura; continua operando
   normalmente — offline é comportamento normal de campo, não exceção, e agora é também
   **requisito normativo explícito** do talão eletrônico, não apenas decisão de arquitetura
   ([RN-TEAT-001]/[INV-OFFLINE-001]; [REF-SENATRAN-997] Anexo I, e).
4. **Reserva de numeração.** Dispositivo já possui (ou solicita) reserva de faixa de numeração
   válida para operar offline por um período ([WF-TEAT-002]) — a norma confirma que essa
   numeração pode vir pré-carregada no aparelho exatamente para viabilizar o preenchimento
   offline ([REF-SENATRAN-997] Anexo II, c).
5. **Abordagem e lavratura.** Agente aborda um veículo, constata infração e lavra o AIT
   completo ([UC-TEAT-001]), com evidências ([UC-TEAT-003]) e ciência/recusa do condutor
   ([UC-TEAT-004]) — tudo local, com hash de conteúdo e chave de idempotência. **Nota de UX:** a
   tela de finalização precisa de um toque deliberado do agente ("Finalizar AIT") — nunca avançar
   sozinha ao fim do preenchimento; é vedação normativa, não só boa prática ([REF-SENATRAN-997]
   Anexo II, g).
6. **Segunda lavratura sem abordagem.** Mais adiante, constata veículo estacionado em situação
   irregular sem condutor presente; lavra AIT sem abordagem ([UC-TEAT-002]).
7. **Medida administrativa.** Em nova abordagem, aplica retenção de veículo; termo é assinado
   pelo condutor. (Para o cenário completo de remoção com reboque, ver [JRN-TEAT-004].)
8. **Fila local.** Todos os atos ficam na fila local cifrada, com recibo simulado disponível
   para impressão offline.
9. **Conectividade retorna.** Ao reconectar, o dispositivo sincroniza o lote inteiro
   ([UC-TEAT-005]) — cada ato recebe protocolo de recebimento da retaguarda; nenhum é duplicado.
10. **Encerramento de turno.** Agente encerra o turno (`shift-summary`); resumo mostra atos
    lavrados, sincronizados e pendentes.

## Pontos de contato (apps/canais)

Aplicativo mobile TEAT (Angular/Ionic-alvo); backend TEAT (`/v1/ait-lifecycle`,
`/v1/offline-sync`, `/v1/normative-catalog`); STYNX (sessão/identidade); impressora
Bluetooth (simulada no MVP); bodycam (se adotada — [JRN-TEAT-005]).

## Métricas de sucesso

Zero atos duplicados por reenvio; 100% dos atos offline com hash e reserva de numeração válidos
ao sincronizar; tempo entre finalização local e confirmação de recebimento pela retaguarda
(fonte pendente — meta não quantificada nas fontes lidas); zero incidentes de sessão concorrente
não declarada (ver [JRN-TEAT-006]).
