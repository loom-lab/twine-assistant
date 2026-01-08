import * as React from 'react';
import {IconRefresh} from '@tabler/icons';
import {useStoriesContext} from '../../store/stories';
import {IconButton} from '../../components/control/icon-button';
import * as storyTools from '../../mcp-server/tools/story-tools';
import * as passageTools from '../../mcp-server/tools/passage-tools';
import {useEditorStateContext} from './editor-state-context';
import './ai-assistant-contents.css';

export interface AiAssistantContentsProps {
	storyId: string;
}

export const AiAssistantContents: React.FC<
	AiAssistantContentsProps
> = props => {
	const {storyId} = props;
	const {stories, dispatch} = useStoriesContext();
	const {selection} = useEditorStateContext();

	const hasSelection = selection !== null && selection.text.length > 0;

	// expose to console
	(window as any).mcp = {
		ctx: {currentStoryId: storyId, dispatch, getStories: () => stories},
		...storyTools,
		...passageTools
	};

	const handleRephrase = () => {
		// TODO: implement rephrase functionality
		// this should call AI provider
		console.log('Rephrase selected text:', selection?.text);
	};

	return (
		<div className="ai-assistant-contents">
			<div className="ai-assistant-controls">
				<div className="ai-assistant-section">
					<h3 className="ai-assistant-section-title">Selection Actions</h3>
					<div className="ai-assistant-buttons">
						{hasSelection ? (
							<IconButton
								icon={<IconRefresh />}
								label="Rephrase"
								onClick={handleRephrase}
								variant="primary"
							/>
						) : (
							<p className="ai-assistant-hint">
								Select text in the passage editor to see available actions.
							</p>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};
