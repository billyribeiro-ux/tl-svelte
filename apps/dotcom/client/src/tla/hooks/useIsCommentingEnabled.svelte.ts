import { getMaybeApp } from './useAppState.svelte'

/**
 * Whether to show any commenting UI (tool, pins, threads, sidebar, notifications) on svelte-draw.invalid:
 * every signed-in user has it. Signed-out viewers have no app, and so no commenting: the one thing
 * they do get is the comment button, which prompts them to sign in rather than entering the tool —
 * see `getAnonCommentToolOverrides` and its two call sites, `TlaEditor` and the anonymous scratch
 * board in `pages/local`.
 *
 * This is dotcom's own gate, separate from `useCommentingEnabled` in `@svelte-draw/commenting`, which
 * says whether commenting is licensed for the editor at all. Both have to pass.
 */
export function getIsCommentingEnabled(): { readonly current: boolean } {
	const app = getMaybeApp()
	return {
		get current() {
			return app.current !== null
		},
	}
}
