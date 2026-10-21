import {createRequire} from 'node:module';
import {readFileSync,realpathSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root='/Volumes/Development/.codex/worktrees/c5-c8-governance/detran';
const req=createRequire(realpathSync(path.join(root,'node_modules/@aarusso-nyx/devai/package.json')));
const Ajv=req('ajv/dist/2020.js').default;
const formats=req('ajv-formats').default;
const ajv=new Ajv({strict:false});formats(ajv);
const dir=path.join(root,'node_modules/@aarusso-nyx/devai/dist/runtime/index/schemas');
const names=['common-defs.schema.json','record-meta.schema.json','native-service-profile.schema.json','reviewed-workflow-steps.schema.json','invariant-producers.schema.json','glob-guards.schema.json','project-config.schema.json','scorecard-na-config.schema.json','release-verification-profile.schema.json','sensor-inputs.schema.json'];
for(const name of names)ajv.addSchema(JSON.parse(readFileSync(path.join(dir,name))),name);
const results=[];
for(const [name,input] of [['adopter-policy.schema.json','law/policy/adopter-policy.json'],['invariant-producers.schema.json','.devai/config/invariant-producers.json']]){
 const validate=ajv.getSchema(name)??ajv.compile(JSON.parse(readFileSync(path.join(dir,name))));
 const instance=JSON.parse(readFileSync(path.join(root,input)));
 const valid=validate(instance);results.push({schema:name,input,valid,errors:validate.errors});assert.equal(valid,true,JSON.stringify(validate.errors));
}
writeFileSync('/Users/aarusso/.config/devai/evidence/detran/c5-c7-c8-partial-delivery/bind-v2/bound-schema-validation.json',JSON.stringify({method:'Exact installed schemas with common/referenced documents registered; Ajv2020 strict:false matching installed runtime; supplemental read-only validation, not native measurement',registeredSchemas:names,results},null,2)+'\n');
console.log(JSON.stringify(results));
