import { T } from 'svelte-draw'
import { earthquakeIcon } from '../../components/icons/icons.svelte'
import { NODE_HEADER_HEIGHT_PX, NODE_ROW_HEIGHT_PX, NODE_WIDTH_PX } from '../../constants'
import type { ShapePort } from '../../ports/Port'
import { sleep } from '../../utils/sleep'
import type { NodeShape } from '../NodeShapeUtil'
import { type ExecutionResult, type InfoValues, NodeDefinition, STOP_EXECUTION } from './shared'

/**
 * The earthquake node fetches data from USGS earthquake API and outputs magnitude.
 */
export type EarthquakeNode = T.TypeOf<typeof EarthquakeNode>
export const EarthquakeNode = T.object({
	type: T.literal('earthquake'),
	earthquakeData: T.nullable(
		T.object({
			magnitude: T.number,
			location: T.string,
			datetime: T.string,
			id: T.string, // Add unique ID to avoid duplicate selections
		})
	),
})

interface EarthquakeFeature {
	properties: {
		mag: number
		place: string
		time: number
	}
	id: string
}

interface EarthquakeApiResponse {
	features: EarthquakeFeature[]
}

export class EarthquakeNodeDefinition extends NodeDefinition<EarthquakeNode> {
	static type = 'earthquake'
	static validator = EarthquakeNode
	title = 'Earthquake data'
	heading = 'USGS Data'
	icon = earthquakeIcon

	getDefault(): EarthquakeNode {
		return {
			type: 'earthquake',
			earthquakeData: null,
		}
	}

	getBodyHeightPx(_shape: NodeShape, _node: EarthquakeNode) {
		return NODE_ROW_HEIGHT_PX * 3 // Three rows for magnitude, location, datetime
	}

	getPorts(_shape: NodeShape, _node: EarthquakeNode): Record<string, ShapePort> {
		return {
			output: {
				id: 'output',
				x: NODE_WIDTH_PX,
				y: NODE_HEADER_HEIGHT_PX / 2,
				terminal: 'start',
			},
		}
	}

	async execute(shape: NodeShape, node: EarthquakeNode): Promise<ExecutionResult> {
		try {
			// Simulate loading delay
			await sleep(500)

			const response = await fetch(
				'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson'
			)

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`)
			}

			const data: EarthquakeApiResponse = await response.json()

			if (data.features.length === 0) {
				// Update node with no data state
				this.editor.updateShape({
					id: shape.id,
					type: shape.type,
					props: {
						node: {
							...node,
							earthquakeData: null,
						},
						isOutOfDate: false,
					},
				})
				return { output: STOP_EXECUTION }
			}

			// Pick a random earthquake
			const randomIndex = Math.floor(Math.random() * data.features.length)
			const earthquake = data.features[randomIndex]
			console.log(data.features)

			const earthquakeData = {
				magnitude: earthquake.properties.mag,
				location: earthquake.properties.place,
				datetime: new Date(earthquake.properties.time).toLocaleString(),
				id: earthquake.id,
			}

			// Update node with fetched data
			this.editor.updateShape({
				id: shape.id,
				type: shape.type,
				props: {
					node: {
						...node,
						earthquakeData,
					},
					isOutOfDate: false,
				},
			})

			return {
				output: earthquakeData.magnitude,
			}
		} catch (error) {
			console.error('Failed to fetch earthquake data:', error)

			// Update node with error state
			this.editor.updateShape({
				id: shape.id,
				type: shape.type,
				props: {
					node: {
						...node,
						earthquakeData: null,
					},
					isOutOfDate: false,
				},
			})

			return { output: STOP_EXECUTION }
		}
	}

	getOutputInfo(shape: NodeShape, node: EarthquakeNode): InfoValues {
		if (shape.props.isOutOfDate) {
			return {
				output: {
					value: STOP_EXECUTION,
					isOutOfDate: true,
				},
			}
		}

		return {
			output: {
				value: node.earthquakeData?.magnitude ?? STOP_EXECUTION,
				isOutOfDate: shape.props.isOutOfDate,
			},
		}
	}
}
