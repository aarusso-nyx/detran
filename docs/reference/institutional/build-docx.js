const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, ShadingType, BorderStyle, AlignmentType, HeadingLevel,
  PageOrientation, VerticalAlign, LevelFormat, convertInchesToTwip,
} = require('docx');

/* ---------- paleta da casa (mesma do PDF e do artifact) ---------- */
const C = {
  deep: '0E4F42', steel: '23617E', copper: '96541B',
  ink: '12211C', muted: '55635B', line: 'C9D1C7',
  zebra: 'F4F6F2', soft: 'E8F0EC',
};
const SERIF = 'Georgia';   // presente em Windows e macOS
const SANS = 'Calibri';    // padrão do Word

/* ---------- helpers ---------- */
// converte "texto com **negrito** no meio" em TextRun[] alternando negrito
const rt = (text, opts = {}) =>
  text.split('**').map((part, i) =>
    new TextRun({ text: part, bold: i % 2 === 1, font: SANS, size: opts.size || 17, color: opts.color || C.ink }));

const P = (text, o = {}) => new Paragraph({
  spacing: { after: o.after ?? 120, before: o.before ?? 0, line: o.line ?? 276 },
  alignment: o.align,
  children: typeof text === 'string' ? rt(text, o) : text,
});

const H1 = (t) => new Paragraph({
  spacing: { after: 160, before: 0 },
  children: [new TextRun({ text: t, font: SERIF, size: 40, bold: true, color: C.ink })],
});
const H2 = (t, code) => new Paragraph({
  spacing: { after: 100, before: 320 }, keepNext: true,
  children: [
    new TextRun({ text: t, font: SERIF, size: 28, bold: true, color: C.ink }),
    ...(code ? [new TextRun({ text: '   ' + code, font: SANS, size: 18, bold: true, color: C.steel })] : []),
  ],
});
const EYEBROW = (t) => new Paragraph({
  spacing: { after: 60 }, keepNext: true,
  children: [new TextRun({ text: t.toUpperCase(), font: SANS, size: 15, bold: true, color: C.muted, characterSpacing: 30 })],
});
const SUB = (t) => new Paragraph({
  spacing: { after: 140 }, keepNext: true,
  children: [new TextRun({ text: t, font: SANS, size: 17, color: C.muted, italics: true })],
});

const noBorders = { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } };
const thin = (color) => ({ style: BorderStyle.SINGLE, size: 4, color });

/* callout: tabela de uma célula com filete lateral */
const Callout = (paras, width) => new Table({
  columnWidths: [width],
  borders: { top: thin(C.line), bottom: thin(C.line), right: thin(C.line), left: { style: BorderStyle.SINGLE, size: 18, color: C.copper } },
  rows: [new TableRow({
    children: [new TableCell({
      width: { size: width, type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, fill: 'FBFCFA' },
      margins: { top: 160, bottom: 160, left: 200, right: 200 },
      children: paras,
    })],
  })],
});

/* etiquetas de natureza, com cor por tipo */
const NAT_COLOR = { 'consulta': C.steel, 'mutação': C.copper, 'idempotente': C.deep, 'assíncrono': C.muted };
const natRuns = (tags) => {
  const out = [];
  tags.forEach((t, i) => {
    if (i) out.push(new TextRun({ text: ' · ', font: SANS, size: 15, color: C.line }));
    out.push(new TextRun({ text: t, font: SANS, size: 15, bold: true, color: NAT_COLOR[t] || C.muted }));
  });
  return out;
};

/* ---------- tabela de casos de uso ---------- */
const COLS = [1000, 2950, 1450, 5200, 1750, 2328]; // soma = 14678 (paisagem A4, margens 0,75")
const HEAD = ['Nº', 'Caso de uso na aplicação', 'Aplicação', 'Operação necessária', 'Natureza', 'Base normativa'];

const headerRow = () => new TableRow({
  tableHeader: true,
  children: HEAD.map((h, i) => new TableCell({
    width: { size: COLS[i], type: WidthType.DXA },
    shading: { type: ShadingType.CLEAR, fill: C.deep },
    margins: { top: 90, bottom: 90, left: 110, right: 110 },
    children: [new Paragraph({ spacing: { after: 0 }, children: [
      new TextRun({ text: h.toUpperCase(), font: SANS, size: 14, bold: true, color: 'FFFFFF', characterSpacing: 20 })] })],
  })),
});

const caseRow = (r, idx) => {
  const fill = idx % 2 === 1 ? C.zebra : 'FFFFFF';
  const cell = (children, extra = {}) => new TableCell({
    width: { size: extra.w, type: WidthType.DXA },
    shading: { type: ShadingType.CLEAR, fill },
    margins: { top: 90, bottom: 90, left: 110, right: 110 },
    verticalAlign: VerticalAlign.TOP,
    children,
  });
  return new TableRow({
    cantSplit: true,
    children: [
      cell([new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text: r.id, font: SANS, size: 15, bold: true, color: C.muted })] })], { w: COLS[0] }),
      cell([new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text: r.caso, font: SANS, size: 16, bold: true, color: C.ink })] })], { w: COLS[1] }),
      cell([new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text: r.app, font: SANS, size: 15, color: C.deep })] })], { w: COLS[2] }),
      cell([new Paragraph({ spacing: { after: 0, line: 250 }, children: rt(r.op, { size: 16 }) })], { w: COLS[3] }),
      cell([new Paragraph({ spacing: { after: 0 }, children: natRuns(r.nat) })], { w: COLS[4] }),
      cell([new Paragraph({ spacing: { after: 0, line: 240 }, children: [new TextRun({ text: r.base, font: SANS, size: 14, color: C.muted })] })], { w: COLS[5] }),
    ],
  });
};

const casesTable = (rows) => new Table({
  columnWidths: COLS,
  width: { size: COLS.reduce((a, b) => a + b, 0), type: WidthType.DXA },
  borders: {
    top: thin(C.line), bottom: thin(C.line), left: thin(C.line), right: thin(C.line),
    insideHorizontal: thin(C.line), insideVertical: thin('E8ECE6'),
  },
  rows: [headerRow(), ...rows.map(caseRow)],
});

/* ---------- dados: 46 casos ---------- */
const INF = [
  { id: 'INF-01', caso: 'Agente lavra o auto de infração em campo', app: 'TEAT', nat: ['mutação', 'idempotente'], base: 'CTB art. 280-281 · Res. CONTRAN 918/2022 art. 3º · Port. SENATRAN 997/2022', op: '**Submissão de auto de infração** lavrado em dispositivo homologado, individual ou em lote, com número de série reservado, enquadramento, local, evidências referenciadas por hash e identificação do agente.' },
  { id: 'INF-02', caso: 'Dispositivo reserva numeração antes de sair para a rua', app: 'TEAT', nat: ['mutação', 'consulta'], base: 'Port. SENATRAN 997/2022 — operação offline', op: '**Reserva e sincronização de faixas de numeração de AIT**, com devolução do intervalo concedido, prazo de validade e baixa dos números efetivamente consumidos.' },
  { id: 'INF-03', caso: 'Registro e sincronização do talonário', app: 'TEAT', nat: ['mutação'], base: 'Port. SENATRAN 997/2022 — sessão exclusiva por dispositivo', op: '**Sincronização de dispositivos e sessões**: registro do par dispositivo/versão homologada, abertura e encerramento de sessão do agente, e sinalização de concorrência entre dispositivos.' },
  { id: 'INF-04', caso: 'Auto lavrado com inconsistência é cancelado', app: 'TEAT · RAIT', nat: ['mutação', 'idempotente'], base: 'CTB art. 281, § 1º', op: '**Solicitação de cancelamento de auto**, com motivo estruturado e identificação da autoridade que determinou o cancelamento.' },
  { id: 'INF-05', caso: 'Abertura e acompanhamento do processo administrativo', app: 'RAIT', nat: ['mutação', 'consulta'], base: 'CTB arts. 281-282 · Res. 918/2022 arts. 4º e 9º', op: '**Abertura de processo administrativo de infração** e consulta de sua situação, com o vínculo ao auto que lhe deu origem.' },
  { id: 'INF-06', caso: 'Notificação da autuação é expedida', app: 'RAIT', nat: ['mutação', 'idempotente'], base: 'Res. 918/2022 art. 4º — prazo de 30 dias', op: '**Registro da notificação de autuação**, com data de expedição e a data-limite de defesa que passa a correr.' },
  { id: 'INF-07', caso: 'Proprietário indica o real condutor infrator', app: 'PORTAL → RAIT', nat: ['mutação', 'idempotente'], base: 'Res. 918/2022 art. 5º e § 6º — registro no RENACH', op: '**Submissão de indicação de condutor**, com os dados do condutor apontado e a confirmação de aceite ou recusa, para que a indicação produza efeito e fique disponível à averiguação de reincidência.' },
  { id: 'INF-08', caso: 'Interessado apresenta defesa prévia', app: 'PORTAL → RAIT', nat: ['mutação', 'idempotente'], base: 'Res. CONTRAN 900/2022 · Res. 918/2022 art. 9º', op: '**Submissão de defesa da autuação**, com identificação do requerente, um único auto por requerimento e referência aos anexos por metadados (nome, tipo, hash) — os arquivos permanecem sob custódia do órgão.' },
  { id: 'INF-09', caso: 'Penalidade é aplicada e notificada', app: 'RAIT', nat: ['mutação', 'idempotente'], base: 'Res. 918/2022 arts. 9º § 2º e 12', op: '**Registro de aplicação de penalidade** e **registro da notificação da penalidade**, com valor, data-limite de recurso e de pagamento.' },
  { id: 'INF-10', caso: 'Interessado interpõe recurso à JARI ou ao CETRAN', app: 'PORTAL → RAIT', nat: ['mutação', 'idempotente'], base: 'CTB arts. 285-289 · Res. 918/2022 arts. 15-16', op: '**Submissão de recurso**, com a instância a que se dirige e o vínculo ao recurso anterior quando for segunda instância.' },
  { id: 'INF-11', caso: 'Colegiado julga e a decisão é comunicada', app: 'RAIT', nat: ['mutação', 'idempotente'], base: 'CTB arts. 285-290 · Res. 918/2022 arts. 17-18', op: '**Registro do julgamento do recurso**, com resultado, fundamentação e referência à decisão assinada digitalmente — e, no encerramento da instância, a liberação para registro da penalidade no prontuário.' },
  { id: 'INF-12', caso: 'Cidadão e analista acompanham o processo', app: 'RAIT · PORTAL', nat: ['consulta'], base: 'CTB art. 285 § 4º · Lei 13.460/2017 art. 5º', op: '**Consulta de processo, recurso e histórico de julgamento**, para exibir a situação real ao interessado e instruir a instância seguinte sem exigir dele documento que o órgão já possui.' },
  { id: 'INF-13', caso: 'Cidadão consulta e quita o débito', app: 'PORTAL', nat: ['consulta', 'mutação'], base: 'CTB art. 284 · Res. 918/2022 arts. 20-23', op: '**Consulta de débito da infração** e **registro do pagamento**, com a faixa de desconto aplicável e o efeito do recurso pendente sobre a exigibilidade.' },
  { id: 'INF-14', caso: 'Consulta de infrações por diversos critérios', app: 'TEAT · RAIT · PORTAL', nat: ['consulta'], base: 'CTB art. 257 · Res. 918/2022', op: '**Consulta de infrações** por número do auto, placa, CPF ou CNPJ, registro de habilitação e órgão autuador, incluindo ocorrências e pagamentos associados.' },
  { id: 'INF-15', caso: 'Infração cometida fora da UF de registro', app: 'RAIT', nat: ['mutação'], base: 'CTB art. 287 — protocolo no órgão de domicílio', op: '**Encaminhamento interestadual** de defesa ou recurso protocolado no órgão de domicílio do interessado ao órgão autuador competente.' },
];

const EST = [
  { id: 'EST-01', caso: 'Agente registra o sinistro na cena', app: 'BOAT', nat: ['mutação', 'idempotente', 'assíncrono'], base: 'CTB art. 326-A · Res. CONTRAN 808/2020', op: '**Submissão de boletim de sinistro**, com local, dinâmica, veículos, pessoas e vítimas, classificado por gravidade, individual ou em lote — a submissão pode ocorrer horas após o fato, por indisponibilidade de rede na cena.' },
  { id: 'EST-02', caso: 'Dados chegam depois do registro inicial', app: 'BOAT', nat: ['mutação', 'idempotente'], base: 'Res. 808/2020 — consolidação estadual', op: '**Complementação de sinistro já submetido**, para o caso em que a informação só existe depois: identificação de envolvido, evolução do quadro de uma vítima, laudo posterior.' },
  { id: 'EST-03', caso: 'Erro material é corrigido', app: 'BOAT', nat: ['mutação', 'idempotente'], base: 'Res. 808/2020 art. 4º § 3º — atestação de consistência', op: '**Correção de sinistro**, preservando o registro original e a autoria da correção.' },
  { id: 'EST-04', caso: 'Coordenador acompanha a validação', app: 'BOAT · DASHBOARD', nat: ['consulta'], base: 'Res. 808/2020 arts. 8º-9º — validação em três níveis', op: '**Consulta de sinistro por identificador ou protocolo**, com a situação na cadeia de validação e o motivo em caso de rejeição.' },
  { id: 'EST-05', caso: 'Busca operacional de sinistros', app: 'BOAT · DASHBOARD', nat: ['consulta'], base: 'Res. 808/2020 — estatística e gestão', op: '**Consulta de sinistros por critérios** — placa, CPF de condutor, período, órgão — para reconciliar pendências e evitar registro duplicado.' },
  { id: 'EST-06', caso: 'Verificação de histórico do veículo', app: 'BOAT · TEAT', nat: ['consulta'], base: 'Res. 808/2020', op: '**Consulta de indicador de sinistro** por placa ou chassi, para checar antecedente relevante ao atendimento.' },
];

const CH = [
  { id: 'CH-01', caso: 'Abertura do processo de habilitação', app: 'PEC', nat: ['mutação', 'idempotente'], base: 'CTB art. 147 · Res. CONTRAN 789/2020', op: '**Abertura de processo de habilitação** para o candidato, com o tipo de processo, e recuperação do número do processo quando ele já existir — hoje tratamos a reabertura como retorno idempotente, não como erro.' },
  { id: 'CH-02', caso: 'Verificação de elegibilidade antes do exame', app: 'PEC', nat: ['consulta'], base: 'Res. CONTRAN 927/2022 · Res. 923/2022', op: '**Consulta de elegibilidade para exame**, indicando se a etapa é devida, se há impedimento e se o exame toxicológico exigido está válido.' },
  { id: 'CH-03', caso: 'Distribuição do candidato à clínica', app: 'PEC', nat: ['consulta'], base: 'Res. 927/2022 · Res. CFM 1.636/2002 art. 3º', op: '**Consulta de clínicas e profissionais credenciados**, com situação do credenciamento e especialidade — é o insumo do sorteio imparcial exigido pela norma do conselho.' },
  { id: 'CH-04', caso: 'Agendamento e comparecimento', app: 'PEC', nat: ['mutação', 'idempotente'], base: 'Res. 927/2022', op: '**Registro de agendamento e de check-in** do candidato na clínica, com data, unidade e profissional responsável.' },
  { id: 'CH-05', caso: 'Perito conclui o exame médico', app: 'PEC', nat: ['mutação', 'idempotente'], base: 'CTB art. 147 · Res. 927/2022 arts. 8º-9º', op: '**Envio de resultado de exame médico**, com o resultado no vocabulário oficial — apto, apto com restrições, inapto temporário ou inapto —, os códigos de restrição aplicáveis e a referência ao laudo assinado digitalmente, que permanece sob custódia do órgão.' },
  { id: 'CH-06', caso: 'Psicólogo conclui a avaliação', app: 'PEC', nat: ['mutação', 'idempotente'], base: 'Res. 927/2022 · Res. CFP 01/2019', op: '**Envio de resultado de avaliação psicológica**, no mesmo formato de resultado e com a mesma referência ao laudo assinado.' },
  { id: 'CH-07', caso: 'Laudo é retificado por adendo', app: 'PEC', nat: ['mutação', 'idempotente'], base: 'Res. CFM 1.636/2002 · Lei 13.787/2018', op: '**Envio de retificação de resultado**, que referencia o resultado original sem apagá-lo — o laudo é imutável e a correção se faz por adendo.' },
  { id: 'CH-08', caso: 'Candidato recorre à junta', app: 'PEC', nat: ['mutação', 'idempotente'], base: 'Res. 927/2022 arts. 12-15 — três instâncias', op: '**Encaminhamento à junta** e **envio do parecer da junta**, identificando a instância — junta local, instância recursal e junta especial de saúde — e o resultado que prevalece.' },
  { id: 'CH-09', caso: 'Identificação do condutor no atendimento', app: 'PEC · PORTAL', nat: ['consulta'], base: 'CTB art. 147 § 1º — pessoalidade do ato', op: '**Consulta de condutor e de habilitação** por CPF, registro, PGU ou número do formulário, incluindo situação da CNH e impedimentos.' },
  { id: 'CH-10', caso: 'Validação de presença do candidato', app: 'PEC', nat: ['consulta'], base: 'Port. SENATRAN 968/2022 e 495/2025', op: '**Consulta de imagem e de dados biométricos do condutor** e **validação de segurança da habilitação**, para confirmar que quem se apresenta é quem diz ser antes de iniciar o exame.' },
];

const SNE = [
  { id: 'SNE-01', caso: 'Verificar se há adesão antes de notificar', app: 'RAIT · PORTAL', nat: ['consulta'], base: 'Res. CONTRAN 931/2022', op: '**Consulta de adesão** por veículo, cidadão ou órgão — define se a notificação seguirá por meio eletrônico ou postal.' },
  { id: 'SNE-02', caso: 'Cidadão adere pelo portal', app: 'PORTAL', nat: ['mutação', 'idempotente'], base: 'Res. 931/2022 · CTB art. 282-A', op: '**Registro de adesão do cidadão** e seu cancelamento, com a data de vigência a partir da qual a ciência eletrônica passa a valer.' },
  { id: 'SNE-03', caso: 'Notificação enviada por meio eletrônico', app: 'RAIT', nat: ['mutação', 'idempotente'], base: 'Res. 931/2022 · Res. 918/2022 art. 14 § 4º', op: '**Envio de notificação de autuação e de penalidade pelo canal eletrônico**, com retorno do protocolo que comprova a expedição e dispensa a publicação por edital.' },
  { id: 'SNE-04', caso: 'Comprovar a ciência em processo', app: 'RAIT', nat: ['consulta'], base: 'Res. 931/2022 — ciência em 30 dias', op: '**Consulta de notificação por protocolo**, para instruir o processo com a data de ciência efetiva ou ficta, da qual dependem todos os prazos seguintes.' },
  { id: 'SNE-05', caso: 'Notificação indevida é cancelada', app: 'RAIT', nat: ['mutação', 'idempotente'], base: 'Res. 931/2022', op: '**Cancelamento de notificação eletrônica**, com motivo, quando o ato que a originou é desfeito.' },
];

const CDT = [
  { id: 'CDT-01', caso: 'Cidadão vê sua situação consolidada', app: 'PORTAL', nat: ['consulta'], base: 'Lei 13.460/2017 · Lei 14.129/2021', op: '**Consulta consolidada do cidadão**: notificações pendentes, infrações, veículos vinculados e situação da habilitação, a partir do CPF autenticado.' },
  { id: 'CDT-02', caso: 'Cidadão consulta valor a pagar', app: 'PORTAL', nat: ['consulta'], base: 'CTB art. 284 · Res. 918/2022 arts. 20-21', op: '**Consulta de pagamento da infração**, com valor com e sem desconto, vencimento e disponibilidade de documento de arrecadação.' },
  { id: 'CDT-03', caso: 'Cidadão reconhece a infração para obter desconto', app: 'PORTAL', nat: ['mutação', 'idempotente'], base: 'CTB art. 284 § 1º · Res. 918/2022 art. 21', op: '**Registro do reconhecimento da infração** — ato que concede a faixa de desconto e implica renúncia à defesa e ao recurso, e que por isso precisa ser registrado de forma inequívoca e rastreável.' },
  { id: 'CDT-04', caso: 'Cidadão protocola defesa ou recurso pelo canal digital', app: 'PORTAL', nat: ['mutação', 'idempotente'], base: 'Res. 900/2022 arts. 6º § 4º e 12', op: '**Submissão de defesa ou recurso originada no canal do cidadão. Necessidade identificada:** a norma admite o protocolo eletrônico e remete o rito via notificação eletrônica a regulamentação específica; caso a interface oficial não ofereça essa entrada, o protocolo permanecerá no canal do órgão e apenas o resultado será refletido ao cidadão.' },
];

const BAS = [
  { id: 'BAS-01', caso: 'Agente identifica o veículo abordado', app: 'TEAT · BOAT', nat: ['consulta'], base: 'CTB art. 280 — dados mínimos do auto', op: '**Consulta de veículo** por placa, chassi, RENAVAM ou motor, com característica, situação e dados do proprietário — insumo obrigatório do auto e do boletim de sinistro.' },
  { id: 'BAS-02', caso: 'Agente verifica alerta antes da abordagem', app: 'TEAT · BOAT', nat: ['consulta'], base: 'segurança da operação em campo', op: '**Consulta de indicadores do veículo**: roubo e furto, restrição judicial, alarme e sinistro — decisão operacional que antecede o contato com o condutor.' },
  { id: 'BAS-03', caso: 'Agente identifica o condutor', app: 'TEAT', nat: ['consulta'], base: 'CTB art. 280, IV · Res. 918/2022 art. 3º § 4º', op: '**Consulta de condutor e de habilitação** por CPF ou registro, com situação, categoria, validade e impedimentos.' },
  { id: 'BAS-04', caso: 'Cidadão consulta sua pontuação', app: 'PORTAL', nat: ['consulta'], base: 'CTB art. 259 · Lei 13.460/2017', op: '**Consulta de infrações do condutor** pelo registro de habilitação, para exibir a pontuação e o efeito de cada processo em curso.' },
  { id: 'BAS-05', caso: 'Verificação de titularidade e de venda comunicada', app: 'RAIT', nat: ['consulta'], base: 'Res. 918/2022 arts. 6º e 32', op: '**Consulta de comunicação de venda e de endereço do possuidor**, que define a quem a notificação deve ser dirigida e quem responde pela infração.' },
  { id: 'BAS-06', caso: 'Roteamento de operação para outra UF', app: 'RAIT · BOAT · PEC', nat: ['consulta', 'mutação'], base: 'CTB art. 287', op: '**Encaminhamento por unidade federativa** das operações que envolvem veículo ou condutor registrado em outro órgão executivo estadual.' },
];

const DOMAINS = [
  { t: '1. Infrações', code: 'RENAINF', sub: 'Consumido por TEAT · RAIT · PORTAL', rows: INF },
  { t: '2. Sinistros de trânsito', code: 'RENAEST', sub: 'Consumido por BOAT · DASHBOARD', rows: EST },
  { t: '3. Condutor e habilitação', code: 'RENACH', sub: 'Consumido por PEC · PORTAL', rows: CH },
  { t: '4. Notificação eletrônica', code: 'SNE', sub: 'Consumido por PORTAL · RAIT', rows: SNE },
  { t: '5. Canal do cidadão', code: 'CDT', sub: 'Consumido por PORTAL', rows: CDT },
  { t: '6. Consultas de base', code: 'WSDenatran', sub: 'Consumido por todas as aplicações', rows: BAS },
];

/* ---------- seção 1 (retrato): abertura ---------- */
const PORTRAIT_W = 11906 - 2 * 1080; // 9746

const APPS = [
  ['TEAT · talonário eletrônico', 'Lavratura do auto em campo, com operação offline, numeração controlada e evidências'],
  ['RAIT · recursos administrativos', 'Defesa prévia, penalidade, JARI e CETRAN, com prazos vigiados'],
  ['BOAT · sinistros', 'Boletim de acidentalidade em campo e por instituições parceiras'],
  ['PEC · aptidão do condutor', 'Exame médico e avaliação psicológica em clínicas credenciadas'],
  ['PORTAL · cidadão', 'Consultas, adesão à notificação eletrônica, defesa, recurso e pagamento'],
  ['DASHBOARD · operação', 'Vigilância de prazos legais e da saúde das integrações'],
];
const appsTable = new Table({
  columnWidths: [3200, 6546],
  width: { size: 9746, type: WidthType.DXA },
  borders: { top: thin(C.line), bottom: thin(C.line), left: thin(C.line), right: thin(C.line), insideHorizontal: thin(C.line), insideVertical: thin('E8ECE6') },
  rows: APPS.map(([a, b], i) => new TableRow({
    cantSplit: true,
    children: [
      new TableCell({ width: { size: 3200, type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, fill: i % 2 ? C.zebra : 'FFFFFF' }, margins: { top: 80, bottom: 80, left: 110, right: 110 },
        children: [new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text: a, font: SANS, size: 16, bold: true, color: C.ink })] })] }),
      new TableCell({ width: { size: 6546, type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, fill: i % 2 ? C.zebra : 'FFFFFF' }, margins: { top: 80, bottom: 80, left: 110, right: 110 },
        children: [new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text: b, font: SANS, size: 16, color: C.ink })] })] }),
    ],
  })),
});

const LEGEND = [
  ['consulta', 'leitura, sem efeito de estado'],
  ['mutação', 'cria ou altera registro nacional'],
  ['idempotente', 'reenvio seguro com chave determinística'],
  ['assíncrono', 'aceite com protocolo e apuração posterior'],
];
const legendTable = new Table({
  columnWidths: [2200, 7546],
  width: { size: 9746, type: WidthType.DXA },
  // sem filetes verticais: a legenda é uma lista de duas colunas, não uma grade
  borders: { ...noBorders, insideHorizontal: thin('EDF0EA'), insideVertical: { style: BorderStyle.NONE } },
  rows: LEGEND.map(([tag, desc]) => new TableRow({
    cantSplit: true,
    children: [
      new TableCell({ width: { size: 2200, type: WidthType.DXA }, margins: { top: 60, bottom: 60, left: 0, right: 110 },
        children: [new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text: tag, font: SANS, size: 16, bold: true, color: NAT_COLOR[tag] })] })] }),
      new TableCell({ width: { size: 7546, type: WidthType.DXA }, margins: { top: 60, bottom: 60, left: 140, right: 0 },
        children: [new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text: desc, font: SANS, size: 16, color: C.ink })] })] }),
    ],
  })),
});

const front = [
  EYEBROW('NYX Knowledge · DETRAN-AM · Processo de homologação · Agosto de 2026'),
  H1('Casos de uso da API SENATRAN no ecossistema DETRAN-AM'),
  P('Este documento relaciona, por domínio, os usos que as aplicações do ecossistema fazem — ou precisarão fazer — das interfaces oficiais da SENATRAN. Cada linha descreve o caso de uso na aplicação, a operação necessária em linguagem funcional, a natureza da chamada e o dispositivo normativo que a exige.', { size: 19, after: 240 }),
  Callout([
    P('**Sobre a descrição das operações.** Ainda não dispomos da documentação oficial das interfaces. Por isso, as operações estão descritas por **função pretendida** — “submissão de auto de infração”, “envio de resultado de exame médico” — e não por caminho, verbo ou esquema de dados. Onde a natureza da operação impõe requisitos técnicos (idempotência, reenvio seguro, processamento assíncrono), isso está declarado, pois define como construímos o cliente e como pretendemos nos comportar em produção.'),
    P('O desenho atual foi validado contra uma réplica interna construída a partir das convenções públicas conhecidas. Divergências em relação ao contrato oficial são esperadas e serão absorvidas no adaptador, sem alteração das aplicações.', { after: 0 }),
  ], PORTRAIT_W),
  P('', { after: 200 }),
  EYEBROW('Legenda de natureza'),
  legendTable,
  H2('Contexto — quem consome e por quê'),
  P('O ecossistema é composto por seis aplicações que cobrem, de ponta a ponta, o ciclo de vida do trânsito no âmbito do órgão executivo estadual: lavratura em campo, processo administrativo de infração, recursos, registro de sinistros, aptidão do condutor e atendimento ao cidadão. Nenhuma delas conversa diretamente com a SENATRAN: todo o tráfego atravessa um adaptador único, que concentra credenciais, política de reenvio, chaves de idempotência e trilha de auditoria.'),
  P('Esse desenho tem consequência direta para a homologação: **o ponto de integração a ser homologado é um só**, com comportamento uniforme, independentemente de quantas aplicações estejam em operação.', { after: 200 }),
  appsTable,
];

/* ---------- seção 2 (paisagem): tabelas ---------- */
const tables = [];
DOMAINS.forEach((d, i) => {
  tables.push(H2(d.t, d.code));
  tables.push(SUB(d.sub));
  tables.push(casesTable(d.rows));
  if (i < DOMAINS.length - 1) tables.push(P('', { after: 200 }));
});

/* ---------- seção 3 (retrato): fechamento ---------- */
const REQS = [
  ['Idempotência em toda mutação.', 'Cada operação que cria ou altera registro nacional carrega chave determinística derivada do ato de origem. Um reenvio após falha de rede não gera duplicidade; quando o registro já existe, tratamos como sucesso e recuperamos o identificador, sem repetir o efeito.'],
  ['Reenvio contido.', 'Retentativa com espera progressiva e disjuntor por superfície: falhas sucessivas interrompem o envio em vez de amplificar a carga. Nada é reenviado indefinidamente.'],
  ['Publicação transacional.', 'O envio à base nacional é decidido na mesma transação do ato local que o originou, com fila própria e ordem preservada — não há ato local sem contrapartida registrada, nem envio de ato que não se consumou.'],
  ['Operação offline no campo.', 'Agentes operam sem rede por períodos longos. A submissão ocorre na sincronização, com o momento real do fato preservado — daí a importância da numeração previamente reservada.'],
  ['Credenciamento e trilha.', 'Certificado do órgão e identificação do operador em cada chamada, com registro auditável de quem originou o ato, quando e sob qual sessão de dispositivo.'],
  ['Ambiente de homologação.', 'Solicitamos ambiente com dados fictícios para exercitar os fluxos de ponta a ponta, incluindo os caminhos de erro. Hoje usamos réplica interna; ela não substitui a validação oficial.'],
];
const DELIM = [
  ['Alteração de registro de veículo (RENAVAM).', 'O domínio está previsto na arquitetura, mas nenhuma operação de escrita sobre o registro veicular é solicitada nesta homologação.'],
  ['Extração de base para análise.', 'Não pedimos acesso em massa nem cargas completas: as consultas são pontuais e vinculadas a um atendimento, processo ou ato em curso.'],
  ['Dados de saúde de terceiros.', 'No domínio de sinistros, tratamos dado de vítima estritamente no que a submissão exige; no domínio clínico, o dado é do próprio candidato atendido.'],
  ['Arquivos de documentos.', 'Anexos de defesa, recurso, laudos e evidências permanecem sob custódia do órgão; ao registro nacional trafegam apenas metadados e resumo criptográfico.'],
  ['Operações de outras UFs.', 'Fora do que o próprio processo interestadual exigir, na forma do art. 287 do CTB.'],
];

const back = [
  H2('Requisitos transversais — como pretendemos nos comportar em produção'),
  P('Os itens abaixo não são pedidos de funcionalidade: são compromissos de comportamento do nosso cliente de integração, que submetemos à avaliação porque afetam diretamente a carga e a integridade dos dados na base nacional.', { after: 200 }),
  ...REQS.map(([t, d]) => P(`**${t}** ${d}`, { after: 140 })),
  P('', { after: 100 }),
  Callout([P('**Volumetria.** A ordem de grandeza depende de dados operacionais do DETRAN-AM — efetivo de agentes em campo, autos por mês, exames por mês e base de veículos e condutores do estado. Será consolidada com o órgão e apresentada antes dos testes de homologação, junto às janelas de maior concentração de tráfego (turnos de fiscalização e fechamento mensal de arrecadação).', { after: 0 })], PORTRAIT_W),
  H2('Delimitação — o que não estamos solicitando'),
  P('A delimitação faz parte do pedido. Requisitamos o acesso mínimo necessário aos processos que o órgão executivo estadual conduz — e nada além disso.', { after: 180 }),
  ...DELIM.map(([t, d]) => new Paragraph({
    numbering: { reference: 'delim', level: 0 },
    spacing: { after: 120, line: 276 },
    children: rt(`**${t}** ${d}`),
  })),
  new Paragraph({ spacing: { before: 400, after: 100 }, border: { top: { style: BorderStyle.SINGLE, size: 6, color: C.line, space: 12 } }, children: [] }),
  P('**NYX Knowledge (NYXK)** · Antonio Augusto Russo · aarusso@nyxk.com.br', { size: 16, after: 60 }),
  P('Documento elaborado para o processo de homologação junto à SENATRAN — agosto de 2026. As operações estão descritas por função pretendida; a nomenclatura, os caminhos e os esquemas de dados serão ajustados ao contrato oficial quando disponibilizado, sem impacto nas aplicações, por estarem isolados no adaptador de integração.', { size: 15, color: C.muted, after: 0 }),
];

/* ---------- documento ---------- */
const doc = new Document({
  creator: 'NYX Knowledge (NYXK)',
  title: 'Casos de uso da API SENATRAN no ecossistema DETRAN-AM',
  description: 'Documento de casos de uso para o processo de homologação junto à SENATRAN',
  numbering: {
    config: [{
      reference: 'delim',
      levels: [{ level: 0, format: LevelFormat.BULLET, text: '—', alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 360, hanging: 240 } }, run: { color: C.copper, font: SANS } } }],
    }],
  },
  sections: [
    { properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 } } }, children: front },
    { properties: { page: { size: { width: 11906, height: 16838, orientation: PageOrientation.LANDSCAPE }, margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 } } }, children: tables },
    { properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 } } }, children: back },
  ],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync('Casos-de-Uso-API-SENATRAN.docx', buf);
  const total = DOMAINS.reduce((a, d) => a + d.rows.length, 0);
  console.log('ok · casos:', total, '· bytes:', buf.length);
});
