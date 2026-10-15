# R-0022 — binding real da referência02

Architect/F1, 2026-10-13. Ativa somente fonte/plano/sensores de geração02 e
preparação da execução fixa de3c39280c; execução ainda requer source review e
real lease02 integrada/readback. Herda4e225/8aab/3c, sem mudar arquivos históricos.

## Captures reais admitidos

Root02 subject-manifest.json:
9a55a7457574612ec63c1deeb7f34c82095155e08f833acb89765ce7f629ecc4.
Root creation return9fc79728d2ce98776b49e3f8466df6c62e2bc5f8a1f29f5a0620af95da280391.
F3 arquivos sob cluster-02/inspector-creation-readback/:

- INSPECTOR-CREATION-READBACK.md a83e1be0e199393d5c245d7b673294e6118ccbd8a9d7404ee2a6fcf437ed956b;
- INSPECTOR-CREATION-READBACK.json f6a386b1fab9aaa2be9ad60870fc5efdb1c71c8a977a270c724fff680151a221;
- READBACK-MANIFEST.json f3ab039edbdfcf6c66c6942998ff1fe187039734dfc5b8e2725f6cb7e7036a5b;
- lease-returned-inspector.json6d7febfbdc4731f4a66978927649a07bb0808afec990451552d580739eb99d8a.

Esses arquivos foram lidos/rehashed F1; F3 executou sete RR READ ONLY captures
maintenance+seis DBs, pristine/roles/activity, sem role/product seed/SDK/storage.
Não é execução de SQL por F1 ou prova de equivalência/receipt de instalação.
System identifier real7696293464811719840, postmaster64859, PostgreSQL18.2,
TCP127.0.0.1:65462/sockets vazios. Datadir literal novo:
`/Users/aarusso/.codex/worktrees/detran-r22-adoption-160/detran/scratch/r22-adoption-161/db-rehearsal/cluster-02/data`.

| purpose de referência | DB real                   | OID real | owner    |
| --------------------- | ------------------------- | -------- | -------- |
| prior-fresh           | detran_r22_161_ref160     | 16384    | postgres |
| ordered-prefix        | detran_r22_161_refprefix8 | 16385    | postgres |
| upgrade-source        | detran_r22_161_upgrade    | 16386    | postgres |

fresh16387/negative16388/full16389 existem pristine mas não entram na reference
lease. Coincidência de nome/OID com01 não admite sysid/endpoint/datadir antigos.

## F3/F2 fonte antes de execução

F3 prospectivamente altera somente subject-generation refs/expectedsysid/port/
output paths dos17 sensores puros existentes, preservando todos17/intenção e raw
checkpoint01; adds oldsysid/oldendpoint/oldmanifest refusal. F2 depois implementa
exact new binding em tools/stynx-storage-reference.mjs, sole export/CLI root-only
inalterados, nenhum selector. Reads revalidam manifest9a55 e report/machine/manifest
F3 acima (shape real identity.port/sysid/subjects), não esquema01 copiado.
Fixture IDs/12operations/publicinputs/prior176/métodos/TTL testclock permanecem.
Business clock/logs/candidates vão só cluster-02/reference-proof/, novos e wx.
Todas as conexões/network guard/SQL identity/maintenance/dataDirectory/role setup
usarão02/65462; nenhum fallback ou leftover65461 usado em execução.

Source1ef2fcfcbfe3f04e200fe843bfa2b2e6adf59ae06dc92bd9cf4485c3b7065956
é correção pública observada: input e payloadHashPort usam ambos
canonicalOfflineSyncPayloadHash, fingerprint exige sha256:<64hex>; lease null.
F1 confirmou sole port replacement2491→1ef2 por full-byte equality, sem SDK.
Source assertions comprovam ambos uses; nenhuma regex sozinha vira parity PASS.
Hash negativo/integrity attempt fica witness separado, sem normalizar erro01.

Final fixed02 source recebe freeze/independent F1/F3 review antes da real lease
R0022-161-CLUSTER02-REFERENCE do root para Engineer3subjects. Incluir lease literal
é única mutação posterior; detached inverse-byte readback dos dois roles precede
root execute instruction. Runtime confirma exact current identity/pristine
novamente; failure STOP preserva02, não reset/incremento automático. F1/F3/root
sem SQL enquanto Engineer lease ativa, nenhuma S/upgrade paralelo no cluster02.
Novos fresh rows usam actual SQL defaults, não rows/times01. Prefix8 não ganha
fake receipts; baseline/equivalence ainda depende do resultado real e review.

No mesmo trabalho, root pode implementar fonte S06/31 sob c37a após RED; isso
não usa reference lease nem autoriza DB S. Provider/floor/C02/C03/readiness e
produção continuam limites separados, não motivo para paralisar referência.
