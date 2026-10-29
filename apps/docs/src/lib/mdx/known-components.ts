/**
 * The JSX component names MDX content may use. `compileMdx` rejects any other capitalised tag at
 * build time (next-mdx-remote failed at render time with "Expected component `X` to be defined").
 * `components.ts` maps every name here onto a Svelte component, and TypeScript keeps the two in sync.
 */
export const MDX_COMPONENT_NAMES = [
	'Embed',
	'StarterKitEmbed',
	'Image',
	'MaskedArticleImage',
	'ApiHeading',
	'StarterKitBento',
	'Feature',
	'Callout',
	'FocusLines',
	'CodeLinks',
	'ParametersTable',
	'ParametersTableDescription',
	'ParametersTableName',
	'ParametersTableRow',
	'ApiMemberTitle',
	'CheckItem',
	'Video',
	'YouTube',
	'TwoImages',
] as const

export type MdxComponentName = (typeof MDX_COMPONENT_NAMES)[number]
