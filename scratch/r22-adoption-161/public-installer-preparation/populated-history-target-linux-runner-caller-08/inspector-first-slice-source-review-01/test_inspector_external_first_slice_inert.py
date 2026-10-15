from pathlib import Path
import hashlib,json,types,unittest,copy
H=Path(__file__).parent;R=Path('/Users/aarusso/.codex/worktrees/detran-r22-adoption-160/detran');frozen=json.loads((H/'FROZEN-FAMILY.json').read_bytes());raws={}
for ref in frozen:
 raw=(H/(Path(ref['path']).name+'.raw')).read_bytes();assert len(raw)==ref['bytes'] and 'sha256:'+hashlib.sha256(raw).hexdigest()==ref['sha256'];raws[Path(ref['path']).name]=raw
mods=[]
for src,test,old,new in [
 ('run_external_process_once.py','test_external_process_pure.py',"spec=importlib.util.spec_from_file_location('external_pure',SOURCE)\nm=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)",'m=admitted'),
 ('run_external_process_admitted.py','test_entry_pure.py',"SPEC = importlib.util.spec_from_file_location('external_entry', BASE / 'run_external_process_admitted.py')\nENTRY = importlib.util.module_from_spec(SPEC)\nSPEC.loader.exec_module(ENTRY)",'ENTRY=admitted'),
 ('create_inert_runner_once.py','test_creation_contract_pure.py',"spec=importlib.util.spec_from_file_location('keeper05_disabled_creator',SOURCE)\nm=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)",'m=admitted')]:
 ref=next(v for v in frozen if Path(v['path']).name==src);p=R/ref['path'];m=types.ModuleType('TEST_ONLY_'+src);m.__file__=str(p);exec(compile(raws[src],str(p),'exec'),m.__dict__)
 if src=='run_external_process_admitted.py':m.CALLER=H/'run_external_process_once.py.raw'
 t=types.ModuleType('TEST_ONLY_'+test);t.__file__=str(p.with_name(test));t.admitted=m;text=raws[test].decode();assert text.count(old)==1;text=text.replace(old,new);exec(compile(text,str(t.__file__),'exec'),t.__dict__);mods.append(t)
class InspectorFalseAcceptWitness(unittest.TestCase):
 def test_truncated_stat_must_refuse(self):
  m=mods[0].m;truncated=b'108 (node) S 1 '+b'0 '*17+b'123\n'
  with self.assertRaisesRegex(RuntimeError,'stat'):m.parse_stat(truncated,108)
 def test_helper_authority_change_between_brackets_must_refuse(self):
  t=mods[0];m=t.m;authority=t.helper_authority();r=m.PureRendezvous(t.NONCE,t.CID,m.SCRIPT_SHA,0,authority)
  r.accept_ready(m.output_frame(t.ready_value()),1);r.attest_before(t.bracket(),2,True);start=r.start(3)
  result={'kind':'EXTERNAL_PROCESS_RESULT','nonce':t.NONCE,'pid':108,'startTicks':123,'readySha256':m.digest(r.ready_raw),'startFrameSha256':m.digest(start),'preAttestationSha256':m.digest(m.output_frame(r.first_attestation)),'runtimeFenceSha256':m.digest(m.runtime_fence_raw(r.ready_value)),'scope':'PROCESS_ONLY_NO_GRAPH_SDK_SQL'}
  r.accept_result(m.output_frame(result),4)
  after=t.bracket()
  for role in m.HELPER_ROLES:authority[role]['exeSha256']='sha256:'+'d'*64
  for item in after['helperTuples']:item['exeSha256']='sha256:'+'d'*64
  with self.assertRaisesRegex(RuntimeError,'authority|helper'):r.attest_after(after,5,True)
if __name__=='__main__':
 suite=unittest.TestSuite([*[unittest.defaultTestLoader.loadTestsFromModule(t) for t in mods],unittest.defaultTestLoader.loadTestsFromTestCase(InspectorFalseAcceptWitness)])
 result=unittest.TextTestRunner(verbosity=2).run(suite)
 raise SystemExit(0 if result.wasSuccessful() else 1)
