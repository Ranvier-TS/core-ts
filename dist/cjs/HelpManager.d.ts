import { Helpfile } from './Helpfile';
/**
 * Contain/look up helpfiles
 */
export declare class HelpManager {
    helps: Map<string, Helpfile>;
    constructor();
    /**
     * @param {string} help Helpfile name
     */
    get(help: string): Helpfile | undefined;
    /**
     * @param {Helpfile} help
     */
    add(help: Helpfile): void;
    /**
     * @param {string} search
     * @return {Help}
     */
    find(search: string): Map<any, any>;
    /**
     * @param {string} search
     * @return {Help}
     */
    findExact(search: string): Map<any, any>;
    /**
     * Returns first help matching keywords
     * @param {string} search
     * @param {boolean} exact
     * @return {?string}
     */
    getFirst(help: string): any;
}
