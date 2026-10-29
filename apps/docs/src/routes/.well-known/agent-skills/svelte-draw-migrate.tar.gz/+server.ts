import { readPublishedSkill } from '#utils/agent-skills.js'
import type { RequestHandler } from './$types'

export const prerender = true

// The installable form of the skill: the whole directory, which the index publishes a digest over.
// A client that unpacks this and one that reads the `SKILL.md` route next door see the same
// instructions; only this one carries the helper scripts those instructions run.
export const GET: RequestHandler = () => {
	return new Response(new Uint8Array(readPublishedSkill('svelte-draw-migrate').archive), {
		headers: {
			'content-type': 'application/gzip',
			'access-control-allow-origin': '*',
		},
	})
}
