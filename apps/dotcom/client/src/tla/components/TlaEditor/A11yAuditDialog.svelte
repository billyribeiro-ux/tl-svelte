<script lang="ts">
	import type { AxeResults } from 'axe-core'
	import { ExampleDialog } from 'svelte-draw'
	import ExternalLink from '../ExternalLink/ExternalLink.svelte'

	let { results, onClose }: { results: AxeResults; onClose(): void } = $props()

	const allIssues = $derived([
		...results.violations.map((v) => ({ ...v, type: 'violation' as const })),
		...results.incomplete.map((i) => ({ ...i, type: 'incomplete' as const })),
	])
</script>

{#snippet body()}
	<div style="overflow: auto">
		<table class="tlui-a11y-audit">
			<thead>
				<tr>
					<th>Type</th>
					<th>Impact</th>
					<th>Description</th>
					<th>Elements</th>
					<th>Help</th>
				</tr>
			</thead>
			<tbody>
				{#if !allIssues.length}
					<tr>
						<td colspan={5}>No accessibility issues found</td>
					</tr>
				{/if}
				{#each allIssues as issue, index (index)}
					<tr style={`background-color: ${issue.type === 'violation' ? '#fff0f0' : '#fffde7'}`}>
						<td>{issue.type === 'violation' ? '⚠️ Violation' : '⚙️ Incomplete'}</td>
						<td>{issue.impact || 'unknown'}</td>
						<td>{issue.help || issue.description}</td>
						<td>
							{#each issue.nodes as node, nodeIndex (nodeIndex)}
								<div>{node.target}</div>
							{/each}
						</td>
						<td>
							{#if issue.helpUrl}
								<ExternalLink href={issue.helpUrl}>More info</ExternalLink>
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
			<tfoot>
				<tr>
					<td colspan={5}>
						Total issues: {allIssues.length} (Violations: {results.violations.length}, Incomplete:
						{results.incomplete.length})
					</td>
				</tr>
			</tfoot>
		</table>
	</div>
{/snippet}

<ExampleDialog
	{body}
	title="Accessibility Audit Results"
	maxWidth="80vw"
	cancel="Close"
	confirm="Ok"
	onCancel={() => onClose()}
	onContinue={() => onClose()}
/>
