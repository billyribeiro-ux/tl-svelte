<script lang="ts">
	import { SvelteDraw, createTLStore } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import './custom-records.css'
	import AddMarkerButton from './AddMarkerButton.svelte'
	import { MARKER_TYPE, markerRecord } from './marker'
	import MarkerOverlay from './MarkerOverlay.svelte'

	// There's a guide at the bottom of this file!

	const components = {
		InFrontOfTheCanvas: MarkerOverlay,
		TopPanel: AddMarkerButton,
	}

	// [6]
	const store = createTLStore({
		records: { [MARKER_TYPE]: markerRecord },
	})
</script>

<div class="svelte-draw__editor">
	<SvelteDraw {store} {components} />
</div>

<!--
Custom record types let you keep domain data in the svelte-draw store that isn't a shape,
binding, or asset, so it's persisted, synced, and migrated alongside everything else.
This example adds a "marker" record: a pin at a page position with a label and icon.

[1]
The record type (see marker.ts) extends `BaseRecord`, which supplies `id` and `typeName`.
Augmenting `TLGlobalRecordPropsMap` adds it to `TLRecord`, so
`store.query.records('marker')`, `store.put`, and `store.remove` are all typed without casts.

[2]
`createCustomRecordMigrationIds` builds ids in the form `com.tldraw.marker/1`, which is
the sequence id the store expects for custom records.

[3]
The `CustomRecordInfo` passed to the store:
- `scope: 'document'` means persisted and synced; `'session'` would keep records local.
- `validator` checks the whole record, including `id` and `typeName`.
- `migrations` is optional. Each entry mutates the record in place (or returns a new
  one). Here version 1 adds the `icon` field to markers saved before it existed.
- `createDefaultProperties` fills in anything `store.put` doesn't supply.

[4]
Ids for custom records are `typeName:uniqueId`. `createCustomRecordId` returns a
generic record id, so we cast to `Marker['id']` once here.

[5]
`store.query.records(MARKER_TYPE)` returns a computed signal of all marker records.
Reading it and `pageToViewport` inside `fromComputed` means the overlay updates when a
marker is added or removed and when the camera moves, so pins stay glued to their page
position. Right-click (or ctrl-click) a marker to remove it.

[6]
Register the record type when creating the store via the `records` option, then pass
the store to `SvelteDraw`. The store must be created once, which happens here because the
instance script of a component runs once.
-->
