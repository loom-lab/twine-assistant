/**
 * Tool definitions for LLM function calling.
 * These schemas describe the tools implemented in ./tools/
 */

export interface ToolParameter {
	type: string;
	description: string;
	enum?: string[];
	items?: {type: string};
}

export interface ToolDefinition {
	name: string;
	description: string;
	parameters: {
		type: 'object';
		properties: Record<string, ToolParameter>;
		required: string[];
	};
}

// Story tools
export const getStoryOverview: ToolDefinition = {
	name: 'get_story_overview',
	description: 'Get an overview of the current story including name, passage count, stats, and metadata.',
	parameters: {
		type: 'object',
		properties: {},
		required: []
	}
};

export const getCurrentPassage: ToolDefinition = {
	name: 'get_current_passage',
	description: 'Get the passage currently being edited, including its id, name, text, and tags.',
	parameters: {
		type: 'object',
		properties: {},
		required: []
	}
};

export const getAllPassages: ToolDefinition = {
	name: 'get_all_passages',
	description: 'Get a list of all passages in the current story.',
	parameters: {
		type: 'object',
		properties: {},
		required: []
	}
};

export const getPassageByName: ToolDefinition = {
	name: 'get_passage_by_name',
	description: 'Get a specific passage by its name.',
	parameters: {
		type: 'object',
		properties: {
			passageName: {
				type: 'string',
				description: 'The name of the passage to retrieve'
			}
		},
		required: ['passageName']
	}
};

export const getIncomingLinks: ToolDefinition = {
	name: 'get_incoming_links',
	description: 'Find all passages that link to a given passage (preceding passages in the story flow).',
	parameters: {
		type: 'object',
		properties: {
			targetPassageName: {
				type: 'string',
				description: 'The name of the passage to find links to'
			}
		},
		required: ['targetPassageName']
	}
};

// Passage tools
export const createNewPassage: ToolDefinition = {
	name: 'create_new_passage',
	description: 'Create a new passage in the story.',
	parameters: {
		type: 'object',
		properties: {
			name: {
				type: 'string',
				description: 'The name of the new passage'
			},
			text: {
				type: 'string',
				description: 'The text content of the passage'
			},
			tags: {
				type: 'array',
				description: 'Tags for the passage',
				items: {type: 'string'}
			}
		},
		required: ['name', 'text']
	}
};

export const updatePassageContent: ToolDefinition = {
	name: 'update_passage_content',
	description: 'Update the content of a passage. Can update text, name, or tags.',
	parameters: {
		type: 'object',
		properties: {
			passageId: {
				type: 'string',
				description: 'The ID of the passage to update'
			},
			passageName: {
				type: 'string',
				description: 'The name of the passage to update (alternative to passageId)'
			},
			text: {
				type: 'string',
				description: 'The new text content for the passage'
			},
			name: {
				type: 'string',
				description: 'New name for the passage'
			},
			tags: {
				type: 'array',
				description: 'New tags for the passage',
				items: {type: 'string'}
			}
		},
		required: []
	}
};

export const deletePassageById: ToolDefinition = {
	name: 'delete_passage',
	description: 'Delete a passage from the story.',
	parameters: {
		type: 'object',
		properties: {
			passageId: {
				type: 'string',
				description: 'The ID of the passage to delete'
			},
			passageName: {
				type: 'string',
				description: 'The name of the passage to delete (alternative to passageId)'
			}
		},
		required: []
	}
};

export const appendToCurrentPassage: ToolDefinition = {
	name: 'append_to_current_passage',
	description: 'Append text to the end of the currently selected passage.',
	parameters: {
		type: 'object',
		properties: {
			text: {
				type: 'string',
				description: 'The text to append'
			}
		},
		required: ['text']
	}
};

// All tools
export const allTools: ToolDefinition[] = [
	getStoryOverview,
	getCurrentPassage,
	getAllPassages,
	getPassageByName,
	getIncomingLinks,
	createNewPassage,
	updatePassageContent,
	deletePassageById,
	appendToCurrentPassage
];

/**
 * Get a subset of tools by name
 */
export function getToolsByName(names: string[]): ToolDefinition[] {
	return allTools.filter(t => names.includes(t.name));
}
