<script lang="ts">
	import { SvelteDraw } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
</script>

<div class="svelte-draw__editor">
	<SvelteDraw colorScheme="dark" />
</div>

<!--
The `colorScheme` prop sets the editor's default color scheme: 'light' (the default),
'dark', or 'system' to follow the OS preference. A user preference set via
`editor.user.updateUserPreferences({ colorScheme })` takes priority over this prop,
so a persisted user preference from another example may override it. See the
dark-mode-toggle example for switching at runtime.
-->
