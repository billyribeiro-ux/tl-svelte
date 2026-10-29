/**
 * A React-style inline style object: camelCase or kebab-case/custom-property keys, with numbers
 * for lengths.
 *
 * @public
 */
export type CssStyleObject = Record<string, string | number | null | undefined | false>

// The properties React leaves unitless when given a number (a subset: the ones svelte-draw uses
// plus the rest of the common ones).
const UNITLESS_PROPERTIES = new Set([
	'animation-iteration-count',
	'aspect-ratio',
	'border-image-outset',
	'border-image-slice',
	'border-image-width',
	'column-count',
	'columns',
	'flex',
	'flex-grow',
	'flex-negative',
	'flex-order',
	'flex-positive',
	'flex-shrink',
	'font-weight',
	'grid-area',
	'grid-column',
	'grid-column-end',
	'grid-column-span',
	'grid-column-start',
	'grid-row',
	'grid-row-end',
	'grid-row-span',
	'grid-row-start',
	'line-clamp',
	'line-height',
	'opacity',
	'order',
	'orphans',
	'scale',
	'tab-size',
	'widows',
	'z-index',
	'zoom',
])

function toKebabCase(name: string) {
	if (name.startsWith('--')) return name
	// vendor prefixes: WebkitMask -> -webkit-mask, msTransform -> -ms-transform
	return name
		.replace(/^(webkit|moz|ms|o)(?=[A-Z])/, '-$1')
		.replace(/^(Webkit|Moz|Ms|O)(?=[A-Z])/, (m) => `-${m.toLowerCase()}`)
		.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)
}

/**
 * Serializes a React-style style object to a CSS declaration string for Svelte's `style=`
 * attribute, with React's rules: `undefined`/`null`/`false`/`''` values are skipped and numbers
 * get a `px` unit unless the property is unitless (or the value is 0). A string passes through
 * unchanged.
 *
 * @public
 */
export function styleToString(style: CssStyleObject | string | null | undefined): string {
	if (!style) return ''
	if (typeof style === 'string') return style
	let out = ''
	for (const [key, value] of Object.entries(style)) {
		if (value === undefined || value === null || value === false || value === '') continue
		const name = toKebabCase(key)
		const text =
			typeof value === 'number' && value !== 0 && !name.startsWith('--') && !UNITLESS_PROPERTIES.has(name)
				? `${value}px`
				: String(value)
		out += `${name}: ${text}; `
	}
	return out.trim()
}
