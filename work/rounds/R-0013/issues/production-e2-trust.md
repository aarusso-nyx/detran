## Objetivo

Entregar autoridade offline E2 produtiva para o mobile TEAT, substituindo fixtures e
marcadores `local-unsigned` por prova criptográfica verificável no Android. Trabalho
postergado de CTG-0004a/R-0013 por ADR-0033; round posterior dedicado, com R-0017
apenas como candidato. Este item não pede nem armazena segredos em GitHub.

## Escopo e fontes

- ADR-0028, ADR-0029, ADR-0031, ADR-0032; OD-T14 de 300 s online.
- JOSE/JCS/JWS/JWE, raízes públicas independentes por propósito e versão,
  rotação/retirada, enrollment e prova de posse das chaves Android Keystore.
- Grant, asserções assinadas de turno e revogação, reserva autenticada, manifesto
  normativo assinado e envelope cifrado ligados a tenant/agência/agente/dispositivo/
  turno/digest. Custodiante institucional fornece identidades de confiança e serviço
  de assinatura fora do repositório.
- Refresh autenticado inicia janela offline; teto 3600 s, asserções de turno e
  revogação até 900 s cada, sempre prevalecendo o menor prazo; âncora de tempo
  assinada/monotônica e bloqueio offline após reinício ou perda da âncora.
- Pacote vencido íntegro e confiável: advertência visível/registrada, não bloqueio
  isolado; ausência, adulteração, divergência ou revogação conhecida bloqueiam.

## Critérios de aceite

- [ ] Contratos versionados e test vectors canônicos positivos/negativos (assinatura,
      canonicalização, `kid`, propósito, escopo, digest, rotação e retirada) aprovados.
- [ ] Enrollment real e prova de posse/atestado validada; chaves não exportáveis por
      uso; nenhuma chave privada/segredo em código, fixtures de produção ou bundle.
- [ ] Verificador local e backend falham fechados para prova ausente/inválida,
      `alg=none`, header desconhecido, relógio/âncora perdida, revogação ou prazo vencido;
      `offlineReady` e assinatura `local-unsigned` jamais são positivos.
- [ ] Testes de janela 300/900/3600 s, menor `validUntil`, fronteiras UTC,
      reinício/crash, rotação e aviso de pacote vencido passam no candidato exato.
- [ ] Revisão independente, gates DEVAI/CI e evidência de proveniência dos serviços
      institucionais sem divulgar material protegido.

## Dependências e fronteiras

Requer identidades públicas/trust anchors e port de assinatura aprovados pela
instituição; integra com issues de runtime Android, validador AIT, lifecycle e release.
GMS820 já está homologado como equipamento pelo Owner; este item não reabre isso.
Nenhuma simulação de R-0013 satisfaz estes critérios.
Gate de campo dependente: [#112](https://github.com/aarusso-nyx/detran/issues/112).
