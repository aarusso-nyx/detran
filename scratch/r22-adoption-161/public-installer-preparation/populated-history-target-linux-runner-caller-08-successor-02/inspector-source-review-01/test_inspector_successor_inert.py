from pathlib import Path
import hashlib,json,types,unittest,copy
H=Path(__file__).parent;R=Path('/Users/aarusso/.codex/worktrees/detran-r22-adoption-160/detran');frozen=json.loads((H/'FROZEN-FAMILY.json').read_bytes());raws={}
for ref in frozen:
 raw=(H/(Path(ref['path']).name+'.raw')).read_bytes();assert len(raw)==ref['bytes'] and 'sha256:'+hashlib.sha256(raw).hexdigest()==ref['sha256'];raws[Path(ref['path']).name]=raw
src=R/frozen[0]['path'];m=types.ModuleType('TEST_ONLY_external_successor');m.__file__=str(src);exec(compile(raws['run_external_process_once.py'],str(src),'exec'),m.__dict__)
t=types.ModuleType('TEST_ONLY_successor_tests');t.__file__=str(src.with_name('test_external_process_pure.py'));t.admitted=m
s=raws['test_external_process_pure.py'].decode();old="spec=importlib.util.spec_from_file_location('external_pure',SOURCE)\nm=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)";assert s.count(old)==1;s=s.replace(old,'m=admitted');exec(compile(s,str(t.__file__),'exec'),t.__dict__);mods=[t]
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

class InspectorAdditionalTimeWitness(unittest.TestCase):
 def test_gigantic_integer_start_typed_refusal(self):
  with self.assertRaisesRegex(RuntimeError,'EXTERNAL_RENDEZVOUS_REFUSED:start-monotonic'):
   m.PureRendezvous(t.NONCE,t.CID,m.SCRIPT_SHA,10**1000,t.helper_authority())
 def test_gigantic_integer_now_typed_refusal(self):
  state=m.PureRendezvous(t.NONCE,t.CID,m.SCRIPT_SHA,0,t.helper_authority())
  with self.assertRaisesRegex(RuntimeError,'EXTERNAL_RENDEZVOUS_REFUSED:absolute-deadline'):
   state.check(10**1000)
if __name__=='__main__':
 suite=unittest.TestSuite([unittest.defaultTestLoader.loadTestsFromModule(t),unittest.defaultTestLoader.loadTestsFromTestCase(InspectorFalseAcceptWitness),unittest.defaultTestLoader.loadTestsFromTestCase(InspectorAdditionalTimeWitness)])
 result=unittest.TextTestRunner(verbosity=2).run(suite)
 raise SystemExit(0 if result.wasSuccessful() else 1)
