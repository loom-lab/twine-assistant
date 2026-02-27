/**
 * types for AI abstraction layer
 */

import type {ToolDefinition} from '../mcp-server/tool-definitions';

// messages
export type MessageRole = 'user' | 'assistant' | 'system' | 'tool';
export interface Message {
    role: MessageRole;
    content: string;
    toolCallId?: string; // for tool response messages
    toolCalls?: ToolCall[]; // for assistant messages that invoked tools
}

// tool calls
export interface ToolCall {
    id: string;
    name: string;
    arguments: Record<string, unknown>;
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
    tools?: ToolDefinition[]; // available tools for function calling
}

export type FinishReason = 'stop' | 'length' | 'content_filter' | 'tool_calls' | 'error' | 'unknown';

// non-streaming response
export interface Completion {
    content: string;
    toolCalls?: ToolCall[];
    finishReason: FinishReason;
}
export interface CompletionResponse {
    completion: Completion;
    model: string;
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