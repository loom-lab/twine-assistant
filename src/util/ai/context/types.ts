import {OperationType} from "../types";

export interface Example {
    input: string;
    target: string;
}

// each operation should have its own example interface
export interface ContinueExample extends Example {
    input: string;
    target: string;
}

// container mapping operation to example array
export interface ExamplesData {
    [OperationType.CONTINUE_PASSAGE]?: ContinueExample[];
}

// passed in to create context
// just wraps around ExamplesData for now, but can hold additional metadata later
export interface ContextConfig {
    examples?: ExamplesData;

    // TODO: optional metadata
}