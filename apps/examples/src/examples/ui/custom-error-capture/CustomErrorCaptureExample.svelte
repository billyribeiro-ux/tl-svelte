<script lang="ts">
	import { SvelteDraw, type TLEditorComponents } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import CustomErrorFallback from './CustomErrorFallback.svelte'
	import ThrowErrorButton from './ThrowErrorButton.svelte'
	import './custom-error-capture.css'

	// There's a guide at the bottom of this file!

	// [1]
	const components: TLEditorComponents = {
		// [2]
		ErrorFallback: CustomErrorFallback,
		// [5]
		InFrontOfTheCanvas: ThrowErrorButton,
	}
</script>

<div class="svelte-draw__editor">
	<!-- [7] -->
	<SvelteDraw {components} />
</div>

<!--
[1]
Define your component overrides outside of the component instance so that they're static.

[2] (CustomErrorFallback.svelte)
`ErrorFallback` is displayed when a critical error occurs in the editor that would otherwise crash
the entire application. This is different from `ShapeErrorFallback`, which handles errors in
individual shapes. The component receives the error, so you can match it to your app's design and
offer recovery options.

[3]
`getErrorAnnotations` retrieves the debugging information svelte-draw attaches to errors: tags
(key-value pairs for categorization) and extras (additional context data such as the current tool
or the selected shapes). This is what you'd forward to an error reporting service like Sentry.

[4]
Here we show the annotations on screen so you can see what's captured. In production you'd send
them to your error tracking service instead of displaying them to users.

[5] (ThrowErrorButton.svelte)
For this example, we've added a button in the `InFrontOfTheCanvas` slot that intentionally
triggers an error so you can see the custom `ErrorFallback` in action. In a real application the
fallback only appears when genuine errors occur.

[6]
Creating a shape with an unknown type throws inside the editor, which is enough to trip the error
boundary. The `@ts-expect-error` is there because TypeScript rightly rejects the bad type.

[7]
Pass the components to the `SvelteDraw` component via the `components` prop.
-->
