"""TEST_ONLY hostile controls and lifecycle. No Docker, Node or SQL calls."""
import copy
import hashlib
import importlib.util
import inspect
import json
import os
from pathlib import Path
import subprocess
import tempfile
from types import SimpleNamespace
import unittest
from unittest.mock import patch

SOURCE = Path(__file__).with_name('create_inert_runner_once.py')
spec = importlib.util.spec_from_file_location('inert_creation', SOURCE)
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)
CID = 'a' * 64


def permit():
    return {'kind': 'root-one-use-inert-target-resolver-runner-creation',
            'status': 'ISSUED', 'issuer': '/root', 'holder': '/root/engineer_portable_custody',
            'maxInvocations': 1, 'consumedInvocations': 0,
            'containerName': m.CONTAINER, 'imageDataSource': str(m.IMAGE_DATA), 'imageId': m.IMAGE,
            'platform': 'linux/amd64', 'repoSource': str(m.ROOT), 'nodeSource': str(m.NODE),
            'hostUid': os.geteuid(), 'hostGid': os.getegid(),
            'sourceRefs': {'creatorSha256': 'sha256:' + m.sha(SOURCE.read_bytes()),
                           'dockerSha256': 'sha256:' + m.DOCKER_SHA,
                           'nodeSha256': 'sha256:' + m.NODE_SHA,
                           'designSha256': 'sha256:' + m.DESIGN_SHA,
                           'caller04Sha256': 'sha256:' + m.CALLER04_SHA,
                           'erratumSha256': 'sha256:' + m.ERRATUM_SHA,
                           'ambiguousAckErratumSha256': 'sha256:' + m.AMBIGUOUS_ACK_ERRATUM_SHA,
                           'directoryAmendmentSha256': 'sha256:' + m.DIRECTORY_AMENDMENT_SHA,
                           'directoryInspectorReviewSha256': 'sha256:' + m.DIRECTORY_INSPECTOR_REVIEW_SHA,
                           'predecessorArchitectHeldSha256': 'sha256:' + m.PREDECESSOR_ARCHITECT_HELD_SHA,
                           'predecessorInspectorHeldSha256': 'sha256:' + m.PREDECESSOR_INSPECTOR_HELD_SHA,
                           'predecessorInspectorAcceptedSha256': 'sha256:' + m.PREDECESSOR_INSPECTOR_ACCEPTED_SHA,
                           'countWitnessSha256': 'sha256:' + m.COUNT_WITNESS_SHA,
                           'caller04ArchitectReviewSha256': 'sha256:' + m.CALLER04_ARCHITECT_REVIEW_SHA,
                           'interfaceInspectorReviewSha256': 'sha256:' + m.INTERFACE_INSPECTOR_REVIEW_SHA,
                           'imageProofSha256': 'sha256:' + m.IMAGE_PROOF_SHA,
                           'imageIdentitySha256': 'sha256:' + m.IMAGE_IDENTITY_SHA},
            'reviewRefs': {'architect': {'path': 'scratch/review-a.json', 'bytes': 1, 'sha256': 'sha256:'+'b'*64},
                           'inspector': {'path': 'scratch/review-i.json', 'bytes': 1, 'sha256': 'sha256:'+'c'*64}},
            'allowedEffects': ['exclusive-directory-mkdir', 'container-create', 'container-start',
                               'owned-container-stop-if-needed']}


def image():
    return {'Id': m.IMAGE, 'Os': 'linux', 'Architecture': 'amd64',
            'Config': {'Volumes': {'/var/lib/postgresql': {}}, 'Env': ['PATH=/usr/bin']}}


def container(running=False):
    p = permit()
    return {'Id': CID, 'Name': '/' + m.CONTAINER, 'Image': m.IMAGE,
            'State': {'Running': running},
            'Config': {'Labels': m.LABELS, 'User': '999:999', 'Entrypoint': ['/bin/sleep'],
                       'Cmd': ['infinity'], 'Env': image()['Config']['Env'], 'WorkingDir': ''},
            'HostConfig': {'ReadonlyRootfs': True, 'NetworkMode': 'none', 'Privileged': False,
                           'CapDrop': ['ALL'], 'CapAdd': None,
                           'SecurityOpt': ['no-new-privileges'], 'PortBindings': {},
                           'PidMode': '', 'IpcMode': 'private', 'UTSMode': '', 'UsernsMode': '',
                           'Mounts': [
                               {'Type': 'bind', 'Source': p['repoSource'], 'Target': '/repo', 'ReadOnly': True},
                               {'Type': 'bind', 'Source': '/host_mnt' + p['nodeSource'],
                                'Target': '/usr/local/bin/node', 'ReadOnly': True},
                               {'Type': 'bind', 'Source': p['imageDataSource'],
                                'Target': '/var/lib/postgresql', 'ReadOnly': True}]},
            'NetworkSettings': {'Ports': {}},
            'Mounts': [{'Destination': '/repo', 'Type': 'bind', 'RW': False,
                        'Source': p['repoSource']},
                       {'Destination': '/usr/local/bin/node', 'Type': 'bind', 'RW': False,
                        'Source': '/host_mnt' + p['nodeSource']},
                       {'Destination': '/var/lib/postgresql', 'Type': 'bind',
                        'Source': p['imageDataSource'], 'RW': False}]}


class CreationPure(unittest.TestCase):
    def test_fixed_parent_chain_is_ordered_and_complete(self):
        chain = m.parent_identity()
        self.assertEqual(chain[0]['source'], str(m.ROOT))
        self.assertEqual(chain[-1]['source'], str(m.IMAGE_DATA.parent))
        self.assertGreater(len(chain), 2)
        self.assertTrue(all(type(item['inode']) is int and item['inode'] > 0
                            for item in chain))

    def test_command_second_cleanup_timeout_retains_raw(self):
        written = {}
        def retain(path, value): written[path.name] = value
        class Process:
            returncode = None
            calls = 0
            def communicate(self, timeout):
                self.calls += 1
                if self.calls == 1:
                    raise OSError(5, 'first-io-failure')
                raise subprocess.TimeoutExpired('fake-docker', timeout,
                                                output=b'partial-out', stderr=b'partial-err')
            def poll(self): return None
            def kill(self): self.killed = True
        process = Process()
        with patch.object(m, 'save', side_effect=retain), \
             patch.object(m.subprocess, 'Popen', return_value=process):
            status, stdout, stderr = m.command(Path('/TEST_ONLY'), 'second-error',
                ['container', 'inspect', m.CONTAINER], {'requested': False})
        self.assertTrue(process.killed)
        self.assertEqual((stdout, stderr), (b'partial-out', b'partial-err'))
        self.assertEqual(status['commandError']['errno'], 5)
        self.assertEqual(status['cleanupError'], 'process-still-running-after-kill')
        self.assertEqual(set(written), {'second-error.argv.json', 'second-error.env.json',
             'second-error.stdout.raw', 'second-error.stderr.raw', 'second-error.status.json'})

    def test_valid_and_hostile_permit(self):
        p = permit()
        with patch.object(m, 'ref_file', return_value=b'x'):
            self.assertEqual(m.validate_permit(p), p)
            for key, bad in [('status', 'UNISSUED'), ('maxInvocations', True),
                             ('consumedInvocations', False), ('containerName', 'old'),
                             ('imageDataSource', '/tmp/old'), ('platform', 'native'),
                             ('imageDataSource', '/tmp/foreign'), ('hostUid', True),
                             ('hostGid', -1)]:
                with self.subTest(key=key):
                    q = copy.deepcopy(p); q[key] = bad
                    with self.assertRaises(RuntimeError): m.validate_permit(q)
            q = copy.deepcopy(p); q['alternateImage'] = m.IMAGE
            with self.assertRaises(RuntimeError): m.validate_permit(q)

    def test_exact_argv_and_controls(self):
        p = permit(); args = m.create_args(p)
        self.assertEqual(args[-3:], ['/bin/sleep', m.IMAGE, 'infinity'])
        self.assertEqual(args.count('--mount'), 3)
        self.assertIn('type=bind,source=' + str(m.IMAGE_DATA) +
                      ',target=/var/lib/postgresql,readonly', args)
        self.assertFalse(any('type=volume' in x for x in args))
        self.assertEqual(m.container_shape(container(), image(), p, running=False)['cid'], CID)
        for edit in (
            lambda x: x['HostConfig'].update(NetworkMode='bridge'),
            lambda x: x['HostConfig'].update(ReadonlyRootfs=False),
            lambda x: x['HostConfig'].update(CapDrop=[]),
            lambda x: x['HostConfig'].update(CapAdd=['SYS_ADMIN']),
            lambda x: x['HostConfig'].update(Privileged=True),
            lambda x: x['HostConfig'].update(PidMode='host'),
            lambda x: x['HostConfig'].update(IpcMode='container:foreign'),
            lambda x: x['HostConfig'].update(UTSMode='host'),
            lambda x: x['HostConfig'].update(UsernsMode='host'),
            lambda x: x['HostConfig'].update(Tmpfs={'/tmp': 'rw'}),
            lambda x: x['HostConfig'].update(DeviceRequests=[{'Driver': 'nvidia'}]),
            lambda x: x['HostConfig']['Mounts'][2].update(Type='volume'),
            lambda x: x['Config'].update(User='0:0'),
            lambda x: x['Mounts'][2].update(RW=True),
            lambda x: x['Mounts'][2].update(Source='/tmp/foreign'),
            lambda x: x['Mounts'].append({'Destination': '/tmp', 'Type': 'volume', 'RW': True}),
        ):
            q = container(); edit(q)
            with self.assertRaises(RuntimeError): m.container_shape(q, image(), p, running=False)
        wrong = image(); wrong['Config']['Volumes']['/tmp'] = {}
        with self.assertRaises(RuntimeError): m.image_shape(wrong)

    def test_receipts_refuse_drift(self):
        with tempfile.TemporaryDirectory(prefix='inert-receipt-test-only-', dir=SOURCE.parent) as folder:
            out = Path(folder)
            (out / 'raw.stdout').write_bytes(b'original')
            known = m.receipt_rehash(out, {})
            (out / 'raw.stdout').write_bytes(b'changed')
            with self.assertRaises(RuntimeError): m.receipt_rehash(out, known)

    def test_leaf_exclusive_and_identity(self):
        with tempfile.TemporaryDirectory(prefix='inert-directory-test-only-', dir=SOURCE.parent) as folder:
            root = Path(folder); leaf = root / 'empty-image-pgdata'; out = root / 'out'; out.mkdir()
            parent = {'source': str(root), 'device': 1, 'inode': 2,
                      'ownerUid': 3, 'ownerGid': 4, 'mode': '0700'}
            with patch.object(m, 'IMAGE_DATA', leaf), patch.object(m, 'parent_identity', return_value=parent):
                self.assertEqual(m.leaf_absence(out), parent)
                leaf.write_text('file')
                file_out = root / 'unused-file'; file_out.mkdir()
                with self.assertRaises(RuntimeError): m.leaf_absence(file_out)
                leaf.unlink()
                leaf.symlink_to(root / 'missing')
                link_out = root / 'unused-link'; link_out.mkdir()
                with self.assertRaises(RuntimeError): m.leaf_absence(link_out)
                leaf.unlink()
            # Real O_NOFOLLOW/lstat/fstat evidence on an exclusively created test leaf.
            leaf.mkdir(mode=0o700)
            with patch.object(m, 'IMAGE_DATA', leaf), patch.object(m, 'parent_identity', return_value=parent):
                first = m.directory_identity(out, 'identity-first', parent_expected=parent)
                self.assertEqual(first['mode'], '0700')
                self.assertTrue(first['empty'])
                with self.assertRaises(RuntimeError):
                    m.directory_identity(out, 'identity-wrong-inode', dict(first, inode=first['inode']+1), parent)
                with self.assertRaises(RuntimeError):
                    m.directory_identity(out, 'identity-wrong-owner', dict(first, ownerUid=first['ownerUid']+1), parent)
                with patch.object(m.os, 'getegid', return_value=first['ownerGid']+1):
                    with self.assertRaises(RuntimeError):
                        m.directory_identity(out, 'identity-wrong-host-gid', first, parent)
                moved_chain = [dict(parent, inode=parent['inode']+1)]
                with patch.object(m, 'parent_identity', return_value=moved_chain):
                    with self.assertRaises(RuntimeError):
                        m.directory_identity(out, 'identity-moved-ancestor', first, [parent])
                actual_fstat = os.fstat
                def changed_fd(fd):
                    st = actual_fstat(fd)
                    return SimpleNamespace(st_dev=st.st_dev, st_ino=st.st_ino+1,
                        st_uid=st.st_uid, st_gid=st.st_gid, st_mode=st.st_mode)
                with patch.object(m.os, 'fstat', side_effect=changed_fd):
                    with self.assertRaises(RuntimeError):
                        m.directory_identity(out, 'identity-fd-mismatch', first, parent)
                leaf.chmod(0o755)
                with self.assertRaises(RuntimeError):
                    m.directory_identity(out, 'identity-wrong-mode', first, parent)
                leaf.chmod(0o700)
                (leaf / 'foreign').write_bytes(b'x')
                with self.assertRaises(RuntimeError):
                    m.directory_identity(out, 'identity-nonempty', first, parent)

    def test_effect_order_and_preflight_stop(self):
        def case(existing=False, ambiguous=False, race=False, interrupt_before_effect=False,
                 late_signal=False, mkdir_race=False, signal_pre_mkdir=False):
            with tempfile.TemporaryDirectory(prefix='inert-creator-test-only-', dir=SOURCE.parent) as folder:
                root = Path(folder); pf = root / 'permit.json'; out = root / 'out'
                leaf = root / 'empty-image-pgdata'
                if existing: leaf.mkdir()
                pf.write_bytes(b'{"testOnly":true}')
                expected = hashlib.sha256(pf.read_bytes()).hexdigest()
                calls = []
                class FakeSignals:
                    SIGINT = 2
                    SIGTERM = 15
                    handlers = {2: None, 15: None}
                    def getsignal(self, number): return self.handlers[number]
                    def signal(self, number, handler):
                        old = self.handlers[number]; self.handlers[number] = handler
                        return old
                signals = FakeSignals()
                real_utc = m.utc
                def timed_utc():
                    source_lines = SOURCE.read_text().splitlines()
                    at_mkdir = any(frame.filename == str(SOURCE) and
                                   'started_utc = utc()' in source_lines[frame.lineno-1]
                                   for frame in inspect.stack())
                    if signal_pre_mkdir and at_mkdir:
                        signals.getsignal(signals.SIGTERM)(signals.SIGTERM, None)
                    return real_utc()
                parent = {'source': str(root), 'device': 1, 'inode': 2,
                          'ownerUid': 3, 'ownerGid': 4, 'mode': '0700'}
                original_absence = m.leaf_absence
                def absence(out_dir):
                    observed = original_absence(out_dir)
                    if mkdir_race: leaf.mkdir(mode=0o700)
                    return observed
                def retain(path, value):
                    raw = value if isinstance(value, bytes) else (json.dumps(value) + '\n').encode()
                    with path.open('xb') as f: f.write(raw)
                    if path.name == 'OUTCOME.json' and late_signal:
                        m.signal.getsignal(m.signal.SIGTERM)(m.signal.SIGTERM, None)
                def fake(_out, label, _argv, _interrupted, **_kwargs):
                    calls.append(label)
                    if label == 'container-create':
                        self.assertTrue((out / 'CONSUMING.json').exists())
                        self.assertTrue(leaf.is_dir())
                    outputs = {
                        'preflight-container-absence': lambda: b'',
                        'image-inspect': lambda: json.dumps([image()]).encode(),
                        'container-create': lambda: b'???\n' if ambiguous else (CID+'\n').encode(),
                        'container-inspect': lambda: json.dumps([container()]).encode(),
                        'container-start': lambda: (CID+'\n').encode(),
                        'running-inspect': lambda: json.dumps([container(True)]).encode(),
                        'closing-name-inspect': lambda: json.dumps([dict(container(), Id='b'*64)
                            if race else container()]).encode(),
                        'cleanup-inspect': lambda: json.dumps([container()]).encode(),
                    }
                    payload = outputs.get(label, lambda: b'')()
                    if label == 'image-inspect' and interrupt_before_effect:
                        m.signal.getsignal(m.signal.SIGTERM)(m.signal.SIGTERM, None)
                    return ({'exitCode': 0, 'timedOut': False, 'interrupted': False,
                             'spawnError': None, 'spawned': True,
                             'startedUtc': m.utc(), 'endedUtc': m.utc()}, payload, b'')
                with patch.object(m, 'PERMIT', pf), patch.object(m, 'OUT', out), \
                     patch.object(m, 'IMAGE_DATA', leaf), \
                     patch.object(m, 'signal', signals), patch.object(m, 'utc', side_effect=timed_utc), \
                     patch.object(m, 'parent_identity', return_value=parent), \
                     patch.object(m, 'leaf_absence', side_effect=absence), \
                     patch.object(m, 'validate_permit', return_value=permit()), \
                     patch.object(m, 'source_preflight'), patch.object(m, 'save', side_effect=retain), \
                     patch.object(m, 'command', side_effect=fake):
                    result = m.run_once(expected)
                if existing or interrupt_before_effect:
                    self.assertFalse((out/'CONSUMING.json').exists())
                    self.assertNotIn('container-create', calls)
                    self.assertEqual(result['status'], 'UNKNOWN_QUARANTINE')
                elif ambiguous:
                    self.assertTrue((out/'CONSUMING.json').exists())
                    self.assertEqual(result['status'], 'UNKNOWN_QUARANTINE')
                    self.assertIn('closing-name-inspect', calls)
                    self.assertNotIn('container-start', calls)
                    self.assertNotIn('owned-stop', calls)
                    self.assertEqual(result['unprovenCidObservedAfterAmbiguity'],
                                     'b'*64 if race else CID)
                elif mkdir_race or signal_pre_mkdir:
                    self.assertEqual(result['status'], 'UNKNOWN_QUARANTINE')
                    self.assertEqual(result['directoryCreateAttempted'],
                                     0 if signal_pre_mkdir else 1)
                    self.assertIs(result['directoryCreatedAcknowledged'], False)
                    self.assertNotIn('container-create', calls)
                    if signal_pre_mkdir: self.assertFalse(leaf.exists())
                elif late_signal:
                    self.assertEqual(result['status'], 'UNKNOWN_QUARANTINE')
                    self.assertEqual(result['ownedRunnerRunningUnresolvedQuarantine'], CID)
                    self.assertTrue((out/'INTERRUPTION-AFTER-OUTCOME.json').exists())
                else:
                    self.assertEqual(result['status'], 'RUNNER_CREATED_PENDING_INSPECTOR_BIRTH_CLOSED')
                    self.assertTrue(result['directoryCreatedAcknowledged'])
                    self.assertEqual([x for x in calls if x in ('container-create','container-start')],
                                     ['container-create','container-start'])
                    self.assertFalse(any('volume' in x for x in calls))
        case(existing=True)
        case(interrupt_before_effect=True)
        case(mkdir_race=True)
        case(signal_pre_mkdir=True)
        case(ambiguous=True)
        case(ambiguous=True, race=True)
        case(late_signal=True)
        case()


if __name__ == '__main__':
    unittest.main()
