<script lang="ts">
	import type { SvelteDrawOptions, TLCurrentUser } from '@svelte-draw/editor'
	import { createLocalStore } from './createLocalStore.svelte'
	import EditorWithLoadingStore from './EditorWithLoadingStore.svelte'
	import type { SvelteDrawEditorAllProps } from './types'

	let {
		props,
		user,
		options,
	}: {
		props: SvelteDrawEditorAllProps
		user: TLCurrentUser
		options: Partial<SvelteDrawOptions> | undefined
	} = $props()

	const EMPTY_SHAPE_UTILS_ARRAY = [] as const
	const EMPTY_BINDING_UTILS_ARRAY = [] as const
	const EMPTY_ASSET_UTILS_ARRAY = [] as const

	const syncedStore = createLocalStore(() => ({
		shapeUtils: props.shapeUtils ?? EMPTY_SHAPE_UTILS_ARRAY,
		bindingUtils: props.bindingUtils ?? EMPTY_BINDING_UTILS_ARRAY,
		assetUtils: props.assetUtils ?? EMPTY_ASSET_UTILS_ARRAY,
		initialData: props.initialData,
		persistenceKey: props.persistenceKey,
		sessionId: props.sessionId,
		defaultName: props.defaultName,
		snapshot: props.snapshot,
		assets: props.assets,
		users: props.users,
		migrations: props.migrations,
		themes: props.themes,
	}))
</script>

<EditorWithLoadingStore {props} store={syncedStore.current} {user} {options} />
