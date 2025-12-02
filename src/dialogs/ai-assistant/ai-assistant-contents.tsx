import * as React from 'react';
import './ai-assistant-contents.css';

export interface AiAssistantContentsProps {
	storyId: string;
}

export const AiAssistantContents: React.FC<
	AiAssistantContentsProps
> = props => {
	const {storyId} = props;

	return (
		<div className="ai-assistant-contents">
			{/* TODO: ai assistant ui implementation */}
		</div>
	);
};
