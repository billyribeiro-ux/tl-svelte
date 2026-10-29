<script lang="ts" module>
	// The shapes of an axe-core result; the table only reads these fields.
	export interface A11yIssueNode {
		target: unknown
	}
	export interface A11yIssue {
		impact?: string | null
		help?: string
		description?: string
		helpUrl?: string
		nodes: A11yIssueNode[]
	}
	export interface A11yResults {
		violations: A11yIssue[]
		incomplete: A11yIssue[]
	}
</script>

<script lang="ts">
	let { results }: { results: A11yResults } = $props()

	const violations = $derived(results.violations)
	const incomplete = $derived(results.incomplete)
	const allIssues = $derived([
		...violations.map((v) => ({ ...v, type: 'violation' as const })),
		...incomplete.map((i) => ({ ...i, type: 'incomplete' as const })),
	])
</script>

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
					<td colspan="5">No accessibility issues found</td>
				</tr>
			{/if}
			{#each allIssues as issue, index (index)}
				<tr style:background-color={issue.type === 'violation' ? '#fff0f0' : '#fffde7'}>
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
							<a href={issue.helpUrl} target="_blank" rel="noopener noreferrer">More info</a>
						{/if}
					</td>
				</tr>
			{/each}
		</tbody>
		<tfoot>
			<tr>
				<td colspan="5">
					Total issues: {allIssues.length} (Violations: {violations.length}, Incomplete: {incomplete.length})
				</td>
			</tr>
		</tfoot>
	</table>
</div>
