<script lang="ts">
	import { SvelteDraw } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import './timeline-scrubber.css'
	import TimelineScrubber from './TimelineScrubber.svelte'
</script>

<div class="timeline-scrubber-example">
	<SvelteDraw>
		<TimelineScrubber />
	</SvelteDraw>
</div>
