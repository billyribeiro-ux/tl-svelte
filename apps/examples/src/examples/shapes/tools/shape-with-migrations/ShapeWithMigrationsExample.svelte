<script lang="ts">
	import { SvelteDraw, type TLStoreSnapshot } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import { MigratedShapeUtil } from './MigratedShapeUtil'
	import snapshot from './snapshot.json'

	const customShapeUtils = [MigratedShapeUtil]
</script>

<div class="svelte-draw__editor">
	<!-- [4] -->
	<SvelteDraw shapeUtils={customShapeUtils} snapshot={snapshot as TLStoreSnapshot} />
</div>

<!--
/*
Introduction:

Sometimes you'll want to update the way a shape works in your application without breaking older
versions of the shape that a user may have stored or persisted in memory.

This example shows how you can use our migrations system to upgrade (or downgrade) user's data
between different versions. Most of the code in the util file is general "custom shape" code—see our custom
shape example for more details.

[1] First, we need IDs for each migration. List each change with its version number. Once you've
shipped a migration, it should not change again; add a new one instead.

[2] Next, we create a migration sequence. This is where we actually write our migration logic. Each
migration has three parts: an `id` (created in [1]), an `up` migration and a `down` migration. In
this case, the `up` migration adds the `color` prop to the shape, and the `down` migration removes
it.

In some cases (mainly in multiplayer sessions) a peer or server may need to take a later version of
a shape and migrate it down to an older version—in this case, it would run the down migrations in
order to get it to the needed version.

[3] Finally, we add our migrations to the ShapeUtil's static `migrations` property. This tells
svelte-draw about the migrations so they can be used with your shapes.

[4] To show the migration running, we load a snapshot that was saved before the `color` prop
existed. The migration runs as the snapshot loads, so the shape appears light blue.

How it works:

Each time the editor creates a snapshot (`editor.getSnapshot()`), it serializes all
of the records (the snapshot's `store`) as well as versions of each record that it contains (the
snapshot's `schema`). When the editor loads a snapshot, it compares its current schema with the
snapshot's schema to determine which migrations to apply to each record.

In this example, we have a snapshot (snapshot.json) that we created in version 0, however our shape
now has a 'color' prop that was added in version 1.

The snapshot looks something like this:

```json
{
	"store": {
		"shape:BqG5uIAa9ig2-ukfnxwBX": {
			...,
			"props": {
				"w": 300,
				"h": 300
			}
		}
	},
	"schema": {
		...,
		"recordVersions": {
			"shape": {
				"subTypeVersions": {
					...,
					"myshapewithmigrations": 0
				}
			}
		}
	}
}
```

The shape in the snapshot doesn't have a 'color' prop, and the schema's version for this shape is
0.

When the editor loads the snapshot, it will compare the serialized schema's version with its current
schema's version for the shape, which is 1 as defined in our shape's migrations. Since the
serialized version is older than its current version, it will use our migration to bring it up to
date: it will run the migration's `up` function, which will add the 'color' prop to the shape.
*/
-->
