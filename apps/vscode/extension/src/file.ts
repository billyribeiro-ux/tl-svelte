import { createTLSchema } from '@svelte-draw/editor'
import type { SvelteDrawFile } from 'svelte-draw'
import * as vscode from 'vscode'
import { nicelog } from './utils'

export const defaultFileContents: SvelteDrawFile = {
	svelteDrawFileFormatVersion: 1,
	schema: createTLSchema().serialize(),
	records: [],
}

export const fileContentWithErrors: SvelteDrawFile = {
	svelteDrawFileFormatVersion: 1,
	schema: createTLSchema().serialize(),
	records: [{ typeName: 'shape', id: null } as any],
}

export function loadFile(fileContents: string): SvelteDrawFile {
	if (!fileContents) return defaultFileContents
	try {
		return JSON.parse(fileContents) as SvelteDrawFile
	} catch {
		return fileContentWithErrors
	}
}

export async function fileExists(destination: vscode.Uri) {
	try {
		await vscode.workspace.fs.stat(destination)
		return true
	} catch (e: any) {
		if (e.code !== 'FileNotFound') {
			nicelog(e)
		}
		return false
	}
}
