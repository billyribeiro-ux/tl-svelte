<script lang="ts" module>
	/** @public */
	export interface SendButtonProps {
		/** The button's accessible name (e.g. "Send"). Shown as an up-arrow icon, so this is its label. */
		label: string
		disabled?: boolean
		onClick?(): void
	}
</script>

<script lang="ts">
	import SendIcon from './icons/SendIcon.svelte'

	/** The button that posts a comment — an up arrow. @public */
	let { label, disabled, onClick }: SendButtonProps = $props()
</script>

<button
	class="tlui-cmt-send"
	type="button"
	{disabled}
	onclick={() => onClick?.()}
	aria-label={label}
	title={label}
>
	<SendIcon />
</button>
