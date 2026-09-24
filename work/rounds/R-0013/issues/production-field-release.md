## Objetivo

Estabelecer o gate de liberação da aplicação TEAT de **produção** após a entrega
R-0013 de homologação de UI/workflows. Planejar round dedicado posterior (R-0017
é candidato, não reservado) sem converter aprovação de equipamento ou demonstração
de UI em autorização de campo.

## Escopo

Integrar e auditar [E2/trust #108](https://github.com/aarusso-nyx/detran/issues/108),
[Android/GMS820 #109](https://github.com/aarusso-nyx/detran/issues/109),
[validador AIT #110](https://github.com/aarusso-nyx/detran/issues/110) e
[lifecycle/sync #111](https://github.com/aarusso-nyx/detran/issues/111).
Definir perfil de build produtiva, ambientes,
distribuição controlada, proteção de material institucional, telemetria, rollback,
suporte, treinamento e matriz de aceite de campo. A versão de homologação e seus
fixtures não são distribuídos como app operacional.

## Critérios de aceite

- [ ] Dependências produtivas concluídas com links a PRs, SHAs, versões, checks,
      review independente e prova em GMS820; decisão de equipamento permanece intacta.
- [ ] CI e testes completos do candidato exato, incluindo segurança, segredos,
      pacote assinado, E2 offline, AIT V01–V11, falha de localização, periféricos,
      restart/crash, reconciliação backend e isolamento de tenant/papel/turno.
- [ ] Auditoria demonstra separação binária e operacional entre homologação e
      produção; nenhuma fixture/dado sintético/credencial de teste em build produtiva.
- [ ] Plano de rollout/rollback e critérios de bloqueio, revogação e suporte
      aprovados pelo Owner e custodiantes; nenhum segredo anexado a issue/PR/evidência.
- [ ] Aprovação de ambiente e autorização de release registradas separadamente
      do merge; observação pós-implantação e evidência DEVAI completas.

## Dependências e exclusões

Bloqueada por #108, #109, #110 e #111 e pelas aprovações institucionais
aplicáveis. R-0013 não entrega release produtivo, mesmo que seus gates de UI
estejam verdes. Esta issue não reserva automaticamente R-0017 ou data de campo.
