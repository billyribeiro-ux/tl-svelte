<script lang="ts">
	import {
		F,
		SvelteDrawUiDialogBody,
		SvelteDrawUiDialogCloseButton,
		SvelteDrawUiDialogFooter,
		SvelteDrawUiDialogHeader,
		SvelteDrawUiDialogTitle,
	} from 'svelte-draw'
	import DiscordLink from './DiscordLink.svelte'
	import styles from './dialogs.module.css'
	import GithubIssuesLink from './GithubIssuesLink.svelte'
</script>

<div class={styles.dialogContainer}>
	<SvelteDrawUiDialogHeader>
		<SvelteDrawUiDialogTitle>
			<F defaultMessage="Send feedback" />
		</SvelteDrawUiDialogTitle>
		<SvelteDrawUiDialogCloseButton />
	</SvelteDrawUiDialogHeader>
	<SvelteDrawUiDialogBody class={styles.dialogBody}>
		<p>
			<F defaultMessage="Have a bug, issue, or idea for svelte-draw? Let us know!" />
		</p>
		<ul>
			<li>
				<DiscordLink>
					<F defaultMessage="Chat with us on Discord" />
				</DiscordLink>
			</li>
			<li>
				<GithubIssuesLink>
					<F defaultMessage="Submit an issue on GitHub" />
				</GithubIssuesLink>
			</li>
		</ul>
	</SvelteDrawUiDialogBody>
	<SvelteDrawUiDialogFooter />
</div>
