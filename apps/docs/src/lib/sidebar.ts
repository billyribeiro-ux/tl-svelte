import { type SidebarName } from './sidebar-names.ts'

export { getSidebarForSection, type SidebarName } from './sidebar-names.ts'

/** Loads a sidebar's links. The imports are spelled out because Vite resolves them statically. */
export function loadSidebarLinks(name: SidebarName) {
	switch (name) {
		case 'docs':
			return import('virtual:docs-sidebar/docs').then((m) => m.default)
		case 'reference':
			return import('virtual:docs-sidebar/reference').then((m) => m.default)
		case 'examples':
			return import('virtual:docs-sidebar/examples').then((m) => m.default)
		case 'starter-kits':
			return import('virtual:docs-sidebar/starter-kits').then((m) => m.default)
	}
}
