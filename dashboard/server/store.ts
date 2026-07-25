/**
 * store.ts — Atomic JSON persistence for the access-control layer.
 *
 * The rest of the dashboard reads/writes plain markdown in wiki/_meta and
 * wiki/_agents (see parsers.ts). Access-control data (members, roles,
 * sessions, agent registry) needs structured, atomically-written records,
 * so it lives alongside that markdown as JSON files in wiki/_meta/ —
 * still just files on disk, no database, consistent with the rest of the
 * SecondBrain system's "everything is a file" design.
 *
 * Writes go to a temp file then are renamed over the target, so a crash or
 * concurrent write can never leave a half-written, corrupt JSON file.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

function metaDir(sbRoot: string): string {
  const dir = path.join(sbRoot, 'wiki/_meta');
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function storePath(sbRoot: string, name: string): string {
  return path.join(metaDir(sbRoot), name);
}

/** Read a JSON store file. Returns `fallback` if the file doesn't exist yet
 *  or fails to parse (e.g. was never initialized). */
export function readJSON<T>(sbRoot: string, name: string, fallback: T): T {
  const filePath = storePath(sbRoot, name);
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** Atomically write a JSON store file (tmp file + rename). */
export function writeJSON<T>(sbRoot: string, name: string, data: T): void {
  const filePath = storePath(sbRoot, name);
  const tmpPath = `${filePath}.${process.pid}.${crypto.randomBytes(4).toString('hex')}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tmpPath, filePath);
}

export function newId(prefix: string): string {
  return `${prefix}-${crypto.randomBytes(6).toString('hex')}`;
}

export function newToken(): string {
  return crypto.randomBytes(24).toString('base64url');
}
