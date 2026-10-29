<script lang="ts">
	import { getIntl } from './intl'

	/**
	 * `<FormattedRelativeTime>` from react-intl, including `updateIntervalInSeconds`: the value is
	 * given in `unit` and, when an interval is passed, re-expressed in the best unit and refreshed on
	 * a timer that fires when the displayed value would next change. Only second/minute/hour units
	 * can tick (react-intl: "Cannot schedule update with unit longer than hour").
	 */
	let {
		value = 0,
		unit = 'second',
		updateIntervalInSeconds,
		numeric,
		style,
	}: {
		value?: number
		unit?: Intl.RelativeTimeFormatUnit
		updateIntervalInSeconds?: number
		numeric?: Intl.RelativeTimeFormatNumeric
		style?: Intl.RelativeTimeFormatStyle
	} = $props()

	const MINUTE = 60
	const HOUR = 3600
	const DAY = 86400

	function selectUnit(seconds: number): 'second' | 'minute' | 'hour' | 'day' {
		const abs = Math.abs(seconds)
		if (abs < MINUTE) return 'second'
		if (abs < HOUR) return 'minute'
		if (abs < DAY) return 'hour'
		return 'day'
	}

	function getDurationInSeconds(u: string) {
		switch (u) {
			case 'second':
				return 1
			case 'minute':
				return MINUTE
			case 'hour':
				return HOUR
			default:
				return DAY
		}
	}

	function valueToSeconds(v: number, u: string) {
		if (!v) return 0
		switch (u) {
			case 'second':
				return v
			case 'minute':
				return v * MINUTE
			default:
				return v * HOUR
		}
	}

	const canIncrement = $derived(unit === 'second' || unit === 'minute' || unit === 'hour')

	if (updateIntervalInSeconds && !(unit === 'second' || unit === 'minute' || unit === 'hour')) {
		throw new Error('Cannot schedule update with unit longer than hour')
	}

	// The value in seconds the timer has advanced to. Reset whenever the inputs change.
	let currentValueInSeconds = $state(0)
	$effect.pre(() => {
		currentValueInSeconds = canIncrement ? valueToSeconds(value, unit) : 0
	})

	$effect(() => {
		if (!updateIntervalInSeconds || !canIncrement) return
		const current = currentValueInSeconds
		const nextValueInSeconds = current - updateIntervalInSeconds
		const nextUnit = selectUnit(nextValueInSeconds)
		if (nextUnit === 'day') return
		const unitDuration = getDurationInSeconds(nextUnit)
		const prevInteresting = nextValueInSeconds - (nextValueInSeconds % unitDuration)
		const nextInteresting =
			prevInteresting >= current ? prevInteresting - unitDuration : prevInteresting
		const delayInSeconds = Math.abs(nextInteresting - current)
		if (current === nextInteresting) return
		const timer = setTimeout(() => {
			currentValueInSeconds = nextInteresting
		}, delayInSeconds * 1000)
		return () => clearTimeout(timer)
	})

	const display = $derived.by(() => {
		let v = value || 0
		let u = unit
		if (canIncrement && updateIntervalInSeconds) {
			u = selectUnit(currentValueInSeconds)
			v = Math.round(currentValueInSeconds / getDurationInSeconds(u))
		}
		return { v, u }
	})

	const intl = getIntl()
</script>

{intl.current.formatRelativeTime(display.v, display.u, { numeric, style })}
