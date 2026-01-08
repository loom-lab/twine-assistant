import * as React from 'react';
import {useScrollbarSize} from 'react-scrollbar-size';
import {CSSTransition, TransitionGroup} from 'react-transition-group';
import {useDialogsContext} from '.';
import {usePrefsContext} from '../../store/prefs';
import {AiAssistant} from '../ai-assistant';
import {PassageEditStack} from '../passage-edit';
import './dialogs.css';

// TODO move this to separate module to avoid circular dep
const DialogTransition: React.FC = props => (
	<CSSTransition classNames="pop" timeout={200} {...props}>
		{props.children}
	</CSSTransition>
);

export const Dialogs: React.FC = () => {
	const {height, width} = useScrollbarSize();
	const {prefs} = usePrefsContext();
	const {dispatch, dialogs} = useDialogsContext();

	// Find paired dialogs (AI assistant and passage edit)
	const aiAssistantIndex = dialogs.findIndex(
		d => d.component === AiAssistant
	);
	const passageEditIndex = dialogs.findIndex(
		d => d.component === PassageEditStack
	);
	const hasPairedDialogs = aiAssistantIndex !== -1 && passageEditIndex !== -1;

	const hasUnmaximized = dialogs.some(dialog => !dialog.maximized);
	const containerStyle: React.CSSProperties = {
		paddingLeft: hasPairedDialogs
			? `calc(100% - (2 * ${prefs.dialogWidth}px + 3 * (var(--grid-size))))`
			: `calc(100% - (${prefs.dialogWidth}px + 2 * (var(--grid-size))))`,
		marginBottom: height,
		marginRight: width
	};
	const maximizedStyle: React.CSSProperties = {
		marginRight: hasUnmaximized
			? `calc(${prefs.dialogWidth}px + var(--grid-size))`
			: 0
	};

	const getManagementProps = (index: number) => ({
		collapsed: dialogs[index].collapsed,
		highlighted: dialogs[index].highlighted,
		maximized: dialogs[index].maximized,
		onChangeCollapsed: (collapsed: boolean) =>
			dispatch({type: 'setDialogCollapsed', collapsed, index}),
		onChangeHighlighted: (highlighted: boolean) =>
			dispatch({type: 'setDialogHighlighted', highlighted, index}),
		onChangeMaximized: (maximized: boolean) =>
			dispatch({type: 'setDialogMaximized', maximized, index}),
		onChangeProps: (props: Record<string, any>) =>
			dispatch({type: 'setDialogProps', index, props}),
		onClose: () => dispatch({type: 'removeDialog', index})
	});

	// Get dialogs that are not part of the paired layout
	const otherDialogs = dialogs.filter(
		(_, index) =>
			!hasPairedDialogs ||
			(index !== aiAssistantIndex && index !== passageEditIndex)
	);

	return (
		<div className="dialogs" style={containerStyle}>
			{hasPairedDialogs && (() => {
				const PassageEditComponent = dialogs[passageEditIndex].component;
				const AiAssistantComponent = dialogs[aiAssistantIndex].component;
				const panelStyle: React.CSSProperties = {
					width: prefs.dialogWidth
				};
				return (
					<div className="paired-dialogs">
						<div className="paired-dialog passage-edit-panel" style={panelStyle}>
							<PassageEditComponent
								{...dialogs[passageEditIndex].props}
								{...getManagementProps(passageEditIndex)}
							/>
						</div>
						<div className="paired-dialog ai-assistant-panel" style={panelStyle}>
							<AiAssistantComponent
								{...dialogs[aiAssistantIndex].props}
								{...getManagementProps(aiAssistantIndex)}
							/>
						</div>
					</div>
				);
			})()}
			<TransitionGroup component={null}>
				{otherDialogs.map((dialog, i) => {
					// Find the original index in the dialogs array
					const originalIndex = dialogs.findIndex(d => d === dialog);
					const managementProps = getManagementProps(originalIndex);

					return (
						<DialogTransition key={originalIndex}>
							{dialog.maximized ? (
								<div className="maximized" style={maximizedStyle}>
									<dialog.component {...dialog.props} {...managementProps} />
								</div>
							) : (
								<dialog.component {...dialog.props} {...managementProps} />
							)}
						</DialogTransition>
					);
				})}
			</TransitionGroup>
		</div>
	);
};
