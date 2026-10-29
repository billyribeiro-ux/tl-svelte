<script lang="ts">
	import { SvelteDraw } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
</script>

<div class="svelte-draw__editor">
	<SvelteDraw persistenceKey="force-mobile-example" forceMobile />
</div>

<!--
The `forceMobile` prop pins the UI to the mobile breakpoint regardless of the
container's width. Useful for previewing the mobile layout on desktop, or when
the editor is embedded in a narrow panel where the desktop layout wouldn't fit.
-->
