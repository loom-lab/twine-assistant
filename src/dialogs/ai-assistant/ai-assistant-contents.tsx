import * as React from 'react';
import {IconArrowBackUp, IconRefresh, IconReplace, IconTextPlus, IconWand} from '@tabler/icons';
import {IconButton} from '../../components/control/icon-button';
import {useAssistantControls} from './controls';
import './ai-assistant-contents.css';

export interface AiAssistantContentsProps {
	storyId: string;
}

export const AiAssistantContents: React.FC<AiAssistantContentsProps> = props => {
	const {storyId} = props;
	const {
		handleRephrase,
		handleReplace,
		handleContinue,
		handleDraft,
		handleUndo,
		canUndo,
		error,
		hasSelection,
		hasPassage,
		isPassageBlank,
		aiPending
	} = useAssistantControls(storyId);

	return (
		<div className="ai-assistant-contents">
			<div className="ai-assistant-controls">
				{error && <div className="ai-assistant-error">{error}</div>}
				{canUndo && (
					<div className="ai-assistant-section">
						<div className="ai-assistant-buttons">
							<IconButton
								icon={<IconArrowBackUp />}
								label={aiPending ? 'Working...' : 'Undo'}
								onClick={handleUndo}
								variant="secondary"
								disabled={aiPending}
							/>
						</div>
					</div>
				)}
				{isPassageBlank && (
					<div className="ai-assistant-section">
						<h3 className="ai-assistant-section-title">Blank Passage</h3>
						<div className="ai-assistant-buttons">
							<IconButton
								icon={<IconWand />}
								label={aiPending ? 'Working...' : 'Draft'}
								onClick={handleDraft}
								variant="primary"
								disabled={aiPending}
							/>
						</div>
					</div>
				)}
				<div className="ai-assistant-section">
					<h3 className="ai-assistant-section-title">Selection Actions</h3>
					<div className="ai-assistant-buttons">
						{hasSelection ? (
							<>
								<IconButton
									icon={<IconRefresh />}
									label={aiPending ? 'Working...' : 'Rephrase'}
									onClick={handleRephrase}
									variant="primary"
									disabled={aiPending}
								/>
								<IconButton
									icon={<IconReplace />}
									label={aiPending ? 'Working...' : 'Replace'}
									onClick={handleReplace}
									variant="primary"
									disabled={aiPending}
								/>
							</>
						) : (
							<p className="ai-assistant-hint">
								Select text in the passage editor to see available actions.
							</p>
						)}
					</div>
				</div>
				<div className="ai-assistant-section">
					<h3 className="ai-assistant-section-title">Passage Actions</h3>
					<div className="ai-assistant-buttons">
						{hasPassage ? (
							<IconButton
								icon={<IconTextPlus />}
								label={aiPending ? 'Working...' : 'Continue'}
								onClick={handleContinue}
								variant="primary"
								disabled={aiPending}
							/>
						) : (
							<p className="ai-assistant-hint">
								Open a passage to see available actions.
							</p>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};
