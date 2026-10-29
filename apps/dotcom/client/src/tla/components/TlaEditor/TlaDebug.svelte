<script lang="ts">
	import type { AxeResults } from 'axe-core'
	import { getDialogs, SvelteDrawUiMenuItem } from 'svelte-draw'
	import { withDialogProps } from '../../../utils/withDialogProps'
	import A11yAuditDialog from './A11yAuditDialog.svelte'

	const { addDialog } = getDialogs()

	async function runA11yAudit() {
		const axe = (await import('axe-core')).default
		axe.run(document, {}, (err: Error | null, results: AxeResults) => {
			if (err) throw err

			console.debug('[a11y]:', results)

			addDialog({ component: withDialogProps(A11yAuditDialog, { results }) })
		})
	}
</script>

<SvelteDrawUiMenuItem id="a11y-audit" onSelect={runA11yAudit} label="A11y audit" />
