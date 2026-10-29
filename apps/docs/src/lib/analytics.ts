/** Thin wrapper over the `window.tlanalytics` global that the analytics script installs. */
export function track(name: string, data?: { [key: string]: any }) {
	window.tlanalytics?.track(name, data)
}
