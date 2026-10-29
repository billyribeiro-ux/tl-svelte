import { loadExampleBySlug } from '#lib/loadExample.js'
import type { PageLoadEvent } from './$types'

export function load({ params }: PageLoadEvent) {
	return loadExampleBySlug(params.slug)
}
