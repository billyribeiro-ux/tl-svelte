import { getSidebarForSection, loadSidebarLinks } from '#lib/sidebar.js'
import type { PageLoad } from './$types'

// A universal load, so the sidebar (identical on every page of a section and thousands of links long
// for the API reference) is imported as a cacheable chunk instead of being serialised into each page.
export const load: PageLoad = async ({ data }) => {
	const sidebarLinks = await loadSidebarLinks(getSidebarForSection(data.article.sectionId))
	return { ...data, sidebarLinks }
}
