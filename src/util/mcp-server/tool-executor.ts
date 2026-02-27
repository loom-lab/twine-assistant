/**
 * Executes tool calls by name using MCP tool implementations.
 */

import type {TwineMCPContext, ToolResult} from './types';
import * as storyTools from './tools/story-tools';
import * as passageTools from './tools/passage-tools';

/**
 * Execute a tool call by name and return the result.
 */
export async function executeTool(
	context: TwineMCPContext,
	name: string,
	args: Record<string, unknown>
): Promise<ToolResult> {
	switch (name) {
		// Story tools
		case 'get_story_overview':
			return storyTools.getStoryOverview(context);

		case 'get_current_passage':
			return storyTools.getCurrentPassage(context);

		case 'get_all_passages':
			return storyTools.getAllPassages(context);

		case 'get_passage_by_name':
			return storyTools.getPassageByName(context, args.passageName as string);

		case 'get_incoming_links':
			return storyTools.getIncomingLinks(context, args.targetPassageName as string);

		// Passage tools
		case 'create_new_passage':
			return passageTools.createNewPassage(context, {
				name: args.name as string,
				text: args.text as string,
				tags: args.tags as string[] | undefined
			});

		case 'update_passage_content':
			return passageTools.updatePassageContent(context, {
				passageId: args.passageId as string | undefined,
				passageName: args.passageName as string | undefined,
				text: args.text as string | undefined,
				name: args.name as string | undefined,
				tags: args.tags as string[] | undefined
			});

		case 'delete_passage':
			return passageTools.deletePassageById(context, {
				passageId: args.passageId as string | undefined,
				passageName: args.passageName as string | undefined
			});

		case 'append_to_current_passage':
			return passageTools.appendToCurrentPassage(context, {
				text: args.text as string
			});

		default:
			return {
				success: false,
				message: `Unknown tool: ${name}`
			};
	}
}
