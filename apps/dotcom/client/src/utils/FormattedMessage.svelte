<script lang="ts">
	import { getIntl, type IntlMessage, type IntlMessageValues } from './intl'

	/** `<FormattedMessage>`. Renders text only; for markup inside a message use the SDK's `<F>`. */
	let {
		id,
		defaultMessage,
		values,
	}: { id?: string; defaultMessage?: IntlMessage; description?: string; values?: IntlMessageValues } =
		$props()

	const intl = getIntl()
</script>

{intl.current.formatMessage({ id, defaultMessage }, values)}
