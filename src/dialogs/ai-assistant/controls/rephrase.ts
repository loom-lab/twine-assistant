/**
 * Rephrase control - rephrases selected text while preserving meaning.
 */

import {runAssistant} from '../../../util/ai/assistant';
import {PROMPTS} from '../../../util/ai/prompts';
import {spliceText} from '../../../util/text-offsets';
import type {Message} from '../../../util/ai/types';
import type {ControlContext, ControlResult} from './types';
import {getPassage, createMCPContext, updatePassageText} from './helpers';

export async function executeRephrase(context: ControlContext): Promise<ControlResult> {
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
		{role: 'system', content: PROMPTS.REPHRASE},
		{role: 'user', content: selection.text}
	];

	const result = await runAssistant(mcpContext, messages, {temperature: 0.7});
	if (!result.success) {
		return {success: false, error: result.error};
	}

	const rephrasedText = result.content.trim();
	if (!rephrasedText) {
		return {success: false, error: 'No rephrased text returned'};
	}

	const newText = spliceText(passage.text, {
		from: selection.from,
		to: selection.to
	}, rephrasedText);

	return updatePassageText(context, newText);
}
