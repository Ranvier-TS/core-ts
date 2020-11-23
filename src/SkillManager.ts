import { Skill } from './Skill';
import { SkillFlag } from './SkillFlag';

/**
 * Keeps track of registered skills
 */
export class SkillManager {
	skills: Map<string, Skill>;
	constructor() {
		this.skills = new Map();
	}

	/**
	 * @param {string} skill Skill name
	 * @return {Skill|undefined}
	 */
	get(skill: string) {
		return this.skills.get(skill);
	}

	/**
	 * @param {Skill} skill
	 */
	add(skill: Skill) {
		this.skills.set(skill.id, skill);
	}

	/**
	 * @param {Skill} skill
	 */
	remove(skill: Skill) {
		this.skills.delete(skill.id);
	}

	/**
	 * Find executable skills
	 * @param {string}  search
	 * @param {boolean} includePassive
	 * @return {Skill}
	 */
	find(search: string, includePassive: boolean = false) {
		for (const [id, skill] of this.skills) {
			if (!includePassive && skill.flags.includes(SkillFlag.PASSIVE)) {
				continue;
			}

			if (id.indexOf(search) === 0) {
				return skill;
			}
		}
	}
}
