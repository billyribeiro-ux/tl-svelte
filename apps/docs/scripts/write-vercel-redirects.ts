import fs from 'fs'
import path from 'path'
import { redirects } from '../src/lib/redirects'

/**
 * Writes the `redirects` of src/lib/redirects.ts into vercel.json (the static build has no server to
 * apply them). Run it after editing the list: `pnpm check-redirects`.
 */
const vercelJsonPath = path.join(process.cwd(), 'vercel.json')
const vercelJson = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf8'))
vercelJson.redirects = redirects
fs.writeFileSync(vercelJsonPath, JSON.stringify(vercelJson, null, '\t') + '\n')
// eslint-disable-next-line no-console
console.log(`Wrote ${redirects.length} redirects to vercel.json`)
