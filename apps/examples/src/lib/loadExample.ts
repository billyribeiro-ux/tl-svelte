import { error } from '@sveltejs/kit'
import { findExampleBySlug, type Example, type ExampleComponent } from './examples.js'

export interface LoadedExample {
	example: Example
	component: ExampleComponent
}

/** Resolves an example route slug, or throws a 404 (the old router rendered a 404 page). */
export async function loadExampleBySlug(slug: string): Promise<LoadedExample> {
	const example = findExampleBySlug(slug)
	if (!example) error(404, 'Not Found')
	return { example, component: await example.loadComponent() }
}
