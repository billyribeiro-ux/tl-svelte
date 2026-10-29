<script lang="ts" module>
	import type { Snippet } from 'svelte'

	/** @public */
	export interface TLUiDialogTitleProps {
		class?: string
		children: Snippet
		/** A CSS string (React took a `CSSProperties` object). */
		style?: string
	}
</script>

<script lang="ts">
	import classNames from 'classnames'
	import { Dialog } from 'bits-ui'
	import { getDirection } from '../../hooks/useTranslation/useTranslation.svelte'

	let { class: className, children, style }: TLUiDialogTitleProps = $props()
	const dir = getDirection()
</script>

<Dialog.Title dir={dir.current} class={classNames('tlui-dialog__header__title', className)} {style}>
	{@render children()}
</Dialog.Title>
