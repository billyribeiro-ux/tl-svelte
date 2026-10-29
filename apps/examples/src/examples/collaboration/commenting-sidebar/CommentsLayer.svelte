<script lang="ts">
	import { CanvasComments, CanvasCommentsSidebar } from '@svelte-draw/commenting'
	import { commenting } from './commenting'
</script>

<CanvasComments {...commenting} />
<CanvasCommentsSidebar {...commenting} />
