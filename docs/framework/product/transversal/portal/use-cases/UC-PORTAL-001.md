---
id: UC-PORTAL-001
title: Cidadão interpõe defesa da autuação (1º circuito)
status: approved
apps: [portal, rait]
sources: [REF-CONTRAN-900, REF-CONTRAN-918]
updated: 2026-09-13
---

## Ator e objetivo

Proprietário, condutor identificado, embarcador ou transportador responsável ([REF-CONTRAN-900]
art.2º) contesta a autuação (AIT/NA) antes da aplicação da penalidade, buscando o cancelamento do
auto.

## Pré-condições

- Autuação visível no PORTAL com prazo de defesa em aberto (mínimo 30 dias da expedição da NA —
  [REF-CONTRAN-918] art.4º §2º).
- Usuário autenticado (gov.br) como parte legítima ou procurador habilitado, sob pena de não
  conhecimento ([REF-CONTRAN-900] art.2º §2º).

## Fluxo principal

1. Cidadão abre a autuação e escolhe "Defender-se".
2. Sistema exibe requerimento pré-preenchido com dados já conhecidos (órgão, placa, nº do AIT, dados
   do requerente logado) — campos mínimos do [REF-CONTRAN-900] art.3º.
3. Cidadão descreve fatos e fundamentos; anexa documentos e evidências de apoio (fotos, laudo
   próprio etc.).
4. Sistema apresenta checklist de anexos que **exclui** qualquer documento emitido pelo próprio órgão
   autuador (NA/AIT/NP) — [RN-RAIT-003].
5. Cidadão revisa e assina eletronicamente o requerimento (obrigatório — [REF-CONTRAN-900] art.4º
   III trata falta de assinatura como hipótese de não conhecimento).
6. Sistema protocola eletronicamente ([REF-CONTRAN-900] art.6º §4º), grava data/hora de protocolo,
   emite número de protocolo, e transiciona o caso no [WF-RAIT-001] para triagem de admissibilidade.
7. Cidadão recebe confirmação com o protocolo e é direcionado à tela de acompanhamento
   ([UC-PORTAL-005]).

## Fluxos alternativos / exceções

- **1a.** Um requerimento cobre exatamente um AIT — se o cidadão tenta incluir mais de uma autuação
  no mesmo requerimento, o sistema bloqueia e orienta a abrir requerimentos separados
  ([REF-CONTRAN-900] art.3º § único; [RN-RAIT-002]).
- **3a.** Anexo em formato não suportado ou acima do limite de tamanho: sistema rejeita o arquivo
  individualmente sem descartar o restante do requerimento já preenchido.
- **5a.** Cidadão abandona antes de assinar: rascunho é salvo e recuperável até o vencimento do
  prazo; o sistema alerta a proximidade do vencimento.
- **6a.** Fora do prazo no momento da tentativa de protocolo: sistema informa o vencimento e orienta
  os caminhos ainda disponíveis (pagamento com desconto, se aplicável).

## Pós-condições

Caso criado no RAIT em estado `RECEBIDO`/`TRIAGEM(ADMISSIBILIDADE)` ([WF-RAIT-001]); protocolo e
tempestividade registrados; cidadão habilitado a acompanhar e a anexar documentos adicionais em
resposta a diligência ([UC-PORTAL-009]).

## Critérios de aceitação

**AC-PORTAL-001-1 — o nível de assinatura exigido vem da matriz, não do produto**

- **Dado** o ato "apresentar defesa"
- **Quando** o sistema determina o nível exigido
- **Então** aplica a matriz ato→nível de [RN-PORTAL-101]: defesa e recurso exigem assinatura
  **avançada**, e **nenhum ato do PORTAL exige qualificada** — exigir mais que isso é barreira sem
  base (DT-050)

**AC-PORTAL-001-2 — documento assinado eletronicamente presume-se autêntico**

- **Dado** um anexo assinado eletronicamente
- **Quando** é recebido
- **Então** o sistema o presume autêntico e **não** exige reconhecimento de firma, autenticação
  cartorial ou upload de original ([RN-PORTAL-104])

**AC-PORTAL-001-3 — o checklist nunca pede o que o órgão já tem**

- **Dado** a lista de anexos apresentada ao cidadão
- **Quando** é montada
- **Então** exclui NA, AIT e NP ([RN-RAIT-003], [RN-PORTAL-106]) — e o sistema os anexa de ofício

**AC-PORTAL-001-4 — tudo o que o serviço precisa é pedido no início**

- **Dado** um requerimento submetido completo conforme o checklist
- **Quando** tramita
- **Então** o órgão não volta a exigir do cidadão o que poderia ter pedido no início
  ([RN-PORTAL-107]); exigência posterior só se for fato novo, e assim justificada

**AC-PORTAL-001-5 — o digital não é o único canal**

- **Dado** um cidadão sem meio digital
- **Quando** quer se defender
- **Então** o canal presencial permanece disponível e equivalente ([RN-PORTAL-105]) — o PORTAL
  não pode ser a única porta

**AC-PORTAL-001-6 — protocolo imediato, com data e hora**

- **Dado** um requerimento assinado
- **Quando** é submetido
- **Então** o sistema protocola na hora, exibe o número e grava data/hora como termo inicial
  ([RN-PORTAL-111], CONTRAN-900 art.6º §4º)

## Regras aplicáveis

- [RN-RAIT-001] (admissibilidade)
- [RN-RAIT-002] (um AIT por requerimento, conteúdo mínimo)
- [RN-RAIT-003] (vedado exigir documento do próprio órgão)
- [RN-RAIT-005] (contagem de prazos)

**Atualização (2026-09-13).** A base institucional dos níveis de assinatura passou a existir:
Portaria Normativa DETRAN-AM 001/2025 ([REF-DETRANAM-PORTARIA-NORMATIVA-001-2025]); selo prata
aceito por decisão do Owner (steering H.50). Ver [RN-PORTAL-101] §Fonte institucional.
