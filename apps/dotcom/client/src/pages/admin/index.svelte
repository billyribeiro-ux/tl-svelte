<script lang="ts">
	import { getSvelteDrawCurrentUser } from '../../tla/hooks/useUser.svelte'
	import { location, navigate } from '../../utils/router.svelte'
	import styles from './admin.module.css'
	import EffectsSection from './EffectsSection.svelte'
	import FilesSection from './FilesSection.svelte'
	import FlagsSection from './FlagsSection.svelte'
	import SystemSection from './SystemSection.svelte'
	import UsersSection from './UsersSection.svelte'

	const SECTIONS = [
		{ id: 'users', label: 'Users' },
		{ id: 'files', label: 'Files & templates' },
		{ id: 'flags', label: 'Feature flags' },
		{ id: 'effects', label: 'Effect outbox' },
		{ id: 'system', label: 'System' },
	] as const

	let { section }: { section?: string } = $props()

	const user = getSvelteDrawCurrentUser()

	const redirectTo = $derived(
		!user.current?.isSvelteDraw
			? '/'
			: !section || !SECTIONS.some((s) => s.id === section)
				? '/admin/users'
				: null
	)

	// `<Navigate replace>`: redirect from an effect once the render decided on it.
	$effect(() => {
		if (redirectTo) navigate(redirectTo, { replace: true })
	})

	// NavLink's isActive: the pathname matches the link's, ignoring case and trailing slashes.
	function isActive(id: string) {
		return location.pathname.replace(/\/+$/, '').toLowerCase() === `/admin/${id}`
	}
</script>

{#if !redirectTo}
	<div class={styles.adminLayout}>
		<nav class={styles.adminSidebar}>
			<div class={styles.adminSidebarTitle}>Admin</div>
			{#each SECTIONS as s (s.id)}
				<a
					href={`/admin/${s.id}`}
					class={isActive(s.id)
						? `${styles.adminSidebarItem} ${styles.adminSidebarItemActive}`
						: styles.adminSidebarItem}
					aria-current={isActive(s.id) ? 'page' : undefined}
				>
					<span>{s.label}</span>
				</a>
			{/each}
		</nav>
		<main class={styles.adminMain}>
			{#if section === 'users'}<UsersSection />{/if}
			{#if section === 'flags'}<FlagsSection />{/if}
			{#if section === 'files'}<FilesSection />{/if}
			{#if section === 'effects'}<EffectsSection />{/if}
			{#if section === 'system'}<SystemSection />{/if}
		</main>
	</div>
{/if}
