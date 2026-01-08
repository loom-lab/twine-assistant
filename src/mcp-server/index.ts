/**
 * embedded MCP server exposing twine functions
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
	CallToolRequestSchema,
	ListToolsRequestSchema
} from '@modelcontextprotocol/sdk/types.js';

import type { TwineMCPContext } from './types';
import {
	getStoryOverview,
	getCurrentPassage,
	getAllPassages,
	getPassageByName
} from './tools/story-tools';
import {
	createNewPassage,
	updatePassageContent,
	deletePassageById,
	appendToCurrentPassage
} from './tools/passage-tools';

/**
 * create server from mcp context
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

	// list available tools
	server.setRequestHandler(ListToolsRequestSchema, async () => {
		return {
			tools: [
				// story read
				{
					name: 'get_story_overview',
					description:
						'Get overview of current story ( name, passage count, stats, broken links )',
					inputSchema: {
						type: 'object',
						properties: {},
						required: []
					}
				},
				{
					name: 'get_current_passage',
					description:
						'Get currently edited passage',
					inputSchema: {
						type: 'object',
						properties: {},
						required: []
					}
				},
				{
					name: 'get_all_passages',
					description:
						'Get all passages in story',
					inputSchema: {
						type: 'object',
						properties: {},
						required: []
					}
				},
				{
					name: 'get_passage_by_name',
					description:
						'Get passage by name',
					inputSchema: {
						type: 'object',
						properties: {
							passageName: {
								type: 'string',
								description: 'The name of the passage to retrieve'
							}
						},
						required: ['passageName']
					}
				},

				// passage write
				{
					name: 'create_passage',
					description:
						'Create new passage with given name and content',
					inputSchema: {
						type: 'object',
						properties: {
							name: {
								type: 'string',
								description: 'Name of the new passage'
							},
							text: {
								type: 'string',
								description: 'Content of the passage'
							},
							tags: {
								type: 'array',
								items: { type: 'string' },
								description: 'Optional tags for the passage'
							},
							position: {
								type: 'object',
								properties: {
									left: { type: 'number' },
									top: { type: 'number' }
								},
								description: 'Position on story map (optional)'
							}
						},
						required: ['name', 'text']
					}
				},
				{
					name: 'update_passage',
					description:
						'Update passage content, name, tags',
					inputSchema: {
						type: 'object',
						properties: {
							passageId: {
								type: 'string',
								description: 'passage ID'
							},
							passageName: {
								type: 'string',
								description:
									'passage name'
							},
							text: {
								type: 'string',
								description: 'Updated content'
							},
							name: {
								type: 'string',
								description: 'Updated name'
							},
							tags: {
								type: 'array',
								items: { type: 'string' },
								description: 'Updated tags'
							}
						}
					}
				},
				{
					name: 'append_to_current_passage',
					description:
						'Append to the end of current passage',
					inputSchema: {
						type: 'object',
						properties: {
							text: {
								type: 'string',
								description: 'Text to append to the current passage'
							}
						},
						required: ['text']
					}
				},
				{
					name: 'delete_passage',
					description:
						'Delete passage',
					inputSchema: {
						type: 'object',
						properties: {
							passageId: {
								type: 'string',
								description: 'passage ID'
							},
							passageName: {
								type: 'string',
								description:
									'passage name'
							}
						}
					}
				}
			]
		};
	});

	// tool call handler
	server.setRequestHandler(CallToolRequestSchema, async request => {
		try {
			const { name, arguments: args } = request.params;

			let result;

			switch (name) {
				// story read
				case 'get_story_overview':
					result = await getStoryOverview(context);
					break;

				case 'get_current_passage':
					result = await getCurrentPassage(context);
					break;

				case 'get_all_passages':
					result = await getAllPassages(context);
					break;

				case 'get_passage_by_name':
					result = await getPassageByName(
						context,
						(args as any).passageName
					);
					break;

				// passage write
				case 'create_passage':
					result = await createNewPassage(context, args as any);
					break;

				case 'update_passage':
					result = await updatePassageContent(context, args as any);
					break;

				case 'append_to_current_passage':
					result = await appendToCurrentPassage(context, args as any);
					break;

				case 'delete_passage':
					result = await deletePassageById(context, args as any);
					break;

				default:
					return {
						content: [
							{
								type: 'text',
								text: `Unknown tool: ${name}`
							}
						],
						isError: true
					};
			}

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
