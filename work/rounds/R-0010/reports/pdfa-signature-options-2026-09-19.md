# R-0010 — opções para o relatório preliminar, PDF/A e assinatura

**Papel:** Architect

**Data da pesquisa:** 2026-09-19

**Decisão Owner já vigente:** o relatório preliminar pode satisfazer C-2-13 sem alegar ser o BAT
oficial. Os campos normativos do BAT permanecem `source_pending` sob DT-061/OD-B08 e não
bloqueiam o relatório preliminar.

## 1. Recomendação para desbloqueio

Adotar o **Default D1** para TASK-0016/0017:

1. o documento é `RELATORIO_PRELIMINAR_SINISTRO`, versão `1.0.0`, e contém aviso explícito de que
   não constitui BAT oficial;
2. a política inicial do documento é **sem assinatura PAdES**, sem TSA e sem autenticação gov.br;
   o selo técnico continua obrigatório, com SHA-256, evidência veraPDF, armazenamento imutável e
   vínculo de supersessão;
3. a geração usa **WeasyPrint**, fixado por versão e artefato imutável, para produzir diretamente
   `PDF/A-2b` a partir do HTML controlado;
4. toda saída passa por **veraPDF** com perfil `2b`; falha, indisponibilidade ou resultado inválido
   impedem o selo e a entrega;
5. o tier `real` preserva os bytes aprovados, o relatório estruturado do veraPDF, versões, digests
   e SHA-256 como evidência do caminho de produção.

Esse default separa a entrega técnica de C-2-13 das decisões normativas do BAT e evita colocar uma
dependência AGPL em serviço antes da análise de licença. A política por tipo de documento permite
ativar PAdES/TSA depois, por nova versão de política, sem alterar a identidade nem confundir o
relatório preliminar com BAT.

O texto proposto para aprovação é:

> Relatório preliminar de sinistro. Documento informativo sujeito a complementação e validação.
> Não constitui Boletim de Acidente de Trânsito (BAT) oficial.

O texto é proposta de conteúdo, não fonte normativa, até manifestação expressa do Owner.

## 2. Conversão PDF/A-2b

| Opção | Prós | Contras | Parecer |
| --- | --- | --- | --- |
| **A. WeasyPrint direto** | Gera PDF/A-2b diretamente de HTML/CSS; licença BSD; reduz o caminho a renderer/conversor + validação | Pode divergir do layout Chromium; adiciona runtime Python e bibliotecas nativas; a própria documentação exige validação posterior | **Recomendada para desbloquear**, com teste visual e veraPDF obrigatório |
| **B. Chromium + Ghostscript** | Menor mudança no renderer já previsto; o `pdfwrite` oferece PDF/A-2b e se encaixa no slot `convert` | Ghostscript é AGPL ou comercial; exige decisão jurídica/licença, perfil ICC e controle de regressão após reconversão | **Melhor alternativa técnica** se a licença comercial for aprovada ou o uso AGPL for formalmente aceito |
| **C. SDK PDF comercial** | Suporte de fornecedor e recursos integrados de PDF/A/assinatura | Compra, contrato, lock-in e ponte Java/.NET ou serviço adicional; não é a rota mais rápida | Reserva para requisito de suporte ou assinatura integrada |
| **D. Desenvolver conversor próprio** | Controle integral do código | Alto risco de conformidade, fontes, cores, metadados e manutenção; recria uma especialidade já disponível | Não recomendado |

A CLI oficial do WeasyPrint aceita `--pdf-variant pdf/a-2b`, mas sua documentação afirma que a
saída não é garantida como válida em todos os casos; isso confirma a necessidade do veraPDF no
gate real. O Ghostscript suporta PDF/A versões 1 a 3, conformidade `b`, por `pdfwrite`; sua página
oficial também declara a dupla licença AGPL/comercial e a FAQ trata uso em serviço como uma
decisão de licença. Fontes: [WeasyPrint API](https://doc.courtbouillon.org/weasyprint/stable/api_reference.html),
[WeasyPrint, casos de uso PDF/A](https://doc.courtbouillon.org/weasyprint/latest/common_use_cases.html),
[Ghostscript, dispositivos vetoriais e PDF/A](https://ghostscript.readthedocs.io/en/master/VectorDevices.html),
[Ghostscript, releases e licenças](https://ghostscript.com/releases/gsdnld.html) e
[Ghostscript FAQ](https://ghostscript.com/faq/).

### Parâmetros ajustáveis do Default D1

- versão do WeasyPrint e digest da imagem: fixos no commit de implementação;
- fontes: somente fontes empacotadas e identificadas por hash;
- CSS: perfil controlado, sem recursos remotos;
- timeout sugerido: 30 s para renderização e 60 s para validação, com limite total de 120 s;
- regressão: número de páginas, extração de texto essencial e imagens renderizadas de referência;
- artefato positivo: gerado pelo caminho de produção, nunca uma fixture que apenas começa com
  `%PDF`.

## 3. Validação veraPDF

O veraPDF aceita seleção explícita do perfil `2b`. A organização publica imagem CLI no GHCR; na
data da pesquisa a página oficial mostrava `v1.31.118` e digest
`sha256:cfb5bff1a2ea0d19a36bed2d09dd89b1b12ea6c4c01be5836019c37f273512d9`.
Esse valor é **candidato**, não digest aprovado: a máquina local estava sem daemon Docker e a
resolução independente ainda não foi concluída. Antes de TASK-0016, o maestro deve resolver a tag
em ambiente com acesso ao registry, registrar plataforma e manifest digest e provar que o pull por
digest funciona. Fontes: [veraPDF CLI validation](https://docs.verapdf.org/cli/validation/) e
[pacote CLI oficial no GHCR](https://github.com/veraPDF/veraPDF-apps/pkgs/container/cli).

Default ajustável:

- perfil: `2b`;
- imagem: versão fixa + manifest digest, nunca `latest`;
- saída: relatório estruturado completo preservado com os bytes validados;
- política: qualquer falha operacional ou de conformidade bloqueia `seal` e HTTP 200.

## 4. Assinatura: opções caso passe a ser exigida

| Opção | Prós | Contras | Uso recomendado |
| --- | --- | --- | --- |
| **Sem PAdES no relatório preliminar** | Desbloqueia C-2-13 sem inventar autoridade normativa; preserva hash, auditoria e imutabilidade | Não produz assinatura qualificada nem prova de tempo externa | **Default D1** enquanto o relatório for informativo |
| **PAdES ICP-Brasil RB** | Assinatura ICP-Brasil com referência básica | Sem carimbo do tempo; validação futura depende de referências temporais externas | Apenas se a regra exigir assinatura e aceitar RB |
| **PAdES ICP-Brasil RT** | Inclui referência de tempo e oferece prova temporal mais forte | Exige certificado autorizado, ACT, custódia de chave, disponibilidade e custo operacional | **Recomendada se assinatura se tornar obrigatória** |
| **Perfil de arquivo/longa duração** | Melhor preservação de validação por longo prazo | Mais dados de validação, renovação e operação; precisa de política de retenção fechada | Para BAT ou documento normativo futuro, após fonte oficial |

O ITI determina perfis ICP-Brasil e publica as políticas vigentes; o guia de desenvolvedor indica
RB ou RT para PAdES, e a RT depende de referência de tempo. A escolha deve citar a política/OID
vigente na data da implantação, sem traduzir silenciosamente para um rótulo ETSI. Fontes:
[documentos principais do ITI](https://www.gov.br/iti/pt-br/assuntos/legislacao/documentos-principais),
[lista de políticas de assinatura](https://www.gov.br/iti/pt-br/assuntos/repositorio/lista-de-politicas-de-assinatura),
[guia do desenvolvedor](https://h-validar.iti.gov.br/guia-desenvolvedor.html) e
[DOC-ICP-15.01](https://repositorio.iti.gov.br/instrucoes-normativas/IN2021_01_DOC-ICP-15.01.htm).

Se o Owner optar por assinatura agora, os defaults recomendados são:

- política PAdES ICP-Brasil **RT** vigente na implantação;
- certificado institucional ou selo eletrônico autorizado para a agência, nunca chave pessoal no
  processo da aplicação;
- chave em HSM ou serviço de confiança, exposta à aplicação apenas por uma porta de assinatura;
- ACT credenciada e fail-closed quando o carimbo não puder ser obtido;
- assinatura criptográfica sem imagem obrigatória; identificação do órgão e estado da assinatura
  aparecem no conteúdo e nos metadados;
- testes usam PKI/TSA próprias de teste; credencial de produção nunca entra no repositório ou CI.

Esses defaults exigem que o Owner indique a autoridade signatária, a política/OID aplicável, o
provedor de certificado/custódia e a ACT. Portanto são menos adequados para o desbloqueio imediato.

## 5. Decisões solicitadas ao Owner

Para liberar TASK-0016/0017 pelo caminho mais curto, basta aprovar em conjunto:

1. **D1-a:** relatório preliminar inicialmente sem PAdES, TSA ou gov.br, com selo técnico
   imutável;
2. **D1-b:** texto informativo proposto em §1;
3. **D1-c:** WeasyPrint como backend real aprovado para PDF/A-2b, sempre seguido de veraPDF;
4. **D1-d:** parâmetros ajustáveis de §2/§3 e resolução do digest pelo maestro antes do RED real.

Depois dessa manifestação, o maestro ainda precisa produzir duas evidências técnicas antes do
despacho do Inspector: digest veraPDF resolvido por plataforma e um PDF/A-2b positivo gerado pelo
caminho escolhido e aprovado pelo veraPDF. Isso é trabalho de engenharia reproduzível, não uma
nova decisão de produto.

Se D1-c for rejeitada por impacto de layout, a segunda melhor escolha é Chromium + Ghostscript,
condicionada à aprovação explícita da licença aplicável. A exigência futura de assinatura deve ser
tratada como nova versão da política do documento; não reabre a identidade nem a distinção do BAT.
