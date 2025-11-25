/**
 * types for AI abstraction layer
 */

export enum OperationType {
    CONTINUE_PASSAGE = 'continuePassage',
    // add more
}

// using gemini for now because of free tier
export type ProviderType = 'openai' | 'anthropic' | 'gemini';

export interface ProviderConfig {
    type: ProviderType;
    apiKey: string;
    model?: string;
    baseURL?: string;
}

export interface ModelResult {
    text: string;
    index?: number;
    metadata?: Record<string, any>;
}

// array of results for alternate generations
export type ModelResults = ModelResult[];

export interface PromptParameters {
    // base parameters
    temperature?: number;
    maxTokens?: number;
}

// specific to continue operation
export interface ContinuePassageParameters extends PromptParameters {
    text: string;
    storyContext?: string; // TODO: how to handle story context on passage-level tasks?
}

// custom error class for provider-side issues
export class AIError extends Error {
    constructor (
        message: string,
        public provider: ProviderType,
        public statusCode?: number,
        public originalError?: Error
    ) {
        super(message);
        this.name = 'AIError';
        Object.setPrototypeOf(this, AIError.prototype);
    }
}