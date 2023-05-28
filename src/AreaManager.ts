import { Area } from './Area';
import { BehaviorManager } from './BehaviorManager';
import { EntityReference } from './EntityReference';
import { IGameState } from './GameState';
import { Room } from './Room';

/**
 * Stores references to, and handles distribution of, active areas
 * @property {Map<string,Area>} areas
 */
export class AreaManager {
	areas: Map<string, Area>;
	scripts: BehaviorManager;
	private placeholder: null | Area;

	constructor() {
		this.areas = new Map();
		this.scripts = new BehaviorManager();
		this.placeholder = null;
	}

	/**
	 * @param {string} name
	 * @return Area
	 */
	getArea(name: string) {
		const area = this.areas.get(name);
		if (!area) {
			throw new Error(`AreaManager can't find the Area [${name}]`);
		}
		return area;
	}

	/**
	 * @param {string} entityRef
	 * @return Area
	 */
	getAreaByReference(entityRef: EntityReference) {
		const [name] = entityRef.split(':');
		const area = this.getArea(name);
		if (!area) {
			throw new Error(
				`AreaManager did not find Area [${entityRef}] with name [${name}]`
			);
		}
		return area;
	}

	/**
	 * @param {Area} area
	 */
	addArea(area: Area) {
		this.areas.set(area.name, area);
	}

	/**
	 * @param {Area} area
	 */
	removeArea(area: Area) {
		this.areas.delete(area.name);
	}

	/**
	 * Apply `updateTick` to all areas in the game
	 * @param {GameState} state
	 * @fires Area#updateTick
	 */
	tickAll(state: IGameState) {
		for (const [name, area] of this.areas) {
			/**
			 * @see Area#update
			 * @event Area#updateTick
			 */
			area.emit('updateTick', state);
		}
	}

	/**
	 * Get the placeholder area used to house players who were loaded into
	 * an invalid room
	 *
	 * @return {Area}
	 */
	getPlaceholderArea() {
		if (this.placeholder) {
			return this.placeholder;
		}

		this.placeholder = new Area(null, 'placeholder', {
			title: 'Placeholder',
		});

		const placeholderRoom = new Room(this.placeholder, {
			id: 'placeholder',
			title: 'Placeholder',
			description:
				'You are not in a valid room. Please contact an administrator.',
			entityReference: 'placeholder',
		});

		this.placeholder.addRoom(placeholderRoom);

		return this.placeholder;
	}
}
