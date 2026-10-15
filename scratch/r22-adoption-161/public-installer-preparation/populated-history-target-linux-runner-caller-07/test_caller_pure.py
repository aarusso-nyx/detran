"""Hostile pure shape checks; no Docker, Node, SDK, SQL or runner invocation."""
import copy
import ast
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import subprocess
import tempfile
import unittest
from unittest.mock import patch

SOURCE = Path(__file__).with_name('run_target_resolution_once.py')
spec = importlib.util.spec_from_file_location('target_caller', SOURCE)
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)


def permit():
    return {'kind': 'root-one-use-readonly-target-linux-resolution', 'status': 'ISSUED',
            'issuer': '/root', 'holder': '/root/engineer_portable_custody',
            'purpose': 'four-public-root-file-resolution-only', 'maxInvocations': 1,
            'consumedInvocations': 0, 'runnerCid': 'a' * 64, 'imageId': mod.IMAGE,
            'repoSource': str(mod.ROOT),
            'nodeSource': str(mod.ROOT / 'scratch/r22-adoption-161/linux-portable-preparation/node-linux-x64-executable'),
            'imageDataSource': str(mod.IMAGE_DATA),
            'runnerBirthRef': {'path': 'scratch/r22-adoption-161/public-installer-preparation/populated-history-target-linux-runner-caller-07/inspector-runner-birth-01/ACTUAL-RUNNER-BIRTH.json',
                               'bytes': 100, 'sha256': 'sha256:' + 'd'*64},
            'creatorOutcomeRef': {'path': 'scratch/r22-adoption-161/public-installer-preparation/populated-history-target-linux-runner-creation-05/actual-one-use-creation/OUTCOME.json',
                                  'bytes': 100, 'sha256': 'sha256:' + 'f'*64},
            'sourceRefs': {'resolverSha256': 'sha256:' + mod.RESOLVER_SHA,
                           'nodeProofSha256': 'sha256:' + mod.PROOF_SHA,
                           'resolver01PacketSha256': 'sha256:' + mod.PACKET_SHA,
                           'dockerSha256': 'sha256:' + mod.DOCKER_SHA,
                           'directoryAmendmentSha256': 'sha256:' + mod.DIRECTORY_AMENDMENT_SHA,
                           'directoryInspectorReviewSha256': 'sha256:' + mod.DIRECTORY_INSPECTOR_REVIEW_SHA,
                           'creatorSourceSha256': 'sha256:' + mod.CREATOR_SOURCE_SHA,
                           'predecessorArchitectHeldSha256': 'sha256:' + mod.PREDECESSOR_ARCHITECT_HELD_SHA,
                           'predecessorInspectorHeldSha256': 'sha256:' + mod.PREDECESSOR_INSPECTOR_HELD_SHA,
                           'typedControlAddendumSha256': 'sha256:' + mod.TYPED_CONTROL_ADDENDUM_SHA,
                           'callerSha256': 'sha256:' + mod.digest(SOURCE.read_bytes())},
            'reviewRefs': {'architect': {'path': 'scratch/review-a.json', 'sha256': 'sha256:' + 'b'*64},
                           'inspector': {'path': 'scratch/review-i.json', 'sha256': 'sha256:' + 'c'*64}},
            'inspectorClosureRequired': True}


def image():
    return {'Id': mod.IMAGE, 'Os': 'linux', 'Architecture': 'amd64',
            'Config': {'Volumes': {'/var/lib/postgresql': {}}, 'Env': ['PGDATA=/var/lib/postgresql/18/docker']}}


def runner(p):
    return {'Id': p['runnerCid'], 'Name': '/detran-r22-161-target-resolver-keeper03',
            'Image': mod.IMAGE,
            'State': {'Running': True, 'Pid': 222},
            'Config': {'Labels': mod.LABELS, 'User': '999:999', 'Entrypoint': ['/bin/sleep'], 'Cmd': ['infinity'],
                       'Env': image()['Config']['Env'], 'WorkingDir': '/'},
            'HostConfig': {'ReadonlyRootfs': True, 'NetworkMode': 'none',
                           'Privileged': False, 'CapDrop': ['ALL'], 'CapAdd': None,
                           'SecurityOpt': ['no-new-privileges'], 'PortBindings': {},
                           'PidMode': '', 'IpcMode': 'private', 'UTSMode': '', 'UsernsMode': '',
                           'Mounts': [{'Target': '/repo', 'Type': 'bind', 'Source': p['repoSource'], 'ReadOnly': True},
                                      {'Target': '/usr/local/bin/node', 'Type': 'bind', 'Source': p['nodeSource'], 'ReadOnly': True},
                                      {'Target': '/var/lib/postgresql', 'Type': 'bind', 'Source': p['imageDataSource'], 'ReadOnly': True}]},
            'NetworkSettings': {'Ports': {}},
            'Mounts': [{'Destination': '/repo', 'Type': 'bind', 'Source': p['repoSource'], 'RW': False},
                       {'Destination': '/usr/local/bin/node', 'Type': 'bind',
                        'Source': '/host_mnt' + p['nodeSource'], 'RW': False},
                       {'Destination': '/var/lib/postgresql', 'Type': 'bind',
                        'Source': p['imageDataSource'], 'RW': False}]}


def birth(p):
    return {'actor': '/root/inspector_adoption_160', 'scopeStatus': 'CLOSED',
            'runnerCid': p['runnerCid'], 'imageId': mod.IMAGE,
            'mountSources': {'/repo': p['repoSource'],
                             '/usr/local/bin/node': '/host_mnt' + p['nodeSource'],
                             '/var/lib/postgresql': p['imageDataSource']},
            'processInventory': {'command': ['top', p['runnerCid'], '-eo', 'pid,ppid,comm,args'],
                                 'stdoutSha256': 'sha256:' + 'e'*64,
                                 'rowCount': 1},
            'imageDataDirectory': creator()['imageDataDirectory']}


def creator():
    return {'status': 'RUNNER_CREATED_PENDING_INSPECTOR_BIRTH_CLOSED',
            'directoryCreatedAcknowledged': True, 'actualCid': 'a'*64,
            'imageDataParentChain': mod.image_data_parent_chain(),
            'imageDataDirectory': {'source': str(mod.IMAGE_DATA), 'ownerUid': 501,
                 'ownerGid': 20, 'mode': '0700', 'device': 42, 'inode': 99, 'empty': True}}


class PureCaller(unittest.TestCase):
    def test_valid_shapes(self):
        p = permit()
        self.assertEqual(mod.validate_permit(p), p)
        mod.validate_image(image())
        b = birth(p)
        self.assertEqual(mod.validate_birth(b, p, creator()), b)
        mod.validate_runner(runner(p), p, image(), b)

    def test_permit_hostile(self):
        p = permit()
        for key, bad in [('status', 'UNISSUED'), ('maxInvocations', True),
                         ('consumedInvocations', False), ('runnerCid', 'a'*63),
                         ('imageId', 'sha256:'+'0'*64), ('inspectorClosureRequired', 1),
                         ('imageDataSource', '/tmp/foreign')]:
            with self.subTest(key=key):
                q = copy.deepcopy(p); q[key] = bad
                with self.assertRaises(RuntimeError): mod.validate_permit(q)
        q = copy.deepcopy(p); q['sourceRefs']['resolverSha256'] = 'sha256:'+'0'*64
        with self.assertRaises(RuntimeError): mod.validate_permit(q)
        q = copy.deepcopy(p); q['alternateScript'] = '/tmp/evil.mjs'
        with self.assertRaises(RuntimeError): mod.validate_permit(q)
        q = copy.deepcopy(p); q['volumeName'] = 'historical-volume'
        with self.assertRaises(RuntimeError): mod.validate_permit(q)
        q = copy.deepcopy(p); q['runnerBirthRef']['path'] = q['runnerBirthRef']['path'].replace('caller-07', 'caller-06')
        with self.assertRaises(RuntimeError): mod.validate_permit(q)

    def test_runner_hostile(self):
        p = permit(); base = runner(p)
        mutations = [
            lambda v: v['HostConfig'].update(ReadonlyRootfs=False),
            lambda v: v['HostConfig'].update(NetworkMode='bridge'),
            lambda v: v['HostConfig'].update(CapDrop=[]),
            lambda v: v['HostConfig'].update(CapAdd=['SYS_ADMIN']),
            lambda v: v['HostConfig'].update(Privileged=True),
            lambda v: v['HostConfig'].update(SecurityOpt=[]),
            lambda v: v['Config'].update(User='0:0'),
            lambda v: v['Config'].update(Cmd=['sh']),
            lambda v: v['Config'].update(Labels={}),
            lambda v: v['HostConfig'].update(PidMode='host'),
            lambda v: v['HostConfig'].update(Devices=[{'PathOnHost': '/dev/null'}]),
            lambda v: v['HostConfig']['Mounts'][2].update(Source='/tmp/foreign'),
            lambda v: v['HostConfig']['Mounts'][2].update(Type='volume'),
            lambda v: v['Mounts'][2].update(RW=True),
            lambda v: v['Mounts'][2].update(RW=0),
            lambda v: v['State'].update(Pid=True),
            lambda v: v['Mounts'][2].update(Source='/tmp/foreign'),
            lambda v: v['Mounts'][1].update(Source='/host_mnt/tmp/node'),
            lambda v: v['Mounts'].append({'Destination': '/tmp', 'Type': 'volume', 'RW': True}),
        ]
        for mutate in mutations:
            q = copy.deepcopy(base); mutate(q)
            with self.assertRaises(RuntimeError): mod.validate_runner(q, p, image(), birth(p))
        bad_image = image(); bad_image['Config']['Volumes'] = {'/var/lib/postgresql': {}, '/tmp': {}}
        with self.assertRaises(RuntimeError): mod.validate_image(bad_image)

    def test_pid1_hostile(self):
        raw = b'1 (sleep) S 0 ' + b'0 '*17 + b'777 0 0\n'
        self.assertEqual(mod.proc_identity(raw)['startTicks'], 777)
        with self.assertRaises(RuntimeError): mod.proc_identity(raw.replace(b' S ', b' Z '))
        with self.assertRaises(RuntimeError): mod.proc_identity(raw.replace(b'1 (', b'2 ('))

    def test_birth_and_mixed_mount_hostile(self):
        p = permit(); b = birth(p)
        for mutate in (
            lambda v: v['mountSources'].update({'/repo': '/tmp/foreign'}),
            lambda v: v['mountSources'].update({'/var/lib/postgresql': '/tmp/foreign'}),
            lambda v: v['imageDataDirectory'].update(inode=100),
            lambda v: v['imageDataDirectory'].update(device=True),
            lambda v: v['imageDataDirectory'].update(empty=1),
            lambda v: v['processInventory'].update(rowCount=2),
            lambda v: v['processInventory'].update(stdoutSha256='sha256:'+'0'*63),
            lambda v: v.update(scopeStatus='OPEN'),
        ):
            q = copy.deepcopy(b); mutate(q)
            with self.assertRaises(RuntimeError): mod.validate_birth(q, p, creator())
        q = runner(p); q['Mounts'][0]['Source'] = '/host_mnt' + p['repoSource']
        with self.assertRaises(RuntimeError): mod.validate_runner(q, p, image(), b)

    def test_host_directory_identity_and_nonempty(self):
        with tempfile.TemporaryDirectory(prefix='caller-dir-test-only-', dir=SOURCE.parent) as folder:
            leaf = Path(folder) / 'empty-image-pgdata'; leaf.mkdir(mode=0o700)
            out = Path(folder) / 'out'; out.mkdir()
            st = leaf.lstat()
            expected = {'source': str(leaf), 'ownerUid': os.geteuid(), 'ownerGid': os.getegid(),
                        'mode': '0700', 'device': st.st_dev, 'inode': st.st_ino, 'empty': True}
            chain = [{'source': str(leaf.parent), 'device': 1, 'inode': 2,
                      'ownerUid': 3, 'ownerGid': 4, 'mode': '0700'}]
            with patch.object(mod, 'IMAGE_DATA', leaf), patch.object(mod, 'image_data_parent_chain', return_value=chain):
                self.assertEqual(mod.verify_image_data_directory(out, 'initial', expected, chain), expected)
                with self.assertRaises(RuntimeError):
                    mod.verify_image_data_directory(out, 'moved-parent', expected,
                        [dict(chain[0], inode=chain[0]['inode']+1)])
                with self.assertRaises(RuntimeError):
                    mod.verify_image_data_directory(out, 'wrong-inode', dict(expected, inode=st.st_ino+1), chain)
                (leaf / 'foreign').write_bytes(b'x')
                with self.assertRaises(RuntimeError):
                    mod.verify_image_data_directory(out, 'nonempty', expected, chain)

    def test_linked_creator_late_correction_refuses_success_original(self):
        with tempfile.TemporaryDirectory(prefix='creator-return-test-only-', dir=SOURCE.parent) as folder:
            root = Path(folder); p = permit()
            outcome = root / p['creatorOutcomeRef']['path']
            outcome.parent.mkdir(parents=True)
            raw = (json.dumps(creator()) + '\n').encode()
            outcome.write_bytes(raw)
            p['creatorOutcomeRef']['bytes'] = len(raw)
            p['creatorOutcomeRef']['sha256'] = 'sha256:' + hashlib.sha256(raw).hexdigest()
            with patch.object(mod, 'ROOT', root):
                self.assertEqual(mod.read_creator_outcome(p)['status'],
                    'RUNNER_CREATED_PENDING_INSPECTOR_BIRTH_CLOSED')
                (outcome.parent / 'INTERRUPTION-AFTER-OUTCOME.json').write_text(
                    '{"status":"UNKNOWN_QUARANTINE","ownedRunnerRunningUnresolvedQuarantine":"a"}')
                with self.assertRaises(RuntimeError): mod.read_creator_outcome(p)

    def test_all_succeeded_calls_have_fixed_label(self):
        tree = ast.parse(SOURCE.read_text())
        calls = [n for n in ast.walk(tree) if isinstance(n, ast.Call) and
                 isinstance(n.func, ast.Name) and n.func.id == 'succeeded']
        self.assertEqual(len(calls), 6)
        self.assertTrue(all(len(call.args) == 2 for call in calls))

    def test_spawn_oserror_retained_and_real_times(self):
        written = {}
        def retain(path, value): written[path.name] = value
        with patch.object(mod, 'put', side_effect=retain), \
             patch.object(mod.subprocess, 'Popen', side_effect=OSError(2, 'missing')), \
             patch.object(mod, 'utc', side_effect=['start-utc', 'end-utc']), \
             patch.object(mod.time, 'monotonic', side_effect=[10.0, 11.0]):
            status, stdout, stderr = mod.command(Path('/TEST_ONLY'), 'injected', ['inspect', 'x'])
        self.assertEqual((stdout, stderr), (b'', b''))
        self.assertEqual((status['startedUtc'], status['endedUtc'], status['elapsedSeconds']),
                         ('start-utc', 'end-utc', 1.0))
        self.assertEqual(status['spawnError']['errno'], 2)
        self.assertEqual(set(written), {'injected.argv.json', 'injected.stdout.raw',
                                        'injected.stderr.raw', 'injected.status.json'})

    def test_second_error_timeout_retains_partial_raw(self):
        written = {}
        def retain(path, value): written[path.name] = value
        class FailingProcess:
            returncode = None
            calls = 0
            def communicate(self, timeout):
                self.calls += 1
                if self.calls == 1:
                    raise OSError(5, 'first-communicate')
                raise subprocess.TimeoutExpired('fake-docker', timeout,
                                                output=b'partial-out', stderr=b'partial-err')
            def poll(self): return None
            def kill(self): self.killed = True
        fake = FailingProcess()
        with patch.object(mod, 'put', side_effect=retain), \
             patch.object(mod.subprocess, 'Popen', return_value=fake):
            status, stdout, stderr = mod.command(Path('/TEST_ONLY'), 'second-error', ['inspect', 'x'])
        self.assertTrue(fake.killed)
        self.assertEqual((stdout, stderr), (b'partial-out', b'partial-err'))
        self.assertEqual(status['commandError']['errno'], 5)
        self.assertEqual(status['cleanupError'], 'process-still-running-after-kill')
        self.assertEqual(set(written), {'second-error.argv.json', 'second-error.stdout.raw',
                                        'second-error.stderr.raw', 'second-error.status.json'})

    def test_pre_and_mid_wait_interrupt(self):
        written = {}
        def retain(path, value): written[path.name] = value
        flag = {'requested': True, 'signal': 15}
        with patch.object(mod, 'put', side_effect=retain), \
             patch.object(mod.subprocess, 'Popen') as launched:
            status, _, _ = mod.command(Path('/TEST_ONLY'), 'pre', ['inspect', 'x'], interrupted=flag)
        self.assertTrue(status['interrupted'])
        launched.assert_not_called()
        class FakeProcess:
            returncode = 143
            calls = 0
            def communicate(self, timeout):
                self.calls += 1
                if self.calls == 1:
                    flag['requested'] = True
                    raise subprocess.TimeoutExpired('fake-docker', timeout, output=b'partial', stderr=b'partial-error')
                return b'partial', b'partial-error'
            def terminate(self): self.terminated = True
        fake = FakeProcess(); flag['requested'] = False
        with patch.object(mod, 'put', side_effect=retain), \
             patch.object(mod.subprocess, 'Popen', return_value=fake):
            status, stdout, stderr = mod.command(Path('/TEST_ONLY'), 'mid', ['exec', 'x'], interrupted=flag)
        self.assertTrue(status['interrupted'])
        self.assertTrue(fake.terminated)
        self.assertEqual((stdout, stderr), (b'partial', b'partial-error'))
        with self.assertRaises(RuntimeError): mod.succeeded((status, stdout, stderr), 'mid')

    def test_stop_stderr_quarantine(self):
        status = {'exitCode': 0, 'timedOut': False, 'spawnError': None}
        self.assertTrue(mod.clean_stop((status, b'cid\n', b'')))
        self.assertFalse(mod.clean_stop((status, b'cid\n', b'warning')))
        bad = dict(status, timedOut=True)
        self.assertFalse(mod.clean_stop((bad, b'', b'')))

    def test_foreign_inventory_exact_raw_and_count(self):
        p = permit(); b = birth(p)
        raw = b'PID PPID COMMAND COMMAND\n123 0 qemu sleep infinity\n'
        b['processInventory']['stdoutSha256'] = 'sha256:' + hashlib.sha256(raw).hexdigest()
        status = {'exitCode': 0, 'timedOut': False, 'interrupted': False,
                  'spawnError': None}
        with patch.object(mod, 'command', return_value=(status, raw, b'')):
            self.assertEqual(mod.verify_inventory(Path('/TEST_ONLY'), p['runnerCid'], b,
                                                  'top-test', {'requested': False}), raw)
        with patch.object(mod, 'command', return_value=(status, raw + b'456 0 foreign x\n', b'')):
            with self.assertRaises(RuntimeError):
                mod.verify_inventory(Path('/TEST_ONLY'), p['runnerCid'], b,
                                     'top-test', {'requested': False})

    def test_inert_lifecycle_before_and_after_consuming(self):
        def one_case(phase, stop_stderr=b''):
            with tempfile.TemporaryDirectory(prefix='target-caller-test-only-', dir=SOURCE.parent) as folder:
                base = Path(folder)
                permit_file = base / 'permit.json'
                permit_file.write_bytes(b'{"testOnly":true}')
                out = base / 'out'
                p = {'runnerCid': 'a'*64}
                flag = {'requested': phase == 'before', 'signal': 15 if phase == 'before' else None}
                labels = []
                def retain(path, value):
                    raw = value if isinstance(value, bytes) else (json.dumps(value) + '\n').encode()
                    with path.open('xb') as stream: stream.write(raw)
                def fake_command(_out, label, _args, **_kwargs):
                    labels.append(label)
                    status = {'exitCode': 0, 'timedOut': False, 'interrupted': False,
                              'spawnError': None}
                    if label == 'resolver':
                        flag.update(requested=True, signal=15)
                        return status, b'{}\n', b''
                    stdout = (b'[{}]' if label in ('image-inspect', 'runner-inspect') else
                              (mod.NODE_SHA + '  /usr/local/bin/node\n').encode() if label == 'mounted-node-hash' else
                              json.dumps([{'Id': p['runnerCid'], 'State': {'Running': False}}]).encode()
                              if label == 'runner-final-inspect' else b'cid\n')
                    return status, stdout, stop_stderr if label == 'owned-runner-stop' else b''
                sha = hashlib.sha256(permit_file.read_bytes()).hexdigest()
                with patch.object(mod, 'PERMIT', permit_file), patch.object(mod, 'OUT', out), \
                     patch.object(mod, 'validate_permit', return_value=p), \
                     patch.object(mod, 'rehash_sources'), patch.object(mod, 'read_creator_outcome', return_value=creator()), \
                     patch.object(mod, 'read_birth', return_value=birth(permit())), \
                     patch.object(mod, 'verify_image_data_directory'), \
                     patch.object(mod, 'validate_image'), patch.object(mod, 'validate_runner'), \
                     patch.object(mod, 'verify_inventory'), patch.object(mod, 'verify_pid1', return_value={'pid': 1}), \
                     patch.object(mod, 'command', side_effect=fake_command), \
                     patch.object(mod, 'put', side_effect=retain):
                    outcome = mod._run_once(sha, flag)
                self.assertEqual(outcome['status'], 'UNKNOWN_QUARANTINE')
                self.assertTrue((out / 'OUTCOME.json').exists())
                if phase == 'before':
                    self.assertFalse((out / 'CONSUMING.json').exists())
                    self.assertEqual(labels, [])
                else:
                    self.assertTrue((out / 'CONSUMING.json').exists())
                    self.assertEqual(labels, ['image-inspect', 'runner-inspect', 'mounted-node-hash',
                                              'resolver', 'owned-runner-stop', 'runner-final-inspect'])
                    self.assertTrue(outcome['ownedRunnerStopped'])
        one_case('before')
        one_case('after')
        one_case('after', stop_stderr=b'warning')

    def test_signal_during_final_outcome_adds_unknown_evidence(self):
        with tempfile.TemporaryDirectory(prefix='target-late-signal-test-only-', dir=SOURCE.parent) as folder:
            out = Path(folder)
            first = {'status': 'RESOLUTION_OUTPUT_RETAINED_PENDING_INSPECTOR_CLOSED'}
            def retain(path, value):
                raw = value if isinstance(value, bytes) else (json.dumps(value) + '\n').encode()
                with path.open('xb') as stream: stream.write(raw)
                if path.name == 'OUTCOME.json':
                    mod.signal.getsignal(mod.signal.SIGTERM)(mod.signal.SIGTERM, None)
            def fake_run(_sha, _flag):
                mod.put(out / 'OUTCOME.json', first)
                return dict(first)
            with patch.object(mod, 'OUT', out), patch.object(mod, 'put', side_effect=retain), \
                 patch.object(mod, '_run_once', side_effect=fake_run):
                returned = mod.run_once('a'*64)
            self.assertEqual(returned['status'], 'UNKNOWN_QUARANTINE')
            self.assertEqual(json.loads((out / 'OUTCOME.json').read_text())['status'],
                             'RESOLUTION_OUTPUT_RETAINED_PENDING_INSPECTOR_CLOSED')
            correction = json.loads((out / 'INTERRUPTION-AFTER-OUTCOME.json').read_text())
            self.assertEqual(correction['status'], 'UNKNOWN_QUARANTINE')
            self.assertEqual(correction['signal'], mod.signal.SIGTERM)

    def test_still_custom_sigterm_during_first_handler_restore(self):
        with tempfile.TemporaryDirectory(prefix='target-restore-signal-test-only-', dir=SOURCE.parent) as folder:
            out = Path(folder)
            first = {'status': 'RESOLUTION_OUTPUT_RETAINED_PENDING_INSPECTOR_CLOSED'}
            old_int = mod.signal.getsignal(mod.signal.SIGINT)
            old_term = mod.signal.getsignal(mod.signal.SIGTERM)
            actual_signal = mod.signal.signal
            fired = []
            def retain(path, value):
                raw = value if isinstance(value, bytes) else (json.dumps(value) + '\n').encode()
                with path.open('xb') as stream: stream.write(raw)
            def restoring_signal(signum, handler):
                if signum == mod.signal.SIGINT and handler == old_int and not fired:
                    current_term = mod.signal.getsignal(mod.signal.SIGTERM)
                    self.assertNotEqual(current_term, old_term)
                    current_term(mod.signal.SIGTERM, None)
                    fired.append(True)
                return actual_signal(signum, handler)
            def fake_run(_sha, _flag):
                mod.put(out / 'OUTCOME.json', first)
                return dict(first)
            with patch.object(mod, 'OUT', out), patch.object(mod, 'put', side_effect=retain), \
                 patch.object(mod, '_run_once', side_effect=fake_run), \
                 patch.object(mod.signal, 'signal', side_effect=restoring_signal):
                returned = mod.run_once('a'*64)
            self.assertEqual(fired, [True])
            self.assertEqual(returned['status'], 'UNKNOWN_QUARANTINE')
            self.assertEqual(json.loads((out / 'OUTCOME.json').read_text())['status'],
                             'RESOLUTION_OUTPUT_RETAINED_PENDING_INSPECTOR_CLOSED')
            correction = json.loads((out / 'INTERRUPTION-AFTER-OUTCOME.json').read_text())
            self.assertEqual(correction['status'], 'UNKNOWN_QUARANTINE')
            self.assertEqual(correction['signal'], mod.signal.SIGTERM)
            self.assertEqual(mod.signal.getsignal(mod.signal.SIGINT), old_int)
            self.assertEqual(mod.signal.getsignal(mod.signal.SIGTERM), old_term)


if __name__ == '__main__':
    unittest.main()
