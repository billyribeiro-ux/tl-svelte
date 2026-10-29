<script lang="ts">
	import type { ClassValue } from 'svelte/elements'
	import mergedSpriteUrl from '../../../assets/0_merged_tla.svg'
	import styles from './icon.module.css'

	function getMaskStyle(icon: string): string {
		return `url(${mergedSpriteUrl}#icon-${icon}) center 100% / 100% no-repeat`
	}

	let {
		icon,
		class: className = '',
		invertIcon,
		inline,
		ariaLabel,
		style,
	}: {
		icon: string
		class?: ClassValue
		invertIcon?: boolean
		inline?: boolean
		ariaLabel?: string
		/** A CSS declaration string, appended after the mask (React took a `CSSProperties` object). */
		style?: string
	} = $props()

	const classes = $derived([styles.icon, inline && styles.inline, className])

	const styleString = $derived(
		[
			`mask: ${getMaskStyle(icon)}`,
			invertIcon ? 'transform: scale(-1, 1)' : '',
			typeof style === 'string' ? style : '',
		]
			.filter(Boolean)
			.join('; ')
	)

	// HACK: Fix for <https://linear.app/svelte-draw/issue/TLD-1700/dragging-around-with-the-handtool-makes-lots-of-requests-for-icons>
	// Keep the prefixed mask in sync through an attachment rather than the style attribute.
	function applyWebkitMask(element: HTMLElement) {
		element.style.setProperty('-webkit-mask', getMaskStyle(icon))
	}
</script>

{#if icon === 'none'}
	<!-- An empty spacer: keep the icon's layout box but no painted mark.
	     Without this the .icon background-color would fill as a solid rectangle. -->
	<span class={classes} style="background-color: transparent"></span>
{:else}
	<span
		{@attach applyWebkitMask}
		class={classes}
		aria-hidden="true"
		role="img"
		aria-label={ariaLabel}
		style={styleString}
	></span>
{/if}
