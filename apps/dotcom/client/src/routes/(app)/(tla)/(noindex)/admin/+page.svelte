<script lang="ts">
	import Admin from '../../../../../pages/admin/index.svelte'
</script>

<!-- Two explicit routes, not one optional segment: the Vercel rewrite derived from a trailing
     optional param drops the optionality and 404s bare /admin -->
<Admin />
