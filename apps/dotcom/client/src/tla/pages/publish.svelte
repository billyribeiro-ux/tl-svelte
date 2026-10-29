<script lang="ts">
	import type { SerializedSchema, TLRecord } from 'svelte-draw'
	import IFrameProtector, { ROOM_CONTEXT } from '../../components/IFrameProtector.svelte'
	import TlaPublishEditor from '../components/TlaEditor/TlaPublishEditor.svelte'

	let {
		data,
	}: { data: { roomId: string; schema: SerializedSchema; records: TLRecord[] } } = $props()
</script>

<IFrameProtector slug={data.roomId} context={ROOM_CONTEXT.PUBLIC_SNAPSHOT}>
	<TlaPublishEditor records={data.records} schema={data.schema} />
</IFrameProtector>
