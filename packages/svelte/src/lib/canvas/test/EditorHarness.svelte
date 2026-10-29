<script lang="ts">
	/**
	 * A minimal stand-in for the root `SvelteDrawEditor`: a `.tl-container` with the editor, container,
	 * components, id scope and portal host provided, rendering the `Canvas` component.
	 * Only used by the canvas tests.
	 */
	import {
		Editor,
		createTLStore,
		type TLAnyBindingUtilConstructor,
		type TLAnyShapeUtilConstructor,
		type TLStateNodeConstructor,
		type TLStore,
	} from '@svelte-draw/editor'
	import { setEditorComponents } from '../componentsContext'
	import { setEditorPortalHost } from '../editorPortal'
	import { setIdScope } from '../safeId'
	import type { TLEditorComponents } from '../../context/components'
	import EditorHarnessInner from './EditorHarnessInner.svelte'

	let {
		store,
		shapeUtils = [],
		bindingUtils = [],
		tools = [],
		initialState,
		components,
		autoFocus = true,
		onMount,
	}: {
		store?: TLStore
		shapeUtils?: readonly TLAnyShapeUtilConstructor[]
		bindingUtils?: readonly TLAnyBindingUtilConstructor[]
		tools?: readonly TLStateNodeConstructor[]
		initialState?: string
		components?: TLEditorComponents
		autoFocus?: boolean
		onMount?: (editor: Editor) => void | (() => void)
	} = $props()

	let container = $state.raw<HTMLElement | null>(null)
	let portalHost = $state.raw<HTMLElement | null>(null)

	setIdScope()
	setEditorPortalHost(() => portalHost)
	setEditorComponents(() => components)
</script>

<div bind:this={container} class="tl-container tl-theme__light" tabindex="-1" role="application">
	{#if container}
		<EditorHarnessInner
			{container}
			store={store ?? createTLStore({ shapeUtils: [...shapeUtils], bindingUtils: [...bindingUtils] })}
			{shapeUtils}
			{bindingUtils}
			{tools}
			{initialState}
			{autoFocus}
			{onMount}
		/>
	{/if}
	<div class="tl-portal-host" bind:this={portalHost}></div>
</div>
