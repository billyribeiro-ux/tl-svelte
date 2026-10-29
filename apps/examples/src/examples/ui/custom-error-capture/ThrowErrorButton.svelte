<script lang="ts">
	import { getEditor } from 'svelte-draw'

	const editor = getEditor()
</script>

<button
	class="custom-error__button"
	onclick={() => {
		// [6]
		editor.createShape({
			// @ts-expect-error
			type: 'does-not-exist',
		})
	}}
>
	Throw an error
</button>
