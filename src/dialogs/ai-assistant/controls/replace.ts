/**
 * Replace control - replaces selected text with different content.
 */

import {runAssistant} from '../../../util/ai/assistant';
import {PROMPTS} from '../../../util/ai/prompts';
import {spliceText} from '../../../util/text-offsets';
import type {Message} from '../../../util/ai/types';
import type {ControlContext, ControlResult} from './types';
import {getPassage, createMCPContext, updatePassageText} from './helpers';

export async function executeReplace(context: ControlContext): Promise<ControlResult> {
	const {selection} = context;

	if (!selection || !context.passageId) {
		return {success: false, error: 'No text selected or no passage active'};
	}

	const passage = getPassage(context);
	if (!passage) {
		return {success: false, error: 'Passage not found'};
	}

	const mcpContext = createMCPContext(context);
	const messages: Message[] = [
		{role: 'system', content: PROMPTS.REPLACE},
		{
			role: 'user',
			content: `Here is the full passage:\n\n${passage.text}\n\n---\n\nThe selected text to replace is:\n\n${selection.text}\n\nGenerate different content to replace this selection.`
		}
	];

	const result = await runAssistant(mcpContext, messages, {temperature: 0.9});
	if (!result.success) {
		return {success: false, error: result.error};
	}

	const replacementText = result.content.trim();
	if (!replacementText) {
		return {success: false, error: 'No replacement text returned'};
	}

	const newText = spliceText(passage.text, {
		from: selection.from,
		to: selection.to
	}, replacementText);

	return updatePassageText(context, newText);
}
