import {
	Message,
	ProviderConfig,
	CompletionOptions,
	CompletionResponse,
	FinishReason,
	ProviderError,
	ToolCall
} from '../types';
import {ToolDefinition} from '../../mcp-server/tool-definitions';
import {Provider} from './base';

// Gemini API types
interface GeminiPart {
	text?: string;
	functionCall?: {
		name: string;
		args: Record<string, unknown>;
	};
	functionResponse?: {
		name: string;
		response: Record<string, unknown>;
	};
}

interface GeminiContent {
	role: 'user' | 'model';
	parts: GeminiPart[];
}

interface GeminiFunctionDeclaration {
	name: string;
	description: string;
	parameters: {
		type: string;
		properties: Record<string, unknown>;
		required: string[];
	};
}

interface GeminiRequest {
	contents: GeminiContent[];
	systemInstruction?: {parts: {text: string}[]};
	tools?: {functionDeclarations: GeminiFunctionDeclaration[]}[];
	generationConfig?: {
		temperature?: number;
		maxOutputTokens?: number;
		topP?: number;
		stopSequences?: string[];
	};
}

interface GeminiCandidate {
	content: {
		parts: GeminiPart[];
		role: string;
	};
	finishReason: string;
}

interface GeminiResponse {
	candidates: GeminiCandidate[];
	modelVersion?: string;
}

export class GeminiProvider extends Provider {
	private baseURL: string;

	constructor(config: ProviderConfig) {
		super(config);
		this.baseURL =
			config.baseURL ??
			'https://generativelanguage.googleapis.com/v1beta/models';
	}

	protected getDefaultModel(): string {
		return 'gemini-2.5-flash';
	}

	async complete(
		messages: Message[],
		options?: CompletionOptions
	): Promise<CompletionResponse> {
		const model = this.getModel();
		const url = `${this.baseURL}/${model}:generateContent?key=${this.config.apiKey}`;

		const request = this.buildRequest(messages, options);

		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(request)
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new ProviderError(
				`Gemini API error: ${errorText}`,
				'gemini',
				response.status
			);
		}

		const data: GeminiResponse = await response.json();
		return this.parseResponse(data, model);
	}

	private buildRequest(
		messages: Message[],
		options?: CompletionOptions
	): GeminiRequest {
		const systemMessages = messages.filter(m => m.role === 'system');
		const conversationMessages = messages.filter(m => m.role !== 'system');

		const request: GeminiRequest = {
			contents: conversationMessages.map(m => this.messageToContent(m))
		};

		// Combine system messages into systemInstruction
		if (systemMessages.length > 0) {
			request.systemInstruction = {
				parts: [{text: systemMessages.map(m => m.content).join('\n\n')}]
			};
		}

		// Add tools
		if (options?.tools && options.tools.length > 0) {
			request.tools = [
				{
					functionDeclarations: options.tools.map(t =>
						this.toolToFunctionDeclaration(t)
					)
				}
			];
		}

		// Generation config
		if (options) {
			request.generationConfig = {};
			if (options.temperature !== undefined) {
				request.generationConfig.temperature = options.temperature;
			}
			if (options.maxTokens !== undefined) {
				request.generationConfig.maxOutputTokens = options.maxTokens;
			}
			if (options.topP !== undefined) {
				request.generationConfig.topP = options.topP;
			}
			if (options.stop !== undefined) {
				request.generationConfig.stopSequences = options.stop;
			}
		}

		return request;
	}

	private messageToContent(message: Message): GeminiContent {
		if (message.role === 'tool') {
			return {
				role: 'user',
				parts: [
					{
						functionResponse: {
							name: message.toolCallId ?? 'unknown',
							response: JSON.parse(message.content)
						}
					}
				]
			};
		}

		// Assistant message that includes tool (function) calls
		if (message.role === 'assistant' && message.toolCalls?.length) {
			const parts: GeminiPart[] = [];
			if (message.content) {
				parts.push({text: message.content});
			}
			for (const tc of message.toolCalls) {
				parts.push({
					functionCall: {
						name: tc.name,
						args: tc.arguments
					}
				});
			}
			return {role: 'model', parts};
		}

		return {
			role: message.role === 'assistant' ? 'model' : 'user',
			parts: [{text: message.content}]
		};
	}

	private toolToFunctionDeclaration(
		tool: ToolDefinition
	): GeminiFunctionDeclaration {
		return {
			name: tool.name,
			description: tool.description,
			parameters: tool.parameters
		};
	}

	private parseResponse(
		data: GeminiResponse,
		model: string
	): CompletionResponse {
		const candidate = data.candidates[0];
		const parts = candidate.content.parts;

		// Extract text content
		const textParts = parts.filter(p => p.text !== undefined);
		const content = textParts.map(p => p.text).join('');

		// Extract tool calls
		const functionCalls = parts.filter(p => p.functionCall !== undefined);
		const toolCalls: ToolCall[] = functionCalls.map((p, index) => ({
			id: `call_${index}`,
			name: p.functionCall!.name,
			arguments: p.functionCall!.args
		}));

		const finishReason = this.mapFinishReason(candidate.finishReason);

		return {
			completion: {
				content,
				toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
				finishReason:
					toolCalls.length > 0 ? 'tool_calls' : finishReason
			},
			model: data.modelVersion ?? model
		};
	}

	private mapFinishReason(reason: string): FinishReason {
		switch (reason) {
			case 'STOP':
				return 'stop';
			case 'MAX_TOKENS':
				return 'length';
			case 'SAFETY':
			case 'RECITATION':
			case 'BLOCKLIST':
				return 'content_filter';
			default:
				return 'unknown';
		}
	}
}
