/**
 * Shared helpers for AI assistant control handlers.
 */

import {passageWithId} from '../../../store/stories';
import {updatePassageContent} from '../../../util/mcp-server/tools/passage-tools';
import type {TwineMCPContext} from '../../../util/mcp-server/types';
import type {Passage} from '../../../store/stories/stories.types';
import type {ControlContext, ControlResult} from './types';

/**
 * Create an MCP context from a control context.
 */
export function createMCPContext(context: ControlContext): TwineMCPContext {
	return {
		currentStoryId: context.storyId,
		currentPassageId: context.passageId ?? undefined,
		dispatch: context.dispatch,
		getStories: () => context.stories
	};
}

/**
 * Look up the current passage. Returns null if no passageId is set.
 */
export function getPassage(context: ControlContext): Passage | null {
	if (!context.passageId) {
		return null;
	}
	return passageWithId(context.stories, context.storyId, context.passageId);
}

/**
 * Update the current passage's text via MCP and return a ControlResult.
 */
export async function updatePassageText(
	context: ControlContext,
	text: string
): Promise<ControlResult> {
	const mcpContext = createMCPContext(context);
	const result = await updatePassageContent(mcpContext, {
		passageId: context.passageId!,
		text
	});
	if (!result.success) {
		return {success: false, error: result.message};
	}
	return {success: true};
}
