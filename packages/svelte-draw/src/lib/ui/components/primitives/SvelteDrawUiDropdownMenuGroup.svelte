<script lang="ts" module>
	import type { Snippet } from 'svelte'

	/** @public */
	export interface TLUiDropdownMenuGroupProps {
		children: Snippet
		class?: string
		'data-testid'?: string
	}
</script>

<script lang="ts">
	import classNames from 'classnames'
	import { getDirection } from '../../hooks/useTranslation/useTranslation.svelte'

	let { class: className, children, 'data-testid': dataTestId }: TLUiDropdownMenuGroupProps = $props()
	const dir = getDirection()
</script>

<div dir={dir.current} class={classNames('tlui-menu__group', className)} data-testid={dataTestId}>
	{@render children()}
</div>
