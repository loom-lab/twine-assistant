import * as React from 'react';

/**
 * Context for editor state, used for determining available controls.
 */

export interface EditorSelection {
	text: string;
	from: {line: number; ch: number};
	to: {line: number; ch: number};
}

export interface EditorStateContextProps {
	selection: EditorSelection | null;
	setSelection: (selection: EditorSelection | null) => void;
	passageId: string | null;
	setPassageId: (passageId: string | null) => void;
}

export const EditorStateContext = React.createContext<EditorStateContextProps>({
	selection: null,
	setSelection: () => {},
	passageId: null,
	setPassageId: () => {}
});

EditorStateContext.displayName = 'EditorState';

export const useEditorStateContext = () => React.useContext(EditorStateContext);

export const EditorStateContextProvider: React.FC<{children: React.ReactNode}> = props => {
	const [selection, setSelection] = React.useState<EditorSelection | null>(null);
	const [passageId, setPassageId] = React.useState<string | null>(null);

	return (
		<EditorStateContext.Provider value={{selection, setSelection, passageId, setPassageId}}>
			{props.children}
		</EditorStateContext.Provider>
	);
};
