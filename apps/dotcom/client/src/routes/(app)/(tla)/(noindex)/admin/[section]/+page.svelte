<script lang="ts">
	import { page } from '$app/state'
	import Admin from '../../../../../../pages/admin/index.svelte'
</script>

<Admin section={page.params.section} />
