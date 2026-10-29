import type { Plugin } from 'vite'
import { db } from './utils/ContentDatabase.ts'

/**
 * The sidebars are the same on every page of a section and thousands of links long for the API
 * reference. Returning them from a server `load` would serialise a copy into every page's HTML, so
 * they are exposed as modules instead: one cacheable JS chunk per sidebar, imported by a universal
 * `load` (whose result is recomputed on the client rather than serialised).
 *
 * `virtual:docs-sidebar/<name>` where <name> is one of `docs | reference | examples | starter-kits`.
 */
const PREFIX = 'virtual:docs-sidebar/'
const RESOLVED_PREFIX = '\0' + PREFIX

// `getSidebarContentList` returns the same `links` whichever article is active, so any section of the
// sidebar group works as the key.
const SIDEBAR_SECTIONS: Record<string, string> = {
	docs: 'docs',
	reference: 'reference',
	examples: 'examples',
	'starter-kits': 'starter-kits',
}

export function docsSidebarModules(): Plugin {
	return {
		name: 'docs-sidebar-modules',
		resolveId(id) {
			if (id.startsWith(PREFIX)) return '\0' + id
		},
		async load(id) {
			if (!id.startsWith(RESOLVED_PREFIX)) return
			const name = id.slice(RESOLVED_PREFIX.length)
			const sectionId = SIDEBAR_SECTIONS[name]
			if (!sectionId) throw new Error(`Unknown docs sidebar "${name}"`)
			const { links } = await db.getSidebarContentList({ sectionId })
			return `export default ${JSON.stringify(links)}`
		},
		configureServer(server) {
			// `watcher.ts` rewrites content.db while `vite dev` runs; reload the sidebars when it does.
			server.watcher.add('content.db')
			server.watcher.on('change', (file) => {
				if (!file.endsWith('content.db')) return
				for (const mod of server.moduleGraph.idToModuleMap.values()) {
					if (mod.id?.startsWith(RESOLVED_PREFIX)) server.moduleGraph.invalidateModule(mod)
				}
				server.ws.send({ type: 'full-reload' })
			})
		},
	}
}
