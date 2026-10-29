<script lang="ts" module>
	import type { Snippet } from 'svelte'

	/** @public */
	export interface TLUiDialogHeaderProps {
		class?: string
		children: Snippet
	}
</script>

<script lang="ts">
	import classNames from 'classnames'

	let { class: className, children }: TLUiDialogHeaderProps = $props()
</script>

<div class={classNames('tlui-dialog__header', className)}>{@render children()}</div>
