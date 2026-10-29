<script lang="ts" module>
	import { defineMessages } from 'svelte-draw'

	const messages = defineMessages({
		commentsMentionYou: { id: 'comments.mention-you', defaultMessage: 'You' },
		commentsReacted: {
			id: 'comments.reacted',
			defaultMessage:
				'{count, plural, =1 {{a} reacted} =2 {{a} and {b} reacted} =3 {{a}, {b} and {c} reacted} other {{a}, {b}, {c} and {others, plural, one {# other} other {# others}} reacted}}',
		},
	})
</script>

<script lang="ts">
	import { getTranslation } from 'svelte-draw'
	import type { ReactionReactor } from './reactions'

	/**
	 * The default reactor sentence naming who reacted — up to three names spelled out, then "and N
	 * others" (e.g. "You reacted", "You and Bo reacted", "You, Bo and Ada reacted", "You, Bo, Ada and 2
	 * others reacted"). The wording lives in the `comments.reacted` translation string, whose ICU
	 * plural picks the phrasing, so each locale controls both the grammar and how it counts. Exported
	 * so a custom `ReactionTooltip` can reuse it inside its own box.
	 * @public
	 */
	let { reactors }: { reactors: ReactionReactor[] } = $props()

	const msg = getTranslation()
	const names = $derived(
		reactors.map((reactor) => (reactor.you ? msg(messages.commentsMentionYou) : reactor.name))
	)
	const sentence = $derived.by(() => {
		if (names.length === 0) return null
		const [a, b, c] = names
		return msg(messages.commentsReacted, {
			count: names.length,
			others: names.length - 3,
			a,
			b,
			c,
		})
	})
</script>

{#if sentence !== null}{sentence}{/if}
