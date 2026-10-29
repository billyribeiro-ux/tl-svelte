/**
 * Format a number to display with up to 5 significant figures, using suffixes for large numbers.
 */
export function formatNumber(value: number): string {
	// Handle special cases
	if (value === 0) return '0'
	if (!isFinite(value)) return value.toString()

	const absValue = Math.abs(value)
	const sign = value < 0 ? '-' : ''

	// For very large numbers, use suffixes
	if (absValue >= 1_000_000_000) {
		return sign + (absValue / 1_000_000_000).toPrecision(3) + 'B'
	}
	if (absValue >= 1_000_000) {
		return sign + (absValue / 1_000_000).toPrecision(3) + 'M'
	}
	if (absValue >= 1_000) {
		return sign + (absValue / 1_000).toPrecision(3) + 'k'
	}

	// For smaller numbers, use up to 5 significant figures
	if (absValue >= 1) {
		// For numbers >= 1, limit to 5 significant figures
		return sign + absValue.toPrecision(5).replace(/\.?0+$/, '')
	} else if (absValue >= 0.001) {
		// For numbers between 0.001 and 1, show up to 5 significant figures
		return sign + absValue.toPrecision(3)
	} else {
		// For very small numbers, use scientific notation
		return value.toExponential(2)
	}
}
