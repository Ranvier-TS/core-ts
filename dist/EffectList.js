"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EffectList = void 0;
/**
 * Self-managing list of effects for a target
 * @property {Set}    effects
 * @property {number} size Number of currently active effects
 * @property {Character} target
 */
class EffectList {
    /**
     * @param {GameEntity} target
     * @param {Array<Object|Effect>} effects array of serialized effects (Object) or actual Effect instances
     */
    constructor(target, effects) {
        this.__effects = effects;
        this.effects = new Set();
        this.target = target;
    }
    /**
     * @type {number}
     */
    get size() {
        this.validateEffects();
        return this.effects.size;
    }
    /**
     * Get current list of effects as an array
     * @return {Array<Effect>}
     */
    entries() {
        this.validateEffects();
        return [...this.effects];
    }
    /**
     * @param {string} type
     * @return {boolean}
     */
    hasEffectType(type) {
        return !!this.getByType(type);
    }
    /**
     * @param {string} type
     * @return {Effect}
     */
    getByType(type) {
        return [...this.effects].find((effect) => {
            return effect.config.type === type;
        });
    }
    /**
     * Proxy an event to all effects
     * @param {string} event
     * @param {...*}   args
     */
    emit(event, ...args) {
        this.validateEffects();
        if (event === 'effectAdded' || event === 'effectRemoved') {
            // don't forward these events on from the player as it would cause confusion between Character#effectAdded
            // and Effect#effectAdded. The former being when any effect gets added to a character, the later is fired on
            // an effect when it is added to a character
            return;
        }
        for (const effect of this.effects) {
            if (!effect) {
                throw new Error('Effect was undefined or null.');
            }
            if (effect.paused) {
                continue;
            }
            if (event === 'updateTick' &&
                typeof effect.config.tickInterval !== 'boolean' &&
                typeof effect.config.tickInterval !== 'undefined') {
                const now = Date.now();
                if (Date.now() <
                    effect.state.ticks * effect.config.tickInterval * 1000) {
                    continue;
                }
                effect.state.lastTick = now;
                effect.state.ticks && effect.state.ticks++;
            }
            effect.emit(event, ...args);
        }
    }
    /**
     * @param {Effect} effect
     * @fires Effect#effectAdded
     * @fires Effect#effectStackAdded
     * @fires Effect#effectRefreshed
     * @fires Character#effectAdded
     */
    add(effect) {
        var _a;
        if (effect.target) {
            throw new Error('Cannot add effect, already has a target.');
        }
        // create deep clone of state before proceeding
        effect.state = JSON.parse(JSON.stringify(effect.state));
        for (const activeEffect of this.effects) {
            if (effect.config.type === activeEffect.config.type) {
                const maxStacks = ((_a = activeEffect === null || activeEffect === void 0 ? void 0 : activeEffect.config) === null || _a === void 0 ? void 0 : _a.maxStacks) || 1;
                const currentStacks = (activeEffect.config.maxStacks && activeEffect.state.stacks) || 0;
                if (currentStacks < maxStacks) {
                    activeEffect.state.stacks = Math.min(maxStacks, activeEffect.state.stacks || 0 + 1);
                    /**
                     * @event Effect#effectStackAdded
                     * @param {Effect} effect The new effect that is trying to be added
                     */
                    activeEffect.emit('effectStackAdded', effect);
                    return true;
                }
                if (activeEffect.config.refreshes) {
                    /**
                     * @event Effect#effectRefreshed
                     * @param {Effect} effect The new effect that is trying to be added
                     */
                    activeEffect.emit('effectRefreshed', effect);
                    return true;
                }
                if (activeEffect.config.unique) {
                    return false;
                }
            }
        }
        this.effects.add(effect);
        effect.target = this.target;
        /**
         * @event Effect#effectAdded
         */
        effect.emit('effectAdded');
        /**
         * @event Character#effectAdded
         */
        this.target.emit('effectAdded', effect);
        effect.on('remove', () => this.remove(effect));
        return true;
    }
    /**
     * Deactivate and remove an effect
     * @param {Effect} effect
     * @throws ReferenceError
     * @fires Character#effectRemoved
     */
    remove(effect) {
        if (!this.effects.has(effect)) {
            throw new ReferenceError('Trying to remove effect that was never added');
        }
        effect.deactivate();
        this.effects.delete(effect);
        /**
         * @event Character#effectRemoved
         */
        this.target.emit('effectRemoved', effect);
    }
    /**
     * Remove all effects, bypassing all deactivate and remove events
     */
    clear() {
        this.effects = new Set();
    }
    /**
     * Ensure effects are still current and if not remove them
     */
    validateEffects() {
        for (const effect of this.effects) {
            if (!effect.isCurrent()) {
                this.remove(effect);
            }
        }
    }
    /**
     * Gets the effective "max" value of an attribute (before subtracting delta).
     * Does the work of actaully applying attribute modification
     * @param {Atrribute} attr
     * @return {number}
     */
    evaluateAttribute(attr) {
        this.validateEffects();
        let attrName = attr.name;
        let attrValue = attr.base || 0;
        for (const effect of this.effects) {
            if (effect.paused) {
                continue;
            }
            attrValue = effect.modifyAttribute(attrName, attrValue);
        }
        return attrValue;
    }
    /**
     * Gets the effective value of property doing all effect modifications.
     * @param {string} propertyName
     * @return {number}
     */
    evaluateProperty(propertyName, propertyValue) {
        this.validateEffects();
        for (const effect of this.effects) {
            if (effect.paused) {
                continue;
            }
            propertyValue = effect.modifyProperty(propertyName, propertyValue);
        }
        return propertyValue;
    }
    /**
     * @param {Damage} damage
     * @param {number} currentAmount
     * @param {?Character} attacker
     * @return {number}
     */
    evaluateIncomingDamage(damage, currentAmount, attacker) {
        this.validateEffects();
        for (const effect of this.effects) {
            currentAmount = effect.modifyIncomingDamage(damage, currentAmount);
        }
        // Don't allow a modifier to make damage go negative, it would cause weird
        // behavior where damage raises an attribute
        return Math.max(currentAmount, 0) || 0;
    }
    /**
     * @param {Damage} damage
     * @param {number} currentAmount
     * @param {Character} target
     * @return {number}
     */
    evaluateOutgoingDamage(damage, currentAmount, target) {
        this.validateEffects();
        for (const effect of this.effects) {
            currentAmount = effect.modifyOutgoingDamage(damage, currentAmount, target);
        }
        // Same thing, mutatis mutandis, for outgoing damage
        return Math.max(currentAmount, 0) || 0;
    }
    serialize() {
        this.validateEffects();
        let serialized = [];
        for (const effect of this.effects) {
            if (!effect.config.persists) {
                continue;
            }
            serialized.push(effect.serialize());
        }
        return serialized;
    }
    hydrate(state) {
        for (const newEffect of this.__effects) {
            const effect = state.EffectFactory.create(newEffect.id);
            effect.hydrate(state, newEffect);
            this.add(effect);
        }
    }
}
exports.EffectList = EffectList;
