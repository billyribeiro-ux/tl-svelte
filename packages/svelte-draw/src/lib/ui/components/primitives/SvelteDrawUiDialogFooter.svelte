<script lang="ts" module>
	import type { Snippet } from 'svelte'

	/** @public */
	export interface TLUiDialogFooterProps {
		class?: string
		children?: Snippet
	}
</script>

<script lang="ts">
	import classNames from 'classnames'

	let { class: className, children }: TLUiDialogFooterProps = $props()
</script>

<div class={classNames('tlui-dialog__footer', className)}>{@render children?.()}</div>
