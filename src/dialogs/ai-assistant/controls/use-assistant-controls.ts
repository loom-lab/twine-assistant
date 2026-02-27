/**
 * React hook that provides AI assistant controls with state management.
 */

import * as React from 'react';
import {passageWithId, storyWithId, useStoriesContext} from '../../../store/stories';
import {deletePassageById} from '../../../util/mcp-server/tools/passage-tools';
import {validateAPIKey} from '../../../util/ai/config';
import {logTelemetry} from '../../../util/telemetry';
import type {TelemetryAction} from '../../../util/telemetry';
import {useEditorStateContext} from '../editor-state-context';
import {executeRephrase} from './rephrase';
import {executeReplace} from './replace';
import {executeContinue} from './continue';
import {executeDraft} from './draft';
import {createMCPContext, updatePassageText} from './helpers';
import type {ControlContext} from './types';

interface UndoSnapshot {
	passageId: string;
	previousText: string;
	passageIdsBefore: string[];
}

export interface AssistantControlsResult {
	// Handlers
	handleRephrase: () => Promise<void>;
	handleReplace: () => Promise<void>;
	handleContinue: () => Promise<void>;
	handleDraft: () => Promise<void>;
	handleUndo: () => Promise<void>;

	// State
	error: string | null;
	clearError: () => void;

	// Derived state
	hasSelection: boolean;
	hasPassage: boolean;
	isPassageBlank: boolean;
	aiPending: boolean;
	canUndo: boolean;
}

export function useAssistantControls(storyId: string): AssistantControlsResult {
	const {stories, dispatch} = useStoriesContext();
	const {selection, cursorPosition, passageId, aiPending, setAiPending} =
		useEditorStateContext();
	const [error, setError] = React.useState<string | null>(null);
	const [undoSnapshot, setUndoSnapshot] = React.useState<UndoSnapshot | null>(null);
	const lastActionRef = React.useRef<TelemetryAction | null>(null);

	const hasSelection = selection !== null && selection.text.length > 0;
	const hasPassage = passageId !== null;

	const isPassageBlank = React.useMemo(() => {
		if (!passageId) return false;
		const passage = passageWithId(stories, storyId, passageId);
		return passage && passage.text.trim() === '';
	}, [stories, storyId, passageId]);

	const getControlContext = React.useCallback(
		(): ControlContext => ({
			storyId,
			passageId,
			selection,
			cursorPosition,
			stories,
			dispatch
		}),
		[storyId, passageId, selection, cursorPosition, stories, dispatch]
	);

	const wrapHandler = React.useCallback(
		(execute: (context: ControlContext) => Promise<{success: boolean; error?: string}>, actionName: TelemetryAction) => {
			return async () => {
				const validation = validateAPIKey();
				if (!validation.valid) {
					setError(validation.error!);
					return;
				}

				// Capture undo snapshot before executing the action
				let snapshot: UndoSnapshot | null = null;
				if (passageId) {
					try {
						const passage = passageWithId(stories, storyId, passageId);
						const story = storyWithId(stories, storyId);
						snapshot = {
							passageId,
							previousText: passage.text,
							passageIdsBefore: story.passages.map(p => p.id)
						};
					} catch {
						// Passage lookup failed; proceed without snapshot
					}
				}

				setAiPending(true);
				setError(null);

				try {
					const result = await execute(getControlContext());
					if (!result.success && result.error) {
						setError(result.error);
						logTelemetry(actionName, 'error');
					} else if (result.success) {
						if (snapshot) {
							setUndoSnapshot(snapshot);
						}
						logTelemetry(actionName, 'success');
						lastActionRef.current = actionName;
					}
				} catch (err) {
					setError(err instanceof Error ? err.message : 'Unknown error');
					logTelemetry(actionName, 'error');
				} finally {
					setAiPending(false);
				}
			};
		},
		[getControlContext, setAiPending, passageId, stories, storyId]
	);

	const handleRephrase = React.useMemo(
		() => wrapHandler(executeRephrase, 'rephrase'),
		[wrapHandler]
	);

	const handleReplace = React.useMemo(
		() => wrapHandler(executeReplace, 'replace'),
		[wrapHandler]
	);

	const handleContinue = React.useMemo(
		() => wrapHandler(executeContinue, 'continue'),
		[wrapHandler]
	);

	const handleDraft = React.useMemo(
		() => wrapHandler(executeDraft, 'draft'),
		[wrapHandler]
	);

	const handleUndo = React.useCallback(async () => {
		if (!undoSnapshot) return;

		setAiPending(true);
		setError(null);

		try {
			const context = getControlContext();
			const mcpContext = createMCPContext(context);

			// Delete any passages created during the action
			const beforeSet = new Set(undoSnapshot.passageIdsBefore);
			const story = storyWithId(stories, storyId);
			const createdPassageIds = story.passages
				.map(p => p.id)
				.filter(id => !beforeSet.has(id));

			for (const id of createdPassageIds) {
				await deletePassageById(mcpContext, {passageId: id});
			}

			// Restore the original passage text
			const result = await updatePassageText(
				{...context, passageId: undoSnapshot.passageId},
				undoSnapshot.previousText
			);
			if (!result.success && result.error) {
				setError(result.error);
				logTelemetry('undo', 'error');
			} else {
				logTelemetry('undo', 'success', lastActionRef.current ?? undefined);
				lastActionRef.current = null;
				setUndoSnapshot(null);
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Undo failed');
			logTelemetry('undo', 'error');
		} finally {
			setAiPending(false);
		}
	}, [undoSnapshot, getControlContext, setAiPending, stories, storyId]);

	const clearError = React.useCallback(() => setError(null), []);

	return {
		handleRephrase,
		handleReplace,
		handleContinue,
		handleDraft,
		handleUndo,
		error,
		clearError,
		hasSelection,
		hasPassage,
		isPassageBlank,
		aiPending,
		canUndo: undoSnapshot !== null
	};
}
