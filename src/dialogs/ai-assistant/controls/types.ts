/**
 * Types for AI assistant controls.
 */

import type {Story} from '../../../store/stories/stories.types';
import type {EditorSelection, CursorPosition} from '../editor-state-context';

export interface ControlContext {
	storyId: string;
	passageId: string | null;
	selection: EditorSelection | null;
	cursorPosition: CursorPosition | null;
	stories: Story[];
	dispatch: (action: any) => void;
}

export interface ControlResult {
	success: boolean;
	error?: string;
}
