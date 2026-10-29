<script lang="ts">
	import { getLicenseKey } from '@svelte-draw/dotcom-shared'
	import { type Editor, SvelteDraw } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import { HtmlCssShapeUtil } from './HtmlCssShapeUtil'
	import SneakyExportButton from './SneakyExportButton.svelte'

	// `__svelteDraw_ui_event` and `__svelteDraw_editor_events` are initialised once per page load by
	// the root layout, as they were when the React bundle imported this page eagerly.
	interface E2EWindow {
		app?: Editor
		editor?: Editor
		__TLDRAW_LICENSE_KEY__?: string | null
		__svelteDraw_ui_event: unknown
		__svelteDraw_editor_events: unknown[]
	}
	const w = window as unknown as E2EWindow

	// Use test license key if available, otherwise use the default
	// Check if __TLDRAW_LICENSE_KEY__ was explicitly set (including null/undefined/empty string)
	const testLicenseKey = w.__TLDRAW_LICENSE_KEY__
	const hasExplicitTestKey = Object.prototype.hasOwnProperty.call(window, '__TLDRAW_LICENSE_KEY__')
	// `null` has to reach the license provider unchanged: it means "explicitly unlicensed", whereas
	// `undefined` falls back to the key from the environment. `SvelteDraw`'s `licenseKey` prop is
	// typed `string | undefined`, hence the assertion.
	const licenseKey = (hasExplicitTestKey ? testLicenseKey : getLicenseKey()) as string | undefined

	if (!customElements.get('custom-element')) {
		const template = document.createElement('template')
		template.innerHTML = `
			<style>
				article {
					margin: 1em;
					display: flex;
					flex-direction: column;
					gap: 1em;
				}
				.list {
					background-color: lightskyblue;
					padding: 1em;
				}
				.choice {
					background-color: lightgreen;
					padding: 1em;
				}
			</style>
			<article>
				<div class="list">
					list: <slot name="list"></slot>
				</div>
				<div class="choice">
					choice: <slot name="choice"></slot>
				</div>
			</article>
		`
		customElements.define(
			'custom-element',
			class extends HTMLElement {
				constructor() {
					super()
					const templateContent = template.content
					const shadowRoot = this.attachShadow({ mode: 'open' })
					shadowRoot.appendChild(templateContent.cloneNode(true))
				}
			}
		)
	}
</script>

<div class="svelte-draw__editor">
	<SvelteDraw
		{licenseKey}
		onMount={(editor) => {
			w.app = editor
			w.editor = editor

			editor.on('event', (info) => {
				w.__svelteDraw_editor_events.push(info)
			})
		}}
		onUiEvent={(name, data) => {
			w.__svelteDraw_ui_event = { name, data }
		}}
		shapeUtils={[HtmlCssShapeUtil]}
	>
		<SneakyExportButton />
	</SvelteDraw>
</div>
