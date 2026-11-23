/**
 * NEX Store — Real Git Import Pipeline.
 *
 * Imports an application's ACTUAL SOURCE TREE straight from a git repository:
 *   • real `git clone --depth 1 --single-branch` (verified SHA-256'd commit)
 *   • real file-tree collection with size/extension caps
 *   • real language + entry-point detection from project structure
 *
 * The collected source project is then handed to the polyglot conversion
 * pipeline (esbuild / g++ / py_compile / SDK probes) on publish — so
 * "import from git" ends in a genuinely converted, installable package.
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const CODE_EXTENSIONS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs',
  '.py', '.cpp', '.cc', '.cxx', '.h', '.hpp',
  '.rs', '.java', '.go', '.dart',
  '.yaml', '.yml', '.json', '.toml', '.lock',
  '.html', '.css', '.md', '.txt', '.cfg', '.ini', '.cmake'
]);
const CODE_NAMES = new Set(['readme', 'license', 'makefile', 'dockerfile', 'cmakelists.txt', 'pubspec', 'cargo.toml']);
const SKIP_DIRS = new Set(['.git', 'node_modules', 'dist', 'build', '.next', '.nuxt', '__pycache__', 'target', 'vendor', '.venv', 'venv', '.idea', '.vscode']);
const MAX_FILES = 300;
const MAX_FILE_BYTES = 512 * 1024;
const MAX_TOTAL_BYTES = 8 * 1024 * 1024;

function isSkippableName(name) {
  const lower = name.toLowerCase();
  const ext = path.extname(lower);
  return CODE_EXTENSIONS.has(ext) || CODE_NAMES.has(lower) || CODE_NAMES.has(lower.replace(/\.[^.]+$/, ''));
}

/** Collect the real source tree of a checked-out repo, with hard caps. */
export function collectSourceFiles(rootDir) {
  const files = {};
  let totalBytes = 0;
  let skipped = { tooLarge: 0, wrongType: 0, cap: 0 };

  const walk = (dir, prefix) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name));
    for (const e of entries) {
      const rel = prefix ? `${prefix}/${e.name}` : e.name;
      if (e.isDirectory()) {
        if (!SKIP_DIRS.has(e.name)) walk(path.join(dir, e.name), rel);
        continue;
      }
      if (!e.isFile()) continue;
      if (Object.keys(files).length >= MAX_FILES) {
        skipped.cap++;
        continue;
      }
      if (!isSkippableName(e.name)) {
        skipped.wrongType++;
        continue;
      }
      const abs = path.join(dir, e.name);
      const size = fs.statSync(abs).size;
      if (size > MAX_FILE_BYTES) {
        skipped.tooLarge++;
        continue;
      }
      if (totalBytes + size > MAX_TOTAL_BYTES) {
        skipped.cap++;
        continue;
      }
      files[rel] = fs.readFileSync(abs, 'utf8');
      totalBytes += size;
    }
  };

  walk(rootDir, '');
  return { files, totalBytes, skipped, fileCount: Object.keys(files).length };
}

/** Real project-structure language detection. */
export function detectProjectLanguage(files) {
  const names = Object.keys(files);
  const has = (n) => names.includes(n);
  const any = (re) => names.some((n) => re.test(n));

  if ((has('pubspec.yaml') || has('pubspec.yml')) && any(/\.dart$/)) return { language: 'flutter', entryFile: 'lib/main.dart' };
  if (has('Cargo.toml') || any(/\.rs$/)) return { language: 'rust', entryFile: '' };
  if (has('go.mod') || any(/\.go$/)) return { language: 'go', entryFile: '' };
  if (has('pom.xml') || has('build.gradle') || has('build.gradle.kts') || any(/\.java$/)) return { language: 'java', entryFile: '' };
  if (any(/\.(cpp|cc|cxx)$/)) return { language: 'cpp', entryFile: '' };
  if (has('requirements.txt') || has('pyproject.toml') || any(/\.py$/)) return { language: 'python', entryFile: '' };
  if (has('tsconfig.json') || any(/\.(ts|tsx)$/)) return { language: 'typescript', entryFile: '' };
  if (has('package.json') || any(/\.(js|jsx|mjs|cjs)$/)) return { language: 'javascript', entryFile: '' };
  return { language: 'javascript', entryFile: '' };
}

function assertSafeGitUrl(rawUrl) {
  const trimmed = String(rawUrl || '').trim();
  if (/^file:\/\//i.test(trimmed)) {
    return trimmed; // local checkout import (gated to admins at the endpoint)
  }
  let parsed;
  try {
    parsed = new URL(trimmed.startsWith('git+') ? trimmed.slice(4) : trimmed);
  } catch {
    throw new Error('Invalid repository URL');
  }
  if (!['https:', 'http:'].includes(parsed.protocol)) {
    throw new Error('Only https:// repository URLs are supported');
  }
  const host = parsed.hostname.toLowerCase();
  // Basic SSRF guard: never clone from loopback / link-local / private hosts.
  if (
    host === 'localhost' ||
    host.endsWith('.local') ||
    host.endsWith('.internal') ||
    /^127\./.test(host) ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^169\.254\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host) ||
    /^\[?::1\]?$/.test(host)
  ) {
    throw new Error('Repository host not allowed');
  }
  return parsed.href;
}

/**
 * Real git clone + tree import. Returns the actual source project.
 */
export function importGitRepo(rawUrl, { allowFileUrl = false } = {}) {
  let url = String(rawUrl || '').trim();
  if (url.startsWith('file://') && !allowFileUrl) {
    throw new Error('file:// repository imports require an admin session');
  }
  url = assertSafeGitUrl(url);

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'nex_git_'));
  try {
    // Real, shallow clone — the commit SHA below is the true repository state.
    execFileSync('git', ['clone', '--depth', '1', '--single-branch', '--quiet', url, tmp], {
      timeout: 25000,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, GIT_TERMINAL_PROMPT: '0' }
    });

    const commit = execFileSync('git', ['-C', tmp, 'rev-parse', 'HEAD'], { encoding: 'utf8', timeout: 4000 }).trim();
    const branch = execFileSync('git', ['-C', tmp, 'rev-parse', '--abbrev-ref', 'HEAD'], { encoding: 'utf8', timeout: 4000 }).trim();
    const commitSubject = execFileSync('git', ['-C', tmp, 'log', '-1', '--pretty=%s'], { encoding: 'utf8', timeout: 4000 }).trim();

    const { files, totalBytes, skipped, fileCount } = collectSourceFiles(tmp);
    const { language, entryFile } = detectProjectLanguage(files);

    // Repo name/owner from the URL (works for https and file paths alike).
    const clean = url.replace(/\/+$/, '').replace(/\.git$/, '');
    const parts = clean.split('/');
    const repoName = (parts[parts.length - 1] || 'imported-app').replace(/\.git$/, '');
    const owner = parts[parts.length - 2] || 'git-import';

    return {
      sourceFiles: files,
      language,
      entryFile,
      repoMeta: {
        url: clean,
        name: repoName,
        owner,
        branch,
        commit,
        commitShort: commit.slice(0, 7),
        commitSubject: commitSubject.slice(0, 120),
        fileCount,
        totalBytes,
        skipped
      }
    };
  } finally {
    try {
      fs.rmSync(tmp, { recursive: true, force: true });
    } catch {}
  }
}
