// Confere para qual projeto Supabase um build aponta.
// As variáveis VITE_* são gravadas no JavaScript durante o build, então procuramos
// o ref do projeto nos arquivos gerados: o esperado tem que estar lá e o proibido não.
//
// Uso: node scripts/check-supabase-target.mjs --dir .vercel/output --expect <ref> --forbid <ref>

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, extname } from 'node:path'

function readArgs() {
  const args = {}
  const argv = process.argv.slice(2)
  for (let i = 0; i < argv.length; i += 2) {
    args[argv[i].replace(/^--/, '')] = argv[i + 1]
  }
  return args
}

function listFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    return statSync(path).isDirectory() ? listFiles(path) : [path]
  })
}

const { dir, expect: expected, forbid: forbidden } = readArgs()

if (!dir || !expected || !forbidden) {
  console.error('Parâmetros obrigatórios: --dir, --expect e --forbid (refs dos projetos Supabase).')
  process.exit(1)
}

if (expected === forbidden) {
  console.error('Os refs esperado e proibido são iguais: confira as variáveis do pipeline.')
  process.exit(1)
}

const files = listFiles(dir).filter((file) => ['.js', '.html', '.mjs'].includes(extname(file)))
const filesWith = (ref) => files.filter((file) => readFileSync(file, 'utf8').includes(ref))

const withExpected = filesWith(expected)
const withForbidden = filesWith(forbidden)

if (withForbidden.length > 0) {
  console.error(`ERRO: o build aponta para o Supabase proibido (${forbidden}):`)
  withForbidden.forEach((file) => console.error(`  - ${file}`))
  process.exit(1)
}

if (withExpected.length === 0) {
  console.error(`ERRO: o Supabase esperado (${expected}) não foi encontrado no build em ${dir}.`)
  process.exit(1)
}

console.log(`OK: o build em ${dir} aponta para o Supabase ${expected} e não contém ${forbidden}.`)
