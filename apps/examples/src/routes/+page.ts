import { getBasicExample } from '#lib/examples.js'

export async function load() {
	const example = getBasicExample()
	return { example, component: await example.loadComponent() }
}
