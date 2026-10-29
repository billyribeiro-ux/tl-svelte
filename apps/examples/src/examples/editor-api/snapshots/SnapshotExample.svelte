<script lang="ts">
	import { SvelteDraw, type TLComponents, type TLEditorSnapshot } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import _jsonSnapshot from './snapshot.json'
	import './snapshots.css'
	import SnapshotToolbar from './SnapshotToolbar.svelte'

	// There's a guide at the bottom of this file!

	const jsonSnapshot = _jsonSnapshot as any as TLEditorSnapshot

	const components: TLComponents = {
		SharePanel: SnapshotToolbar,
	}
</script>

<div class="svelte-draw__editor">
	<!-- [3] -->
	<SvelteDraw snapshot={jsonSnapshot} {components} />
</div>

<!--
[1]
`getSnapshot(editor.store)` returns `{ document, session }`. `document` is the content: pages, shapes,
assets, and so on. `session` is per-user editor state such as the current page, camera, and selection.
In a multi-user app you'd usually store these separately so each user keeps their own session. Here we
store both together in localStorage.

[2]
`loadSnapshot(editor.store, snapshot)` restores it. You can pass just `{ document }` and load
`{ session }` later on its own, or skip the session entirely.

[3]
Passing a snapshot to the `snapshot` prop loads it into the store when the editor is created, so the
editor starts with content.
-->
