/**
 * Assistant runner — the single entry point for all LLM interaction.
 * Provider creation is handled internally; callers only supply
 * an MCP context, messages, and options.
 */

import type {Message, CompletionOptions} from './types';
import type {TwineMCPContext, ToolResult} from '../mcp-server/types';
import type {ToolDefinition} from '../mcp-server/tool-definitions';
import {createProvider} from './config';
import {executeTool} from '../mcp-server/tool-executor';

export interface AssistantRunOptions {
	tools?: ToolDefinition[];
	temperature?: number;
	maxTokens?: number;
	maxIterations?: number;
}

export interface AssistantRunResult {
	content: string;
	success: boolean;
	error?: string;
	toolResults?: ToolResult[];
}

/**
 * Run the assistant with messages and optional tools.
 *
 * When tools are provided the assistant loops: it calls the LLM,
 * executes any returned tool calls via the MCP executor, feeds the
 * results back, and repeats until the LLM responds with plain text
 * or maxIterations is reached.
 *
 * When no tools are provided it behaves as a single-turn completion.
 */
export async function runAssistant(
	context: TwineMCPContext,
	messages: Message[],
	options: AssistantRunOptions = {}
): Promise<AssistantRunResult> {
	const {tools = [], temperature, maxTokens, maxIterations = 10} = options;
	const provider = createProvider();

	const completionOptions: CompletionOptions = {};
	if (temperature !== undefined) completionOptions.temperature = temperature;
	if (maxTokens !== undefined) completionOptions.maxTokens = maxTokens;
	if (tools.length > 0) completionOptions.tools = tools;

	const conversationMessages = [...messages];
	const allToolResults: ToolResult[] = [];

	for (let i = 0; i < maxIterations; i++) {
		const response = await provider.complete(
			conversationMessages,
			completionOptions
		);

		const {completion} = response;

		// No tool calls → done
		if (!completion.toolCalls || completion.toolCalls.length === 0) {
			return {
				content: completion.content,
				success: true,
				toolResults: allToolResults
			};
		}

		// Record the assistant turn (including its tool calls)
		conversationMessages.push({
			role: 'assistant',
			content: completion.content || '',
			toolCalls: completion.toolCalls
		});

		// Execute each tool call through the MCP executor
		for (const toolCall of completion.toolCalls) {
			const result = await executeTool(
				context,
				toolCall.name,
				toolCall.arguments
			);
			allToolResults.push(result);

			// Gemini matches function responses by name
			conversationMessages.push({
				role: 'tool',
				content: JSON.stringify(result),
				toolCallId: toolCall.name
			});
		}
	}

	return {
		content: '',
		success: false,
		error: `Max iterations (${maxIterations}) reached`,
		toolResults: allToolResults
	};
}
