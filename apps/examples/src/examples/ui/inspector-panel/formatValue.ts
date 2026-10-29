export function formatValue(val: unknown): string {
	if (val === null || val === undefined) return String(val)
	if (typeof val === 'string') return `"${val}"`
	if (Array.isArray(val)) return `Array(${val.length})`
	if (typeof val === 'object') return `Object(${Object.keys(val).length} keys)`
	return String(val)
}
