import { debounce } from '@svelte-draw/utils'
import type { Hit } from 'instantsearch.js'
import { escapeHits } from 'instantsearch.js/es/lib/utils'
import { type SearchEntry, type SearchIndexName, getSearchIndexName } from '#utils/algolia.js'

/** The placeholders instantsearch.js asks Algolia to wrap matches in; `escapeHits` turns them into <mark>. */
const HIGHLIGHT_PRE_TAG = '__ais-highlight__'
const HIGHLIGHT_POST_TAG = '__/ais-highlight__'

/**
 * One search session against an Algolia index: the plain-client replacement for the
 * `<InstantSearch>` + `useHits` + `useSearchBox` trio the React site used.
 *
 * Like InstantSearch, it runs an initial search with the empty query (the results list shows the
 * top entries before anything is typed).
 */
export class SearchSession {
	hits = $state.raw<Hit<SearchEntry>[]>([])
	/** Latest query handed to `refine`; the debounced input handler feeds it. */
	query = $state('')

	#indexName: string
	#params: { distinct?: number; hitsPerPage?: number }
	#requestId = 0
	/** Typing is debounced by 500ms, as before. */
	refineDebounced: (query: string) => void

	constructor(type: SearchIndexName, params: { distinct?: number; hitsPerPage?: number } = {}) {
		this.#indexName = getSearchIndexName(type)
		this.#params = params
		const debounced = debounce((query: string) => this.refine(query), 500)
		this.refineDebounced = (query) => void debounced(query)
	}

	async refine(query: string) {
		this.query = query
		const requestId = ++this.#requestId
		// Imported lazily: `algoliasearch(...)` throws when the app id is missing, and this module is
		// also evaluated while prerendering where no search happens.
		const { searchClient } = await import('#utils/search-api.js')
		const index = searchClient.initIndex(this.#indexName)
		const result = await index.search<SearchEntry>(query, {
			...this.#params,
			highlightPreTag: HIGHLIGHT_PRE_TAG,
			highlightPostTag: HIGHLIGHT_POST_TAG,
		})
		// Ignore responses that arrive after a newer query was sent.
		if (requestId !== this.#requestId) return
		this.hits = escapeHits(result.hits as unknown as Hit<SearchEntry>[])
	}
}

export function hitHref(hit: SearchEntry) {
	return hit.headingSlug ? `${hit.path}#${hit.headingSlug}` : hit.path
}
