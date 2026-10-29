<script lang="ts">
	import styles from './admin.module.css'
	import AssetDiagnostics from './AssetDiagnostics.svelte'
	import CreateLegacyFile from './CreateLegacyFile.svelte'
	import DownloadTldrFile from './DownloadTldrFile.svelte'
	import FileStats from './FileStats.svelte'
	import HardDeleteFile from './HardDeleteFile.svelte'
	import ResolveDoId from './ResolveDoId.svelte'
	import UndeleteFileById from './UndeleteFileById.svelte'
	import WelcomeTemplate from './WelcomeTemplate.svelte'
</script>

<section class={styles.adminSection}>
	<h3 class={styles.sectionTitle}>Downloads</h3>
	<div class={styles.fileOperations}>
		<DownloadTldrFile legacy={false} />
		<DownloadTldrFile legacy={true} />
		<CreateLegacyFile />
	</div>
</section>
<section class={styles.adminSection}>
	<h3 class={styles.sectionTitle}>Board stats</h3>
	<FileStats />
</section>
<section class={styles.adminSection}>
	<h3 class={styles.sectionTitle}>Asset diagnostics</h3>
	<AssetDiagnostics />
</section>
<section class={styles.adminSection}>
	<h3 class={styles.sectionTitle}>Undelete file</h3>
	<UndeleteFileById />
</section>
<section class={styles.adminSection}>
	<h3 class={styles.sectionTitle}>Durable object lookup</h3>
	<ResolveDoId />
</section>
<section class={styles.adminSection}>
	<h3 class={styles.sectionTitle}>Welcome template</h3>
	<WelcomeTemplate />
</section>
<section class={styles.adminSection}>
	<h3 class={styles.sectionTitle}>Danger zone</h3>
	<HardDeleteFile />
</section>
