/**
 * MCP server types
 */

import type { Story, Passage } from '../store/stories/stories.types';

/**
 * exposing current editing context
 */
export interface TwineMCPContext {
	currentStoryId: string;
	currentPassageId?: string;

	/** triggers twine state actions */
	dispatch: (action: any) => void;

	/** get current stories state */
	getStories: () => Story[];
}

/**
 * interface for return from tool calls
 */
export interface ToolResult {
	success: boolean;
	message: string;
	data?: any;
}
