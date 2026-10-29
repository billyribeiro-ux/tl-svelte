import type { TLPersistentClientSocket, TLSocketStatusChangeEvent } from '@svelte-draw/sync'
import type { Socket } from 'socket.io-client'
import type { TLRecord } from 'svelte-draw'

// Helper function to convert Socket.IO to TLPersistentClientSocket
export function socketIoToSvelteDrawSocket(ioSocket: Socket): TLPersistentClientSocket<TLRecord> {
	const statusChangeListeners = new Set<(event: TLSocketStatusChangeEvent) => void>()
	const svelteDrawSocket: TLPersistentClientSocket<TLRecord> = {
		connectionStatus: 'offline',

		sendMessage: (message) => {
			console.log('📤 Sending:', message)
			ioSocket.emit('svelte-draw-message', JSON.stringify(message))
		},

		onReceiveMessage: (callback) => {
			// Listen for svelte-draw sync protocol messages
			const handler = (message: any) => {
				console.log('📥 Received:', message)
				callback(message)
			}
			ioSocket.on('svelte-draw-message', handler)

			// Return cleanup function
			return () => {
				ioSocket.off('svelte-draw-message', handler)
			}
		},

		onStatusChange: (callback) => {
			statusChangeListeners.add(callback)
			return () => {
				statusChangeListeners.delete(callback)
			}
		},

		restart: () => {
			console.log('🔄 Restarting Socket.IO connection...')
			ioSocket.disconnect()
			ioSocket.connect()
		},

		close: () => {
			ioSocket.off('connect', connectHandler)
			ioSocket.off('disconnect', disconnectHandler)
			ioSocket.off('connect_error', errorHandler)
			clearTimeout(initialStatusTimeout)
			ioSocket.disconnect()
		},
	}

	// Map Socket.IO events to TLPersistentClientSocket status
	const setStatus = (event: TLSocketStatusChangeEvent) => {
		svelteDrawSocket.connectionStatus = event.status
		statusChangeListeners.forEach((cb) => cb(event))
	}

	const connectHandler = () => setStatus({ status: 'online' })
	const disconnectHandler = () => setStatus({ status: 'offline' })
	const errorHandler = (error: any) =>
		setStatus({ status: 'error', reason: error.message || 'Connection error' })

	ioSocket.on('connect', connectHandler)
	ioSocket.on('disconnect', disconnectHandler)
	ioSocket.on('connect_error', errorHandler)

	// Set initial status
	const initialStatusTimeout = setTimeout(() => {
		if (ioSocket.connected) connectHandler()
	}, 0)

	return svelteDrawSocket
}
