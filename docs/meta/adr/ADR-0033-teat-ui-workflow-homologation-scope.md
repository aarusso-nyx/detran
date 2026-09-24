# ADR-0033: R-0013 entrega homologação de UI e workflows TEAT

## Status

Decisão do Owner em 2026-09-23. Vinculante para CTG-0004a, CTG-0004b e CTG-0005 de
R-0013. Supersede somente a pretensão de entregar aplicativos aptos à operação produtiva
nesta rodada; não revoga as decisões de segurança, negócio e equipamento das ADR-0028–0032.

## Contexto e decisão

O aplicativo mobile desta rodada é uma **versão de homologação de UI e workflows**. A
aplicação mobile de produção, com chaves e segredos institucionais e execução em aparelhos
homologados, constitui um round completo posterior, **candidato** a R-0017; o identificador
não está reservado nem a implantação autorizada por esta ADR. CTG-0004a e CTG-0004b
demonstram a experiência mobile/web, navegação, formulários, papéis, estados, erros,
acessibilidade e transições com dados sintéticos controlados. CTG-0005 documenta e prova
somente essa entrega e transfere os itens produtivos a issues rastreáveis.

O Gertec GMS820 continua homologado incondicionalmente como equipamento pelo Owner. Isso
não transforma a build de homologação em app de campo, nem dispensa interoperabilidade e
provas do futuro round de produção. ADR-0032 continua a especificar o perfil E2 e as
regras AIT autorizadas para o trabalho produtivo futuro.

## Fronteira executável

1. A modalidade de homologação deve ser explícita e identificável na UI, nos artefatos e
   na documentação. Todos os dados e identidades usados nas demonstrações são sintéticos,
   determinísticos e segregados; um dado de homologação não pode ser aceito como ato real.
2. Demonstrações positivas de criação/revisão/finalização AIT e de offline usam somente
   ports/fixtures de homologação com respostas nomeadas como simulação. Não assinam,
   numeram, emitem, sincronizam ou imprimem ato oficial, nem chamam endpoints de mutação
   produtivos. A UI deve distinguir conclusão do fluxo demonstrado de conclusão jurídica.
3. O caminho produtivo permanece fail-closed sem prova E2, validador AIT, localização real,
   autorização e serviços necessários. Não substituir prova por `offlineReady`,
   `local-unsigned`, coordenadas inventadas ou um mock silencioso. Em especial, pacote
   vencido, mas íntegro e confiável, conserva advertência conforme ADR-0031.
4. Os oráculos de rotas, papéis, 576 transições, formulários, estados e acessibilidade
   continuam vinculantes. Inspector revisa expectativas incompatíveis com o novo escopo:
   caso positivo somente no modo de homologação explícito, caso negativo correspondente
   no modo produtivo. Não converter RED em skip/todo ou relaxar testes silenciosamente.
5. Não há inferência de autorização para distribuição em produção, cadastro real de
   dispositivos, provisionamento de segredos ou substituição de integração backend.

## Consequências e aceite

R-0013 só poderá ser declarado concluído como **homologação de UI/workflows** quando os
gates integrais, segregação de fixtures, revisões independentes e evidências de CTG-0004a/b/5
forem verdes no candidato exato. O fechamento não afirmará aptidão operacional ou
conformidade criptográfica/hardware do app. As issues de produção devem cobrir, com
critérios verificáveis e dependências, E2/trust/segredos, integração Android/GMS820,
validação AIT e ciclo transacional/sincronização, bem como o gate de release de campo.
