<script lang="ts" module>
	import type { Snippet } from 'svelte'

	/** @public */
	export interface TLUiDialogBodyProps {
		class?: string
		children: Snippet
		/** A CSS string (React took a `CSSProperties` object). */
		style?: string
	}
</script>

<script lang="ts">
	import classNames from 'classnames'

	let { class: className, children, style }: TLUiDialogBodyProps = $props()
</script>

<!-- tabindex=0 is intentional: the scrollable body must be keyboard focusable (matches the React primitive). -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div class={classNames('tlui-dialog__body', className)} {style} tabindex={0}>
	{@render children()}
</div>
