/**
 * passage-write tool implementations
 */

import type { TwineMCPContext, ToolResult } from '../types';
import { storyWithId, passageWithId, passageWithName } from '../../store/stories/getters';
import { updatePassage, deletePassage } from '../../store/stories/action-creators';

/**
 * create new passage
 */
export async function createNewPassage(
	context: TwineMCPContext,
	params: {
		name: string;
		text: string;
		tags?: string[];
		position?: { left: number; top: number };
	}
): Promise<ToolResult> {
	const stories = context.getStories();
	const story = storyWithId(stories, context.currentStoryId);

	if (!story) {
		return {
			success: false,
			message: `Story not found: ${context.currentStoryId}`
		};
	}

	// check if name is taken
	const existingPassage = story.passages.find(p => p.name === params.name);
	if (existingPassage) {
		return {
			success: false,
			message: `Passage "${params.name}" already exists`
		};
	}

	try {
		context.dispatch({
			type: 'createPassage',
			storyId: context.currentStoryId,
			props: {
				name: params.name,
				text: params.text,
				tags: params.tags || [],
				left: params.position?.left || 100,
				top: params.position?.top || 100
			}
		});

		return {
			success: true,
			message: `Created passage: ${params.name}`,
			data: {
				name: params.name,
				text: params.text
			}
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to create passage: ${error}`
		};
	}
}

/**
 * Update passage content
 */
export async function updatePassageContent(
	context: TwineMCPContext,
	params: {
		passageId?: string;
		passageName?: string;
		text?: string;
		name?: string;
		tags?: string[];
	}
): Promise<ToolResult> {
	const stories = context.getStories();
	const story = storyWithId(stories, context.currentStoryId);

	if (!story) {
		return {
			success: false,
			message: `Story not found: ${context.currentStoryId}`
		};
	}

	let passage;
	try {
		if (params.passageId) {
			passage = passageWithId(stories, context.currentStoryId, params.passageId);
		} else if (params.passageName) {
			passage = passageWithName(stories, context.currentStoryId, params.passageName);
		} else {
			return {
				success: false,
				message: 'Must provide either passageId or passageName'
			};
		}
	} catch (error) {
		return {
			success: false,
			message: `Passage not found: ${error}`
		};
	}

	try {
		const updateProps: any = {};
		if (params.text !== undefined) updateProps.text = params.text;
		if (params.name !== undefined) updateProps.name = params.name;
		if (params.tags !== undefined) updateProps.tags = params.tags;

		const action = updatePassage(story, passage, updateProps);
		context.dispatch(action);

		return {
			success: true,
			message: `Updated passage: ${passage.name}`,
			data: {
				passageId: passage.id,
				passageName: passage.name,
				updated: updateProps
			}
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to update passage: ${error}`
		};
	}
}

/**
 * Delete passage
 */
export async function deletePassageById(
	context: TwineMCPContext,
	params: {
		passageId?: string;
		passageName?: string;
	}
): Promise<ToolResult> {
	const stories = context.getStories();
	const story = storyWithId(stories, context.currentStoryId);

	if (!story) {
		return {
			success: false,
			message: `Story not found: ${context.currentStoryId}`
		};
	}

	let passage;
	try {
		if (params.passageId) {
			passage = passageWithId(stories, context.currentStoryId, params.passageId);
		} else if (params.passageName) {
			passage = passageWithName(stories, context.currentStoryId, params.passageName);
		} else {
			return {
				success: false,
				message: 'Must provide either passageId or passageName'
			};
		}
	} catch (error) {
		return {
			success: false,
			message: `Passage not found: ${error}`
		};
	}

	try {
		const action = deletePassage(story, passage);
		context.dispatch(action);

		return {
			success: true,
			message: `Deleted passage: ${passage.name}`
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to delete passage: ${error}`
		};
	}
}

/**
 * append to current passage
 */
export async function appendToCurrentPassage(
	context: TwineMCPContext,
	params: {
		text: string;
	}
): Promise<ToolResult> {
	if (!context.currentPassageId) {
		return {
			success: false,
			message: 'No passage currently selected'
		};
	}

	const stories = context.getStories();
	const story = storyWithId(stories, context.currentStoryId);

	if (!story) {
		return {
			success: false,
			message: `Story not found: ${context.currentStoryId}`
		};
	}

	const passage = passageWithId(
		stories,
		context.currentStoryId,
		context.currentPassageId
	);

	if (!passage) {
		return {
			success: false,
			message: `Passage not found: ${context.currentPassageId}`
		};
	}

	try {
		const newText = passage.text + params.text;
		const action = updatePassage(story, passage, { text: newText });
		context.dispatch(action);

		return {
			success: true,
			message: `Appended text to passage: ${passage.name}`,
			data: {
				passageId: passage.id,
				passageName: passage.name,
				addedText: params.text
			}
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to append text: ${error}`
		};
	}
}
