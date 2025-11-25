import {OperationType} from "../types";
import {Example, ExamplesData, ContextConfig} from "./types";

export class AIContext {
    private examples: ExamplesData;
    // TODO: optional metadata

    constructor(config: ContextConfig = {}) {
        this.examples = config.examples || {};
    }

    // accessed by prompt handlers
    // get example data for a given operation type
    getExampleData<T extends Example> (operationType: OperationType): T[] {
        const examples = this.examples[operationType];
        if (!examples) {
            return [];
        }
        return examples as T[];
    }

    // TODO: getter/setters, utility methods
}