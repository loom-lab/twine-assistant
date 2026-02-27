/**
 * Continue from cursor position
 */

import {runAssistant} from '../../../util/ai/assistant';
import {PROMPTS} from '../../../util/ai/prompts';
import {cursorToOffset, insertAtPosition} from '../../../util/text-offsets';
import type {Message} from '../../../util/ai/types';
import type {ControlContext, ControlResult} from './types';
import {getPassage, createMCPContext, updatePassageText} from './helpers';

export async function executeContinue(context: ControlContext): Promise<ControlResult> {
	const {cursorPosition} = context;

	if (!context.passageId) {
		return {success: false, error: 'No passage active'};
	}

	const passage = getPassage(context);
	if (!passage) {
		return {success: false, error: 'Passage not found'};
	}

	const cursorOffset = cursorToOffset(passage.text, cursorPosition);
	const textWithCursor =
		passage.text.slice(0, cursorOffset) +
		'[CURSOR]' +
		passage.text.slice(cursorOffset);

	const mcpContext = createMCPContext(context);
	const messages: Message[] = [
		{role: 'system', content: PROMPTS.CONTINUE},
		{
			role: 'user',
			content: `Here is the passage with cursor position marked:\n\n${textWithCursor}\n\nGenerate text to insert at the [CURSOR] position.`
		}
	];

	const result = await runAssistant(mcpContext, messages, {temperature: 0.8});
	if (!result.success) {
		return {success: false, error: result.error};
	}

	const continuationText = result.content.trim();
	if (!continuationText) {
		return {success: false, error: 'No continuation text returned'};
	}

	// Insert at cursor position, or append if no cursor
	let newText: string;
	if (cursorPosition) {
		newText = insertAtPosition(passage.text, cursorPosition, continuationText);
	} else {
		newText = passage.text + continuationText;
	}

	return updatePassageText(context, newText);
}
