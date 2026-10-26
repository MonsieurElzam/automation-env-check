import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, mkdtempSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const sample = (n) => readFileSync(new URL(`../samples/${n}`, import.meta.url), 'utf8')
const mod = (n) => import(`../src/${n}.mjs`)
const run = (n, args = []) => spawnSync(process.execPath, [fileURLToPath(new URL(`../src/${n}.mjs`, import.meta.url)), ...args], { encoding: 'utf8' })
const samplePath = (n) => fileURLToPath(new URL(`../samples/${n}`, import.meta.url))

test('16 env : variables manquantes, vides, exemple conservé, en trop — sans afficher les valeurs', async () => {
  const { parseEnv, compareEnv } = await mod('env-check')
  const e = parseEnv('# commentaire\nexport A="x y" # note\nB=2\nC=')
  assert.equal(e.get('A'), 'x y'); assert.equal(e.get('B'), '2'); assert.equal(e.get('C'), '')
  const r = compareEnv(parseEnv(sample('env.example')), parseEnv(sample('env.local')))
  assert.deepEqual(r.missing, ['SMTP_HOST']); assert.deepEqual(r.empty, ['PORT']); assert.deepEqual(r.unchanged, ['API_KEY']); assert.deepEqual(r.extra, ['DEBUG'])
  const cli = run('env-check', [samplePath('env.example'), samplePath('env.local')])
  assert.equal(cli.status, 2); assert.ok(!cli.stdout.includes('valeur-demo-123') && !cli.stdout.includes('changeme'))
})
