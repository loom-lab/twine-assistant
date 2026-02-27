/**
 * Embedded MCP server exposing Twine functions.
 * Tool schemas come from tool-definitions.ts; execution routes through tool-executor.ts.
 */

import {Server} from '@modelcontextprotocol/sdk/server/index.js';
import {
	CallToolRequestSchema,
	ListToolsRequestSchema
} from '@modelcontextprotocol/sdk/types.js';

import type {TwineMCPContext} from './types';
import {allTools} from './tool-definitions';
import {executeTool} from './tool-executor';

/**
 * Create an MCP server backed by the given Twine context.
 */
export function createTwineMCPServer(context: TwineMCPContext) {
	const server = new Server(
		{
			name: 'twine-assistant',
			version: '1.0.0'
		},
		{
			capabilities: {
				tools: {}
			}
		}
	);

	// Derive tool listings from the shared definitions
	server.setRequestHandler(ListToolsRequestSchema, async () => ({
		tools: allTools.map(tool => ({
			name: tool.name,
			description: tool.description,
			inputSchema: tool.parameters
		}))
	}));

	// Route all tool calls through the shared executor
	server.setRequestHandler(CallToolRequestSchema, async request => {
		try {
			const {name, arguments: args} = request.params;
			const result = await executeTool(
				context,
				name,
				(args ?? {}) as Record<string, unknown>
			);

			return {
				content: [
					{
						type: 'text',
						text: result.success
							? JSON.stringify(result.data, null, 2)
							: result.message
					}
				],
				isError: !result.success
			};
		} catch (error) {
			return {
				content: [
					{
						type: 'text',
						text: `Error: ${error}`
					}
				],
				isError: true
			};
		}
	});

	return server;
}
