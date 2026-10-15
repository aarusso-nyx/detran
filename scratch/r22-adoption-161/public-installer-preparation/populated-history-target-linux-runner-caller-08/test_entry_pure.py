"""TEST_ONLY disabled-entry and exact-buffer checks; no runner or target process."""
import importlib.util
import json
from pathlib import Path
import unittest

BASE = Path(__file__).parent
SPEC = importlib.util.spec_from_file_location('external_entry', BASE / 'run_external_process_admitted.py')
ENTRY = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(ENTRY)

class EntryPure(unittest.TestCase):
    def test_closed_admission_and_duplicate_refusal(self):
        value = {'kind':'root-one-use-external-process-entry-v1','status':'ISSUED',
                 'issuer':'/root','holder':'/root/engineer_portable_custody',
                 'maxInvocations':1,'consumedInvocations':0,'entry':{},'caller':{},
                 'permit':{},'python':{},
                 'reviewRefs':{'callerArchitect':{},'callerInspector':{},
                               'entryArchitect':{},'entryInspector':{}}}
        self.assertEqual(ENTRY.admission_shape(value), value)
        for change in (lambda x:x.update(status='UNISSUED'),
                       lambda x:x.update(maxInvocations=True),
                       lambda x:x['reviewRefs'].update(extra={})): 
            bad=json.loads(json.dumps(value));change(bad)
            with self.assertRaises(RuntimeError): ENTRY.admission_shape(bad)
        with self.assertRaises(RuntimeError): ENTRY.parse(b'{"kind":1,"kind":1}')
    def test_exact_source_buffer_and_hard_refusal(self):
        raw=ENTRY.CALLER.read_bytes()
        module=ENTRY.compile_exact_caller(raw,ENTRY.sha(raw))
        with self.assertRaisesRegex(RuntimeError,'UNBOUND_KEEPER05'):
            module.run_once()
        with self.assertRaises(RuntimeError):
            ENTRY.compile_exact_caller(raw,'0'*64)
        with self.assertRaisesRegex(RuntimeError,'UNBOUND_KEEPER05'):
            ENTRY.run_admitted()

if __name__=='__main__': unittest.main()
