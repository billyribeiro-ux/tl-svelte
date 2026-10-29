import type { TLEmbedShapePermissions } from '../../defaultEmbedDefinitions'

export function getSandboxPermissions(permissions: TLEmbedShapePermissions) {
	return Object.entries(permissions)
		.filter(([_perm, isEnabled]) => isEnabled)
		.map(([perm]) => perm)
		.join(' ')
}

/**
 * The srcdoc of a gist embed. `id` must already be validated as hexadecimal (see EmbedGist.svelte).
 * Kept in a .ts file because the markup contains a closing script tag, which cannot appear inside a
 * Svelte component's script block.
 */
export function getGistSrcDoc(id: string) {
	return `
			<html>
				<head>
					<base target="_blank">
				</head>
				<body>
					<script src=${`https://gist.github.com/${id}.js`}></script>
					<style type="text/css">
						* { margin: 0px; }
						table { height: 100%; background-color: red; }
						.gist { background-color: none; height: 100%;  }
						.gist .gist-file { height: calc(100vh - 2px); padding: 0px; display: grid; grid-template-rows: 1fr auto; }
					</style>
				</body>
			</html>`
}
