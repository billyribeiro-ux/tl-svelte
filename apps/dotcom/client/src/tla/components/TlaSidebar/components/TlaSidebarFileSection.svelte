<script lang="ts">
	import type { Snippet } from 'svelte'
	import { SvelteDrawUiButton } from 'svelte-draw'
	import TlaIcon from '../../TlaIcon/TlaIcon.svelte'
	import styles from '../sidebar.module.css'

	let {
		title,
		iconLeft,
		onePixelOfPaddingAtTheTop,
		children,
		class: className,
		iconButton,
	}: {
		title: Snippet
		iconLeft?: string
		onePixelOfPaddingAtTheTop?: boolean
		children: Snippet
		class?: string
		iconButton?: {
			icon: string
			onClick(): void
			title?: string
		}
	} = $props()

	const id = $props.id()
</script>

<div
	class={[
		styles.sidebarFileSectionWrapper,
		{
			[styles.sidebarFileSectionTitlePadding]: onePixelOfPaddingAtTheTop,
		},
		className,
	]}
>
	<div class={['tla-text_ui__medium', styles.sidebarFileSectionTitle]}>
		{#if iconLeft}<TlaIcon icon={iconLeft} />{/if}
		<span {id} class={styles.sidebarFileSectionTitleText} role="heading" aria-level={2}>
			{@render title()}
		</span>
		{#if iconButton}
			<SvelteDrawUiButton
				type="icon"
				class={styles.sidebarCreateFileButton}
				onclick={iconButton.onClick}
				tooltip={iconButton.title}
				title={iconButton.title}
			>
				<TlaIcon icon={iconButton.icon} />
			</SvelteDrawUiButton>
		{/if}
	</div>
	<div class={styles.sidebarFileSection} role="list" aria-labelledby={id}>
		{@render children()}
	</div>
</div>
