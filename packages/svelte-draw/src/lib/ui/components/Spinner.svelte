<script lang="ts" module>
	import { defineMessages } from '@svelte-draw/editor'

	const messages = defineMessages({
		appLoading: { id: 'app.loading', defaultMessage: 'Loading svelte-draw…' },
	})
</script>

<script lang="ts">
	import { DefaultSpinner, type TLSpinnerProps } from '@svelte-draw/svelte'
	import type { SVGAttributes } from 'svelte/elements'
	import { getTranslation } from '../hooks/useTranslation/useTranslation.svelte'

	/** @internal */
	let props: TLSpinnerProps & SVGAttributes<SVGSVGElement> = $props()

	const msg = getTranslation()
</script>

<DefaultSpinner aria-label={msg(messages.appLoading)} {...props} />
