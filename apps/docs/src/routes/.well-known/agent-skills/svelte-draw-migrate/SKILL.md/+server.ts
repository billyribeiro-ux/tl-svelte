import { readPublishedSkill } from '#utils/agent-skills.js'
import type { RequestHandler } from './$types'

export const prerender = true

// Served verbatim from `skills/svelte-draw-migrate/SKILL.md` so the instructions can be read without
// unpacking anything. The index points at the archive instead — this file alone cannot run.
export const GET: RequestHandler = () => {
	return new Response(readPublishedSkill('svelte-draw-migrate').markdown, {
		headers: {
			'content-type': 'text/markdown; charset=utf-8',
			'access-control-allow-origin': '*',
		},
	})
}
