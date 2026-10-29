import type { Component } from 'svelte'
import SvelteDrawLink from '#lib/components/common/SvelteDrawLink.svelte'
import type { MdxComponentName } from '#lib/mdx/known-components.js'
import ApiHeading from './ApiHeading.svelte'
import ApiMemberTitle from './ApiMemberTitle.svelte'
import Blockquote from './Blockquote.svelte'
import Callout from './Callout.svelte'
import CheckItem from './CheckItem.svelte'
import Code from './Code.svelte'
import CodeLinks from './CodeLinks.svelte'
import Embed from './Embed.svelte'
import Feature from './Feature.svelte'
import FocusLines from './FocusLines.svelte'
import Image from './Image.svelte'
import MaskedArticleImage from './MaskedArticleImage.svelte'
import ParametersTable from './ParametersTable.svelte'
import ParametersTableDescription from './ParametersTableDescription.svelte'
import ParametersTableName from './ParametersTableName.svelte'
import ParametersTableRow from './ParametersTableRow.svelte'
import Pre from './Pre.svelte'
import SideBySideImages from './SideBySideImages.svelte'
import StarterKitBento from './StarterKitBento.svelte'
import StarterKitEmbed from './StarterKitEmbed.svelte'
import Video from './Video.svelte'
import YouTube from './YouTube.svelte'

/** JSX components usable in MDX; the names are checked at compile time against `MDX_COMPONENT_NAMES`. */
export const mdxComponents = {
	Embed,
	StarterKitEmbed,
	// Markdown images and `<Image />` both resolve `/…` static URLs via `assetUrl` in Image.svelte.
	Image,
	MaskedArticleImage,
	ApiHeading,
	StarterKitBento,
	Feature,
	Callout,
	FocusLines,
	CodeLinks,
	ParametersTable,
	ParametersTableDescription,
	ParametersTableName,
	ParametersTableRow,
	ApiMemberTitle,
	CheckItem,
	Video,
	YouTube,
	TwoImages: SideBySideImages,
} satisfies Record<MdxComponentName, Component<any>>

/** Plain HTML elements that are replaced by components (the `components` overrides of the MDX provider). */
export const htmlOverrides = {
	a: SvelteDrawLink,
	pre: Pre,
	code: Code,
	img: Image,
	blockquote: Blockquote,
} satisfies Record<string, Component<any>>
