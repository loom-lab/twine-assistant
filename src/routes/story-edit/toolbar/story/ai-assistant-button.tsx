import {IconRobot} from '@tabler/icons';
import * as React from 'react';
import {IconButton} from '../../../../components/control/icon-button';
import {openAiAssistant, useDialogsContext} from '../../../../dialogs';
import {Story} from '../../../../store/stories';

export interface AiAssistantButtonProps {
	story: Story;
}

export const AiAssistantButton: React.FC<AiAssistantButtonProps> = props => {
	const {story} = props;
	const {dispatch} = useDialogsContext();

	function handleClick() {
		dispatch(openAiAssistant(story.id));
	}

	return (
		<IconButton
			icon={<IconRobot />}
			label="AI Assistant"
			onClick={handleClick}
		/>
	);
};
