import { spawnSync } from 'node:child_process';
import {
  closeSync,
  mkdtempSync,
  openSync,
  readFileSync,
  rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

// Git's complete binary output must not depend on spawnSync's pipe buffer cap.
export function runGitFileBacked(argv, { cwd }) {
  const directory = mkdtempSync(path.join(tmpdir(), 'detran-git-output-'));
  const stdoutPath = path.join(directory, 'stdout');
  const stderrPath = path.join(directory, 'stderr');
  let stdoutFd, stderrFd;
  try {
    stdoutFd = openSync(stdoutPath, 'wx', 0o600);
    stderrFd = openSync(stderrPath, 'wx', 0o600);
    const result = spawnSync('git', argv, {
      cwd,
      stdio: ['ignore', stdoutFd, stderrFd],
    });
    if (result.error) throw result.error;
    return {
      ...result,
      stdout: readFileSync(stdoutPath),
      stderr: readFileSync(stderrPath),
    };
  } finally {
    try {
      if (stdoutFd !== undefined) closeSync(stdoutFd);
    } finally {
      try {
        if (stderrFd !== undefined) closeSync(stderrFd);
      } finally {
        rmSync(directory, { recursive: true, force: true });
      }
    }
  }
}
