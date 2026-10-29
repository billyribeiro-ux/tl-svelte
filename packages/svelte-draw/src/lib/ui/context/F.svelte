<script lang="ts">
	import { formatUiMessageToParts, type UiMessageCatalog } from '../hooks/useTranslation/intl'
	import { getCurrentTranslation } from '../hooks/useTranslation/useTranslation.svelte'
	import type { TLUiMessageProps } from './i18n'

	/**
	 * Renders a translated message. Use this wherever the message is text in the document; where a
	 * string is needed instead, translate the message's id through `getTranslation`.
	 *
	 * The `id` is optional, so a message whose id a bundler plugin injects can be rendered from
	 * source that carries none. The output is wrapped in a `<span class="i18n-msg">`, which lets a
	 * tool tell text that came through here from text that never did.
	 */
	let { values, elements, tags, ...descriptor }: TLUiMessageProps = $props()

	const translation = getCurrentTranslation()

	type Marker = { kind: 'tag'; name: string; text: string } | { kind: 'element'; name: string }

	// Without a plugin to inject one, the formatter would throw on a missing id. Same default as
	// `defineMessages`, so the id an untransformed `<F>` looks up is the one it was declared under.
	const parts = $derived.by(() => {
		const id = descriptor.id ?? descriptor.defaultMessage
		const formatterValues: Record<string, unknown> = { ...values }
		for (const name of Object.keys(elements ?? {})) {
			formatterValues[name] = { kind: 'element', name } satisfies Marker
		}
		for (const name of Object.keys(tags ?? {})) {
			formatterValues[name] = (chunks: unknown[]): Marker => ({
				kind: 'tag',
				name,
				text: chunks.filter((chunk) => typeof chunk === 'string').join(''),
			})
		}
		return formatUiMessageToParts(
			translation.locale,
			translation.current.messages as UiMessageCatalog,
			{ id, defaultMessage: descriptor.defaultMessage },
			formatterValues
		)
	})
</script>

<!-- Inline, so the marker span doesn't disturb the layout around it. Why it's here at all is in
     the comment on the props above. -->
<span class="i18n-msg"
	>{#each parts as part, i (i)}{#if typeof part === 'string'}{part}{:else if (part as Marker).kind === 'tag'}{@const m = part as Extract<Marker, { kind: 'tag' }>}{@render tags![m.name](
					m.text
				)}{:else}{@const m = part as Extract<Marker, { kind: 'element' }>}{@render elements![m.name]()}{/if}{/each}</span
>
