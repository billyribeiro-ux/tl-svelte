import { getAssetUrlsByMetaUrl } from '@svelte-draw/assets/urls'
import { mount } from 'svelte'
import { setDefaultEditorAssetUrls, setDefaultUiAssetUrls } from 'svelte-draw'
import McpApp from './McpApp.svelte'

// Register the bundled icons/fonts/translations before the first editor renders.
const assetUrls = getAssetUrlsByMetaUrl()
setDefaultEditorAssetUrls(assetUrls)
setDefaultUiAssetUrls(assetUrls)

mount(McpApp, { target: document.getElementById('root')! })
