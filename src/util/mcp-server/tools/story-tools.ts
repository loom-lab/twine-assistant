/**
 * story read tool implementations
 */

import type { TwineMCPContext, ToolResult } from '../types';
import { storyWithId, passageWithId, storyStats } from '../../../store/stories/getters';

/**
 * Get overview of current story
 */
export async function getStoryOverview(
	context: TwineMCPContext
): Promise<ToolResult> {
	const stories = context.getStories();
	const story = storyWithId(stories, context.currentStoryId);

	if (!story) {
		return {
			success: false,
			message: `Story not found: ${context.currentStoryId}`
		};
	}

	const stats = storyStats(story);

	return {
		success: true,
		message: 'Retrieved story overview',
		data: {
			name: story.name,
			passageCount: story.passages.length,
			startPassage: story.startPassage,
			stats: {
				totalWords: stats.words,
				totalCharacters: stats.characters,
				totalPassages: stats.passages,
				brokenLinks: stats.brokenLinks
			},
			tags: story.tags,
			storyFormat: story.storyFormat
		}
	};
}

/**
 * Get current passage being edited
 */
export async function getCurrentPassage(
	context: TwineMCPContext
): Promise<ToolResult> {
	if (!context.currentPassageId) {
		return {
			success: false,
			message: 'No passage selected'
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

	return {
		success: true,
		message: 'Retrieved current passage',
		data: {
			id: passage.id,
			name: passage.name,
			text: passage.text,
			tags: passage.tags
		}
	};
}

/**
 * Get all passages in story
 */
export async function getAllPassages(
	context: TwineMCPContext
): Promise<ToolResult> {
	const stories = context.getStories();
	const story = storyWithId(stories, context.currentStoryId);

	if (!story) {
		return {
			success: false,
			message: `Story not found: ${context.currentStoryId}`
		};
	}

	return {
		success: true,
		message: `Retrieved ${story.passages.length} passages`,
		data: {
			passages: story.passages.map(p => ({
				id: p.id,
				name: p.name,
				text: p.text,
				tags: p.tags,
				isStartPassage: p.id === story.startPassage
			}))
		}
	};
}

/**
 * Get passage by name
 */
export async function getPassageByName(
	context: TwineMCPContext,
	passageName: string
): Promise<ToolResult> {
	const stories = context.getStories();
	const story = storyWithId(stories, context.currentStoryId);

	if (!story) {
		return {
			success: false,
			message: `Story not found: ${context.currentStoryId}`
		};
	}

	const passage = story.passages.find(p => p.name === passageName);

	if (!passage) {
		return {
			success: false,
			message: `Passage not found: ${passageName}`
		};
	}

	return {
		success: true,
		message: `Retrieved passage: ${passageName}`,
		data: {
			id: passage.id,
			name: passage.name,
			text: passage.text,
			tags: passage.tags,
			isStartPassage: passage.id === story.startPassage
		}
	};
}

/**
 * Find passages that link to a given passage (incoming links / preceding passages)
 */
export async function getIncomingLinks(
	context: TwineMCPContext,
	targetPassageName: string
): Promise<ToolResult> {
	const stories = context.getStories();
	const story = storyWithId(stories, context.currentStoryId);

	if (!story) {
		return {
			success: false,
			message: `Story not found: ${context.currentStoryId}`
		};
	}

	// Regex patterns for Twine links:
	// [[passage name]] - simple link
	// [[display text|passage name]] - link with display text
	// [[display text->passage name]] - alternative syntax
	const linkPatterns = [
		new RegExp(`\\[\\[${escapeRegex(targetPassageName)}\\]\\]`, 'g'),
		new RegExp(`\\[\\[[^\\]|]+\\|${escapeRegex(targetPassageName)}\\]\\]`, 'g'),
		new RegExp(`\\[\\[[^\\]>]+->${escapeRegex(targetPassageName)}\\]\\]`, 'g')
	];

	const incomingPassages = story.passages.filter(p => {
		return linkPatterns.some(pattern => pattern.test(p.text));
	});

	return {
		success: true,
		message: `Found ${incomingPassages.length} passages linking to "${targetPassageName}"`,
		data: {
			passages: incomingPassages.map(p => ({
				id: p.id,
				name: p.name,
				text: p.text,
				tags: p.tags
			}))
		}
	};
}

/**
 * Escape special regex characters in a string
 */
function escapeRegex(str: string): string {
	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
