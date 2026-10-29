<script lang="ts">
	import { SvelteDraw } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import XkcdDependency from './XkcdDependency.svelte'
</script>

<div class="svelte-draw__editor">
	<SvelteDraw>
		<XkcdDependency />
	</SvelteDraw>
</div>

<!--
[1]
Rapier is a WASM module and must be initialised asynchronously. The shapes are created first
so the comic appears immediately; physics attaches once the module is ready.

[2]
The traced block positions overlap slightly, so the world is stepped a number of times before
the first frame to let them settle, then every body is put to sleep so the tower is still
until something disturbs it.

[3]
When the user deletes a block, its rigid body is removed too and everything is woken so the
tower re-settles. `source: 'user'` filters out the position updates we write ourselves.

[4]
Every editor `tick`, selected blocks are switched to kinematic bodies that follow the shape's
position (so dragging moves the physics body, not the other way round), the world is stepped,
and every awake, unselected body writes its position and rotation back to its shape with
`editor.updateShapes`.
-->
