---
id: RN-BOAT-105
title: Coordenador de RENAEST — designação obrigatória e responsabilidade nominal pelo dado de sinistro
status: draft
apps: [boat]
sources: [REF-CONTRAN-808-2020]
updated: 2026-08-24
---

**Regra.** O DETRAN-AM **deve designar** um **Coordenador de RENAEST** — pessoa responsável pelo
_controle, tratamento e fornecimento_ dos dados de sinistro e pelo relacionamento com o Coordenador
designado pela União. A obrigação é do órgão, não do sistema; mas tem consequência direta de
produto: existe, por norma, um **responsável nominal** pelo dado de sinistro estadual, e o BOAT
precisa refleti-lo como papel identificado, não diluí-lo entre `processing-operator` e
`traffic-authority`. As atribuições estaduais que esse coordenador operacionaliza estão listadas
taxativamente no art. 9º e vão além do envio: incluem organizar e manter os dados, validar, seguir
os Manuais, cooperar, **incentivar a integração dos parceiros** e **organizar reuniões periódicas
com os órgãos integrados em nível estadual**.

**Base legal.** [REF-CONTRAN-808-2020]:

> "Art. 7º Os órgãos e entidades executivos de trânsito dos Estados e do Distrito Federal, a PRF, o
> DNIT e a ANTT designarão um Coordenador de RENAEST, responsável pelo controle, tratamento e
> fornecimento dos dados referentes a acidentes e estatísticas de trânsito, bem como pelo
> relacionamento com o Coordenador designado pelo órgão máximo executivo de trânsito da União.
>
> Parágrafo único. Caso o Ministério da Saúde opte pela integração ao RENAEST, designará um
> Coordenador de RENAEST, nos termos previstos no caput."
>
> "Art. 9º Caberá aos órgãos e entidades executivos de trânsito dos Estados e do Distrito Federal:
> I - organizar e manter os dados e as informações referentes a acidentes e estatísticas de trânsito,
> de acordo com as regras dos Manuais [...]; II - enviar ao órgão máximo executivo de trânsito da
> União os dados [...]; III - validar os dados e as informações coletados em nível estadual e, no
> caso dos municípios não integrados ao SNT, em nível municipal; IV - seguir os procedimentos
> operacionais do sistema por meio dos Manuais [...]; V - cooperar para a correta gestão do RENAEST;
> VI - incentivar a integração dos órgãos e entidades de que trata o art. 6º; VII - participar das
> reuniões periódicas com os coordenadores previstos no art. 7º [...]; e VIII - organizar e realizar
> reuniões periódicas com os órgãos ou entidades integradas ao RENAEST em nível estadual."

**Verificação.** O corpus BOAT lido **não tem** papel correspondente: os cinco papéis de
`BP-CRASH-RECORDS-001.json` são herdados do núcleo AIT do TEAT. Recomendação de modelagem: o
Coordenador de RENAEST é **papel institucional**, não necessariamente um perfil de RBAC — mas os
atos que a norma lhe atribui (validação estadual [RN-BOAT-104], fornecimento de dado à União,
interlocução) devem ser **rastreáveis a uma pessoa designada**, com o ato de designação registrado
como dado do órgão. É também a pessoa natural que, na prática, responde pelo "tratamento" a que a
LGPD dá consequência ([RN-BOAT-127]) — sem confundir-se com o **Encarregado** de dados do órgão, que
é figura distinta e já designada por outro ato ([REF-LEI-13709-2018] art. 41).

**Controvérsia/risco.** Não foi localizado ato do DETRAN-AM designando Coordenador de RENAEST — a
revisão da listagem oficial completa de Portarias Normativas do órgão (2019-2026) não encontrou
nenhum instrumento sobre sinistro/BAT/RENAEST (achado negativo confirmado,
`_intake/research-dossier.md` §7). Ou a designação existe em ato não-normativo/não publicado, ou a
obrigação do art. 7º está descumprida desde 04/01/2022 ([RN-BOAT-108]). O produto não pode resolver
essa questão; deve, porém, **assumir a existência do papel** e não desenhar o fluxo de envio nacional
como ato anônimo do sistema. Item 15 de `_intake/legal-assessment.md`.
