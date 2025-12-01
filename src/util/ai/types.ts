/**
 * types for AI abstraction layer
 */

// messages
export type MessageRole = 'user' | 'assistant' | 'system';
export interface Message {
    role: MessageRole;
    content: string;
}

// provider config
export type ProviderType = 'openai' | 'anthropic' | 'gemini';
export interface ProviderConfig {
    type: ProviderType;
    apiKey: string;
    model?: string;
    baseURL?: string;
}

// request options
export interface CompletionOptions {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    stop?: string[]; // stop sequences
    n?: number; // # of completions
    stream?: boolean;
}

export type FinishReason = 'stop' | 'length' | 'content_filter' | 'error' | 'unknown';

// non-streaming response
export interface Completion {
    content: string;
    finishReason: FinishReason;
}
export interface CompletionResponse {
    completions: Completion[]; // n completion choices
    model: string;
}

// streaming response
export interface CompletionChunk {
    content: string;
    completionIndex: number;
    done: boolean;
    finishReason?: FinishReason;
}

export class ProviderError extends Error {
    constructor(
        message: string,
        public provider: ProviderType,
        public statusCode?: number,
        public originalError?: unknown
    ) {
        super(message);
        this.name = 'ProviderError';
    }
}