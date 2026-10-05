/**
 * MINKA - Reset completo de Supabase
 * Borra: cuentas de usuario (email + Google OAuth), todas las tablas públicas
 * y todos los archivos de los buckets de Storage.
 *
 * Uso:  npm run reset-db          (pide confirmación)
 *       npm run reset-db -- --yes (sin confirmación)
 *
 * Requiere en .env.local:
 *   VITE_SUPABASE_URL=...
 *   SUPABASE_SERVICE_ROLE_KEY=...   (Project Settings > API > service_role)
 *   ⚠️ SIN prefijo VITE_ para que nunca se exponga en el frontend.
 */
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import readline from 'readline'

// --- Cargar .env.local ---
const envPath = path.resolve(process.cwd(), '.env.local')
const env = { ...process.env }
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
}

const url = (env.VITE_SUPABASE_URL || '').replace(/\/rest\/v1\/?$/, '')
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error('❌ Falta VITE_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local')
  console.error('   Obtén la service_role key en: Supabase > Project Settings > API Keys')
  console.error('   Alternativa manual: ejecuta supabase/reset-database.sql en el SQL Editor.')
  process.exit(1)
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

// Orden respetando claves foráneas (hijos primero)
const TABLES = ['contributions', 'project_updates', 'reward_tiers', 'projects', 'profiles']
const BUCKETS = ['project-banners', 'project-documents', 'update-media', 'user-avatars', 'project-gallery']

async function confirm() {
  if (process.argv.includes('--yes') || process.argv.includes('-y')) return true
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  const answer = await new Promise(r =>
    rl.question(`⚠️  Esto BORRARÁ TODO en ${url}. Escribe "borrar" para continuar: `, r)
  )
  rl.close()
  return answer.trim().toLowerCase() === 'borrar'
}

// Lista recursiva (los archivos suelen estar en subcarpetas userId/projectId)
async function listAllFiles(bucket, prefix = '') {
  const files = []
  let offset = 0
  while (true) {
    const { data, error } = await supabase.storage.from(bucket).list(prefix, { limit: 1000, offset })
    if (error) throw error
    if (!data || data.length === 0) break
    for (const item of data) {
      const fullPath = prefix ? `${prefix}/${item.name}` : item.name
      if (item.id === null) files.push(...(await listAllFiles(bucket, fullPath))) // carpeta
      else files.push(fullPath)
    }
    if (data.length < 1000) break
    offset += 1000
  }
  return files
}

async function wipeStorage() {
  console.log('\n🗂️  Storage')
  for (const bucket of BUCKETS) {
    try {
      const files = await listAllFiles(bucket)
      for (let i = 0; i < files.length; i += 100) {
        const { error } = await supabase.storage.from(bucket).remove(files.slice(i, i + 100))
        if (error) throw error
      }
      console.log(`   ✅ ${bucket}: ${files.length} archivo(s) eliminados`)
    } catch (e) {
      console.warn(`   ⚠️ ${bucket}: ${e.message}`)
    }
  }
}

async function wipeTables() {
  console.log('\n🧾 Tablas')
  for (const table of TABLES) {
    const { error, count } = await supabase.from(table).delete({ count: 'exact' }).not('id', 'is', null)
    if (error) console.warn(`   ⚠️ ${table}: ${error.message}`)
    else console.log(`   ✅ ${table}: ${count ?? 0} fila(s) eliminadas`)
  }
}

async function wipeUsers() {
  console.log('\n👤 Usuarios (email + Google)')
  let total = 0
  while (true) {
    // Siempre página 1: al borrar, la lista se desplaza
    const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })
    if (error) { console.warn(`   ⚠️ ${error.message}`); break }
    if (!data.users.length) break
    for (const u of data.users) {
      const { error: delErr } = await supabase.auth.admin.deleteUser(u.id)
      if (delErr) { console.warn(`   ⚠️ ${u.email}: ${delErr.message}`); return }
      total++
    }
  }
  console.log(`   ✅ ${total} usuario(s) eliminados`)
}

async function main() {
  console.log('🚀 Reset de Minka')
  if (!(await confirm())) { console.log('Cancelado.'); process.exit(0) }
  await wipeStorage()
  await wipeTables()
  await wipeUsers()
  console.log('\n✨ Listo. Base de datos, storage y cuentas limpias.')
  console.log('   Tip: cierra sesión / borra localStorage del navegador para limpiar la sesión local.\n')
}

main().catch(e => { console.error('❌', e); process.exit(1) })
