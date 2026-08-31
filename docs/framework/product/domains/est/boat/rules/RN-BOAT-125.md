---
id: RN-BOAT-125
title: Retenção permanente ("forever") de dado de saúde da vítima é juridicamente insustentável — eliminação é a regra, conservação exige enquadramento
status: draft
apps: [boat]
sources: [REF-LEI-13709-2018, REF-CONTRAN-808-2020]
updated: 2026-08-24
---

**Regra.** A marcação `"retention": "forever"` hoje aplicada a `hospital_destination` e
`health_notes` ([RN-BOAT-003]) **não tem sustentação jurídica** e deve ser substituída por uma
política de retenção com prazo definido pelo órgão. Na LGPD, **a eliminação após o término do
tratamento é a regra**, e a conservação é exceção que depende de enquadramento em uma das quatro
hipóteses do art. 16 — sendo que a única que autoriza guarda ampla, o inciso IV, é **condicionada à
anonimização**. Guardar dado de saúde identificado, indefinidamente, por padrão, não é nenhuma
delas.

**Base legal.** [REF-LEI-13709-2018]:

> "Art. 15. O término do tratamento de dados pessoais ocorrerá nas seguintes hipóteses: I -
> verificação de que a finalidade foi alcançada ou de que os dados deixaram de ser necessários ou
> pertinentes ao alcance da finalidade específica almejada; II - fim do período de tratamento;
> III - comunicação do titular [...]; IV - determinação da autoridade nacional [...]"
>
> "Art. 16. **Os dados pessoais serão eliminados após o término de seu tratamento**, no âmbito e nos
> limites técnicos das atividades, **autorizada a conservação para as seguintes finalidades**:
> I - cumprimento de obrigação legal ou regulatória pelo controlador; II - estudo por órgão de
> pesquisa, garantida, sempre que possível, a anonimização dos dados pessoais; III - transferência a
> terceiro, desde que respeitados os requisitos de tratamento de dados dispostos nesta Lei; ou
> IV - **uso exclusivo do controlador, vedado seu acesso por terceiro, e desde que anonimizados os
> dados**."
>
> "Art. 12. Os dados anonimizados não serão considerados dados pessoais para os fins desta Lei,
> salvo quando o processo de anonimização ao qual foram submetidos for revertido [...]"

**Posição prudencial adotada (interpretação de trabalho).** Um modelo de retenção em **duas
camadas**, que atende à finalidade sem guardar dado sensível identificado para sempre:

1. **Camada registral identificada** — o `CrashRecord` com dados de vítima identificados é
   conservado enquanto **durar a obrigação legal** que fundamenta o tratamento ([RN-BOAT-123], base
   art. 11, II, "a"): tempo de validação e consolidação nacional, mais o período em que o registro
   pode ser exigido para instrução de processo administrativo relacionado (AIT vinculado, defesa,
   recurso — [WF-INF-001]) ou requisição de autoridade. **Esse prazo precisa ser fixado por ato do
   órgão**; nenhuma norma o fornece.
2. **Camada estatística anonimizada** — findo o prazo da camada 1, o registro é **anonimizado** e
   conservado indefinidamente para a finalidade estatística, que é a finalidade permanente do
   sistema ([REF-CONTRAN-808-2020] art. 2º, p.ú.: _"subsidiar o desenvolvimento de estudos,
   pesquisas e ações que visem à melhoria da segurança no trânsito no país"_). A anonimização é o
   que permite conservar sem prazo, por força do art. 12 c/c art. 16, IV.

Isto é: **"forever" está certo quanto à estatística e errado quanto ao dado identificado.** O
produto pode preservar a série histórica sem preservar o nome, o destino hospitalar e as notas de
saúde da vítima.

**Verificação.** Consequências: (a) o blueprint precisa de **dois atributos** de ciclo de vida por
campo — prazo de conservação identificada e destino pós-prazo (eliminar / anonimizar); (b) a
anonimização precisa ser **irreversível na prática** (art. 12 — não basta remover o nome se placa,
data, hora e local reidentificam a vítima; sinistro é evento raro e altamente reidentificável, o que
torna a anonimização real mais difícil do que aparenta); (c) o expurgo deve ser um processo
auditável, com registro do que foi eliminado e quando — não um script silencioso.

**Controvérsia/risco.** _Severidade: alta._ (a) **Nenhuma norma de trânsito fixa prazo de guarda do
BAT ou do registro de sinistro** — nem a Res. 808/2020, nem a Portaria 139/2025, nem ato do
DETRAN-AM. É a **mesma lacuna** já identificada na rodada TEAT para a bodycam (item 42 de
`inf/teat/_intake/legal-assessment.md`): sem prazo, não há política de armazenamento defensável, e o
órgão fica exposto nos dois sentidos — descartar cedo destrói prova, guardar indefinidamente
contraria a necessidade. (b) A anonimização de sinistro é tecnicamente delicada pelo risco de
reidentificação por cruzamento (local + instante + veículo). (c) A fixação do prazo é **decisão do
órgão, com apoio do Encarregado e do CPPD** — não pode ser inferida pelo produto nem herdada de
outro domínio. Item 2 de `_intake/legal-assessment.md`.
