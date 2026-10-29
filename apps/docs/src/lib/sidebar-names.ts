// These sections each get a sidebar of their own; everything else shares the docs sidebar.
const STANDALONE_SIDEBAR_SECTIONS = new Set(['reference', 'examples', 'starter-kits'])

export type SidebarName = 'docs' | 'reference' | 'examples' | 'starter-kits'

/** Which sidebar (and `virtual:docs-sidebar/<name>` module) a section is shown with. */
export function getSidebarForSection(sectionId: string | undefined): SidebarName {
	return sectionId && STANDALONE_SIDEBAR_SECTIONS.has(sectionId)
		? (sectionId as SidebarName)
		: 'docs'
}
