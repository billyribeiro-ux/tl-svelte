<script lang="ts">
	import { DEFAULT_SUPPORTED_MEDIA_TYPE_LIST, FileHelpers, MediaHelpers } from 'svelte-draw'
	import anakin from './assets/anakin.jpeg'
	import distractedBf from './assets/distracted-bf.jpeg'
	import expandingBrain from './assets/expanding-brain.png'

	let {
		onChooseImage,
	}: {
		onChooseImage(image: { src: string; width: number; height: number; type: string }): void
	} = $props()

	let isLoading = $state(false)

	function onClickChooseImage() {
		const input = window.document.createElement('input')
		input.type = 'file'
		input.accept = DEFAULT_SUPPORTED_MEDIA_TYPE_LIST
		input.addEventListener('change', async (e) => {
			const fileList = (e.target as HTMLInputElement).files
			if (!fileList || fileList.length === 0) return
			const file = fileList[0]

			isLoading = true
			try {
				const dataUrl = await FileHelpers.blobToDataUrl(file)
				const { w, h } = await MediaHelpers.getImageSize(file)
				onChooseImage({ src: dataUrl, width: w, height: h, type: file.type })
			} finally {
				isLoading = false
			}
		})
		input.click()
	}

	async function onChooseExample(src: string) {
		isLoading = true
		try {
			const image = await fetch(src)
			const blob = await image.blob()
			const { w, h } = await MediaHelpers.getImageSize(blob)
			onChooseImage({ src, width: w, height: h, type: blob.type })
		} finally {
			isLoading = false
		}
	}
</script>

{#if isLoading}
	<div class="ImagePicker">Loading...</div>
{:else}
	<div class="ImagePicker">
		<button onclick={onClickChooseImage}>Choose an image</button>
		<div class="ImagePicker-exampleLabel">or use an example:</div>
		<div class="ImagePicker-examples">
			<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
			<img src={anakin} alt="anakin" onclick={() => onChooseExample(anakin)} />
			<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
			<img
				src={distractedBf}
				alt="distracted boyfriend"
				onclick={() => onChooseExample(distractedBf)}
			/>
			<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
			<img
				src={expandingBrain}
				alt="expanding brain"
				onclick={() => onChooseExample(expandingBrain)}
			/>
		</div>
	</div>
{/if}
