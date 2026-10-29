<script lang="ts">
	import { getOwnerDocument, getGlobalWindow, hardResetEditor, refreshPage } from '@svelte-draw/editor'
	import { noop } from '@svelte-draw/utils'
	import { fromComputed } from '../state/fromSignal'
	import { getEditorComponents } from '../canvas/componentsContext'
	import type { Component } from 'svelte'
	import type { TLCanvasComponentProps, TLErrorFallbackProps } from '../context/components'
	import EditorProvider from './EditorProvider.svelte'
	import { getNodeEnv } from './env'
	import { createErrorMsg, errorMessages as messages } from './errorMessages'

	let { error, editor }: TLErrorFallbackProps = $props()

	const msg = createErrorMsg(() => editor)
	let containerRef: HTMLDivElement | null = null
	let shouldShowError = $state(getNodeEnv() === 'development')
	let didCopy = $state(false)
	let shouldShowResetConfirmation = $state(false)

	// The fallback can render outside of the components provider (the outermost boundary does), so
	// fail silently there and render no canvas.
	function findCanvas(): Component<TLCanvasComponentProps> | null {
		try {
			return getEditorComponents().Canvas ?? null
		} catch {
			// allow this to fail silently
			return null
		}
	}
	const Canvas = findCanvas()

	const errorMessage = $derived(error instanceof Error ? error.message : String(error))
	const errorStack = $derived(error instanceof Error ? error.stack : null)

	const darkModeFromApp = $derived.by(() => {
		const currentEditor = editor
		return fromComputed('isDarkMode', () => {
			try {
				if (currentEditor) {
					return currentEditor.user.getIsDarkMode()
				}
			} catch {
				// we're in a funky error state so this might not work for spooky
				// reasons. if not, we'll have another attempt later:
			}
			return null
		})
	})
	const isDarkModeFromApp = $derived(darkModeFromApp.current)

	let isDarkMode = $state<null | boolean>(null)
	$effect(() => {
		// if we found a theme class from the app, we can just use that
		if (isDarkModeFromApp !== null) {
			isDarkMode = isDarkModeFromApp
		}

		// do any of our parents have a theme class? if yes then we can just
		// rely on that and don't need to set our own class
		let parent = containerRef?.parentElement
		let foundParentThemeClass = false
		while (parent) {
			if (
				parent.classList.contains('tl-theme__dark') ||
				parent.classList.contains('tl-theme__light')
			) {
				foundParentThemeClass = true
				break
			}
			parent = parent.parentElement
		}
		if (foundParentThemeClass) {
			isDarkMode = null
			return
		}

		// if we can't find a theme class from the app or from a parent, we have
		// to fall back on using a media query:
		if (typeof window !== 'undefined' && getGlobalWindow().matchMedia) {
			isDarkMode = getGlobalWindow().matchMedia('(prefers-color-scheme: dark)').matches
		}
	})

	$effect(() => {
		if (didCopy) {
			const timeout = editor?.timers.setTimeout(() => {
				didCopy = false
			}, 2000)
			return () => clearTimeout(timeout)
		}
		return undefined
	})

	function copyError() {
		const doc = getOwnerDocument(containerRef)
		const textarea = doc.createElement('textarea')
		textarea.value = errorStack ?? errorMessage
		doc.body.appendChild(textarea)
		textarea.select()
		doc.execCommand('copy')
		textarea.remove()
		didCopy = true
	}

	function resetLocalState() {
		hardResetEditor()
	}

	const themeClass = $derived(
		isDarkMode === null ? '' : isDarkMode ? 'tl-theme__dark' : 'tl-theme__light'
	)
	const isDevelopmentBuild = getNodeEnv() !== 'production'
</script>

<div bind:this={containerRef} class={['tl-container tl-error-boundary', themeClass]}>
	<div class="tl-error-boundary__overlay"></div>
	{#if editor}
		<!--
			opportunistically attempt to render the canvas to reassure the user that their document is
			still there. there's a good chance this won't work (ie the error that we're currently
			notifying the user about originates in the canvas) so it's not a big deal if it doesn't work
			- in that case we just have a plain grey background.
		-->
		<svelte:boundary onerror={noop}>
			<EditorProvider {editor}>
				<div class="tl-overlay tl-error-boundary__canvas">
					{#if Canvas}
						<Canvas />
					{/if}
				</div>
			</EditorProvider>
			{#snippet failed()}{/snippet}
		</svelte:boundary>
	{/if}
	<div
		class={[
			'tl-modal',
			'tl-error-boundary__content',
			{ 'tl-error-boundary__content__expanded': shouldShowError && !shouldShowResetConfirmation },
		]}
	>
		{#if shouldShowResetConfirmation}
			<h2>{msg(messages.confirmResetTitle)}</h2>
			<p>{msg(messages.confirmResetDescription)}</p>
			<div class="tl-error-boundary__content__actions">
				<button class="tlui-button" onclick={() => (shouldShowResetConfirmation = false)}>
					{msg(messages.cancel)}
				</button>
				<button class="tlui-button tl-error-boundary__reset" onclick={resetLocalState}>
					{msg(messages.resetData)}
				</button>
			</div>
		{:else}
			<h2>{msg(messages.title)}</h2>
			<p>{msg(messages.refreshHint)}</p>
			<p>{msg(messages.resetHint)}</p>
			<p>
				<strong>{msg(messages.noteLabel)}</strong>
				{msg(messages.resetNote)}
			</p>
			{#if isDevelopmentBuild}
				<p>
					If you're developing with the SDK and need help, join us on
					<a
						href="https://discord.svelte-draw.invalid/?utm_source=sdk&utm_medium=organic&utm_campaign=error-screen"
						>Discord</a
					>.
				</p>
			{/if}
			{#if shouldShowError}
				{msg(messages.messageLabel)}
				<h4>
					<code>{errorMessage}</code>
				</h4>
				{msg(messages.stackTraceLabel)}
				<div class="tl-error-boundary__content__error">
					<pre><code>{errorStack ?? errorMessage}</code></pre>
					<button class="tlui-button" onclick={copyError}>
						{didCopy ? msg(messages.copied) : msg(messages.copy)}
					</button>
				</div>
			{/if}
			<div class="tl-error-boundary__content__actions">
				<button class="tlui-button" onclick={() => (shouldShowError = !shouldShowError)}>
					{shouldShowError ? msg(messages.hideDetails) : msg(messages.showDetails)}
				</button>
				<div class="tl-error-boundary__content__actions__group">
					<button
						class="tlui-button tl-error-boundary__reset"
						onclick={() => (shouldShowResetConfirmation = true)}
					>
						{msg(messages.resetData)}
					</button>
					<button class="tlui-button tl-error-boundary__refresh" onclick={refreshPage}>
						{msg(messages.refreshPage)}
					</button>
				</div>
			</div>
		{/if}
	</div>
</div>
