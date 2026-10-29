<script lang="ts">
	import { ROOM_OPEN_MODE } from '@svelte-draw/dotcom-shared'
	import LegacyRoomPage from '../../../../../../tla/pages/legacy-room.svelte'
	import { getPageError } from '../../../../../../utils/pageError.svelte'

	const error = getPageError()
</script>

<LegacyRoomPage roomOpenMode={ROOM_OPEN_MODE.READ_ONLY_LEGACY} error={error.current} />
