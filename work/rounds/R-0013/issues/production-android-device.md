## Objetivo

Construir e provar o runtime mobile TEAT de campo em Android, inicialmente no
Gertec GMS820, para um round de produção próprio após R-0013 (R-0017 é candidato,
não reservado). A decisão do Owner homologa **incondicionalmente o modelo GMS820 como
equipamento**; esta issue trata integração e prova da aplicação, não elegibilidade
do modelo.

## Escopo

- Build/assinatura/distribuição Android de produção distinta da build de homologação;
  nenhuma fixture ou identidade sintética alcança o perfil de campo.
- Adapter nativo de localização GPS/rede: amostra medida durante o AIT, origem,
  coordenadas finitas, precisão medida, horário e permissões/erros explícitos;
  não inferir origem de `navigator.geolocation` nem criar dados artificiais.
- Integração real de armazenamento/Keystore, isolamento por tenant/agente/turno,
  câmera/evidência, impressora/periféricos necessários e conectividade/restart;
  portas testáveis, mas sem mock como fallback produtivo.
- Segurança de empacotamento, configuração e telemetria sem segredos no repo/bundle.

## Critérios de aceite

- [ ] Matriz de capacidades de app/runtime/periféricos no GMS820 registrada com
      versões, firmware/OS observado e evidência reprodutível, sem reabrir a homologação
      do equipamento.
- [ ] Testes no aparelho para localização GPS e rede, permissão negada, amostra
      ausente/antiga, precisão medida e ausência de proveniência; bloqueio antes de
      consumir número quando a amostra exigida não existe.
- [ ] Chaves Android não exportáveis e integração com verificador E2 demonstradas
      em hardware; restart/crash, perda de rede e perda de âncora continuam fail-closed.
- [ ] Impressão e captura de evidência reais testadas nos ports aplicáveis; falhas
      têm estado recuperável e trilha auditável, sem sucesso fictício.
- [ ] Artefato de produção identificável, sem fixtures/segredos embutidos, com
      smoke E2E no dispositivo, CI e revisão independente.

## Dependências

Perfil E2/trust, ciclo AIT e autorização de release produtivo em issues irmãs;
fontes institucionais para credenciais e ambiente de teste protegido. R-0013 entrega
somente UI/workflows em homologação (ADR-0033).
Gate de campo dependente: [#112](https://github.com/aarusso-nyx/detran/issues/112).
