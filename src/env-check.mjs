#!/usr/bin/env node
/* Compare un fichier .env.example (la référence) à un .env réel : variables manquantes, vides,
   restées à leur valeur d'exemple, ou en trop. N'affiche jamais les valeurs. */
import { readFileSync } from 'node:fs'
import { isMain, parseArgs, usage, fail } from '../lib/cli.mjs'

/** Lit un fichier .env : « CLE=valeur », « export CLE=valeur », guillemets, commentaires. */
export function parseEnv(text) {
  const vars = new Map()
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue
    const m = line.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_.-]*)\s*=\s*(.*)$/)
    if (!m) continue
    let value = m[2]
    const quoted = value.match(/^(['"])(.*)\1/)
    value = quoted ? quoted[2] : value.replace(/\s+#.*$/, '')
    vars.set(m[1], value.trim())
  }
  return vars
}

const PLACEHOLDER = /^(changeme|change_me|your[_-].*|xxx+|<.*>|todo|replace.*|secret|password)$/i

export function compareEnv(example, actual) {
  const missing = []
  const empty = []
  const unchanged = []
  for (const [key, exampleValue] of example) {
    if (!actual.has(key)) { missing.push(key); continue }
    const value = actual.get(key)
    if (value === '') empty.push(key)
    else if (PLACEHOLDER.test(value) || (exampleValue !== '' && value === exampleValue && PLACEHOLDER.test(exampleValue))) unchanged.push(key)
  }
  const extra = [...actual.keys()].filter((k) => !example.has(k))
  return { missing, empty, unchanged, extra }
}

if (isMain(import.meta.url)) {
  const args = parseArgs(process.argv.slice(2), ['help', 'strict'])
  usage(`
Usage : node src/env-check.mjs .env.example .env [--strict]
Signale : variables manquantes, vides, laissées à une valeur d'exemple, et variables en trop.
Code de sortie 2 si une variable manque ou est vide (avec --strict : aussi si elle est en trop ou non modifiée).
Les valeurs ne sont jamais affichées.`, args, 2)
  let r
  try { r = compareEnv(parseEnv(readFileSync(args._[0], 'utf8')), parseEnv(readFileSync(args._[1], 'utf8'))) } catch (e) { fail(e.message) }
  const show = (icon, label, list) => list.length && console.log(`${icon} ${label} (${list.length}) : ${list.join(', ')}`)
  show('✗', 'manquantes', r.missing); show('✗', 'vides', r.empty)
  show('!', 'valeur d\'exemple conservée', r.unchanged); show('!', 'en trop (absentes de la référence)', r.extra)
  const bad = r.missing.length + r.empty.length + (args.strict ? r.unchanged.length + r.extra.length : 0)
  if (!r.missing.length && !r.empty.length && !r.unchanged.length && !r.extra.length) console.log('✓ Environnement conforme à la référence.')
  process.exit(bad ? 2 : 0)
}
