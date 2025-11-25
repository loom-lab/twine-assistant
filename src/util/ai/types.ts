/**
 * types for AI abstraction layer
 */

export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
    role: MessageRole;
    content: string;
}

export type ProviderType = 'openai' | 'anthropic';

export interface ProviderConfig {
    type: ProviderType;
    apiKey: string;
    model?: string;
    baseURL?: string;
}

export interface CompletionOptions {
    maxTokens?: number;
    temperature?: number;
    stop?: string[]; // stop sequences
    stream?: boolean;
}

// relevant only to non-streaming completions
export interface CompletionResponse {
    content: string;
    model: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    }
    finishReason?: 'stop' | 'length' | 'content_filter' | 'tool_use' | string;
}

// TODO: streaming response

// custom error class for provider-side issues
export class AIProviderError extends Error {
    constructor (
        message: string,
        public provider: ProviderType,
        public statusCode?: number,
        public originalError?: Error
    ) {
        super(message);
        this.name = 'AIProviderError';
        Object.setPrototypeOf(this, AIProviderError.prototype);
    }
}