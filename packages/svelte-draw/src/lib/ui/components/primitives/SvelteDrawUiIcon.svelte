<script lang="ts" module>
	import type { Snippet } from 'svelte'
	import type { HTMLAttributes } from 'svelte/elements'
	import type { TLUiIconType } from '../../icon-types'

	/**
	 * Replaces React's `ReactElement` icon. A snippet that renders the icon element and spreads
	 * `props` (class, aria-label, style, ...) onto its root element, mirroring `cloneElement`.
	 *
	 * @public
	 */
	export type TLUiIconJsx = Snippet<[{ props: Record<string, unknown> }]>

	/** @public */
	export interface TLUiIconProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		icon: TLUiIconType | Exclude<string, TLUiIconType> | TLUiIconJsx
		label: string
		small?: boolean
		tiny?: boolean
		color?: string
		invertIcon?: boolean
		crossOrigin?: 'anonymous' | 'use-credentials'
	}
</script>

<script lang="ts">
	import classNames from 'classnames'
	import type { Attachment } from 'svelte/attachments'
	import { getAssetUrls } from '../../context/asset-urls'

	let {
		label,
		small,
		invertIcon,
		icon,
		tiny,
		color,
		class: className,
		style,
		crossOrigin: _crossOrigin,
		...props
	}: TLUiIconProps = $props()

	const assetUrls = getAssetUrls()

	const asset = $derived(
		typeof icon === 'string'
			? (assetUrls.icons[icon as TLUiIconType] ?? assetUrls.icons['question-mark-circle'])
			: undefined
	)

	const sizeClasses = $derived({ 'tlui-icon__small': small, 'tlui-icon__tiny': tiny })

	const maskStyle = $derived(
		[
			color ? `color: ${color}` : '',
			asset ? `mask: url(${asset}) center 100% / 100% no-repeat` : '',
			invertIcon ? 'transform: scale(-1, 1)' : '',
			typeof style === 'string' ? style : '',
		]
			.filter(Boolean)
			.join('; ')
	)

	// HACK: Fix for <https://linear.app/svelte-draw/issue/TLD-1700/dragging-around-with-the-handtool-makes-lots-of-requests-for-icons>
	// Keep the prefixed mask in sync through an attachment rather than the style attribute.
	const applyMask: Attachment<HTMLDivElement> = (element) => {
		if (!asset) {
			console.error(`Icon not found: ${String(icon)}. Add it to the assetUrls.icons object.`)
		}
		element.style.setProperty('-webkit-mask', `url(${asset}) center 100% / 100% no-repeat`)
	}
</script>

{#if typeof icon === 'string'}
	{#if icon === 'none'}
		<div class={classNames('tlui-icon tlui-icon__placeholder', sizeClasses, className)} {...props}></div>
	{:else}
		<div
			{...props}
			{@attach applyMask}
			aria-label={label}
			role="img"
			class={classNames('tlui-icon', sizeClasses, className)}
			style={maskStyle}
		></div>
	{/if}
{:else}
	{@render icon({
		props: {
			...props,
			class: classNames(sizeClasses, className),
			'aria-label': label,
			style: [
				color ? `color: ${color}` : '',
				invertIcon ? 'transform: scale(-1, 1)' : '',
				typeof style === 'string' ? style : '',
			]
				.filter(Boolean)
				.join('; '),
		},
	})}
{/if}
