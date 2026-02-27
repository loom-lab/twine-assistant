import * as React from 'react';

/**
 * Context for editor state, used for determining available controls.
 */

export interface EditorSelection {
	text: string;
	from: {line: number; ch: number};
	to: {line: number; ch: number};
}

export interface CursorPosition {
	line: number;
	ch: number;
}

export interface EditorStateContextProps {
	selection: EditorSelection | null;
	setSelection: (selection: EditorSelection | null) => void;
	cursorPosition: CursorPosition | null;
	setCursorPosition: (position: CursorPosition | null) => void;
	passageId: string | null;
	setPassageId: (passageId: string | null) => void;
	aiPending: boolean;
	setAiPending: (pending: boolean) => void;
}

export const EditorStateContext = React.createContext<EditorStateContextProps>({
	selection: null,
	setSelection: () => {},
	cursorPosition: null,
	setCursorPosition: () => {},
	passageId: null,
	setPassageId: () => {},
	aiPending: false,
	setAiPending: () => {}
});

EditorStateContext.displayName = 'EditorState';

export const useEditorStateContext = () => React.useContext(EditorStateContext);

export const EditorStateContextProvider: React.FC<{children: React.ReactNode}> = props => {
	const [selection, setSelection] = React.useState<EditorSelection | null>(null);
	const [cursorPosition, setCursorPosition] = React.useState<CursorPosition | null>(null);
	const [passageId, setPassageId] = React.useState<string | null>(null);
	const [aiPending, setAiPending] = React.useState(false);

	return (
		<EditorStateContext.Provider value={{
			selection,
			setSelection,
			cursorPosition,
			setCursorPosition,
			passageId,
			setPassageId,
			aiPending,
			setAiPending
		}}>
			{props.children}
		</EditorStateContext.Provider>
	);
};
