# Delivery review — CTG-0004b / ciclo 7 final

Papel: Auditor/REVIEWER CODEX independente, somente leitura.

- base: `408ab438fdd940eed6bd46296daad0a141d5a222`
- product digest: `35a8a39efc8f51e7003237f62ce7eba3921ad49e4db29f1642dfc70b4f9551f5`
- receita: mesma product-only do ciclo 1
- entrada: `delivery-review-CTG-0004b-cycle-6-final.md`

Reavalie somente F001/F004/F006: navegação G* deve resolver por client/endpoint produtivo com
id+tenant, negar 404/503/mismatch, invalidar/re-resolver na troca de tenant e preservar chain; AIT
manifesta/assina exatamente dois tópicos e ambos recarregam; demais SSE consomem o manifesto
contratado; sensores não usam setter/double nem override. Confirme regressões dos itens fechados.

Reproduza lint, typecheck, 565 testes, build, digest e diff-check. PASS exige zero
critical/high/medium; não rode check integral.
