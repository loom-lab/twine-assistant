import * as React from 'react';
import {useStoriesContext} from '../../store/stories';
import * as storyTools from '../../mcp-server/tools/story-tools';
import * as passageTools from '../../mcp-server/tools/passage-tools';
import './ai-assistant-contents.css';

export interface AiAssistantContentsProps {
	storyId: string;
}

export const AiAssistantContents: React.FC<
	AiAssistantContentsProps
> = props => {
	const {storyId} = props;
	const {stories, dispatch} = useStoriesContext();

	// expose to console
	(window as any).mcp = {
		ctx: {currentStoryId: storyId, dispatch, getStories: () => stories},
		...storyTools,
		...passageTools
	};

	return (
		<div className="ai-assistant-contents">
			{/* TODO: ai assistant ui implementation */}
		</div>
	);
};
