import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {DialogEditor} from '../../components/container/dialog-card';
import {CodeArea} from '../../components/control/code-area';
import {usePrefsContext} from '../../store/prefs';
import {Passage, Story} from '../../store/stories';
import {StoryFormat} from '../../store/story-formats';
import {useCodeMirrorPassageHints} from '../../store/use-codemirror-passage-hints';
import {useFormatCodeMirrorMode} from '../../store/use-format-codemirror-mode';
import {codeMirrorOptionsFromPrefs} from '../../util/codemirror-options';
import {useEditorStateContext} from '../ai-assistant/editor-state-context';

export interface PassageTextProps {
	disabled?: boolean;
	onChange: (value: string) => void;
	onEditorChange: (value: CodeMirror.Editor) => void;
	passage: Passage;
	story: Story;
	storyFormat: StoryFormat;
	storyFormatExtensionsDisabled?: boolean;
}

export const PassageText: React.FC<PassageTextProps> = props => {
	const {
		disabled,
		onChange,
		onEditorChange,
		passage,
		story,
		storyFormat,
		storyFormatExtensionsDisabled
	} = props;
	const [localText, setLocalText] = React.useState(passage.text);
	const {prefs} = usePrefsContext();
	const autocompletePassageNames = useCodeMirrorPassageHints(story);
	const mode =
		useFormatCodeMirrorMode(storyFormat.name, storyFormat.version) ?? 'text';
	const codeAreaContainerRef = React.useRef<HTMLDivElement>(null);
	const {t} = useTranslation();
	const {setSelection, setCursorPosition, setPassageId, aiPending} = useEditorStateContext();
	const [cmEditor, setCmEditor] = React.useState<CodeMirror.Editor | null>(null);

	// Combine disabled prop with aiPending state
	const isDisabled = disabled || aiPending;

	// track selection and cursor position from codemirror (only for active/non-disabled editor)
	React.useEffect(() => {
		if (!cmEditor || disabled) return;

		const handleCursorActivity = () => {
			// Always track cursor position
			const cursor = cmEditor.getCursor();
			setCursorPosition({line: cursor.line, ch: cursor.ch});

			// Track selection if there is one
			const selection = cmEditor.getSelection();
			if (selection) {
				const from = cmEditor.getCursor('from');
				const to = cmEditor.getCursor('to');
				setSelection({
					text: selection,
					from: {line: from.line, ch: from.ch},
					to: {line: to.line, ch: to.ch}
				});
			} else {
				setSelection(null);
			}
		};

		cmEditor.on('cursorActivity', handleCursorActivity);
		return () => {
			cmEditor.off('cursorActivity', handleCursorActivity);
		};
	}, [cmEditor, disabled, setCursorPosition, setSelection]);

	// set passage ID (only for active/non-disabled editor)
	React.useEffect(() => {
		if (disabled) return;
		console.log('Setting passageId:', passage.id);
		setPassageId(passage.id);
		// Don't clear on unmount - the paired dialogs layout causes remounting
		// and we want to preserve the passageId during that transition
	}, [disabled, passage.id, setPassageId]);

	// These are refs so that changing them doesn't trigger a rerender, and more
	// importantly, no React effects fire.

	const onChangeText = React.useRef<string>();
	const onChangeTimeout = React.useRef<number>();

	// Effects to handle debouncing updates upward. The idea here is that the
	// component maintains a local state so that the CodeMirror instance always is
	// up-to-date with what the user has typed, but the global context may not be.
	// This is because updating global context causes re-rendering in the story
	// map, which can be time-intensive.

	React.useEffect(() => {
		// A change to passage text has occurred externally, e.g. through a find and
		// replace. We ignore this if a change is pending so that users don't see
		// things they've typed in disappear or be replaced.

		if (!onChangeTimeout.current && localText !== passage.text) {
			setLocalText(passage.text);
		}
	}, [localText, passage.text]);

	const handleLocalChangeText = React.useCallback(
		(text: string) => {
			// Set local state because the CodeMirror instance is controlled, and
			// updates there should be immediate.

			setLocalText(text);

			// If there was a pending update, cancel it.

			if (onChangeTimeout.current) {
				window.clearTimeout(onChangeTimeout.current);
			}

			// Save the text value in case we need to reset the timeout in the next
			// effect.

			onChangeText.current = text;

			// Queue a call to onChange.

			onChangeTimeout.current = window.setTimeout(() => {
				// Important to reset this ref so that we don't try to cancel fired
				// timeouts above.

				onChangeTimeout.current = undefined;

				// Finally call the onChange prop.

				onChange(onChangeText.current!);
			}, 1000);
		},
		[onChange, onEditorChange]
	);

	// If the onChange prop changes while an onChange call is pending, reset the
	// timeout and point it to the correct callback.

	React.useEffect(() => {
		if (onChangeTimeout.current) {
			window.clearTimeout(onChangeTimeout.current);
			onChangeTimeout.current = window.setTimeout(() => {
				// This body must be the same as in the timeout in the previous effect.

				onChangeTimeout.current = undefined;
				onChange(onChangeText.current!);
			}, 1000);
		}
	}, [onChange]);

	const handleMount = React.useCallback(
		(editor: CodeMirror.Editor) => {
			setCmEditor(editor);
			onEditorChange(editor);

			// The potential combination of loading a mode and the dialog entrance
			// animation seems to mess up CodeMirror's cursor rendering. The delay below
			// is intended to run after the animation completes.

			window.setTimeout(() => {
				editor.focus();
				editor.refresh();
			}, 400);
		},
		[onEditorChange]
	);

	// Emulate the above behavior re: focus if we aren't using CodeMirror.

	React.useEffect(() => {
		if (!prefs.useCodeMirror && codeAreaContainerRef.current) {
			const area = codeAreaContainerRef.current.querySelector('textarea');

			if (!area) {
				return;
			}

			area.focus();
			area.setSelectionRange(area.value.length, area.value.length);
		}
	}, []);

	const options = React.useMemo(
		() => ({
			...codeMirrorOptionsFromPrefs(prefs),
			mode: storyFormatExtensionsDisabled ? 'text' : mode,
			lineWrapping: true,
			placeholder: t('dialogs.passageEdit.passageTextPlaceholder'),
			prefixTrigger: {
				callback: autocompletePassageNames,
				prefixes: ['[[', '->']
			},
			// This value prevents the area from being focused.
			readOnly: isDisabled ? 'nocursor' : false
		}),
		[
			autocompletePassageNames,
			isDisabled,
			mode,
			prefs,
			storyFormatExtensionsDisabled,
			t
		]
	);

	return (
		<DialogEditor ref={codeAreaContainerRef}>
			<CodeArea
				editorDidMount={handleMount}
				fontFamily={prefs.passageEditorFontFamily}
				fontScale={prefs.passageEditorFontScale}
				id={`passage-dialog-passage-text-code-area-${passage.id}`}
				label={t('dialogs.passageEdit.passageTextEditorLabel')}
				labelHidden
				onChangeEditor={onEditorChange}
				onChangeText={handleLocalChangeText}
				options={options}
				useCodeMirror={prefs.useCodeMirror}
				value={localText}
			/>
		</DialogEditor>
	);
};