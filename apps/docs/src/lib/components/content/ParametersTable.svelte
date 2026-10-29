<script lang="ts">
	import type { Snippet } from 'svelte'

	let { children }: { children?: Snippet } = $props()
</script>

<div class="prose-p:my-0 prose-pre:hidden prose-code:!bg-zinc-200 dark:prose-code:!bg-zinc-800">
	<table>
		<thead>
			<tr>
				<th>Name</th>
				<th>Description</th>
			</tr>
		</thead>
		<tbody>{@render children?.()}</tbody>
	</table>
</div>
