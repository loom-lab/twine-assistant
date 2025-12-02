import classNames from 'classnames';
import * as React from 'react';
import {DialogCard} from '../../components/container/dialog-card';
import {useDialogsContext} from '../context';
import {DialogComponentProps} from '../dialogs.types';
import {AiAssistantContents} from './ai-assistant-contents';
import './ai-assistant.css';

export interface AiAssistantProps extends DialogComponentProps {
	storyId: string;
}

export const AiAssistant: React.FC<AiAssistantProps> = props => {
	const {onClose, storyId, ...managementProps} = props;
	const {dispatch} = useDialogsContext();

	return (
		<div
			className={classNames('ai-assistant', {
				collapsed: managementProps.collapsed
			})}
		>
			<DialogCard
				{...managementProps}
				headerDisplayLabel="AI Assistant"
				headerLabel="AI Assistant"
				maximizable
				onClose={onClose}
			>
				<AiAssistantContents storyId={storyId} />
			</DialogCard>
		</div>
	);
};
