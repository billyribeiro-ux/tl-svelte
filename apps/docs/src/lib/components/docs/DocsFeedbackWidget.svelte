<script lang="ts">
	import { onMount } from 'svelte'
	import { page } from '$app/state'
	import Heroicon from '#lib/components/common/Heroicon.svelte'
	import { track } from '#lib/analytics.js'
	import { LocalStorageState } from '#lib/storage.svelte.js'
	import { cn } from '#utils/cn.js'

	const DEBUGGING = false

	async function submitFeedback(
		_sessionId: string,
		_pathname: string,
		_feedback: 1 | -1 | 0,
		_note: string
	) {
		const feedback: { value: number; message?: string } = { value: _feedback }
		if (_note !== '') feedback.message = _note
		track('Feedback', feedback)
		return
	}
	async function submitThumbsFeedback(
		_sessionId: string,
		_pathname: string,
		_feedback: 1 | -1 | 0
	) {
		const feedback: { value: number; message?: string } = { value: _feedback }
		track('Helpful', feedback)
		return
	}

	let { class: className }: { class?: string } = $props()

	const pathname = $derived(page.url.pathname)

	const didSubmit = new LocalStorageState(() => pathname + '-feedback-submitted', false)

	// Set the feedback session id to a random id and stash it in storage
	const sessionIdState = new LocalStorageState(
		() => 'feedback-session-id',
		Math.random().toString(36).substring(7)
	)
	const sessionId = $derived(sessionIdState.value)

	let state = $state<'idle' | 'thumbs-up' | 'thumbs-down' | 'loading' | 'success' | 'error'>(
		'idle'
	)

	onMount(() => {
		sessionIdState.restore()
	})
	// The submitted flag is per page, so re-read it whenever the pathname changes.
	$effect(() => {
		void pathname
		didSubmit.restore(false)
	})

	function handleThumbs(thumb: 'thumbs-up' | 'thumbs-down') {
		const next = state === thumb ? 'idle' : thumb
		if (next === thumb) {
			submitThumbsFeedback(sessionId, pathname, thumb === 'thumbs-up' ? 1 : -1)
		}
		state = next
	}

	async function handleSubmit(e: SubmitEvent & { currentTarget: HTMLFormElement }) {
		e.preventDefault()
		if (state === 'loading') return
		if (!sessionId) return

		try {
			const form = e.currentTarget
			const formData = new FormData(form)
			const feedback = formData.get('feedback') as string

			// The vote is read before the state flips to 'loading' (the React closure saw the old state).
			const vote = state === 'thumbs-up' ? 1 : -1
			state = 'loading'
			await submitFeedback(sessionId, pathname, vote, feedback)
			state = 'success'
			setTimeout(() => {
				didSubmit.set(true)
			}, 3000)
		} catch {
			state = 'error'
		}
	}
</script>

<!-- todo, improve this so that thumbs ups and thumbs downs are also captured -->
{#if !didSubmit.value || (DEBUGGING && import.meta.env.DEV)}
	<div
		class={cn(
			'-ml-4 px-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg shrink-0 text-xs h-auto',
			className
		)}
	>
		{#if state !== 'success'}
			<div class="flex justify-between items-center">
				<span>Is this page helpful?</span>
				<div class="flex">
					<button
						onclick={() => handleThumbs('thumbs-down')}
						aria-label="Not helpful"
						class={cn(
							'h-9 w-7 flex items-center justify-center pt-0.5',
							state === 'thumbs-down' && 'text-blue-500',
							state !== 'thumbs-down' && 'hover:text-black dark:hover:text-white'
						)}
					>
						<Heroicon name="20/solid/HandThumbDown" class="h-4" />
					</button>
					<button
						onclick={() => handleThumbs('thumbs-up')}
						aria-label="Helpful"
						class={cn(
							'h-9 w-7 flex items-center justify-center pb-0.5 -mr-1',
							state === 'thumbs-up' && 'text-blue-500',
							state !== 'thumbs-up' && 'hover:text-black dark:hover:text-white'
						)}
					>
						<Heroicon name="24/solid/HandThumbUp" class="h-4" />
					</button>
				</div>
			</div>
		{/if}
		{#if state === 'thumbs-up' || state === 'thumbs-down' || state === 'loading'}
			<form onsubmit={handleSubmit} class="pb-3">
				<div>
					<label for="docs-feedback" class="sr-only">Your feedback</label>
					<textarea
						id="docs-feedback"
						name="feedback"
						placeholder="Your feedback..."
						rows={3}
						class="resize-none bg-zinc-200/50 dark:bg-zinc-700/50 w-full rounded-md placeholder-zinc-400 dark:placeholder-zinc-600 text-black dark:text-white px-2 py-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-zinc-50 dark:focus:ring-offset-zinc-900"
					></textarea>
				</div>
				<button
					type="submit"
					disabled={state === 'loading'}
					class="bg-blue-500 rounded-md h-6 px-3 flex items-center text-white gap-1.5 font-medium ml-auto mt-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-zinc-50 hover:bg-blue-600 dark:hover:bg-blue-400 dark:focus:ring-offset-zinc-900"
				>
					<span>Submit</span>
					<Heroicon name="20/solid/ArrowLongRight" class="h-3.5" />
				</button>
			</form>
		{/if}
		{#if state === 'success'}
			<p class="h-9 flex items-center gap-1.5">
				<Heroicon name="20/solid/CheckCircle" class="h-4 text-emerald-500 dark:text-emerald-400" />
				<span>Thanks for your feedback!</span>
			</p>
		{/if}
	</div>
{/if}
